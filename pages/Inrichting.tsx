
import React, { useState, useRef } from 'react';
import { AppData, InrichtingData, ActionItem, GapAnalysisItem, FitLevel, View } from '../types';
import { Card, Tabs, Input, Select, TextArea, AIButton, Button, Badge } from '../components/Shared';
import { analyzeInrichting, analyzeOrganogram } from '../services/geminiService';
import { Building, Users, Wallet, Upload, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Lightbulb, CheckSquare, Target, ChevronRight, FileImage, Sparkles, Trash2, GitBranch } from 'lucide-react';

interface Props {
  data: AppData;
  onUpdate: (data: Partial<AppData>) => void;
  onAddActions: (actions: ActionItem[]) => void;
  onNavigate: (view: View) => void;
}

const Inrichting: React.FC<Props> = ({ data, onUpdate, onAddActions, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('Structuur');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingOrganogramState, setAnalyzingOrganogramState] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const updateInrichting = (domain: 'structure' | 'resources' | 'culture' | 'people', field: string, value: any) => {
      onUpdate({
          inrichting: {
              ...data.inrichting,
              [domain]: {
                  ...data.inrichting[domain],
                  [field]: value
              }
          }
      });
  }

  const handleAnalysis = async () => {
      setAnalyzing(true);
      const result = await analyzeInrichting(data.inrichting, data.strategy, data.strategicGoals);
      
      onUpdate({
          inrichting: {
              ...data.inrichting,
              analysis: result.summary,
              gapAnalysis: result.gapAnalysis || []
          }
      });
      setAnalyzing(false);
      setActiveTab('Gap Analyse');
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              updateInrichting('structure', 'organogramData', reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleAnalyzeOrganogram = async () => {
      if (!data.inrichting.structure.organogramData) return;
      setAnalyzingOrganogramState(true);
      const feedback = await analyzeOrganogram(data.inrichting.structure.organogramData);
      updateInrichting('structure', 'organogramAnalysis', feedback);
      setAnalyzingOrganogramState(false);
  };

  const removeOrganogram = () => {
      updateInrichting('structure', 'organogramData', undefined);
      updateInrichting('structure', 'organogramAnalysis', undefined);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addActionFromGap = (gap: GapAnalysisItem) => {
      const newAction: ActionItem = {
          id: Date.now().toString(),
          title: gap.actionTitle,
          description: gap.actionDescription,
          type: gap.type,
          status: 'todo',
          owner: 'Nader te bepalen',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          impact: gap.score <= 2 ? 5 : 3,
          origin: 'GapAnalysis'
      };
      onAddActions([newAction]);
  }

  const FitIcon = ({ level, label }: { level: FitLevel, label: string }) => {
      return (
        <div className="flex flex-col items-center gap-2">
           <span className="text-[8px] font-black uppercase text-grayMedium tracking-widest">{label}</span>
           <div className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
             level === 'Good' ? 'bg-green-50 text-green-600 border border-green-100' : 
             level === 'Partial' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 
             'bg-red-50 text-red-600 border border-red-100'
           }`}>
             {level === 'Good' ? <CheckCircle2 className="h-5 w-5" /> : 
              level === 'Partial' ? <AlertTriangle className="h-5 w-5" /> : 
              <XCircle className="h-5 w-5" />}
           </div>
        </div>
      )
  };

  const renderStructure = () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in-up">
          <div className="space-y-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Building className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-black text-blackDark tracking-tight">Structuur & Regie</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select 
                      label="Structuur Type"
                      value={data.inrichting.structure.type}
                      onChange={e => updateInrichting('structure', 'type', e.target.value)}
                      options={["Functioneel", "Divisie", "Matrix", "Projectmatig", "Netwerk", "Hybride"]}
                  />
                  <div className="grid grid-cols-2 gap-4">
                      <Input label="Lagen" type="number" value={data.inrichting.structure.layers} onChange={e => updateInrichting('structure', 'layers', parseInt(e.target.value))} />
                      <Input label="Span" type="number" value={data.inrichting.structure.spanOfControl} onChange={e => updateInrichting('structure', 'spanOfControl', parseInt(e.target.value))} />
                  </div>
              </div>
              <Select label="Besluitvorming" value={data.inrichting.structure.decisionMaking} onChange={e => updateInrichting('structure', 'decisionMaking', e.target.value)} options={["Centraal", "Decentraal", "Hybride"]} />
              <TextArea 
                  label="Context / Motivering"
                  rows={4}
                  value={data.inrichting.structure.choiceReason}
                  placeholder="Waarom is deze structuur gekozen en hoe ondersteunt deze de strategie?"
                  onChange={e => updateInrichting('structure', 'choiceReason', e.target.value)}
              />
          </div>

          <div className="space-y-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <FileImage className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-black text-blackDark tracking-tight">Visualisatie</h3>
              </div>
              
              <div 
                className={`relative border-2 border-dashed rounded-[2.5rem] p-12 transition-all flex flex-col items-center justify-center text-center group cursor-pointer min-h-[300px] ${data.inrichting.structure.organogramData ? 'border-primary/20 bg-primary/5' : 'border-gray-100 hover:border-primary/50 hover:bg-gray-50'}`}
                onClick={() => !data.inrichting.structure.organogramData && fileInputRef.current?.click()}
              >
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                  
                  {data.inrichting.structure.organogramData ? (
                      <div className="w-full space-y-6">
                          <img src={data.inrichting.structure.organogramData} alt="Organogram" className="max-h-72 mx-auto rounded-[2rem] shadow-2xl border-4 border-white" />
                          <div className="flex justify-center gap-4">
                              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); removeOrganogram(); }}>Verwijderen</Button>
                              <Button size="sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Vervangen</Button>
                          </div>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          <div className="h-20 w-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto group-hover:scale-110 transition-transform shadow-sm">
                              <Upload className="h-10 w-10" />
                          </div>
                          <p className="font-black text-blackDark text-lg">Upload Organogram</p>
                          <p className="text-xs text-grayMedium font-bold uppercase tracking-widest">Koppel je visuele structuur aan de tool</p>
                      </>
                  )}
              </div>

              {data.inrichting.structure.organogramData && (
                  <Card className="bg-indigo-50/30 border-none shadow-none p-8 rounded-[2rem]">
                      <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                              <Sparkles className="h-5 w-5 text-indigo-600" />
                              <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest">AI Audit</h4>
                          </div>
                          <Button variant="primary" size="sm" onClick={handleAnalyzeOrganogram} disabled={analyzingOrganogramState} className="shadow-none border-b-2">
                            {analyzingOrganogramState ? 'Analyseren...' : 'Audit uitvoeren'}
                          </Button>
                      </div>
                      
                      {data.inrichting.structure.organogramAnalysis ? (
                          <p className="text-sm font-bold text-indigo-900 leading-relaxed italic border-l-4 border-indigo-200 pl-6 py-2">
                              "{data.inrichting.structure.organogramAnalysis}"
                          </p>
                      ) : (
                          <p className="text-[10px] text-indigo-400 font-bold uppercase text-center py-4 tracking-widest">
                              Laat AI je organogram valideren op hiaten en spans-of-control.
                          </p>
                      )}
                  </Card>
              )}
          </div>
      </div>
  );

  const renderResources = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fade-in-up">
        <TextArea label="Middelen & Kapitaal" rows={4} value={data.inrichting.resources.financial} placeholder="Hoe zijn de financiële middelen verdeeld over de strategische prioriteiten?" onChange={e => updateInrichting('resources', 'financial', e.target.value)} />
        <Input label="Training budget (per FTE)" type="number" value={data.inrichting.resources.trainingBudget} onChange={e => updateInrichting('resources', 'trainingBudget', parseInt(e.target.value))} />
        <TextArea label="Digitale Infrastructuur" rows={4} value={data.inrichting.resources.digitalAssets} placeholder="Welke tools en systemen zijn essentieel voor de executie?" onChange={e => updateInrichting('resources', 'digitalAssets', e.target.value)} />
        <Select label="IT & Cyber Security" value={data.inrichting.resources.securityLevel} onChange={e => updateInrichting('resources', 'securityLevel', e.target.value)} options={["Basis", "Gemiddeld", "Geavanceerd", "NIST Compliant"]} />
    </div>
  );

  return (
    <div className="space-y-12 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <Badge color="purple" className="mb-4">Strategische Inrichting</Badge>
            <h1 className="text-5xl md:text-6xl font-black text-blackDark tracking-tight leading-tight">Gereed voor <span className="text-purple-600">Executie?</span></h1>
            <p className="text-lg text-grayDark mt-4 font-medium leading-relaxed">
              Breng in kaart hoe de organisatie is opgebouwd. Is er een match tussen wat je wilt bereiken en hoe je bent georganiseerd?
            </p>
          </div>
          <AIButton onClick={handleAnalysis} loading={analyzing} label="Bereken System-Gap" className="px-10 py-5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
              <Card title="Context" subtitle="ACTIEVE DOELSTELLINGEN" className="bg-gray-50/50 border-none shadow-none sticky top-28">
                  <div className="space-y-4">
                      {data.strategicGoals.map(goal => (
                          <div key={goal.id} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm transition-all hover:scale-105">
                              <Badge color="blue" className="text-[8px]">{goal.wheel}</Badge>
                              <p className="text-xs font-black text-blackDark mt-4 leading-snug tracking-tight">{goal.description}</p>
                          </div>
                      ))}
                      {data.strategicGoals.length === 0 && (
                        <div className="p-10 border-2 border-dashed border-gray-200 rounded-[2rem] text-center opacity-50">
                            <p className="text-xs text-grayMedium font-bold uppercase tracking-widest italic">Geen doelen gevonden</p>
                        </div>
                      )}
                  </div>
              </Card>
          </div>

          <div className="lg:col-span-3 space-y-8">
              <Card className="shadow-2xl shadow-blue-500/5">
                  <Tabs tabs={['Structuur', 'Middelen', 'Gap Analyse']} activeTab={activeTab} onChange={setActiveTab} />
                  <div className="mt-12">
                    {activeTab === 'Structuur' && renderStructure()}
                    {activeTab === 'Middelen' && renderResources()}
                    {activeTab === 'Gap Analyse' && (
                        <div className="space-y-8">
                            {data.inrichting.gapAnalysis.length > 0 ? data.inrichting.gapAnalysis.map((gap, i) => (
                                <div key={i} className="p-8 bg-grayLight/20 rounded-[2.5rem] border border-transparent flex flex-col md:flex-row gap-10 items-center hover:bg-white hover:shadow-2xl transition-all duration-500 group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-4">
                                            <Badge color={gap.score >= 4 ? 'green' : 'red'} className="px-4">FIT: {gap.score}/5</Badge>
                                            <h4 className="font-black text-blackDark text-lg tracking-tight">{gap.goal}</h4>
                                        </div>
                                        <p className="text-sm text-grayDark leading-relaxed font-bold italic border-l-4 border-gray-200 pl-6 py-2">
                                          "{gap.actionDescription}"
                                        </p>
                                    </div>
                                    <div className="flex gap-8 shrink-0">
                                        <FitIcon label="Structuur" level={gap.structureFit} />
                                        <FitIcon label="Middelen" level={gap.resourcesFit} />
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => addActionFromGap(gap)} className="rounded-2xl px-8 group-hover:bg-primary group-hover:text-white transition-all shadow-none">Koppel Actie</Button>
                                </div>
                            )) : (
                                <div className="text-center py-24 bg-grayLight/10 rounded-[3rem] border-4 border-dashed border-grayLight">
                                    <GitBranch className="h-20 w-20 mx-auto mb-6 text-grayMedium opacity-20" />
                                    <p className="font-black text-grayMedium uppercase tracking-widest">Activeer de Gap Analyse bovenaan de pagina</p>
                                </div>
                            )}
                        </div>
                    )}
                  </div>
              </Card>

              <div className="flex justify-end p-8 bg-white rounded-[2.5rem] shadow-xl shadow-blue-500/5 border border-gray-100">
                  <Button size="lg" onClick={() => onNavigate(View.TRANSITIE)} className="px-12 group border-b-4">
                      Naar Transitie-plan <ChevronRight className="h-6 w-6 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Inrichting;
