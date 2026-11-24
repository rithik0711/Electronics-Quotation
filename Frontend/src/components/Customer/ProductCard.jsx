import React from 'react';
import { Plus, Minus, Tag } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function ProductCard({ 
  product, 
  quotationItem, 
  onAddToQuotation, 
  onUpdateQuantity 
}) {
  const isAdded = Boolean(quotationItem && quotationItem.quantity > 0);
  const quantity = quotationItem ? quotationItem.quantity : 0;

  return (
    <div 
      className="bg-white rounded-2xl border border-[#eae7de] hover:border-[#c59b27]/60 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
      id={`product-card-${product.id}`}
    >
      {/* Product Image with Category Pill */}
      <div className="relative w-full pt-[64%] sm:pt-[68%] overflow-hidden bg-[#f6f5ef]">
        <img 
          src={product.image} 
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80';
          }}
        />
        {product.category && (
          <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] sm:text-xs font-bold text-[#575e6d] shadow-xs border border-black/5">
            <Tag size={10} className="text-[#b38728]" />
            <span>{product.category}</span>
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3.5 sm:p-5 flex flex-col flex-1 justify-between gap-3 sm:gap-4">
        {/* Product Name */}
        <h3 
          className="text-sm sm:text-base font-bold text-[#1a1c22] line-clamp-2 leading-snug group-hover:text-[#946c1a] transition-colors"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Product Price */}
        <div className="flex items-baseline">
          <span className="text-xl sm:text-2xl font-extrabold text-[#946c1a] font-mono tracking-tight">
            {formatCurrency(product.price)}
          </span>
        </div>

        {/* Quantity Controls / Add to Quotation */}
        <div className="pt-0.5 relative z-10">
          {isAdded ? (
            <div className="flex items-center justify-between bg-[#fbf5e6] border border-[#eeddb0] rounded-xl p-1 shadow-xs">
              <button
                type="button"
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-white border border-[#eeddb0] text-[#1a1c22] hover:bg-[#f7eed5] active:bg-[#f0e4c5] flex items-center justify-center transition-all cursor-pointer shadow-2xs select-none"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity(product.id, quantity - 1);
                }}
                title="Decrease quantity"
                aria-label="Decrease quantity"
              >
                <Minus size={15} />
              </button>

              <span className="font-mono font-extrabold text-sm sm:text-base text-[#1a1c22] px-2 select-none" title="Current quantity">
                {quantity}
              </span>

              <button
                type="button"
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-white border border-[#eeddb0] text-[#1a1c22] hover:bg-[#f7eed5] active:bg-[#f0e4c5] flex items-center justify-center transition-all cursor-pointer shadow-2xs select-none"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity(product.id, quantity + 1);
                }}
                title="Increase quantity"
                aria-label="Increase quantity"
              >
                <Plus size={15} />
              </button>
            </div>
          ) : (
            <button
              id={`add-to-quote-${product.id}`}
              type="button"
              className="w-full py-2.5 px-3 sm:px-4 rounded-xl bg-gold-btn text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-[0_4px_14px_rgba(197,155,39,0.25)] hover:shadow-[0_6px_18px_rgba(197,155,39,0.35)] transition-all cursor-pointer active:scale-98 min-h-[42px] select-none"
              onClick={(e) => {
                e.stopPropagation();
                onAddToQuotation(product);
              }}
            >
              <Plus size={16} />
              <span>Add to Quotation</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
