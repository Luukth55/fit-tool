
import React, { useState, useMemo, memo, useCallback } from 'react';
import { AppData, OrganizationProfile, PerformanceMetric, Stakeholder, StrategicGoal, ValueWheel, View } from '../types';
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
  Download,
  Zap,
  ChevronRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';

interface Props {
  data: AppData;
  onUpdate: (data: Partial<AppData>) => void;
  onNavigate: (view: View) => void;
}

type FocusModule = 'profile' | 'identity' | 'performance' | 'external';

const MetricCard = memo(({ metric, growth, onBenchmark, onUpdateValue }: { 
  metric: PerformanceMetric, 
  growth: number | null, 
  onBenchmark: (m: PerformanceMetric) => void,
  onUpdateValue: (id: string, year: string, val: string) => void
}) => {
  const chartData = useMemo(() => metric.values.map(v => ({ year: v.year, value: parseFloat(v.value) || 0 })), [metric.values]);

  return (
    <div className="p-8 bg-grayLight/20 rounded-[2.5rem] border border-gray-100 hover:bg-white hover:shadow-xl transition-all group">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-3">
                <h4 className="text-lg font-black text-blackDark leading-tight">{metric.name}</h4>
                <div className="flex items-center gap-2 mt-2">
                    {growth !== null && (
                        <Badge color={growth >= 0 ? 'green' : 'red'} className="text-[8px]">
                            {growth >= 0 ? <TrendingUp className="h-2 w-2 mr-1" /> : <TrendingDown className="h-2 w-2 mr-1" />}
                            {Math.abs(growth)}% Groei
                        </Badge>
                    )}
                    <button 
                        onClick={() => onBenchmark(metric)}
                        className="text-[10px] font-black text-primary hover:underline flex items-center gap-1 uppercase tracking-tighter"
                    >
                        <Globe className="h-3 w-3" /> Benchmark
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
                            onChange={(e) => onUpdateValue(metric.id, v.year, e.target.value)}
                        />
                        <span className="text-[10px] font-bold text-grayMedium">{metric.unit}</span>
                    </div>
                ))}
            </div>

            <div className="md:col-span-4 h-24">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fill="#3B82F6" fillOpacity={0.1} isAnimationActive={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
});

const Focus: React.FC<Props> = ({ data, onUpdate, onNavigate }) => {
  const [activeModule, setActiveModule] = useState<FocusModule>('profile');
  const [activeWheel, setActiveWheel] = useState<ValueWheel>(ValueWheel.FINANCIAL);
  
  const updateMetricValue = useCallback((metricId: string, year: string, value: string) => {
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
  }, [data.performanceMetrics, onUpdate]);

  const wheelData = useMemo(() => [
    { id: ValueWheel.FINANCIAL, label: 'Financieel', color: 'blue', icon: Briefcase },
    { id: ValueWheel.CUSTOMER, label: 'Klant', color: 'green', icon: Users },
    { id: ValueWheel.EMPLOYEE, label: 'Medewerker', color: 'yellow', icon: Sparkles },
    { id: ValueWheel.ORGANIZATION, label: 'Organisatie', color: 'purple', icon: Settings },
    { id: ValueWheel.SOCIAL, label: 'Maatschappelijk', color: 'pink', icon: Globe },
  ], []);

  const metricsInWheel = useMemo(() => {
    return data.performanceMetrics.filter(m => m.wheel === activeWheel);
  }, [data.performanceMetrics, activeWheel]);

  return (
    <div className="pb-32 space-y-10">
      {/* Visual navigation and Header logic remains standard */}
      <div className="max-w-7xl mx-auto">
        {activeModule === 'performance' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {wheelData.map(w => (
                <button
                  key={w.id}
                  onClick={() => setActiveWheel(w.id)}
                  className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-3 ${activeWheel === w.id ? 'bg-primary/5 border-primary shadow-xl' : 'bg-white border-gray-100'}`}
                >
                  <w.icon className="h-6 w-6" />
                  <span className="text-[10px] font-black uppercase">{w.label}</span>
                </button>
              ))}
            </div>

            <Card>
              <div className="space-y-6">
                {metricsInWheel.map(metric => (
                  <MetricCard 
                    key={metric.id} 
                    metric={metric} 
                    growth={0} 
                    onBenchmark={() => {}} 
                    onUpdateValue={updateMetricValue} 
                  />
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[50]">
          <Button size="lg" onClick={() => onNavigate(View.INRICHTING)} className="rounded-full px-12 group h-14">
             Naar Inrichting <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
      </div>
    </div>
  );
};

export default memo(Focus);
