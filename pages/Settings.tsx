import React from 'react';
import { AppData, UserState } from '../types';
import { Card, Input, Button, Tabs } from '../components/Shared';
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
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-gray-900">Instellingen</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
              <nav className="space-y-1">
                  {[
                      { name: 'Account', icon: User },
                      { name: 'Organisatie', icon: CreditCard },
                      { name: 'Notificaties', icon: Bell },
                      { name: 'Beveiliging', icon: Shield },
                  ].map((item) => (
                      <button
                          key={item.name}
                          onClick={() => setActiveTab(item.name)}
                          className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                              activeTab === item.name 
                                  ? 'bg-blue-50 text-blue-700' 
                                  : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                          <item.icon className="h-5 w-5 mr-3" />
                          {item.name}
                      </button>
                  ))}
              </nav>
              <div className="mt-8 pt-8 border-t border-gray-200">
                  <Button variant="danger" className="w-full justify-start" onClick={onLogout}>
                      Uitloggen
                  </Button>
              </div>
          </div>

          <div className="md:col-span-3">
              <Card title={activeTab}>
                  {activeTab === 'Account' && renderAccount()}
                  {activeTab === 'Organisatie' && renderOrg()}
                  {activeTab === 'Notificaties' && <p className="text-gray-500">Notificatie instellingen komen binnenkort.</p>}
                  {activeTab === 'Beveiliging' && <p className="text-gray-500">2FA en beveiligingslogs.</p>}
              </Card>
          </div>
      </div>
    </div>
  );
};

export default Settings;
