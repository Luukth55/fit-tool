
import React, { useState } from 'react';
import { AppData, View } from '../types';
import { Tabs } from '../components/Shared';
import TrendsAnalysis from '../components/analytics/TrendsAnalysis';
import CorrelationMatrix from '../components/analytics/CorrelationMatrix';
import PredictiveInsights from '../components/analytics/PredictiveInsights';
import BenchmarkingPanel from '../components/analytics/BenchmarkingPanel';
import { generatePredictiveInsights } from '../services/geminiService';

interface AnalyticsProps {
  data: AppData;
  onNavigate: (view: View) => void;
}

const AdvancedAnalytics: React.FC<AnalyticsProps> = ({ data, onNavigate }) => {
  const [activeSection, setActiveSection] = useState('Trends');
  const [aiInsights, setAIInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generatePredictions = async () => {
    setLoading(true);
    try {
      const insights = await generatePredictiveInsights(data);
      setAIInsights(insights);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in-up">
      <div className="flex items-center justify-between">
         <Tabs 
          tabs={['Trends', 'Correlations', 'Predictions', 'Benchmarks']} 
          activeTab={activeSection} 
          onChange={setActiveSection} 
        />
      </div>
      
      <div className="min-h-[600px]">
        {activeSection === 'Trends' && <TrendsAnalysis data={data} />}
        {activeSection === 'Correlations' && <CorrelationMatrix data={data} />}
        {activeSection === 'Predictions' && (
          <PredictiveInsights 
            insights={aiInsights} 
            onGenerate={generatePredictions} 
            loading={loading} 
          />
        )}
        {activeSection === 'Benchmarks' && <BenchmarkingPanel data={data} />}
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
