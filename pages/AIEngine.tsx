
import React from 'react';
import { View } from '../types';
import { Button, Badge, Card } from '../components/Shared';
import { ArrowLeft, Zap, ShieldCheck, Globe, Cpu, Search, Lock } from 'lucide-react';

interface Props {
  onNavigate: (view: View) => void;
}

const AIEngine: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-blackDark text-white">
      <nav className="p-8">
        <button onClick={() => onNavigate(View.LANDING)} className="flex items-center gap-2 text-grayMedium hover:text-primary font-bold transition-colors">
          <ArrowLeft className="h-5 w-5" /> Terug naar Home
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-24">
          <Badge color="blue" className="bg-primary/20 text-primary border-primary/30 mb-6">NEXT-GEN INTELLIGENCE</Badge>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8">
            Gedreven door <span className="text-primary">Gemini 3 Pro.</span>
          </h1>
          <p className="text-xl text-grayMedium max-w-3xl mx-auto leading-relaxed">
            De FIT Tool AI Engine is geen simpele chatbot. Het is een diep geïntegreerd systeem dat je volledige organisatie-context begrijpt en vertaalt naar strategische intelligentie.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10">
            <Cpu className="h-12 w-12 text-primary mb-8" />
            <h3 className="text-2xl font-black mb-4">Deep Context Analysis</h3>
            <p className="text-grayMedium leading-relaxed">
              Onze AI analyseert niet alleen tekst, maar de volledige samenhang tussen missie, inrichting en resultaten. Het ontdekt gaten die voor menselijke adviseurs onzichtbaar blijven.
            </p>
          </div>
          <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10">
            <Search className="h-12 w-12 text-primary mb-8" />
            <h3 className="text-2xl font-black mb-4">Real-time Web Research</h3>
            <p className="text-grayMedium leading-relaxed">
              Via Google Search grounding doorzoekt onze engine live het web naar sector-trends, wetgeving en concurrentie die van invloed zijn op jouw specifieke sector.
            </p>
          </div>
          <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10">
            <Lock className="h-12 w-12 text-primary mb-8" />
            <h3 className="text-2xl font-black mb-4">Privacy by Design</h3>
            <p className="text-grayMedium leading-relaxed">
              Jouw data blijft van jou. Onze Gemini-integratie is geconfigureerd volgens de strengste standaarden; data wordt niet gebruikt om publieke modellen te trainen.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-blue-900/20 rounded-[3rem] p-12 md:p-20 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-black">AI-gestuurde Audits</h2>
              <p className="text-xl text-grayMedium leading-relaxed">
                De FIT Tool voert autonoom audits uit op verschillende niveaus:
              </p>
              <div className="space-y-6">
                {[
                  { title: "Consistentie Audit", desc: "Valideert of de missie, visie en strategie logisch op elkaar aansluiten." },
                  { title: "System-Gap Analyse", desc: "Berekent de mismatch tussen je inrichting en je gewenste koers." },
                  { title: "Organogram Audit", desc: "Analyseert afbeeldingen van je structuur op hiaten en span-of-control." }
                ].map(a => (
                  <div key={a.title} className="flex gap-4">
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                      <Zap className="h-3 w-3 fill-current" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg">{a.title}</h4>
                      <p className="text-grayMedium text-sm">{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-10 bg-primary/20 blur-[100px] rounded-full"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
                 <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                    <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
                      <Zap className="h-5 w-5 fill-current" />
                    </div>
                    <span className="font-black uppercase tracking-widest text-xs">AI Insight Processing</span>
                 </div>
                 <div className="space-y-4">
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-primary w-2/3 animate-pulse"></div>
                    </div>
                    <p className="text-sm italic text-grayMedium">"De trend in je medewerkertevredenheid correleert negatief met de verhoogde span-of-control in de IT-afdeling. Dit vormt een risico voor je digitale transformatie doelen voor 2025."</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIEngine;
