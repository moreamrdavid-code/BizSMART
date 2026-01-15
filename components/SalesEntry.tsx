
import * as React from 'react';
import { Sale, StockItem } from '../types.ts';
import { getTranslation, Language } from '../translations.ts';

interface SalesEntryProps {
  sales: Sale[];
  inventory: StockItem[];
  onAddSale: (sale: Sale) => void;
  onDeleteSale: (id: string) => void;
  currency: string;
  lang: Language;
}

const SalesEntry: React.FC<SalesEntryProps> = ({ sales, inventory, onAddSale, onDeleteSale, currency, lang }) => {
  const t = getTranslation(lang);
  const [amount, setAmount] = React.useState('');
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = React.useState('');
  const [stockItemId, setStockItemId] = React.useState('');
  const [quantity, setQuantity] = React.useState('1');
  const [error, setError] = React.useState<string | null>(null);

  const selectedItem = inventory.find(i => i.id === stockItemId);

  const handleStockItemChange = (id: string) => {
    setStockItemId(id);
    setError(null);
    const item = inventory.find(i => i.id === id);
    if (item) {
      setAmount((item.sellingPrice * parseInt(quantity)).toString());
    }
  };

  const handleQuantityChange = (q: string) => {
    const qtyNum = parseInt(q) || 0;
    setQuantity(q);
    setError(null);
    
    if (selectedItem && qtyNum > selectedItem.currentQuantity) {
      setError(`${t.stockLimitErr} ${selectedItem.currentQuantity} ${t.onlyUnitsLeft}`);
    }

    if (selectedItem) {
      setAmount((selectedItem.sellingPrice * qtyNum).toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = parseInt(quantity);
    if (!amount || parseFloat(amount) <= 0) return;

    if (selectedItem && qtyNum > selectedItem.currentQuantity) {
      setError(`${t.stockLimitErr} ${selectedItem.currentQuantity} ${t.onlyUnitsLeft}`);
      return;
    }

    const newSale: Sale = {
      id: crypto.randomUUID(),
      amount: parseFloat(amount),
      date,
      note,
      stockItemId: stockItemId || undefined,
      quantity: stockItemId ? qtyNum : undefined
    };
    
    onAddSale(newSale);
    setAmount('');
    setNote('');
    setStockItemId('');
    setQuantity('1');
    setError(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm h-fit">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-6">{t.addSale}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">{lang === 'bn' ? 'আইটেম নির্বাচন করুন' : 'Select Item'}</label>
            <select
              value={stockItemId}
              onChange={(e) => handleStockItemChange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
            >
              <option value="">{lang === 'bn' ? 'ম্যানুয়াল এন্ট্রি' : 'Manual Entry'}</option>
              {inventory.map(item => (
                <option key={item.id} value={item.id} disabled={item.currentQuantity <= 0}>
                  {item.name} ({item.currentQuantity} {t.inStock})
                </option>
              ))}
            </select>
          </div>

          {stockItemId && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'bn' ? 'পরিমাণ' : 'Quantity'}</label>
                <span className="text-[10px] font-black text-blue-500">MAX: {selectedItem?.currentQuantity}</span>
              </div>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 outline-none font-bold ${error ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-blue-500'}`}
                required
              />
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[10px] font-bold text-rose-600 uppercase flex items-center space-x-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
               <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t.amount} ({currency})</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-xl font-black text-slate-800"
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
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={!!error}
            className={`w-full text-white font-black py-4 rounded-2xl transition-all shadow-xl ${error ? 'bg-slate-200 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'}`}
          >
            {lang === 'bn' ? 'বিক্রয় রেকর্ড করুন' : 'Record Sale'}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">{lang === 'bn' ? 'সাম্প্রতিক বিক্রয় লগ' : 'Recent Sales Log'}</h3>
          <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase">{sales.length} {lang === 'bn' ? 'রেকর্ড' : 'records'}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-tighter">
              <tr>
                <th className="px-8 py-4">{t.date}</th>
                <th className="px-8 py-4">{lang === 'bn' ? 'পণ্য' : 'Product'}</th>
                <th className="px-8 py-4 text-center">{lang === 'bn' ? 'সংখ্যা' : 'Qty'}</th>
                <th className="px-8 py-4 text-right">{t.amount}</th>
                <th className="px-8 py-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-300 font-bold uppercase text-xs">No records.</td>
                </tr>
              ) : (
                [...sales].sort((a, b) => b.date.localeCompare(a.date)).map((sale) => {
                  const item = inventory.find(i => i.id === sale.stockItemId);
                  return (
                    <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 text-xs font-bold text-slate-500 whitespace-nowrap">{sale.date}</td>
                      <td className="px-8 py-5">
                         <p className="text-sm font-black text-slate-800">{item ? item.name : 'Direct Sale'}</p>
                      </td>
                      <td className="px-8 py-5 text-xs text-slate-500 text-center font-black">{sale.quantity || '-'}</td>
                      <td className="px-8 py-5 font-black text-slate-900 text-right">{currency}{sale.amount.toLocaleString()}</td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => onDeleteSale(sale.id)}
                          className="text-slate-300 hover:text-rose-500 p-2 rounded-xl transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesEntry;
