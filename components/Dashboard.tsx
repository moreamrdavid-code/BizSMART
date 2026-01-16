
import * as React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BusinessData } from '../types.ts';
import { getTranslation } from '../translations.ts';

interface DashboardProps {
  data: BusinessData;
  onUpdateData: (newData: BusinessData) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const { sales, expenses, config, inventory } = data;
  const lang = config?.language || 'en';
  const t = getTranslation(lang);
  const currency = config?.currency || '৳';
  
  const stats = React.useMemo(() => {
    const totalSales = sales.reduce((acc, s) => acc + s.amount, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    
    let grossProfit = 0;
    
    sales.forEach(sale => {
      if (sale.stockItemId) {
        const item = inventory.find(i => i.id === sale.stockItemId);
        if (item) {
          grossProfit += (item.sellingPrice - item.purchasePrice) * (sale.quantity || 1);
        } else {
          grossProfit += sale.amount;
        }
      } else {
        grossProfit += sale.amount;
      }
    });

    const netProfit = grossProfit - totalExpenses;
    
    return { totalSales, totalExpenses, profit: netProfit };
  }, [sales, expenses, inventory]);

  const chartData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const daySales = sales
        .filter(s => s.date === date)
        .reduce((acc, s) => acc + s.amount, 0);
      // Compact date for mobile
      const label = date.split('-').slice(1).join('/');
      return { date: label, sales: daySales };
    });
  }, [sales]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-slate-900 p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl md:text-3xl font-black tracking-tight leading-tight">
            {t.welcome},<br className="md:hidden" /> <span className="text-blue-400">{config?.companyName}</span>
          </h2>
          <p className="text-slate-400 mt-2 font-medium text-xs md:text-base">{t.setupDash}</p>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10 text-white select-none pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-blue-100 group">
          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2 group-hover:text-blue-500 transition-colors">{t.totalSales}</p>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900">{currency}{stats.totalSales.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-rose-100 group">
          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2 group-hover:text-rose-500 transition-colors">{t.totalExpenses}</p>
          <h3 className="text-2xl md:text-3xl font-black text-rose-500">{currency}{stats.totalExpenses.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-emerald-100 group">
          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2 group-hover:text-emerald-500 transition-colors">{t.netProfit}</p>
          <h3 className={`text-2xl md:text-3xl font-black ${stats.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {currency}{stats.profit.toLocaleString()}
          </h3>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white p-5 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h3 className="text-[10px] md:text-sm font-black text-slate-800 uppercase tracking-widest">{t.dailySales}</h3>
          <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase">Last 7 Days</span>
        </div>
        <div className="h-[250px] md:h-[350px] w-full -ml-4 md:-ml-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
                width={40}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', padding: '12px' }}
                labelStyle={{ fontWeight: 800, marginBottom: '4px', color: '#1e293b' }}
              />
              <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
