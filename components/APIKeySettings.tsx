import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { Card, Badge } from './Shared';

/**
 * Note: Manual API key entry is disabled for security reasons per Google GenAI guidelines.
 * The application relies on system-provided environment variables (process.env.API_KEY).
 */
const APIKeySettings: React.FC = () => {
  return (
    <Card className="overflow-hidden border-2 border-primary/10 shadow-2xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-black text-blackDark tracking-tight">AI Veiligheid & Privacy</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge color="green">Systeem Gevalideerd</Badge>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
            <Info className="h-3.5 w-3.5" /> Informatie
          </div>
          <p className="text-[11px] font-medium text-blue-900 leading-relaxed">
            De FIT Tool maakt gebruik van een beveiligde enterprise-omgeving. Jouw data wordt versleuteld verwerkt via Gemini 3 Pro en wordt nooit gebruikt om publieke modellen te trainen.
          </p>
        </div>

        <p className="text-[10px] text-center text-grayMedium font-bold italic">
          Toegang tot de AI Engine is automatisch geconfigureerd via de veilige organisatie-omgeving. Handmatige invoer van sleutels is uitgeschakeld om uw beveiliging te waarborgen.
        </p>
      </div>
    </Card>
  );
};

export default APIKeySettings;