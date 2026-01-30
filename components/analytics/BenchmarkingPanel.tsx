
import React from 'react';
import { AppData } from '../../types';
import { Card, Badge } from '../Shared';
import { Globe, ShieldCheck, TrendingUp, Info } from 'lucide-react';

interface Props {
  data: AppData;
}

const BenchmarkingPanel: React.FC<Props> = ({ data }) => {
  const benchmarks = [
    { label: 'Overall FIT', your: 68, sector: 54, status: 'Boven Gemiddeld' },
    { label: 'Digitale Maturity', your: 65, sector: 42, status: 'Koploper' },
    { label: 'Cultuur Fit', your: 3.2, sector: 3.8, status: 'Aandachtspunt' },
    { label: 'Executie Snelheid', your: 78, sector: 61, status: 'Efficiënt' },
  ];

  return (
    <Card title="Sector Benchmarking" subtitle="VERGELIJKING MET DE MARKT">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="p-8 bg-primary rounded-[3rem] text-white">
            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Relatieve Markt Positie</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black">+24%</span>
              <span className="text-sm font-bold opacity-60">t.o.v. Sector</span>
            </div>
            <p className="text-xs mt-6 leading-relaxed opacity-90">Op basis van de laatste sector-data (Technologie/SaaS) presteert jouw organisatie significant beter op executie en digitale volwassenheid.</p>
          </div>

          <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl">
            <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-2">
              <Info className="h-3.5 w-3.5" /> Markt Bronnen
            </div>
            <ul className="text-[10px] font-bold text-blue-900 space-y-1">
              <li className="flex items-center gap-2 opacity-60 hover:opacity-100 cursor-pointer"><Globe className="h-3 w-3" /> Gartner SaaS Industry Report 2024</li>
              <li className="flex items-center gap-2 opacity-60 hover:opacity-100 cursor-pointer"><Globe className="h-3 w-3" /> Deloitte Agile Org Audit Index</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          {benchmarks.map(b => (
            <div key={b.label} className="p-6 bg-white border border-gray-100 rounded-3xl hover:border-primary/20 transition-all group">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-black text-blackDark uppercase tracking-widest">{b.label}</span>
                <Badge color={b.status === 'Aandachtspunt' ? 'red' : 'green'}>{b.status}</Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] font-black mb-1">
                    <span className="text-primary">Jij: {b.your}</span>
                    <span className="text-grayMedium">Sector: {b.sector}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 left-0 h-full bg-primary" style={{ width: `${(b.your / Math.max(b.your, b.sector)) * 100}%` }}></div>
                    <div className="absolute top-0 left-0 h-full w-1 bg-grayDark/20 z-10" style={{ left: `${(b.sector / Math.max(b.your, b.sector)) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default BenchmarkingPanel;
