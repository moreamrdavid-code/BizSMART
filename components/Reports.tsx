
import * as React from 'react';
import { BusinessData } from '../types.ts';
import { getTranslation } from '../translations.ts';

interface ReportsProps {
  data: BusinessData;
}

const Reports: React.FC<ReportsProps> = ({ data }) => {
  const { sales, expenses, config, inventory } = data;
  const lang = config?.language || 'en';
  const t = getTranslation(lang);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const reportRef = React.useRef<HTMLDivElement>(null);
  
  const currency = config?.currency || '৳';

  const reportData = React.useMemo(() => {
    const totalSales = sales.reduce((acc, s) => acc + s.amount, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    
    let totalGrossProfit = 0;

    sales.forEach(sale => {
      if (sale.stockItemId) {
        const item = inventory.find(i => i.id === sale.stockItemId);
        if (item) {
          totalGrossProfit += (item.sellingPrice - item.purchasePrice) * (sale.quantity || 1);
        } else {
          totalGrossProfit += sale.amount;
        }
      } else {
        totalGrossProfit += sale.amount;
      }
    });

    const netProfit = totalGrossProfit - totalExpenses;

    const stockSummary = inventory.map(item => ({
      name: item.name,
      sold: item.initialQuantity - item.currentQuantity,
      left: item.currentQuantity,
      potentialRevenue: item.currentQuantity * item.sellingPrice
    }));

    return { totalSales, totalExpenses, netProfit, stockSummary };
  }, [sales, expenses, inventory]);

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    
    const html2pdf = (window as any).html2pdf;
    
    if (!html2pdf) {
      alert('PDF library not loaded yet. Please wait a moment and try again.');
      return;
    }

    setIsDownloading(true);
    
    const element = reportRef.current;
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `BizSmart_Report_${config?.companyName?.replace(/\s+/g, '_') || 'Business'}_${dateStr}.pdf`;
    
    const options = {
      margin: 10,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().from(element).set(options).save();
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{t.reports}</h3>
          <p className="text-slate-500 font-medium text-xs md:text-sm">{lang === 'bn' ? 'ব্যবসায়ের আর্থিক ও স্টক কার্যক্রমের সংক্ষিপ্ত বিবরণ।' : 'Financial and stock performance overview.'}</p>
        </div>
        <button 
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className={`flex items-center justify-center space-x-3 bg-slate-900 text-white px-6 md:px-8 py-3.5 md:py-4 rounded-2xl font-black transition-all shadow-xl shadow-slate-200 ${isDownloading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800'}`}
        >
          {isDownloading ? (
             <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-1"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          )}
          <span className="text-xs md:text-sm uppercase tracking-widest whitespace-nowrap">
            {isDownloading ? t.downloadingPdf : t.printReport}
          </span>
        </button>
      </div>

      {/* Report Container */}
      <div ref={reportRef} className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0">
        <div className="border-b-2 md:border-b-4 border-slate-900 pb-6 md:pb-10 mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-tight">{config?.companyName}</h1>
            <p className="text-blue-600 font-black uppercase tracking-[0.3em] mt-1 md:mt-2 text-[9px] md:text-xs">{lang === 'bn' ? 'ব্যবসায়িক কার্যক্রম রিপোর্ট' : 'OPERATIONAL PERFORMANCE REPORT'}</p>
          </div>
          <div className="text-left md:text-right text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
            <p>{lang === 'bn' ? 'তারিখ' : 'Generated'}: {new Date().toLocaleDateString()}</p>
            <p>{lang === 'bn' ? 'শিল্প' : 'Industry'}: {config?.industry}</p>
          </div>
        </div>

        {/* Summaries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-12 md:mb-16">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.financialHealth}</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 md:py-3 border-b border-slate-50">
                <span className="text-slate-500 font-bold text-xs md:text-sm">{lang === 'bn' ? 'মোট বিক্রয়' : 'Total Gross Sales'}</span>
                <span className="text-lg md:text-xl font-black text-slate-900">{currency}{reportData.totalSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 md:py-3 border-b border-slate-50">
                <span className="text-slate-500 font-bold text-xs md:text-sm">{lang === 'bn' ? 'মোট ব্যবসায়িক ব্যয়' : 'Operating Expenses'}</span>
                <span className="text-lg md:text-xl font-black text-rose-500">{currency}{reportData.totalExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-4 md:py-6 bg-slate-50 px-4 md:px-6 rounded-2xl md:rounded-3xl mt-2 shadow-sm border border-slate-100/50">
                <span className="text-slate-900 font-black text-sm md:text-lg uppercase tracking-widest">{t.netProfit}</span>
                <span className={`text-xl md:text-3xl font-black ${reportData.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {currency}{reportData.netProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.stockValuation}</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 md:py-3 border-b border-slate-50">
                <span className="text-slate-500 font-bold text-xs md:text-sm">{lang === 'bn' ? 'স্টকে থাকা আইটেম' : 'Items in Stock'}</span>
                <span className="text-lg md:text-xl font-black text-slate-900">{inventory.reduce((acc, i) => acc + i.currentQuantity, 0)} {lang === 'bn' ? 'ইউনিট' : 'units'}</span>
              </div>
              <div className="flex justify-between items-center py-2 md:py-3 border-b border-slate-50">
                <span className="text-slate-500 font-bold text-xs md:text-sm">{lang === 'bn' ? 'স্টকের মোট মূল্য' : 'Stock Value'}</span>
                <span className="text-lg md:text-xl font-black text-indigo-600">
                  {currency}{inventory.reduce((acc, i) => acc + (i.currentQuantity * i.sellingPrice), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Performance Table */}
        <div className="mb-8">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">{t.stockPerformance}</h4>
          <div className="overflow-x-auto -mx-6 md:mx-0 px-6 md:px-0 scrollbar-hide">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="text-[10px] font-black text-slate-900 border-b-2 border-slate-900 uppercase">
                  <th className="py-4">{t.itemName}</th>
                  <th className="py-4 text-center">{t.sold}</th>
                  <th className="py-4 text-center">{t.inStock}</th>
                  <th className="py-4 text-right">{t.potentialRev}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-xs md:text-sm">
                {reportData.stockSummary.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-300 font-bold uppercase text-[10px]">No stock data available.</td>
                  </tr>
                ) : (
                  reportData.stockSummary.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-4 md:py-5 font-black text-slate-800">{item.name}</td>
                      <td className="py-4 md:py-5 text-center text-slate-400">{item.sold}</td>
                      <td className="py-4 md:py-5 text-center text-slate-800">{item.left}</td>
                      <td className="py-4 md:py-5 text-right text-slate-900">{currency}{item.potentialRevenue.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Mobile Scroll Hint */}
          <div className="md:hidden mt-3 flex items-center justify-center space-x-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">
             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
             <span>Swipe to see more columns</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 md:mt-24 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-[8px] md:text-[9px] text-slate-300 uppercase font-black tracking-[0.4em]">
          <span>© {new Date().getFullYear()} {config?.companyName}</span>
          <span>BIZSMART PRO • SYSTEM REPORT</span>
        </div>
      </div>
    </div>
  );
};

export default Reports;
