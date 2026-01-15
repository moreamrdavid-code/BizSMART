
import React, { useState, useEffect } from 'react';
import { BusinessData } from '../types';
import { getBusinessInsights } from '../services/geminiService';

interface InsightsProps {
  data: BusinessData;
}

const Insights: React.FC<InsightsProps> = ({ data }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    const result = await getBusinessInsights(data);
    setInsights(result);
    setLoading(false);
  };

  useEffect(() => {
    if (data.sales.length > 0) {
      fetchInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl shadow-blue-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">AI Business Advisor</h2>
            <p className="text-blue-100">Intelligent analysis based on your recent activity.</p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 12L2.7 7.3"/><path d="M12 12l9.3 4.7"/><path d="M19.1 5.9L5 18.1"/></svg>
          </div>
        </div>
        <button 
          onClick={fetchInsights}
          disabled={loading}
          className="mt-8 bg-white text-blue-600 px-6 py-2 rounded-xl font-bold hover:bg-blue-50 transition-colors disabled:opacity-50"
        >
          {loading ? 'Analyzing Data...' : 'Refresh Insights'}
        </button>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[400px]">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Crunching your numbers...</p>
          </div>
        ) : insights ? (
          <div className="prose prose-slate max-w-none">
             {/* Render insights string - in a real app you'd use a markdown library like react-markdown */}
             {insights.split('\n').map((line, i) => (
               <p key={i} className={line.startsWith('#') ? 'text-xl font-bold mt-4' : 'text-slate-600'}>
                 {line}
               </p>
             ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
            <div className="text-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-700">Not enough data yet</h3>
            <p className="text-slate-500 max-w-xs">Log at least one sale and one expense to generate personalized AI insights for your business.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Insights;
