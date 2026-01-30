
import React from 'react';
import { AppData, UserState } from '../types';
import { Card, Input, Button } from '../components/Shared';
import { User, Shield, CreditCard, Bell } from 'lucide-react';

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
                {activeTab === 'Organisatie' && <Card title="Organisatie & Facturatie">{renderOrg()}</Card>}
                {activeTab === 'Notificaties' && (
                  <Card title="Notificaties">
                    <p className="text-sm text-grayMedium font-bold italic">Notificatie instellingen komen binnenkort beschikbaar.</p>
                  </Card>
                )}
                {activeTab === 'Beveiliging' && (
                  <Card title="Beveiliging">
                    <p className="text-sm text-grayMedium font-bold italic">Two-factor authenticatie en beveiligingslogs zijn in ontwikkeling.</p>
                  </Card>
                )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default Settings;
