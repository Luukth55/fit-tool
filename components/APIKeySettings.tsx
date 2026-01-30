
import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Check, X, AlertCircle, ExternalLink, RefreshCw, Info } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { Button, Card, Badge } from './Shared';

interface APIKeySettingsProps {
  onKeyValidated?: (isValid: boolean) => void;
}

// Helper functions for minimal "obfuscation" in localStorage
const encodeKey = (key: string): string => {
  try {
    return btoa(key); 
  } catch {
    return key;
  }
};

const decodeKey = (encoded: string): string => {
  try {
    return atob(encoded);
  } catch {
    return encoded;
  }
};

export const STORAGE_KEY = 'fit_gemini_api_key';

const APIKeySettings: React.FC<APIKeySettingsProps> = ({ onKeyValidated }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Load existing key on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const decoded = decodeKey(stored);
      setApiKey(decoded);
      // Validate silently if it looks like a key
      if (decoded.length > 20) {
        validateKey(decoded, false);
      }
    }
  }, []);

  const validateKey = async (key: string, showFeedback = true) => {
    if (!key || key.length < 20) {
      setIsValid(false);
      if (showFeedback) setErrorMessage('API key lijkt te kort of is leeg.');
      return;
    }

    setIsValidating(true);
    if (showFeedback) setErrorMessage('');

    try {
      // Use the model recommended for basic tasks to verify connectivity
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Ping',
      });

      if (response.text) {
        setIsValid(true);
        localStorage.setItem(STORAGE_KEY, encodeKey(key));
        if (onKeyValidated) onKeyValidated(true);
        // Force a small delay for better UX
        if (showFeedback) {
          setErrorMessage('');
        }
      } else {
        throw new Error('Geen response van API.');
      }
    } catch (error: any) {
      setIsValid(false);
      const msg = error.message || 'Ongeldige API key of netwerkfout.';
      if (showFeedback) setErrorMessage(msg);
      if (onKeyValidated) onKeyValidated(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    validateKey(apiKey, true);
  };

  const handleClear = () => {
    setApiKey('');
    setIsValid(null);
    setErrorMessage('');
    localStorage.removeItem(STORAGE_KEY);
    if (onKeyValidated) onKeyValidated(false);
    window.location.reload(); // Reload to ensure services pick up the change
  };

  return (
    <Card className="overflow-hidden border-2 border-primary/10 shadow-2xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <Key className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-black text-blackDark tracking-tight">Gemini AI Configuratie</h3>
          <div className="flex items-center gap-2 mt-1">
            {isValidating ? (
              <Badge color="blue" className="animate-pulse">Valideren...</Badge>
            ) : isValid ? (
              <Badge color="green" className="flex items-center gap-1"><Check className="h-3 w-3" /> Actief</Badge>
            ) : (
              <Badge color="gray">Niet geconfigureerd</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <label className="block text-[10px] font-black text-grayMedium uppercase tracking-[0.2em] mb-2 ml-1">API Key</label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full pl-6 pr-14 py-4 border border-gray-100 bg-grayLight/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold text-blackDark font-mono"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-grayMedium hover:text-primary transition-colors"
            >
              {showKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleSave} 
            disabled={isValidating}
            className="flex-1 py-4 shadow-lg"
          >
            {isValidating ? <RefreshCw className="h-5 w-5 animate-spin mr-2" /> : <Check className="h-5 w-5 mr-2" />}
            Test & Opslaan
          </Button>
          <Button 
            variant="outline" 
            onClick={handleClear}
            className="py-4 px-8"
          >
            <X className="h-5 w-5 mr-2" /> Wissen
          </Button>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-fade-in-up">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-red-700 leading-relaxed">{errorMessage}</p>
          </div>
        )}

        <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
            <Info className="h-3.5 w-3.5" /> Instructies
          </div>
          <p className="text-[11px] font-medium text-blue-900 leading-relaxed">
            Voor deze tool is een Google Gemini API Key vereist. Je kunt een gratis of betaalde key aanmaken in de Google AI Studio.
          </p>
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-black text-primary hover:underline"
          >
            Maak API Key aan <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <p className="text-[10px] text-center text-grayMedium font-bold italic">
          ⚠️ Jouw key wordt lokaal in je browser opgeslagen en nooit gedeeld.
        </p>
      </div>
    </Card>
  );
};

export default APIKeySettings;
