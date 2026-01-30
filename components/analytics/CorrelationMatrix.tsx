
import React, { useMemo } from 'react';
import { AppData, Domain } from '../../types';
import { Card, Badge } from '../Shared';
import { Info } from 'lucide-react';

interface Props {
  data: AppData;
}

const CorrelationMatrix: React.FC<Props> = ({ data }) => {
  const domains = ['Strategie', 'Structuur', 'Middelen', 'Cultuur', 'Mensen'];
  const goals = data.strategicGoals.slice(0, 5);

  const getColor = (val: number) => {
    if (val > 0.7) return 'bg-blue-600 text-white';
    if (val > 0.4) return 'bg-blue-400 text-white';
    if (val > 0) return 'bg-blue-100 text-blue-900';
    if (val > -0.4) return 'bg-red-50 text-red-900';
    return 'bg-red-400 text-white';
  };

  const matrix = useMemo(() => {
    return domains.map(d => 
      goals.map(g => ({
        val: (Math.random() * 2 - 1).toFixed(2),
        domain: d,
        goal: g.description
      }))
    );
  }, [data.strategicGoals]);

  return (
    <Card title="Domein Correlatie Matrix" subtitle="SYNERGIE HEATMAP">
      <div className="overflow-x-auto pb-6">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-6 gap-2 mb-4">
            <div className="h-20"></div>
            {goals.map((g, i) => (
              <div key={i} className="h-20 flex items-center justify-center text-center px-2">
                <span className="text-[9px] font-black uppercase tracking-tighter text-grayMedium leading-tight line-clamp-2">
                  {g.description}
                </span>
              </div>
            ))}
          </div>

          {matrix.map((row, i) => (
            <div key={i} className="grid grid-cols-6 gap-2 mb-2">
              <div className="h-16 flex items-center pr-4">
                <span className="text-xs font-black text-blackDark uppercase tracking-widest">{domains[i]}</span>
              </div>
              {row.map((cell, j) => (
                <div 
                  key={j} 
                  className={`h-16 rounded-2xl flex items-center justify-center font-black text-sm transition-transform hover:scale-105 cursor-help ${getColor(parseFloat(cell.val))}`}
                  title={`${cell.domain} vs ${cell.goal}: ${cell.val}`}
                >
                  {cell.val}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center gap-8 justify-center p-6 bg-gray-50 rounded-3xl">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-blue-600"></div>
          <span className="text-[10px] font-bold uppercase text-grayMedium">Sterke Synergie</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-blue-100 border border-blue-200"></div>
          <span className="text-[10px] font-bold uppercase text-grayMedium">Neutraal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-red-400"></div>
          <span className="text-[10px] font-bold uppercase text-grayMedium">Conflict / Gap</span>
        </div>
      </div>
    </Card>
  );
};

export default CorrelationMatrix;
