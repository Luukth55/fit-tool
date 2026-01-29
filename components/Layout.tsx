
import React, { useState } from 'react';
import { View, UserState, AppData } from '../types';
import { 
  LayoutDashboard, 
  Target, 
  Settings, 
  Activity, 
  GitBranch, 
  BarChart2, 
  LogOut,
  ChevronRight,
  CheckCircle2,
  X,
  PieChart,
  Menu,
  Bell
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onNavigate: (view: View) => void;
  user: UserState;
  onLogout: () => void;
  data: AppData;
}

const SidebarItem: React.FC<{ 
  icon: React.ElementType; 
  label: string; 
  active: boolean; 
  onClick: () => void 
}> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 ${
      active 
        ? 'bg-primary text-white shadow-xl shadow-blue-500/20 translate-x-1' 
        : 'text-grayMedium hover:bg-grayLight hover:text-grayDark'
    }`}
  >
    <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-grayMedium group-hover:text-primary'}`} />
    {label}
  </button>
);

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, user, onLogout, data }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { view: View.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { view: View.FOCUS, label: 'Focus', icon: Target },
    { view: View.INRICHTING, label: 'Inrichting', icon: GitBranch },
    { view: View.TRANSITIE, label: 'Transitie', icon: Activity },
    { view: View.FITCHECK, label: 'FITCheck', icon: BarChart2 },
    { view: View.ANALYSE, label: 'Analyse', icon: PieChart },
    { view: View.SETTINGS, label: 'Instellingen', icon: Settings },
  ];

  const calculateTotalProgress = (): number => {
    let focusScore = data.mission && data.vision && data.strategicGoals.length > 0 ? 100 : 50;
    let inrScore = data.inrichting.structure.type ? 100 : 30;
    let transitieScore = data.actions.length > 0 ? 80 : 0;
    return Math.round((focusScore + inrScore + transitieScore) / 3);
  };

  const totalProgress = calculateTotalProgress();

  return (
    <div className="min-h-screen bg-white lg:bg-grayLight/30 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 fixed h-full z-40">
        <div className="h-20 flex items-center px-8 border-b border-gray-50">
           <div className="bg-primary text-white p-2.5 rounded-2xl font-black text-xl mr-3 shadow-lg shadow-blue-500/20">FIT</div>
           <span className="font-black text-xl text-blackDark tracking-tight">Tool</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-8 px-5 space-y-3">
          {menuItems.map(item => (
            <SidebarItem
              key={item.view}
              icon={item.icon}
              label={item.label}
              active={currentView === item.view}
              onClick={() => onNavigate(item.view)}
            />
          ))}
        </div>

        <div className="p-6 border-t border-gray-50">
          <div className="bg-lightBlue/30 rounded-3xl p-5 mb-4 border border-lightBlue">
             <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center text-white font-black shadow-lg">
                    {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-black text-blackDark truncate">{user.name}</p>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest truncate">{user.organization}</p>
                </div>
             </div>
             <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-black text-grayMedium hover:text-red-600 transition-colors uppercase tracking-widest bg-white rounded-xl shadow-sm">
               <LogOut className="h-3.5 w-3.5" /> Uitloggen
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        {/* Navigation Bar / Header */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-30 h-20 flex items-center px-4 md:px-8">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-grayMedium hover:text-blackDark"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-xl md:text-2xl font-black text-blackDark capitalize tracking-tight">
                  {menuItems.find(i => i.view === currentView)?.label || 'Pagina'}
              </h1>
            </div>
            
            <div className="flex items-center gap-3 md:gap-6">
                <div className="hidden md:flex items-center bg-grayLight/40 rounded-2xl px-5 py-2.5 border border-gray-100 gap-4">
                   <div className="w-24 lg:w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(59,130,246,0.5)]" style={{ width: `${totalProgress}%` }}></div>
                   </div>
                   <span className="text-[10px] font-black text-grayDark uppercase tracking-widest">FIT: {totalProgress}%</span>
                </div>

                <div className="h-11 w-11 rounded-2xl bg-grayLight/40 flex items-center justify-center text-grayMedium hover:text-primary cursor-pointer transition-colors hidden sm:flex">
                   <Bell className="h-5 w-5" />
                </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-10 flex-1">
          <div className="max-w-7xl mx-auto">
              {children}
          </div>
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-blackDark/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="absolute inset-y-0 left-0 w-4/5 max-w-sm bg-white p-8 flex flex-col animate-fade-in-up">
            <div className="flex justify-between items-center mb-12">
               <div className="flex items-center gap-3">
                  <div className="bg-primary text-white p-2 rounded-xl font-black text-xl">FIT</div>
                  <span className="font-extrabold text-xl tracking-tight text-blackDark">Tool</span>
               </div>
               <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-6 w-6 text-grayMedium" />
               </button>
            </div>
            <div className="space-y-4 flex-1">
               {menuItems.map(item => (
                 <button
                   key={item.view}
                   onClick={() => { onNavigate(item.view); setMobileMenuOpen(false); }}
                   className={`w-full flex items-center gap-4 p-4 rounded-2xl text-lg font-bold transition-all ${currentView === item.view ? 'bg-primary text-white shadow-xl shadow-blue-500/20' : 'text-grayMedium hover:bg-grayLight'}`}
                 >
                   <item.icon className="h-6 w-6" />
                   {item.label}
                 </button>
               ))}
            </div>
            <div className="pt-8 border-t border-gray-100">
               <button onClick={onLogout} className="w-full flex items-center gap-4 p-4 text-red-600 font-bold">
                  <LogOut className="h-6 w-6" /> Uitloggen
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
