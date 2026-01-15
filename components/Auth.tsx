
import * as React from 'react';
import { storageService } from '../services/storageService.ts';
import { User, BusinessConfig } from '../types.ts';
import { getTranslation, Language } from '../translations.ts';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = React.useState(true);
  const [lang, setLang] = React.useState<Language>('bn');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [companyName, setCompanyName] = React.useState('');
  const [industry, setIndustry] = React.useState('Retail');
  
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const t = getTranslation(lang);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const user = await storageService.authenticate(username, password);
        if (user) {
          onLogin(user);
        } else {
          setError(lang === 'bn' ? 'ইউজারনেম বা পাসওয়ার্ড সঠিক নয়' : 'Invalid username or password');
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
        const success = await storageService.registerUser(username, password, initialConfig);
        if (success) {
          const user = await storageService.authenticate(username, password);
          if (user) onLogin(user);
        } else {
          setError(lang === 'bn' ? 'ইউজারনেমটি ইতিমধ্যে ব্যবহৃত বা সার্ভার সমস্যা' : 'Username taken or server error');
        }
      }
    } catch (e) {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
      <div className="max-w-md w-full">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-block mb-4 p-4 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/20">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">BIZSMART</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Cloud Business Management Portal</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
          <div className="flex justify-center mb-6 space-x-2">
            <button onClick={() => setLang('bn')} className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${lang === 'bn' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>বাংলা</button>
            <button onClick={() => setLang('en')} className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${lang === 'en' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>ENGLISH</button>
          </div>

          <div className="flex mb-8 bg-slate-100 p-1.5 rounded-2xl">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${isLogin ? 'bg-white shadow-lg text-blue-600' : 'text-slate-400'}`}>{t.login.toUpperCase()}</button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${!isLogin ? 'bg-white shadow-lg text-blue-600' : 'text-slate-400'}`}>{t.signup.toUpperCase()}</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm"
              placeholder={t.username}
              required
            />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm"
              placeholder={t.password}
              required
            />

            {!isLogin && (
              <div className="space-y-4 pt-2 animate-in slide-in-from-bottom-2">
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm"
                  placeholder={t.companyName}
                  required
                />
                <select 
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm"
                >
                  <option value="Retail">Retail</option>
                  <option value="F&B">Food & Beverage</option>
                  <option value="Service">Services</option>
                </select>
              </div>
            )}

            {error && <p className="text-rose-500 text-[10px] font-black uppercase text-center">{error}</p>}

            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all uppercase text-xs tracking-widest flex items-center justify-center space-y-0 space-x-3">
              {loading && <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
              <span>{loading ? 'Connecting...' : (isLogin ? t.enterDashboard : t.createAccount)}</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button 
              onClick={() => {
                setIsLogin(true);
                setUsername('Admin');
                setPassword('');
                setError(null);
              }}
              className="text-[9px] font-black text-slate-300 hover:text-blue-500 uppercase tracking-[0.2em] transition-colors"
            >
              System Administrator Access
            </button>
          </div>
        </div>
        
        <p className="mt-6 text-[10px] font-bold text-slate-500 text-center uppercase tracking-widest">
          {isLogin ? "Securing your business data" : "Start your online business journey"}
        </p>
      </div>
    </div>
  );
};

export default Auth;
