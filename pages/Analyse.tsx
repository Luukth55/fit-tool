
import React, { useState, useMemo } from 'react';
import { AppData, View, StrategicGoal, AIAlert, ExternalFactor, GapAnalysisItem, FitLevel } from '../types';
import { Card, Badge, Button, Tabs, Modal, AIButton } from '../components/Shared';
import { calculateReliableFitScore, generateSystemAlerts } from '../services/analysisUtils';
import { generateSmartAlerts } from '../services/geminiService';
import { generatePDFReport } from '../services/exportService';
import { 
  Target, 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  ArrowRight,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  BarChart3,
  Dna,
  Layers,
  Globe,
  Bell,
  Info,
  ChevronRight,
  TrendingDown,
  ExternalLink,
  Download
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface Props {
  data: AppData;
  onNavigate: (view: View) => void;
  onUpdate: (data: Partial<AppData>) => void;
}

const Analyse: React.FC<Props> = ({ data, onNavigate, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('Overzicht');
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [selectedGap, setSelectedGap] = useState<GapAnalysisItem | null>(null);

  const metrics = useMemo(() => calculateReliableFitScore(data), [data]);
  const systemAlerts = useMemo(() => generateSystemAlerts(data), [data]);
  const allAlerts = [...systemAlerts, ...(data.alerts || [])].sort((a, b) => a.priority - b.priority);

  const handleFetchSmartAlerts = async () => {
    setLoadingAlerts(true);
    const aiAlerts = await generateSmartAlerts(data);
    onUpdate({ alerts: aiAlerts });
    setLoadingAlerts(false);
  };

  const handleExportPDF = () => {
    generatePDFReport(data);
  };

  const getFitColor = (level: FitLevel) => {
    if (level === 'Good') return 'text-green-500 bg-green-50';
    if (level === 'Partial') return 'text-orange-500 bg-orange-50';
    return 'text-red-500 bg-red-50';
  };

  const renderAlerts = () => (
    <div className="space-y-4 mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-black text-blackDark">Intelligente Alerts</h2>
        </div>
        <AIButton 
          size="sm" 
          onClick={handleFetchSmartAlerts} 
          loading={loadingAlerts} 
          label="Nieuwe AI Inzichten" 
          className="text-[10px]"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allAlerts.length > 0 ? allAlerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`p-6 rounded-[2rem] border-2 transition-all hover:scale-[1.02] flex flex-col justify-between ${
              alert.type === 'warning' ? 'bg-red-50/50 border-red-100' : 
              alert.type === 'opportunity' ? 'bg-green-50/50 border-green-100' : 
              'bg-blue-50/50 border-blue-100'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                {alert.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-red-500" /> : 
                 alert.type === 'opportunity' ? <Sparkles className="h-4 w-4 text-green-500" /> : 
                 <Info className="h-4 w-4 text-blue-500" />}
                <span className="text-[10px] font-black uppercase tracking-widest text-blackDark opacity-60">Prioriteit {alert.priority}</span>
              </div>
              <h3 className="font-black text-blackDark mb-2">{alert.title}</h3>
              <p className="text-xs text-grayDark leading-relaxed">{alert.message}</p>
            </div>
            {alert.actionLabel && (
              <button 
                onClick={() => alert.actionView && onNavigate(alert.actionView)}
                className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase text-primary hover:gap-3 transition-all"
              >
                {alert.actionLabel} <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        )) : (
          <div className="col-span-full py-12 text-center bg-grayLight/20 rounded-[2rem] border-2 border-dashed border-gray-200 opacity-40">
            <Bell className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm font-bold">Geen alerts op dit moment.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderGapMatrix = () => (
    <Card title="Gap Matrix" subtitle="STRATEGISCHE AANSLUITING" className="overflow-hidden border-none shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-4 px-6 font-black text-[10px] text-grayMedium uppercase tracking-widest w-64">Strategisch Doel</th>
              <th className="py-4 px-2 font-black text-[10px] text-grayMedium uppercase tracking-widest text-center">Structuur</th>
              <th className="py-4 px-2 font-black text-[10px] text-grayMedium uppercase tracking-widest text-center">Middelen</th>
              <th className="py-4 px-2 font-black text-[10px] text-grayMedium uppercase tracking-widest text-center">Cultuur</th>
              <th className="py-4 px-2 font-black text-[10px] text-grayMedium uppercase tracking-widest text-center">Mensen</th>
              <th className="py-4 px-6 font-black text-[10px] text-grayMedium uppercase tracking-widest text-center">Fit Score</th>
            </tr>
          </thead>
          <tbody>
            {data.inrichting.gapAnalysis.map((gap, i) => (
              <tr 
                key={i} 
                className="group hover:bg-grayLight/20 transition-all cursor-pointer"
                onClick={() => setSelectedGap(gap)}
              >
                <td className="py-6 px-6">
                  <p className="font-bold text-blackDark text-sm leading-tight">{gap.goal}</p>
                </td>
                <td className="py-6 px-2 text-center">
                  <div className={`inline-flex items-center justify-center h-8 w-8 rounded-xl font-black text-[10px] ${getFitColor(gap.structureFit)}`}>
                    {gap.structureFit.charAt(0)}
                  </div>
                </td>
                <td className="py-6 px-2 text-center">
                  <div className={`inline-flex items-center justify-center h-8 w-8 rounded-xl font-black text-[10px] ${getFitColor(gap.resourcesFit)}`}>
                    {gap.resourcesFit.charAt(0)}
                  </div>
                </td>
                <td className="py-6 px-2 text-center">
                  <div className={`inline-flex items-center justify-center h-8 w-8 rounded-xl font-black text-[10px] ${getFitColor(gap.cultureFit)}`}>
                    {gap.cultureFit.charAt(0)}
                  </div>
                </td>
                <td className="py-6 px-2 text-center">
                  <div className={`inline-flex items-center justify-center h-8 w-8 rounded-xl font-black text-[10px] ${getFitColor(gap.peopleFit)}`}>
                    {gap.peopleFit.charAt(0)}
                  </div>
                </td>
                <td className="py-6 px-6 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-20 h-1.5 bg-grayLight rounded-full overflow-hidden">
                      <div className={`h-full ${gap.score >= 4 ? 'bg-green-500' : gap.score >= 3 ? 'bg-primary' : 'bg-red-500'}`} style={{ width: `${gap.score * 20}%` }}></div>
                    </div>
                    <span className="text-[10px] font-black">{gap.score}/5</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-6 bg-grayLight/30 border-t border-gray-100 flex items-center gap-6 justify-center">
        <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-md bg-green-50 text-green-500 font-bold text-[8px] flex items-center justify-center">G</div> <span className="text-[9px] font-black uppercase text-grayMedium">Good</span></div>
        <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-md bg-orange-50 text-orange-500 font-bold text-[8px] flex items-center justify-center">P</div> <span className="text-[9px] font-black uppercase text-grayMedium">Partial</span></div>
        <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-md bg-red-50 text-red-500 font-bold text-[8px] flex items-center justify-center">B</div> <span className="text-[9px] font-black uppercase text-grayMedium">Bad</span></div>
      </div>
    </Card>
  );

  const renderExternalDashboard = () => (
    <div className="space-y-10 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Globe className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-black text-blackDark">Externe Intelligentie</h2>
        </div>
        <Badge color="blue">Sector: {data.orgProfile.sector}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card title="Impact Horizon" subtitle="TIJDLIJN" className="bg-white">
            <div className="space-y-4">
              {['Kort', 'Middellang', 'Lang'].map(horizon => {
                const count = data.externalAnalysis.filter(f => f.horizon === horizon).length;
                return (
                  <div key={horizon} className="p-4 bg-grayLight/20 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-grayMedium uppercase">{horizon}</p>
                      <p className="text-sm font-bold text-blackDark">{horizon === 'Kort' ? '< 1 jaar' : horizon === 'Lang' ? '> 3 jaar' : '1-3 jaar'}</p>
                    </div>
                    <Badge color="blue">{count}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card title="PESTLE Mix" subtitle="OMGEVINGSDATA" className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'P', value: data.externalAnalysis.filter(f => f.category.toLowerCase().includes('p')).length },
                      { name: 'E', value: data.externalAnalysis.filter(f => f.category.toLowerCase().includes('e')).length },
                      { name: 'S', value: data.externalAnalysis.filter(f => f.category.toLowerCase().includes('s')).length },
                      { name: 'T', value: data.externalAnalysis.filter(f => f.category.toLowerCase().includes('t')).length },
                      { name: 'L', value: data.externalAnalysis.filter(f => f.category.toLowerCase().includes('l')).length },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[0,1,2,3,4].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'][index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
             </ResponsiveContainer>
          </Card>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.externalAnalysis.length > 0 ? data.externalAnalysis.map(factor => (
            <Card 
              key={factor.id} 
              className="p-8 hover:shadow-2xl transition-all border-none bg-white relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-6">
                <Badge color="blue">{factor.category}</Badge>
                <div className="flex flex-col items-end">
                   <p className="text-[10px] font-black text-grayMedium uppercase tracking-widest">{factor.horizon}</p>
                   <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className={`h-3 w-3 ${factor.impactScore && factor.impactScore > 7 ? 'text-red-500' : 'text-green-500'}`} />
                      <span className="text-xs font-black">Impact: {factor.impactScore}/10</span>
                   </div>
                </div>
              </div>
              
              <h4 className="text-lg font-black text-blackDark mb-2 leading-tight">{factor.factor}</h4>
              <p className="text-xs text-grayDark italic mb-6 leading-relaxed">"{factor.futureTrend}"</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                  <p className="text-[8px] font-black text-green-700 uppercase mb-1">Opportunity</p>
                  <p className="text-[10px] font-bold text-green-900 leading-tight">{factor.opportunity}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                  <p className="text-[8px] font-black text-red-700 uppercase mb-1">Threat</p>
                  <p className="text-[10px] font-bold text-red-900 leading-tight">{factor.threat}</p>
                </div>
              </div>

              {factor.sources && factor.sources.length > 0 && (
                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {factor.sources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        title={source.title}
                        className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center border-2 border-white text-[8px] font-black"
                      >
                        {idx + 1}
                      </a>
                    ))}
                  </div>
                  <span className="text-[8px] font-black text-grayMedium uppercase tracking-widest">{factor.sources.length} Bronnen</span>
                </div>
              )}
            </Card>
          )) : (
            <div className="col-span-full py-20 text-center opacity-30">
               <Globe className="h-16 w-16 mx-auto mb-4" />
               <p className="font-bold">Geen externe research gevonden. Start de AI Research in de Focus tab.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 pb-32 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Badge color="blue" className="mb-4">COCKPIT v3.0</Badge>
            <h1 className="text-5xl md:text-6xl font-black text-blackDark tracking-tight leading-none">Strategische Audit.</h1>
            <p className="text-xl text-grayDark mt-4 font-medium max-w-2xl leading-relaxed">
              Het volledige overzicht van de gaten tussen ambities, inrichting en de buitenwereld.
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="primary" className="rounded-2xl px-8 shadow-xl" onClick={handleExportPDF}>
               <Download className="h-4 w-4 mr-2" /> PDF Rapport Genereren
            </Button>
          </div>
      </div>

      {renderAlerts()}

      <Tabs 
        tabs={['Overzicht', 'Gap Matrix', 'Markt Research']} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      <div className="space-y-12">
        {activeTab === 'Overzicht' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Validated FIT', val: metrics.totalFit + '%', icon: Dna, color: 'text-primary' },
                    { label: 'Executie Score', val: metrics.executionScore + '%', icon: Clock, color: 'text-orange-500' },
                    { label: 'Strategische Dekking', val: metrics.coverageScore + '%', icon: Target, color: 'text-purple-500' },
                    { label: 'Data Betrouwbaarheid', val: metrics.dataConfidence + '%', icon: ShieldCheck, color: 'text-green-500' },
                ].map(stat => (
                    <Card key={stat.label} className="p-8 text-center bg-white hover:shadow-2xl transition-all">
                        <div className={`h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4 ${stat.color}`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <p className="text-4xl font-black text-blackDark">{stat.val}</p>
                        <p className="text-[10px] font-black text-grayMedium uppercase tracking-widest mt-2">{stat.label}</p>
                    </Card>
                ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <Card title="Strategische Risico-Heatmap" subtitle="IMPACT VS. WAARSCHIJNLIJKHEID" className="border-none shadow-xl bg-white overflow-hidden group h-96">
                <div className="relative h-full w-full mt-4 flex border-l-2 border-b-2 border-gray-100">
                   <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                      <div className="bg-orange-50/20 border border-gray-50/50"></div>
                      <div className="bg-red-500/10 border border-gray-50/50 shadow-inner"></div>
                      <div className="bg-green-50/20 border border-gray-50/50"></div>
                      <div className="bg-orange-50/20 border border-gray-50/50"></div>
                   </div>
                   {data.actions.map((action, i) => {
                     const likelihood = action.riskLevel === 'High' ? 4 : action.riskLevel === 'Medium' ? 3 : 1;
                     return (
                       <div 
                         key={action.id}
                         className={`absolute h-8 w-8 rounded-full border-2 border-white shadow-xl flex items-center justify-center cursor-help transition-all hover:scale-150 z-10
                          ${action.riskLevel === 'High' ? 'bg-red-500' : action.riskLevel === 'Medium' ? 'bg-orange-500' : 'bg-green-500'}`}
                         style={{ 
                           bottom: `${(action.impact / 5) * 80}%`, 
                           left: `${(likelihood / 5) * 80 + (i * 2)}%` 
                         }}
                       >
                       </div>
                     )
                   })}
                   <div className="absolute -left-10 top-1/2 -rotate-90 text-[8px] font-black text-grayMedium uppercase tracking-widest">Impact</div>
                   <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[8px] font-black text-grayMedium uppercase tracking-widest">Kans</div>
                </div>
              </Card>

              <Card title="Digital Maturity Audit" subtitle="TECHNISCHE GEREEDSCHAPSSKIST" className="border-none shadow-xl bg-white overflow-hidden h-96 flex flex-col justify-center items-center">
                  <div className="relative h-56 w-56 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="112" cy="112" r="90" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-grayLight" />
                        <circle cx="112" cy="112" r="90" stroke="currentColor" strokeWidth="16" fill="transparent" strokeDasharray={565.48} strokeDashoffset={565.48 * (1 - (data.inrichting.resources.digitalMaturity || 65) / 100)} className="text-primary transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <p className="text-5xl font-black text-blackDark">{data.inrichting.resources.digitalMaturity || 65}%</p>
                        <p className="text-[10px] font-black text-grayMedium uppercase">Readiness</p>
                    </div>
                  </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'Gap Matrix' && renderGapMatrix()}
        {activeTab === 'Markt Research' && renderExternalDashboard()}
      </div>

      <Modal isOpen={!!selectedGap} onClose={() => setSelectedGap(null)} title="Gap Detail Analyse">
        {selectedGap && (
          <div className="space-y-8">
            <div className="p-8 bg-primary rounded-[2.5rem] text-white">
              <h3 className="text-2xl font-black mb-4">{selectedGap.goal}</h3>
              <p className="text-sm font-medium opacity-90 leading-relaxed italic">"{selectedGap.aiInsight || 'Geen AI inzicht beschikbaar.'}"</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Structuur', fit: selectedGap.structureFit },
                { label: 'Middelen', fit: selectedGap.resourcesFit },
                { label: 'Cultuur', fit: selectedGap.cultureFit },
                { label: 'Mensen', fit: selectedGap.peopleFit },
              ].map(item => (
                <div key={item.label} className={`p-6 rounded-3xl flex items-center justify-between border-2 ${
                  item.fit === 'Good' ? 'bg-green-50 border-green-100 text-green-700' :
                  item.fit === 'Partial' ? 'bg-orange-50 border-orange-100 text-orange-700' :
                  'bg-red-50 border-red-100 text-red-700'
                }`}>
                  <span className="text-[10px] font-black uppercase">{item.label}</span>
                  <span className="text-xs font-black">{item.fit}</span>
                </div>
              ))}
            </div>

            <div className="p-8 bg-grayLight/30 rounded-[2.5rem]">
               <p className="text-[10px] font-black text-grayMedium uppercase mb-2">Aanbevolen Strategische Actie</p>
               <h4 className="font-black text-blackDark mb-2">{selectedGap.actionTitle}</h4>
               <p className="text-xs text-grayDark leading-relaxed">{selectedGap.actionDescription}</p>
            </div>

            <Button className="w-full py-6 rounded-2xl" onClick={() => { onNavigate(View.TRANSITIE); setSelectedGap(null); }}>
              Plan Actie In Transitie Engine
            </Button>
          </div>
        )}
      </Modal>

      <div className="flex justify-center pt-20 pb-20">
         <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-2xl text-center max-w-3xl space-y-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 opacity-5">
               <Sparkles className="h-64 w-64 text-primary" />
            </div>
            <h3 className="text-3xl font-black text-blackDark">Optimaliseer je executiekracht.</h3>
            <p className="text-lg text-grayDark leading-relaxed">
              De analyses laten zien waar de verbeterpunten liggen. Gebruik de Transitie Engine om de vertaling naar de dagelijkse operatie te maken.
            </p>
            <div className="flex justify-center gap-6">
               <Button size="lg" className="rounded-2xl px-12" onClick={() => onNavigate(View.TRANSITIE)}>Naar Actieplan</Button>
               <Button variant="outline" size="lg" className="rounded-2xl px-12" onClick={() => onNavigate(View.DASHBOARD)}>Cockpit Overzicht</Button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Analyse;
