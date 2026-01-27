
import React, { useState } from 'react';
import { AppData, View, StrategicGoal, ValueWheel, Domain, ExternalFactor, ActionItem } from '../types';
import { Card, Badge, Button, Tabs } from '../components/Shared';
import { 
  BarChart3, 
  Target, 
  Layers, 
  Zap, 
  TrendingUp, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  ArrowRight,
  Info,
  Sparkles,
  PieChart,
  Calendar,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  ZapOff
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

interface Props {
  data: AppData;
  onNavigate: (view: View) => void;
  onUpdate: (data: Partial<AppData>) => void;
}

const Analyse: React.FC<Props> = ({ data, onNavigate }) => {
  const [horizon, setHorizon] = useState<'Kort' | 'Middellang' | 'Lang'>('Middellang');

  // Helper: Status calculations
  const getGoalStatus = (goal: StrategicGoal) => {
    const hasKpi = !!goal.kpiId;
    const hasAction = data.actions.some(a => a.linkedId === goal.id);
    if (hasKpi && hasAction) return 'Good';
    if (hasKpi || hasAction) return 'Partial';
    return 'Bad';
  };

  const getRealizationRate = (goal: StrategicGoal) => {
    const linkedActions = data.actions.filter(a => a.linkedId === goal.id);
    if (linkedActions.length === 0) return 0;
    const completed = linkedActions.filter(a => a.status === 'done').length;
    return Math.round((completed / linkedActions.length) * 100);
  };

  const renderRiskHeatmap = () => {
    return (
      <Card title="Strategische Risico-Heatmap" subtitle="IMPACT VS. WAARSCHIJNLIJKHEID" className="border-none shadow-xl bg-white overflow-hidden group">
        <div className="relative h-80 w-full mt-4 flex border-l-2 border-b-2 border-gray-100">
           {/* Grid Background */}
           <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
              <div className="bg-orange-50/20 border border-gray-50/50"></div>
              <div className="bg-red-500/10 border border-gray-50/50 shadow-inner"></div>
              <div className="bg-green-50/20 border border-gray-50/50"></div>
              <div className="bg-orange-50/20 border border-gray-50/50"></div>
           </div>
           
           {/* High Impact / High Likelihood (Red Zone) */}
           <div className="absolute top-4 right-4 text-center">
              <Badge color="red" className="shadow-lg">CRITICAL ZONE</Badge>
           </div>

           {/* Data Points (Simulation of actions and threats) */}
           {data.actions.map((action, i) => (
             <div 
               key={action.id}
               className={`absolute h-8 w-8 rounded-full border-2 border-white shadow-xl flex items-center justify-center cursor-help transition-all hover:scale-150 z-10
                ${action.riskLevel === 'High' ? 'bg-red-500' : action.riskLevel === 'Medium' ? 'bg-orange-500' : 'bg-green-500'}`}
               style={{ 
                 bottom: `${(action.impact / 5) * 80}%`, 
                 left: `${i * 15 + 10}%` 
               }}
             >
                <div className="absolute top-full mt-2 bg-blackDark text-white p-2 rounded-lg text-[8px] font-black whitespace-nowrap opacity-0 group-hover:opacity-100">
                  {action.title}
                </div>
             </div>
           ))}

           <div className="absolute -left-10 top-1/2 -rotate-90 text-[8px] font-black text-grayMedium uppercase tracking-widest">Impact</div>
           <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[8px] font-black text-grayMedium uppercase tracking-widest">Waarschijnlijkheid</div>
        </div>
        <div className="mt-8 flex items-center gap-4 p-4 bg-red-50 rounded-2xl border border-red-100">
           <ShieldAlert className="h-5 w-5 text-red-600" />
           <p className="text-xs font-bold text-red-900 leading-tight">
             Kritiek Risico: De combinatie van 'Mensen' mismatch en de agressieve deadline van Q3 2025 creëert een 80% kans op vertraging.
           </p>
        </div>
      </Card>
    );
  };

  const renderDigitalMaturity = () => (
    <Card title="Digital Maturity Audit" subtitle="TECHNISCHE GEREEDSCHAPSSKIST" className="border-none shadow-xl bg-white overflow-hidden">
        <div className="flex items-center justify-center py-10 relative">
            <div className="relative h-48 w-48 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-grayLight" />
                  <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={502.4} strokeDashoffset={502.4 * (1 - (data.inrichting.resources.digitalMaturity || 65) / 100)} className="text-primary transition-all duration-1000" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-4xl font-black text-blackDark">{data.inrichting.resources.digitalMaturity || 65}%</p>
                  <p className="text-[10px] font-black text-grayMedium uppercase">Gereed</p>
               </div>
            </div>
        </div>
        <div className="space-y-4">
           <div className="flex justify-between items-center text-xs font-bold border-b border-gray-50 pb-3">
              <span className="text-grayMedium uppercase">Data Integriteit</span>
              <Badge color="green">High</Badge>
           </div>
           <div className="flex justify-between items-center text-xs font-bold border-b border-gray-50 pb-3">
              <span className="text-grayMedium uppercase">Cloud Ready</span>
              <Badge color="blue">Partial</Badge>
           </div>
           <div className="flex justify-between items-center text-xs font-bold border-b border-gray-50 pb-3">
              <span className="text-grayMedium uppercase">AI Potentieel</span>
              <Badge color="purple">Emerging</Badge>
           </div>
        </div>
    </Card>
  );

  const renderGoalsTable = () => (
    <Card className="overflow-hidden border-none shadow-xl" title="Strategische Realisatie">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-4 font-black text-[10px] text-grayMedium uppercase tracking-widest">Doelstelling</th>
              <th className="py-4 font-black text-[10px] text-grayMedium uppercase tracking-widest">Status</th>
              <th className="py-4 font-black text-[10px] text-grayMedium uppercase tracking-widest text-center">Voortgang</th>
              <th className="py-4 font-black text-[10px] text-grayMedium uppercase tracking-widest">AI Inzicht</th>
            </tr>
          </thead>
          <tbody>
            {data.strategicGoals.map(goal => {
              const status = getGoalStatus(goal);
              const rate = getRealizationRate(goal);
              return (
                <tr key={goal.id} className="group hover:bg-grayLight/20 transition-colors">
                  <td className="py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-blackDark text-sm leading-tight">{goal.description}</span>
                      <span className="text-[9px] font-black text-primary uppercase mt-1 tracking-tight">{goal.wheel} • {goal.term}</span>
                    </div>
                  </td>
                  <td className="py-5">
                    {status === 'Good' && <Badge color="green"><CheckCircle2 className="h-3 w-3 mr-1" /> OPTIMAAL</Badge>}
                    {status === 'Partial' && <Badge color="yellow"><AlertTriangle className="h-3 w-3 mr-1" /> INCOMPLETE</Badge>}
                    {status === 'Bad' && <Badge color="red"><XCircle className="h-3 w-3 mr-1" /> KRITIEK</Badge>}
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-24 h-2 bg-grayLight rounded-full overflow-hidden">
                        <div className={`h-full ${rate === 100 ? 'bg-green-500' : 'bg-primary'} transition-all`} style={{ width: `${rate}%` }}></div>
                      </div>
                      <span className="text-[10px] font-black">{rate}%</span>
                    </div>
                  </td>
                  <td className="py-5">
                    <p className="text-[11px] font-medium text-grayDark italic leading-relaxed max-w-xs">
                      {status === 'Bad' ? "Dit doel mist zowel een KPI als een concrete actie. Risico op stilstand." : 
                       !goal.kpiId ? "KPI ontbreekt; succes is momenteel niet meetbaar." :
                       !data.actions.some(a => a.linkedId === goal.id) ? "Geen acties gekoppeld; executie ontbreekt." :
                       "Goede koppeling tussen doel, KPI en uitvoering."}
                    </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );

  return (
    <div className="space-y-16 pb-32 reveal visible">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Badge color="blue" className="mb-4">SYSTEM INTELLIGENCE</Badge>
            <h1 className="text-5xl md:text-6xl font-black text-blackDark tracking-tight leading-none">Analyse Cockpit.</h1>
            <p className="text-xl text-grayDark mt-4 font-medium max-w-2xl leading-relaxed">
              Het volledige overzicht van je strategische realiteit. Van externe trends tot interne inrichting en executiekracht.
            </p>
          </div>
          <Button variant="outline" className="rounded-2xl px-8 border-gray-200" onClick={() => window.print()}>
             Exporteer PDF Rapport <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         {renderRiskHeatmap()}
         {renderDigitalMaturity()}
      </div>

      <section className="space-y-10">
         <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
               <Target className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-black text-blackDark">Doelen & Realisatie</h2>
         </div>
         {renderGoalsTable()}
      </section>

      <div className="flex justify-center pt-20">
         <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-2xl text-center max-w-3xl space-y-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 opacity-5">
               <Sparkles className="h-64 w-64 text-primary" />
            </div>
            <h3 className="text-3xl font-black text-blackDark">Klaar voor de volgende stap?</h3>
            <p className="text-lg text-grayDark leading-relaxed">
              De Analyse Cockpit laat zien waar de kansen liggen. Gebruik deze inzichten om je Transitie-plan aan te scherpen of je Focus te verleggen.
            </p>
            <div className="flex justify-center gap-6">
               <Button size="lg" className="rounded-2xl px-12" onClick={() => onNavigate(View.TRANSITIE)}>Update Acties</Button>
               <Button variant="outline" size="lg" className="rounded-2xl px-12" onClick={() => onNavigate(View.DASHBOARD)}>Terug naar Cockpit</Button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Analyse;
