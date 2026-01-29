
import React, { useState } from 'react';
import { AppData, ActionItem, ActionStatus, View, Domain } from '../types';
import { Card, Button, Badge, Modal, Input, Select, TextArea, Tabs } from '../components/Shared';
import { Plus, Calendar, User, ChevronRight, Info, Activity, ListTodo, PlayCircle, CheckCircle2, LayoutGrid, Clock, AlertTriangle } from 'lucide-react';

interface Props {
  data: AppData;
  onUpdate: (data: Partial<AppData>) => void;
  onNavigate: (view: View) => void;
}

const Transitie: React.FC<Props> = ({ data, onUpdate, onNavigate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'board' | 'timeline'>('board');
  const [newAction, setNewAction] = useState<Partial<ActionItem>>({ type: 'Running', status: 'todo', impact: 3, riskLevel: 'Medium' });
  
  const columns: {id: ActionStatus, title: string, icon: any, color: string}[] = [
      { id: 'todo', title: 'Te Doen', icon: ListTodo, color: 'text-grayDark' },
      { id: 'doing', title: 'Running', icon: PlayCircle, color: 'text-primary' },
      { id: 'done', title: 'Voltooid', icon: CheckCircle2, color: 'text-green-600' }
  ];

  const handleAddAction = () => {
      const action: ActionItem = {
          id: Date.now().toString(),
          title: newAction.title || "Nieuwe Actie",
          type: newAction.type || 'Running',
          status: 'todo',
          owner: newAction.owner || 'Onbekend',
          deadline: newAction.deadline || new Date().toISOString().split('T')[0],
          impact: newAction.impact || 3,
          riskLevel: newAction.riskLevel as any || 'Medium',
          description: newAction.description || '',
          origin: 'Manual'
      };
      onUpdate({ actions: [...data.actions, action] });
      setIsModalOpen(false);
      setNewAction({ type: 'Running', status: 'todo', impact: 3, riskLevel: 'Medium' });
  };

  const moveAction = (id: string, newStatus: ActionStatus) => {
      onUpdate({ actions: data.actions.map(a => a.id === id ? { ...a, status: newStatus } : a) });
  };

  const renderTimeline = () => {
    const quarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];
    
    return (
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up">
        <div className="grid grid-cols-4 border-b border-gray-100 bg-grayLight/30">
          {quarters.map(q => (
            <div key={q} className="p-6 text-center border-r last:border-r-0 border-gray-100">
              <span className="text-[10px] font-black text-grayMedium uppercase tracking-widest">{q}</span>
            </div>
          ))}
        </div>
        <div className="min-h-[500px] relative p-8">
          {data.actions.length > 0 ? (
            <div className="space-y-6">
              {data.actions.map((action, idx) => {
                const deadlineDate = new Date(action.deadline);
                const month = deadlineDate.getMonth();
                const leftPos = (month / 12) * 100;
                
                return (
                  <div key={action.id} className="relative h-16 group">
                    <div 
                      className={`absolute h-full rounded-2xl p-4 flex items-center justify-between border-l-4 shadow-sm transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer
                        ${action.status === 'done' ? 'bg-green-50 border-green-500 text-green-900' : 'bg-blue-50 border-primary text-primary'}`}
                      style={{ 
                        left: `${Math.min(leftPos, 70)}%`, 
                        width: '300px' 
                      }}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-black truncate">{action.title}</p>
                        <p className="text-[9px] font-bold opacity-60 uppercase">{action.owner} • {action.deadline}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {action.impact >= 4 && <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />}
                        {action.status === 'done' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-30 py-20">
               <Clock className="h-16 w-16 mb-4" />
               <p className="font-bold uppercase tracking-widest text-sm">Geen acties gepland</p>
            </div>
          )}
        </div>
        <div className="p-8 bg-gray-50 border-t border-gray-100">
           <div className="flex items-center gap-4 text-xs font-bold text-grayMedium">
              <div className="flex items-center gap-2"><div className="h-3 w-3 bg-primary rounded-full"></div> In uitvoering</div>
              <div className="flex items-center gap-2"><div className="h-3 w-3 bg-green-500 rounded-full"></div> Voltooid</div>
              <div className="flex items-center gap-2"><AlertTriangle className="h-3 w-3 text-red-500" /> Hoog Impact</div>
           </div>
        </div>
      </div>
    );
  };

  const renderBoard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 min-h-[650px] items-start animate-fade-in-up">
        {columns.map(col => (
            <div key={col.id} className="rounded-[3rem] bg-grayLight/40 p-8 flex flex-col h-full border border-gray-100 group">
                <div className="flex justify-between items-center mb-10 px-4">
                    <div className="flex items-center gap-3">
                       <col.icon className={`h-5 w-5 ${col.color}`} />
                       <h3 className="font-black text-blackDark text-xs uppercase tracking-[0.2em]">{col.title}</h3>
                    </div>
                    <Badge color={col.id === 'done' ? 'green' : col.id === 'doing' ? 'blue' : 'gray'} className="px-4 rounded-xl">
                      {data.actions.filter(a => a.status === col.id).length}
                    </Badge>
                </div>
                
                <div className="space-y-6 flex-1">
                    {data.actions.filter(a => a.status === col.id).map(action => (
                        <div key={action.id} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-blue-500/5 border border-transparent hover:border-primary/20 transition-all duration-300 group/card relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-2 h-full transition-colors ${action.status === 'done' ? 'bg-green-500' : 'bg-primary/10 group-hover/card:bg-primary'}`}></div>
                            
                            <div className="flex justify-between items-start mb-6">
                                 <Badge color={action.type === 'Changing' ? 'purple' : 'gray'}>
                                     {action.type}
                                 </Badge>
                                 {action.riskLevel === 'High' && <Badge color="red" className="text-[8px]">High Risk</Badge>}
                            </div>
                            
                            <h4 className="font-black text-blackDark text-lg tracking-tight mb-6 leading-snug">{action.title}</h4>
                            
                            <div className="grid grid-cols-2 gap-4 mt-auto pt-6 border-t border-gray-50">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-lg bg-grayLight flex items-center justify-center text-[10px] font-black text-grayMedium">
                                      {action.owner.charAt(0)}
                                    </div>
                                    <span className="text-[10px] font-bold text-grayDark truncate">{action.owner}</span>
                                </div>
                                <div className="flex items-center gap-2 text-grayMedium">
                                    <Calendar className="h-3 w-3" />
                                    <span className="text-[10px] font-bold">{action.deadline}</span>
                                </div>
                            </div>
                            
                            <div className="absolute inset-0 bg-primary/95 backdrop-blur-sm opacity-0 group-hover/card:opacity-100 transition-all flex flex-col items-center justify-center gap-4 p-6 pointer-events-none">
                                <p className="text-white font-black text-center text-xs uppercase tracking-widest mb-2">Verplaats naar:</p>
                                <div className="flex flex-wrap justify-center gap-3 pointer-events-auto">
                                  {col.id !== 'todo' && <Button size="sm" variant="outline" className="bg-white border-none shadow-none text-primary" onClick={() => moveAction(action.id, 'todo')}>Todo</Button>}
                                  {col.id !== 'doing' && <Button size="sm" variant="outline" className="bg-white border-none shadow-none text-primary" onClick={() => moveAction(action.id, 'doing')}>Running</Button>}
                                  {col.id !== 'done' && <Button size="sm" variant="primary" className="bg-green-500 hover:bg-green-600 border-none shadow-none" onClick={() => moveAction(action.id, 'done')}>Check</Button>}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {data.actions.filter(a => a.status === col.id).length === 0 && (
                      <div className="py-16 text-center opacity-30 group-hover:opacity-50 transition-opacity">
                         <Activity className="h-12 w-12 mx-auto mb-4 text-grayMedium" />
                         <p className="text-[10px] font-black uppercase tracking-widest">Kolom is leeg</p>
                      </div>
                    )}
                </div>
            </div>
        ))}
    </div>
  );

  return (
    <div className="space-y-12 pb-32 animate-fade-in-up">
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <Badge color="green" className="mb-4">Executie & Regie</Badge>
            <h1 className="text-5xl md:text-6xl font-black text-blackDark tracking-tight leading-tight">Transitie <span className="text-green-600">Engine.</span></h1>
            <p className="text-lg text-grayDark mt-4 font-medium leading-relaxed">
              Transformeer je analyses naar concrete projecten. Beheer de workflow en bewaak de voortgang van de organisatie-verandering.
            </p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex gap-2">
                <button 
                  onClick={() => setViewMode('board')}
                  className={`p-3 rounded-xl transition-all ${viewMode === 'board' ? 'bg-primary text-white shadow-lg' : 'text-grayMedium hover:bg-grayLight'}`}
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setViewMode('timeline')}
                  className={`p-3 rounded-xl transition-all ${viewMode === 'timeline' ? 'bg-primary text-white shadow-lg' : 'text-grayMedium hover:bg-grayLight'}`}
                >
                  <Clock className="h-5 w-5" />
                </button>
             </div>
             <Button onClick={() => setIsModalOpen(true)} size="lg" className="px-10 border-b-4">
                <Plus className="h-6 w-6 mr-2" /> Nieuwe Actie
             </Button>
          </div>
      </div>

      {viewMode === 'board' ? renderBoard() : renderTimeline()}

      <div className="flex justify-end p-8 bg-white rounded-[3rem] shadow-xl shadow-blue-500/5 border border-gray-100">
          <Button size="lg" onClick={() => onNavigate(View.FITCHECK)} className="px-12 border-b-4 group">
              Naar FIT Rapportage <ChevronRight className="h-6 w-6 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Actie Toevoegen">
          <div className="space-y-6">
              <Input label="Omschrijving / Titel" value={newAction.title || ''} placeholder="Bijv: Implementatie Cloud-Ops" onChange={e => setNewAction({...newAction, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-6">
                   <Select label="Modus" value={newAction.type} onChange={e => setNewAction({...newAction, type: e.target.value as any})} options={['Running', 'Changing']} />
                   <Input label="Deadline" type="date" value={newAction.deadline || ''} onChange={e => setNewAction({...newAction, deadline: e.target.value})} />
              </div>
              <div className="grid grid-cols-3 gap-6">
                   <div className="col-span-1">
                     <Input label="Verantwoordelijke" value={newAction.owner || ''} placeholder="Naam" onChange={e => setNewAction({...newAction, owner: e.target.value})} />
                   </div>
                   <Select label="Impact (1-5)" value={newAction.impact} onChange={e => setNewAction({...newAction, impact: parseInt(e.target.value)})} options={['1','2','3','4','5']} />
                   <Select label="Risico" value={newAction.riskLevel} onChange={e => setNewAction({...newAction, riskLevel: e.target.value as any})} options={['Low','Medium','High']} />
              </div>
              <TextArea label="Detail informatie" rows={3} value={newAction.description || ''} placeholder="Korte toelichting van de verwachte output" onChange={e => setNewAction({...newAction, description: e.target.value})} />
              <div className="flex justify-end pt-4">
                <Button onClick={handleAddAction} className="px-12 py-5 border-b-4">Actie Opslaan</Button>
              </div>
          </div>
      </Modal>
    </div>
  );
};

export default Transitie;
