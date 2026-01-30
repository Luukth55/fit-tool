
import React, { useState, useMemo, memo, useCallback, useRef, useEffect } from 'react';
import { AppData, View, AIAlert, ActionItem } from '../types';
import { Card, Button, Badge, Modal } from '../components/Shared';
import { calculateReliableFitScore, generateSystemAlerts, ReliableFitMetrics } from '../services/analysisUtils';
import { 
  ArrowRight, 
  Clock, 
  Target, 
  Activity, 
  AlertTriangle, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  ChevronRight,
  Info,
  BarChart3,
  Dna,
  Bell,
  Sparkles
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// --- PERFORMANCE HELPERS ---

/**
 * Simple deep equality check for dependency tracking
 */
const isDeepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key) || !isDeepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
};

/**
 * Custom hook for deep memoization of expensive calculations (like FIT scores)
 */
function useDeepMemo<T>(factory: () => T, deps: any[]): T {
  const ref = useRef<{ deps: any[]; value: T } | undefined>(undefined);
  
  if (!ref.current || !isDeepEqual(ref.current.deps, deps)) {
    ref.current = {
      deps,
      value: factory()
    };
  }
  
  return ref.current.value;
}

// --- MEMOIZED SUB-COMPONENTS ---

/**
 * Memoized Fit Score Card (Primary Dashboard Visual)
 * Only re-renders if metrics or status change.
 */
const FitScoreCard = memo(({ metrics, onDeepDive }: { metrics: ReliableFitMetrics, onDeepDive: () => void }) => (
  <Card 
    onClick={onDeepDive}
    className="bg-primary text-white border-none shadow-2xl shadow-blue-500/30 flex flex-col justify-between h-72 relative overflow-hidden group"
  >
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
        <Dna className="h-32 w-32" />
      </div>
      <div>
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Calculated FIT Score</p>
            <TrendingUp className="h-4 w-4 text-white opacity-40" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-7xl font-black tracking-tighter">{metrics.totalFit}%</p>
          </div>
      </div>
      <div className="mt-auto space-y-4">
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
            <div className="bg-white h-full transition-all duration-1000" style={{ width: `${metrics.totalFit}%` }}></div>
          </div>
          <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${metrics.status === 'Optimaal' ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}></div>
                Status: {metrics.status}
              </p>
              <Info className="h-3.5 w-3.5 opacity-50" />
          </div>
      </div>
  </Card>
));

/**
 * Generic Stat Card for Dashboard
 */
const DashboardStatCard = memo(({ 
  icon: Icon, 
  bg: bgClass, 
  color: colorClass, 
  label, 
  value, 
  subtitle, 
  onClick, 
  footerLabel 
}: {
  icon: any,
  bg: string,
  color: string,
  label: string,
  value: string | number,
  subtitle: React.ReactNode,
  onClick: () => void,
  footerLabel: string
}) => (
  <Card 
    onClick={onClick}
    className="flex flex-col justify-between h-72 cursor-pointer hover:bg-white group"
  >
      <div className={`h-14 w-14 ${bgClass} ${colorClass} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className="h-8 w-8" />
      </div>
      <div>
          <p className="text-[10px] font-black text-grayMedium uppercase tracking-widest mb-1">{label}</p>
          <p className="text-4xl font-black text-blackDark">{value}</p>
          <div className="mt-1">{subtitle}</div>
      </div>
      <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center text-grayMedium group-hover:text-primary transition-colors">
         <span className="text-[9px] font-black uppercase tracking-widest">{footerLabel}</span>
         <ChevronRight className="h-4 w-4" />
      </div>
  </Card>
));

/**
 * Memoized History Chart with disabled animations for better performance
 */
const HistoryChart = memo(({ data }: { data: any[] }) => (
  <div className="h-80 w-full pt-6">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis dataKey="date" hide />
        <YAxis domain={[0, 5]} hide />
        <Tooltip 
          isAnimationActive={false}
          contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '1.5rem'}}
          itemStyle={{fontWeight: '900', color: '#111827'}}
        />
        <Area 
          type="monotone" 
          dataKey="totalFitScore" 
          name="FIT Score" 
          stroke="#3B82F6" 
          strokeWidth={6} 
          fill="url(#colorScore)" 
          isAnimationActive={false} 
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
));

/**
 * Individual Alert Item
 */
const AlertItem = memo(({ alert, onClick }: { alert: AIAlert, onClick: () => void }) => (
  <div 
    className={`p-4 rounded-2xl border transition-all hover:bg-white cursor-pointer group ${
      alert.type === 'warning' ? 'bg-red-50 border-red-100' : 
      alert.type === 'opportunity' ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100'
    }`} 
    onClick={onClick}
  >
     <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
           {alert.type === 'warning' ? <AlertTriangle className="h-3 w-3 text-red-500" /> : <Sparkles className="h-3 w-3 text-green-500" />}
           <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Prioriteit {alert.priority}</span>
        </div>
        <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all text-primary" />
     </div>
     <p className="text-[11px] font-black text-blackDark leading-tight">{alert.title}</p>
     <p className="text-[10px] text-grayDark mt-1 line-clamp-2">{alert.message}</p>
  </div>
));

// --- MAIN DASHBOARD COMPONENT ---

const Dashboard: React.FC<Props> = ({ data, onNavigate, onUpdate }) => {
  const [activeDeepDive, setActiveDeepDive] = useState<string | null>(null);
  
  // 1. Optimized calculation with Deep Memo to prevent unneeded heavy work
  const metrics = useDeepMemo(
    () => calculateReliableFitScore(data), 
    [data.strategicGoals, data.actions, data.fitCheckScores]
  );
  
  const sysAlerts = useDeepMemo(
    () => generateSystemAlerts(data), 
    [data.strategicGoals, data.actions, data.fitCheckScores]
  );
  
  const allAlerts = useMemo(() => {
    return [...sysAlerts, ...(data.alerts || [])].sort((a, b) => a.priority - b.priority);
  }, [sysAlerts, data.alerts]);
  
  const overdueActions = useMemo(() => {
    return data.actions.filter(a => a.status !== 'done' && a.deadline && new Date(a.deadline) < new Date());
  }, [data.actions]);

  const chartData = useMemo(() => {
    return data.history.length > 0 
      ? data.history 
      : [{ date: 'Start', totalFitScore: metrics.totalFit / 20 }];
  }, [data.history, metrics.totalFit]);

  // Stable callbacks to prevent child re-renders
  const handleDeepDiveFit = useCallback(() => setActiveDeepDive('fit'), []);
  const handleDeepDiveRisk = useCallback(() => setActiveDeepDive('risk'), []);
  const handleNavFocus = useCallback(() => onNavigate(View.FOCUS), [onNavigate]);
  const handleNavAnalyse = useCallback(() => onNavigate(View.ANALYSE), [onNavigate]);
  const handleNavTransitie = useCallback(() => onNavigate(View.TRANSITIE), [onNavigate]);
  const handleCloseModal = useCallback(() => setActiveDeepDive(null), []);

  // Performance Monitoring
  useEffect(() => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      console.debug(`Dashboard render performance: ${(end - start).toFixed(2)}ms`);
    };
  });

  const renderDeepDiveContent = () => {
    switch(activeDeepDive) {
      case 'fit':
        return (
          <div className="space-y-6">
            <div className="p-8 bg-primary rounded-[2.5rem] text-white flex justify-between items-center shadow-2xl shadow-blue-500/20">
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Validated System Fit</p>
                 <h3 className="text-5xl font-black">{metrics.totalFit}%</h3>
               </div>
               <Activity className="h-16 w-16 opacity-20" />
            </div>
            <div className="grid grid-cols-1 gap-4">
               {[
                 { name: 'Domein', val: metrics.domainScore, weight: '40%' },
                 { name: 'Executie', val: metrics.executionScore, weight: '30%' },
                 { name: 'Dekking', val: metrics.coverageScore, weight: '30%' },
               ].map((item, i) => (
                 <div key={i} className="p-6 bg-grayLight/30 rounded-3xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-blackDark text-sm uppercase">{item.name}</h4>
                      <p className="text-[10px] text-grayMedium font-bold">Weging: {item.weight}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${item.val}%` }}></div>
                      </div>
                      <span className="text-lg font-black text-blackDark">{item.val}%</span>
                    </div>
                 </div>
               ))}
            </div>
            <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl">
               <p className="text-xs font-bold text-primary flex items-center gap-2 mb-2 uppercase tracking-widest">
                 <ShieldCheck className="h-4 w-4" /> Conclusie
               </p>
               <p className="text-sm font-medium text-blue-900 leading-relaxed italic">
                 "{metrics.breakdown}"
               </p>
            </div>
          </div>
        );
      case 'risk':
        return (
          <div className="space-y-6">
             <div className="p-8 bg-orange-500 rounded-[2.5rem] text-white flex justify-between items-center">
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Executie Vertraging</p>
                 <h3 className="text-5xl font-black">{overdueActions.length}</h3>
               </div>
               <Clock className="h-16 w-16 opacity-20" />
            </div>
            <div className="space-y-4">
              <p className="text-xs font-black text-grayMedium uppercase tracking-widest px-2">Achterstallige Acties</p>
              {overdueActions.length > 0 ? overdueActions.map(action => (
                <div key={action.id} className="p-5 bg-white border border-red-100 rounded-3xl flex items-center justify-between shadow-sm">
                  <div>
                    <h4 className="font-black text-blackDark text-sm">{action.title}</h4>
                    <p className="text-[10px] text-red-500 font-bold uppercase mt-1">Deadline: {action.deadline}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-grayMedium" />
                </div>
              )) : (
                <div className="p-10 text-center opacity-30 italic">Geen achterstallige acties gedetecteerd.</div>
              )}
            </div>
            <Button className="w-full" onClick={handleNavTransitie}>Beheer Transitie</Button>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-12 animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Badge color="blue">System Live: Online</Badge>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100 text-[9px] font-black uppercase">
               <ShieldCheck className="h-3 w-3" /> Validated Data
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-blackDark tracking-tight leading-tight">
            Strategy <span className="text-primary">Cockpit.</span>
          </h1>
          <p className="text-lg text-grayDark mt-4 font-medium max-w-2xl">
            Real-time monitoring van de strategische gezondheid via de FIT Engine.
          </p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" onClick={handleNavAnalyse} className="px-10">Numerical Analysis</Button>
           <Button onClick={handleNavTransitie} className="px-10 group">Execute Actions <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FitScoreCard metrics={metrics} onDeepDive={handleDeepDiveFit} />

          <DashboardStatCard 
            icon={Clock}
            bg="bg-orange-50"
            color="text-orange-600"
            label="Executie Risico"
            value={overdueActions.length}
            subtitle={
              <p className="text-[10px] font-bold text-red-500 mt-1 uppercase flex items-center gap-1">
                {overdueActions.length > 0 && <AlertTriangle className="h-3 w-3" />}
                {overdueActions.length} achterstallige acties
              </p>
            }
            onClick={handleDeepDiveRisk}
            footerLabel="Klik voor actielijst"
          />

          <DashboardStatCard 
            icon={Target}
            bg="bg-purple-50"
            color="text-purple-600"
            label="Strategische Focus"
            value={data.strategicGoals.length}
            subtitle={
              <>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-3">
                  <div className="bg-purple-500 h-full" style={{ width: `${metrics.coverageScore}%` }}></div>
                </div>
                <p className="text-[10px] font-bold text-grayMedium mt-2 uppercase">Dekking: {metrics.coverageScore}%</p>
              </>
            }
            onClick={handleNavFocus}
            footerLabel="Naar focus module"
          />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <Card className="lg:col-span-2" title="Gevalideerde FIT Trend" subtitle="HISTORISCHE EVOLUTIE">
              <HistoryChart data={chartData} />
          </Card>

          <Card title="AI Live Insights" subtitle="RECENTE ALERTS & KANSEN" className="flex flex-col overflow-hidden">
             <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                {allAlerts.slice(0, 4).map((alert, idx) => (
                  <AlertItem 
                    key={alert.id || idx} 
                    alert={alert} 
                    onClick={() => alert.actionView && onNavigate(alert.actionView)} 
                  />
                ))}
                {allAlerts.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 text-center py-10">
                    <Bell className="h-10 w-10 mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest">Geen actieve alerts</p>
                  </div>
                )}
             </div>
             <Button variant="ghost" className="w-full mt-4 text-[10px]" onClick={handleNavAnalyse}>
                Bekijk alle analyses <ArrowRight className="h-3 w-3 ml-2" />
             </Button>
          </Card>
      </div>

      <Modal 
        isOpen={!!activeDeepDive} 
        onClose={handleCloseModal} 
        title={activeDeepDive === 'fit' ? 'FIT Score Analyse' : 'Risico Analyse'}
      >
        {renderDeepDiveContent()}
      </Modal>
    </div>
  );
};

export default memo(Dashboard);
