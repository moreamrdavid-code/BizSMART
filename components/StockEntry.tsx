
import * as React from 'react';
import { StockItem } from '../types.ts';
import { getTranslation, Language } from '../translations.ts';

interface StockEntryProps {
  inventory: StockItem[];
  onStockIn: (itemId: string, qty: number) => void;
  lang: Language;
  currency: string;
}

const StockEntry: React.FC<StockEntryProps> = ({ inventory, onStockIn, lang, currency }) => {
  const t = getTranslation(lang);
  const [selectedId, setSelectedId] = React.useState('');
  const [qty, setQty] = React.useState('');
  const [billNo, setBillNo] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !qty) return;
    onStockIn(selectedId, parseInt(qty));
    setSelectedId('');
    setQty('');
    setBillNo('');
    alert(lang === 'bn' ? 'স্টক সফলভাবে আপডেট হয়েছে' : 'Stock updated successfully');
  };

  return (
    <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 lg:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4 mb-8">
           <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
           </div>
           <div>
             <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{t.stockIn}</h3>
             <p className="text-xs font-bold text-slate-400">{lang === 'bn' ? 'স্টকে নতুন পণ্য যোগ করুন' : 'Add new quantities to existing products'}</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">{t.itemName}</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm"
              required
            >
              <option value="">{lang === 'bn' ? 'পণ্য নির্বাচন করুন' : 'Select Product'}</option>
              {inventory.map(item => (
                <option key={item.id} value={item.id}>{item.name} (Now: {item.currentQuantity})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Quantity to Add</label>
               <input
                 type="number"
                 value={qty}
                 onChange={(e) => setQty(e.target.value)}
                 className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                 placeholder="0"
                 required
               />
             </div>
             <div>
               <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">{t.billNumber}</label>
               <input
                 type="text"
                 value={billNo}
                 onChange={(e) => setBillNo(e.target.value)}
                 className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                 placeholder="#INV-000"
               />
             </div>
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl hover:bg-slate-800 transition-all uppercase text-sm tracking-widest shadow-xl shadow-slate-200 mt-4">
             Update Inventory
          </button>
        </form>
      </div>
    </div>
  );
};

export default StockEntry;
