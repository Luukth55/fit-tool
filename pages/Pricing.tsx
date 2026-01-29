
import React from 'react';
import { View } from '../types';
import { Button, Badge, Card } from '../components/Shared';
import { ArrowLeft, Check, X, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  onNavigate: (view: View) => void;
}

const Pricing: React.FC<Props> = ({ onNavigate }) => {
  const plans = [
    {
      name: 'Starter',
      price: '€ 149',
      desc: 'Voor kleinere teams die grip willen op hun koers.',
      features: ['Focus Module basis', 'Max 5 acties in Transitie', 'Standaard FITCheck', 'Community Support'],
      not: ['AI Organogram Audit', 'Custom KPI\'s', 'PDF Export'],
      cta: 'Start Gratis'
    },
    {
      name: 'Professional',
      price: '€ 399',
      desc: 'Voor ambitieuze organisaties die data-gedreven willen sturen.',
      features: ['Alle Modules inclusief', 'Onbeperkt aantal acties', 'Advanced AI Engine Access', 'Real-time Markt Research', 'PDF Rapportages', 'Prioriteit Support'],
      not: [],
      cta: 'Meest Gekozen',
      highlight: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      desc: 'Voor grootschalige transformaties en consultancies.',
      features: ['Multi-organisatie beheer', 'White-label rapportages', 'On-premise AI opties', 'Dedicated Strategist support', 'API Integraties', 'Custom Training'],
      not: [],
      cta: 'Contact Sales'
    }
  ];

  return (
    <div className="min-h-screen bg-grayLight/30">
      <nav className="p-8">
        <button onClick={() => onNavigate(View.LANDING)} className="flex items-center gap-2 text-grayMedium hover:text-primary font-bold transition-colors">
          <ArrowLeft className="h-5 w-5" /> Terug naar Home
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-24">
          <Badge color="blue" className="mb-6">TRANSPARENT PRICING</Badge>
          <h1 className="text-5xl md:text-7xl font-black text-blackDark tracking-tight mb-8">
            Investeer in <br /><span className="text-primary">jouw veranderkracht.</span>
          </h1>
          <p className="text-xl text-grayDark max-w-3xl mx-auto leading-relaxed">
            Geen verborgen kosten. Schaalbare plannen die meegroeien met de ambitie van je organisatie.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map(plan => (
            <Card key={plan.name} className={`p-12 relative flex flex-col h-full border-2 ${plan.highlight ? 'border-primary shadow-2xl scale-105 z-10' : 'border-transparent shadow-xl'}`}>
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg">
                  Popular Choice
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-2xl font-black text-blackDark mb-2">{plan.name}</h3>
                <p className="text-grayMedium text-sm font-bold">{plan.desc}</p>
              </div>
              <div className="mb-10">
                <span className="text-5xl font-black text-blackDark">{plan.price}</span>
                {plan.price !== 'Custom' && <span className="text-grayMedium font-bold ml-2">/ maand</span>}
              </div>
              
              <ul className="space-y-4 mb-12 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm font-bold text-blackDark">
                    <Check className="h-5 w-5 text-green-500 shrink-0" /> {f}
                  </li>
                ))}
                {plan.not.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm font-bold text-grayMedium opacity-50">
                    <X className="h-5 w-5 text-red-500 shrink-0" /> {f}
                  </li>
                ))}
              </ul>

              <Button variant={plan.highlight ? 'primary' : 'outline'} className="w-full py-5 rounded-2xl" onClick={() => onNavigate(View.LOGIN)}>
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-32 p-12 bg-white rounded-[3rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-gray-100">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-primary">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <div>
              <h4 className="text-xl font-black text-blackDark">Non-profit of Onderwijs?</h4>
              <p className="text-grayDark font-medium">Wij steunen maatschappelijke impact. Vraag naar onze 50% korting voor non-profit organisaties.</p>
            </div>
          </div>
          <Button variant="outline" className="px-10">Vraag korting aan</Button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
