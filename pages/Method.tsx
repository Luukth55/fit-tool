
import React from 'react';
import { View } from '../types';
import { Button, Badge, Card } from '../components/Shared';
import { ArrowLeft, Target, GitBranch, Heart, Zap, ShieldCheck } from 'lucide-react';

interface Props {
  onNavigate: (view: View) => void;
}

const Method: React.FC<Props> = ({ onNavigate }) => {
  const domains = [
    { name: 'Strategie', icon: Target, desc: 'Is de koers helder en onderscheidend?' },
    { name: 'Structuur', icon: GitBranch, desc: 'Ondersteunt de hiërarchie de executie?' },
    { name: 'Cultuur', icon: Heart, desc: 'Geloof de organisatie in de missie?' },
    { name: 'Middelen', icon: Zap, desc: 'Is er genoeg budget en technologie?' },
    { name: 'Processen', icon: ShieldCheck, desc: 'Lopen de stromen efficiënt?' }
  ];

  return (
    <div className="min-h-screen bg-grayLight/30">
      <nav className="p-8">
        <button onClick={() => onNavigate(View.LANDING)} className="flex items-center gap-2 text-grayMedium hover:text-primary font-bold transition-colors">
          <ArrowLeft className="h-5 w-5" /> Terug naar Home
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <Badge color="blue" className="mb-6">HET FRAMEWORK</Badge>
          <h1 className="text-5xl md:text-7xl font-black text-blackDark tracking-tight mb-8">
            Strategie is <span className="text-primary">samenhang.</span>
          </h1>
          <p className="text-2xl text-grayDark leading-relaxed">
            De FIT-methodiek gaat ervan uit dat een organisatie een systeem is. Als één onderdeel niet 'fit' is, stagneert het geheel.
          </p>
        </div>

        <div className="bg-white rounded-[4rem] p-12 md:p-24 shadow-2xl mb-24 border border-gray-100">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
              <div className="space-y-12">
                 <div className="space-y-4">
                    <h2 className="text-4xl font-black text-blackDark">De 9 Domeinen van Fit</h2>
                    <p className="text-xl text-grayDark leading-relaxed">
                      Wij analyseren een organisatie op negen kritieke domeinen om te bepalen waar de werkelijke knelpunten zitten.
                    </p>
                 </div>
                 <div className="grid grid-cols-1 gap-6">
                    {domains.map(d => (
                       <div key={d.name} className="flex items-center gap-6 p-6 bg-grayLight/30 rounded-3xl border border-transparent hover:border-primary/20 transition-all group">
                          <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                             <d.icon className="h-7 w-7" />
                          </div>
                          <div>
                             <h4 className="font-black text-blackDark">{d.name}</h4>
                             <p className="text-sm text-grayMedium font-medium">{d.desc}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="relative flex justify-center">
                 <div className="absolute inset-0 bg-primary/5 rounded-full blur-[80px]"></div>
                 <div className="relative h-96 w-96 border-[20px] border-primary/10 rounded-full flex items-center justify-center">
                    <div className="h-64 w-64 border-[15px] border-primary/20 rounded-full flex items-center justify-center">
                       <div className="h-32 w-32 bg-primary rounded-full flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-primary/40">
                          FIT
                       </div>
                    </div>
                    {/* Floating domain tags around the circle */}
                    <div className="absolute top-0 bg-white px-4 py-2 rounded-xl shadow-lg font-black text-[10px] uppercase">Cultuur</div>
                    <div className="absolute bottom-10 right-0 bg-white px-4 py-2 rounded-xl shadow-lg font-black text-[10px] uppercase">Middelen</div>
                    <div className="absolute left-0 bg-white px-4 py-2 rounded-xl shadow-lg font-black text-[10px] uppercase">Structuur</div>
                 </div>
              </div>
           </div>
        </div>

        <div className="text-center max-w-3xl mx-auto">
           <h3 className="text-3xl font-black text-blackDark mb-8">Wetenschappelijk onderbouwd, praktisch uitgevoerd.</h3>
           <p className="text-grayDark leading-relaxed mb-12">
             Onze methode is gebaseerd op jarenlange ervaring in organisatie-advies en systeemdenken, gecombineerd met moderne technologische mogelijkheden.
           </p>
           <Button size="lg" className="px-12" onClick={() => onNavigate(View.LOGIN)}>Download de Whitepaper</Button>
        </div>
      </div>
    </div>
  );
};

export default Method;
