
import React, { useState, useMemo } from 'react';
import { AppData, FitCheckScore, Domain, View } from '../types';
import { Card, Button, AIButton, Badge, Tabs, Modal } from '../components/Shared';
import { runFitCheckInterpretation } from '../services/geminiService';
import { 
  ChevronRight, 
  ChevronLeft,
  Target, 
  Users, 
  Settings, 
  Database, 
  Zap, 
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Sparkles,
  Info
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface Props {
  data: AppData;
  onUpdate: (data: Partial<AppData>) => void;
  onNavigate: (view: View) => void;
}

interface Question {
  id: string;
  domain: string;
  question: string;
  hint: string;
}

const QUESTIONS: Question[] = [
  // STRUCTURE (10)
  { id: 's1', domain: 'Structuur', question: 'Zijn rollen en verantwoordelijkheden voor iedereen glashelder?', hint: 'Geen overlap of "grijze gebieden" in wie wat doet.' },
  { id: 's2', domain: 'Structuur', question: 'Ondersteunt de huidige hiërarchie snelle besluitvorming?', hint: 'Weinig bureaucratische lagen.' },
  { id: 's3', domain: 'Structuur', question: 'Is de overlegstructuur efficiënt en doelgericht?', hint: 'Meetings hebben agenda\'s en actiehouders.' },
  { id: 's4', domain: 'Structuur', question: 'Worden projecten organisatiebreed goed gecoördineerd?', hint: 'Geen eilandjes-cultuur bij executie.' },
  { id: 's5', domain: 'Structuur', question: 'Is de span-of-control van leidinggevenden hanteerbaar?', hint: 'Managers hebben tijd voor coaching.' },
  { id: 's6', domain: 'Structuur', question: 'Kan de structuur makkelijk opschalen bij groei?', hint: 'Flexibiliteit in de inrichting.' },
  { id: 's7', domain: 'Structuur', question: 'Is de governance (toezicht/sturing) adequaat ingericht?', hint: 'Duidelijk mandaat bij het MT.' },
  { id: 's8', domain: 'Structuur', question: 'Werken afdelingen naadloos samen aan gedeelde doelen?', hint: 'Horizontale synergie.' },
  { id: 's9', domain: 'Structuur', question: 'Zijn secundaire processen goed belegd?', hint: 'HR, Finance en IT ondersteunen de kern.' },
  { id: 's10', domain: 'Structuur', question: 'Is er een duidelijke rapportagelijn naar de strategie?', hint: 'Voortgang is inzichtelijk voor de top.' },

  // RESOURCES (10)
  { id: 'r1', domain: 'Middelen', question: 'Is er voldoende budget om de strategische doelen te halen?', hint: 'Financiële armslag is aanwezig.' },
  { id: 'r2', domain: 'Middelen', question: 'Zijn de IT-systemen modern en ondersteunend?', hint: 'Geen legacy-software die vertraagt.' },
  { id: 'r3', domain: 'Middelen', question: 'Is data-beveiliging en privacy op orde?', hint: 'Voldoet aan wet- en regelgeving.' },
  { id: 'r4', domain: 'Middelen', question: 'Hebben medewerkers toegang tot de juiste tools?', hint: 'Hardware en software zijn up-to-date.' },
  { id: 'r5', domain: 'Middelen', question: 'Is er een innovatiebudget voor experimenten?', hint: 'Ruimte voor R&D.' },
  { id: 'r6', domain: 'Middelen', question: 'Worden middelen efficiënt ingezet (weinig verspilling)?', hint: 'Kostenbewustzijn in de operatie.' },
  { id: 'r7', domain: 'Middelen', question: 'Is de fysieke werkomgeving inspirerend en functionaliteit?', hint: 'Kantoor of remote-setup is optimaal.' },
  { id: 'r8', domain: 'Middelen', question: 'Zijn kritieke leveranciers betrouwbaar?', hint: 'Continuïteit is gewaarborgd.' },
  { id: 'r9', domain: 'Middelen', question: 'Is er voldoende kennis over nieuwe technologie (zoals AI)?', hint: 'Technologische awareness.' },
  { id: 'r10', domain: 'Middelen', question: 'Is de liquiditeitspositie gezond voor investeringen?', hint: 'Cashflow is op orde.' },

  // CULTURE (10)
  { id: 'c1', domain: 'Cultuur', question: 'Geloof de organisatie in de opgestelde missie?', hint: 'De "Why" wordt doorleefd.' },
  { id: 'c2', domain: 'Cultuur', question: 'Is er een veilige cultuur om fouten te maken?', hint: 'Psychologische veiligheid.' },
  { id: 'c3', domain: 'Cultuur', question: 'Wordt initiatief nemen aangemoedigd?', hint: 'Ondernemerschap op de werkvloer.' },
  { id: 'c4', domain: 'Cultuur', question: 'Is de communicatie intern open en eerlijk?', hint: 'Geen politieke spelletjes.' },
  { id: 'c5', domain: 'Cultuur', question: 'Is er een sterke focus op klantwaarde?', hint: 'Iedereen weet voor wie ze het doen.' },
  { id: 'c6', domain: 'Cultuur', question: 'Worden prestaties gevierd en erkend?', hint: 'Waardering voor resultaat.' },
  { id: 'c7', domain: 'Cultuur', question: 'Is er een gezonde balans tussen werk en privé?', hint: 'Duurzame inzetbaarheid.' },
  { id: 'c8', domain: 'Cultuur', question: 'Is de organisatie wendbaar (Agile mindset)?', hint: 'Snel kunnen aanpassen aan de markt.' },
  { id: 'c9', domain: 'Cultuur', question: 'Is er sprake van een inclusieve omgeving?', hint: 'Diversiteit in denken en doen.' },
  { id: 'c10', domain: 'Cultuur', question: 'Dragen kernwaarden bij aan de strategie?', hint: 'Cultuur werkt niet tegen de koers.' },

  // PEOPLE (10)
  { id: 'p1', domain: 'Mensen', question: 'Hebben we de juiste skills in huis voor de toekomst?', hint: 'Competentie-analyse.' },
  { id: 'p2', domain: 'Mensen', question: 'Is er een duidelijk plan voor talentontwikkeling?', hint: 'Groeipad voor medewerkers.' },
  { id: 'p3', domain: 'Mensen', question: 'Is de werkdruk op een gezond niveau?', hint: 'Voorkomen van burn-outs.' },
  { id: 'p4', domain: 'Mensen', question: 'Is de medewerker-betrokkenheid (eNPS) hoog?', hint: 'Mensen zijn trots op hun werk.' },
  { id: 'p5', domain: 'Mensen', question: 'Is het verloop binnen de organisatie laag?', hint: 'Behoud van talent.' },
  { id: 'p6', domain: 'Mensen', question: 'Is leiderschap inspirerend en coachend?', hint: 'Managers zijn dienende leiders.' },
  { id: 'p7', domain: 'Mensen', question: 'Is recruitment succesvol in het vinden van talent?', hint: 'Aantrekkingskracht op de markt.' },
  { id: 'p8', domain: 'Mensen', question: 'Worden kennis en best-practices gedeeld?', hint: 'Lerende organisatie.' },
  { id: 'p9', domain: 'Mensen', question: 'Is er een goede mix van ervaring en nieuw talent?', hint: 'Generatiemanagement.' },
  { id: 'p10', domain: 'Mensen', question: 'Zijn medewerkers gemotiveerd om de doelen te halen?', hint: 'Intrinsieke motivatie.' },
];

const FitCheck: React.FC<Props> = ({ data, onUpdate, onNavigate }) => {
  const [activeSubTab, setActiveSubTab] = useState('Assessment');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const currentQuestion = QUESTIONS[step];
  const progress = Math.round(((step + 1) / QUESTIONS.length) * 100);

  const handleAnswer = (val: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }));
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setShowSummary(true);
    }
  };

  const calculateDomainScores = () => {
    const domains = ['Structuur', 'Middelen', 'Cultuur', 'Mensen'];
    return domains.map(dom => {
      const domQuestions = QUESTIONS.filter(q => q.domain === dom);
      const sum = domQuestions.reduce((acc, q) => acc + (answers[q.id] || 0), 0);
      return { domain: dom, score: Math.round(sum / domQuestions.length) };
    });
  };

  const handleAIAnalysis = async () => {
      setAnalyzing(true);
      // Passing QUESTIONS as the 3rd parameter to the refactored runFitCheckInterpretation
      const interpretation = await runFitCheckInterpretation(data, answers, QUESTIONS);
      
      if (interpretation.length > 0) {
          onUpdate({ 
              fitCheckScores: interpretation as FitCheckScore[],
              history: [...data.history, { 
                  date: new Date().toISOString().split('T')[0], 
                  totalFitScore: interpretation.reduce((a,b) => a+b.score, 0) / interpretation.length,
                  domainScores: interpretation.reduce((acc, curr) => ({...acc, [curr.domain]: curr.score}), {})
              }]
          });
          setActiveSubTab('Resultaten');
          setShowSummary(false);
      }
      setAnalyzing(false);
  };

  const getDomainIcon = (domain: string) => {
      if (domain.includes('Structuur')) return Settings;
      if (domain.includes('Middelen')) return Database;
      if (domain.includes('Cultuur')) return Users;
      return Zap;
  };

  const radarData = useMemo(() => {
    return data.fitCheckScores.map(s => ({
      domain: s.domain,
      score: s.score
    }));
  }, [data.fitCheckScores]);

  return (
    <div className="space-y-10 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Badge color="purple" className="mb-4">STRATEGISCHE AUDIT</Badge>
            <h1 className="text-4xl md:text-5xl font-black text-blackDark tracking-tight">FITCheck Assessment.</h1>
            <p className="text-grayDark mt-2 font-medium">Analyseer de vlijmscherpe verbinding tussen je ambities en je inrichting.</p>
          </div>
          <div className="flex gap-4">
              <Button variant="outline" onClick={() => setActiveSubTab('Assessment')} className="rounded-2xl border-gray-200">Start Nieuwe Check</Button>
          </div>
      </div>

      <Tabs tabs={['Assessment', 'Resultaten', 'Benchmark']} activeTab={activeSubTab} onChange={setActiveSubTab} />

      {activeSubTab === 'Assessment' && !showSummary && (
        <div className="max-w-3xl mx-auto py-10">
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
               <Badge color="blue">{currentQuestion.domain}</Badge>
               <span className="text-[10px] font-black text-grayMedium uppercase tracking-widest">Vraag {step + 1} van {QUESTIONS.length}</span>
            </div>
            <div className="h-2 bg-grayLight rounded-full overflow-hidden">
               <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <Card className="p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Sparkles className="h-32 w-32" />
            </div>
            <h2 className="text-3xl font-black text-blackDark mb-6 leading-tight">{currentQuestion.question}</h2>
            <p className="text-grayDark font-medium mb-12 italic opacity-60">"{currentQuestion.hint}"</p>
            
            <div className="grid grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  onClick={() => handleAnswer(val)}
                  className={`h-20 rounded-2xl flex flex-col items-center justify-center transition-all border-2 font-black text-xl
                    ${answers[currentQuestion.id] === val ? 'bg-primary text-white border-primary shadow-xl scale-110' : 'bg-white text-grayDark border-gray-100 hover:border-primary/50'}`}
                >
                  {val}
                  <span className="text-[8px] font-black uppercase mt-1 opacity-60">
                    {val === 1 ? 'Slecht' : val === 5 ? 'Uitstekend' : ''}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-between mt-12">
               <button 
                 disabled={step === 0} 
                 onClick={() => setStep(step - 1)}
                 className="flex items-center gap-2 text-grayMedium hover:text-grayDark disabled:opacity-30 font-bold"
               >
                 <ChevronLeft className="h-5 w-5" /> Vorige
               </button>
               {answers[currentQuestion.id] && (
                 <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 text-primary font-bold">
                    Volgende <ChevronRight className="h-5 w-5" />
                 </button>
               )}
            </div>
          </Card>
        </div>
      )}

      {showSummary && (
        <Modal isOpen={showSummary} onClose={() => setShowSummary(false)} title="Assessment Voltooid">
           <div className="space-y-8">
              <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 text-center">
                 <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-6" />
                 <h3 className="text-2xl font-black text-blackDark mb-4">Alle 40 vragen beantwoord!</h3>
                 <p className="text-grayDark font-medium">Onze Gemini 3 Pro engine staat klaar om je antwoorden te vertalen naar een strategisch audit rapport.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 {calculateDomainScores().map(ds => (
                    <div key={ds.domain} className="p-6 bg-grayLight/30 rounded-3xl border border-gray-100">
                       <p className="text-[10px] font-black text-grayMedium uppercase mb-1">{ds.domain}</p>
                       <p className="text-2xl font-black text-blackDark">{ds.score}<span className="text-sm text-grayMedium">/5</span></p>
                    </div>
                 ))}
              </div>
              <AIButton onClick={handleAIAnalysis} loading={analyzing} label="Genereer AI Audit" className="w-full py-6 rounded-[2rem]" />
           </div>
        </Modal>
      )}

      {activeSubTab === 'Resultaten' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <Card className="lg:col-span-1 h-[450px]" title="FIT Radar Profiel" subtitle="ORGANISATIE BALANS">
             <div className="h-full w-full pb-8">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#E5E7EB" />
                        <PolarAngleAxis dataKey="domain" tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                        <Radar name="Score" dataKey="score" stroke="#3B82F6" strokeWidth={5} fill="#3B82F6" fillOpacity={0.1} />
                    </RadarChart>
                </ResponsiveContainer>
             </div>
          </Card>

          <div className="lg:col-span-2 space-y-6">
             {data.fitCheckScores.length > 0 ? data.fitCheckScores.map((score, i) => {
               const Icon = getDomainIcon(score.domain);
               return (
                <Card key={i} className="p-8 hover:shadow-2xl transition-all group">
                   <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-6">
                        <div className="h-14 w-14 bg-grayLight rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Icon className="h-7 w-7" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-blackDark">{score.domain}</h3>
                          <Badge color={score.score >= 4 ? 'green' : score.score >= 3 ? 'blue' : 'orange'}>
                            {score.score >= 4 ? 'Sterk' : score.score >= 3 ? 'Stabiel' : 'Kritiek'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-black text-blackDark">{score.score}<span className="text-sm text-grayMedium">/5</span></p>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${score.trend === 'up' ? 'text-green-500' : 'text-orange-500'}`}>Trend: {score.trend}</p>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <p className="text-sm font-medium text-grayDark leading-relaxed border-l-4 border-gray-100 pl-6 italic">"{score.description}"</p>
                      <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                         <p className="text-[10px] font-black text-primary uppercase mb-2 flex items-center gap-2"><Sparkles className="h-3 w-3" /> Strategische Actie</p>
                         <p className="text-sm font-bold text-primary">{score.suggestion}</p>
                      </div>
                   </div>
                </Card>
               )
             }) : (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100 opacity-40">
                  <BarChart2 className="h-16 w-16 mx-auto mb-4 text-grayMedium" />
                  <p className="text-lg font-bold">Nog geen audit resultaten beschikbaar.</p>
                  <Button onClick={() => setActiveSubTab('Assessment')} className="mt-6">Start Assessment</Button>
              </div>
             )}
          </div>
        </div>
      )}

      {activeSubTab === 'Benchmark' && (
        <Card title="Sector Vergelijking" subtitle="BENCHMARK DATA">
           <div className="p-20 text-center opacity-30">
              <Info className="h-12 w-12 mx-auto mb-4" />
              <p className="font-black uppercase tracking-widest">Sector-specifieke benchmark data wordt geladen na 3 assessments.</p>
           </div>
        </Card>
      )}
    </div>
  );
};

export default FitCheck;
