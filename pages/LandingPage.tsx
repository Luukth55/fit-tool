
import React, { useEffect, useRef } from 'react';
import { View } from '../types';
import { 
  ArrowRight, 
  Menu, 
  X, 
  Target, 
  GitBranch, 
  Activity, 
  BarChart2, 
  LayoutDashboard,
  Zap,
  ChevronRight,
  TrendingUp,
  Users,
  CheckCircle2,
  FileText,
  Clock,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Button, Badge } from '../components/Shared';

interface Props {
  onNavigate: (view: View) => void;
}

const LandingPage: React.FC<Props> = ({ onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const features = [
    { id: "Focus", icon: <Target className="h-8 w-8 text-primary" />, label: "Focus-tab", desc: "Missie, visie, strategie en KPI’s vastleggen met AI-feedback" },
    { id: "Inrichting", icon: <Layers className="h-8 w-8 text-purple-600" />, label: "Inrichting-tab", desc: "Structuur, middelen, cultuur en mensen analyseren" },
    { id: "Transitie", icon: <Activity className="h-8 w-8 text-green-600" />, label: "Transitie-tab", desc: "Zet knelpunten om in acties en verbeterloops" },
    { id: "FitCheck", icon: <Zap className="h-8 w-8 text-yellow-600" />, label: "FITCheck-tab", desc: "AI-analyse van je organisatie op 9 domeinen" },
    { id: "Dashboard", icon: <LayoutDashboard className="h-8 w-8 text-indigo-600" />, label: "Dashboard", desc: "Overzicht van voortgang, scores en alerts" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-grayDark selection:bg-lightBlue selection:text-deepBlue">
      {/* Navigation */}
      <nav className="sticky top-0 z-[60] bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <div className="bg-primary text-white p-2 rounded-xl font-black text-2xl shadow-lg shadow-blue-500/20">FIT</div>
              <span className="font-extrabold text-2xl tracking-tight text-blackDark">Tool</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-10">
              <button onClick={() => onNavigate(View.FEATURES)} className="text-grayDark hover:text-primary text-sm font-bold transition-colors">Features</button>
              <button onClick={() => onNavigate(View.METHOD)} className="text-grayDark hover:text-primary text-sm font-bold transition-colors">Methode</button>
              <button onClick={() => onNavigate(View.LOGIN)} className="text-grayDark hover:text-primary text-sm font-bold transition-colors">Log in</button>
              <Button variant="primary" onClick={() => onNavigate(View.LOGIN)} className="rounded-xl px-8 shadow-blue-500/20">
                Start gratis analyse
              </Button>
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-grayDark transition-transform active:scale-90">
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 px-6 py-8 space-y-6 shadow-2xl animate-fade-in-up">
             <button onClick={() => {onNavigate(View.FEATURES); setMobileMenuOpen(false);}} className="block w-full text-left text-grayDark font-bold text-lg">Features</button>
             <button onClick={() => {onNavigate(View.METHOD); setMobileMenuOpen(false);}} className="block w-full text-left text-grayDark font-bold text-lg">Methode</button>
             <button onClick={() => onNavigate(View.LOGIN)} className="block w-full text-left text-grayDark font-bold text-lg">Log in</button>
             <Button variant="primary" className="w-full justify-center" onClick={() => onNavigate(View.LOGIN)}>Start gratis analyse</Button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 md:pt-32 md:pb-40 overflow-hidden bg-gradient-to-b from-lightBlue/30 to-white">
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-1/2 bg-blue-50 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 -z-10 w-1/3 h-1/3 bg-purple-50 blur-[100px] rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-primary text-sm font-bold mb-10 animate-fade-in-up">
            <Zap className="h-4 w-4 fill-current" /> Nieuw: AI Strategie Co-piloot 2.0
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-blackDark mb-8 leading-[1.05] max-w-5xl text-center reveal">
            Grip op strategie, inrichting en actie <br className="hidden md:block" />
            — met <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-700">één slimme tool.</span>
          </h1>
          
          <p className="max-w-3xl text-center text-xl text-grayDark leading-relaxed mb-12 reveal" style={{ transitionDelay: '0.2s' }}>
            De FIT Tool helpt organisaties hun strategie tastbaar te maken, inrichting te analyseren en acties te plannen. AI-ondersteund, visueel en schaalbaar.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-5 mb-20 reveal" style={{ transitionDelay: '0.3s' }}>
            <Button variant="primary" size="lg" className="rounded-2xl px-12 group" onClick={() => onNavigate(View.LOGIN)}>
              Start gratis analyse <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" size="lg" className="rounded-2xl px-12" onClick={() => onNavigate(View.FEATURES)}>
              Bekijk demo
            </Button>
          </div>
          
          <div className="relative w-full max-w-5xl mx-auto reveal" style={{ transitionDelay: '0.4s' }}>
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-[2.5rem] blur-2xl"></div>
            <div className="relative bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden group">
              <div className="h-10 bg-grayLight/50 border-b border-gray-100 flex items-center px-6 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="ml-4 h-4 w-32 bg-gray-200 rounded-full"></div>
              </div>
              <div className="p-4 md:p-8 bg-white grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-4 space-y-4">
                  <div className="h-40 w-full bg-lightBlue rounded-2xl flex items-center justify-center">
                    <BarChart2 className="h-20 w-20 text-primary opacity-20 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 bg-grayLight rounded"></div>
                    <div className="h-4 w-1/2 bg-grayLight rounded"></div>
                  </div>
                </div>
                <div className="md:col-span-8 bg-grayLight/30 rounded-2xl p-6 min-h-[300px] flex items-center justify-center overflow-hidden">
                  <div className="relative h-64 w-64 md:h-80 md:w-80 border-4 border-dashed border-primary/20 rounded-full animate-float flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/5 rounded-full"></div>
                    <div className="absolute inset-10 bg-primary/10 rounded-full"></div>
                    <div className="h-full w-full p-4 flex items-center justify-center">
                       <div className="grid grid-cols-2 gap-2 h-full w-full rotate-45">
                          <div className="bg-primary/20 rounded-tl-full border-2 border-primary/40"></div>
                          <div className="bg-purple-500/20 rounded-tr-full"></div>
                          <div className="bg-green-500/20 rounded-bl-full"></div>
                          <div className="bg-yellow-500/20 rounded-br-full"></div>
                       </div>
                       <div className="absolute h-12 w-12 bg-white rounded-xl shadow-xl flex items-center justify-center">
                          <Zap className="h-6 w-6 text-primary" />
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-10 -right-10 hidden lg:block animate-float" style={{ animationDelay: '1s' }}>
                <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3">
                   <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                   </div>
                   <div>
                      <div className="text-[10px] font-bold text-grayMedium uppercase">Strategische Fit</div>
                      <div className="text-lg font-black text-blackDark">87%</div>
                   </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Probleem & Oplossing */}
      <section className="py-28 md:py-40 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 reveal">
            <h2 className="text-4xl md:text-6xl font-black text-blackDark mb-6 leading-tight tracking-tight">
              Van losse PowerPoints naar één <span className="text-primary">strategisch systeem.</span>
            </h2>
            <p className="text-xl text-grayDark leading-relaxed">De traditionele manier van plannen maken werkt niet meer. Wij bieden een dynamisch, verbonden alternatief.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 reveal" style={{ transitionDelay: '0.2s' }}>
            {[
              { 
                icon: <FileText className="h-10 w-10" />, 
                title: "Strategie blijft hangen in documenten", 
                desc: "Statische documenten worden vergeten zodra de presentatie voorbij is.", 
                color: "bg-red-50 text-red-600" 
              },
              { 
                icon: <Layers className="h-10 w-10" />, 
                title: "Inrichting is versnipperd en niet meetbaar", 
                desc: "Geen real-time inzicht in of je organisatie klaar is voor de strategie.", 
                color: "bg-orange-50 text-orange-600" 
              },
              { 
                icon: <Clock className="h-10 w-10" />, 
                title: "Verandering is traag en niet gestuurd", 
                desc: "Zonder regie stagneren projecten en blijft vernieuwing uit.", 
                color: "bg-indigo-50 text-indigo-600" 
              }
            ].map((card, i) => (
              <div key={i} className="group p-10 rounded-[2.5rem] bg-grayLight/40 border border-gray-100 hover:bg-white hover:shadow-2xl transition-all duration-500">
                <div className={`h-20 w-20 ${card.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <h3 className="text-2xl font-black text-blackDark mb-4 leading-tight">{card.title}</h3>
                <p className="text-grayDark leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-deepBlue rounded-[3rem] p-10 md:p-20 text-white relative overflow-hidden reveal">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <Zap className="h-64 w-64" />
            </div>
            <div className="relative z-10 max-w-4xl">
              <Badge color="blue" className="bg-white/10 text-white border border-white/20 mb-6 px-4 py-2">HET NIEUWE WERKEN</Badge>
              <h3 className="text-3xl md:text-5xl font-black mb-8 leading-tight">
                De FIT Tool verbindt alles in één platform — met AI, validatie en actie-integratie.
              </h3>
              <p className="text-lightBlue/80 text-xl leading-relaxed mb-10 max-w-2xl">
                Wij transformeren complexe organisatiedynamiek naar een helder, interactief dashboard. Real-time inzicht in de 'fit' van je organisatie.
              </p>
              <Button variant="primary" size="lg" className="rounded-2xl px-12 bg-white text-deepBlue hover:bg-lightBlue" onClick={() => onNavigate(View.METHOD)}>
                Ontdek onze methode
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blackDark text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-primary text-white p-2 rounded-xl font-black text-2xl">FIT</div>
                <span className="font-extrabold text-2xl tracking-tight">Tool</span>
              </div>
              <p className="text-grayMedium text-lg leading-relaxed max-w-sm">
                De strategische standaard voor moderne organisaties. Grip op de toekomst, vandaag georganiseerd.
              </p>
            </div>
            <div>
              <h4 className="font-black text-xl mb-8">Product</h4>
              <ul className="space-y-4 text-grayMedium">
                <li><button onClick={() => onNavigate(View.FEATURES)} className="hover:text-primary transition-colors">Features</button></li>
                <li><button onClick={() => onNavigate(View.AI_ENGINE)} className="hover:text-primary transition-colors">AI Engine</button></li>
                <li><button onClick={() => onNavigate(View.PRICING)} className="hover:text-primary transition-colors">Pricing</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-xl mb-8">Bedrijf</h4>
              <ul className="space-y-4 text-grayMedium">
                <li><button onClick={() => onNavigate(View.ABOUT_US)} className="hover:text-primary transition-colors">Over ons</button></li>
                <li><button onClick={() => onNavigate(View.METHOD)} className="hover:text-primary transition-colors">Methode</button></li>
                <li><button onClick={() => onNavigate(View.PRIVACY)} className="hover:text-primary transition-colors">Privacy</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-grayMedium text-sm">© 2025 FIT Tool. Alle rechten voorbehouden.</div>
            <div className="flex gap-6">
              {['Twitter', 'LinkedIn', 'Instagram'].map(social => (
                <a key={social} href="#" className="text-grayMedium hover:text-white transition-colors font-bold text-sm uppercase tracking-widest">{social}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
