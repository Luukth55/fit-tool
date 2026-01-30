
import React, { useMemo } from 'react';
import { AppData } from '../../types';
import { Card } from '../Shared';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar,
  Legend
} from 'recharts';

interface Props {
  data: AppData;
}

const TrendsAnalysis: React.FC<Props> = ({ data }) => {
  const lineData = useMemo(() => {
    if (data.history.length === 0) return [{ date: 'Start', totalFitScore: 40 }];
    return data.history.map(h => ({
      date: h.date,
      fit: h.totalFitScore * 20 // Convert to percentage
    }));
  }, [data.history]);

  const actionData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun'];
    return months.map(m => ({
      month: m,
      voltooid: Math.floor(Math.random() * 5) + 2,
      gepland: Math.floor(Math.random() * 8) + 5
    }));
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card title="FIT Score Evolutie" subtitle="TREND OVER DE TIJD (%)">
        <div className="h-80 w-full pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" hide />
              <YAxis domain={[0, 100]} hide />
              <Tooltip 
                contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="fit" 
                stroke="#3B82F6" 
                strokeWidth={4} 
                dot={{ r: 6, fill: '#3B82F6' }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Executie Velocity" subtitle="ACTIE DOORLOOP PER MAAND">
        <div className="h-80 w-full pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={actionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="voltooid" fill="#10B981" radius={[10, 10, 0, 0]} />
              <Bar dataKey="gepland" fill="#E5E7EB" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default TrendsAnalysis;
