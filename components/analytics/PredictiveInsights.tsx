
import React from 'react';
import { Card, Button } from '../Shared';
import { Sparkles, TrendingUp, AlertTriangle, Zap, ChevronRight } from 'lucide-react';

interface Props {
  insights: string[];
  onGenerate: () => void;
  loading: boolean;
}

const PredictiveInsights: React.FC<Props> = ({ insights, onGenerate, loading }) => {
  return (
    <Card title="AI Predictive Insights" subtitle="STRATEGISCHE VOORSPELLINGEN">
      <div className="space-y-6">
        {insights.length === 0 && !loading ? (
          <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
            <Zap className="h-12 w-12 mx-auto mb-4 text-primary opacity-20" />
            <h3 className="text-lg font-black text-blackDark mb-2">Klaar voor de toekomst?</h3>
            <p className="text-sm text-grayMedium max-w-xs mx-auto mb-8">Laat Gemini je data analyseren om patronen en toekomstige risico's te identificeren.</p>
            <Button onClick={onGenerate} size="lg" className="px-10">Bereken Voorspellingen</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {loading ? (
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-gray-50 rounded-[2rem] animate-pulse"></div>
                ))
              ) : (
                insights.map((insight, i) => (
                  <div key={i} className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-xl transition-all flex items-start gap-6 group">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${insight.includes('✅') ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                      {insight.includes('✅') ? <TrendingUp className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-blackDark leading-relaxed">{insight.replace('✅', '').trim()}</p>
                    </div>
                    {/* Fixed: ChevronRight added to imports */}
                    <ChevronRight className="h-5 w-5 text-grayLight group-hover:text-primary transition-colors" />
                  </div>
                ))
              )}
            </div>
            {!loading && (
              <div className="flex justify-center">
                <Button variant="ghost" onClick={onGenerate} className="text-[10px]">Ververs Inzichten</Button>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default PredictiveInsights;
