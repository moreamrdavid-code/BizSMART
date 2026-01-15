
import React, { useState } from 'react';
import { Expense, ExpenseType } from '../types';
import { getTranslation, Language } from '../translations';

interface ExpenseEntryProps {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  currency: string;
  lang: Language;
}

const ExpenseEntry: React.FC<ExpenseEntryProps> = ({ expenses, onAddExpense, onDeleteExpense, currency, lang }) => {
  const t = getTranslation(lang);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<ExpenseType>(ExpenseType.OTHER);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      amount: parseFloat(amount),
      type,
      date,
      description
    };
    onAddExpense(newExpense);
    setAmount('');
    setDescription('');
  };

  const typeLabels: Record<string, string> = {
    [ExpenseType.SALARY]: t.salary,
    [ExpenseType.RENT]: t.rent,
    [ExpenseType.ELECTRICITY]: t.electricity,
    [ExpenseType.MARKETING]: t.marketing,
    [ExpenseType.UTILITIES]: t.utilities,
    [ExpenseType.OTHER]: t.other
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm h-fit">
        <h3 className="text-sm font-black uppercase tracking-widest text-rose-600 mb-6">{t.addExpense}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t.expenseType}</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ExpenseType)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-bold text-sm"
            >
              {Object.values(ExpenseType).map(v => (
                <option key={v} value={v}>{typeLabels[v] || v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t.amount} ({currency})</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none text-xl font-black text-slate-800"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t.date}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-bold text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t.description}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none h-24 font-medium text-sm"
              placeholder={lang === 'bn' ? 'ব্যয়ের বিবরণ...' : 'Details...'}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-rose-100"
          >
            {t.addExpense}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">{lang === 'bn' ? 'ব্যয়ের ইতিহাস' : 'Expense History'}</h3>
          <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase">{expenses.length} {lang === 'bn' ? 'আইটেম' : 'items'}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-tighter">
              <tr>
                <th className="px-8 py-4">{t.date}</th>
                <th className="px-8 py-4">{lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}</th>
                <th className="px-8 py-4">{t.description}</th>
                <th className="px-8 py-4 text-right">{t.amount}</th>
                <th className="px-8 py-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-300 font-bold uppercase text-xs">Empty history.</td>
                </tr>
              ) : (
                [...expenses].sort((a, b) => b.date.localeCompare(a.date)).map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 text-xs font-bold text-slate-500">{exp.date}</td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 text-[9px] font-black uppercase rounded-lg bg-slate-100 text-slate-600">
                        {typeLabels[exp.type] || exp.type}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-slate-800 text-sm font-medium">{exp.description}</td>
                    <td className="px-8 py-5 font-black text-rose-500 text-right">{currency}{exp.amount.toLocaleString()}</td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => onDeleteExpense(exp.id)}
                        className="text-slate-300 hover:text-rose-500 p-2 rounded-xl transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseEntry;
