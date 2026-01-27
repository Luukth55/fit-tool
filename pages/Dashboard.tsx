
import React, { useState, useEffect } from 'react';
import { AppData, View } from '../types';
import { Card, Button, Badge } from '../components/Shared';
import { 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Target, 
  Zap, 
  Globe,
  Share2,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { getSystemWidePrioritization } from '../services/geminiService';

interface Props {
  data: AppData;
  onNavigate: (view: View) => void;
  onUpdate: (data: Partial<AppData>) => void;
}

const Dashboard: React.FC<Props> = ({ data, onNavigate, onUpdate }) => {
  const [aiInsight, setAiInsight] = useState<string>("Inzichten ophalen...");
  const [loadingInsight, setLoadingInsight] = useState(true);
  
  const activeActions = data.actions.filter(a => a.status !== 'done');
  const avgFitScore = (data.fitCheckScores.reduce((acc, curr) => acc + curr.score, 0) / (data.fitCheckScores.length || 1)).toFixed(1);

  useEffect(() => {
    setLoadingInsight(true);
    getSystemWidePrioritization(data).then(res => {
      setAiInsight(res);
      setLoadingInsight(false);
    });
  }, [data]);

  const trendData = data.history.length > 0 ? data.history.map(h => ({
    month: h.date,
    score: h.totalFitScore
  })) : [
    { month: 'Jan', score: 2.0 },
    { month: 'Feb', score: 2.5 },
    { month: 'Mar', score: 2.8 },
    { month: 'Apr', score: parseFloat(avgFitScore) || 3.0 },
  ];

  return (
    <div className="space-y-12 animate-fade-in-up">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <Badge color="indigo" className="mb-4">Real-time Management</Badge>
          <h1 className="text-5xl md:text-6xl font-black text-blackDark tracking-tight leading-tight">
            Strategisch <span className="text-primary">Cockpit.</span>
          </h1>
          <p className="text-lg text-grayDark mt-4 font-medium leading-relaxed">
            Welkom terug. Hieronder vind je de actuele status van de organisatie-fit, lopende transformaties en directe AI-aanbevelingen.
          </p>
        </div>
        <div className="flex gap-4 shrink-0">
          <Button variant="outline" size="lg" onClick={() => onNavigate(View.FITCHECK)}>
             <ShieldCheck className="h-5 w-5 mr-2 text-green-600" /> Audit Rapport
          </Button>
          <Button onClick={() => onNavigate(View.ANALYSE)} size="lg" className="px-10 group">
             System Analyse <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <Card className="bg-primary text-white border-none shadow-2xl shadow-blue-500/30 flex flex-col justify-between overflow-hidden relative group h-64">
              <div className="absolute -right-8 -top-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                <LayoutDashboard className="h-48 w-48" />
              </div>
              <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Organisatie FIT Score</p>
                  <div className="flex items-baseline gap-2 mt-4">
                    <p className="text-7xl font-black tracking-tighter">{avgFitScore}</p>
                    <span className="text-2xl font-bold opacity-50">/ 5</span>
                  </div>
              </div>
              <div className="mt-auto flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 relative z-10">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                  Trend: +0.4 deze maand
              </div>
          </Card>
          
          {[
              { label: "Strategie Focus", value: data.strategicGoals.length, icon: Target, color: "text-purple-600", bg: "bg-purple-50", view: View.FOCUS, sub: "Actieve doelen" },
              { label: "Executie Flow", value: activeActions.length, icon: Clock, color: "text-orange-600", bg: "bg-orange-50", view: View.TRANSITIE, sub: "Open acties" },
              { label: "Mijlpalen", value: data.actions.filter(a => a.status === 'done').length, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", view: View.TRANSITIE, sub: "Voltooid" },
          ].map((stat, i) => (
              <Card key={i} className="flex flex-col justify-between cursor-pointer group hover:bg-white h-64" onClick={() => onNavigate(stat.view)}>
                  <div className={`h-14 w-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
                      <stat.icon className="h-7 w-7" />
                  </div>
                  <div className="mt-auto">
                      <p className="text-[10px] font-black text-grayMedium uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-4xl font-black text-blackDark tracking-tighter">{stat.value}</p>
                          <p className="text-[10px] font-bold text-grayMedium uppercase mt-1 tracking-widest">{stat.sub}</p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-grayLight flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </div>
                  </div>
              </Card>
          ))}
      </div>

      {/* Main Analysis Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-2" title="Grip op Ontwikkeling" subtitle="SCORE-HISTORIE PER MAAND">
          <div className="h-[380px] w-full pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 800}} dy={10} />
                <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 800}} />
                <Tooltip 
                  contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)', fontWeight: 'bold', padding: '1.5rem'}} 
                  itemStyle={{color: '#3B82F6'}}
                />
                <Area type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={6} fillOpacity={1} fill="url(#colorScore)" dot={{ r: 6, fill: '#3B82F6', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Strategische Co-piloot" subtitle="AI GENERATED PRIORITIES" className="border-none shadow-2xl shadow-indigo-500/10 relative overflow-hidden bg-white">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Sparkles className="h-32 w-32 text-indigo-600" />
           </div>
           <div className="flex flex-col h-full relative z-10">
              <div className="flex gap-5 mb-8">
                 <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
                    <Zap className="h-7 w-7 fill-current" />
                 </div>
                 <div className="space-y-6">
                    {loadingInsight ? (
                       <div className="space-y-4">
                          <div className="h-4 w-full bg-grayLight rounded-full animate-pulse"></div>
                          <div className="h-4 w-5/6 bg-grayLight rounded-full animate-pulse"></div>
                          <div className="h-4 w-4/6 bg-grayLight rounded-full animate-pulse"></div>
                       </div>
                    ) : (
                       <p className="text-base font-bold text-grayDark leading-relaxed italic border-l-4 border-indigo-100 pl-6 py-2">
                          "{aiInsight}"
                       </p>
                    )}
                 </div>
              </div>
              
              <div className="mt-auto space-y-4">
                <div className="p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                   <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-2">Advies status</p>
                   <p className="text-xs font-bold text-indigo-900 leading-tight">Focus deze week op de 'Mensen' tab om de daling in eNPS te adresseren.</p>
                </div>
                <Button variant="primary" className="w-full text-xs font-black border-none rounded-2xl py-5 hover:scale-105 transition-all" onClick={() => onNavigate(View.FITCHECK)}>
                   BEKIJK VOLLEDIGE ANALYSE
                </Button>
              </div>
           </div>
        </Card>
      </div>

      {/* Secondary Data Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Card title="Kritieke Acties" subtitle="URGENTE DEADLINES & IMPACT">
             <div className="space-y-5 pt-4">
                {activeActions.length > 0 ? activeActions.sort((a,b) => b.impact - a.impact).slice(0, 3).map(action => (
                    <div key={action.id} className="p-6 bg-grayLight/30 border-2 border-transparent rounded-[2rem] flex items-center justify-between hover:border-primary/20 hover:bg-white transition-all cursor-pointer group" onClick={() => onNavigate(View.TRANSITIE)}>
                        <div className="flex items-center gap-6">
                            <div className={`h-12 w-1 w-2 rounded-full ${action.impact >= 4 ? 'bg-red-500 shadow-lg shadow-red-200' : 'bg-primary shadow-lg shadow-blue-200'} group-hover:scale-y-110 transition-transform`} />
                            <div>
                                <p className="text-base font-black text-blackDark tracking-tight">{action.title}</p>
                                <div className="flex items-center gap-4 mt-2">
                                  <Badge color={action.impact >= 4 ? 'red' : 'blue'}>Impact: {action.impact}/5</Badge>
                                  <span className="text-[10px] text-grayMedium font-black uppercase tracking-widest">{action.owner} • {action.deadline}</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-grayMedium group-hover:text-primary group-hover:scale-110 transition-all shadow-sm">
                            <ChevronRight className="h-6 w-6" />
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-16 bg-grayLight/20 rounded-[2rem]">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6 opacity-20" />
                        <p className="text-sm font-black text-grayMedium italic uppercase tracking-widest">Alle kritieke acties afgerond</p>
                    </div>
                )}
                <Button variant="ghost" className="w-full mt-4" onClick={() => onNavigate(View.TRANSITIE)}>Alle acties bekijken</Button>
             </div>
          </Card>

          <Card title="Markt & Omgevingsmonitor" subtitle="EXTERNE RESEARCH INZICHTEN">
             <div className="space-y-5 pt-4">
                {data.externalAnalysis.length > 0 ? data.externalAnalysis.slice(0, 3).map(factor => (
                    <div key={factor.id} className="flex items-center justify-between p-6 rounded-[2rem] bg-white border border-gray-100 hover:shadow-xl transition-all group cursor-pointer" onClick={() => onNavigate(View.FOCUS)}>
                        <div className="flex items-center gap-5 overflow-hidden">
                            <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:rotate-6 transition-transform">
                                <Globe className="h-7 w-7" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-base font-black text-blackDark truncate tracking-tight">{factor.factor}</p>
                                <p className="text-[10px] text-grayMedium font-black uppercase tracking-widest mt-1 truncate">
                                   Trend: {factor.futureTrend}
                                </p>
                            </div>
                        </div>
                        <Badge color="blue" className="ml-4 shrink-0">{factor.category}</Badge>
                    </div>
                )) : (
                    <div className="text-center py-16 bg-blue-50/30 rounded-[2rem] border border-dashed border-blue-100">
                        <Globe className="h-16 w-16 text-blue-300 mx-auto mb-6 animate-pulse" />
                        <p className="text-sm font-black text-grayMedium italic uppercase tracking-widest">Geen research data beschikbaar</p>
                        <Button variant="outline" size="sm" onClick={() => onNavigate(View.FOCUS)} className="mt-6">Activeer Research</Button>
                    </div>
                )}
                {data.externalAnalysis.length > 0 && (
                    <Button variant="ghost" className="w-full mt-4" onClick={() => onNavigate(View.FOCUS)}>Volledige research openen</Button>
                )}
             </div>
          </Card>
      </div>
    </div>
  );
};

export default Dashboard;
