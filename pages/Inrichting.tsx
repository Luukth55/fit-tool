
import React, { useState, useRef } from 'react';
import { AppData, InrichtingData, ActionItem, GapAnalysisItem, FitLevel, View } from '../types';
import { Card, Tabs, Input, Select, TextArea, AIButton, Button, Badge } from '../components/Shared';
import { analyzeInrichting, analyzeOrganogram } from '../services/geminiService';
import { 
  Building, 
  Users, 
  Wallet, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ChevronRight, 
  Sparkles, 
  GitBranch, 
  MonitorCheck, 
  Heart, 
  GraduationCap, 
  ZapOff,
  GanttChartSquare,
  Network,
  Scale,
  MessagesSquare,
  Search,
  Fingerprint,
  Box,
  Truck,
  MessageSquareQuote
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

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
  
  const updateInrichting = (domain: keyof Omit<InrichtingData, 'gapAnalysis' | 'analysis'>, field: string, value: any) => {
      onUpdate({
          inrichting: {
              ...data.inrichting,
              [domain]: {
                  ...(data.inrichting[domain] as any),
                  [field]: value
              }
          }
      });
  }

  const addActionFromGap = (gap: GapAnalysisItem) => {
    // Added missing 'effort' property to satisfy ActionItem interface requirements
    const newAction: ActionItem = {
      id: Date.now().toString(),
      title: gap.actionTitle,
      type: gap.type,
      status: 'todo',
      owner: 'Strategisch Team',
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      impact: gap.score,
      effort: 3, // Default effort value
      riskLevel: 'Medium',
      origin: 'GapAnalysis',
      description: gap.actionDescription
    };
    onAddActions([newAction]);
  };

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

  const FitIcon = ({ level, label }: { level: FitLevel, label: string }) => (
    <div className="flex flex-col items-center gap-2">
       <span className="text-[8px] font-black uppercase text-grayMedium tracking-widest">{label}</span>
       <div className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
         level === 'Good' ? 'bg-green-50 text-green-600 border border-green-100' : 
         level === 'Partial' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 
         'bg-red-50 text-red-600 border border-red-100'
       }`}>
         {level === 'Good' ? <CheckCircle2 className="h-4 w-4" /> : 
          level === 'Partial' ? <AlertTriangle className="h-4 w-4" /> : 
          <XCircle className="h-4 w-4" />}
       </div>
    </div>
  );

  const radarData = [
    { domain: 'Structuur', score: data.inrichting.structure.layers < 5 ? 4 : 2 },
    { domain: 'Middelen', score: (data.inrichting.resources.digitalMaturity || 0) / 20 },
    { domain: 'Cultuur', score: data.inrichting.culture.strategyFit === 'Good' ? 5 : data.inrichting.culture.strategyFit === 'Partial' ? 3 : 1 },
    { domain: 'Mensen', score: data.inrichting.people.eNPS > 20 ? 4 : 2 },
  ];

  const SectionTitle = ({ icon: Icon, title, subtitle, color = 'primary' }: { icon: any, title: string, subtitle: string, color?: string }) => (
    <div className="flex items-center gap-4 mb-8">
        <div className={`h-12 w-12 bg-${color}/10 rounded-2xl flex items-center justify-center text-${color}`}>
            <Icon className="h-6 w-6" />
        </div>
        <div>
            <h3 className="text-xl font-black text-blackDark tracking-tight">{title}</h3>
            <p className="text-[10px] font-bold text-grayMedium uppercase tracking-widest">{subtitle}</p>
        </div>
    </div>
  );

  const renderStructure = () => (
      <div className="space-y-10 animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white">
                  <SectionTitle icon={Network} title="Hiërarchie" subtitle="DE FUNDERING" color="primary" />
                  <div className="space-y-6">
                      <Select label="Structuur Type" value={data.inrichting.structure.type} onChange={e => updateInrichting('structure', 'type', e.target.value)} options={["Functioneel", "Divisie", "Matrix", "Projectmatig", "Netwerk"]} />
                      <div className="grid grid-cols-2 gap-4">
                          <Input label="Lagen" type="number" value={data.inrichting.structure.layers} onChange={e => updateInrichting('structure', 'layers', parseInt(e.target.value))} />
                          <Input label="Span of Control" type="number" value={data.inrichting.structure.spanOfControl} onChange={e => updateInrichting('structure', 'spanOfControl', parseInt(e.target.value))} />
                      </div>
                      <Select label="Besluitvorming" value={data.inrichting.structure.decisionMaking} onChange={e => updateInrichting('structure', 'decisionMaking', e.target.value)} options={["Centraal", "Decentraal", "Gedistribueerd", "Consensus"]} />
                  </div>
              </Card>

              <Card className="bg-white">
                  <SectionTitle icon={Scale} title="Governance" subtitle="BESLUITVORMING" color="indigo" />
                  <div className="space-y-6">
                      <TextArea label="Governance Model" rows={3} value={data.inrichting.structure.governance} onChange={e => updateInrichting('structure', 'governance', e.target.value)} placeholder="Hoe is de zeggenschap belegd?" />
                      <TextArea label="Rollen & Verantwoordelijkheden" rows={3} value={data.inrichting.structure.rolesClarity} onChange={e => updateInrichting('structure', 'rolesClarity', e.target.value)} placeholder="Zijn rollen duidelijk gedefinieerd?" />
                  </div>
              </Card>

              <Card className="bg-white md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <SectionTitle icon={GanttChartSquare} title="Coördinatie" subtitle="WERKWIJZE" color="blue" />
                        <TextArea label="Overlegstructuur" rows={5} value={data.inrichting.structure.meetingStructure} onChange={e => updateInrichting('structure', 'meetingStructure', e.target.value)} placeholder="Frequentie en doel van overleggen." />
                        <TextArea label="Motivering" rows={4} value={data.inrichting.structure.choiceReason} onChange={e => updateInrichting('structure', 'choiceReason', e.target.value)} placeholder="Waarom deze structuur?" />
                    </div>
                    <div className="bg-grayLight/20 p-8 rounded-[2rem] border-2 border-dashed border-grayMedium/20 text-center flex flex-col items-center justify-center overflow-hidden">
                        <p className="text-xs font-black text-grayMedium uppercase mb-6">Organogram Analyse</p>
                        {data.inrichting.structure.organogramData ? (
                            <div className="space-y-4 w-full">
                                <img src={data.inrichting.structure.organogramData} className="max-h-48 mx-auto rounded-xl shadow-lg border-4 border-white" />
                                <div className="flex gap-2 justify-center">
                                    <Button size="sm" variant="outline" onClick={() => updateInrichting('structure', 'organogramData', undefined)}>Wissen</Button>
                                    <Button size="sm" onClick={() => fileInputRef.current?.click()}>Nieuw</Button>
                                </div>
                                {data.inrichting.structure.organogramAnalysis && (
                                  <div className="mt-6 p-5 bg-white rounded-2xl border border-gray-100 text-left relative">
                                     <MessageSquareQuote className="absolute -top-3 -left-3 h-6 w-6 text-primary" />
                                     <p className="text-[11px] font-bold text-grayDark leading-relaxed italic">
                                       {data.inrichting.structure.organogramAnalysis}
                                     </p>
                                  </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Upload className="h-16 w-16 mx-auto text-grayMedium opacity-20 mb-2" />
                                <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>Upload Organogram</Button>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />
                        {data.inrichting.structure.organogramData && (
                            <AIButton onClick={handleAnalyzeOrganogram} loading={analyzingOrganogramState} label="Audit Organogram" className="mt-6 w-full text-[10px]" />
                        )}
                    </div>
                  </div>
              </Card>
          </div>
      </div>
  );

  const renderResources = () => (
    <div className="space-y-10 animate-fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white">
                <SectionTitle icon={Wallet} title="Kapitaal" subtitle="FINANCIEN" color="green" />
                <TextArea label="Financiële Gezondheid" rows={4} value={data.inrichting.resources.financial} onChange={e => updateInrichting('resources', 'financial', e.target.value)} placeholder="Budgetruimte, investeringscapaciteit." />
                <Input label="Training Budget per FTE (€)" type="number" value={data.inrichting.resources.trainingBudget} onChange={e => updateInrichting('resources', 'trainingBudget', parseInt(e.target.value))} />
            </Card>

            <Card className="bg-white">
                <SectionTitle icon={MonitorCheck} title="Technologie" subtitle="DIGITALE ASSETS" color="blue" />
                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 mb-6 flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-black text-blue-600 uppercase">Maturity Score</p>
                        <span className="text-2xl font-black text-blue-900">{data.inrichting.resources.digitalMaturity}%</span>
                    </div>
                    <input type="range" min="1" max="100" value={data.inrichting.resources.digitalMaturity} onChange={e => updateInrichting('resources', 'digitalMaturity', parseInt(e.target.value))} className="w-40 accent-primary" />
                </div>
                <TextArea label="Software & Systemen" rows={3} value={data.inrichting.resources.digitalAssets} onChange={e => updateInrichting('resources', 'digitalAssets', e.target.value)} placeholder="ERP, CRM, etc." />
                <Select label="Security Level" value={data.inrichting.resources.securityLevel} onChange={e => updateInrichting('resources', 'securityLevel', e.target.value)} options={["Basis", "ISO 27001", "High-End"]} />
            </Card>

            <Card className="bg-white">
                <SectionTitle icon={Box} title="Infrastructuur" subtitle="FYSIEKE ASSETS" color="orange" />
                <TextArea label="Vastgoed & Materieel" rows={4} value={data.inrichting.resources.physicalAssets} onChange={e => updateInrichting('resources', 'physicalAssets', e.target.value)} placeholder="Kantoorruimte, machines." />
            </Card>

            <Card className="bg-white">
                <SectionTitle icon={Truck} title="Ketens" subtitle="PARTNERS" color="red" />
                <TextArea label="Kritieke Leveranciers" rows={4} value={data.inrichting.resources.criticalVendors} onChange={e => updateInrichting('resources', 'criticalVendors', e.target.value)} placeholder="Belangrijkste externe partners." />
            </Card>
        </div>
    </div>
  );

  const renderCulture = () => (
    <div className="space-y-10 animate-fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white">
                <SectionTitle icon={Heart} title="Identiteit" subtitle="KERNWAARDEN" color="pink" />
                <Select label="Cultuurtype" value={data.inrichting.culture.type} onChange={e => updateInrichting('culture', 'type', e.target.value)} options={["Familie", "Innovatie", "Markt", "Hiërarchie"]} />
                <TextArea label="Kernwaarden" rows={3} value={data.inrichting.culture.coreValues} onChange={e => updateInrichting('culture', 'coreValues', e.target.value)} placeholder="Wat zijn de ongeschreven regels?" />
                <TextArea label="Kenmerken" rows={3} value={data.inrichting.culture.characteristics.join(', ')} onChange={e => updateInrichting('culture', 'characteristics', e.target.value.split(','))} placeholder="Bijv. informes, sociaal." />
            </Card>

            <Card className="bg-white">
                <SectionTitle icon={MessagesSquare} title="Dynamiek" subtitle="COMMUNICATIE" color="purple" />
                <TextArea label="Stijl & Feedback" rows={4} value={data.inrichting.culture.communicationStyle} onChange={e => updateInrichting('culture', 'communicationStyle', e.target.value)} placeholder="Open, gesloten, formeel?" />
                <TextArea label="Beloning & Erkenning" rows={4} value={data.inrichting.culture.recognitionRewards} onChange={e => updateInrichting('culture', 'recognitionRewards', e.target.value)} placeholder="Hoe vieren we succes?" />
            </Card>

            <Card className="bg-white md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <SectionTitle icon={ZapOff} title="Barrières" subtitle="VERANDERKRACHT" color="orange" />
                        <TextArea label="Knelpunten" rows={5} value={data.inrichting.culture.barriers} onChange={e => updateInrichting('culture', 'barriers', e.target.value)} placeholder="Wat houdt verandering tegen?" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <Select label="Match met Strategie" value={data.inrichting.culture.strategyFit} onChange={e => updateInrichting('culture', 'strategyFit', e.target.value)} options={["Good", "Partial", "Bad"]} />
                        <div className="mt-8 p-6 bg-orange-50 rounded-[2rem] border border-orange-100 italic text-xs font-bold text-orange-900">
                            "AI Tip: Bij een 'Bad' match is cultuur-verandering de hoogste prioriteit actie."
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    </div>
  );

  const renderPeople = () => (
    <div className="space-y-10 animate-fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white">
                <SectionTitle icon={Users} title="Capaciteit" subtitle="FTE & WELZIJN" color="yellow" />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Totaal FTE" type="number" value={data.inrichting.people.totalFte} onChange={e => updateInrichting('people', 'totalFte', parseInt(e.target.value))} />
                    <Input label="Verloop (%)" type="number" value={data.inrichting.people.turnover} onChange={e => updateInrichting('people', 'turnover', parseInt(e.target.value))} />
                </div>
                <div className="p-6 bg-yellow-50 rounded-2xl border border-yellow-100 mt-6">
                    <p className="text-[10px] font-black text-yellow-600 uppercase mb-2">Medewerker eNPS</p>
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-black text-yellow-900">{data.inrichting.people.eNPS}</span>
                        <input type="range" min="-100" max="100" value={data.inrichting.people.eNPS} onChange={e => updateInrichting('people', 'eNPS', parseInt(e.target.value))} className="flex-1 accent-yellow-500" />
                    </div>
                </div>
                <Select label="Leiderschap" value={data.inrichting.people.leadershipStyle} onChange={e => updateInrichting('people', 'leadershipStyle', e.target.value)} options={["Directief", "Coachend", "Participerend", "Laissez-faire"]} />
            </Card>

            <Card className="bg-white">
                <SectionTitle icon={GraduationCap} title="Talent" subtitle="GROEI" color="blue" />
                <TextArea label="Ontwikkeling" rows={4} value={data.inrichting.people.talentDevelopment} onChange={e => updateInrichting('people', 'talentDevelopment', e.target.value)} placeholder="Mentoring, opleiding?" />
                <TextArea label="Skills Gaps" rows={4} value={data.inrichting.people.gaps} onChange={e => updateInrichting('people', 'gaps', e.target.value)} placeholder="Welke kennis ontbreekt?" />
            </Card>

            <Card className="bg-white">
                <SectionTitle icon={Search} title="Aantrekkingskracht" subtitle="RECRUITMENT" color="indigo" />
                <TextArea label="Strategie" rows={4} value={data.inrichting.people.recruitmentStrategy} onChange={e => updateInrichting('people', 'recruitmentStrategy', e.target.value)} placeholder="Hoe vinden we talent?" />
            </Card>

            <Card className="bg-white">
                <SectionTitle icon={Fingerprint} title="Samenstelling" subtitle="D&I" color="purple" />
                <TextArea label="Beleid" rows={4} value={data.inrichting.people.diversityInclusion} onChange={e => updateInrichting('people', 'diversityInclusion', e.target.value)} placeholder="Is de mix optimaal?" />
            </Card>
        </div>
    </div>
  );

  return (
    <div className="space-y-12 pb-32 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <Badge color="purple" className="mb-4">SYSTEM ANALYSIS</Badge>
            <h1 className="text-5xl md:text-6xl font-black text-blackDark tracking-tight leading-tight">Inrichting Audit.</h1>
            <p className="text-lg text-grayDark mt-4 font-medium leading-relaxed">
              Zorg voor een naadloze aansluiting tussen je ambities en de vier pilaren van je organisatie.
            </p>
          </div>
          <AIButton onClick={handleAnalysis} loading={analyzing} label="Bereken System-Gap" className="px-10 py-5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1 space-y-6">
              <Card title="Systeem Balans" subtitle="QUICK SCAN" className="bg-white">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#E5E7EB" />
                      <PolarAngleAxis dataKey="domain" tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 'bold' }} />
                      <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                      <Radar dataKey="score" stroke="#9333ea" fill="#9333ea" fillOpacity={0.1} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              
              <Card title="Context" subtitle="DOELEN" className="bg-gray-50/50 border-none shadow-none">
                  <div className="space-y-4">
                      {data.strategicGoals.map(goal => (
                          <div key={goal.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                              <Badge color="blue" className="text-[8px]">{goal.wheel}</Badge>
                              <p className="text-xs font-bold text-blackDark mt-2 leading-tight">{goal.description}</p>
                          </div>
                      ))}
                  </div>
              </Card>
          </div>

          <div className="lg:col-span-3 space-y-8">
              <Card className="shadow-2xl shadow-blue-500/5">
                  <Tabs tabs={['Structuur', 'Middelen', 'Cultuur', 'Mensen', 'Gap Analyse']} activeTab={activeTab} onChange={setActiveTab} />
                  <div className="mt-12">
                    {activeTab === 'Structuur' && renderStructure()}
                    {activeTab === 'Middelen' && renderResources()}
                    {activeTab === 'Cultuur' && renderCulture()}
                    {activeTab === 'Mensen' && renderPeople()}
                    {activeTab === 'Gap Analyse' && (
                        <div className="space-y-8 animate-fade-in-up">
                            {data.inrichting.gapAnalysis.length > 0 ? data.inrichting.gapAnalysis.map((gap, i) => (
                                <div key={i} className="p-8 bg-grayLight/20 rounded-[2.5rem] flex flex-col items-center hover:bg-white hover:shadow-2xl transition-all duration-500">
                                    <div className="w-full flex flex-col md:flex-row gap-8 items-center">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-3">
                                                <Badge color={gap.score >= 4 ? 'green' : gap.score >= 2 ? 'yellow' : 'red'}>FIT: {gap.score}/5</Badge>
                                                <h4 className="font-black text-blackDark text-lg">{gap.goal}</h4>
                                            </div>
                                            <p className="text-sm text-grayDark italic font-bold leading-relaxed border-l-4 border-gray-200 pl-4">"{gap.actionDescription}"</p>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
                                            <FitIcon label="Structuur" level={gap.structureFit} />
                                            <FitIcon label="Middelen" level={gap.resourcesFit} />
                                            <FitIcon label="Cultuur" level={gap.cultureFit} />
                                            <FitIcon label="Mensen" level={gap.peopleFit} />
                                        </div>
                                    </div>
                                    <div className="w-full mt-6 pt-6 border-t border-gray-100 flex justify-end">
                                        <Button size="sm" variant="outline" onClick={() => addActionFromGap(gap)}>Maak Strategische Actie</Button>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-24 opacity-30">
                                    <GitBranch className="h-20 w-20 mx-auto mb-4" />
                                    <p className="font-black uppercase tracking-widest">Activeer de Gap Analyse bovenaan</p>
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
