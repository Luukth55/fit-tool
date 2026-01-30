
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { LucideIcon, X, Sparkles, AlertCircle } from 'lucide-react';
import DOMPurify from 'dompurify';

export const sanitize = (text: string) => DOMPurify.sanitize(text);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger', size?: 'sm' | 'md' | 'lg' }> = ({ 
  className = '', 
  variant = 'primary', 
  size = 'md',
  children, 
  ...props 
}) => {
  const baseStyles = "rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-primary text-white hover:bg-blue-600 shadow-xl shadow-blue-500/20 border-b-4 border-blue-700 hover:border-blue-800",
    secondary: "bg-deepBlue text-white hover:bg-blue-900 shadow-lg",
    outline: "border-2 border-gray-200 text-grayDark hover:border-primary hover:text-primary bg-transparent",
    ghost: "text-grayMedium hover:text-primary hover:bg-primary/5",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20",
  };
  const sizes = {
      sm: "px-4 py-2 text-xs uppercase tracking-widest",
      md: "px-6 py-3 text-sm uppercase tracking-widest",
      lg: "px-10 py-4 text-base uppercase tracking-widest"
  }
  
  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string; subtitle?: string; action?: React.ReactNode; onClick?: () => void }> = ({ children, className = '', title, subtitle, action, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-[2.5rem] shadow-xl shadow-blue-500/5 border border-gray-100 p-8 transition-all duration-500 ${className} ${onClick ? 'cursor-pointer hover:shadow-2xl hover:-translate-y-1' : ''}`}
  >
    {(title || action) && (
      <div className="flex justify-between items-start mb-8">
        <div>
          {title && <h3 className="text-xl font-black text-blackDark tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs font-bold text-grayMedium uppercase tracking-widest mt-1">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="mb-6">
    {label && <label className="block text-[10px] font-black text-grayMedium uppercase tracking-[0.2em] mb-2 ml-1">{label}</label>}
    <input 
      className={`w-full px-6 py-4 border border-gray-100 bg-grayLight/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all text-sm font-bold text-blackDark ${className}`}
      {...props} 
    />
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; options: {value: string, label: string}[] | string[] }> = ({ label, options, className = '', ...props }) => (
  <div className="mb-6">
    {label && <label className="block text-[10px] font-black text-grayMedium uppercase tracking-[0.2em] mb-2 ml-1">{label}</label>}
    <select 
      className={`w-full px-6 py-4 border border-gray-100 bg-grayLight/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary bg-white transition-all text-sm font-bold text-blackDark appearance-none cursor-pointer ${className}`}
      {...props}
    >
      {options.map((opt, idx) => {
          const value = typeof opt === 'string' ? opt : opt.value;
          const labelText = typeof opt === 'string' ? opt : opt.label;
          return <option key={idx} value={value}>{labelText}</option>
      })}
    </select>
  </div>
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, className = '', ...props }) => (
    <div className="mb-6">
      {label && <label className="block text-[10px] font-black text-grayMedium uppercase tracking-[0.2em] mb-2 ml-1">{label}</label>}
      <textarea 
        className={`w-full px-6 py-4 border border-gray-100 bg-grayLight/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all text-sm font-bold text-blackDark leading-relaxed ${className}`}
        {...props} 
      />
    </div>
  );

export const Badge: React.FC<{ 
    children: React.ReactNode; 
    color?: 'green' | 'blue' | 'yellow' | 'red' | 'gray' | 'purple' | 'indigo';
    className?: string;
}> = ({ children, color = 'gray', className = '' }) => {
    const colors = {
        green: 'bg-green-50 text-green-700 border-green-100',
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
        red: 'bg-red-50 text-red-700 border-red-100',
        gray: 'bg-gray-50 text-gray-600 border-gray-100',
        purple: 'bg-purple-50 text-purple-700 border-purple-100',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100'
    }
    return (
        <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${colors[color]} ${className}`}>
            {children}
        </span>
    )
}

export const AIButton: React.FC<{ onClick: () => void; loading?: boolean; label?: string; className?: string }> = ({ onClick, loading, label = "AI Analyse", className = '' }) => (
    <Button 
        onClick={onClick} 
        disabled={loading}
        className={`bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-700 hover:to-blue-700 text-white shadow-xl shadow-indigo-500/20 border-b-4 border-indigo-900 ${className}`}
    >
        {loading ? (
            <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
            </span>
        ) : (
            <span className="flex items-center gap-2">
               <Sparkles className="h-4 w-4" /> {label}
            </span>
        )}
    </Button>
);

export const Tabs: React.FC<{ tabs: string[]; activeTab: string; onChange: (tab: string) => void }> = ({ tabs, activeTab, onChange }) => (
    <div className="flex gap-4 p-2 bg-grayLight/50 rounded-[2rem] w-fit mb-8 border border-gray-100">
        {tabs.map((tab) => (
            <button
                key={tab}
                onClick={() => onChange(tab)}
                className={`
                    px-8 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all duration-300
                    ${activeTab === tab 
                        ? 'bg-white text-primary shadow-lg shadow-blue-500/10 scale-105' 
                        : 'text-grayMedium hover:text-grayDark'}
                `}
            >
                {tab}
            </button>
        ))}
    </div>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-blackDark/60 backdrop-blur-md transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-fade-in-up">
                <div className="p-10">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-3xl font-black text-blackDark tracking-tight">{title}</h3>
                        <button onClick={onClose} className="p-3 bg-grayLight rounded-2xl hover:bg-gray-200 transition-colors">
                            <X className="h-6 w-6 text-grayDark" />
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};

// Global Error Boundary for Production Monitoring
interface ErrorBoundaryProps {
    children?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

/**
 * Fix: Explicitly extending React.Component and using class property initialization for 'state'
 * to ensure that the 'state' and 'props' properties are correctly recognized and typed by the TypeScript compiler.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(_: Error): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Here you would log to Sentry or similar
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
                    <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl text-center border border-red-100">
                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                        <h2 className="text-2xl font-black text-blackDark mb-4">Oeps! Er ging iets mis.</h2>
                        <p className="text-grayDark mb-8">Onze systemen hebben een onverwachte fout geregistreerd. Herlaad de pagina of probeer het later opnieuw.</p>
                        <Button onClick={() => window.location.reload()} className="w-full">Pagina Herladen</Button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
