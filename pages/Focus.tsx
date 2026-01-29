
import React, { useState } from 'react';
import { AppData, OrganizationProfile, PerformanceMetric, Stakeholder, StrategicGoal, ValueWheel, ExternalFactor, View } from '../types';
import { Card, TextArea, AIButton, Badge, Input, Select, Button, Modal } from '../components/Shared';
import { generateExternalAnalysis } from '../services/geminiService';
import { 
  Target, 
  Globe, 
  Building2, 
  Users, 
  Briefcase, 
  Plus, 
  Trash2, 
  Sparkles, 
  BarChart3,
  ArrowRight,
  Settings,
  PlusCircle,
  FileText,
  Search
} from 'lucide-react';

interface Props {
  data: AppData;
  onUpdate: (data: Partial<AppData>) => void;
  onNavigate: (view: View) => void;
}

type FocusModule = 'profile' | 'identity' | 'performance' | 'external';

const Focus: React.FC<Props> = ({ data, onUpdate, onNavigate }) => {
  const [activeModule, setActiveModule] = useState<FocusModule>('profile');
  const [activeWheel, setActiveWheel] = useState<ValueWheel>(ValueWheel.FINANCIAL);
  const [externalLoading, setExternalLoading] = useState(false);
  
  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const [isStakeholderModalOpen, setStakeholderModalOpen] = useState(false);
  const [isMetricModalOpen, setMetricModalOpen] = useState(false);
  
  const [currentGoal, setCurrentGoal] = useState<Partial<StrategicGoal>>({});
  const [currentStakeholder, setCurrentStakeholder] = useState<Partial<Stakeholder>>({});
  const [newMetric, setNewMetric] = useState({ name: '', unit: 'Score' });

  const handleUpdateProfile = (field: keyof OrganizationProfile, value: any) => {
      onUpdate({ orgProfile: { ...data.orgProfile, [field]: value } });
  }

  const updateMetricValue = (metricId: string, year: string, value: string) => {
    const updatedMetrics = data.performanceMetrics.map(m => {
      if (m.id === metricId) {
        return {
          ...m,
          values: m.values.map(v => v.year === year ? { ...v, value } : v)
        };
      }
      return m;
    });
    onUpdate({ performanceMetrics: updatedMetrics });
  };

  const updateWheelContext = (wheel: ValueWheel, context: string) => {
    onUpdate({
      wheelContext: {
        ...data.wheelContext,
        [wheel]: context
      }
    });
  };

  const handleAddMetric = () => {
    if (newMetric.name) {
      const metric: PerformanceMetric = {
        id: `custom_${Date.now()}`,
        wheel: activeWheel,
        name: newMetric.name,
        unit: newMetric.unit,
        isStandard: false,
        values: [
          { year: '2023', value: '' },
          { year: '2024', value: '' },
          { year: '2025', value: '' }
        ]
      };
      onUpdate({ performanceMetrics: [...data.performanceMetrics, metric] });
      setMetricModalOpen(false);
      setNewMetric({ name: '', unit: 'Score' });
    }
  };

  const handleDeleteMetric = (id: string) => {
    onUpdate({ performanceMetrics: data.performanceMetrics.filter(m => m.id !== id) });
  };

  const handleDeleteGoal = (id: string) => {
    onUpdate({ strategicGoals: data.strategicGoals.filter(g => g.id !== id) });
  };

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

  const handleExternalAnalysis = async (detail: 'standard' | 'detailed') => {
      setExternalLoading(true);
      const result = await generateExternalAnalysis(data.orgProfile.name, data.orgProfile.sector, detail); 
      onUpdate({ externalAnalysis: result });
      setExternalLoading(false);
  }

  const modules = [
    { id: 'profile', label: 'Profiel', icon: Building2 },
    { id: 'identity', label: 'Fundering', icon: Target },
    { id: 'performance', label: 'Resultaten', icon: BarChart3 },
    { id: 'external', label: 'Research', icon: Globe },
  ];

  const wheelData = [
    { id: ValueWheel.FINANCIAL, label: 'Financieel', color: 'blue', icon: Briefcase },
    { id: ValueWheel.CUSTOMER, label: 'Klant', color: 'green', icon: Users },
    { id: ValueWheel.EMPLOYEE, label: 'Medewerker', color: 'yellow', icon: Sparkles },
    { id: ValueWheel.ORGANIZATION, label: 'Organisatie', color: 'purple', icon: Settings },
    { id: ValueWheel.SOCIAL, label: 'Maatschappelijk', color: 'pink', icon: Globe },
  ];

  const renderPerformance = () => {
    const metricsInWheel = data.performanceMetrics.filter(m => m.wheel === activeWheel);
    const activeWheelInfo = wheelData.find(w => w.id === activeWheel)!;

    return (
      <div className="space-y-10 animate-fade-in-up">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {wheelData.map(w => (
            <button
              key={w.id}
              onClick={() => setActiveWheel(w.id)}
              className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden group ${
                activeWheel === w.id 
                  ? `bg-${w.color}-50 border-${w.color}-500 shadow-xl scale-105 z-10` 
                  : 'bg-white border-gray-100 hover:border-gray-200 opacity-70 hover:opacity-100'
              }`}
            >
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white bg-${w.color}-500 shadow-lg group-hover:scale-110 transition-transform`}>
                <w.icon className="h-6 w-6" />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${activeWheel === w.id ? `text-${w.color}-700` : 'text-grayDark'}`}>{w.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-3 space-y-8">
            <Card className="p-10 bg-white">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-2xl bg-${activeWheelInfo.color}-500 text-white flex items-center justify-center`}>
                    <activeWheelInfo.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-blackDark">Resultaten: {activeWheelInfo.label}</h3>
                    <p className="text-[10px] font-bold text-grayMedium uppercase tracking-widest">Prestatie-indicatoren & KPI's</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setMetricModalOpen(true)} className="rounded-xl px-6 border-dashed">
                  <PlusCircle className="h-4 w-4 mr-2" /> Extra cijfer toevoegen
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="py-4 text-[10px] font-black text-grayMedium uppercase tracking-widest w-1/3">KPI / Metriek</th>
                      <th className="py-4 text-[10px] font-black text-grayMedium uppercase tracking-widest text-center">Eenheid</th>
                      <th className="py-4 text-[10px] font-black text-grayMedium uppercase tracking-widest text-center">Waarde (Nu/Hist)</th>
                      <th className="py-4 text-[10px] font-black text-primary uppercase tracking-widest text-center bg-primary/5 rounded-t-xl">2025 Target</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {metricsInWheel.map(metric => (
                      <tr key={metric.id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="py-6">
                          <p className="font-bold text-blackDark text-sm">{metric.name}</p>
                          {!metric.isStandard && <Badge color="purple" className="text-[8px] mt-1">Extra</Badge>}
                        </td>
                        <td className="py-6 text-center">
                          <span className="text-xs font-black text-grayMedium p-2 bg-gray-50 rounded-lg">{metric.unit}</span>
                        </td>
                        <td className="py-6 px-2">
                          <div className="flex gap-2 justify-center">
                            <input
                              type="text"
                              className="w-20 bg-gray-50/50 p-2 rounded-xl text-center font-bold text-blackDark focus:outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/30"
                              placeholder="2023"
                              value={metric.values.find(v => v.year === '2023')?.value || ''}
                              onChange={(e) => updateMetricValue(metric.id, '2023', e.target.value)}
                            />
                            <input
                              type="text"
                              className="w-20 bg-gray-50/50 p-2 rounded-xl text-center font-bold text-blackDark focus:outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/30"
                              placeholder="2024"
                              value={metric.values.find(v => v.year === '2024')?.value || ''}
                              onChange={(e) => updateMetricValue(metric.id, '2024', e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="py-6 px-2 bg-primary/5">
                          <input
                            type="text"
                            className="w-full bg-white p-2 rounded-xl text-center font-black text-primary focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20"
                            placeholder="Target"
                            value={metric.values.find(v => v.year === '2025')?.value || ''}
                            onChange={(e) => updateMetricValue(metric.id, '2025', e.target.value)}
                          />
                        </td>
                        <td className="py-6 text-right">
                          {!metric.isStandard && (
                            <button onClick={() => handleDeleteMetric(metric.id)} className="p-2 text-grayMedium hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-grayMedium">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-blackDark">Overige toelichting of aanvullende prestaties</h4>
                  <p className="text-[10px] font-bold text-grayMedium uppercase tracking-widest">Context bij het waardewiel {activeWheelInfo.label}</p>
                </div>
              </div>
              <TextArea
                rows={5}
                value={data.wheelContext[activeWheel]}
                onChange={(e) => updateWheelContext(activeWheel, e.target.value)}
                placeholder={`Geef hier toelichting op de ${activeWheelInfo.label} cijfers of benoem prestaties die niet in cijfers te vangen zijn...`}
              />
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card title="Gekoppelde Doelen" subtitle={activeWheelInfo.label.toUpperCase()} className="bg-gray-50/50 border-none shadow-none">
              <div className="space-y-4">
                {data.strategicGoals.filter(g => g.wheel === activeWheel).length > 0 ? (
                  data.strategicGoals.filter(g => g.wheel === activeWheel).map(goal => (
                    <div key={goal.id} className="p-5 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm relative group">
                      <p className="text-xs font-bold text-blackDark leading-tight">{goal.description}</p>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                        <Badge color="blue" className="text-[8px]">{goal.term}</Badge>
                        <button onClick={() => handleDeleteGoal(goal.id)} className="text-grayMedium hover:text-red-500 transition-colors">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 opacity-40">
                    <Target className="h-10 w-10 mx-auto mb-2 text-grayMedium" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Nog geen doelen</p>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="w-full rounded-[1.5rem] py-4 border-dashed border-2 text-grayMedium hover:text-primary hover:border-primary/50"
                  onClick={() => {
                    setCurrentGoal({ wheel: activeWheel });
                    setGoalModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" /> Doel Toevoegen
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="space-y-12 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <SectionTitle icon={Building2} title="Identiteit" subtitle="Organisatieprofiel" color="blue" />
          <div className="space-y-6">
            <Input label="Organisatienaam" value={data.orgProfile.name} onChange={e => handleUpdateProfile('name', e.target.value)} />
            <div className="grid grid-cols-2 gap-6">
              <Select label="Sector" value={data.orgProfile.sector} onChange={e => handleUpdateProfile('sector', e.target.value)}
                options={["Technologie / SaaS", "Zorg & Welzijn", "Onderwijs", "Overheid", "Bouw & Infra", "Financiële Dienstverlening", "Retail", "Anders"]} />
              <Select label="Type" value={data.orgProfile.type} onChange={e => handleUpdateProfile('type', e.target.value)} options={["Profit", "Non-Profit", "Overheid", "Hybride"]} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Input label="Locatie(s)" value={data.orgProfile.location} onChange={e => handleUpdateProfile('location', e.target.value)} />
              <Input label="Aantal FTE" type="number" value={data.orgProfile.employees} onChange={e => handleUpdateProfile('employees', parseInt(e.target.value))} />
            </div>
          </div>
        </section>

        <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <SectionTitle icon={Users} title="Stakeholders" subtitle="Krachtenveld analyse" color="purple" />
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
            {data.stakeholders.length > 0 ? data.stakeholders.map(s => (
              <div key={s.id} className="flex items-center justify-between p-5 bg-grayLight/30 rounded-3xl border border-gray-100 group">
                <div>
                  <p className="font-black text-blackDark text-sm">{s.name}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge color="blue" className="text-[9px]">Macht: {s.power}</Badge>
                    <Badge color="purple" className="text-[9px]">Belang: {s.interest}</Badge>
                  </div>
                </div>
                <button onClick={() => onUpdate({ stakeholders: data.stakeholders.filter(st => st.id !== s.id) })} className="p-2 text-grayMedium hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )) : (
              <div className="text-center py-10 opacity-30">
                <Users className="h-12 w-12 mx-auto mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">Nog geen stakeholders toegevoegd</p>
              </div>
            )}
            <Button variant="outline" onClick={() => setStakeholderModalOpen(true)} className="w-full rounded-[1.5rem] py-4 border-dashed border-2 text-grayMedium hover:text-primary">
              <Plus className="h-4 w-4 mr-2" /> Stakeholder Toevoegen
            </Button>
          </div>
        </section>
      </div>
    </div>
  );

  const SectionTitle = ({ icon: Icon, title, subtitle, color }: { icon: any, title: string, subtitle: string, color: string }) => (
    <div className="flex items-center gap-4 mb-8">
      <div className={`h-12 w-12 bg-${color}-50 rounded-2xl flex items-center justify-center text-${color}-600`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-2xl font-black text-blackDark tracking-tight">{title}</h3>
        <p className="text-sm text-grayMedium font-medium">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className="pb-32 space-y-10">
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16 space-y-4">
        <Badge color="blue" className="px-4 py-2 uppercase font-black tracking-widest">Strategische Fundering</Badge>
        <h1 className="text-5xl md:text-6xl font-black text-blackDark tracking-tight leading-[1.1]">Focus & Resultaat.</h1>
        <p className="text-xl text-grayDark font-medium leading-relaxed">
          Definieer je missie, meet je prestaties per waardewiel en leg de basis voor je organisatie-fit.
        </p>
      </div>

      <div className="flex items-center justify-between mb-12 bg-white p-2 rounded-[2.5rem] shadow-sm border border-gray-100 max-w-5xl mx-auto">
        {modules.map((m, idx) => (
          <button
            key={m.id}
            onClick={() => setActiveModule(m.id as FocusModule)}
            className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-[2rem] transition-all duration-300 ${
              activeModule === m.id 
                ? 'bg-primary text-white shadow-xl shadow-blue-500/30 scale-105 z-10' 
                : 'text-grayMedium hover:bg-grayLight/50 hover:text-grayDark'
            }`}
          >
            <m.icon className="h-4 w-4" />
            <span className="text-sm font-black uppercase tracking-widest hidden md:block">
              {idx + 1}. {m.label}
            </span>
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        {activeModule === 'profile' && renderProfile()}
        {activeModule === 'performance' && renderPerformance()}
        {activeModule === 'identity' && (
           <div className="max-w-4xl mx-auto animate-fade-in-up">
             <section className="bg-white p-10 md:p-16 rounded-[4rem] border border-gray-100 shadow-sm space-y-10">
                <SectionTitle icon={Target} title="Bestaansrecht" subtitle="Ambitie & Richting" color="red" />
                <div className="space-y-8">
                  <TextArea label="Missie" rows={3} value={data.mission} onChange={(e) => onUpdate({ mission: e.target.value })} placeholder="Waarom bestaan wij? Wat is onze maatschappelijke bijdrage?" />
                  <TextArea label="Visie" rows={3} value={data.vision} onChange={(e) => onUpdate({ vision: e.target.value })} placeholder="Hoe ziet de wereld eruit als wij ons werk optimaal doen?" />
                  <TextArea label="Strategie" rows={5} value={data.strategy} onChange={(e) => onUpdate({ strategy: e.target.value })} placeholder="Wat gaan we concreet doen om onze visie te realiseren?" />
                </div>
             </section>
           </div>
        )}
        {activeModule === 'external' && (
          <div className="space-y-10 animate-fade-in-up">
             <div className="bg-deepBlue p-12 rounded-[4rem] text-white relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-12 opacity-10"><Globe className="h-64 w-64" /></div>
               <div className="relative z-10">
                 <h2 className="text-4xl font-black mb-8 leading-tight">Live Markt Intelligence.</h2>
                 <p className="text-lightBlue/80 text-xl font-medium leading-relaxed mb-10 max-w-2xl">
                   Onze AI doorzoekt het web naar trends, wetgeving en concurrentie die van invloed zijn op de sector <strong>{data.orgProfile.sector}</strong>.
                 </p>
                 <div className="flex gap-4">
                   <AIButton onClick={() => handleExternalAnalysis('detailed')} loading={externalLoading} label="Start AI Research" className="bg-white text-deepBlue border-none px-10 py-5" />
                 </div>
               </div>
             </div>
             
             {data.externalAnalysis.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {data.externalAnalysis.map(factor => (
                   <Card key={factor.id} title={factor.category} subtitle="Externe Factor" className="hover:shadow-2xl">
                     <p className="font-bold text-blackDark mb-4 leading-tight">{factor.factor}</p>
                     <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                           <p className="text-[8px] font-black text-green-700 uppercase mb-1">Kans</p>
                           <p className="text-xs font-medium text-green-900">{factor.opportunity}</p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                           <p className="text-[8px] font-black text-red-700 uppercase mb-1">Bedreiging</p>
                           <p className="text-xs font-medium text-red-900">{factor.threat}</p>
                        </div>
                     </div>
                   </Card>
                 ))}
               </div>
             ) : (
               <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100 opacity-40">
                  <Search className="h-16 w-16 mx-auto mb-4 text-grayMedium" />
                  <p className="text-lg font-bold">Start de AI Research om externe trends te laden.</p>
               </div>
             )}
          </div>
        )}
      </div>

      <Modal isOpen={isMetricModalOpen} onClose={() => setMetricModalOpen(false)} title="Extra Cijfer Toevoegen">
          <div className="space-y-6 p-2">
             <Input label="Naam van het cijfer" value={newMetric.name} onChange={e => setNewMetric({...newMetric, name: e.target.value})} placeholder="Bijv. Cashflow, Conversie of Impact-uren" />
             <Select label="Eenheid" value={newMetric.unit} onChange={e => setNewMetric({...newMetric, unit: e.target.value})} options={['€', '%', 'Aantal', 'Score', 'Dagen', 'Uur', 'Ton CO2']} />
             <div className="flex justify-end pt-4">
                <Button onClick={handleAddMetric} className="rounded-2xl px-12 py-5 shadow-2xl">Cijfer Toevoegen</Button>
             </div>
          </div>
      </Modal>

      <Modal isOpen={isGoalModalOpen} onClose={() => setGoalModalOpen(false)} title="Strategisch Doel Toevoegen">
           <div className="space-y-6 p-2">
               <TextArea label="Omschrijf het doel" rows={3} value={currentGoal.description || ''} onChange={e => setCurrentGoal({...currentGoal, description: e.target.value})} placeholder="Wat willen we specifiek bereiken binnen dit waardewiel?" />
               <div className="grid grid-cols-2 gap-6">
                   <Select label="Termijn" value={currentGoal.term} onChange={e => setCurrentGoal({...currentGoal, term: e.target.value as any})} options={['Kort', 'Middellang', 'Lang']} />
                   <Select label="Koppel KPI" value={currentGoal.kpiId} onChange={e => setCurrentGoal({...currentGoal, kpiId: e.target.value})} options={[
                     {value: '', label: 'Geen KPI (vrije tekst)'},
                     ...data.performanceMetrics.filter(m => m.wheel === activeWheel).map(m => ({value: m.id, label: m.name}))
                   ]} />
               </div>
               <div className="flex justify-end pt-4">
                   <Button onClick={handleAddGoal} className="rounded-2xl px-12 py-5">Doel Opslaan</Button>
               </div>
           </div>
      </Modal>

      <Modal isOpen={isStakeholderModalOpen} onClose={() => setStakeholderModalOpen(false)} title="Stakeholder Toevoegen">
           <div className="space-y-6 p-2">
               <Input label="Naam van the stakeholder / groep" value={currentStakeholder.name || ''} onChange={e => setCurrentStakeholder({...currentStakeholder, name: e.target.value})} placeholder="Bijv. Raad van Commissarissen" />
               <div className="grid grid-cols-3 gap-4">
                   <Select label="Macht" value={currentStakeholder.power} onChange={e => setCurrentStakeholder({...currentStakeholder, power: e.target.value as any})} options={['Low', 'Medium', 'High']} />
                   <Select label="Belang" value={currentStakeholder.interest} onChange={e => setCurrentStakeholder({...currentStakeholder, interest: e.target.value as any})} options={['Low', 'Medium', 'High']} />
                   <Select label="Engagement" value={currentStakeholder.engagement} onChange={e => setCurrentStakeholder({...currentStakeholder, engagement: e.target.value as any})} options={['Low', 'Medium', 'High']} />
               </div>
               <div className="flex justify-end pt-4">
                   <Button onClick={() => {
                     if (currentStakeholder.name) {
                       const s: Stakeholder = { id: Date.now().toString(), name: currentStakeholder.name, interest: currentStakeholder.interest || 'Medium', power: currentStakeholder.power || 'Medium', engagement: currentStakeholder.engagement || 'Medium' };
                       onUpdate({ stakeholders: [...data.stakeholders, s] });
                       setStakeholderModalOpen(false);
                       setCurrentStakeholder({});
                     }
                   }} className="rounded-2xl px-12 py-5">Stakeholder Opslaan</Button>
               </div>
           </div>
      </Modal>

      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[50]">
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-full px-10 py-5 flex items-center gap-10">
             <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-grayDark uppercase tracking-widest">Systeem Online</span>
             </div>
             <Button size="lg" onClick={() => onNavigate(View.INRICHTING)} className="rounded-full px-10 group">
                Naar Inrichting <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
             </Button>
          </div>
      </div>
    </div>
  );
};

export default Focus;
