
import React, { useState } from 'react';
import { AppData, OrganizationProfile, StrategicKPI, Stakeholder, StrategicGoal, ValueWheel, ExternalFactor, View } from '../types';
import { Card, TextArea, AIButton, Badge, Input, Select, Button, Modal } from '../components/Shared';
import { analyzeStrategy, generateExternalAnalysis, analyzeExternalStrategicFit } from '../services/geminiService';
import { 
  Target, 
  Globe, 
  Building2, 
  Users, 
  PieChart, 
  Briefcase, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Save, 
  Info, 
  ChevronRight, 
  ExternalLink, 
  Sparkles, 
  TrendingUp, 
  BarChart3,
  Map,
  Lightbulb,
  ArrowRight,
  Settings,
  Zap,
  ShieldAlert
} from 'lucide-react';

interface Props {
  data: AppData;
  onUpdate: (data: Partial<AppData>) => void;
  onNavigate: (view: View) => void;
}

type FocusModule = 'profile' | 'identity' | 'wheels' | 'external';

const Focus: React.FC<Props> = ({ data, onUpdate, onNavigate }) => {
  const activeKPIs = data.strategicKPIs.length > 0 ? data.strategicKPIs : [];
  const [activeModule, setActiveModule] = useState<FocusModule>('profile');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [externalLoading, setExternalLoading] = useState(false);
  const [fitAnalyzing, setFitAnalyzing] = useState(false);
  const [externalFitAnalysis, setExternalFitAnalysis] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  
  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const [isStakeholderModalOpen, setStakeholderModalOpen] = useState(false);
  const [isKpiModalOpen, setKpiModalOpen] = useState(false);
  
  const [currentGoal, setCurrentGoal] = useState<Partial<StrategicGoal>>({});
  const [currentStakeholder, setCurrentStakeholder] = useState<Partial<Stakeholder>>({});
  const [currentKpi, setCurrentKpi] = useState<Partial<StrategicKPI>>({ domain: 'Financieel', unit: 'Score' });

  const handleUpdateProfile = (field: keyof OrganizationProfile, value: any) => {
      onUpdate({ orgProfile: { ...data.orgProfile, [field]: value } });
  }

  const handleUpdateKPI = (id: string, field: keyof StrategicKPI, value: string) => {
      const updatedKPIs = data.strategicKPIs.map(k => k.id === id ? { ...k, [field]: value } : k);
      onUpdate({ strategicKPIs: updatedKPIs });
  }

  const handleAddStakeholder = () => {
      if (currentStakeholder.name) {
          const newStakeholder: Stakeholder = {
              id: Date.now().toString(),
              name: currentStakeholder.name,
              interest: currentStakeholder.interest || 'Medium',
              power: currentStakeholder.power || 'Medium',
              engagement: currentStakeholder.engagement || 'Medium'
          };
          onUpdate({ stakeholders: [...data.stakeholders, newStakeholder] });
          setStakeholderModalOpen(false);
          setCurrentStakeholder({});
      }
  }

  const handleDeleteStakeholder = (id: string) => {
      onUpdate({ stakeholders: data.stakeholders.filter(s => s.id !== id) });
  }

  const handleAddGoal = () => {
      if (currentGoal.description && currentGoal.wheel) {
          const newGoal: StrategicGoal = {
              id: Date.now().toString(),
              wheel: currentGoal.wheel,
              description: currentGoal.description,
              term: currentGoal.term || 'Middellang',
              priority: 3, 
              kpiId: currentGoal.kpiId
          };
          onUpdate({ strategicGoals: [...data.strategicGoals, newGoal] });
          setGoalModalOpen(false);
          setCurrentGoal({});
      }
  }

  const handleDeleteGoal = (id: string) => {
      onUpdate({ strategicGoals: data.strategicGoals.filter(g => g.id !== id) });
  }

  const handleAddKpi = () => {
      if (currentKpi.name) {
          const newKpi: StrategicKPI = {
              id: Date.now().toString(),
              name: currentKpi.name,
              domain: currentKpi.domain || 'Financieel',
              unit: currentKpi.unit || 'Score',
              value2025: '',
              value2024: '',
              value2023: '',
              value2022: '',
              value2021: ''
          };
          onUpdate({ strategicKPIs: [...data.strategicKPIs, newKpi] });
          // Automatically link this new KPI to the current goal being edited
          setCurrentGoal(prev => ({ ...prev, kpiId: newKpi.id }));
          setKpiModalOpen(false);
          setCurrentKpi({ domain: 'Financieel', unit: 'Score' });
      }
  }

  const handleAnalyzeIdentity = async () => {
    setAnalyzing(true);
    const result = await analyzeStrategy(data.mission, data.vision, data.strategy);
    setAiFeedback(result);
    setAnalyzing(false);
  };

  const handleExternalAnalysis = async (detail: 'standard' | 'detailed') => {
      setExternalLoading(true);
      const result = await generateExternalAnalysis(data.orgProfile.name, data.orgProfile.sector, detail); 
      onUpdate({ externalAnalysis: result });
      setExternalLoading(false);
  }

  const handleAnalyzeExternalFit = async () => {
      if (data.externalAnalysis.length === 0) return;
      setFitAnalyzing(true);
      const result = await analyzeExternalStrategicFit(data.externalAnalysis, data.strategicGoals);
      setExternalFitAnalysis(result);
      setFitAnalyzing(false);
  }

  const updateExternalFactor = (id: string, field: keyof ExternalFactor, value: string) => {
      const updated = data.externalAnalysis.map(f => f.id === id ? { ...f, [field]: value } : f);
      onUpdate({ externalAnalysis: updated });
  }

  const modules = [
    { id: 'profile', label: 'Profiel & Data', icon: Building2 },
    { id: 'identity', label: 'Missie & Visie', icon: Target },
    { id: 'wheels', label: 'Waardewielen', icon: PieChart },
    { id: 'external', label: 'Externe Focus', icon: Globe },
  ];

  const renderStepper = () => (
    <div className="flex items-center justify-between mb-12 bg-white p-2 rounded-[2.5rem] shadow-sm border border-gray-100 max-w-5xl mx-auto">
      {modules.map((m, idx) => (
        <button
          key={m.id}
          onClick={() => setActiveModule(m.id as FocusModule)}
          className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-[2rem] transition-all duration-300 ${
            activeModule === m.id 
              ? 'bg-primary text-white shadow-xl shadow-blue-500/30' 
              : 'text-grayMedium hover:bg-grayLight/50 hover:text-grayDark'
          }`}
        >
          <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${activeModule === m.id ? 'bg-white/20' : 'bg-grayLight'}`}>
            <m.icon className={`h-4 w-4 ${activeModule === m.id ? 'text-white' : 'text-grayMedium'}`} />
          </div>
          <span className="text-sm font-black uppercase tracking-widest hidden md:block">
            {idx + 1}. {m.label}
          </span>
        </button>
      ))}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-12 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-primary">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-blackDark">Identiteit</h3>
              <p className="text-sm text-grayMedium font-medium">Basisgegevens van de organisatie.</p>
            </div>
          </div>
          <div className="space-y-6">
            <Input label="Organisatienaam" value={data.orgProfile.name} onChange={e => handleUpdateProfile('name', e.target.value)} placeholder="Bijv. Tech Innovators BV" />
            <div className="grid grid-cols-2 gap-6">
              <Select label="Sector" value={data.orgProfile.sector} onChange={e => handleUpdateProfile('sector', e.target.value)}
                options={["Technologie / SaaS", "Zorg & Welzijn", "Onderwijs", "Overheid", "Bouw & Infra", "Financiële Dienstverlening", "Retail", "Anders"]} />
              <Select label="Type" value={data.orgProfile.type} onChange={e => handleUpdateProfile('type', e.target.value)} options={["Profit", "Non-Profit", "Overheid", "Hybride"]} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Input label="Locatie(s)" value={data.orgProfile.location} onChange={e => handleUpdateProfile('location', e.target.value)} placeholder="Amsterdam, NL" />
              <Input label="Aantal FTE" type="number" value={data.orgProfile.employees} onChange={e => handleUpdateProfile('employees', parseInt(e.target.value))} />
            </div>
          </div>
        </section>

        <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-blackDark">Stakeholders</h3>
              <p className="text-sm text-grayMedium font-medium">Wie zijn de belangrijkste spelers?</p>
            </div>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
            {data.stakeholders.map(s => (
              <div key={s.id} className="flex items-center justify-between p-5 bg-grayLight/30 rounded-3xl border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
                <div>
                  <p className="font-black text-blackDark text-sm">{s.name}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge color="blue" className="text-[9px] uppercase">Power: {s.power}</Badge>
                    <Badge color="purple" className="text-[9px] uppercase">Interest: {s.interest}</Badge>
                  </div>
                </div>
                <button onClick={() => handleDeleteStakeholder(s.id)} className="p-2 text-grayMedium hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button variant="outline" onClick={() => setStakeholderModalOpen(true)} className="w-full rounded-2xl py-4 border-dashed border-2 text-grayMedium hover:text-primary">
              <Plus className="h-4 w-4 mr-2" /> Stakeholder Toevoegen
            </Button>
          </div>
        </section>
      </div>

      <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-blackDark">Historische Resultaten</h3>
              <p className="text-sm text-grayMedium font-medium">Trendanalyse van strategische kerncijfers.</p>
            </div>
          </div>
          {saveStatus && <Badge color="green" className="animate-bounce">Gegevens opgeslagen</Badge>}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="py-4 font-black text-[10px] text-grayMedium uppercase tracking-widest w-1/4">KPI Naam</th>
                <th className="py-4 font-black text-[10px] text-grayMedium uppercase tracking-widest text-center">Unit</th>
                <th className="py-4 font-black text-[10px] text-grayMedium uppercase tracking-widest text-center">2023</th>
                <th className="py-4 font-black text-[10px] text-grayMedium uppercase tracking-widest text-center">2024</th>
                <th className="py-4 font-black text-[10px] text-primary uppercase tracking-widest text-center bg-blue-50/50 rounded-t-xl">2025 (Huidig)</th>
              </tr>
            </thead>
            <tbody>
              {activeKPIs.map(k => (
                <tr key={k.id} className="group hover:bg-grayLight/20">
                  <td className="py-4">
                    <span className="font-bold text-blackDark text-sm">{k.name}</span>
                    <p className="text-[10px] text-grayMedium font-medium uppercase">{k.domain}</p>
                  </td>
                  <td className="py-4 text-center">
                    <Badge color="gray">{k.unit}</Badge>
                  </td>
                  <td className="py-4 px-2">
                    <input value={k.value2023} onChange={e => handleUpdateKPI(k.id, 'value2023', e.target.value)} className="w-full bg-transparent text-center font-bold text-grayDark focus:outline-none" />
                  </td>
                  <td className="py-4 px-2">
                    <input value={k.value2024} onChange={e => handleUpdateKPI(k.id, 'value2024', e.target.value)} className="w-full bg-transparent text-center font-bold text-grayDark focus:outline-none" />
                  </td>
                  <td className="py-4 px-2 bg-blue-50/30 rounded-b-xl">
                    <input value={k.value2025} onChange={e => handleUpdateKPI(k.id, 'value2025', e.target.value)} className="w-full bg-transparent text-center font-black text-primary focus:outline-none" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );

  const renderIdentity = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-fade-in-up">
      <div className="lg:col-span-2 space-y-10">
        <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
           <div className="flex items-center gap-4 mb-4">
             <div className="h-12 w-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
               <Target className="h-6 w-6" />
             </div>
             <div>
               <h3 className="text-2xl font-black text-blackDark">Bestaansrecht & Ambitie</h3>
               <p className="text-sm text-grayMedium font-medium">De basis voor elke strategische keuze.</p>
             </div>
           </div>

           <div className="space-y-6">
             <TextArea 
               label="Missie (Waarom bestaan wij?)" 
               rows={3} 
               value={data.mission} 
               onChange={(e) => onUpdate({ mission: e.target.value })} 
               placeholder="Bijv. Wij maken duurzame impact door..."
               className="rounded-3xl p-6"
             />
             <TextArea 
               label="Visie (Wat is het einddoel?)" 
               rows={3} 
               value={data.vision} 
               onChange={(e) => onUpdate({ vision: e.target.value })} 
               placeholder="Bijv. In 2030 zijn wij marktleider in..."
               className="rounded-3xl p-6"
             />
             <TextArea 
               label="Kernstrategie (Hoe gaan we winnen?)" 
               rows={5} 
               value={data.strategy} 
               onChange={(e) => onUpdate({ strategy: e.target.value })} 
               placeholder="Onze route naar succes omvat..."
               className="rounded-3xl p-6"
             />
           </div>

           <div className="flex justify-end">
             <AIButton onClick={handleAnalyzeIdentity} loading={analyzing} label="Valideer Consistentie" className="rounded-2xl px-10 py-4" />
           </div>
        </section>
      </div>

      <div className="lg:col-span-1 h-full">
        <Card className={`h-full border-none shadow-2xl relative overflow-hidden transition-all duration-500 ${aiFeedback ? 'bg-deepBlue text-white' : 'bg-grayLight/40'}`}>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="h-32 w-32" />
          </div>
          
          <div className="relative z-10 p-4 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${aiFeedback ? 'bg-white/20' : 'bg-white text-primary shadow-sm'}`}>
                <Lightbulb className="h-5 w-5" />
              </div>
              <h4 className="font-black text-lg uppercase tracking-widest">AI Strategisch Inzicht</h4>
            </div>

            {aiFeedback ? (
              <div className="flex-1 space-y-6 overflow-y-auto pr-2 scrollbar-hide">
                <p className="text-lg leading-relaxed font-bold italic text-lightBlue">
                  "{aiFeedback}"
                </p>
                <div className="p-6 bg-white/10 rounded-[2rem] border border-white/10">
                   <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-2">Checklist Resultaat</p>
                   <ul className="space-y-3">
                     <li className="flex items-center gap-2 text-xs font-bold"><CheckCircle2 className="h-4 w-4 text-green-400" /> Doelen zijn specifiek</li>
                     <li className="flex items-center gap-2 text-xs font-bold"><CheckCircle2 className="h-4 w-4 text-green-400" /> Tijdpad is helder</li>
                     <li className="flex items-center gap-2 text-xs font-bold opacity-50"><Info className="h-4 w-4" /> KPI-koppeling kan scherper</li>
                   </ul>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <Target className="h-16 w-16 text-grayMedium mb-6 opacity-30" />
                <p className="font-bold text-grayMedium leading-relaxed italic">
                  Vul je missie, visie en strategie in om de Strategische Co-piloot te activeren.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderWheels = () => {
    const wheels = [
      { id: ValueWheel.FINANCIAL, label: 'Financieel', color: 'bg-blue-500', icon: Briefcase },
      { id: ValueWheel.CUSTOMER, label: 'Klant', color: 'bg-green-500', icon: Users },
      { id: ValueWheel.EMPLOYEE, label: 'Medewerker', color: 'bg-yellow-500', icon: Sparkles },
      { id: ValueWheel.ORGANIZATION, label: 'Organisatie', color: 'bg-purple-500', icon: Settings },
      { id: ValueWheel.SOCIAL, label: 'Maatschappelijk', color: 'bg-pink-500', icon: Globe },
    ];

    return (
      <div className="space-y-12 animate-fade-in-up">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {wheels.map(w => (
            <button
              key={w.id}
              onClick={() => {
                setCurrentGoal({ ...currentGoal, wheel: w.id });
                setGoalModalOpen(true);
              }}
              className="group relative flex flex-col items-center justify-center p-8 bg-white border border-gray-100 rounded-[3rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
              <div className={`h-16 w-16 ${w.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 shadow-lg`}>
                <w.icon className="h-8 w-8" />
              </div>
              <span className="font-black text-sm text-blackDark uppercase tracking-widest">{w.label}</span>
              <div className="absolute top-4 right-4 h-6 w-6 bg-grayLight rounded-full flex items-center justify-center text-[10px] font-black">
                {data.strategicGoals.filter(g => g.wheel === w.id).length}
              </div>
            </button>
          ))}
        </div>

        <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
           <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-grayLight rounded-2xl flex items-center justify-center text-grayDark">
                  <PieChart className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-black text-blackDark uppercase tracking-tight">Gedefinieerde Doelen</h3>
              </div>
              <Badge color="blue" className="px-4 py-2 font-black">{data.strategicGoals.length} TOTAAL</Badge>
           </div>

           {data.strategicGoals.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.strategicGoals.map(goal => (
                   <div key={goal.id} className="p-8 rounded-[2.5rem] bg-grayLight/30 border border-gray-50 flex flex-col justify-between group hover:bg-white hover:shadow-xl transition-all">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                           <Badge color={wheels.find(w => w.id === goal.wheel)?.id === ValueWheel.FINANCIAL ? 'blue' : 'purple'} className="uppercase text-[9px]">
                             {goal.wheel}
                           </Badge>
                           <span className="text-[10px] font-black text-grayMedium uppercase tracking-widest">{goal.term}</span>
                        </div>
                        <p className="text-lg font-bold text-blackDark leading-tight mb-4">{goal.description}</p>
                      </div>
                      <div className="flex items-center justify-between pt-6 border-t border-gray-100/50">
                         {goal.kpiId ? (
                           <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase">
                             <TrendingUp className="h-3 w-3" /> Gekoppeld
                           </div>
                         ) : (
                           <span className="text-[10px] font-bold text-grayMedium italic">Geen KPI</span>
                         )}
                         <button onClick={() => handleDeleteGoal(goal.id)} className="p-2 text-grayMedium hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                           <Trash2 className="h-4 w-4" />
                         </button>
                      </div>
                   </div>
                ))}
             </div>
           ) : (
             <div className="py-20 text-center space-y-4">
                <Target className="h-16 w-16 mx-auto text-grayLight opacity-50" />
                <p className="text-grayMedium font-bold">Nog geen doelen. Klik op een waardewiel om te beginnen.</p>
             </div>
           )}
        </section>
      </div>
    );
  };

  const renderExternal = () => (
    <div className="space-y-10 animate-fade-in-up">
      <div className="bg-deepBlue p-12 rounded-[4rem] text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Globe className="h-64 w-64" />
        </div>
        <div className="relative z-10 max-w-4xl">
          <Badge color="blue" className="bg-white/20 text-white border border-white/20 mb-6 px-4 py-2 uppercase font-black">Markt Intelligence</Badge>
          <h2 className="text-4xl md:text-5xl font-black mb-8 leading-[1.1]">
            Diepgaande Sector & <br />Concurrentie Research.
          </h2>
          <p className="text-lightBlue/80 text-xl font-medium leading-relaxed mb-10 max-w-2xl">
            Onze AI doorzoekt live de markt naar PESTLE-factoren, toekomsttrends en specifieke kansen voor <strong>{data.orgProfile.name}</strong>.
          </p>
          <div className="flex flex-wrap gap-4">
            <AIButton onClick={() => handleExternalAnalysis('detailed')} loading={externalLoading} label="Start AI Research Engine" className="rounded-2xl px-12 py-6 bg-white text-deepBlue border-none shadow-2xl shadow-blue-500/40 text-lg" />
            {data.externalAnalysis.length > 0 && (
              <AIButton 
                onClick={handleAnalyzeExternalFit} 
                loading={fitAnalyzing} 
                label="Analyseer Strategische Fit" 
                className="rounded-2xl px-10 py-6 bg-blue-500/20 text-white border border-white/30 shadow-xl text-lg hover:bg-blue-500/40" 
              />
            )}
          </div>
        </div>
      </div>

      {externalFitAnalysis && (
        <Card className="bg-white border-2 border-primary/20 shadow-2xl p-10 rounded-[3rem] animate-fade-in-up relative overflow-hidden">
           <div className="absolute -top-10 -right-10 opacity-5">
              <Zap className="h-48 w-48 text-primary" />
           </div>
           <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-black text-blackDark tracking-tight">Strategische Fit Analyse</h3>
           </div>
           <div className="prose prose-blue max-w-none">
              <p className="text-grayDark font-bold leading-relaxed whitespace-pre-wrap italic border-l-4 border-primary/20 pl-8">
                {externalFitAnalysis}
              </p>
           </div>
           <div className="mt-8 flex justify-end">
             <Button variant="ghost" size="sm" onClick={() => setExternalFitAnalysis(null)} className="text-grayMedium">Analyse sluiten</Button>
           </div>
        </Card>
      )}

      {externalLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-8 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
           <div className="relative">
              <div className="animate-spin h-20 w-20 border-4 border-primary border-t-transparent rounded-full"></div>
              <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-400 animate-pulse" />
           </div>
           <div className="text-center">
              <p className="text-2xl font-black text-blackDark mb-2">Live Markt-onderzoek bezig...</p>
              <p className="text-grayMedium font-bold italic">We analyseren actuele nieuwsbronnen, rapporten en trends.</p>
           </div>
        </div>
      ) : data.externalAnalysis.length > 0 ? (
        <div className="grid grid-cols-1 gap-8">
           {data.externalAnalysis.map(factor => (
             <Card key={factor.id} className="p-0 overflow-hidden border-none shadow-xl rounded-[3rem] bg-white">
                <div className="flex flex-col lg:flex-row">
                   <div className="lg:w-72 bg-grayLight/40 p-10 border-r border-gray-50 flex flex-col justify-between">
                      <div>
                        <Badge color="blue" className="mb-4 uppercase tracking-widest text-[9px] font-black">{factor.category}</Badge>
                        <h4 className="text-2xl font-black text-blackDark leading-tight">{factor.factor}</h4>
                      </div>
                      <div className="mt-10 space-y-4">
                         <p className="text-[9px] font-black text-grayMedium uppercase tracking-widest">Bronnen</p>
                         <div className="flex flex-col gap-2">
                           {factor.sources?.slice(0, 3).map((s, i) => (
                             <a key={i} href={s.uri} target="_blank" className="flex items-center gap-2 text-[10px] font-bold text-primary hover:underline truncate">
                               <ExternalLink className="h-3 w-3 shrink-0" /> {s.title}
                             </a>
                           ))}
                         </div>
                      </div>
                   </div>
                   <div className="flex-1 p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-8">
                         <div className="space-y-3">
                           <div className="flex items-center gap-2 text-[10px] font-black text-orange-600 uppercase tracking-widest">
                             <TrendingUp className="h-3 w-3" /> Toekomstige Trend
                           </div>
                           <p className="text-sm font-bold text-grayDark leading-relaxed p-6 bg-orange-50/30 border border-orange-100 rounded-[2.5rem]">
                             {factor.futureTrend}
                           </p>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-green-50/30 rounded-[2rem] border border-green-100">
                               <p className="text-[9px] font-black text-green-700 uppercase mb-2">Opportuniteit</p>
                               <p className="text-[11px] font-bold text-green-900 leading-tight">{factor.opportunity}</p>
                            </div>
                            <div className="p-5 bg-red-50/30 rounded-[2rem] border border-red-100">
                               <p className="text-[9px] font-black text-red-700 uppercase mb-2">Bedreiging</p>
                               <p className="text-[11px] font-bold text-red-900 leading-tight">{factor.threat}</p>
                            </div>
                         </div>
                      </div>
                      <div className="flex flex-col justify-end pb-2">
                         <TextArea 
                           label="Strategische Actie" 
                           rows={5} 
                           value={factor.actions || ''} 
                           onChange={e => updateExternalFactor(factor.id, 'actions', e.target.value)}
                           className="rounded-[2.5rem] p-6 text-sm"
                           placeholder="Welke actie ondernemen we op basis van dit inzicht?"
                         />
                      </div>
                   </div>
                </div>
             </Card>
           ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-grayLight/10 rounded-[4rem] border-4 border-dashed border-grayLight group">
           <Globe className="h-20 w-20 mx-auto text-grayMedium opacity-30 mb-6 group-hover:rotate-12 transition-transform duration-700" />
           <p className="text-xl font-bold text-grayMedium mb-6">Start de Research Engine om marktdata op te halen.</p>
           <Button variant="outline" onClick={() => handleExternalAnalysis('detailed')} className="rounded-2xl px-8">Activeer Markt-Research</Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="pb-32 space-y-10">
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16 space-y-4">
        <Badge color="blue" className="px-4 py-2 uppercase font-black">Strategische Fundering</Badge>
        <h1 className="text-5xl md:text-6xl font-black text-blackDark tracking-tight leading-[1.1]">Organisatie Focus.</h1>
        <p className="text-xl text-grayDark font-medium leading-relaxed">
          Definieer de essentie van je organisatie, stel scherpe doelen en valideer je koers met AI-ondersteunde markt-intelligence.
        </p>
      </div>

      {renderStepper()}

      <div className="max-w-7xl mx-auto">
        {activeModule === 'profile' && renderProfile()}
        {activeModule === 'identity' && renderIdentity()}
        {activeModule === 'wheels' && renderWheels()}
        {activeModule === 'external' && renderExternal()}
      </div>

      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[50]">
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-[3rem] px-10 py-5 flex items-center gap-10">
             <div className="flex items-center gap-4">
                <div className="h-3 w-32 bg-grayLight rounded-full overflow-hidden">
                   <div className="h-full bg-primary" style={{ width: '25%' }}></div>
                </div>
                <span className="text-[10px] font-black text-grayMedium uppercase tracking-widest">Fase 1/4 voltooid</span>
             </div>
             <div className="h-10 w-px bg-grayLight"></div>
             <Button size="lg" onClick={() => onNavigate(View.INRICHTING)} className="rounded-[2rem] px-10 group">
                Ga naar Inrichting <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
             </Button>
          </div>
      </div>

      <Modal isOpen={isStakeholderModalOpen} onClose={() => setStakeholderModalOpen(false)} title="Stakeholder Toevoegen">
           <div className="space-y-6 p-2">
               <Input label="Naam / Groep" value={currentStakeholder.name || ''} onChange={e => setCurrentStakeholder({...currentStakeholder, name: e.target.value})} placeholder="Bijv. Raad van Commissarissen" />
               <div className="grid grid-cols-3 gap-4">
                   <Select label="Belang" value={currentStakeholder.interest} onChange={e => setCurrentStakeholder({...currentStakeholder, interest: e.target.value as any})} options={['Low', 'Medium', 'High']} />
                   <Select label="Invloed" value={currentStakeholder.power} onChange={e => setCurrentStakeholder({...currentStakeholder, power: e.target.value as any})} options={['Low', 'Medium', 'High']} />
                   <Select label="Engagement" value={currentStakeholder.engagement} onChange={e => setCurrentStakeholder({...currentStakeholder, engagement: e.target.value as any})} options={['Low', 'Medium', 'High']} />
               </div>
               <div className="flex justify-end pt-4">
                   <Button onClick={handleAddStakeholder} className="rounded-2xl px-10 py-4">Stakeholder Opslaan</Button>
               </div>
           </div>
      </Modal>

      <Modal isOpen={isGoalModalOpen} onClose={() => setGoalModalOpen(false)} title={`Nieuw Doel: ${currentGoal.wheel}`}>
           <div className="space-y-6 p-2">
               <TextArea label="Omschrijf het doel" rows={3} value={currentGoal.description || ''} onChange={e => setCurrentGoal({...currentGoal, description: e.target.value})} placeholder="Wat willen we specifiek bereiken?" className="rounded-2xl" />
               <div className="grid grid-cols-2 gap-6">
                   <Select label="Termijn" value={currentGoal.term} onChange={e => setCurrentGoal({...currentGoal, term: e.target.value as any})} options={['Kort', 'Middellang', 'Lang']} />
                   
                   <div className="space-y-1">
                      <label className="block text-[10px] font-black text-grayMedium uppercase tracking-[0.2em] mb-2 ml-1">Koppel KPI</label>
                      <div className="flex gap-3">
                         <div className="flex-1">
                            <select 
                                className="w-full px-6 py-4 border border-gray-100 bg-grayLight/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary bg-white transition-all text-sm font-bold text-blackDark appearance-none cursor-pointer"
                                value={currentGoal.kpiId || ''}
                                onChange={e => setCurrentGoal({...currentGoal, kpiId: e.target.value})}
                            >
                                <option value="">Geen KPI koppelen</option>
                                {data.strategicKPIs.map(k => (
                                    <option key={k.id} value={k.id}>{k.name} ({k.domain})</option>
                                ))}
                            </select>
                         </div>
                         <Button 
                            variant="outline" 
                            className="w-14 h-14 rounded-2xl p-0 flex items-center justify-center border-gray-100 bg-white hover:bg-gray-50 text-primary shrink-0"
                            onClick={() => setKpiModalOpen(true)}
                         >
                            <Plus className="h-6 w-6" />
                         </Button>
                      </div>
                   </div>
               </div>
               <div className="flex justify-end pt-4">
                   <Button onClick={handleAddGoal} className="rounded-2xl px-10 py-4">Doel Toevoegen</Button>
               </div>
           </div>
      </Modal>

      <Modal isOpen={isKpiModalOpen} onClose={() => setKpiModalOpen(false)} title="Nieuwe KPI">
          <div className="space-y-6 p-2">
             <Input label="KPI Naam" value={currentKpi.name || ''} onChange={e => setCurrentKpi({...currentKpi, name: e.target.value})} placeholder="Bijv. Net Promoter Score" />
             <div className="grid grid-cols-2 gap-6">
                <Select label="Domein" value={currentKpi.domain} onChange={e => setCurrentKpi({...currentKpi, domain: e.target.value})} options={['Financieel', 'Klant', 'Medewerker', 'Organisatie', 'Sociaal']} />
                <Select label="Eenheid" value={currentKpi.unit} onChange={e => setCurrentKpi({...currentKpi, unit: e.target.value})} options={['Score', '€', '%', 'Aantal', 'Dagen']} />
             </div>
             <div className="flex justify-end pt-4">
                <Button onClick={handleAddKpi} className="rounded-2xl px-10 py-4">KPI Opslaan</Button>
             </div>
          </div>
      </Modal>
    </div>
  );
};

export default Focus;
