
import React, { useState, useEffect } from 'react';
import { AppData, View } from '../types';
import { Card, Button, Badge } from '../components/Shared';
import { ArrowRight, Clock, Target, Activity, AlertTriangle, Zap } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface Props {
  data: AppData;
  onNavigate: (view: View) => void;
  onUpdate: (data: Partial<AppData>) => void;
}

const Dashboard: React.FC<Props> = ({ data, onNavigate, onUpdate }) => {
  const activeActions = data.actions.filter(a => a.status !== 'done');
  const overdueActions = data.actions.filter(a => a.status !== 'done' && new Date(a.deadline) < new Date());

  const avgFitScore = data.fitCheckScores.length > 0 
    ? (data.fitCheckScores.reduce((acc, curr) => acc + curr.score, 0) / data.fitCheckScores.length).toFixed(1)
    : "N/A";

  return (
    <div className="space-y-12 animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <Badge color="blue" className="mb-4">System Live: Online</Badge>
          <h1 className="text-5xl md:text-6xl font-black text-blackDark tracking-tight leading-tight">
            Strategy <span className="text-primary">Cockpit.</span>
          </h1>
          <p className="text-lg text-grayDark mt-4 font-medium max-w-2xl">
            Real-time monitoring van je organisatie-fit en de voortgang van je strategische executie.
          </p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" onClick={() => onNavigate(View.ANALYSE)} className="px-10">Advanced Analytics</Button>
           <Button onClick={() => onNavigate(View.TRANSITIE)} className="px-10 group">Execute Actions <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-primary text-white border-none shadow-2xl shadow-blue-500/30 flex flex-col justify-between h-64 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                <Activity className="h-32 w-32" />
              </div>
              <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80">System Fit Score</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <p className="text-7xl font-black tracking-tighter">{avgFitScore === "N/A" ? "---" : avgFitScore}</p>
                    <span className="text-2xl font-bold opacity-50">/ 5</span>
                  </div>
              </div>
              <div className="mt-auto p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                    Engine is actief
                  </p>
              </div>
          </Card>

          <Card className="flex flex-col justify-between h-64 cursor-pointer hover:bg-white" onClick={() => onNavigate(View.TRANSITIE)}>
              <div className="h-14 w-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                  <Clock className="h-8 w-8" />
              </div>
              <div>
                  <p className="text-[10px] font-black text-grayMedium uppercase tracking-widest mb-1">Executie Risico</p>
                  <p className="text-4xl font-black text-blackDark">{overdueActions.length}</p>
                  <p className="text-[10px] font-bold text-red-500 mt-1 uppercase">Overdue acties gedetecteerd</p>
              </div>
          </Card>

          <Card className="flex flex-col justify-between h-64 cursor-pointer hover:bg-white" onClick={() => onNavigate(View.FOCUS)}>
              <div className="h-14 w-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                  <Target className="h-8 w-8" />
              </div>
              <div>
                  <p className="text-[10px] font-black text-grayMedium uppercase tracking-widest mb-1">Strategic Goals</p>
                  <p className="text-4xl font-black text-blackDark">{data.strategicGoals.length}</p>
                  <p className="text-[10px] font-bold text-grayMedium mt-1 uppercase">Gekoppeld aan {data.actions.length} acties</p>
              </div>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <Card className="lg:col-span-2" title="Voortgang Historie" subtitle="FIT-ONTWIKKELING">
              <div className="h-80 w-full pt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.history.length > 0 ? data.history : [{date: 'Start', totalFitScore: 2.0}]}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <YAxis domain={[0, 5]} hide />
                    <Tooltip contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}} />
                    <Area type="monotone" dataKey="totalFitScore" stroke="#3B82F6" strokeWidth={4} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
          </Card>

          <Card title="Systeem Meldingen" subtitle="AUTOMATED MONITORING">
              <div className="space-y-4 pt-4">
                  {overdueActions.length > 0 && (
                      <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-4">
                          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-1" />
                          <p className="text-xs font-bold text-red-900 leading-tight">Actie "{overdueActions[0].title}" is over datum. Risico op vertraging doel: "{data.strategicGoals[0]?.description}".</p>
                      </div>
                  )}
                  {data.strategicGoals.length > 0 && !data.strategicGoals.some(g => g.kpiId) && (
                      <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex items-start gap-4">
                          <Zap className="h-5 w-5 text-yellow-600 shrink-0 mt-1" />
                          <p className="text-xs font-bold text-yellow-900 leading-tight">Niet alle doelen hebben een gekoppelde KPI. Strategische meetbaarheid kan verbeterd worden.</p>
                      </div>
                  )}
                  {data.actions.length === 0 && (
                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
                          <Activity className="h-5 w-5 text-blue-500 shrink-0 mt-1" />
                          <p className="text-xs font-bold text-blue-900 leading-tight">Start met het aanmaken van acties om de Transitie Engine te activeren.</p>
                      </div>
                  )}
              </div>
          </Card>
      </div>
    </div>
  );
};

export default Dashboard;
