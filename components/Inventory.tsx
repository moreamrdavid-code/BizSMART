
import * as React from 'react';
import { StockItem } from '../types.ts';
import { getTranslation, Language } from '../translations.ts';

interface InventoryProps {
  inventory: StockItem[];
  onAddStockItem: (item: StockItem) => void;
  onDeleteStockItem: (id: string) => void;
  currency: string;
  lang: Language;
}

const Inventory: React.FC<InventoryProps> = ({ inventory, onAddStockItem, onDeleteStockItem, currency, lang }) => {
  const t = getTranslation(lang);
  const [name, setName] = React.useState('');
  const [sku, setSku] = React.useState('');
  const [initialQuantity, setInitialQuantity] = React.useState('');
  const [purchasePrice, setPurchasePrice] = React.useState('');
  const [profitPercentage, setProfitPercentage] = React.useState('');
  const [sellingPrice, setSellingPrice] = React.useState('');

  const autoCalculateSellingPrice = (cost: string, percent: string) => {
    const c = parseFloat(cost);
    const p = parseFloat(percent);
    if (!isNaN(c) && !isNaN(p)) {
      const calculated = c + (c * (p / 100));
      setSellingPrice(calculated.toFixed(2));
    }
  };

  const handlePurchasePriceChange = (val: string) => {
    setPurchasePrice(val);
    autoCalculateSellingPrice(val, profitPercentage);
  };

  const handleProfitPercentChange = (val: string) => {
    setProfitPercentage(val);
    autoCalculateSellingPrice(purchasePrice, val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(initialQuantity);
    if (!name || isNaN(qty)) return;

    const newItem: StockItem = {
      id: crypto.randomUUID(),
      name,
      sku,
      initialQuantity: qty,
      currentQuantity: qty,
      purchasePrice: parseFloat(purchasePrice) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0
    };
    onAddStockItem(newItem);
    setName('');
    setSku('');
    setInitialQuantity('');
    setPurchasePrice('');
    setProfitPercentage('');
    setSellingPrice('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm h-fit">
        <h3 className="text-sm font-black uppercase tracking-widest text-indigo-600 mb-6">{t.addInventory}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t.itemName}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
              placeholder={lang === 'bn' ? 'আইটেমের নাম' : 'Widget A'}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t.sku}</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                placeholder="SKU-101"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t.initialQty}</label>
              <input
                type="number"
                value={initialQuantity}
                onChange={(e) => setInitialQuantity(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                placeholder="100"
                required
              />
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100 mt-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t.cost} ({currency})</label>
            <input
              type="number"
              step="0.01"
              value={purchasePrice}
              onChange={(e) => handlePurchasePriceChange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {lang === 'bn' ? 'লাভের শতাংশ (%)' : 'Profit Percentage (%)'}
            </label>
            <input
              type="number"
              step="0.1"
              value={profitPercentage}
              onChange={(e) => handleProfitPercentChange(e.target.value)}
              className="w-full px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-600"
              placeholder="20"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t.price} ({currency})</label>
            <input
              type="number"
              step="0.01"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              className="w-full px-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-black text-white text-lg"
              placeholder="0.00"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-100"
          >
            {t.addInventory}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">{lang === 'bn' ? 'বর্তমান স্টক লেভেল' : 'Current Stock Levels'}</h3>
          <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase">{inventory.length} {lang === 'bn' ? 'আইটেম' : 'items'}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-tighter">
              <tr>
                <th className="px-8 py-4">{t.itemName}</th>
                <th className="px-8 py-4 text-center">{t.inStock}</th>
                <th className="px-8 py-4 text-center">{t.sold}</th>
                <th className="px-8 py-4">{t.price}</th>
                <th className="px-8 py-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-300 font-bold uppercase text-xs">Stock is empty.</td>
                </tr>
              ) : (
                inventory.map((item) => {
                  const sold = item.initialQuantity - item.currentQuantity;
                  const stockRatio = (item.currentQuantity / item.initialQuantity) * 100;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <p className="font-black text-slate-800 text-sm">{item.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.sku || 'No SKU'}</p>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`text-xs font-black ${item.currentQuantity < 5 ? 'text-rose-500 animate-pulse' : 'text-slate-700'}`}>
                            {item.currentQuantity}
                          </span>
                          <div className="w-12 bg-slate-100 h-1 rounded-full mt-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${stockRatio < 20 ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                              style={{ width: `${Math.min(100, stockRatio)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center text-xs font-black text-slate-400">
                        {sold}
                      </td>
                      <td className="px-8 py-5 text-xs font-black text-slate-900">
                        {currency}{item.sellingPrice.toLocaleString()}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => onDeleteStockItem(item.id)}
                          className="text-slate-200 hover:text-rose-500 p-2 rounded-xl transition-colors"
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

export default Inventory;
