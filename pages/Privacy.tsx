
import React from 'react';
import { View } from '../types';
import { Button, Badge, Card } from '../components/Shared';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, FileText } from 'lucide-react';

interface Props {
  onNavigate: (view: View) => void;
}

const Privacy: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white">
      <nav className="p-8">
        <button onClick={() => onNavigate(View.LANDING)} className="flex items-center gap-2 text-grayMedium hover:text-primary font-bold transition-colors">
          <ArrowLeft className="h-5 w-5" /> Terug naar Home
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="mb-20">
          <Badge color="green" className="mb-6">VEILIG & VERTROUWD</Badge>
          <h1 className="text-5xl md:text-6xl font-black text-blackDark tracking-tight mb-8">
            Privacy & <br /><span className="text-primary">Data Veiligheid.</span>
          </h1>
          <p className="text-xl text-grayDark leading-relaxed">
            Bij FIT Tool nemen we de veiligheid van jouw strategische data uiterst serieus. Hier lees je hoe wij omgaan met jouw informatie.
          </p>
        </div>

        <div className="space-y-12">
          <section className="space-y-6">
            <h2 className="text-3xl font-black text-blackDark flex items-center gap-4">
              <ShieldCheck className="h-8 w-8 text-primary" /> Data Eigenaarschap
            </h2>
            <p className="text-grayDark leading-relaxed">
              Alle data die je invoert in de FIT Tool — inclusief missie, strategie, KPI's en actieplannen — blijft te allen tijde eigendom van jouw organisatie. Wij claimen geen enkel recht op deze informatie en gebruiken deze uitsluitend om de overeengekomen diensten te leveren.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-black text-blackDark flex items-center gap-4">
              <Lock className="h-8 w-8 text-primary" /> AI Data Gebruik
            </h2>
            <p className="text-grayDark leading-relaxed">
              Onze AI-engine maakt gebruik van gesloten API's van Gemini (Google Cloud). In tegenstelling tot publieke versies van deze tools, wordt jouw data **niet** gebruikt om de modellen te trainen voor publiek gebruik. Jouw invoer blijft binnen de beveiligde omgeving van jouw eigen FIT Tool instantie.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-black text-blackDark flex items-center gap-4">
              <EyeOff className="h-8 w-8 text-primary" /> Toegang & Beveiliging
            </h2>
            <ul className="list-disc pl-6 space-y-4 text-grayDark">
              <li><strong>Encryptie:</strong> Alle data wordt versleuteld verzonden (SSL) en opgeslagen (AES-256).</li>
              <li><strong>Hosting:</strong> Onze servers staan op Europese bodem en voldoen aan alle GDPR-wetgeving.</li>
              <li><strong>Authenticatie:</strong> We ondersteunen 2FA en SSO voor zakelijke accounts om onbedoelde toegang te voorkomen.</li>
            </ul>
          </section>

          <Card className="p-10 bg-grayLight/30 border-none shadow-none">
            <div className="flex gap-6 items-start">
               <FileText className="h-10 w-10 text-primary shrink-0" />
               <div>
                  <h4 className="font-black text-blackDark mb-2">ISO 27001 Standaarden</h4>
                  <p className="text-sm text-grayDark leading-relaxed">
                    Hoewel wij een SaaS-platform zijn, hanteren wij interne processen die volledig in lijn zijn met de ISO 27001 normen voor informatiebeveiliging. Jaarlijks voeren wij onafhankelijke audits uit om dit te waarborgen.
                  </p>
               </div>
            </div>
          </Card>

          <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
             <p className="text-sm text-grayMedium font-medium italic">Laatste update: 12 mei 2025</p>
             <Button onClick={() => window.print()} variant="outline">Download PDF Versie</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
