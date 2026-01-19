
import * as React from 'react';
import { Customer, Payment } from '../types.ts';
import { getTranslation, Language } from '../translations.ts';

interface CustomerManagementProps {
  customers: Customer[];
  payments: Payment[];
  onAddCustomer: (customer: Customer) => void;
  onAddPayment: (payment: Payment) => void;
  currency: string;
  lang: Language;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({ customers, payments, onAddCustomer, onAddPayment, currency, lang }) => {
  const t = getTranslation(lang);
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [showPayModal, setShowPayModal] = React.useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = React.useState('');
  const [payAmount, setPayAmount] = React.useState('');

  const handleSubmitCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onAddCustomer({
      id: crypto.randomUUID(),
      name,
      phone,
      currentBalance: 0
    });
    setName('');
    setPhone('');
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !payAmount) return;
    onAddPayment({
      id: crypto.randomUUID(),
      customerId: selectedCustomerId,
      amount: parseFloat(payAmount),
      date: new Date().toISOString().split('T')[0]
    });
    setShowPayModal(false);
    setPayAmount('');
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Customer Form */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm h-fit">
          <h3 className="text-sm font-black uppercase tracking-widest text-blue-600 mb-6">{t.addCustomer}</h3>
          <form onSubmit={handleSubmitCustomer} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t.customerName}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase text-xs">
              {t.addCustomer}
            </button>
          </form>
        </div>

        {/* Customer List */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Current Customers</h3>
            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase">{customers.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-tighter">
                <tr>
                  <th className="px-8 py-4">Customer</th>
                  <th className="px-8 py-4 text-right">{t.currentBalance}</th>
                  <th className="px-8 py-4 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.length === 0 ? (
                  <tr><td colSpan={3} className="p-12 text-center text-slate-300 font-bold uppercase text-xs">No customers yet.</td></tr>
                ) : (
                  customers.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="px-8 py-5">
                        <p className="font-black text-slate-800 text-sm">{c.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{c.phone || 'No phone'}</p>
                      </td>
                      <td className={`px-8 py-5 text-right font-black ${c.currentBalance > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {currency}{c.currentBalance.toLocaleString()}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => { setSelectedCustomerId(c.id); setShowPayModal(true); }}
                          className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800"
                        >
                          {t.addPayment}
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

      {/* Payment Modal Overlay */}
      {showPayModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95">
             <h3 className="text-xl font-black mb-6 uppercase tracking-tight">{t.addPayment}</h3>
             <form onSubmit={handleRecordPayment} className="space-y-4">
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">{t.amount}</label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-black"
                    required
                  />
               </div>
               <div className="flex gap-3">
                 <button type="button" onClick={() => setShowPayModal(false)} className="flex-1 py-4 font-black text-slate-400 uppercase text-xs">Cancel</button>
                 <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl uppercase text-xs shadow-lg shadow-emerald-100">Record</button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
