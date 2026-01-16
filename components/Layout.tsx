
import * as React from 'react';
import { ViewType } from '../types.ts';
import { ICONS } from '../constants.tsx';
import { getTranslation, Language } from '../translations.ts';

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
      {/* Sidebar - Desktop Only */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-slate-800 text-center">
          <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            BIZSMART
          </h1>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest truncate px-2">{companyName || 'Business Portal'}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white shadow-inner uppercase">
              {companyName?.[0] || 'B'}
            </div>
            <div className="truncate flex-1">
              <p className="text-sm font-bold truncate">{companyName || 'Guest'}</p>
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header */}
        <header className="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-20 md:px-8 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="md:hidden p-2 bg-blue-600 rounded-lg text-white">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <h2 className="text-sm md:text-base font-black text-slate-800 uppercase tracking-widest truncate max-w-[150px] md:max-w-none">
              {navItems.find(n => n.id === activeView)?.label || activeView}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
             <span className="text-[9px] md:text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded border uppercase">{lang}</span>
             <button onClick={onLogout} className="md:hidden p-2 text-rose-500 bg-rose-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
             </button>
          </div>
        </header>

        {/* Scrollable View Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 pb-24 md:pb-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 flex justify-around items-center px-2 py-3 z-30 print:hidden shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all relative ${
                activeView === item.id ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              {activeView === item.id && (
                <span className="absolute -top-3 w-8 h-1 bg-blue-600 rounded-b-full shadow-sm" />
              )}
              <item.icon />
              <span className="text-[9px] mt-1 font-bold truncate max-w-[60px]">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default Layout;
