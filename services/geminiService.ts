
import { GoogleGenAI, Type } from "@google/genai";
import { AppData, FitCheckScore, ExternalFactor, View, ExternalSource, StrategicGoal, AIAlert, ActionItem, PerformanceMetric } from "../types";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const CACHE_PREFIX = 'fit_ai_cache_';
const getCached = (key: string) => {
    try {
        const item = localStorage.getItem(CACHE_PREFIX + key);
        if (!item) return null;
        const { val, expiry } = JSON.parse(item);
        if (Date.now() > expiry) {
            localStorage.removeItem(CACHE_PREFIX + key);
            return null;
        }
        return val;
    } catch { return null; }
};

const setCached = (key: string, val: any, ttl = 3600000) => {
    try {
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ val, expiry: Date.now() + ttl }));
    } catch (e) { console.warn("Cache write failed", e); }
};

const safeParse = (text: string, fallback: any) => {
    try {
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("JSON Parse Error", e);
        return fallback;
    }
}

export interface Scenario {
  title: string;
  description: string;
  impactOnFit: string;
  recommendedActions: string[];
}

export const analyzeOrganogram = async (base64Image: string): Promise<string> => {
    const ai = getAIClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
                    { text: 'Analyseer dit organogram. Wat voor type organisatiestructuur zie je? Zijn er opvallende hiaten, grote spans-of-control of onlogische lijnen? Geef beknopt advies in het Nederlands.' }
                ]
            }
        });
        return response.text || "De AI kon het organogram niet analyseren.";
    } catch (e) {
        return "Er is een fout opgetreden bij de AI-analyse van het organogram.";
    }
}

export const generateExternalAnalysis = async (companyName: string, sector: string, detail: 'standard' | 'detailed' = 'standard'): Promise<ExternalFactor[]> => {
    const ai = getAIClient();
    const cacheKey = `pestle_${companyName}_${sector}_${detail}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const prompt = `Voer een ${detail === 'detailed' ? 'zeer uitgebreid' : 'standaard'} PESTLE onderzoek uit voor ${companyName} in de sector ${sector}. 
      TAAK: Identificeer 6 factoren (PESTLE). Voor elke factor: bepaal de impact (1-10) en de horizon (Kort, Middellang, Lang).`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
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
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources: ExternalSource[] = [];
      if (groundingChunks) {
          groundingChunks.forEach((chunk: any) => {
              if (chunk.web) sources.push({ title: chunk.web.title || "Bron", uri: chunk.web.uri });
          });
      }

      const factors: any[] = safeParse(response.text || "", []);
      const result = factors.map(f => ({ ...f, sources: sources.slice(0, 4) })); 
      setCached(cacheKey, result);
      return result;
    } catch (e) {
      return [];
    }
};

export const generateSmartAlerts = async (data: AppData): Promise<AIAlert[]> => {
    const ai = getAIClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Analyseer deze organisatie context en identificeer 3 tot 5 slimme 'Highlights' of 'Alerts'. 
            Context: Doelen: ${JSON.stringify(data.strategicGoals)}, Acties: ${JSON.stringify(data.actions.length)}, FIT scores: ${JSON.stringify(data.fitCheckScores)}.`,
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
        });
        return response.text ? safeParse(response.text, []) : [];
    } catch (e) { return []; }
};

export const analyzeInrichting = async (data: any, strategy: string, goals: any): Promise<any> => {
    const ai = getAIClient();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analyseer de inrichting vs doelen: ${JSON.stringify(goals)}. Strategie: ${strategy}`,
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
                    type: { type: Type.STRING },
                    actionTitle: { type: Type.STRING },
                    actionDescription: { type: Type.STRING }
                  },
                  required: ["goal", "structureFit", "resourcesFit", "cultureFit", "peopleFit", "score", "type", "actionTitle", "actionDescription"]
                }
              }
            },
            required: ["summary", "gapAnalysis"]
          }
        }
      });
      return response.text ? safeParse(response.text, { summary: "", gapAnalysis: [] }) : { summary: "", gapAnalysis: [] };
    } catch { return { summary: "", gapAnalysis: [] }; }
};

export const getMetricBenchmark = async (metricName: string, sector: string): Promise<string> => {
    const ai = getAIClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Wat is de sectorale benchmark voor de KPI "${metricName}" in de sector "${sector}"?`,
            config: { tools: [{ googleSearch: {} }] }
        });
        return response.text || "Geen benchmark data gevonden.";
    } catch { return "Benchmark tijdelijk niet beschikbaar."; }
}

export const generateStrategicScenarios = async (data: AppData): Promise<Scenario[]> => {
    const ai = getAIClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Genereer 3 scenario's. Context: ${JSON.stringify(data.orgProfile)}, Strategie: ${data.strategy}.`,
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
        });
        return response.text ? safeParse(response.text, []) : [];
    } catch { return []; }
}

export const generateActionSuggestions = async (data: AppData): Promise<Partial<ActionItem>[]> => {
    const ai = getAIClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Suggerer 3 acties om de FIT score te verbeteren. Doelen: ${JSON.stringify(data.strategicGoals)}.`,
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
                            effort: { type: Type.INTEGER }, // Mandatory
                            description: { type: Type.STRING },
                            riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] }
                        },
                        required: ["title", "type", "impact", "effort", "description", "riskLevel"]
                    }
                }
            }
        });
        return response.text ? safeParse(response.text, []) : [];
    } catch { return []; }
}

export const getActionCoaching = async (action: ActionItem, data: AppData): Promise<string> => {
    const ai = getAIClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Geef coaching advies voor actie "${action.title}" in context van ${data.orgProfile.sector}.`,
        });
        return response.text || "Focus op executiekracht.";
    } catch { return "Blijf de voortgang monitoren."; }
}

export const runFitCheckInterpretation = async (data: AppData, answers: Record<string, number>): Promise<FitCheckScore[]> => {
    const ai = getAIClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Interpreteer FITCheck resultaten: ${JSON.stringify(answers)}.`,
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
                }
            }
        });
        return response.text ? safeParse(response.text, []) : [];
    } catch { return []; }
}
