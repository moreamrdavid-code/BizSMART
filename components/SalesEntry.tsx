
import * as React from 'react';
import { Sale, StockItem, Customer } from '../types.ts';
import { getTranslation, Language } from '../translations.ts';

interface SalesEntryProps {
  sales: Sale[];
  inventory: StockItem[];
  customers: Customer[];
  onAddSale: (sale: Sale) => void;
  onDeleteSale: (id: string) => void;
  currency: string;
  lang: Language;
}

const SalesEntry: React.FC<SalesEntryProps> = ({ sales, inventory, customers, onAddSale, onDeleteSale, currency, lang }) => {
  const t = getTranslation(lang);
  const [amount, setAmount] = React.useState('');
  const [billNumber, setBillNumber] = React.useState('');
  const [customerId, setCustomerId] = React.useState('');
  const [isCredit, setIsCredit] = React.useState(false);
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
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
      customerId: customerId || undefined,
      isCredit,
      date,
      stockItemId: stockItemId || undefined,
      quantity: stockItemId ? qtyNum : undefined
    };
    
    onAddSale(newSale);
    setAmount('');
    setBillNumber('');
    setCustomerId('');
    setIsCredit(false);
    setStockItemId('');
    setQuantity('1');
    setError(null);
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 md:gap-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm h-fit">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-6">{t.addSale}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t.itemName}</label>
            <select
              value={stockItemId}
              onChange={(e) => handleStockItemChange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
            >
              <option value="">Manual Entry</option>
              {inventory.map(item => (
                <option key={item.id} value={item.id} disabled={item.currentQuantity <= 0}>{item.name} ({item.currentQuantity})</option>
              ))}
            </select>
          </div>
          {stockItemId && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                    setQuantity(e.target.value);
                    if (selectedItem) setAmount((selectedItem.sellingPrice * parseInt(e.target.value || '0')).toString());
                }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t.customerName}</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
            >
              <option value="">Cash Sale (General)</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
             <input 
                type="checkbox" 
                checked={isCredit} 
                onChange={(e) => setIsCredit(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
                id="isCredit"
             />
             <label htmlFor="isCredit" className="text-[11px] font-black uppercase text-slate-600 cursor-pointer">Sale on Credit (Due)</label>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t.billNumber}</label>
               <input type="text" value={billNumber} onChange={(e) => setBillNumber(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs" />
             </div>
             <div>
               <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t.amount}</label>
               <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-black text-sm" required />
             </div>
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all uppercase text-xs">Record</button>
        </form>
      </div>

      <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Recent Sales History</h3>
          <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase">{sales.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-tighter">
              <tr>
                <th className="px-8 py-4">Date / Bill</th>
                <th className="px-8 py-4">Customer</th>
                <th className="px-8 py-4">Item (Qty)</th>
                <th className="px-8 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.slice(-10).reverse().map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50/50">
                  <td className="px-8 py-4">
                    <p className="text-xs font-bold text-slate-500">{sale.date}</p>
                    <p className="text-[10px] font-black text-blue-600">{sale.billNumber || 'No Bill'}</p>
                  </td>
                  <td className="px-8 py-4">
                    <p className="font-black text-slate-800 text-sm">{customers.find(c => c.id === sale.customerId)?.name || 'Walk-in'}</p>
                    {sale.isCredit && <span className="text-[9px] font-black uppercase text-rose-500">Credit Sale</span>}
                  </td>
                  <td className="px-8 py-4 text-xs font-bold text-slate-500">
                    {inventory.find(i => i.id === sale.stockItemId)?.name || 'Direct'} ({sale.quantity || 1})
                  </td>
                  <td className="px-8 py-4 text-right font-black text-slate-900">{currency}{sale.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesEntry;
