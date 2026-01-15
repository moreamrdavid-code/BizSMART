
import React, { useState } from 'react';
import { BusinessConfig } from '../types';
import { getTranslation } from '../translations';

interface SettingsProps {
  config: BusinessConfig;
  onUpdateConfig: (config: BusinessConfig) => void;
}

const Settings: React.FC<SettingsProps> = ({ config, onUpdateConfig }) => {
  const [formData, setFormData] = useState<BusinessConfig>(config);
  const t = getTranslation(formData.language || 'en');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(formData);
    alert(formData.language === 'bn' ? 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Settings saved successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto animate-in slide-in-from-right-4 duration-500">
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-100 pb-6 mb-8">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{t.settings}</h3>
          <div className="flex bg-slate-100 p-1 rounded-xl">
             <button 
                type="button"
                onClick={() => setFormData({...formData, language: 'bn'})}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${formData.language === 'bn' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
             >
               বাংলা
             </button>
             <button 
                type="button"
                onClick={() => setFormData({...formData, language: 'en'})}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${formData.language === 'en' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
             >
               EN
             </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">{t.companyName}</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">{t.industry}</label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({...formData, industry: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
              >
                <option value="Retail">Retail</option>
                <option value="F&B">Food & Beverage</option>
                <option value="Service">Service Industry</option>
                <option value="Tech">Technology</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-slate-900 text-sm uppercase tracking-tighter">{t.profitMethod}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Automatic vs Manual Profit Calculation</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({...formData, useMarginEstimation: !formData.useMarginEstimation})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  formData.useMarginEstimation ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.useMarginEstimation ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {formData.useMarginEstimation && (
              <div className="pt-6 border-t border-slate-200 animate-in fade-in duration-300">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">{t.marginPercentage}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.targetProfitMargin}
                    onChange={(e) => setFormData({...formData, targetProfitMargin: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none pr-12 font-black text-lg"
                    min="0"
                    max="100"
                    required
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xl">%</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => { if(confirm(formData.language === 'bn' ? 'আপনি কি নিশ্চিত? এটি আপনার সব ডেটা মুছে ফেলবে।' : 'Are you sure? This will delete all records.')) { localStorage.clear(); window.location.reload(); } }}
              className="text-rose-500 hover:text-rose-600 font-black text-[10px] uppercase tracking-widest transition-all"
            >
              {t.resetData}
            </button>
            <button
              type="submit"
              className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              {t.saveChanges}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
