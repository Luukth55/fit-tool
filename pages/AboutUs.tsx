
import React from 'react';
import { View } from '../types';
import { Button, Badge, Card } from '../components/Shared';
import { ArrowLeft, Users, Heart, Target, Globe } from 'lucide-react';

interface Props {
  onNavigate: (view: View) => void;
}

const AboutUs: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white">
      <nav className="p-8">
        <button onClick={() => onNavigate(View.LANDING)} className="flex items-center gap-2 text-grayMedium hover:text-primary font-bold transition-colors">
          <ArrowLeft className="h-5 w-5" /> Terug naar Home
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-32">
          <Badge color="purple" className="mb-6">ONZE MISSIE</Badge>
          <h1 className="text-5xl md:text-7xl font-black text-blackDark tracking-tight mb-8">
            Verandering <span className="text-primary">beheersbaar</span> maken.
          </h1>
          <p className="text-2xl text-grayDark leading-relaxed">
            Wij geloven dat organisaties beter presteren wanneer iedereen weet waar de reis naartoe gaat, en wanneer de inrichting die reis ondersteunt.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-32 items-center">
          <div className="space-y-10">
            <div className="flex gap-6">
              <div className="h-14 w-14 bg-primary text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                <Target className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-blackDark mb-2">Waarom we dit doen</h3>
                <p className="text-grayDark leading-relaxed">
                  Te veel briljante strategieën sterven in een bureaula. Wij zagen hoe consultants duizenden uren besteedden aan analyses die na een maand verouderd waren. Dat moest anders. Wij wilden een levend systeem bouwen dat strategie verbindt aan de dagelijkse realiteit.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="h-14 w-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center shrink-0 border border-blue-100">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-blackDark mb-2">Ons Team</h3>
                <p className="text-grayDark leading-relaxed">
                  We zijn een hybride team van ervaren organisatie-strategen en gespecialiseerde AI-engineers. Deze combinatie van domeinkennis en technologie stelt ons in staat om de FIT Tool continu te innoveren.
                </p>
              </div>
            </div>
          </div>
          <div className="relative">
             <div className="absolute -inset-4 bg-primary/10 rounded-[4rem] rotate-3"></div>
             <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" alt="Team" className="relative rounded-[3rem] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-12 text-center">
            <h4 className="text-5xl font-black text-primary mb-4">200+</h4>
            <p className="font-bold text-grayDark uppercase tracking-widest text-sm">Organisaties geholpen</p>
          </Card>
          <Card className="p-12 text-center">
            <h4 className="text-5xl font-black text-primary mb-4">87%</h4>
            <p className="font-bold text-grayDark uppercase tracking-widest text-sm">Betere doel-realisatie</p>
          </Card>
          <Card className="p-12 text-center">
            <h4 className="text-5xl font-black text-primary mb-4">15k+</h4>
            <p className="font-bold text-grayDark uppercase tracking-widest text-sm">Acties geautomatiseerd</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
