
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
import ProductFeatures from './pages/ProductFeatures';
import AIEngine from './pages/AIEngine';
import Pricing from './pages/Pricing';
import AboutUs from './pages/AboutUs';
import Method from './pages/Method';
import Privacy from './pages/Privacy';
import Layout from './components/Layout';
import { View, AppData, Domain, UserState, ActionItem, ValueWheel, PerformanceMetric } from './types';

const STORAGE_KEY = 'fit_tool_data';

const createStandardMetrics = (wheel: ValueWheel): PerformanceMetric[] => {
  const standards: Record<ValueWheel, {name: string, unit: string}[]> = {
    [ValueWheel.FINANCIAL]: [
      { name: 'Omzet', unit: '€' },
      { name: 'Winst', unit: '€' },
      { name: 'EBIT', unit: '€' },
      { name: 'Werkkapitaal', unit: '€' }
    ],
    [ValueWheel.CUSTOMER]: [
      { name: 'Klanttevredenheid', unit: 'Score' },
      { name: 'Retentie', unit: '%' },
      { name: 'Aantal klanten', unit: 'Aantal' },
      { name: 'Marktaandeel', unit: '%' }
    ],
    [ValueWheel.EMPLOYEE]: [
      { name: 'FTE', unit: 'Aantal' },
      { name: 'Verloop', unit: '%' },
      { name: 'Ziekteverzuim', unit: '%' },
      { name: 'eNPS', unit: 'Score' }
    ],
    [ValueWheel.ORGANIZATION]: [
      { name: 'Doorlooptijd', unit: 'Dagen' },
      { name: 'Foutmarge', unit: '%' },
      { name: 'Innovaties', unit: 'Aantal' },
      { name: 'Digitalisering', unit: '%' }
    ],
    [ValueWheel.SOCIAL]: [
      { name: 'CO2-uitstoot', unit: 'Ton' },
      { name: 'Diversiteit', unit: '%' },
      { name: 'MVO-score', unit: 'Score' },
      { name: 'Duurzame leveranciers', unit: '%' }
    ]
  };

  return standards[wheel].map((s, i) => ({
    id: `${wheel.toLowerCase()}_std_${i}`,
    wheel,
    name: s.name,
    unit: s.unit,
    isStandard: true,
    values: [
      { year: '2023', value: '' },
      { year: '2024', value: '' },
      { year: '2025', value: '' }
    ]
  }));
};

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
  strategicKPIs: [], // Deprecated in favor of performanceMetrics
  performanceMetrics: [
    ...createStandardMetrics(ValueWheel.FINANCIAL),
    ...createStandardMetrics(ValueWheel.CUSTOMER),
    ...createStandardMetrics(ValueWheel.EMPLOYEE),
    ...createStandardMetrics(ValueWheel.ORGANIZATION),
    ...createStandardMetrics(ValueWheel.SOCIAL)
  ],
  wheelContext: {
    [ValueWheel.FINANCIAL]: "",
    [ValueWheel.CUSTOMER]: "",
    [ValueWheel.EMPLOYEE]: "",
    [ValueWheel.ORGANIZATION]: "",
    [ValueWheel.SOCIAL]: ""
  },
  stakeholders: [
    { id: '1', name: 'Directie', interest: 'High', power: 'High', engagement: 'High' },
    { id: '2', name: 'Medewerkers', interest: 'High', power: 'Medium', engagement: 'Medium' }
  ],
  strategicGoals: [
      { id: 'g1', wheel: ValueWheel.CUSTOMER, description: "Klanttevredenheid naar 8.5 brengen", term: 'Middellang', priority: 5, kpiId: 'customer_std_0' },
      { id: 'g2', wheel: ValueWheel.EMPLOYEE, description: "eNPS verhogen naar 55", term: 'Kort', priority: 4, kpiId: 'employee_std_0' }
  ],
  externalAnalysis: [],
  actions: [
    { id: '1', title: "Implementeer nieuw CRM", type: 'Changing', status: 'doing', owner: 'Jan', deadline: '2025-06-01', impact: 5, linkedId: 'g1', origin: 'Goal', riskLevel: 'High' },
    { id: '2', title: "Sales training Q4", type: 'Running', status: 'todo', owner: 'Marieke', deadline: '2025-11-15', impact: 3, origin: 'Manual', riskLevel: 'Medium' },
  ],
  fitCheckScores: [],
  inrichting: {
    structure: { 
      type: "Functioneel", 
      layers: 4, 
      decisionMaking: "Centraal", 
      choiceReason: "Specialisatie", 
      spanOfControl: 8,
      meetingStructure: "Wekelijks MT, Dagelijks operationeel overleg.",
      governance: "Raad van Bestuur stelt koers vast.",
      rolesClarity: "Functieprofielen zijn up-to-date."
    },
    resources: { 
      financial: "Gezond, positieve cashflow.", 
      trainingBudget: 1500, 
      securityLevel: "Basis", 
      digitalAssets: "Cloud-native CRM & ERP", 
      physicalAssets: "Kantoorpand Amsterdam, Remote-work uitrusting.",
      criticalVendors: "AWS, Microsoft, Salesforce.",
      digitalMaturity: 65 
    },
    culture: { 
      type: "Hiërarchisch", 
      characteristics: ["Betrouwbaar", "Degelijk"], 
      barriers: "Angst voor fouten vertraagt innovatie.", 
      strategyFit: "Partial",
      coreValues: "Kwaliteit, Vertrouwen, Resultaat.",
      communicationStyle: "Formeel, via vaste lijnen.",
      recognitionRewards: "Jaarlijkse bonus gebaseerd op targets."
    },
    people: { 
      totalFte: 45, 
      turnover: 5, 
      leadershipStyle: "Directief", 
      eNPS: 7, 
      gaps: "Data skills & AI awareness.",
      recruitmentStrategy: "Direct sourcing via LinkedIn.",
      talentDevelopment: "Persoonlijke ontwikkelingsplannen.",
      diversityInclusion: "Beleid in ontwikkeling."
    },
    gapAnalysis: []
  },
  history: []
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.LANDING);
  const [user, setUser] = useState<UserState>(() => {
    const saved = localStorage.getItem('fit_tool_user');
    return saved ? JSON.parse(saved) : { isAuthenticated: false, name: "", organization: "", email: "", role: "user" };
  });
  
  const [appData, setAppData] = useState<AppData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration check for new performance metrics or structure
      if (!parsed.performanceMetrics || parsed.performanceMetrics.length === 0) {
        return { ...initialData, ...parsed, performanceMetrics: initialData.performanceMetrics, wheelContext: initialData.wheelContext };
      }
      return parsed;
    }
    return initialData;
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  }, [appData]);

  useEffect(() => {
    localStorage.setItem('fit_tool_user', JSON.stringify(user));
  }, [user]);

  // Autonomous Monitoring Effect (Simulates a running engine)
  useEffect(() => {
    if (user.isAuthenticated) {
      const interval = setInterval(() => {
        // Here we could trigger small AI audits or update "drift" scores
        console.log("Strategic Engine: Monitoring health...");
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user.isAuthenticated]);

  const handleUpdate = (newData: Partial<AppData>) => setAppData(prev => ({ ...prev, ...newData }));

  const handleLogin = (newUser: UserState) => {
    setUser(newUser);
    setCurrentView(View.DASHBOARD);
  };

  const handleLogout = () => {
    setUser({ isAuthenticated: false, name: "", organization: "", email: "", role: "user" });
    setCurrentView(View.LANDING);
    localStorage.removeItem('fit_tool_user');
  };

  const renderView = () => {
    switch (currentView) {
      case View.LANDING: return <LandingPage onNavigate={setCurrentView} />;
      case View.LOGIN: return <LoginPage onLogin={handleLogin} onNavigate={setCurrentView} />;
      case View.DASHBOARD: return <Dashboard data={appData} onNavigate={setCurrentView} onUpdate={handleUpdate} />;
      case View.FOCUS: return <Focus data={appData} onUpdate={handleUpdate} onNavigate={setCurrentView} />;
      case View.INRICHTING: return <Inrichting data={appData} onUpdate={handleUpdate} onAddActions={(a) => handleUpdate({ actions: [...appData.actions, ...a] })} onNavigate={setCurrentView} />;
      case View.TRANSITIE: return <Transitie data={appData} onUpdate={handleUpdate} onNavigate={setCurrentView} />;
      case View.FITCHECK: return <FitCheck data={appData} onUpdate={handleUpdate} onNavigate={setCurrentView} />;
      case View.ANALYSE: return <Analyse data={appData} onNavigate={setCurrentView} onUpdate={handleUpdate} />;
      case View.SETTINGS: return <Settings data={appData} user={user} onLogout={handleLogout} />;
      // Footer Pages
      case View.FEATURES: return <ProductFeatures onNavigate={setCurrentView} />;
      case View.AI_ENGINE: return <AIEngine onNavigate={setCurrentView} />;
      case View.PRICING: return <Pricing onNavigate={setCurrentView} />;
      case View.ABOUT_US: return <AboutUs onNavigate={setCurrentView} />;
      case View.METHOD: return <Method onNavigate={setCurrentView} />;
      case View.PRIVACY: return <Privacy onNavigate={setCurrentView} />;
      default: return <Dashboard data={appData} onNavigate={setCurrentView} onUpdate={handleUpdate} />;
    }
  };

  // If viewing a footer page, we don't necessarily need the full dashboard layout
  const isFooterPage = [View.FEATURES, View.AI_ENGINE, View.PRICING, View.ABOUT_US, View.METHOD, View.PRIVACY].includes(currentView);

  if (!user.isAuthenticated || isFooterPage) {
    if (currentView === View.LOGIN) return <LoginPage onLogin={handleLogin} onNavigate={setCurrentView} />;
    if (isFooterPage) return renderView();
    return <LandingPage onNavigate={setCurrentView} />;
  }

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView} user={user} onLogout={handleLogout} data={appData}>
      {renderView()}
    </Layout>
  );
};

export default App;
