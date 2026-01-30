import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AppData, FitCheckScore, ExternalFactor, View, ExternalSource, StrategicGoal, AIAlert, ActionItem, PerformanceMetric, Domain, GapAnalysisItem } from "../types";

/**
 * Model Configuration - Using Gemini 3 series as per guidelines.
 */
const MODELS = {
  FAST: 'gemini-3-flash-preview',
  SMART: 'gemini-3-pro-preview',
  VISION: 'gemini-3-flash-preview'
} as const;

/**
 * API Key Helper - Retrieves key from environment exclusively.
 * Per security guidelines, keys are managed via process.env.API_KEY.
 */
const getAPIKey = (): string => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('❌ API key niet geconfigureerd. Neem contact op met de beheerder voor toegang tot de AI Engine.');
  }
  return apiKey;
};

/**
 * Get AI Client with API key from environment
 */
const getAIClient = (): GoogleGenAI => {
  const apiKey = getAPIKey();
  return new GoogleGenAI({ apiKey });
};

const CACHE_PREFIX = 'fit_ai_cache_';
const REQUEST_TIMEOUT = 60000; // 60 seconds

/**
 * Question Interface (Matching FitCheck.tsx)
 */
export interface Question {
  id: string;
  domain: string;
  question: string;
  hint: string;
}

/**
 * Cache Interface
 */
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

/**
 * Enhanced Caching Helper
 */
const getCached = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(CACHE_PREFIX + key);
    if (!item) return null;
    const entry: CacheEntry<T> = JSON.parse(item);
    if (Date.now() > entry.timestamp + entry.ttl) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.value;
  } catch { return null; }
};

const setCached = <T>(key: string, value: T, ttl = 3600000): void => {
  try {
    const entry: CacheEntry<T> = { value, timestamp: Date.now(), ttl };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch (e) { console.warn('Cache write failed', e); }
};

/**
 * Utility: Timeout Promise
 */
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('AI Request timeout')), ms))
  ]);
};

/**
 * Utility: Retry logic with Exponential Backoff
 */
const callWithRetry = async <T>(fn: () => Promise<T>, retries = 3): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      lastError = e;
      if (e.status === 429) { // Rate limit
        const delay = Math.min(1000 * Math.pow(2, i), 10000);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw e;
    }
  }
  throw lastError;
};

/**
 * JSON Parsing helper
 */
const safeParse = (text: string, fallback: any) => {
  try {
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Parse Error", e);
    return fallback;
  }
};

export interface Scenario {
  title: string;
  description: string;
  impactOnFit: string;
  recommendedActions: string[];
}

/**
 * 1. Analyze Organogram (Vision Task)
 */
export const analyzeOrganogram = async (base64Image: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await callWithRetry(() => withTimeout(
      ai.models.generateContent({
        model: MODELS.VISION,
        contents: {
          parts: [
            { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
            { text: 'Analyseer dit organogram op hiaten, spans-of-control en logica. Geef beknopt advies in het Nederlands.' }
          ]
        }
      }),
      REQUEST_TIMEOUT
    )) as GenerateContentResponse;
    return response.text || "Geen resultaten.";
  } catch (e: any) {
    console.error('Organogram analysis failed:', e);
    if (e.message?.includes('API key')) return `❌ ${e.message}`;
    return "Analyse tijdelijk niet beschikbaar.";
  }
};

/**
 * 2. External Analysis (Smart Task with Search)
 */
export const generateExternalAnalysis = async (companyName: string, sector: string, detail: 'standard' | 'detailed' = 'standard'): Promise<ExternalFactor[]> => {
  const cacheKey = `pestle_${companyName}_${sector}_${detail}`;
  const cached = getCached<ExternalFactor[]>(cacheKey);
  if (cached) return cached;

  try {
    const ai = getAIClient();
    const response = await callWithRetry(() => withTimeout(
      ai.models.generateContent({
        model: MODELS.SMART,
        contents: `Voer een PESTLE onderzoek uit voor ${companyName} in de sector ${sector}. Identificeer 6 factoren.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                category: { type: Type.STRING },
                factor: { type: Type.STRING },
                futureTrend: { type: Type.STRING },
                opportunity: { type: Type.STRING },
                threat: { type: Type.STRING },
                actions: { type: Type.STRING },
                horizon: { type: Type.STRING, enum: ['Kort', 'Middellang', 'Lang'] },
                impactScore: { type: Type.INTEGER }
              },
              required: ["id", "category", "factor", "futureTrend", "opportunity", "threat", "actions", "horizon", "impactScore"]
            }
          },
          systemInstruction: "Je bent een strategisch onderzoeker. Gebruik Google Search voor actuele data. Antwoord in JSON."
        }
      }),
      REQUEST_TIMEOUT
    )) as GenerateContentResponse;

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources: ExternalSource[] = [];
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web) sources.push({ title: chunk.web.title || "Bron", uri: chunk.web.uri });
      });
    }

    const factors = safeParse(response.text || "", []);
    const finalResult = factors.map((f: any) => ({ ...f, sources: sources.slice(0, 4) }));
    setCached(cacheKey, finalResult);
    return finalResult;
  } catch (e: any) {
    console.error('External analysis failed:', e);
    return [];
  }
};

/**
 * 3. Smart Alerts (Smart Task)
 */
export const generateSmartAlerts = async (data: AppData): Promise<AIAlert[]> => {
  try {
    const ai = getAIClient();
    const response = await callWithRetry(() => withTimeout(
      ai.models.generateContent({
        model: MODELS.SMART,
        contents: `Analyseer de context en geef 3-5 alerts: ${JSON.stringify(data.strategicGoals)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['warning', 'opportunity', 'info'] },
                priority: { type: Type.INTEGER },
                title: { type: Type.STRING },
                message: { type: Type.STRING },
                actionLabel: { type: Type.STRING },
                actionView: { type: Type.STRING }
              },
              required: ["id", "type", "priority", "title", "message", "actionLabel", "actionView"]
            }
          }
        }
      }),
      REQUEST_TIMEOUT
    )) as GenerateContentResponse;
    return safeParse(response.text || "", []);
  } catch (e: any) {
    console.error('Smart alerts failed:', e);
    return [];
  }
};

/**
 * 4. Improved Inrichting Analysis (Prompt #4 Compliant)
 */
export const analyzeInrichting = async (
  inrichting: any,
  strategy: string,
  goals: StrategicGoal[]
): Promise<{
  summary: string;
  gapAnalysis: GapAnalysisItem[];
}> => {
  try {
    const ai = getAIClient();
    const prompt = `
Je bent een senior strategisch organisatieadviseur. Voer een grondige gap analyse uit.

STRATEGIE:
${strategy}

STRATEGISCHE DOELEN:
${goals.map((g, i) => `${i + 1}. ${g.description} (Wiel: ${g.wheel})`).join('\n')}

HUIDIGE INRICHTING:
- Structuur: ${JSON.stringify(inrichting.structure)}
- Middelen: ${JSON.stringify(inrichting.resources)}
- Cultuur: ${JSON.stringify(inrichting.culture)}
- Mensen: ${JSON.stringify(inrichting.people)}

TAAK:
Voer voor elk doel een fit analyse uit op de 4 pijlers (Structuur, Middelen, Cultuur, Mensen).

BEPALINGEN VOOR SCORING:
- FIT LEVEL: "Good" (4-5), "Partial" (2.5-3.9), of "Bad" (1-2.4).
- SCORE LOGICA: Start bij een basisscore van 3.0. 
  * Verhoog met +0.5 tot +1.0 als een domein een duidelijke 'enabler' is voor het doel.
  * Verlaag met -0.5 tot -1.5 als een domein een significante blokkade of 'gap' vormt.
- ACTIE: Genereer 1 concrete actie (max 60 chars) per doel om de grootste gap te dichten.

SUMMARY STRUCTUUR (Verplicht in 4 alinea's):
Alinea 1: Overall fit assessment (X van de Y doelen ondersteund).
Alinea 2: Biggest gaps (welk domein is de bottleneck?).
Alinea 3: Biggest strengths (leverage points).
Alinea 4: Priority recommendation (Directe impact actie).

OUTPUT FORMAT:
JSON object met "summary" (string) en "gapAnalysis" (array).
`;
    
    const result = await callWithRetry(() => withTimeout(
      ai.models.generateContent({
        model: MODELS.SMART,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              gapAnalysis: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    goal: { type: Type.STRING },
                    structureFit: { type: Type.STRING, enum: ["Good", "Partial", "Bad"] },
                    resourcesFit: { type: Type.STRING, enum: ["Good", "Partial", "Bad"] },
                    cultureFit: { type: Type.STRING, enum: ["Good", "Partial", "Bad"] },
                    peopleFit: { type: Type.STRING, enum: ["Good", "Partial", "Bad"] },
                    score: { type: Type.NUMBER },
                    type: { type: Type.STRING, enum: ["Running", "Changing"] },
                    actionTitle: { type: Type.STRING },
                    actionDescription: { type: Type.STRING },
                    aiInsight: { type: Type.STRING }
                  },
                  required: ["goal", "structureFit", "resourcesFit", "cultureFit", "peopleFit", "score", "type", "actionTitle", "actionDescription"]
                }
              }
            },
            required: ["summary", "gapAnalysis"]
          },
          systemInstruction: "Je bent een senior strategisch adviseur. Antwoord uitsluitend in JSON. Wees kritisch en specifiek."
        }
      }),
      60000
    )) as GenerateContentResponse;
    
    return safeParse(result.text || "", { summary: "", gapAnalysis: [] });
    
  } catch (error: any) {
    console.error('Gap analysis failed:', error);
    if (error.message?.includes('API key')) return { summary: `❌ ${error.message}`, gapAnalysis: [] };
    return {
      summary: "Analyse tijdelijk niet beschikbaar door een verbindingsfout.",
      gapAnalysis: goals.map(goal => ({
        goal: goal.description,
        structureFit: 'Partial' as const,
        resourcesFit: 'Partial' as const,
        cultureFit: 'Partial' as const,
        peopleFit: 'Partial' as const,
        score: 3.0,
        type: 'Changing' as const,
        actionTitle: 'Handmatige fit validatie',
        actionDescription: 'Voer een handmatige controle uit op de inrichting voor dit doel.'
      }))
    };
  }
};

/**
 * 5. Metric Benchmark (Smart Task with Search)
 */
export const getMetricBenchmark = async (metricName: string, sector: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await callWithRetry(() => withTimeout(
      ai.models.generateContent({
        model: MODELS.SMART,
        contents: `Wat is de sectorale benchmark voor de KPI "${metricName}" in de sector "${sector}"?`,
        config: { tools: [{ googleSearch: {} }] }
      }),
      REQUEST_TIMEOUT
    )) as GenerateContentResponse;
    return response.text || "Geen benchmark data.";
  } catch (e: any) {
    console.error('Benchmark failed:', e);
    return "Benchmark niet beschikbaar.";
  }
};

/**
 * 6. Strategic Scenarios (Smart Task)
 */
export const generateStrategicScenarios = async (data: AppData): Promise<Scenario[]> => {
  try {
    const ai = getAIClient();
    const response = await callWithRetry(() => withTimeout(
      ai.models.generateContent({
        model: MODELS.SMART,
        contents: `Genereer 3 toekomstscenario's voor ${data.orgProfile.name}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                impactOnFit: { type: Type.STRING },
                recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "description", "impactOnFit", "recommendedActions"]
            }
          }
        }
      }),
      REQUEST_TIMEOUT
    )) as GenerateContentResponse;
    return safeParse(response.text || "", []);
  } catch (e: any) {
    console.error('Scenarios failed:', e);
    return [];
  }
};

/**
 * 7. Action Suggestions (Fast Task)
 */
export const generateActionSuggestions = async (data: AppData): Promise<Partial<ActionItem>[]> => {
  try {
    const ai = getAIClient();
    const response = await callWithRetry(() => withTimeout(
      ai.models.generateContent({
        model: MODELS.FAST,
        contents: `Suggerer 3 acties voor doelen: ${JSON.stringify(data.strategicGoals)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['Running', 'Changing'] },
                impact: { type: Type.INTEGER },
                effort: { type: Type.INTEGER },
                description: { type: Type.STRING },
                riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] }
              },
              required: ["title", "type", "impact", "effort", "description", "riskLevel"]
            }
          }
        }
      }),
      REQUEST_TIMEOUT
    )) as GenerateContentResponse;
    return safeParse(response.text || "", []);
  } catch (e: any) {
    console.error('Action suggestions failed:', e);
    return [];
  }
};

/**
 * 8. Action Coaching (Fast Task)
 */
export const getActionCoaching = async (action: ActionItem, data: AppData): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await callWithRetry(() => withTimeout(
      ai.models.generateContent({
        model: MODELS.FAST,
        contents: `Geef kort coaching advies voor actie "${action.title}" in sector ${data.orgProfile.sector}.`,
      }),
      REQUEST_TIMEOUT
    )) as GenerateContentResponse;
    return response.text || "Focus op executie.";
  } catch (e: any) {
    console.error('Coaching failed:', e);
    return "Geen coaching beschikbaar.";
  }
};

/**
 * 9. FITCheck Interpretation (Smart Task)
 */
export const runFitCheckInterpretation = async (
  data: AppData, 
  answers: Record<string, number>,
  questions: Question[]
): Promise<FitCheckScore[]> => {
  const domains = ['Structuur', 'Middelen', 'Cultuur', 'Mensen'];
  const domainAnswers: Record<string, number[]> = {};

  domains.forEach(domain => {
    domainAnswers[domain] = Object.entries(answers)
      .filter(([qId]) => questions.find(q => q.id === qId)?.domain === domain)
      .map(([_, score]) => score);
  });

  const domainAverages = Object.entries(domainAnswers).map(([domain, scores]) => ({
    domain,
    average: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 3.0
  }));

  try {
    const ai = getAIClient();
    const prompt = `
Analyseer deze FITCheck resultaten voor ${data.orgProfile.name} in de sector ${data.orgProfile.sector}.
Gemiddelde scores (1-5):
${domainAverages.map(d => `- ${d.domain}: ${d.average.toFixed(1)}`).join('\n')}

Genereer voor elk domein een interpretatie en 2-4 concrete verbetersuggesties.
`;

    const result = await callWithRetry(() => withTimeout(
      ai.models.generateContent({
        model: MODELS.SMART,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                domain: { type: Type.STRING },
                score: { type: Type.NUMBER },
                description: { type: Type.STRING },
                suggestion: { type: Type.STRING },
                trend: { type: Type.STRING, enum: ['up', 'down', 'stable'] }
              },
              required: ["domain", "score", "description", "suggestion", "trend"]
            }
          },
          systemInstruction: "Je bent een senior organisatieadviseur. Antwoord in JSON."
        }
      }),
      60000
    )) as GenerateContentResponse;
    
    return safeParse(result.text || "", []);
  } catch (error: any) {
    console.error('FITCheck interpretation failed:', error);
    return domains.map(domain => ({
      domain: domain as Domain,
      score: domainAverages.find(d => d.domain === domain)?.average || 3.0,
      description: "Gemiddelde score op basis van antwoorden.",
      suggestion: "Bekijk de individuele vragen om verbeterpunten te vinden.",
      trend: 'stable'
    }));
  }
};

/**
 * 10. Predictive Insights (Smart Task)
 */
export const generatePredictiveInsights = async (data: AppData): Promise<string[]> => {
  try {
    const ai = getAIClient();
    
    const prompt = `
Je bent een predictive analytics expert.

DATA:
- FIT scores over tijd: ${JSON.stringify(data.history)}
- Huidige doelen: ${JSON.stringify(data.strategicGoals)}
- Acties: ${data.actions.length} totaal, ${data.actions.filter(a => a.status === 'done').length} voltooid
- Lopende acties: ${data.actions.filter(a => a.status === 'doing').length}

TAAK:
Genereer 5-7 predictive insights op basis van trends in de data.

FORMAT:
- Kort (max 30 woorden per insight)
- Specifiek (met cijfers)
- Actionable (wat betekent dit?)
- Mix van positief en waarschuwend

VOORBEELDEN:
✅ "Huidige FIT score trend (+0.3/kwartaal) betekent dat je 'Optimaal' status (>75%) bereikt in Q4 2026"
✅ "Cultuur score stagneert (3x achter elkaar 2.8) - zonder interventie blokkeren 3 mensen-doelen"
✅ "Actie completion rate (65%) ligt boven benchmark - behoud deze cadans voor on-time doelrealisatie"

OUTPUT: JSON array van strings
    `;
    
    const response = await ai.models.generateContent({
      model: MODELS.SMART,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    }) as GenerateContentResponse;
    
    return safeParse(response.text || "[]", []);
  } catch (e: any) {
    console.error('Predictive insights failed:', e);
    return ["Inzichten tijdelijk niet beschikbaar."];
  }
};