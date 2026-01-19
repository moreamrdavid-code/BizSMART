
import * as React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BusinessData } from '../types.ts';
import { getTranslation } from '../translations.ts';

interface DashboardProps {
  data: BusinessData;
  onUpdateData: (newData: BusinessData) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const { sales, expenses, config, inventory, customers } = data;
  const lang = config?.language || 'en';
  const t = getTranslation(lang);
  const currency = config?.currency || '৳';
  
  const stats = React.useMemo(() => {
    const totalSales = (sales || []).reduce((acc, s) => acc + s.amount, 0);
    const totalExpenses = (expenses || []).reduce((acc, e) => acc + e.amount, 0);
    const totalDue = (customers || []).reduce((acc, c) => acc + (c.currentBalance > 0 ? c.currentBalance : 0), 0);
    
    let grossProfit = 0;
    (sales || []).forEach(sale => {
      if (sale.stockItemId) {
        const item = (inventory || []).find(i => i.id === sale.stockItemId);
        if (item) {
          grossProfit += (item.sellingPrice - item.purchasePrice) * (sale.quantity || 1);
        } else {
          grossProfit += sale.amount;
        }
      } else {
        grossProfit += sale.amount;
      }
    });

    return { totalSales, totalExpenses, profit: grossProfit - totalExpenses, totalDue };
  }, [sales, expenses, inventory, customers]);

  const chartData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const daySales = (sales || [])
        .filter(s => s.date === date)
        .reduce((acc, s) => acc + s.amount, 0);
      return { date: date.split('-').slice(1).join('/'), sales: daySales };
    });
  }, [sales]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-900 p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl md:text-3xl font-black tracking-tight leading-tight">
            {t.welcome},<br className="md:hidden" /> <span className="text-blue-400">{config?.companyName}</span>
          </h2>
          <p className="text-slate-400 mt-2 font-medium text-xs md:text-base">{t.setupDash}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.totalSales}</p>
          <h3 className="text-xl font-black text-slate-900">{currency}{stats.totalSales.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.totalExpenses}</p>
          <h3 className="text-xl font-black text-rose-500">{currency}{stats.totalExpenses.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.netProfit}</p>
          <h3 className={`text-xl font-black ${stats.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{currency}{stats.profit.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md bg-blue-50/30 border-blue-100">
          <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">{t.totalDue}</p>
          <h3 className="text-xl font-black text-blue-600">{currency}{stats.totalDue.toLocaleString()}</h3>
        </div>
      </div>

      <div className="bg-white p-5 md:p-10 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-6">{t.dailySales}</h3>
        <div className="h-[250px] md:h-[350px] w-full -ml-4 md:-ml-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} width={40} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
