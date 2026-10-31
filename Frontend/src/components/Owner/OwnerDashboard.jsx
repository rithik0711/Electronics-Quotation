import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  ArrowLeft, 
  LogOut, 
  Search, 
  X, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  ChevronDown, 
  CheckCircle2,
  ShoppingBag,
  Download,
  RotateCcw,
  Check,
  PlusCircle,
  Package
} from 'lucide-react';
import AddProductModal from './AddProductModal';
import { formatCurrency } from '../../utils/formatters';
import { 
  exportQuotationToExcel, 
  getQuotationExcelData,
  exportAllQuotationsToExcel,
  getQuotationPdfBlobUrl,
  downloadQuotationPDF
} from '../../utils/exportUtils';

export default function OwnerDashboard({ 
  quotations = [], 
  products = [],
  onAddProduct,
  onBackToStore, 
  onLogout,
  showToast,
  onTogglePurchased
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('submitted'); // 'submitted' | 'purchased'
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Modals state for "View First then Download"
  const [selectedPreviewQuote, setSelectedPreviewQuote] = useState(null);
  const [selectedExcelQuote, setSelectedExcelQuote] = useState(null);
  const [selectedPdfQuote, setSelectedPdfQuote] = useState(null);

  // Split quotations into submitted and purchased
  const submittedQuotations = useMemo(() => {
    return quotations.filter(q => !q.isPurchased);
  }, [quotations]);

  const purchasedQuotations = useMemo(() => {
    return quotations.filter(q => Boolean(q.isPurchased));
  }, [quotations]);

  // Aggregate stats
  const totalValue = useMemo(() => {
    return quotations.reduce((acc, q) => acc + (q.totals?.total || 0), 0);
  }, [quotations]);

  const purchasedTotalValue = useMemo(() => {
    return purchasedQuotations.reduce((acc, q) => acc + (q.totals?.total || 0), 0);
  }, [purchasedQuotations]);

  // Active list based on view mode
  const activeList = viewMode === 'purchased' ? purchasedQuotations : submittedQuotations;

  // Filter active quotations by search
  const filteredQuotations = useMemo(() => {
    if (!searchQuery.trim()) return activeList;
    const q = searchQuery.toLowerCase().trim();
    return activeList.filter(item => {
      const matchId = item.quotationId?.toLowerCase().includes(q);
      const matchName = item.customer?.name?.toLowerCase().includes(q);
      const matchPhone = item.customer?.mobile?.toLowerCase().includes(q);
      const matchEmail = item.customer?.email?.toLowerCase().includes(q);
      const matchItem = item.items?.some(i => i.name?.toLowerCase().includes(q));
      return matchId || matchName || matchPhone || matchEmail || matchItem;
    });
  }, [activeList, searchQuery]);

  // Excel preview data
  const excelPreviewData = useMemo(() => {
    if (!selectedExcelQuote) return null;
    try {
      return getQuotationExcelData(selectedExcelQuote);
    } catch (err) {
      console.error('Failed to get Excel data', err);
      return null;
    }
  }, [selectedExcelQuote]);

  // PDF preview blob URL
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

  useEffect(() => {
    if (!selectedPdfQuote) {
      setPdfBlobUrl(null);
      return;
    }
    try {
      const url = getQuotationPdfBlobUrl(selectedPdfQuote);
      setPdfBlobUrl(url);
      return () => {
        if (url) URL.revokeObjectURL(url);
      };
    } catch (err) {
      console.error('Failed to generate PDF blob URL', err);
      setPdfBlobUrl(null);
    }
  }, [selectedPdfQuote]);

  // Actions
  const handleOpenExcelPreview = (quotation, e) => {
    e?.stopPropagation();
    setSelectedExcelQuote(quotation);
  };

  const handleOpenPdfPreview = (quotation, e) => {
    e?.stopPropagation();
    setSelectedPdfQuote(quotation);
  };

  const handleDownloadExcel = (quotation) => {
    try {
      exportQuotationToExcel(quotation);
      if (showToast) {
        showToast(`Excel spreadsheet downloaded for ${quotation.quotationId}`);
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Failed to generate Excel file.');
    }
  };

  const handleDownloadPdf = (quotation) => {
    try {
      downloadQuotationPDF(quotation);
      if (showToast) {
        showToast(`PDF quotation downloaded for ${quotation.quotationId}`);
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Failed to generate PDF document.');
    }
  };

  const handleMarkPurchased = (quotation, e) => {
    e?.stopPropagation();
    if (onTogglePurchased) {
      onTogglePurchased(quotation.quotationId);
      if (showToast) {
        showToast(`Quotation ${quotation.quotationId} marked as purchased & moved to Purchased Details!`);
      }
    }
  };

  const handleRevertPurchased = (quotation, e) => {
    e?.stopPropagation();
    if (onTogglePurchased) {
      onTogglePurchased(quotation.quotationId);
      if (showToast) {
        showToast(`Quotation ${quotation.quotationId} moved back to Submitted Quotations.`);
      }
    }
  };

  const handleExportAll = () => {
    try {
      exportAllQuotationsToExcel(quotations);
      if (showToast) {
        showToast('All quotations exported to master Excel ledger!');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Failed to export all quotations.');
    }
  };

  const handleOpenDetails = (quote, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setSelectedPreviewQuote(quote);
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] flex flex-col font-sans text-[#1a1c22]">
      {/* Top Banner / Navigation for Owner */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#eae7de] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-4">
            <button
              id="back-to-store-btn"
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#d8d4c7] hover:border-[#1a1c22] rounded-full text-xs sm:text-sm font-bold text-[#1a1c22] transition-all cursor-pointer shadow-xs hover:-translate-x-0.5"
              onClick={onBackToStore}
              title="Return to Electrical Products Store"
            >
              <ArrowLeft size={16} />
              <span>Back to Store</span>
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-[#1a1c22] leading-none">Owner Quotation Portal</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 size={13} />
                  <span>Logged in as <b>rithik0711</b></span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full" title="Total no. of products in catalog">
                  <Package size={12} />
                  <span><b>{products.length}</b> Products</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Add Product Button */}
            <button
              id="owner-add-product-btn"
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gradient text-white font-bold text-xs sm:text-sm rounded-full shadow-[0_4px_14px_rgba(197,155,39,0.28)] hover:shadow-[0_6px_18px_rgba(197,155,39,0.38)] transition-all cursor-pointer"
              onClick={() => setIsAddProductOpen(true)}
              title={`Add New Product (${products.length} Products currently in catalog)`}
            >
              <PlusCircle size={16} />
              <span>Add Product</span>
              <span className="bg-white/30 text-white font-extrabold text-[11px] px-2 py-0.5 rounded-full ml-0.5">
                {products.length}
              </span>
            </button>

            <button
              id="export-all-excel-btn"
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 font-bold text-xs sm:text-sm rounded-full transition-all cursor-pointer shadow-xs"
              onClick={handleExportAll}
              title="Download master Excel spreadsheet with all quotations"
            >
              <FileSpreadsheet size={16} />
              <span className="hidden sm:inline">Export All (Excel)</span>
            </button>

            <button
              id="owner-logout-btn"
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-red-600 hover:bg-red-50 border border-red-200 font-bold text-xs sm:text-sm rounded-full transition-all cursor-pointer shadow-xs"
              onClick={onLogout}
              title="Logout from Owner Account"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Metric Cards: Total Quotations, Total Purchased, Total Pipeline Value, and Total Products */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Card 1: Total Quotations */}
          <div 
            className={`bg-white rounded-2xl p-5 border shadow-xs cursor-pointer hover:shadow-md transition-all flex flex-col justify-between ${
              viewMode === 'submitted' 
                ? 'border-[#b38728] ring-2 ring-[#c59b27]/25' 
                : 'border-[#eae7de] hover:border-[#eeddb0]'
            }`}
            onClick={() => setViewMode('submitted')}
            title="Click to view submitted customer inquiries"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[#575e6d] mb-1">Total Quotations</span>
            <div className="text-3xl font-extrabold text-[#1a1c22] my-1">{quotations.length}</div>
            <span className="text-xs text-[#8c93a3] font-medium">
              {submittedQuotations.length} active customer inquiries
            </span>
          </div>

          {/* Card 2: Total Purchased */}
          <div 
            className={`bg-gradient-to-b from-white to-emerald-50/40 rounded-2xl p-5 border shadow-xs cursor-pointer hover:shadow-md transition-all flex flex-col justify-between ${
              viewMode === 'purchased' 
                ? 'border-emerald-600 ring-2 ring-emerald-500/25' 
                : 'border-emerald-200'
            }`}
            onClick={() => setViewMode('purchased')}
            title="Click to view all purchased quotations"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">Total Purchased</span>
            <div className="text-3xl font-extrabold text-emerald-600 my-1">{purchasedQuotations.length}</div>
            <span className="text-xs text-emerald-700/80 font-medium">
              {purchasedQuotations.length > 0 
                ? `${formatCurrency(purchasedTotalValue)} converted` 
                : '0 converted orders'}
            </span>
          </div>

          {/* Card 3: Total Pipeline Value */}
          <div className="bg-gradient-to-b from-white to-[#fdfbf7] rounded-2xl p-5 border border-[#eeddb0] shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#946c1a] mb-1">Total Pipeline Value</span>
            <div className="text-3xl font-extrabold text-[#946c1a] font-mono my-1">{formatCurrency(totalValue)}</div>
            <span className="text-xs text-[#8c93a3] font-medium">Inclusive of 18% GST</span>
          </div>

          {/* Card 4: Total Products */}
          <div 
            className="bg-gradient-to-b from-white to-sky-50/40 rounded-2xl p-5 border border-sky-200 shadow-xs cursor-pointer hover:shadow-md transition-all flex flex-col justify-between"
            onClick={() => setIsAddProductOpen(true)}
            title="Total no. of products in catalog. Click to add a new product."
          >
            <span className="text-xs font-bold uppercase tracking-wider text-sky-800 mb-1">Total Products</span>
            <div className="text-3xl font-extrabold text-sky-600 my-1">{products.length}</div>
            <span className="text-xs text-sky-700/80 font-medium">Catalog electrical items</span>
          </div>
        </section>

        {/* Search & Header Section */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap lg:flex-nowrap">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1a1c22]">
              {viewMode === 'purchased' ? 'Purchased Customer Quotations' : 'Submitted Customer Quotations'}
            </h2>
            <p className="text-xs sm:text-sm text-[#575e6d] mt-0.5">
              {viewMode === 'purchased' 
                ? 'All customer quotations marked as purchased. Inspect line items and preview/download Excel or PDF.'
                : 'View customer details, inspect line items, and preview/download quotations in Excel (.xlsx) or PDF (.pdf) formats.'}
            </p>
          </div>

          {/* Header Controls: Search Bar and Purchased Quotation Button side-by-side */}
          <div className="flex items-center gap-3 flex-shrink-0 w-full lg:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 lg:w-80 flex-shrink-0">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c93a3] pointer-events-none" />
              <input
                id="owner-quotation-search"
                type="text"
                placeholder={viewMode === 'purchased' ? "Search purchased quotations..." : "Search by ID, name, mobile, email..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 bg-white border border-[#d8d4c7] focus:border-[#b38728] focus:ring-2 focus:ring-[#c59b27]/20 rounded-full text-sm text-[#1a1c22] placeholder-[#8c93a3] outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c93a3] hover:text-[#1a1c22] p-1 cursor-pointer"
                  onClick={() => setSearchQuery('')}
                  title="Clear filter"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Button as Purchased Quotation at right side of search */}
            <button
              id="btn-purchased-quotation-toggle"
              type="button"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs sm:text-sm transition-all flex-shrink-0 shadow-xs cursor-pointer ${
                viewMode === 'purchased' 
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border border-emerald-700 shadow-[0_4px_14px_rgba(5,150,105,0.25)]' 
                  : 'bg-white border border-[#d8d4c7] hover:border-[#b38728] text-[#1a1c22] hover:bg-[#fbf5e6]'
              }`}
              onClick={() => setViewMode(prev => prev === 'purchased' ? 'submitted' : 'purchased')}
              title={viewMode === 'purchased' ? "Switch to Submitted Quotations" : "View All Purchased Quotations"}
            >
              <ShoppingBag size={15} />
              <span>{viewMode === 'purchased' ? 'Submitted Quotations' : 'Purchased Quotation'}</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                viewMode === 'purchased' ? 'bg-white/25 text-white' : 'bg-[#f6f5ef] text-[#1a1c22]'
              }`}>
                {viewMode === 'purchased' ? submittedQuotations.length : purchasedQuotations.length}
              </span>
            </button>
          </div>
        </div>

        {/* Quotations List */}
        {filteredQuotations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-[#d8d4c7] p-12 text-center my-6">
            {viewMode === 'purchased' ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                  <ShoppingBag size={36} />
                </div>
                <h3 className="text-lg font-bold text-[#1a1c22] mb-1">No Purchased Quotations Found</h3>
                <p className="text-sm text-[#575e6d] max-w-md mx-auto mb-5">
                  {searchQuery 
                    ? `No purchased records match "${searchQuery}". Try a different keyword.`
                    : 'No quotations have been moved to purchased yet. Click the "Purchased" button on any quotation to track it here.'}
                </p>
                {searchQuery ? (
                  <button
                    type="button"
                    className="px-4 py-2 rounded-full border border-[#d8d4c7] bg-white hover:bg-[#f6f5ef] text-sm font-bold text-[#1a1c22] transition-all cursor-pointer shadow-xs"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </button>
                ) : (
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-all cursor-pointer"
                    onClick={() => setViewMode('submitted')}
                  >
                    View Submitted Quotations
                  </button>
                )}
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-[#fbf5e6] text-[#b38728] flex items-center justify-center mx-auto mb-4 border border-[#eeddb0]">
                  <FileSpreadsheet size={36} />
                </div>
                <h3 className="text-lg font-bold text-[#1a1c22] mb-1">No Submitted Quotations Found</h3>
                <p className="text-sm text-[#575e6d] max-w-md mx-auto mb-5">
                  {searchQuery 
                    ? `No quotation records match "${searchQuery}". Try a different keyword.`
                    : 'All customer quotations have been marked as purchased or none submitted yet.'}
                </p>
                {searchQuery ? (
                  <button
                    type="button"
                    className="px-4 py-2 rounded-full border border-[#d8d4c7] bg-white hover:bg-[#f6f5ef] text-sm font-bold text-[#1a1c22] transition-all cursor-pointer shadow-xs"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </button>
                ) : (
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-all cursor-pointer"
                    onClick={() => setViewMode('purchased')}
                  >
                    View Purchased Quotations ({purchasedQuotations.length})
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuotations.map((quote) => {
              const formattedDate = new Date(quote.createdAt || Date.now()).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div 
                  key={quote.quotationId} 
                  className={`bg-white rounded-2xl border border-[#eae7de] hover:border-[#eeddb0] shadow-xs hover:shadow-md transition-all p-5 ${
                    quote.isPurchased ? 'border-l-4 border-l-emerald-500' : ''
                  }`}
                  id={`quote-card-${quote.quotationId}`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-4 items-center">
                    {/* ID & Date */}
                    <div className="lg:col-span-3">
                      <span className="font-mono text-xs font-black text-[#946c1a] bg-[#fbf5e6] px-2.5 py-1 rounded-md inline-block">
                        {quote.quotationId}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-[#8c93a3] mt-1.5 font-medium block">
                        <Calendar size={13} />
                        {formattedDate}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="lg:col-span-4">
                      <div className="flex items-center gap-1.5 font-bold text-sm text-[#1a1c22]">
                        <User size={15} className="text-[#b38728] flex-shrink-0" />
                        <span className="truncate">{quote.customer?.name || 'Customer'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#575e6d] mt-1 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <Phone size={12} className="text-[#8c93a3]" /> {quote.customer?.mobile}
                        </span>
                        <span className="inline-flex items-center gap-1 truncate">
                          <Mail size={12} className="text-[#8c93a3]" /> {quote.customer?.email}
                        </span>
                      </div>
                    </div>

                    {/* Price & Summary */}
                    <div className="lg:col-span-2">
                      <div className="font-mono text-lg font-extrabold text-[#946c1a]">
                        {formatCurrency(quote.totals?.total || 0)}
                      </div>
                      <div className="text-xs text-[#575e6d]">
                        {quote.totals?.itemCount || quote.items?.length} items • GST incl.
                      </div>
                    </div>

                    {/* Actions Col */}
                    <div className="lg:col-span-3 flex items-center justify-end gap-2 flex-wrap">
                      {/* Excel Button */}
                      <button
                        id={`btn-excel-${quote.quotationId}`}
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                        onClick={(e) => handleOpenExcelPreview(quote, e)}
                        title="View Excel spreadsheet before downloading"
                      >
                        <FileSpreadsheet size={15} />
                        <span>Excel</span>
                      </button>

                      {/* PDF Button */}
                      <button
                        id={`btn-pdf-${quote.quotationId}`}
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                        onClick={(e) => handleOpenPdfPreview(quote, e)}
                        title="View PDF document before downloading"
                      >
                        <FileText size={15} />
                        <span>PDF</span>
                      </button>

                      {/* Purchased Button */}
                      {!quote.isPurchased ? (
                        <button
                          id={`btn-purchased-${quote.quotationId}`}
                          type="button"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                          onClick={(e) => handleMarkPurchased(quote, e)}
                          title="Mark as purchased and move to Purchased Quotations"
                        >
                          <ShoppingBag size={14} />
                          <span>Purchased</span>
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
                            <Check size={13} strokeWidth={2.5} />
                            <span>Purchased</span>
                          </span>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white hover:bg-red-50 text-[#8c93a3] hover:text-red-600 border border-[#d8d4c7] hover:border-red-200 text-[11px] font-bold transition-all cursor-pointer"
                            onClick={(e) => handleRevertPurchased(quote, e)}
                            title="Move back to Submitted Quotations"
                          >
                            <RotateCcw size={11} />
                            <span>Undo</span>
                          </button>
                        </div>
                      )}

                      {/* Expand Chevron Button */}
                      <button
                        id={`btn-view-${quote.quotationId}`}
                        type="button"
                        className="w-8 h-8 rounded-lg bg-[#f6f5ef] hover:bg-[#eae7de] border border-[#d8d4c7] text-[#575e6d] hover:text-[#1a1c22] flex items-center justify-center transition-all cursor-pointer"
                        onClick={(e) => handleOpenDetails(quote, e)}
                        title="View Quotation Details"
                        aria-label="View Quotation Details"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ========================================================
          EXCEL SPREADSHEET PREVIEW MODAL ("VIEW FIRST THEN DOWNLOAD")
          ======================================================== */}
      {selectedExcelQuote && excelPreviewData && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in" onClick={() => setSelectedExcelQuote(null)}>
          <div 
            className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-emerald-300 overflow-hidden flex flex-col animate-scale-up my-auto max-h-[90vh]" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#eae7de] flex items-center justify-between bg-emerald-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-[#1a1c22]">Excel Quotation Preview</h2>
                  <p className="text-xs text-[#575e6d]">Quotation: <b className="text-[#1a1c22]">{selectedExcelQuote.quotationId}</b> • {selectedExcelQuote.customer?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-xs transition-all cursor-pointer"
                  onClick={() => handleDownloadExcel(selectedExcelQuote)}
                  title="Download Excel Spreadsheet (.xlsx)"
                >
                  <Download size={14} />
                  <span>Download Excel (.xlsx)</span>
                </button>
                <button 
                  type="button" 
                  className="w-8 h-8 rounded-lg border border-[#d8d4c7] hover:bg-white text-[#575e6d] hover:text-[#1a1c22] flex items-center justify-center cursor-pointer" 
                  onClick={() => setSelectedExcelQuote(null)}
                  aria-label="Close Preview"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Ribbon */}
            <div className="px-6 py-2 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between text-xs text-[#64748b]">
              <span className="font-bold text-emerald-800 flex items-center gap-1">
                <FileSpreadsheet size={13} /> Sheet: Quotation
              </span>
              <span>{excelPreviewData.rows.length} Rows • Formatted Microsoft Excel (.xlsx)</span>
            </div>

            {/* Modal Body: Excel Grid Preview */}
            <div className="overflow-auto p-4 flex-1 max-h-[58vh]">
              <table className="w-full text-xs font-mono border-collapse border border-[#cbd5e1]">
                <tbody>
                  {excelPreviewData.rows.map((row, rIdx) => {
                    const isTitle = rIdx === 0;
                    const isTableHeader = rIdx === 9;
                    const isSummary = rIdx >= excelPreviewData.rows.length - 8 && rIdx <= excelPreviewData.rows.length - 6;

                    return (
                      <tr 
                        key={rIdx} 
                        className={`${isTitle ? 'bg-amber-50 font-bold' : ''} ${isTableHeader ? 'bg-slate-100 font-extrabold' : ''} ${isSummary ? 'bg-slate-50 font-bold' : ''}`}
                      >
                        <td className="w-10 text-center bg-slate-100 border border-[#cbd5e1] text-[#94a3b8] py-1 text-[11px] select-none">
                          {rIdx + 1}
                        </td>
                        {[0, 1, 2, 3, 4, 5].map((cIdx) => {
                          const val = row[cIdx] !== undefined ? row[cIdx] : '';
                          const isNumber = typeof val === 'number';
                          return (
                            <td 
                              key={cIdx} 
                              className={`border border-[#cbd5e1] px-2.5 py-1 truncate max-w-xs ${isNumber ? 'text-right text-[#0f172a]' : 'text-[#334155]'}`}
                            >
                              {isNumber ? (
                                (val >= 100 || cIdx === 3 || cIdx === 5) 
                                  ? formatCurrency(val) 
                                  : val
                              ) : val}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-[#f8fafc] border-t border-[#eae7de] flex items-center justify-between text-xs">
              <span className="text-[#575e6d] hidden sm:inline">Previewing spreadsheet layout before downloading.</span>
              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-xs transition-all cursor-pointer"
                  onClick={() => handleDownloadExcel(selectedExcelQuote)}
                >
                  <Download size={14} />
                  <span>Download Excel</span>
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-full border border-[#d8d4c7] bg-white hover:bg-[#f6f5ef] font-bold text-xs text-[#1a1c22] cursor-pointer"
                  onClick={() => setSelectedExcelQuote(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PDF DOCUMENT PREVIEW MODAL ("VIEW FIRST THEN DOWNLOAD")
          ======================================================== */}
      {selectedPdfQuote && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in" onClick={() => setSelectedPdfQuote(null)}>
          <div 
            className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-rose-300 overflow-hidden flex flex-col animate-scale-up my-auto max-h-[92vh]" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#eae7de] flex items-center justify-between bg-rose-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 border border-rose-300 flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-[#1a1c22]">PDF Quotation Preview</h2>
                  <p className="text-xs text-[#575e6d]">Document: <b className="text-[#1a1c22]">{selectedPdfQuote.quotationId}.pdf</b> • {selectedPdfQuote.customer?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-full shadow-xs transition-all cursor-pointer"
                  onClick={() => handleDownloadPdf(selectedPdfQuote)}
                  title="Download PDF Document (.pdf)"
                >
                  <Download size={14} />
                  <span>Download PDF (.pdf)</span>
                </button>
                <button 
                  type="button" 
                  className="w-8 h-8 rounded-lg border border-[#d8d4c7] hover:bg-white text-[#575e6d] hover:text-[#1a1c22] flex items-center justify-center cursor-pointer" 
                  onClick={() => setSelectedPdfQuote(null)}
                  aria-label="Close Preview"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body: Embedded PDF View */}
            <div className="p-4 bg-slate-700 flex-1 overflow-auto max-h-[64vh] flex justify-center">
              {pdfBlobUrl ? (
                <iframe 
                  src={`${pdfBlobUrl}#toolbar=0&navpanes=0`} 
                  title={`PDF Document ${selectedPdfQuote.quotationId}`}
                  className="w-full h-[60vh] rounded-lg bg-white shadow-xl border-none"
                />
              ) : (
                <div className="bg-white p-8 rounded-xl max-w-2xl w-full shadow-xl text-xs space-y-4">
                  <div className="border-b-2 border-[#b38728] pb-3 flex justify-between items-center">
                    <h3 className="text-base font-extrabold text-[#946c1a]">ROYAL LUXE ELECTRICALS</h3>
                    <span className="font-mono font-bold text-xs bg-[#fbf5e6] px-2 py-0.5 rounded">{selectedPdfQuote.quotationId}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <b className="text-[#1a1c22]">QUOTATION TO:</b>
                      <p>{selectedPdfQuote.customer?.name}</p>
                      <p>{selectedPdfQuote.customer?.mobile}</p>
                      <p>{selectedPdfQuote.customer?.email}</p>
                    </div>
                    <div className="text-right">
                      <b className="text-[#1a1c22]">DATE:</b>
                      <p>{new Date(selectedPdfQuote.createdAt || Date.now()).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-[#f8fafc] border-t border-[#eae7de] flex items-center justify-between text-xs">
              <span className="text-[#575e6d] hidden sm:inline">Viewing official estimate document before downloading.</span>
              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-full shadow-xs transition-all cursor-pointer"
                  onClick={() => handleDownloadPdf(selectedPdfQuote)}
                >
                  <Download size={14} />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-full border border-[#d8d4c7] bg-white hover:bg-[#f6f5ef] font-bold text-xs text-[#1a1c22] cursor-pointer"
                  onClick={() => setSelectedPdfQuote(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          QUOTATION FULL INSPECTION MODAL (CHEVRON VIEW)
          ======================================================== */}
      {selectedPreviewQuote && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in" onClick={() => setSelectedPreviewQuote(null)}>
          <div 
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#d8d4c7] overflow-hidden flex flex-col animate-scale-up my-auto max-h-[90vh]" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="px-6 py-4.5 border-b border-[#eae7de] flex items-center justify-between bg-white">
              <div>
                <h2 className="text-lg font-extrabold text-[#1a1c22]">Quotation {selectedPreviewQuote.quotationId}</h2>
                <p className="text-xs text-[#575e6d]">
                  Issued to <b className="text-[#1a1c22]">{selectedPreviewQuote.customer?.name}</b> • {selectedPreviewQuote.isPurchased ? 'Purchased Order' : 'Active Quotation'}
                </p>
              </div>
              <button 
                type="button" 
                className="w-8 h-8 rounded-lg border border-[#eae7de] hover:bg-[#f6f5ef] text-[#575e6d] hover:text-[#1a1c22] flex items-center justify-center cursor-pointer" 
                onClick={() => setSelectedPreviewQuote(null)}
                aria-label="Close Preview"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Customer Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#faf9f6] p-4 rounded-xl border border-[#eae7de] text-xs">
                <div>
                  <span className="text-[#8c93a3] block font-medium">Customer Name</span>
                  <span className="font-bold text-[#1a1c22] text-sm">{selectedPreviewQuote.customer?.name}</span>
                </div>
                <div>
                  <span className="text-[#8c93a3] block font-medium">Mobile Number</span>
                  <span className="font-bold text-[#1a1c22] text-sm">{selectedPreviewQuote.customer?.mobile}</span>
                </div>
                <div>
                  <span className="text-[#8c93a3] block font-medium">Email Address</span>
                  <span className="font-bold text-[#1a1c22] text-sm truncate block">{selectedPreviewQuote.customer?.email}</span>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#eae7de] text-[#8c93a3] uppercase font-bold text-[10px]">
                    <th className="text-left py-2">Product Description</th>
                    <th className="text-left py-2">Category</th>
                    <th className="text-center py-2">Qty</th>
                    <th className="text-right py-2">Unit Price</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {selectedPreviewQuote.items?.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="py-2.5 font-bold text-[#1a1c22]">{item.name}</td>
                      <td className="py-2.5">
                        <span className="text-[11px] font-semibold text-[#575e6d] bg-[#f6f5ef] px-2 py-0.5 rounded-full">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-2.5 text-center text-[#575e6d]">{item.quantity}</td>
                      <td className="py-2.5 text-right font-mono text-[#575e6d]">{formatCurrency(item.price)}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-[#1a1c22]">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary */}
              <div className="bg-[#faf8f3] rounded-xl border border-[#eeddb0] p-4 space-y-2 text-xs text-[#575e6d]">
                <div className="flex justify-between">
                  <span>Subtotal ({selectedPreviewQuote.totals?.itemCount} items)</span>
                  <span className="font-mono font-bold text-[#1a1c22]">{formatCurrency(selectedPreviewQuote.totals?.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span className="font-mono font-bold text-[#1a1c22]">{formatCurrency(selectedPreviewQuote.totals?.gstAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#1a1c22] pt-2 border-t border-[#d8d4c7]">
                  <span>Total Quotation Amount</span>
                  <span className="font-mono text-base text-[#946c1a]">{formatCurrency(selectedPreviewQuote.totals?.total)}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#eae7de] flex items-center justify-end gap-2.5">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs transition-all cursor-pointer"
                onClick={(e) => {
                  setSelectedPreviewQuote(null);
                  handleOpenExcelPreview(selectedPreviewQuote, e);
                }}
              >
                <FileSpreadsheet size={15} />
                <span>View as Excel</span>
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs transition-all cursor-pointer"
                onClick={(e) => {
                  setSelectedPreviewQuote(null);
                  handleOpenPdfPreview(selectedPreviewQuote, e);
                }}
              >
                <FileText size={15} />
                <span>View as PDF</span>
              </button>

              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-gold-btn text-white font-bold text-xs shadow-xs cursor-pointer"
                onClick={() => setSelectedPreviewQuote(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Product Dialog Box */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onAddProduct={onAddProduct}
      />
    </div>
  );
}
