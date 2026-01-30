import React from 'react';
import { AppData, UserState } from '../types';
import { Card, Input, Button, Badge } from '../components/Shared';
import { User, Shield, CreditCard, Bell, Key } from 'lucide-react';
import APIKeySettings from '../components/APIKeySettings';

interface Props {
  data: AppData;
  user: UserState;
  onLogout: () => void;
}

const Settings: React.FC<Props> = ({ data, user, onLogout }) => {
  const [activeTab, setActiveTab] = React.useState('Account');

  const renderAccount = () => (
      <div className="max-w-xl space-y-6">
          <Input label="Naam" defaultValue={user.name} />
          <Input label="Email" defaultValue={user.email} />
          <Input label="Wachtwoord" type="password" placeholder="••••••••" />
          <Button>Wijzigingen Opslaan</Button>
      </div>
  );

  const renderOrg = () => (
      <div className="max-w-xl space-y-6">
          <Input label="Organisatienaam" defaultValue={data.orgProfile.name} />
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900">FIT Tool Professional</h4>
              <p className="text-sm text-gray-500 mt-1">Actief tot 31 dec 2025</p>
              <div className="mt-4 flex gap-3">
                  <Button variant="outline" size="sm">Facturen</Button>
                  <Button variant="primary" size="sm">Upgrade Plan</Button>
              </div>
          </div>
      </div>
  );

  const renderNotifications = () => (
    <div className="max-w-xl space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-black text-grayMedium uppercase tracking-widest">
          Email Notificaties
        </h3>
        
        <label className="flex items-center justify-between p-4 bg-grayLight/30 rounded-2xl border border-gray-100 cursor-pointer hover:border-primary/20 transition-all">
          <div>
            <div className="font-black text-blackDark text-sm">FITCheck Herinneringen</div>
            <div className="text-xs text-grayMedium font-medium mt-1">
              Ontvang maandelijkse reminder om je FITCheck bij te werken
            </div>
          </div>
          <input type="checkbox" defaultChecked className="h-5 w-5 text-primary rounded" />
        </label>
  
        <label className="flex items-center justify-between p-4 bg-grayLight/30 rounded-2xl border border-gray-100 cursor-pointer hover:border-primary/20 transition-all">
          <div>
            <div className="font-black text-blackDark text-sm">Deadline Alerts</div>
            <div className="text-xs text-grayMedium font-medium mt-1">
              Notificatie 3 dagen voor actie deadline
            </div>
          </div>
          <input type="checkbox" defaultChecked className="h-5 w-5 text-primary rounded" />
        </label>
  
        <label className="flex items-center justify-between p-4 bg-grayLight/30 rounded-2xl border border-gray-100 cursor-pointer hover:border-primary/20 transition-all">
          <div>
            <div className="font-black text-blackDark text-sm">AI Insights</div>
            <div className="text-xs text-grayMedium font-medium mt-1">
              Wekelijkse AI analyse met strategische aanbevelingen
            </div>
          </div>
          <input type="checkbox" className="h-5 w-5 text-primary rounded" />
        </label>
  
        <label className="flex items-center justify-between p-4 bg-grayLight/30 rounded-2xl border border-gray-100 cursor-pointer hover:border-primary/20 transition-all">
          <div>
            <div className="font-black text-blackDark text-sm">Gap Alerts</div>
            <div className="text-xs text-grayMedium font-medium mt-1">
              Notificatie bij kritieke gaps tussen doelen en inrichting
            </div>
          </div>
          <input type="checkbox" defaultChecked className="h-5 w-5 text-primary rounded" />
        </label>
      </div>
  
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-sm font-black text-grayMedium uppercase tracking-widest mb-4">
          Notificatie Frequentie
        </h3>
        <select className="w-full p-4 border border-gray-100 bg-grayLight/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold text-blackDark">
          <option>Direct (real-time)</option>
          <option>Dagelijks (samenvatting om 9:00)</option>
          <option>Wekelijks (elke maandag)</option>
          <option>Maandelijks (eerste van de maand)</option>
        </select>
      </div>
  
      <Button>Voorkeuren Opslaan</Button>
    </div>
  );

  const renderSecurity = () => (
    <div className="max-w-xl space-y-6">
      <div className="p-6 bg-green-50 border border-green-200 rounded-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-black text-green-900 text-sm">Account Beveiligd</div>
            <div className="text-xs text-green-700 font-medium">Laatste login: Vandaag om 10:23</div>
          </div>
        </div>
      </div>
  
      <div className="space-y-4">
        <h3 className="text-sm font-black text-grayMedium uppercase tracking-widest">
          Beveiligingsopties
        </h3>
  
        <div className="p-4 bg-grayLight/30 rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-black text-blackDark text-sm">Two-Factor Authenticatie</div>
              <div className="text-xs text-grayMedium font-medium mt-1">
                Extra beveiligingslaag via SMS of authenticator app
              </div>
            </div>
            <Badge color="gray">Binnenkort</Badge>
          </div>
          <Button variant="outline" size="sm" disabled>Activeren</Button>
        </div>
  
        <div className="p-4 bg-grayLight/30 rounded-2xl border border-gray-100">
          <div className="font-black text-blackDark text-sm mb-3">Sessie Management</div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 bg-white rounded-lg">
              <span className="text-grayMedium font-medium">Huidige sessie (Chrome op Windows)</span>
              <span className="text-green-600 font-bold">Actief</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="mt-3">Alle andere sessies beëindigen</Button>
        </div>
  
        <div className="p-4 bg-grayLight/30 rounded-2xl border border-gray-100">
          <div className="font-black text-blackDark text-sm mb-2">Data Export & Verwijdering</div>
          <div className="text-xs text-grayMedium font-medium mb-3">
            Download al je data of verwijder permanent je account
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">Download Data (GDPR)</Button>
            <Button variant="danger" size="sm">Verwijder Account</Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-blackDark tracking-tight">Instellingen.</h1>
          <p className="text-grayDark mt-2 font-medium">Beheer je account, organisatie en systeem-integraties.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
              <nav className="space-y-2">
                  {[
                      { name: 'Account', icon: User },
                      { name: 'API Configuratie', icon: Key },
                      { name: 'Organisatie', icon: CreditCard },
                      { name: 'Notificaties', icon: Bell },
                      { name: 'Beveiliging', icon: Shield },
                  ].map((item) => (
                      <button
                          key={item.name}
                          onClick={() => setActiveTab(item.name)}
                          className={`w-full flex items-center px-6 py-4 text-sm font-black uppercase tracking-widest rounded-2xl transition-all ${
                              activeTab === item.name 
                                  ? 'bg-primary text-white shadow-xl shadow-blue-500/20 translate-x-1' 
                                  : 'text-grayMedium hover:bg-grayLight hover:text-grayDark'
                          }`}
                      >
                          <item.icon className="h-5 w-5 mr-3" />
                          {item.name}
                      </button>
                  ))}
              </nav>
              <div className="mt-8 pt-8 border-t border-gray-100">
                  <Button variant="danger" className="w-full justify-start py-4" onClick={onLogout}>
                      Uitloggen
                  </Button>
              </div>
          </div>

          <div className="md:col-span-3">
              <div className="space-y-8">
                {activeTab === 'Account' && <Card title="Mijn Profiel">{renderAccount()}</Card>}
                {activeTab === 'API Configuratie' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-2xl">
                      <p className="text-sm font-bold text-yellow-900">
                        ⚠️ <strong>Let op:</strong> De API engine is beveiligd en automatisch geconfigureerd. 
                        Individuele sleutel-beheer is beperkt tot systeembeheerders.
                      </p>
                    </div>
                    <APIKeySettings />
                  </div>
                )}
                {activeTab === 'Organisatie' && <Card title="Organisatie & Facturatie">{renderOrg()}</Card>}
                {activeTab === 'Notificaties' && <Card title="Notificatie Voorkeuren">{renderNotifications()}</Card>}
                {activeTab === 'Beveiliging' && <Card title="Beveiliging & Privacy">{renderSecurity()}</Card>}
              </div>
          </div>
      </div>
    </div>
  );
};

export default Settings;