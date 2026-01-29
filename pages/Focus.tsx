
import React, { useState, useMemo } from 'react';
import { AppData, OrganizationProfile, PerformanceMetric, Stakeholder, StrategicGoal, ValueWheel, ExternalFactor, View } from '../types';
import { Card, TextArea, AIButton, Badge, Input, Select, Button, Modal } from '../components/Shared';
import { generateExternalAnalysis, getMetricBenchmark, generateStrategicScenarios, Scenario } from '../services/geminiService';
import { exportPerformanceToExcel } from '../services/exportService';
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
  Search,
  TrendingUp,
  TrendingDown,
  Download,
  Info,
  Layers,
  Zap,
  ChevronRight,
  MessageSquareQuote,
  Timer
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

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
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [benchmarkingId, setBenchmarkingId] = useState<string | null>(null);
  
  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const [isStakeholderModalOpen, setStakeholderModalOpen] = useState(false);
  const [isMetricModalOpen, setMetricModalOpen] = useState(false);
  const [isScenarioModalOpen, setScenarioModalOpen] = useState(false);
  const [isBenchmarkModalOpen, setBenchmarkModalOpen] = useState(false);
  
  const [currentGoal, setCurrentGoal] = useState<Partial<StrategicGoal>>({});
  const [currentStakeholder, setCurrentStakeholder] = useState<Partial<Stakeholder>>({});
  const [newMetric, setNewMetric] = useState({ name: '', unit: 'Score' });
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [benchmarkResult, setBenchmarkResult] = useState({ name: '', text: '' });

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

  const calculateGrowth = (metric: PerformanceMetric) => {
      const v2024 = parseFloat(metric.values.find(v => v.year === '2024')?.value || '0');
      const v2023 = parseFloat(metric.values.find(v => v.year === '2023')?.value || '0');
      if (v2023 === 0) return null;
      return Math.round(((v2024 - v2023) / v2023) * 100);
  };

  const handleBenchmarking = async (metric: PerformanceMetric) => {
      setBenchmarkingId(metric.id);
      const res = await getMetricBenchmark(metric.name, data.orgProfile.sector);
      setBenchmarkResult({ name: metric.name, text: res });
      setBenchmarkModalOpen(true);
      setBenchmarkingId(null);
  };

  const handleScenarioGen = async () => {
      setScenarioLoading(true);
      const res = await generateStrategicScenarios(data);
      setScenarios(res);
      setScenarioModalOpen(true);
      setScenarioLoading(false);
  };

  const handleExport = () => {
      exportPerformanceToExcel(data.performanceMetrics, data.orgProfile.name);
  };

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
                    <h3 className="text-2xl font-black text-blackDark">Resultaten Dashboard</h3>
                    <p className="text-[10px] font-bold text-grayMedium uppercase tracking-widest">Trend-analyse & Groei</p>
                  </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={handleExport} className="rounded-xl px-4 border-dashed">
                      <Download className="h-4 w-4 mr-2" /> XLSX Export
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setMetricModalOpen(true)} className="rounded-xl px-4 border-dashed">
                      <PlusCircle className="h-4 w-4 mr-2" /> Nieuwe KPI
                    </Button>
                </div>
              </div>

              <div className="space-y-6">
                {metricsInWheel.map(metric => {
                    const growth = calculateGrowth(metric);
                    const chartData = metric.values.map(v => ({ year: v.year, value: parseFloat(v.value) || 0 }));
                    
                    return (
                        <div key={metric.id} className="p-8 bg-grayLight/20 rounded-[2.5rem] border border-gray-100 hover:bg-white hover:shadow-xl transition-all group">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                                <div className="md:col-span-3">
                                    <p className="text-xs font-black text-grayMedium uppercase tracking-widest mb-1">{activeWheelInfo.label}</p>
                                    <h4 className="text-lg font-black text-blackDark leading-tight">{metric.name}</h4>
                                    <div className="flex items-center gap-2 mt-2">
                                        {growth !== null && (
                                            <Badge color={growth >= 0 ? 'green' : 'red'} className="text-[8px]">
                                                {growth >= 0 ? <TrendingUp className="h-2 w-2 mr-1" /> : <TrendingDown className="h-2 w-2 mr-1" />}
                                                {Math.abs(growth)}% Groei
                                            </Badge>
                                        )}
                                        <button 
                                            onClick={() => handleBenchmarking(metric)}
                                            className="text-[10px] font-black text-primary hover:underline flex items-center gap-1 uppercase tracking-tighter"
                                            disabled={benchmarkingId === metric.id}
                                        >
                                            {benchmarkingId === metric.id ? 'Loading...' : <><Globe className="h-3 w-3" /> Benchmark</>}
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="md:col-span-5 grid grid-cols-3 gap-4">
                                    {metric.values.map(v => (
                                        <div key={v.year} className={`${v.year === '2025' ? 'bg-primary/5 border-primary/20' : 'bg-white'} p-4 rounded-2xl border border-gray-100`}>
                                            <p className={`text-[8px] font-black uppercase ${v.year === '2025' ? 'text-primary' : 'text-grayMedium'}`}>{v.year === '2025' ? 'Target 2025' : v.year}</p>
                                            <input 
                                                type="text" 
                                                className="w-full bg-transparent font-black text-blackDark text-lg focus:outline-none"
                                                value={v.value}
                                                placeholder="-"
                                                onChange={(e) => updateMetricValue(metric.id, v.year, e.target.value)}
                                            />
                                            <span className="text-[10px] font-bold text-grayMedium">{metric.unit}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="md:col-span-4 h-24">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id={`color-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fill={`url(#color-${metric.id})`} />
                                            <Tooltip contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    );
                })}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card title="Gekoppelde Doelen" subtitle={activeWheelInfo.label.toUpperCase()} className="bg-gray-50/50 border-none shadow-none">
              <div className="space-y-4">
                {data.strategicGoals.filter(g => g.wheel === activeWheel).map(goal => (
                    <div key={goal.id} className="p-5 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm relative group">
                        <p className="text-xs font-bold text-blackDark leading-tight">{goal.description}</p>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                            <Badge color="blue" className="text-[8px]">{goal.term}</Badge>
                            <button onClick={() => onUpdate({ strategicGoals: data.strategicGoals.filter(g => g.id !== goal.id) })} className="text-grayMedium hover:text-red-500 transition-colors">
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                ))}
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

  const renderExternal = () => (
    <div className="space-y-12 animate-fade-in-up">
        <div className="bg-blackDark p-12 md:p-20 rounded-[4rem] text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-10"><Zap className="h-96 w-96 text-primary" /></div>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div>
                    <Badge color="blue" className="bg-primary/20 text-primary border-primary/30 mb-8">AI POWERED STRATEGY</Badge>
                    <h2 className="text-5xl md:text-7xl font-black mb-8 leading-[1.05] tracking-tight">Market <span className="text-primary">Intelligence.</span></h2>
                    <p className="text-grayMedium text-xl leading-relaxed mb-12 max-w-lg">
                        Ontdek trends, concurrenten en macro-economische verschuivingen via Gemini 3's real-time web search.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <AIButton onClick={() => generateExternalAnalysis(data.orgProfile.name, data.orgProfile.sector, 'detailed').then(res => onUpdate({externalAnalysis: res}))} loading={externalLoading} label="Update Market Research" className="px-12 py-5 text-base" />
                        <Button variant="outline" onClick={handleScenarioGen} disabled={scenarioLoading} className="bg-white/5 border-white/20 text-white hover:bg-white hover:text-blackDark px-10 rounded-2xl">
                            {scenarioLoading ? 'Calculating...' : <><Sparkles className="h-5 w-5 mr-2" /> Scenario Builder</>}
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <Card className="bg-white/5 border-white/10 p-8 rounded-[2.5rem]">
                        <Timer className="h-10 w-10 text-primary mb-4" />
                        <p className="text-4xl font-black">24/7</p>
                        <p className="text-xs font-bold text-grayMedium uppercase mt-2">Active Scanning</p>
                    </Card>
                    <Card className="bg-white/5 border-white/10 p-8 rounded-[2.5rem]">
                        <Search className="h-10 w-10 text-primary mb-4" />
                        <p className="text-4xl font-black">{data.externalAnalysis.length}</p>
                        <p className="text-xs font-bold text-grayMedium uppercase mt-2">Kritieke Factoren</p>
                    </Card>
                </div>
            </div>
        </div>

        {data.externalAnalysis.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.externalAnalysis.map(factor => (
                    <Card key={factor.id} className="p-8 hover:shadow-2xl transition-all border-none bg-white relative group">
                        <div className="flex justify-between items-start mb-6">
                            <Badge color="blue">{factor.category}</Badge>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-grayMedium uppercase tracking-widest">{factor.horizon}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <div className="h-2 w-16 bg-grayLight rounded-full overflow-hidden">
                                        <div className={`h-full ${factor.impactScore && factor.impactScore > 7 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${(factor.impactScore || 5) * 10}%` }}></div>
                                    </div>
                                    <span className="text-[10px] font-black">{factor.impactScore}/10</span>
                                </div>
                            </div>
                        </div>
                        <h4 className="text-xl font-black text-blackDark mb-4 leading-tight group-hover:text-primary transition-colors">{factor.factor}</h4>
                        <p className="text-sm text-grayDark italic mb-8 border-l-4 border-grayLight pl-4">"{factor.futureTrend}"</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                                <p className="text-[8px] font-black text-green-700 uppercase mb-1">Opportunity</p>
                                <p className="text-[10px] font-bold text-green-900 leading-snug">{factor.opportunity}</p>
                            </div>
                            <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                                <p className="text-[8px] font-black text-red-700 uppercase mb-1">Threat</p>
                                <p className="text-[10px] font-bold text-red-900 leading-snug">{factor.threat}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        )}
    </div>
  );

  const wheelData = [
    { id: ValueWheel.FINANCIAL, label: 'Financieel', color: 'blue', icon: Briefcase },
    { id: ValueWheel.CUSTOMER, label: 'Klant', color: 'green', icon: Users },
    { id: ValueWheel.EMPLOYEE, label: 'Medewerker', color: 'yellow', icon: Sparkles },
    { id: ValueWheel.ORGANIZATION, label: 'Organisatie', color: 'purple', icon: Settings },
    { id: ValueWheel.SOCIAL, label: 'Maatschappelijk', color: 'pink', icon: Globe },
  ];

  const modules = [
    { id: 'profile', label: 'Profiel', icon: Building2 },
    { id: 'identity', label: 'Fundering', icon: Target },
    { id: 'performance', label: 'Cijfers', icon: BarChart3 },
    { id: 'external', label: 'Research', icon: Globe },
  ];

  return (
    <div className="pb-32 space-y-10">
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16 space-y-4">
        <Badge color="blue" className="px-4 py-2 uppercase font-black tracking-widest">Fase 5: Strategic Insight</Badge>
        <h1 className="text-5xl md:text-7xl font-black text-blackDark tracking-tight leading-[1.05]">Focus op <span className="text-primary">Impact.</span></h1>
        <p className="text-xl text-grayDark font-medium leading-relaxed max-w-2xl">
          Meet je voortgang, ontdek externe trends en anticipeer op de toekomst via onze geïntegreerde AI-engine.
        </p>
      </div>

      <div className="flex items-center justify-between mb-12 bg-white p-2 rounded-[2.5rem] shadow-sm border border-gray-100 max-w-4xl mx-auto">
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
              {m.label}
            </span>
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        {activeModule === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <section className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><Building2 className="h-6 w-6" /></div>
                        <div>
                            <h3 className="text-2xl font-black text-blackDark">Identiteit</h3>
                            <p className="text-xs font-bold text-grayMedium uppercase">Organisatieprofiel</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <Input label="Organisatienaam" value={data.orgProfile.name} onChange={e => handleUpdateProfile('name', e.target.value)} />
                        <div className="grid grid-cols-2 gap-6">
                            <Select label="Sector" value={data.orgProfile.sector} onChange={e => handleUpdateProfile('sector', e.target.value)}
                                options={["Technologie / SaaS", "Zorg & Welzijn", "Onderwijs", "Overheid", "Bouw & Infra", "Finance", "Retail", "Anders"]} />
                            <Select label="Type" value={data.orgProfile.type} onChange={e => handleUpdateProfile('type', e.target.value)} options={["Profit", "Non-Profit", "Hybride"]} />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <Input label="Locatie" value={data.orgProfile.location} onChange={e => handleUpdateProfile('location', e.target.value)} />
                            <Input label="Aantal FTE" type="number" value={data.orgProfile.employees} onChange={e => handleUpdateProfile('employees', parseInt(e.target.value))} />
                        </div>
                    </div>
                </section>

                <section className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="h-12 w-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600"><Users className="h-6 w-6" /></div>
                        <div>
                            <h3 className="text-2xl font-black text-blackDark">Stakeholders</h3>
                            <p className="text-xs font-bold text-grayMedium uppercase">Belangenveld</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {data.stakeholders.map(s => (
                            <div key={s.id} className="flex items-center justify-between p-6 bg-grayLight/30 rounded-3xl border border-gray-50 group hover:bg-white transition-all">
                                <div>
                                    <p className="font-black text-blackDark text-sm">{s.name}</p>
                                    <div className="flex gap-2 mt-2">
                                        <Badge color="blue" className="text-[8px]">Macht: {s.power}</Badge>
                                        <Badge color="purple" className="text-[8px]">Belang: {s.interest}</Badge>
                                    </div>
                                </div>
                                <button onClick={() => onUpdate({ stakeholders: data.stakeholders.filter(st => st.id !== s.id) })} className="p-2 text-grayMedium hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        <Button variant="outline" onClick={() => setStakeholderModalOpen(true)} className="w-full rounded-[2rem] py-6 border-dashed border-2 text-grayMedium hover:text-primary">
                            <Plus className="h-4 w-4 mr-2" /> Nieuwe Stakeholder
                        </Button>
                    </div>
                </section>
            </div>
        )}
        {activeModule === 'identity' && (
           <div className="max-w-4xl mx-auto animate-fade-in-up">
             <section className="bg-white p-16 md:p-24 rounded-[5rem] border border-gray-100 shadow-sm space-y-12">
                <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-red-50 rounded-3xl flex items-center justify-center text-red-600 shadow-xl shadow-red-500/10"><Target className="h-8 w-8" /></div>
                    <div>
                        <h3 className="text-3xl font-black text-blackDark tracking-tight">Richting & Bestaansrecht</h3>
                        <p className="text-sm text-grayMedium font-bold uppercase tracking-widest">Missie & Visie 2025</p>
                    </div>
                </div>
                <div className="space-y-10">
                  <TextArea label="Missie" rows={3} value={data.mission} onChange={(e) => onUpdate({ mission: e.target.value })} placeholder="Waarom bestaan wij?" className="text-lg" />
                  <TextArea label="Visie" rows={3} value={data.vision} onChange={(e) => onUpdate({ vision: e.target.value })} placeholder="Hoe ziet de wereld eruit over 5 jaar?" className="text-lg" />
                  <TextArea label="Kernstrategie" rows={5} value={data.strategy} onChange={(e) => onUpdate({ strategy: e.target.value })} placeholder="Wat is onze unieke route?" className="text-lg bg-primary/5" />
                </div>
             </section>
           </div>
        )}
        {activeModule === 'performance' && renderPerformance()}
        {activeModule === 'external' && renderExternal()}
      </div>

      <Modal isOpen={isBenchmarkModalOpen} onClose={() => setBenchmarkModalOpen(false)} title={`Benchmark: ${benchmarkResult.name}`}>
          <div className="space-y-8">
              <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2.5rem] relative overflow-hidden">
                  <Globe className="absolute -top-10 -right-10 h-32 w-32 text-primary opacity-10" />
                  <Badge color="blue" className="mb-4">REAL-TIME WEB RESEARCH</Badge>
                  <p className="text-sm font-medium text-blue-900 leading-relaxed italic">
                    "{benchmarkResult.text}"
                  </p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-4">
                  <Info className="h-6 w-6 text-grayMedium shrink-0" />
                  <p className="text-xs text-grayDark">Deze benchmark is gegenereerd op basis van sectorale data-modellen en live internet onderzoek.</p>
              </div>
              <Button onClick={() => setBenchmarkModalOpen(false)} className="w-full py-6 rounded-2xl">Sluiten</Button>
          </div>
      </Modal>

      <Modal isOpen={isScenarioModalOpen} onClose={() => setScenarioModalOpen(false)} title="Strategische Toekomstscenario's">
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
              {scenarios.map((s, idx) => (
                  <Card key={idx} className={`p-8 rounded-[2.5rem] border-2 ${idx === 2 ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
                      <h4 className="text-xl font-black text-blackDark mb-2 flex items-center gap-3">
                          {idx === 0 ? <TrendingUp className="h-5 w-5 text-green-500" /> : idx === 1 ? <TrendingDown className="h-5 w-5 text-gray-400" /> : <Zap className="h-5 w-5 text-red-500" />}
                          {s.title}
                      </h4>
                      <p className="text-sm text-grayDark leading-relaxed mb-6">{s.description}</p>
                      <div className="p-4 bg-grayLight/30 rounded-2xl mb-6">
                          <p className="text-[10px] font-black text-grayMedium uppercase mb-1">Impact op FIT</p>
                          <p className="text-xs font-bold">{s.impactOnFit}</p>
                      </div>
                      <div className="space-y-2">
                          <p className="text-[10px] font-black text-grayMedium uppercase">Aanbevolen Acties</p>
                          {s.recommendedActions.map((a, i) => (
                              <div key={i} className="flex items-center gap-3 text-[11px] font-bold">
                                  <ChevronRight className="h-3 w-3 text-primary" /> {a}
                              </div>
                          ))}
                      </div>
                  </Card>
              ))}
          </div>
          <div className="pt-6">
              <Button onClick={() => setScenarioModalOpen(false)} className="w-full py-5 rounded-2xl">Scenario's Opslaan & Sluiten</Button>
          </div>
      </Modal>

      <Modal isOpen={isMetricModalOpen} onClose={() => setMetricModalOpen(false)} title="Extra KPI Toevoegen">
          <div className="space-y-6">
             <Input label="Naam van de KPI" value={newMetric.name} onChange={e => setNewMetric({...newMetric, name: e.target.value})} placeholder="Bijv. Cashflow of NPS" />
             <Select label="Eenheid" value={newMetric.unit} onChange={e => setNewMetric({...newMetric, unit: e.target.value})} options={['€', '%', 'Aantal', 'Score', 'Ton CO2', 'Uren']} />
             <div className="flex justify-end pt-4">
                <Button onClick={() => {
                    const metric: PerformanceMetric = {
                        id: `custom_${Date.now()}`,
                        wheel: activeWheel,
                        name: newMetric.name,
                        unit: newMetric.unit,
                        isStandard: false,
                        values: [{ year: '2023', value: '' }, { year: '2024', value: '' }, { year: '2025', value: '' }]
                    };
                    onUpdate({ performanceMetrics: [...data.performanceMetrics, metric] });
                    setMetricModalOpen(false);
                }} className="rounded-2xl px-12 py-5">Cijfer Toevoegen</Button>
             </div>
          </div>
      </Modal>

      <Modal isOpen={isGoalModalOpen} onClose={() => setGoalModalOpen(false)} title="Strategisch Doel Toevoegen">
           <div className="space-y-6">
               <TextArea label="Omschrijf het doel" rows={3} value={currentGoal.description || ''} onChange={e => setCurrentGoal({...currentGoal, description: e.target.value})} placeholder="Wat willen we specifiek bereiken?" />
               <div className="grid grid-cols-2 gap-6">
                   <Select label="Termijn" value={currentGoal.term} onChange={e => setCurrentGoal({...currentGoal, term: e.target.value as any})} options={['Kort', 'Middellang', 'Lang']} />
                   <Select label="Koppel KPI" value={currentGoal.kpiId} onChange={e => setCurrentGoal({...currentGoal, kpiId: e.target.value})} options={[
                     {value: '', label: 'Geen KPI (vrije tekst)'},
                     ...data.performanceMetrics.filter(m => m.wheel === activeWheel).map(m => ({value: m.id, label: m.name}))
                   ]} />
               </div>
               <div className="flex justify-end pt-4">
                   <Button onClick={() => {
                        const newGoal: StrategicGoal = {
                            id: Date.now().toString(),
                            wheel: currentGoal.wheel!,
                            description: currentGoal.description!,
                            term: currentGoal.term || 'Middellang',
                            priority: 3
                        };
                        onUpdate({ strategicGoals: [...data.strategicGoals, newGoal] });
                        setGoalModalOpen(false);
                   }} className="rounded-2xl px-12 py-5 shadow-xl">Doel Opslaan</Button>
               </div>
           </div>
      </Modal>

      <Modal isOpen={isStakeholderModalOpen} onClose={() => setStakeholderModalOpen(false)} title="Stakeholder Toevoegen">
           <div className="space-y-6">
               <Input label="Naam Stakeholder" value={currentStakeholder.name || ''} onChange={e => setCurrentStakeholder({...currentStakeholder, name: e.target.value})} />
               <div className="grid grid-cols-3 gap-4">
                   <Select label="Macht" value={currentStakeholder.power} onChange={e => setCurrentStakeholder({...currentStakeholder, power: e.target.value as any})} options={['Low', 'Medium', 'High']} />
                   <Select label="Belang" value={currentStakeholder.interest} onChange={e => setCurrentStakeholder({...currentStakeholder, interest: e.target.value as any})} options={['Low', 'Medium', 'High']} />
                   <Select label="Engagement" value={currentStakeholder.engagement} onChange={e => setCurrentStakeholder({...currentStakeholder, engagement: e.target.value as any})} options={['Low', 'Medium', 'High']} />
               </div>
               <div className="flex justify-end pt-4">
                   <Button onClick={() => {
                        const s: Stakeholder = { id: Date.now().toString(), name: currentStakeholder.name!, interest: currentStakeholder.interest || 'Medium', power: currentStakeholder.power || 'Medium', engagement: currentStakeholder.engagement || 'Medium' };
                        onUpdate({ stakeholders: [...data.stakeholders, s] });
                        setStakeholderModalOpen(false);
                   }} className="rounded-2xl px-12 py-5">Opslaan</Button>
               </div>
           </div>
      </Modal>

      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[50]">
          <div className="bg-white/90 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-full px-12 py-6 flex items-center gap-12">
             <div className="flex items-center gap-4">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-black text-grayDark uppercase tracking-widest">Focus Engine Active</span>
             </div>
             <div className="h-8 w-px bg-gray-200"></div>
             <Button size="lg" onClick={() => onNavigate(View.INRICHTING)} className="rounded-full px-12 group h-14">
                Naar Inrichting <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
             </Button>
          </div>
      </div>
    </div>
  );
};

export default Focus;
