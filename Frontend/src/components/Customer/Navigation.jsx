import React from 'react';
import { 
  Crown, 
  Search, 
  X, 
  FileSpreadsheet,
  ShieldCheck
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function Navigation({ 
  searchQuery, 
  setSearchQuery, 
  quotationItems = [], 
  onOpenQuotation,
  onOpenOwner,
  isOwnerLoggedIn = false,
  onViewOwnerDashboard
}) {
  const totalItemCount = quotationItems.reduce((acc, item) => acc + item.quantity, 0);
  const quotationTotal = quotationItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#eae7de] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none group"
          id="nav-brand-logo"
          onClick={() => {
            setSearchQuery('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          title="Royal Luxe Electricals"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center text-white shadow-[0_4px_16px_rgba(197,155,39,0.3)] group-hover:scale-105 transition-transform">
            <Crown size={22} strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#1a1c22] tracking-tight leading-none">Royal Luxe</h1>
            <span className="text-[10px] font-bold text-[#b38728] tracking-wider uppercase block mt-0.5">Electrical Quotations</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md relative flex items-center hidden sm:flex">
          <Search size={18} className="absolute left-3.5 text-[#8c93a3] pointer-events-none" />
          <input
            id="product-search-input"
            type="text"
            className="w-full pl-11 pr-10 py-2 bg-[#f6f5ef] focus:bg-white border border-[#eae7de] focus:border-[#b38728] focus:ring-2 focus:ring-[#c59b27]/20 rounded-full text-sm text-[#1a1c22] placeholder-[#8c93a3] outline-none transition-all"
            placeholder="Search switches, switch boxes, fans, luxury lights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              id="clear-search-btn"
              type="button" 
              className="absolute right-3 text-[#8c93a3] hover:text-[#1a1c22] p-1 rounded-full cursor-pointer transition-colors"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Top Right Navigation Actions: Owner button & Quotation Cart */}
        <div className="flex items-center gap-3">
          {/* Owner Button */}
          <button
            id="owner-btn"
            type="button"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all cursor-pointer shadow-xs ${
              isOwnerLoggedIn 
                ? 'bg-[#fdfaf3] border-[#b38728] text-[#946c1a] font-bold' 
                : 'bg-white border-[#d8d4c7] hover:border-[#b38728] text-[#1a1c22] hover:bg-[#fbf5e6]'
            }`}
            onClick={isOwnerLoggedIn ? onViewOwnerDashboard : onOpenOwner}
            title={isOwnerLoggedIn ? "Open Owner Portal (Logged in)" : "Owner Portal Login"}
            aria-label="Owner Portal"
          >
            <ShieldCheck size={18} className={isOwnerLoggedIn ? "text-[#b38728]" : "text-[#575e6d]"} />
            <span>{isOwnerLoggedIn ? "Owner Portal" : "Owner"}</span>
            {isOwnerLoggedIn && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Logged in" />}
          </button>

          {/* Customer Quotation Button */}
          <button
            id="view-quotation-btn"
            type="button"
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-bold bg-white border-1.5 border-[#b38728] hover:bg-[#fbf5e6] text-[#1a1c22] transition-all shadow-[0_2px_8px_rgba(197,155,39,0.12)] cursor-pointer"
            onClick={onOpenQuotation}
            title="View Quotation Estimate"
            aria-label={`View Quotation with ${totalItemCount} items`}
          >
            <FileSpreadsheet size={18} className="text-[#b38728]" />
            <span>Quotation</span>
            
            {totalItemCount > 0 && (
              <>
                <span className="bg-[#b38728] text-white rounded-full text-xs font-black px-2 py-0.5 min-w-[20px] text-center" id="quotation-badge-count">
                  {totalItemCount}
                </span>
                <span className="font-mono text-xs font-extrabold text-[#946c1a]">
                  {formatCurrency(quotationTotal)}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Input */}
      <div className="px-4 pb-3 sm:hidden">
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3.5 text-[#8c93a3] pointer-events-none" />
          <input
            type="text"
            className="w-full pl-10 pr-9 py-2 bg-[#f6f5ef] focus:bg-white border border-[#eae7de] focus:border-[#b38728] rounded-full text-sm text-[#1a1c22] placeholder-[#8c93a3] outline-none"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              type="button" 
              className="absolute right-3 text-[#8c93a3] hover:text-[#1a1c22] p-1 cursor-pointer"
              onClick={() => setSearchQuery('')}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
