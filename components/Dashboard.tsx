
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { BusinessData, Sale, Expense, StockItem } from '../types';
import { getTranslation } from '../translations';

interface DashboardProps {
  data: BusinessData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const { sales, expenses, config, inventory } = data;
  const lang = config?.language || 'en';
  const t = getTranslation(lang);
  
  const currency = config?.currency || '৳';
  const targetMargin = (config?.targetProfitMargin || 0) / 100;
  const useMargin = config?.useMarginEstimation ?? true;

  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    const dailySales = sales.filter(s => s.date === today).reduce((acc, s) => acc + s.amount, 0);
    const monthlySales = sales.filter(s => s.date >= firstDayOfMonth).reduce((acc, s) => acc + s.amount, 0);
    const totalSales = sales.reduce((acc, s) => acc + s.amount, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

    let actualGrossProfit = 0;
    let manualSalesTotal = 0;

    sales.forEach(sale => {
      if (sale.stockItemId) {
        const item = inventory.find(i => i.id === sale.stockItemId);
        if (item) {
          const itemProfit = (item.sellingPrice - item.purchasePrice) * (sale.quantity || 1);
          actualGrossProfit += itemProfit;
        } else {
          manualSalesTotal += sale.amount;
        }
      } else {
        manualSalesTotal += sale.amount;
      }
    });

    const estimatedGrossProfit = useMargin ? (manualSalesTotal * targetMargin) : 0;
    const totalGrossProfit = actualGrossProfit + estimatedGrossProfit;
    const netProfit = totalGrossProfit - totalExpenses;
    const shouldShowProfit = useMargin || actualGrossProfit > 0;

    return { dailySales, monthlySales, totalSales, totalExpenses, netProfit, shouldShowProfit };
  }, [sales, expenses, inventory, targetMargin, useMargin]);

  const chartData = useMemo(() => {
    const grouped = sales.reduce((acc: any, sale) => {
      const date = sale.date;
      if (!acc[date]) acc[date] = { amount: 0, profit: 0 };
      acc[date].amount += sale.amount;
      
      let saleProfit = 0;
      if (sale.stockItemId) {
        const item = inventory.find(i => i.id === sale.stockItemId);
        if (item) {
          saleProfit = (item.sellingPrice - item.purchasePrice) * (sale.quantity || 1);
        } else if (useMargin) {
          saleProfit = sale.amount * targetMargin;
        }
      } else if (useMargin) {
        saleProfit = sale.amount * targetMargin;
      }
      acc[date].profit += saleProfit;
      return acc;
    }, {});

    return Object.keys(grouped).sort().slice(-7).map(date => ({
      date,
      amount: grouped[date].amount,
      profit: grouped[date].profit
    }));
  }, [sales, inventory, targetMargin, useMargin]);

  const expenseBreakdown = useMemo(() => {
    const grouped = expenses.reduce((acc: any, exp) => {
      acc[exp.type] = (acc[exp.type] || 0) + exp.amount;
      return acc;
    }, {});
    return Object.keys(grouped).map(type => ({ name: type, value: grouped[type] }));
  }, [expenses]);

  const StatCard = ({ title, value, color }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{title}</p>
      <h3 className={`text-2xl font-black mt-2 ${color}`}>{currency}{value.toLocaleString()}</h3>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t.dailySales} value={stats.dailySales} color="text-slate-900" />
        <StatCard title={t.monthlySales} value={stats.monthlySales} color="text-slate-900" />
        {stats.shouldShowProfit ? (
          <StatCard title={t.netProfit} value={stats.netProfit} color={stats.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'} />
        ) : (
          <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200 flex items-center justify-center text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'bn' ? 'লাভ দেখতে মার্জিন সেট করুন' : 'Setup margin to see profit'}</p>
          </div>
        )}
        <StatCard title={t.totalExpenses} value={stats.totalExpenses} color="text-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
           <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8">{lang === 'bn' ? 'পারফরম্যান্স ট্রেন্ড' : 'Performance Trends'}</h3>
           <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" name={t.totalSales} />
                  {stats.shouldShowProfit && (
                    <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} name={t.netProfit} />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-bold uppercase text-xs">
                No data available.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
           <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8">{lang === 'bn' ? 'ব্যয়ের বিভাজন' : 'Expense Breakdown'}</h3>
           <div className="h-[300px] w-full">
            {expenseBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseBreakdown} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#475569', fontWeight: 700}} width={100} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="value" fill="#f43f5e" radius={[0, 8, 8, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 font-bold uppercase text-xs">
                No expense data.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
