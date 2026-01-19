
import * as React from 'react';
import { BusinessData, Customer } from '../types.ts';
import { getTranslation } from '../translations.ts';

interface ReportsProps {
  data: BusinessData;
}

const Reports: React.FC<ReportsProps> = ({ data }) => {
  const { sales, expenses, config, inventory, customers, payments } = data;
  const lang = config?.language || 'en';
  const t = getTranslation(lang);
  const [selectedCustId, setSelectedCustId] = React.useState('');
  const [isDownloading, setIsDownloading] = React.useState(false);
  const reportRef = React.useRef<HTMLDivElement>(null);
  
  const currency = config?.currency || '৳';

  const customerStatement = React.useMemo(() => {
    if (!selectedCustId) return null;
    const customer = customers.find(c => c.id === selectedCustId);
    if (!customer) return null;

    const custSales = sales.filter(s => s.customerId === selectedCustId);
    const custPayments = payments.filter(p => p.customerId === selectedCustId);

    const ledger = [
      ...custSales.map(s => ({ date: s.date, type: 'Sale', ref: s.billNumber, debit: s.amount, credit: 0, desc: inventory.find(i => i.id === s.stockItemId)?.name || 'Sale' })),
      ...custPayments.map(p => ({ date: p.date, type: 'Payment', ref: 'PAY', debit: 0, credit: p.amount, desc: p.note || 'Paid' }))
    ].sort((a, b) => a.date.localeCompare(b.date));

    return { customer, ledger };
  }, [selectedCustId, sales, payments, inventory]);

  const handleDownloadPdf = async () => {
    const html2pdf = (window as any).html2pdf;
    if (!html2pdf || !reportRef.current) return;
    setIsDownloading(true);
    const element = reportRef.current;
    const options = { margin: 10, filename: `Ledger_${customerStatement?.customer.name}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { format: 'a4' } };
    await html2pdf().from(element).set(options).save();
    setIsDownloading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Customer Report Selector */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="w-full md:w-auto">
             <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">{t.customerReports}</h3>
             <p className="text-xs font-bold text-slate-400">Download detailed ledger and payment reports for each customer</p>
          </div>
          <div className="flex w-full md:w-auto gap-4">
             <select 
               value={selectedCustId} 
               onChange={(e) => setSelectedCustId(e.target.value)}
               className="flex-1 md:w-64 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm"
             >
               <option value="">{t.selectCustomer}</option>
               {customers.map(c => <option key={c.id} value={c.id}>{c.name} (Due: {currency}{c.currentBalance})</option>)}
             </select>
             {selectedCustId && (
               <button 
                onClick={handleDownloadPdf} 
                disabled={isDownloading}
                className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2"
               >
                 {isDownloading ? '...' : t.printReport}
               </button>
             )}
          </div>
        </div>
      </div>

      {/* Report View Area */}
      {customerStatement ? (
        <div ref={reportRef} className="bg-white p-12 rounded-[3rem] border border-slate-200 print:border-none shadow-sm">
           <div className="border-b-4 border-slate-900 pb-10 mb-10 flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-black uppercase text-slate-900 leading-none">{config?.companyName}</h1>
                <p className="text-blue-600 font-black uppercase tracking-[0.3em] mt-2 text-xs">{t.customerLedger}</p>
              </div>
              <div className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <p>{t.customerName}: {customerStatement.customer.name}</p>
                <p>Phone: {customerStatement.customer.phone}</p>
                <p>Date: {new Date().toLocaleDateString()}</p>
              </div>
           </div>

           <div className="mb-10 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Summary</p>
                <h2 className="text-3xl font-black text-slate-900">Closing Balance</h2>
              </div>
              <div className={`text-4xl font-black ${customerStatement.customer.currentBalance > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {currency}{customerStatement.customer.currentBalance.toLocaleString()}
              </div>
           </div>

           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="text-[10px] font-black text-slate-900 border-b-2 border-slate-900 uppercase">
                    <th className="py-4 px-2">Date</th>
                    <th className="py-4 px-2">Description</th>
                    <th className="py-4 px-2">Bill/Ref</th>
                    <th className="py-4 px-2 text-right">Debit (+)</th>
                    <th className="py-4 px-2 text-right">Credit (-)</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {customerStatement.ledger.map((row, idx) => (
                    <tr key={idx} className="text-sm font-bold">
                       <td className="py-4 px-2 text-xs text-slate-400">{row.date}</td>
                       <td className="py-4 px-2 text-slate-800">{row.desc}</td>
                       <td className="py-4 px-2 font-black text-blue-600 uppercase text-[10px]">{row.ref}</td>
                       <td className="py-4 px-2 text-right text-rose-500">{row.debit > 0 ? currency + row.debit.toLocaleString() : '-'}</td>
                       <td className="py-4 px-2 text-right text-emerald-600">{row.credit > 0 ? currency + row.credit.toLocaleString() : '-'}</td>
                    </tr>
                  ))}
               </tbody>
             </table>
           </div>

           <div className="mt-20 pt-10 border-t border-slate-100 text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] flex justify-between">
              <span>BizSmart Ledger System</span>
              <span>Proprietor Signature: ________________</span>
           </div>
        </div>
      ) : (
        <div className="h-64 bg-slate-100/50 rounded-[2.5rem] border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
           <p className="font-black text-xs uppercase tracking-widest">Select a customer above to generate statement</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
