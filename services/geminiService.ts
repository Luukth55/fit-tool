
import { GoogleGenAI, Type } from "@google/genai";
import { AppData, FitCheckScore, ExternalFactor, View, CopilotInsight, ExternalSource, StrategicGoal } from "../types";

const safeParse = (text: string, fallback: any) => {
    try {
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("JSON Parse Error", e);
        return fallback;
    }
}

export const analyzeOrganogram = async (base64Image: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
                    { text: 'Analyseer dit organogram. Wat voor type organisatiestructuur zie je? Zijn er opvallende hiaten, grote spans-of-control of onlogische lijnen? Geef beknopt advies.' }
                ]
            }
        });
        return response.text || "De AI kon het organogram niet analyseren.";
    } catch (e) {
        console.error("Organogram Analysis Error:", e);
        return "Er is een fout opgetreden bij de AI-analyse van het organogram.";
    }
}

export const getElementDetailFeedback = async (element: any, type: string, data: AppData): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `
                Je bent een strategisch adviseur. Analyseer dit specifieke element van de organisatie:
                Type: ${type}
                Data: ${JSON.stringify(element)}
                
                Context Organisatie:
                Missie: ${data.mission}
                Huidige FIT scores: ${JSON.stringify(data.fitCheckScores)}
                
                Geef een vlijmscherp strategisch inzicht over hoe dit specifieke onderdeel (dit doel, deze KPI, deze actie of dit inrichtingselement) bijdraagt aan de overkoepelende 'FIT' van de organisatie.
                Houd het kort, krachtig en actiegericht (max 50 woorden).
            `,
            config: { systemInstruction: "Antwoord direct in het Nederlands." }
        });
        return response.text || "Geen specifieke feedback beschikbaar.";
    } catch (e) {
        return "De AI kon geen verbinding maken voor dit specifieke inzicht.";
    }
}

export const getCopilotInsights = async (data: AppData, currentView: View): Promise<{ mainAdvice: string, structuredInsights: CopilotInsight[] }> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `
                Je bent de FIT Tool Strategische Co-piloot. Je redeneert over meerdere tabs heen.
                
                CONTEXT DATA:
                - Doelen: ${JSON.stringify(data.strategicGoals)}
                - Structuur: ${data.inrichting.structure.type} (${data.inrichting.structure.decisionMaking})
                - Cultuur Barrières: ${data.inrichting.culture.barriers}
                - Fit Scores: ${JSON.stringify(data.fitCheckScores)}
                - Lopende Acties: ${data.actions.length} acties.
                
                GEBRUIKER BEKIJKT NU: ${currentView}

                TAAK:
                1. Geef één krachtig overkoepelend advies (mainAdvice) voor deze pagina.
                2. Geef 2-3 gestructureerde inzichten (structuredInsights) die verbanden leggen tussen tabs. 
                
                JSON OUTPUT FORMAT:
                {
                    "mainAdvice": "string",
                    "structuredInsights": [
                        { "id": "1", "type": "warning|opportunity|tip", "title": "string", "description": "string", "targetView": "view_name" }
                    ]
                }
            `,
            config: { 
                systemInstruction: "Antwoord in het Nederlands. Wees kritisch maar constructief. Gebruik de JSON output format.",
                responseMimeType: "application/json"
            }
        });

        const result = safeParse(response.text, { mainAdvice: "Ik analyseer je data...", structuredInsights: [] });
        return result;
    } catch (e) {
        return { 
            mainAdvice: "De co-piloot is momenteel even aan het nadenken...", 
            structuredInsights: [] 
        };
    }
}

export const generateExternalAnalysis = async (companyName: string, sector: string, detail: 'standard' | 'detailed'): Promise<ExternalFactor[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `
            Voer een uiterst precieze externe research uit voor het bedrijf: ${companyName}.
            Sector: ${sector}.
            
            Gebruik Google Search om exact te achterhalen waar dit bedrijf en deze sector mee te maken hebben.
            
            TAAK:
            1. Identificeer de meest relevante PESTLE factoren (Politiek, Economisch, Sociaal, Technologisch, Legal, Ecologisch).
            2. Voor ELKE factor: Beschrijf de huidige status en (CRUCIAAL) welke grote veranderingen en trends er aan komen in de komende 3 tot 10 jaar.
            3. Maak het bedrijfsspecifiek: wat betekent dit voor de concurrentiepositie van ${companyName}?
            
            JSON OUTPUT FORMAT:
            [
              {
                "id": "unique_id",
                "category": "Politiek|Economisch|Sociaal|Technologisch|Legal|Ecologisch",
                "factor": "Huidige beschrijving",
                "futureTrend": "Beschrijving van aankomende veranderingen en trends voor de toekomst",
                "opportunity": "Specifieke kans voor dit bedrijf",
                "threat": "Specifieke bedreiging voor dit bedrijf",
                "actions": "Strategisch advies/actie"
              }
            ]
        `,
        config: { 
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          systemInstruction: "Je bent een gespecialiseerde strategisch onderzoeker. Je levert feitelijk correcte, actuele en toekomstgerichte data gebaseerd op real-time web research via Google Search. Antwoord in zuivere JSON."
        }
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources: ExternalSource[] = [];
      if (groundingChunks) {
          groundingChunks.forEach((chunk: any) => {
              if (chunk.web) {
                  sources.push({
                      title: chunk.web.title || "Bron",
                      uri: chunk.web.uri
                  });
              }
          });
      }

      const factors: any[] = safeParse(response.text, []);
      return factors.map(f => ({ ...f, sources: sources.slice(0, 4) })); 
    } catch (e) {
      console.error("External Analysis Error:", e);
      return [];
    }
};

export const analyzeExternalStrategicFit = async (factors: ExternalFactor[], goals: StrategicGoal[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `
                Je bent een senior strategisch adviseur. Analyseer de relatie tussen de externe omgeving en de interne doelen.
                
                EXTERNE FACTOREN:
                ${JSON.stringify(factors)}
                
                STRATEGISCHE DOELEN:
                ${JSON.stringify(goals)}
                
                TAAK:
                1. Vat de belangrijkste kansen en bedreigingen samen uit de externe factoren.
                2. Leg specifiek uit hoe deze factoren de realisatie van de huidige doelen beïnvloeden (positief of negatief).
                3. Geef één vlijmscherp strategisch advies om de 'fit' tussen de buitenwereld en de interne koers te verbeteren.
                
                Antwoord in krachtig, professioneel Nederlands. Gebruik een duidelijke structuur. Max 250 woorden.
            `,
            config: { systemInstruction: "Antwoord direct en zakelijk in het Nederlands." }
        });
        return response.text || "Geen analyse beschikbaar.";
    } catch (e) {
        console.error("External Fit Analysis Error:", e);
        return "Er is een fout opgetreden bij het genereren van de strategische fit analyse.";
    }
}

export const getSystemWidePrioritization = async (data: AppData): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `
                Analyseer de volledige context:
                - Doelen: ${JSON.stringify(data.strategicGoals)}
                - FITCheck Scores: ${JSON.stringify(data.fitCheckScores)}
                - Huidige Acties: ${JSON.stringify(data.actions)}
                - Inrichting: ${JSON.stringify(data.inrichting)}

                Geef 3 cruciale inzichten:
                1. Hoogste prioriteit actie op basis van doelgewicht en lage FIT-score.
                2. Meest riskante inrichting-mismatch.
                3. Eén alternatieve aanpak.
            `,
            config: { systemInstruction: "Antwoord beknopt en direct in het Nederlands." }
        });
        return response.text || "Geen inzichten beschikbaar.";
    } catch (e) {
        return "Fout bij ophalen van prioriteiten.";
    }
}

export const runFitCheckAnalysis = async (appData: AppData): Promise<FitCheckScore[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Voer een FITCheck uit voor: ${JSON.stringify(appData.strategicGoals)} en ${JSON.stringify(appData.inrichting)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              domain: { type: Type.STRING },
              score: { type: Type.INTEGER },
              description: { type: Type.STRING },
              suggestion: { type: Type.STRING }
            },
            required: ["domain", "score", "description", "suggestion"]
          }
        }
      }
    });
    return response.text ? safeParse(response.text, []) : [];
  } catch (error) {
    console.error("AI Error:", error);
    return [];
  }
};

export const analyzeStrategy = async (mission: string, vision: string, strategy: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyseer consistentie: Missie: ${mission}\nVisie: ${vision}\nStrategie: ${strategy}`,
      });
      return response.text || "";
    } catch { return "Error"; }
};

export const analyzeInrichting = async (data: any, strategy: string, goals: any): Promise<any> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Gap analyse inrichting vs doelen: ${JSON.stringify(goals)}`,
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
                    structureFit: { type: Type.STRING },
                    resourcesFit: { type: Type.STRING },
                    cultureFit: { type: Type.STRING },
                    peopleFit: { type: Type.STRING },
                    score: { type: Type.NUMBER },
                    type: { type: Type.STRING },
                    actionTitle: { type: Type.STRING },
                    actionDescription: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });
      return response.text ? safeParse(response.text, { summary: "", gapAnalysis: [] }) : { summary: "", gapAnalysis: [] };
    } catch { return { summary: "", gapAnalysis: [] }; }
};
