
import React, { useState, useMemo } from 'react';
import { AppData, ActionItem, ActionStatus, View, Domain } from '../types';
import { Card, Button, Badge, Modal, Input, Select, TextArea, Tabs, AIButton } from '../components/Shared';
import { 
  Plus, 
  Calendar, 
  User, 
  ChevronRight, 
  Activity, 
  ListTodo, 
  PlayCircle, 
  CheckCircle2, 
  LayoutGrid, 
  Clock, 
  AlertTriangle,
  Sparkles,
  Zap,
  Filter,
  BarChart3,
  MessageSquareQuote,
  TrendingUp,
  BrainCircuit
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

  const [filterOwner, setFilterOwner] = useState('All');
  const [filterType, setFilterType] = useState('All');
  
  const [newAction, setNewAction] = useState<Partial<ActionItem>>({ 
    type: 'Running', 
    status: 'todo', 
    impact: 3, 
    effort: 3,
    riskLevel: 'Medium',
    progress: 0
  });
  
  const columns: {id: ActionStatus, title: string, icon: any, color: string}[] = [
      { id: 'todo', title: 'Te Doen', icon: ListTodo, color: 'text-grayDark' },
      { id: 'doing', title: 'Running', icon: PlayCircle, color: 'text-primary' },
      { id: 'done', title: 'Voltooid', icon: CheckCircle2, color: 'text-green-600' }
  ];

  const filteredActions = useMemo(() => {
    return data.actions.filter(a => {
      const matchOwner = filterOwner === 'All' || a.owner === filterOwner;
      const matchType = filterType === 'All' || a.type === filterType;
      return matchOwner && matchType;
    });
  }, [data.actions, filterOwner, filterType]);

  const owners = useMemo(() => ['All', ...new Set(data.actions.map(a => a.owner))], [data.actions]);

  const handleAddAction = () => {
      const action: ActionItem = {
          id: Date.now().toString(),
          title: newAction.title || "Nieuwe Actie",
          type: newAction.type || 'Running',
          status: 'todo',
          owner: newAction.owner || 'Onbekend',
          deadline: newAction.deadline || new Date().toISOString().split('T')[0],
          impact: newAction.impact || 3,
          effort: newAction.effort || 3,
          riskLevel: newAction.riskLevel as any || 'Medium',
          description: newAction.description || '',
          origin: newAction.origin || 'Manual',
          linkedId: newAction.linkedId,
          progress: 0
      };
      onUpdate({ actions: [...data.actions, action] });
      setIsModalOpen(false);
      setNewAction({ type: 'Running', status: 'todo', impact: 3, effort: 3, riskLevel: 'Medium', progress: 0 });
  };

  const moveAction = (id: string, newStatus: ActionStatus) => {
      onUpdate({ actions: data.actions.map(a => a.id === id ? { ...a, status: newStatus, progress: newStatus === 'done' ? 100 : a.progress } : a) });
  };

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    const result = await generateActionSuggestions(data);
    setSuggestions(result);
    setIsSuggestionModalOpen(true);
    setLoadingSuggestions(false);
  };

  const adoptSuggestion = (s: Partial<ActionItem>) => {
    const action: ActionItem = {
      title: s.title || "Strategische Actie",
      type: s.type || 'Changing',
      impact: s.impact || 3,
      effort: s.effort || 3,
      riskLevel: s.riskLevel || 'Medium',
      description: s.description || "",
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      status: 'todo',
      owner: 'TBD',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      origin: 'AISuggestion',
      progress: 0
    };
    onUpdate({ actions: [...data.actions, action] });
    setSuggestions(prev => prev.filter(item => item.title !== s.title));
    if (suggestions.length <= 1) setIsSuggestionModalOpen(false);
  };

  const openCoaching = async (action: ActionItem) => {
    setSelectedAction(action);
    setLoadingCoaching(true);
    setIsCoachingModalOpen(true);
    const tip = await getActionCoaching(action, data);
    setCoachingText(tip);
    setLoadingCoaching(false);
  };

  const renderMatrix = () => {
    const scatterData = filteredActions.map(a => ({
      x: a.effort,
      y: a.impact,
      z: 10,
      name: a.title,
      id: a.id,
      risk: a.riskLevel
    }));

    return (
      <Card title="Impact vs Effort Matrix" subtitle="STRATEGISCHE PRIORITERING" className="h-[600px] animate-fade-in-up">
        <div className="h-full w-full relative">
          <ResponsiveContainer width="100%" height="90%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" dataKey="x" name="Effort" domain={[0, 6]} unit="" label={{ value: 'Effort', position: 'insideBottom', offset: -10 }} />
              <YAxis type="number" dataKey="y" name="Impact" domain={[0, 6]} unit="" label={{ value: 'Impact', angle: -90, position: 'insideLeft' }} />
              <ZAxis type="number" dataKey="z" range={[100, 400]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Actions" data={scatterData}>
                {scatterData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.y >= 4 && entry.x <= 2 ? '#10B981' : entry.y <= 2 && entry.x >= 4 ? '#EF4444' : '#3B82F6'} 
                  />
                ))}
                <LabelList dataKey="name" position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#6B7280' }} />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </Card>
    );
  };

  const renderBoard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 min-h-[650px] items-start animate-fade-in-up">
        {columns.map(col => {
          const colActions = filteredActions.filter(a => a.status === col.id);
          const avgProgress = colActions.length > 0 
            ? Math.round(colActions.reduce((acc, curr) => acc + (curr.progress || 0), 0) / colActions.length)
            : 0;

          return (
            <div key={col.id} className="rounded-[3rem] bg-grayLight/40 p-8 flex flex-col h-full border border-gray-100 group">
                <div className="flex justify-between items-center mb-6 px-4">
                    <div className="flex items-center gap-3">
                       <col.icon className={`h-5 w-5 ${col.color}`} />
                       <h3 className="font-black text-blackDark text-xs uppercase tracking-[0.2em]">{col.title}</h3>
                    </div>
                    <Badge color={col.id === 'done' ? 'green' : col.id === 'doing' ? 'blue' : 'gray'}>
                      {colActions.length}
                    </Badge>
                </div>
                
                <div className="space-y-6 flex-1">
                    {colActions.map(action => (
                        <div key={action.id} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-blue-500/5 border border-transparent hover:border-primary/20 transition-all duration-300 group/card relative overflow-hidden">
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
                                 onClick={() => openCoaching(action)}
                                 className="text-[9px] font-black text-primary hover:text-blue-700 flex items-center gap-1 uppercase tracking-widest"
                               >
                                  <BrainCircuit className="h-3 w-3" /> AI Coach
                               </button>
                               <div className="flex gap-1">
                                  {col.id !== 'todo' && <button onClick={() => moveAction(action.id, 'todo')} className="p-1.5 bg-gray-50 rounded-lg hover:bg-gray-100"><ListTodo className="h-3 w-3" /></button>}
                                  {col.id !== 'doing' && <button onClick={() => moveAction(action.id, 'doing')} className="p-1.5 bg-blue-50 text-primary rounded-lg hover:bg-blue-100"><PlayCircle className="h-3 w-3" /></button>}
                                  {col.id !== 'done' && <button onClick={() => moveAction(action.id, 'done')} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><CheckCircle2 className="h-3 w-3" /></button>}
                               </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          );
        })}
    </div>
  );

  return (
    <div className="space-y-12 pb-32 animate-fade-in-up">
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <Badge color="green" className="mb-4">Executie & Regie</Badge>
            <h1 className="text-5xl md:text-6xl font-black text-blackDark tracking-tight leading-tight">Transitie <span className="text-green-600">Engine.</span></h1>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
             <AIButton onClick={fetchSuggestions} loading={loadingSuggestions} label="Vind ontbrekende acties" className="px-10 py-5" />
             <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex gap-2">
                <button onClick={() => setViewMode('board')} className={`p-3 rounded-xl transition-all ${viewMode === 'board' ? 'bg-primary text-white' : 'text-grayMedium hover:bg-grayLight'}`}><LayoutGrid className="h-5 w-5" /></button>
                <button onClick={() => setViewMode('matrix')} className={`p-3 rounded-xl transition-all ${viewMode === 'matrix' ? 'bg-primary text-white' : 'text-grayMedium hover:bg-grayLight'}`}><BarChart3 className="h-5 w-5" /></button>
             </div>
             <Button onClick={() => setIsModalOpen(true)} size="lg" className="px-10 border-b-4"><Plus className="h-6 w-6 mr-2" /> Nieuwe Actie</Button>
          </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-wrap gap-8 items-center">
         <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-grayMedium" />
            <span className="text-[10px] font-black text-grayMedium uppercase tracking-widest">Filters:</span>
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

      {viewMode === 'board' ? renderBoard() : renderMatrix()}

      <Modal isOpen={isSuggestionModalOpen} onClose={() => setIsSuggestionModalOpen(false)} title="AI Actie Suggesties">
          <div className="space-y-6">
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                 {suggestions.map((s, idx) => (
                   <div key={idx} className="p-6 bg-white border border-gray-100 rounded-[2rem] hover:shadow-xl transition-all group">
                      <div className="flex justify-between items-start mb-4">
                         <Badge color="purple">{s.type}</Badge>
                         <div className="flex gap-2">
                            <div className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-[8px] font-black">Impact: {s.impact}</div>
                            <div className="px-2 py-1 bg-gray-50 text-gray-700 rounded-lg text-[8px] font-black">Effort: {s.effort}</div>
                         </div>
                      </div>
                      <h4 className="font-black text-blackDark mb-2">{s.title}</h4>
                      <p className="text-xs text-grayMedium leading-relaxed mb-6 italic">"{s.description}"</p>
                      <Button size="sm" onClick={() => adoptSuggestion(s)} className="w-full">Toevoegen aan Portfolio</Button>
                   </div>
                 ))}
              </div>
          </div>
      </Modal>

      <Modal isOpen={isCoachingModalOpen} onClose={() => setIsCoachingModalOpen(false)} title="AI Executie Coaching">
          {selectedAction && (
            <div className="space-y-8">
               <div className="p-8 bg-blackDark text-white rounded-[2.5rem] relative overflow-hidden">
                  <Badge color="blue" className="mb-4">COACHING</Badge>
                  <h3 className="text-2xl font-black mb-2">{selectedAction.title}</h3>
               </div>
               <Card className="bg-primary/5 border-primary/10 shadow-none">
                  <div className="flex gap-4 items-start">
                     <MessageSquareQuote className="h-8 w-8 text-primary shrink-0" />
                     {loadingCoaching ? (
                       <div className="flex-1 space-y-2 py-2">
                          <div className="h-3 w-full bg-primary/10 rounded animate-pulse"></div>
                          <div className="h-3 w-3/4 bg-primary/10 rounded animate-pulse"></div>
                       </div>
                     ) : (
                       <p className="text-sm font-medium text-blackDark leading-relaxed italic">{coachingText}</p>
                     )}
                  </div>
               </Card>
               <Button className="w-full" onClick={() => setIsCoachingModalOpen(false)}>Gelezen</Button>
            </div>
          )}
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Actie Toevoegen">
          <div className="space-y-6">
              <Input label="Titel" value={newAction.title || ''} onChange={e => setNewAction({...newAction, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-6">
                   <Select label="Modus" value={newAction.type} onChange={e => setNewAction({...newAction, type: e.target.value as any})} options={['Running', 'Changing']} />
                   <Input label="Deadline" type="date" value={newAction.deadline || ''} onChange={e => setNewAction({...newAction, deadline: e.target.value})} />
              </div>
              <div className="grid grid-cols-3 gap-6">
                   <Input label="Owner" value={newAction.owner || ''} onChange={e => setNewAction({...newAction, owner: e.target.value})} />
                   <Select label="Impact (1-5)" value={newAction.impact} onChange={e => setNewAction({...newAction, impact: parseInt(e.target.value)})} options={['1','2','3','4','5']} />
                   <Select label="Effort (1-5)" value={newAction.effort} onChange={e => setNewAction({...newAction, effort: parseInt(e.target.value)})} options={['1','2','3','4','5']} />
              </div>
              <Button onClick={handleAddAction} className="w-full py-5 border-b-4">Actie Opslaan</Button>
          </div>
      </Modal>
    </div>
  );
};

export default Transitie;
