
import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Focus from './pages/Focus';
import Inrichting from './pages/Inrichting';
import Transitie from './pages/Transitie';
import FitCheck from './pages/FitCheck';
import Analyse from './pages/Analyse';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import { View, AppData, Domain, UserState, ActionItem } from './types';

const initialData: AppData = {
  orgProfile: {
      name: "Mijn Bedrijf BV",
      sector: "Technologie / SaaS",
      employees: 45,
      location: "Amsterdam",
      type: "Profit"
  },
  mission: "Wij helpen organisaties duurzaam groeien door slimme technologie in te zetten voor complexe vraagstukken.",
  vision: "In 2030 zijn wij de leidende partner in digitale transformatie voor het Europese MKB.",
  strategy: "Focus op schaalbare SaaS-oplossingen, klantgerichtheid verhogen door data-gedreven inzichten, en talentontwikkeling prioriteren.",
  strategicKPIs: [
    { id: '1', domain: 'Financieel', name: 'Totale Omzet', unit: '€', value2025: '750k', value2024: '600k', value2023: '450k', value2022: '', value2021: '' },
    { id: '7', domain: 'Klant', name: 'Net Promoter Score (NPS)', unit: 'Score', value2025: '72', value2024: '68', value2023: '65', value2022: '', value2021: '' },
    { id: '13', domain: 'Medewerker', name: 'Medewerkertevredenheid (eNPS)', unit: 'Score', value2025: '45', value2024: '40', value2023: '38', value2022: '', value2021: '' },
  ],
  stakeholders: [
    { id: '1', name: 'Directie', interest: 'High', power: 'High', engagement: 'High' },
    { id: '2', name: 'Medewerkers', interest: 'High', power: 'Medium', engagement: 'Medium' }
  ],
  strategicGoals: [
      { id: 'g1', wheel: 'Customer' as any, description: "Klanttevredenheid naar 8.5 brengen", term: 'Middellang', priority: 5, kpiId: '7' },
      { id: 'g2', wheel: 'Employee' as any, description: "eNPS verhogen naar 55", term: 'Kort', priority: 4, kpiId: '13' }
  ],
  externalAnalysis: [],
  actions: [
    { id: '1', title: "Implementeer nieuw CRM", type: 'Changing', status: 'doing', owner: 'Jan', deadline: '2025-06-01', impact: 5, linkedId: 'g1', origin: 'Goal' },
    { id: '2', title: "Sales training Q4", type: 'Running', status: 'todo', owner: 'Marieke', deadline: '2025-11-15', impact: 3, origin: 'Manual' },
  ],
  fitCheckScores: [
    { domain: Domain.STRATEGY, score: 4, description: "Sterke visie aanwezig.", suggestion: "Focus op executie." },
    { domain: Domain.TECHNOLOGY, score: 2, description: "Verouderde CRM bemmert groei.", suggestion: "Moderniseer stack." },
  ],
  inrichting: {
    structure: { type: "Functioneel", layers: 4, decisionMaking: "Centraal", choiceReason: "Specialisatie", spanOfControl: 8 },
    resources: { financial: "Gezond", trainingBudget: 1500, securityLevel: "Basis", digitalAssets: "Cloud", missingResources: "CRM" },
    culture: { type: "Hiërarchisch", characteristics: ["Betrouwbaar"], barriers: "Angst", strategyFit: "Partial" },
    people: { totalFte: 45, turnover: 5, leadershipStyle: "Directief", eNPS: 7, gaps: "Data skills" },
    gapAnalysis: []
  },
  history: [
      { date: '2024-01-01', totalFitScore: 2.8, domainScores: { [Domain.STRATEGY]: 3 } },
      { date: '2024-03-31', totalFitScore: 3.2, domainScores: { [Domain.STRATEGY]: 4 } }
  ]
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.LANDING);
  const [user, setUser] = useState<UserState>({ isAuthenticated: false, name: "", organization: "", email: "", role: "user" });
  const [appData, setAppData] = useState<AppData>(initialData);

  const handleUpdate = (newData: Partial<AppData>) => setAppData(prev => ({ ...prev, ...newData }));

  const handleLogin = (newUser: UserState) => {
    setUser(newUser);
    setCurrentView(View.DASHBOARD);
  };

  const handleLogout = () => {
    setUser({ isAuthenticated: false, name: "", organization: "", email: "", role: "user" });
    setCurrentView(View.LANDING);
  };

  const renderView = () => {
    switch (currentView) {
      case View.LANDING:
        return <LandingPage onNavigate={setCurrentView} />;
      case View.LOGIN:
        return <LoginPage onLogin={handleLogin} onNavigate={setCurrentView} />;
      case View.DASHBOARD: 
        return <Dashboard data={appData} onNavigate={setCurrentView} onUpdate={handleUpdate} />;
      case View.FOCUS: 
        return <Focus data={appData} onUpdate={handleUpdate} onNavigate={setCurrentView} />;
      case View.INRICHTING: 
        return <Inrichting data={appData} onUpdate={handleUpdate} onAddActions={(a) => handleUpdate({ actions: [...appData.actions, ...a] })} onNavigate={setCurrentView} />;
      case View.TRANSITIE: 
        return <Transitie data={appData} onUpdate={handleUpdate} onNavigate={setCurrentView} />;
      case View.FITCHECK: 
        return <FitCheck data={appData} onUpdate={handleUpdate} onNavigate={setCurrentView} />;
      case View.ANALYSE: 
        return <Analyse data={appData} onNavigate={setCurrentView} onUpdate={handleUpdate} />;
      case View.SETTINGS: 
        return <Settings data={appData} user={user} onLogout={handleLogout} />;
      default: 
        return <Dashboard data={appData} onNavigate={setCurrentView} onUpdate={handleUpdate} />;
    }
  };

  // If not authenticated, we only allow Landing or Login
  if (!user.isAuthenticated) {
    if (currentView === View.LANDING) return <LandingPage onNavigate={setCurrentView} />;
    if (currentView === View.LOGIN) return <LoginPage onLogin={handleLogin} onNavigate={setCurrentView} />;
    // Fallback if trying to access deep links
    return <LandingPage onNavigate={setCurrentView} />;
  }

  // If authenticated, we wrap in Layout
  return (
    <Layout 
      currentView={currentView} 
      onNavigate={setCurrentView} 
      user={user} 
      onLogout={handleLogout} 
      data={appData}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
