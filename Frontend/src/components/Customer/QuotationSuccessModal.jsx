import React from 'react';
import { CheckCircle2, Printer, X, FileSpreadsheet, FileText } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { exportQuotationToExcel, exportQuotationToPDF } from '../../utils/exportUtils';

export default function QuotationSuccessModal({ quotationData, onClose }) {
  if (!quotationData) return null;

  const { customer, items, totals, quotationId, createdAt } = quotationData;
  const formattedDate = new Date(createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    exportQuotationToExcel(quotationData);
  };

  const handleDownloadPDF = () => {
    exportQuotationToPDF(quotationData, true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#eae7de] p-6 sm:p-8 animate-scale-up my-auto" 
        role="dialog" 
        aria-modal="true"
      >
        {/* Banner */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-2xl font-extrabold text-[#1a1c22]">Quotation Generated Successfully</h2>
          <p className="text-sm text-[#575e6d] mt-1">
            Thank you, <b className="text-[#1a1c22]">{customer.name}</b>. Your official quotation has been generated.
          </p>
        </div>

        {/* Printable Official Receipt */}
        <div className="bg-[#faf9f6] border border-[#d8d4c7] rounded-xl p-5 mb-6 printable-area" id="printable-quotation-receipt">
          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#eae7de]">
            <div>
              <div className="font-mono text-sm font-extrabold text-[#946c1a] bg-[#fbf5e6] px-2.5 py-1 rounded-md inline-block">
                {quotationId}
              </div>
              <div className="text-xs text-[#8c93a3] mt-1">{formattedDate}</div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                Official Quotation
              </span>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-3.5 mb-3.5 border-b border-[#eae7de] text-xs">
            <div>
              <span className="text-[#8c93a3] block">Customer Name</span>
              <span className="font-bold text-[#1a1c22]">{customer.name}</span>
            </div>
            <div>
              <span className="text-[#8c93a3] block">Mobile Number</span>
              <span className="font-bold text-[#1a1c22]">{customer.mobile}</span>
            </div>
            <div>
              <span className="text-[#8c93a3] block">Email Address</span>
              <span className="font-bold text-[#1a1c22] truncate block">{customer.email}</span>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-xs mb-3.5 border-collapse">
            <thead>
              <tr className="border-b border-[#eae7de] text-[#8c93a3] uppercase font-bold text-[10px]">
                <th className="text-left py-1.5">Product Name</th>
                <th className="text-center py-1.5">Qty</th>
                <th className="text-right py-1.5">Unit Price</th>
                <th className="text-right py-1.5">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {items.map((item) => (
                <tr key={item.id} className="py-2">
                  <td className="py-2 font-bold text-[#1a1c22]">{item.name}</td>
                  <td className="py-2 text-center text-[#575e6d]">{item.quantity}</td>
                  <td className="py-2 text-right font-mono text-[#575e6d]">{formatCurrency(item.price)}</td>
                  <td className="py-2 text-right font-mono font-bold text-[#1a1c22]">{formatCurrency(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Summary */}
          <div className="pt-2 border-t border-[#d8d4c7] space-y-1.5 text-xs text-[#575e6d]">
            <div className="flex justify-between">
              <span>Subtotal ({totals.itemCount} items)</span>
              <span className="font-mono font-bold text-[#1a1c22]">{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span className="font-mono font-bold text-[#1a1c22]">{formatCurrency(totals.gstAmount)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-[#1a1c22] pt-2 border-t border-[#d8d4c7]">
              <span>Total Quotation Amount</span>
              <span className="font-mono text-[#946c1a] text-base">{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Excel, PDF, Print, Done */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
          <button 
            type="button" 
            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            onClick={handleDownloadExcel}
            id="success-excel-btn"
            title="Download Excel spreadsheet"
          >
            <FileSpreadsheet size={16} />
            <span>Excel (.xlsx)</span>
          </button>

          <button 
            type="button" 
            className="flex-1 py-2.5 px-3 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            onClick={handleDownloadPDF}
            id="success-pdf-btn"
            title="Open and download PDF"
          >
            <FileText size={16} />
            <span>PDF (.pdf)</span>
          </button>

          <button 
            type="button" 
            className="py-2.5 px-4 rounded-xl bg-white hover:bg-[#f6f5ef] border border-[#d8d4c7] text-[#1a1c22] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            onClick={handlePrint}
            id="print-quotation-btn"
          >
            <Printer size={16} />
            <span>Print</span>
          </button>
          
          <button 
            type="button" 
            className="flex-1 py-2.5 px-4 rounded-xl bg-gold-btn text-white font-bold text-xs sm:text-sm flex items-center justify-center shadow-[0_4px_14px_rgba(197,155,39,0.25)] transition-all cursor-pointer"
            onClick={onClose}
            id="done-quotation-btn"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
