
import React, { useState } from 'react';
import { storageService } from '../services/storageService.ts';
import { User, BusinessConfig } from '../types.ts';
import { getTranslation, Language } from '../translations.ts';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [lang, setLang] = useState<Language>('bn');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Retail');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const t = getTranslation(lang);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      if (isLogin) {
        const user = storageService.authenticate(username, password);
        if (user) {
          onLogin(user);
        } else {
          setError(lang === 'bn' ? 'ইউজারনেম বা পাসওয়ার্ড সঠিক নয়' : 'Invalid username or password');
          setLoading(false);
        }
      } else {
        const initialConfig: BusinessConfig = {
          companyName,
          industry,
          targetProfitMargin: 20,
          useMarginEstimation: true,
          currency: '৳',
          language: lang
        };

        const success = storageService.registerUser(username, password, initialConfig);
        if (success) {
          const user = storageService.authenticate(username, password);
          if (user) onLogin(user);
        } else {
          setError(lang === 'bn' ? 'ইউজারনেমটি ইতিমধ্যে বিদ্যমান' : 'Username already exists');
          setLoading(false);
        }
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
      <div className="max-w-md w-full">
        {/* Header Section */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-block mb-4">
             <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-900/40">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3z"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
             </div>
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tighter">
            BIZSMART
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Business Smartly</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-500">
          
          {/* Language Toggle */}
          <div className="flex justify-center mb-6 space-x-2">
            <button onClick={() => setLang('bn')} className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${lang === 'bn' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>বাংলা</button>
            <button onClick={() => setLang('en')} className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${lang === 'en' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>ENGLISH</button>
          </div>

          <div className="flex mb-8 bg-slate-100 p-1.5 rounded-2xl">
            <button 
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${isLogin ? 'bg-white shadow-lg text-blue-600' : 'text-slate-400'}`}
            >
              {t.login.toUpperCase()}
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${!isLogin ? 'bg-white shadow-lg text-blue-600' : 'text-slate-400'}`}
            >
              {t.signup.toUpperCase()}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">{t.username}</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                  placeholder={lang === 'bn' ? 'নাম লিখুন' : 'Enter username'}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">{t.password}</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>

              {!isLogin && (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="border-t border-slate-100 pt-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">{t.companyName}</label>
                    <input 
                      type="text" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                      placeholder={lang === 'bn' ? 'আপনার প্রতিষ্ঠানের নাম' : 'Business Name Ltd.'}
                      required={!isLogin}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">{t.industry}</label>
                    <select 
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm appearance-none"
                    >
                      <option value="Retail">{lang === 'bn' ? 'খুচরা বিক্রেতা / দোকান' : 'Retail / Shop'}</option>
                      <option value="F&B">{lang === 'bn' ? 'খাবার ও পানীয়' : 'Food & Beverage'}</option>
                      <option value="Service">{lang === 'bn' ? 'সেবা প্রদানকারী' : 'Service Industry'}</option>
                      <option value="Tech">{lang === 'bn' ? 'প্রযুক্তি' : 'Technology'}</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-[11px] font-black text-rose-500 uppercase flex items-center space-x-2 animate-in slide-in-from-top-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="tracking-widest uppercase text-xs">
                  {isLogin ? t.enterDashboard : t.createAccount}
                </span>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">
            {isLogin 
              ? (lang === 'bn' ? "সুরক্ষিত এন্ডপয়েন্ট এনক্রিপশন সক্রিয়।" : "Secure endpoint encryption enabled.") 
              : (lang === 'bn' ? "অ্যাকাউন্ট খোলার সাথে আপনি আমাদের শর্তাবলীতে রাজি হচ্ছেন।" : "By signing up, you agree to isolated data terms.")
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
