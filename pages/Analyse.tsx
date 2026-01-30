
import React, { useState, useMemo, memo, useCallback } from 'react';
import { AppData, View, GapAnalysisItem, FitLevel } from '../types';
import { Card, Badge, Button, Tabs, Modal, AIButton } from '../components/Shared';
import { calculateReliableFitScore, generateSystemAlerts } from '../services/analysisUtils';
import { generateSmartAlerts } from '../services/geminiService';
import { generatePDFReport } from '../services/exportService';
import AdvancedAnalytics from './AdvancedAnalytics';
import { 
  Target, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Globe,
  Bell,
  Info,
  Dna,
  Download
} from 'lucide-react';

interface Props {
  data: AppData;
  onNavigate: (view: View) => void;
  onUpdate: (data: Partial<AppData>) => void;
}

// --- MEMOIZED SUB-COMPONENTS ---

const AlertItem = memo(({ alert, onNavigate }: { alert: any, onNavigate: (v: View) => void }) => (
  <div 
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
));

const Analyse: React.FC<Props> = ({ data, onNavigate, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [selectedGap, setSelectedGap] = useState<GapAnalysisItem | null>(null);

  const metrics = useMemo(() => calculateReliableFitScore(data), [data]);
  const systemAlerts = useMemo(() => generateSystemAlerts(data), [data]);
  const allAlerts = useMemo(() => {
    return [...systemAlerts, ...(data.alerts || [])].sort((a, b) => a.priority - b.priority);
  }, [systemAlerts, data.alerts]);

  const handleFetchSmartAlerts = useCallback(async () => {
    setLoadingAlerts(true);
    const aiAlerts = await generateSmartAlerts(data);
    onUpdate({ alerts: aiAlerts });
    setLoadingAlerts(false);
  }, [data, onUpdate]);

  const handleExportPDF = useCallback(() => generatePDFReport(data), [data]);

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
        {allAlerts.length > 0 ? allAlerts.map((alert, idx) => (
          <AlertItem key={alert.id || idx} alert={alert} onNavigate={onNavigate} />
        )) : (
          <div className="col-span-full py-12 text-center bg-grayLight/20 rounded-[2rem] border-2 border-dashed border-gray-200 opacity-40">
            <Bell className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm font-bold">Geen alerts op dit moment.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-12 pb-32 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Badge color="blue" className="mb-4">COCKPIT v3.5</Badge>
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
        tabs={['Overview', 'Advanced Analytics', 'Gap Matrix']} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {activeTab === 'Overview' && (
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
      )}

      {activeTab === 'Advanced Analytics' && <AdvancedAnalytics data={data} onNavigate={onNavigate} />}

      {activeTab === 'Gap Matrix' && (
        <Card title="Strategische Gap Analyse" subtitle="DOELEN VS INRICHTING">
           <div className="overflow-x-auto">
              <table className="w-full">
                 <thead>
                    <tr className="border-b border-gray-100">
                       <th className="text-left py-6 text-[10px] font-black text-grayMedium uppercase tracking-widest">Doelstelling</th>
                       <th className="text-center py-6 text-[10px] font-black text-grayMedium uppercase tracking-widest">Score</th>
                       <th className="text-right py-6 text-[10px] font-black text-grayMedium uppercase tracking-widest">Actie</th>
                    </tr>
                 </thead>
                 <tbody>
                    {data.inrichting.gapAnalysis.map((gap, i) => (
                       <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setSelectedGap(gap)}>
                          <td className="py-6 pr-8">
                             <div className="font-black text-blackDark text-sm">{gap.goal}</div>
                          </td>
                          <td className="py-6 text-center">
                             <Badge color={gap.score >= 4 ? 'green' : gap.score >= 2.5 ? 'blue' : 'red'}>{gap.score}/5</Badge>
                          </td>
                          <td className="py-6 text-right">
                             <Button variant="ghost" size="sm" className="text-[10px]">Details <ArrowRight className="h-3 w-3 ml-2" /></Button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </Card>
      )}

      <Modal isOpen={!!selectedGap} onClose={() => setSelectedGap(null)} title="Gap Detail Analyse">
        {selectedGap && (
          <div className="space-y-8">
            <div className="p-8 bg-primary rounded-[2.5rem] text-white shadow-2xl shadow-blue-500/20">
              <h3 className="text-2xl font-black mb-4">{selectedGap.goal}</h3>
              <p className="text-sm font-medium opacity-90 leading-relaxed italic">"{selectedGap.aiInsight || 'Geen AI inzicht beschikbaar.'}"</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               {[
                 { label: 'Structuur', fit: selectedGap.structureFit },
                 { label: 'Middelen', fit: selectedGap.resourcesFit },
                 { label: 'Cultuur', fit: selectedGap.cultureFit },
                 { label: 'Mensen', fit: selectedGap.peopleFit },
               ].map(p => (
                 <div key={p.label} className="p-4 bg-grayLight/30 rounded-2xl border border-gray-100 flex justify-between items-center">
                    <span className="text-[10px] font-black text-grayMedium uppercase">{p.label}</span>
                    <Badge color={p.fit === 'Good' ? 'green' : p.fit === 'Partial' ? 'blue' : 'red'}>{p.fit}</Badge>
                 </div>
               ))}
            </div>

            <Button className="w-full py-6 rounded-[2rem]" onClick={() => { onNavigate(View.TRANSITIE); setSelectedGap(null); }}>
              Plan Actie In Transitie Engine
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default memo(Analyse);
