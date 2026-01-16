
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
  const [billNumber, setBillNumber] = React.useState('');
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
      billNumber,
      date,
      note,
      stockItemId: stockItemId || undefined,
      quantity: stockItemId ? qtyNum : undefined
    };
    
    onAddSale(newSale);
    setAmount('');
    setBillNumber('');
    setNote('');
    setStockItemId('');
    setQuantity('1');
    setError(null);
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 md:gap-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Input Form */}
      <div className="lg:col-span-1 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm h-fit">
        <div className="flex items-center space-x-3 mb-6">
           <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/></svg>
           </div>
           <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">{t.addSale}</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">{lang === 'bn' ? 'আইটেম নির্বাচন করুন' : 'Select Item'}</label>
            <select
              value={stockItemId}
              onChange={(e) => handleStockItemChange(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm transition-all"
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
            <div className="animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'bn' ? 'পরিমাণ' : 'Quantity'}</label>
                <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded">MAX: {selectedItem?.currentQuantity}</span>
              </div>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className={`w-full px-4 py-3.5 bg-slate-50 border rounded-xl focus:ring-2 outline-none font-bold text-sm ${error ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-blue-500'}`}
                required
              />
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[10px] font-bold text-rose-600 uppercase flex items-center space-x-2 animate-in pulse duration-500">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
               <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t.billNumber}</label>
            <input
              type="text"
              value={billNumber}
              onChange={(e) => setBillNumber(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
              placeholder="#BILL-1234"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t.amount} ({currency})</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-2xl font-black text-slate-800"
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
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={!!error}
            className={`w-full text-white font-black py-4 rounded-2xl transition-all shadow-xl ${error ? 'bg-slate-200 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200 active:scale-[0.98]'}`}
          >
            {lang === 'bn' ? 'বিক্রয় রেকর্ড করুন' : 'Record Sale'}
          </button>
        </form>
      </div>

      {/* History Table */}
      <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-slate-800">{lang === 'bn' ? 'সাম্প্রতিক বিক্রয় লগ' : 'Recent Sales Log'}</h3>
          <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase">{sales.length}</span>
        </div>
        <div className="overflow-x-auto flex-1 scrollbar-hide">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-tighter">
              <tr>
                <th className="px-6 md:px-8 py-4">{t.date}</th>
                <th className="px-6 md:px-8 py-4">{t.billNumber}</th>
                <th className="px-6 md:px-8 py-4">{lang === 'bn' ? 'পণ্য' : 'Product'}</th>
                <th className="px-4 py-4 text-center">{lang === 'bn' ? 'সংখ্যা' : 'Qty'}</th>
                <th className="px-6 md:px-8 py-4 text-right">{t.amount}</th>
                <th className="px-6 md:px-8 py-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-slate-300 font-bold uppercase text-[10px]">No records found.</td>
                </tr>
              ) : (
                [...sales].sort((a, b) => b.date.localeCompare(a.date)).map((sale) => {
                  const item = inventory.find(i => i.id === sale.stockItemId);
                  return (
                    <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 md:px-8 py-5 text-[10px] font-bold text-slate-400 whitespace-nowrap">{sale.date}</td>
                      <td className="px-6 md:px-8 py-5">
                        <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                          {sale.billNumber || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 md:px-8 py-5">
                         <p className="text-sm font-black text-slate-800 leading-none mb-1">{item ? item.name : 'Direct Sale'}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Transaction ID: {sale.id.slice(0, 8)}</p>
                      </td>
                      <td className="px-4 py-5 text-xs text-slate-500 text-center font-black">{sale.quantity || '-'}</td>
                      <td className="px-6 md:px-8 py-5 font-black text-slate-900 text-right text-sm">{currency}{sale.amount.toLocaleString()}</td>
                      <td className="px-6 md:px-8 py-5 text-right">
                        <button 
                          onClick={() => onDeleteSale(sale.id)}
                          className="text-slate-200 hover:text-rose-500 p-2 rounded-xl transition-colors active:scale-90"
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
        {/* Mobile Swipe Hint */}
        <div className="md:hidden p-3 bg-slate-50/50 text-center text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">
           Swipe table for more details
        </div>
      </div>
    </div>
  );
};

export default SalesEntry;
