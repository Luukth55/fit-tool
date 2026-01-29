
import React from 'react';
import { View } from '../types';
import { Button, Badge, Card } from '../components/Shared';
import { ArrowLeft, Target, Layers, Activity, Zap, PieChart, ShieldCheck } from 'lucide-react';

interface Props {
  onNavigate: (view: View) => void;
}

const ProductFeatures: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white">
      <nav className="p-8">
        <button onClick={() => onNavigate(View.LANDING)} className="flex items-center gap-2 text-grayMedium hover:text-primary font-bold transition-colors">
          <ArrowLeft className="h-5 w-5" /> Terug naar Home
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-24">
          <Badge color="blue" className="mb-6">CAPABILITIES</Badge>
          <h1 className="text-5xl md:text-7xl font-black text-blackDark tracking-tight mb-8">
            Krachtige modules <br />voor <span className="text-primary">maximale grip.</span>
          </h1>
          <p className="text-xl text-grayDark max-w-3xl mx-auto leading-relaxed">
            Van abstracte visie naar concrete actie. Onze modules werken naadloos samen om je organisatie-fit te optimaliseren.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Card className="p-12 hover:shadow-2xl transition-all">
            <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-primary mb-8">
              <Target className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-black text-blackDark mb-6">Focus Module</h2>
            <p className="text-grayDark leading-relaxed mb-8">
              Leg de fundering van je organisatie vast. Definieer je missie, visie en kernstrategie. Koppel direct meetbare KPI's per waardewiel (Financieel, Klant, Medewerker, Organisatie, Sociaal) en ontvang direct AI-feedback op de consistentie van je ambities.
            </p>
            <ul className="space-y-4">
              {['Strategische consistentie-audit', 'KPI mapping per waardewiel', 'Stakeholder krachtenveld analyse', 'Real-time markt-research'].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm font-bold text-grayDark">
                  <div className="h-2 w-2 bg-primary rounded-full"></div> {f}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-12 hover:shadow-2xl transition-all">
            <div className="h-16 w-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-8">
              <Layers className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-black text-blackDark mb-6">Inrichting Module</h2>
            <p className="text-grayDark leading-relaxed mb-8">
              Maak de binnenkant van je organisatie zichtbaar. Breng de structuur, middelen, cultuur en mensen in kaart. Onze AI voert een 'System Gap' analyse uit om te bepalen of je huidige inrichting je strategie ondersteunt of juist tegenwerkt.
            </p>
            <ul className="space-y-4">
              {['Organogram visualisatie & audit', 'Digital maturity assessment', 'Cultuur-strategie fit check', 'Skills gap analyse'].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm font-bold text-grayDark">
                  <div className="h-2 w-2 bg-purple-600 rounded-full"></div> {f}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-12 hover:shadow-2xl transition-all">
            <div className="h-16 w-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-8">
              <Activity className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-black text-blackDark mb-6">Transitie Engine</h2>
            <p className="text-grayDark leading-relaxed mb-8">
              Zet inzichten om in actie. Beheer je strategische projecten in een dynamisch Kanban-board of tijdlijn. Elke actie kan direct worden gekoppeld aan een strategisch doel, waardoor de executiekracht van de organisatie direct meetbaar wordt.
            </p>
            <ul className="space-y-4">
              {['Dynamisch Kanban executie-board', 'Strategische actie-prioritering', 'Eigenaarschap & deadline monitoring', 'Impact & risico visualisatie'].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm font-bold text-grayDark">
                  <div className="h-2 w-2 bg-green-600 rounded-full"></div> {f}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-12 hover:shadow-2xl transition-all">
            <div className="h-16 w-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-8">
              <Zap className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-black text-blackDark mb-6">FIT Rapportage</h2>
            <p className="text-grayDark leading-relaxed mb-8">
              Het ultieme overzicht voor directie en MT. Een holistische radar-chart toont de fit-score op alle 9 domeinen. Volg de evolutie van je organisatie-fit door de tijd en identificeer direct de meest kritieke risico-gebieden in de heatmap.
            </p>
            <ul className="space-y-4">
              {['9-domeinen radar profiel', 'Strategische risico-heatmap', 'Historische fit-ontwikkeling', 'Directie-ready PDF rapportage'].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm font-bold text-grayDark">
                  <div className="h-2 w-2 bg-orange-600 rounded-full"></div> {f}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="mt-32 text-center p-20 bg-grayLight/30 rounded-[3rem] border border-gray-100">
          <h3 className="text-4xl font-black text-blackDark mb-8">Klaar om te optimaliseren?</h3>
          <Button size="lg" onClick={() => onNavigate(View.LOGIN)} className="px-12">Start nu je gratis analyse</Button>
        </div>
      </div>
    </div>
  );
};

export default ProductFeatures;
