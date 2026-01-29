
export enum View {
  LANDING = 'landing',
  LOGIN = 'login',
  DASHBOARD = 'dashboard',
  FOCUS = 'focus',
  INRICHTING = 'inrichting',
  TRANSITIE = 'transitie',
  FITCHECK = 'fitcheck',
  ANALYSE = 'analyse',
  SETTINGS = 'settings',
  // Footer Pages
  FEATURES = 'features',
  AI_ENGINE = 'ai_engine',
  PRICING = 'pricing',
  ABOUT_US = 'about_us',
  METHOD = 'method',
  PRIVACY = 'privacy'
}

export enum Domain {
  STRATEGY = 'Strategie',
  STRUCTURE = 'Structuur',
  CULTURE = 'Cultuur',
  PEOPLE = 'Mensen',
  RESOURCES = 'Middelen',
  PROCESSES = 'Processen',
  TECHNOLOGY = 'Technologie',
  COLLABORATION = 'Samenwerking',
  LEADERSHIP = 'Leiderschap',
}

export enum ValueWheel {
  FINANCIAL = 'Financial',
  CUSTOMER = 'Customer',
  EMPLOYEE = 'Employee',
  ORGANIZATION = 'Organization',
  SOCIAL = 'Social'
}

export interface HistoryPoint {
  date: string;
  totalFitScore: number;
  domainScores: Record<string, number>;
}

export interface YearlyValue {
  year: string;
  value: string;
}

export interface PerformanceMetric {
  id: string;
  wheel: ValueWheel;
  name: string;
  unit: string;
  values: YearlyValue[];
  isStandard: boolean;
  description?: string;
}

export interface StrategicKPI {
  id: string;
  domain: string;
  name: string;
  unit: string;
  value2025: string;
  value2024: string;
  value2023: string;
  value2022: string;
  value2021: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  interest: 'Low' | 'Medium' | 'High';
  power: 'Low' | 'Medium' | 'High';
  engagement: 'Low' | 'Medium' | 'High';
}

export interface StrategicGoal {
  id: string;
  wheel: ValueWheel;
  description: string;
  term: 'Kort' | 'Middellang' | 'Lang';
  kpiId?: string;
  priority: number; // 1-5
}

export interface ExternalSource {
    title: string;
    uri: string;
}

export interface ExternalFactor {
  id: string;
  category: string;
  factor: string;
  opportunity?: string;
  threat?: string;
  actions?: string;
  futureTrend?: string;
  sources?: ExternalSource[];
}

export type ActionType = 'Running' | 'Changing';
export type ActionStatus = 'todo' | 'doing' | 'done';
export type ActionOrigin = 'Goal' | 'GapAnalysis' | 'FITCheck' | 'Manual';

export interface ActionItem {
  id: string;
  title: string;
  type: ActionType;
  status: ActionStatus;
  owner: string;
  deadline: string;
  impact: number;
  riskLevel?: 'Low' | 'Medium' | 'High';
  domain?: Domain;
  description?: string;
  origin?: ActionOrigin;
  linkedId?: string; 
}

export interface FitCheckScore {
  domain: Domain;
  score: number;
  description: string;
  suggestion: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface UserState {
  isAuthenticated: boolean;
  name: string;
  organization: string;
  email: string;
  role: 'admin' | 'user';
}

export interface OrganizationProfile {
  name: string;
  sector: string;
  employees: number;
  location: string;
  type: string;
}

export type FitLevel = 'Good' | 'Partial' | 'Bad';

export interface GapAnalysisItem {
  goal: string;
  structureFit: FitLevel;
  resourcesFit: FitLevel;
  cultureFit: FitLevel;
  peopleFit: FitLevel;
  score: number;
  type: ActionType;
  actionTitle: string;
  actionDescription: string;
}

export interface InrichtingData {
  structure: { 
    type: string; 
    layers: number; 
    decisionMaking: string; 
    choiceReason: string; 
    spanOfControl: number; 
    meetingStructure: string;
    governance: string;
    rolesClarity: string;
    organogramData?: string; 
    organogramAnalysis?: string;
  };
  resources: { 
    financial: string; 
    trainingBudget: number; 
    securityLevel: string; 
    digitalAssets: string; 
    physicalAssets: string;
    criticalVendors: string;
    digitalMaturity: number; 
  };
  culture: { 
    type: string; 
    characteristics: string[]; 
    barriers: string; 
    strategyFit: string;
    coreValues: string;
    communicationStyle: string;
    recognitionRewards: string;
  };
  people: { 
    totalFte: number; 
    turnover: number; 
    leadershipStyle: string; 
    eNPS: number; 
    gaps: string; 
    recruitmentStrategy: string;
    talentDevelopment: string;
    diversityInclusion: string;
  };
  gapAnalysis: GapAnalysisItem[];
  analysis?: string;
}

export interface AppData {
  orgProfile: OrganizationProfile;
  mission: string;
  vision: string;
  strategy: string;
  strategicKPIs: StrategicKPI[];
  performanceMetrics: PerformanceMetric[];
  wheelContext: Record<ValueWheel, string>;
  stakeholders: Stakeholder[];
  strategicGoals: StrategicGoal[];
  externalAnalysis: ExternalFactor[];
  actions: ActionItem[];
  fitCheckScores: FitCheckScore[];
  inrichting: InrichtingData;
  history: HistoryPoint[];
}
