import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { AppData, ActionItem, ActionStatus, View } from '../types';
import { Card, Button, Badge, Modal, Input, Select, TextArea, AIButton } from '../components/Shared';
import { 
  Plus, 
  Calendar, 
  ListTodo, 
  PlayCircle, 
  CheckCircle2, 
  LayoutGrid, 
  Sparkles,
  Filter,
  BarChart3,
  MessageSquareQuote,
  BrainCircuit,
  Search,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  Cell,
  CartesianGrid,
  LabelList
} from 'recharts';
import { generateActionSuggestions, getActionCoaching } from '../services/geminiService';

// --- MEMOIZED ACTION CARD ---
const ActionCard = memo(({ action, onMove, onCoach }: { 
  action: ActionItem, 
  onMove: (id: string, status: ActionStatus) => void,
  onCoach: (action: ActionItem) => void
}) => (
  <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-blue-500/5 border border-transparent hover:border-primary/20 transition-all duration-300 group/card relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-2 h-full transition-colors ${action.status === 'done' ? 'bg-green-500' : 'bg-primary/10 group-hover/card:bg-primary'}`}></div>
      
      <div className="flex justify-between items-start mb-6">
           <Badge color={action.type === 'Changing' ? 'purple' : 'gray'}>
               {action.type}
           </Badge>
           <div className="flex gap-1">
              {action.origin === 'AISuggestion' && <Sparkles className="h-3 w-3 text-primary" />}
              {action.riskLevel === 'High' && <Badge color="red" className="text-[8px]">H-Risk</Badge>}
           </div>
      </div>
      
      <h4 className="font-black text-blackDark text-lg tracking-tight mb-4 leading-snug">{action.title}</h4>
      
      <div className="flex gap-2 mb-6">
         <div className="px-2 py-1 bg-gray-50 rounded-lg text-[8px] font-black text-grayMedium uppercase">IMP: {action.impact}</div>
         <div className="px-2 py-1 bg-gray-50 rounded-lg text-[8px] font-black text-grayMedium uppercase">EFF: {action.effort}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-auto pt-6 border-t border-gray-50">
          <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-grayLight flex items-center justify-center text-[10px] font-black text-grayMedium">
                {action.owner.charAt(0)}
              </div>
              <span className="text-[10px] font-bold text-grayDark truncate">{action.owner}</span>
          </div>
          <div className="flex items-center gap-2 text-grayMedium justify-end">
              <Calendar className="h-3 w-3" />
              <span className="text-[10px] font-bold">{action.deadline}</span>
          </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
         <button 
           onClick={() => onCoach(action)}
           className="text-[9px] font-black text-primary hover:text-blue-700 flex items-center gap-1 uppercase tracking-widest"
         >
            <BrainCircuit className="h-3 w-3" /> AI Coach
         </button>
         <div className="flex gap-1">
            {action.status !== 'todo' && <button onClick={() => onMove(action.id, 'todo')} className="p-1.5 bg-gray-50 rounded-lg hover:bg-gray-100"><ListTodo className="h-3 w-3" /></button>}
            {action.status !== 'doing' && <button onClick={() => onMove(action.id, 'doing')} className="p-1.5 bg-blue-50 text-primary rounded-lg hover:bg-blue-100"><PlayCircle className="h-3 w-3" /></button>}
            {action.status !== 'done' && <button onClick={() => onMove(action.id, 'done')} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><CheckCircle2 className="h-3 w-3" /></button>}
         </div>
      </div>
  </div>
));

// Fix: Add Props interface to satisfy React.FC<Props> and define component inputs
interface Props {
  data: AppData;
  onUpdate: (data: Partial<AppData>) => void;
  onNavigate: (view: View) => void;
}

const Transitie: React.FC<Props> = ({ data, onUpdate, onNavigate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [isCoachingModalOpen, setIsCoachingModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'board' | 'matrix'>('board');
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Partial<ActionItem>[]>([]);
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);
  const [coachingText, setCoachingText] = useState('');
  const [loadingCoaching, setLoadingCoaching] = useState(false);

  // Filter state
  const [filterOwner, setFilterOwner] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Prompt #5: Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const [newAction, setNewAction] = useState<Partial<ActionItem>>({ 
    type: 'Running', 
    status: 'todo', 
    impact: 3, 
    effort: 3,
    riskLevel: 'Medium',
    progress: 0
  });

  const filteredActions = useMemo(() => {
    return data.actions.filter(a => {
      const matchOwner = filterOwner === 'All' || a.owner === filterOwner;
      const matchType = filterType === 'All' || a.type === filterType;
      const matchSearch = !debouncedSearch || a.title.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchOwner && matchType && matchSearch;
    });
  }, [data.actions, filterOwner, filterType, debouncedSearch]);

  const owners = useMemo(() => ['All', ...new Set(data.actions.map(a => a.owner))], [data.actions]);

  const moveAction = useCallback((id: string, newStatus: ActionStatus) => {
    onUpdate({ actions: data.actions.map(a => a.id === id ? { ...a, status: newStatus, progress: newStatus === 'done' ? 100 : a.progress } : a) });
  }, [data.actions, onUpdate]);

  const openCoaching = useCallback(async (action: ActionItem) => {
    setSelectedAction(action);
    setLoadingCoaching(true);
    setIsCoachingModalOpen(true);
    const tip = await getActionCoaching(action, data);
    setCoachingText(tip);
    setLoadingCoaching(false);
  }, [data]);

  return (
    <div className="space-y-12 pb-32 animate-fade-in-up">
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <Badge color="green" className="mb-4">Executie & Regie</Badge>
            <h1 className="text-5xl md:text-6xl font-black text-blackDark tracking-tight leading-tight">Transitie <span className="text-green-600">Engine.</span></h1>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
             <AIButton onClick={async () => {
                setLoadingSuggestions(true);
                const res = await generateActionSuggestions(data);
                setSuggestions(res);
                setIsSuggestionModalOpen(true);
                setLoadingSuggestions(false);
             }} loading={loadingSuggestions} label="AI Actie Plan" />
             <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex gap-2">
                <button onClick={() => setViewMode('board')} className={`p-3 rounded-xl transition-all ${viewMode === 'board' ? 'bg-primary text-white' : 'text-grayMedium hover:bg-grayLight'}`}><LayoutGrid className="h-5 w-5" /></button>
                <button onClick={() => setViewMode('matrix')} className={`p-3 rounded-xl transition-all ${viewMode === 'matrix' ? 'bg-primary text-white' : 'text-grayMedium hover:bg-grayLight'}`}><BarChart3 className="h-5 w-5" /></button>
             </div>
             <Button onClick={() => setIsModalOpen(true)} size="lg" className="px-10 border-b-4"><Plus className="h-6 w-6 mr-2" /> Nieuw</Button>
          </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-wrap gap-8 items-center">
         <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-grayMedium" />
            <input 
              type="text" 
              placeholder="Zoek in actie portfolio..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-grayLight/30 border-none rounded-xl text-xs font-bold"
            />
         </div>
         <div className="flex gap-4">
            <select value={filterOwner} onChange={e => setFilterOwner(e.target.value)} className="px-4 py-2 bg-gray-50 border-none rounded-xl text-[10px] font-black uppercase tracking-widest text-grayDark">
               {owners.map(o => <option key={o} value={o}>Owner: {o}</option>)}
            </select>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-4 py-2 bg-gray-50 border-none rounded-xl text-[10px] font-black uppercase tracking-widest text-grayDark">
               <option value="All">Type: All</option>
               <option value="Running">Running</option>
               <option value="Changing">Changing</option>
            </select>
         </div>
      </div>

      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 min-h-[650px] items-start">
            {['todo', 'doing', 'done'].map((status) => (
                <div key={status} className="rounded-[3rem] bg-grayLight/40 p-8 flex flex-col h-full border border-gray-100">
                    <div className="flex justify-between items-center mb-6 px-4">
                        <h3 className="font-black text-blackDark text-xs uppercase tracking-[0.2em]">{status}</h3>
                        <Badge color="gray">{filteredActions.filter(a => a.status === status).length}</Badge>
                    </div>
                    <div className="space-y-6">
                        {filteredActions.filter(a => a.status === status).map(action => (
                            <ActionCard key={action.id} action={action} onMove={moveAction} onCoach={openCoaching} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
      ) : (
        <Card title="Impact vs Effort" className="h-[600px]">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" dataKey="effort" name="Effort" domain={[0, 6]} hide />
                    <YAxis type="number" dataKey="impact" name="Impact" domain={[0, 6]} hide />
                    <ZAxis type="number" range={[100, 400]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} isAnimationActive={false} />
                    <Scatter name="Actions" data={filteredActions}>
                        {filteredActions.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.impact >= 4 ? '#10B981' : '#3B82F6'} />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </Card>
      )}

      <Modal isOpen={isCoachingModalOpen} onClose={() => setIsCoachingModalOpen(false)} title="AI Coach">
          <div className="space-y-6">
              {loadingCoaching ? <div className="space-y-4"><div className="h-4 bg-gray-100 rounded animate-pulse w-full"></div><div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div></div> : (
                  <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10 italic text-sm font-medium leading-relaxed">
                      "{coachingText}"
                  </div>
              )}
              <Button onClick={() => setIsCoachingModalOpen(false)} className="w-full">Begrepen</Button>
          </div>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Actie Toevoegen">
          <div className="space-y-6">
              <Input label="Titel" value={newAction.title || ''} onChange={e => setNewAction({...newAction, title: e.target.value})} />
              <Button className="w-full py-5" onClick={() => {
                const action: ActionItem = {
                  id: Date.now().toString(),
                  title: newAction.title || "Nieuw",
                  type: 'Changing',
                  status: 'todo',
                  owner: 'Admin',
                  deadline: '2025-12-31',
                  impact: 3,
                  effort: 3,
                  progress: 0
                };
                onUpdate({ actions: [...data.actions, action] });
                setIsModalOpen(false);
              }}>Opslaan</Button>
          </div>
      </Modal>
    </div>
  );
};

export default memo(Transitie);