
import React, { useState } from 'react';
import { View, UserState } from '../types';
import { Button, Input, Card, Badge } from '../components/Shared';
import { ShieldCheck, ArrowRight, Github, Chrome, Mail, Lock, Zap, Sparkles } from 'lucide-react';

interface Props {
  onLogin: (user: UserState) => void;
  onNavigate: (view: View) => void;
}

const LoginPage: React.FC<Props> = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      onLogin({
        isAuthenticated: true,
        name: "Arthur de Strategist",
        organization: "FitCorp International",
        email: email || "demo@fittool.ai",
        role: "admin"
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans selection:bg-primary/10">
      {/* Visual Left Side */}
      <div className="hidden md:flex md:w-1/2 bg-blackDark p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/10 blur-[120px] rounded-full"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate(View.LANDING)}>
            <div className="bg-primary text-white p-2.5 rounded-2xl font-black text-2xl shadow-xl shadow-blue-500/20">FIT</div>
            <span className="font-extrabold text-2xl tracking-tight text-white">Tool</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <Badge color="blue" className="bg-white/10 text-white border-white/20 mb-8 px-4 py-2">TRUSTED BY 200+ FIRMS</Badge>
          <h2 className="text-5xl font-black text-white leading-tight mb-8 tracking-tight">
            De toekomst van <span className="text-primary">strategische executie</span> begint hier.
          </h2>
          <p className="text-xl text-grayMedium leading-relaxed">
            Log in op je dashboard en krijg direct AI-ondersteund inzicht in de 'fit' van je organisatie.
          </p>
        </div>

        <div className="relative z-10">
           <div className="flex gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10">
              <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg">
                <Zap className="h-6 w-6 fill-current" />
              </div>
              <div>
                <p className="text-sm font-black text-white uppercase tracking-widest">Nieuw in v2.4</p>
                <p className="text-xs text-grayMedium mt-1">Real-time markt research integratie nu beschikbaar.</p>
              </div>
           </div>
        </div>
      </div>

      {/* Auth Right Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-24 bg-grayLight/20">
        <div className="w-full max-w-md space-y-10 animate-fade-in-up">
          <div className="md:hidden flex justify-center mb-10">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-white p-2 rounded-xl font-black text-xl">FIT</div>
              <span className="font-extrabold text-xl tracking-tight text-blackDark">Tool</span>
            </div>
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black text-blackDark tracking-tight mb-4">Welkom terug.</h1>
            <p className="text-grayMedium font-bold">Voer je gegevens in om toegang te krijgen.</p>
          </div>

          <div className="space-y-4">
             <Button variant="outline" className="w-full justify-center h-14 rounded-2xl border-gray-100 bg-white hover:bg-gray-50 text-grayDark font-bold">
                <Chrome className="h-5 w-5 mr-3" /> Inloggen met Google
             </Button>
             <div className="flex items-center gap-4 py-4">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="text-[10px] font-black text-grayMedium uppercase tracking-[0.2em]">Of met email</span>
                <div className="h-px bg-gray-200 flex-1"></div>
             </div>
          </div>

          <form onSubmit={handleDemoLogin} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-grayMedium" />
              <input 
                type="email" 
                placeholder="Email adres"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-16 pr-6 py-5 border border-gray-100 bg-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold text-blackDark"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-grayMedium" />
              <input 
                type="password" 
                placeholder="Wachtwoord"
                className="w-full pl-16 pr-6 py-5 border border-gray-100 bg-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold text-blackDark"
              />
            </div>
            
            <div className="flex justify-between items-center px-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-xs font-bold text-grayMedium group-hover:text-grayDark transition-colors">Onthoud mij</span>
              </label>
              <a href="#" className="text-xs font-bold text-primary hover:underline">Wachtwoord vergeten?</a>
            </div>

            <Button 
              type="submit" 
              className="w-full h-16 rounded-2xl text-lg shadow-2xl shadow-blue-500/20"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                   <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                   Bezig...
                </div>
              ) : (
                <>Inloggen <ArrowRight className="ml-2 h-5 w-5" /></>
              )}
            </Button>
          </form>

          <p className="text-center text-sm font-bold text-grayMedium">
            Nog geen account? <button onClick={() => onNavigate(View.LANDING)} className="text-primary hover:underline">Vraag een demo aan</button>
          </p>

          <div className="pt-10 border-t border-gray-100 flex items-center justify-center gap-8">
             <div className="flex items-center gap-2 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">ISO 27001 Certified</span>
             </div>
             <div className="flex items-center gap-2 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all">
                <Sparkles className="h-5 w-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">GDPR Compliant</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
