
import React, { useState } from 'react';
import { AppData, FitCheckScore, Domain, View, FitLevel } from '../types';
import { Card, Button, AIButton, Badge, Tabs } from '../components/Shared';
import { runFitCheckAnalysis } from '../services/geminiService';
import { 
  ChevronDown, 
  ChevronUp, 
  Target, 
  Users, 
  Settings, 
  Database, 
  Activity, 
  Share2, 
  Award, 
  Zap, 
  ArrowRight, 
  CheckCircle2,
  AlertCircle,
  BarChart2,
  X,
  Info
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface Props {
  data: AppData;
  onUpdate: (data: Partial<AppData>) => void;
  onNavigate: (view: View) => void;
}

interface SelectedItem {
    type: 'goal' | 'kpi' | 'inrichting' | 'action';
    data: any;
}

const FitCheck: React.FC<Props> = ({ data, onUpdate, onNavigate }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('Strategiekaart');
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

  const handleAnalysis = async () => {
      setAnalyzing(true);
      const scores = await runFitCheckAnalysis(data);
      if (scores.length > 0) {
          onUpdate({ 
              fitCheckScores: scores,
              history: [...data.history, { 
                  date: new Date().toISOString().split('T')[0], 
                  totalFitScore: scores.reduce((a,b) => a+b.score, 0) / scores.length,
                  domainScores: scores.reduce((acc, curr) => ({...acc, [curr.domain]: curr.score}), {})
              }]
          });
      }
      setAnalyzing(false);
  };

  const getIcon = (domain: string) => {
      switch(domain) {
          case Domain.STRATEGY: return Target;
          case Domain.STRUCTURE: return Settings;
          case Domain.CULTURE: return Users;
          case Domain.PEOPLE: return Award;
          case Domain.RESOURCES: return Database;
          case Domain.PROCESSES: return Activity;
          case Domain.TECHNOLOGY: return Zap;
          default: return Activity;
      }
  }

  const getStatusColor = (score: number) => {
      if (score >= 4) return 'bg-green-500';
      if (score >= 2.5) return 'bg-orange-500';
      return 'bg-red-500';
  }

  const renderStrategyMap = () => (
      <div className="space-y-10 reveal visible relative">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-blue-500/5">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                  <div>
                      <h3 className="text-3xl font-black text-blackDark flex items-center gap-3">
                          <Share2 className="h-8 w-8 text-primary" /> Strategische Verbindingen
                      </h3>
                      <p className="text-grayDark mt-2 font-medium">Overzicht van de relaties tussen doelen, KPI's en inrichting.</p>
                  </div>
                  <div className="flex gap-6 bg-grayLight/30 p-4 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-grayDark">
                        <div className="h-3 w-3 rounded-full bg-green-500 shadow-md"></div> In FIT
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-grayDark">
                        <div className="h-3 w-3 rounded-full bg-orange-500 shadow-md"></div> Risico
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-grayDark">
                        <div className="h-3 w-3 rounded-full bg-red-500 shadow-md"></div> Mismatch
                      </div>
                  </div>
              </div>

              <div className="relative">
                  <div className="grid grid-cols-4 gap-6 mb-10">
                      <div className="text-[10px] font-black text-grayMedium uppercase tracking-[0.2em] text-center">1. Strategische Doelen</div>
                      <div className="text-[10px] font-black text-grayMedium uppercase tracking-[0.2em] text-center">2. KPI Focus</div>
                      <div className="text-[10px] font-black text-grayMedium uppercase tracking-[0.2em] text-center">3. Inrichting Fit</div>
                      <div className="text-[10px] font-black text-grayMedium uppercase tracking-[0.2em] text-center">4. Executie Kracht</div>
                  </div>

                  <div className="space-y-8 mt-4">
                      {data.strategicGoals.length > 0 ? data.strategicGoals.map(goal => {
                          const kpi = data.performanceMetrics.find(k => k.id === goal.kpiId);
                          const linkedActions = data.actions.filter(a => a.linkedId === goal.id);
                          const fitScore = data.fitCheckScores.find(s => s.domain === Domain.STRATEGY)?.score || 3;
                          
                          return (
                              <div key={goal.id} className="grid grid-cols-4 gap-6 items-stretch relative group">
                                  <div className="absolute top-1/2 left-0 w-full h-1 bg-grayLight/30 -z-10 rounded-full group-hover:bg-primary/10 transition-colors"></div>

                                  <div 
                                    onClick={() => setSelectedItem({ type: 'goal', data: goal })}
                                    className={`p-5 rounded-3xl border-2 bg-white shadow-sm transition-all hover:scale-105 cursor-pointer relative z-10 ${fitScore >= 4 ? 'border-green-100' : 'border-red-100'} ${selectedItem?.data?.id === goal.id ? 'ring-2 ring-primary border-primary' : ''}`}
                                  >
                                      <div className={`h-2 w-10 rounded-full mb-3 ${getStatusColor(fitScore)}`}></div>
                                      <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-2">{goal.wheel}</p>
                                      <p className="text-sm font-bold leading-tight text-blackDark">{goal.description}</p>
                                  </div>

                                  <div 
                                    onClick={() => kpi && setSelectedItem({ type: 'kpi', data: kpi })}
                                    className={`p-5 rounded-3xl border border-gray-100 bg-white shadow-sm flex flex-col justify-center relative z-10 transition-transform hover:scale-105 cursor-pointer ${selectedItem?.data?.id === kpi?.id ? 'ring-2 ring-primary border-primary' : ''}`}
                                  >
                                      {kpi ? (
                                          <>
                                              <p className="text-[10px] font-black text-grayMedium uppercase mb-2">KPI Focus</p>
                                              <p className="text-sm font-bold text-blackDark">{kpi.name}</p>
                                              <Badge color="blue" className="mt-3 w-fit">{kpi.unit}</Badge>
                                          </>
                                      ) : (
                                          <div className="flex flex-col items-center justify-center opacity-30 italic text-grayMedium">
                                              <AlertCircle className="h-6 w-6 mb-2" />
                                              <p className="text-[10px]">Geen KPI</p>
                                          </div>
                                      )}
                                  </div>

                                  <div className="flex flex-wrap gap-2 justify-center content-center relative z-10">
                                      {['structure', 'resources', 'culture', 'people'].map((dom, idx) => {
                                          const score = data.fitCheckScores.find(s => s.domain.toLowerCase().includes(dom.toLowerCase()))?.score || 3;
                                          return (
                                              <div 
                                                key={idx} 
                                                onClick={() => setSelectedItem({ type: 'inrichting', data: { domain: dom, score } })}
                                                className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xs font-black text-white shadow-xl transition-all hover:scale-125 hover:rotate-6 cursor-pointer ${getStatusColor(score)}`} 
                                                title={`${dom}: ${score}/5`}
                                              >
                                                  {dom.charAt(0).toUpperCase()}
                                              </div>
                                          )
                                      })}
                                  </div>

                                  <div className="flex flex-col justify-center gap-3 relative z-10">
                                      {linkedActions.length > 0 ? linkedActions.map(a => (
                                          <div 
                                            key={a.id} 
                                            onClick={(e) => { e.stopPropagation(); setSelectedItem({ type: 'action', data: a }); }}
                                            className={`px-4 py-3 rounded-2xl bg-white border border-primary/20 text-[11px] font-bold text-primary shadow-sm flex items-center justify-between group/action hover:bg-primary hover:text-white transition-all cursor-pointer ${selectedItem?.data?.id === a.id ? 'ring-2 ring-primary bg-primary text-white' : ''}`}
                                          >
                                              <span className="truncate">{a.title}</span>
                                              <ArrowRight className="h-3 w-3 opacity-0 group-hover/action:opacity-100 transition-opacity" />
                                          </div>
                                      )) : (
                                          <button 
                                            onClick={() => onNavigate(View.TRANSITIE)}
                                            className="px-4 py-4 rounded-2xl bg-grayLight/20 border-2 border-dashed border-grayMedium/30 text-[10px] font-black text-grayMedium uppercase tracking-widest hover:border-primary hover:text-primary hover:bg-white transition-all"
                                          >
                                              + Koppel Actie
                                          </button>
                                      )}
                                  </div>
                              </div>
                          )
                      }) : (
                        <div className="text-center py-20 bg-grayLight/10 rounded-[2rem] border-2 border-dashed border-gray-100">
                           <Target className="h-16 w-16 text-grayLight mx-auto mb-6" />
                           <p className="text-lg font-bold text-grayMedium">Begin met het definiëren van je doelen in de Focus tab.</p>
                           <Button onClick={() => onNavigate(View.FOCUS)} className="mt-6 rounded-2xl px-8">Naar Focus Module</Button>
                        </div>
                      )}
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card title="Strategische Balans">
                  <div className="space-y-6 pt-4">
                     {[
                        { label: 'Doel-Executie Fit', value: 85, color: 'bg-green-500' },
                        { label: 'Inrichting Consistentie', value: 62, color: 'bg-orange-500' },
                        { label: 'Validatie Score', value: 78, color: 'bg-primary' },
                     ].map((item, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                <span>{item.label}</span>
                                <span>{item.value}%</span>
                            </div>
                            <div className="h-3 bg-grayLight rounded-full overflow-hidden shadow-inner">
                                <div className={`h-full ${item.color} rounded-full transition-all duration-1000 shadow-lg`} style={{ width: `${item.value}%` }}></div>
                            </div>
                        </div>
                     ))}
                  </div>
              </Card>
          </div>

          {selectedItem && (
              <div className="fixed top-24 right-8 w-80 bg-white shadow-2xl rounded-3xl border border-gray-100 z-50 p-6 animate-fade-in-up">
                  <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                          <Info className="h-5 w-5 text-primary" />
                          <h4 className="font-black text-sm uppercase tracking-widest">Element Detail</h4>
                      </div>
                      <button onClick={() => setSelectedItem(null)} className="text-grayMedium hover:text-blackDark">
                          <X className="h-5 w-5" />
                      </button>
                  </div>
                  
                  <div className="space-y-6">
                      <div>
                          <p className="text-[10px] font-black text-grayMedium uppercase tracking-widest mb-1">Type</p>
                          <Badge color="blue" className="uppercase">{selectedItem.type}</Badge>
                      </div>

                      <div>
                          <p className="text-[10px] font-black text-grayMedium uppercase tracking-widest mb-1">Inhoud</p>
                          <p className="text-sm font-bold text-blackDark leading-tight">
                              {selectedItem.type === 'goal' && selectedItem.data.description}
                              {selectedItem.type === 'kpi' && selectedItem.data.name}
                              {selectedItem.type === 'action' && selectedItem.data.title}
                              {selectedItem.type === 'inrichting' && `${selectedItem.data.domain} (Score: ${selectedItem.data.score}/5)`}
                          </p>
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-[10px] font-black"
                        onClick={() => {
                            if (selectedItem.type === 'goal') onNavigate(View.FOCUS);
                            if (selectedItem.type === 'inrichting') onNavigate(View.INRICHTING);
                            if (selectedItem.type === 'action') onNavigate(View.TRANSITIE);
                            setSelectedItem(null);
                        }}
                      >
                          BEWERK IN MODULE <ArrowRight className="h-3 w-3 ml-2" />
                      </Button>
                  </div>
              </div>
          )}
      </div>
  );

  return (
    <div className="space-y-10 reveal visible">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Badge color="purple" className="mb-4">RAPPORTAGE</Badge>
            <h1 className="text-4xl md:text-5xl font-black text-blackDark tracking-tight">FITCheck & Kaart</h1>
            <p className="text-grayDark mt-2 font-medium">Overzicht van de organisatie-fit en de voortgang van de strategische doelen.</p>
          </div>
          <div className="flex gap-4">
              <Button variant="outline" onClick={() => onNavigate(View.DASHBOARD)} className="rounded-2xl border-gray-200">Trends Dashboard</Button>
              <AIButton onClick={handleAnalysis} loading={analyzing} label="Herbereken FIT" />
          </div>
      </div>

      <Tabs tabs={['Strategiekaart', 'Domein Scores', 'Historie']} activeTab={activeSubTab} onChange={setActiveSubTab} />

      {activeSubTab === 'Domein Scores' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <Card className="lg:col-span-1 h-[450px]" title="Radar Profiel">
                 <div className="h-full w-full pb-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.fitCheckScores}>
                            <PolarGrid stroke="#E5E7EB" />
                            <PolarAngleAxis dataKey="domain" tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 'bold' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                            <Radar name="Score" dataKey="score" stroke="#3B82F6" strokeWidth={5} fill="#3B82F6" fillOpacity={0.1} />
                        </RadarChart>
                    </ResponsiveContainer>
                 </div>
              </Card>

              <div className="lg:col-span-2 space-y-4">
                  {data.fitCheckScores.length > 0 ? data.fitCheckScores.map((score, index) => {
                      const Icon = getIcon(score.domain);
                      const isExpanded = expandedDomain === score.domain;
                      return (
                          <div key={index} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
                              <button onClick={() => setExpandedDomain(isExpanded ? null : score.domain)} className="w-full px-8 py-6 flex items-center justify-between hover:bg-grayLight/20 group">
                                  <div className="flex items-center gap-6">
                                      <div className={`p-4 rounded-2xl ${getStatusColor(score.score)} bg-opacity-10 text-opacity-100 shadow-sm group-hover:scale-110 transition-transform`}>
                                          <Icon className="h-6 w-6" />
                                      </div>
                                      <h3 className="font-black text-xl text-blackDark">{score.domain}</h3>
                                  </div>
                                  <div className="flex items-center gap-6">
                                      <div className="flex flex-col items-end">
                                          <span className="text-2xl font-black text-blackDark">{score.score}<span className="text-sm text-grayMedium">/5</span></span>
                                          <span className={`text-[10px] font-black uppercase tracking-widest ${score.score >= 4 ? 'text-green-600' : 'text-orange-600'}`}>{score.score >= 4 ? 'Optimal' : 'Focus nodig'}</span>
                                      </div>
                                      {isExpanded ? <ChevronUp className="h-6 w-6 text-grayMedium" /> : <ChevronDown className="h-6 w-6 text-grayMedium" />}
                                  </div>
                              </button>
                              {isExpanded && (
                                  <div className="px-8 pb-8 pt-2 bg-grayLight/10 border-t border-gray-50 animate-fadeIn">
                                      <div className="space-y-4">
                                          <p className="text-[10px] font-black text-grayMedium uppercase tracking-widest">Domein Analyse</p>
                                          <p className="text-sm font-medium text-grayDark leading-relaxed">{score.description}</p>
                                          <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-4">Verbetersuggestie</p>
                                          <div className="p-6 bg-white rounded-2xl border border-primary/10 shadow-sm text-sm font-bold text-primary italic leading-relaxed">
                                            "{score.suggestion}"
                                          </div>
                                      </div>
                                  </div>
                              )}
                          </div>
                      );
                  }) : (
                    <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100">
                        <BarChart2 className="h-16 w-16 text-grayLight mx-auto mb-6" />
                        <p className="text-lg font-bold text-grayMedium">Nog geen data geanalyseerd.</p>
                        <AIButton onClick={handleAnalysis} loading={analyzing} label="Start FIT Analyse" className="mt-6" />
                    </div>
                  )}
              </div>
          </div>
      )}

      {activeSubTab === 'Strategiekaart' && renderStrategyMap()}
      
      {activeSubTab === 'Historie' && (
          <div className="grid grid-cols-1 gap-8 animate-fadeIn">
              <Card title="Evolutie van FIT">
                  <div className="h-[400px] flex items-center justify-center text-grayMedium font-bold italic border-2 border-dashed border-grayLight rounded-[2rem]">
                      Historische vergelijking wordt opgebouwd na meerdere meetmomenten.
                  </div>
              </Card>
          </div>
      )}
    </div>
  );
};

export default FitCheck;
