
import React from 'react';
import { ViewType } from '../types.ts';
import { ICONS } from '../constants.tsx';
import { getTranslation, Language } from '../translations.ts';
import { storageService } from '../services/storageService.ts';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  companyName: string;
  lang: Language;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, companyName, lang, onLogout }) => {
  const t = getTranslation(lang);
  
  const navItems: { id: ViewType; label: string; icon: React.FC }[] = [
    { id: 'dashboard', label: t.dashboard, icon: ICONS.Dashboard },
    { id: 'sales', label: t.sales, icon: ICONS.Sales },
    { id: 'expenses', label: t.expenses, icon: ICONS.Expenses },
    { id: 'inventory', label: t.inventory, icon: ICONS.Inventory },
    { id: 'reports', label: t.reports, icon: ICONS.Reports },
    { id: 'settings', label: t.settings, icon: ICONS.Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800 text-center">
          <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            BIZSMART
          </h1>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">{companyName || 'Business Portal'}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeView === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <item.icon />
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center space-x-3 p-3 bg-slate-800 rounded-xl border border-slate-700">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white shadow-inner">
              {companyName?.[0] || 'B'}
            </div>
            <div className="truncate flex-1">
              <p className="text-sm font-bold">{companyName || 'Guest'}</p>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">Pro Status</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all font-bold text-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>LOGOUT</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-auto">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 print:hidden">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
            {navItems.find(n => n.id === activeView)?.label || activeView}
          </h2>
          <div className="flex items-center space-x-4">
             <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border uppercase">{lang} mode</span>
          </div>
        </header>
        <div className="p-8 print:p-0">
          {children}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-around p-2 z-20 print:hidden">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${
              activeView === item.id ? 'text-blue-600 bg-blue-50' : 'text-slate-400'
            }`}
          >
            <item.icon />
            <span className="text-[9px] mt-1 font-bold">{item.label}</span>
          </button>
        ))}
        <button onClick={onLogout} className="flex flex-col items-center p-2 text-rose-400">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
           <span className="text-[9px] mt-1 font-bold">OUT</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
