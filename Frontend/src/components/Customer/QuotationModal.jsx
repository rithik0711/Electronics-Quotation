import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  User, 
  Phone, 
  Mail, 
  Send, 
  ShoppingBag, 
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, calculateQuotationTotals } from '../../utils/formatters';

export default function QuotationModal({
  isOpen,
  onClose,
  quotationItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearQuotation,
  onSubmitQuotation
}) {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const totals = calculateQuotationTotals(quotationItems);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (cleanMobile.length < 10) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (quotationItems.length === 0) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitQuotation({
        customer: formData,
        items: [...quotationItems],
        totals,
        quotationId: `RLQ-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date().toISOString()
      });
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-scale-up" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quotation-drawer-title"
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#eae7de] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fbf5e6] text-[#b38728] border border-[#eeddb0] flex items-center justify-center">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 id="quotation-drawer-title" className="text-lg font-extrabold text-[#1a1c22]">Quotation Request</h2>
              <p className="text-xs text-[#575e6d] font-semibold">{totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'} in quotation list</p>
            </div>
          </div>
          <button 
            type="button" 
            className="w-8 h-8 rounded-lg border border-[#eae7de] hover:bg-[#f6f5ef] text-[#575e6d] hover:text-[#1a1c22] flex items-center justify-center cursor-pointer transition-colors" 
            onClick={onClose}
            aria-label="Close Quotation Drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {quotationItems.length === 0 ? (
            /* Empty State */
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#fbf5e6] text-[#b38728] flex items-center justify-center mx-auto mb-4 border border-[#eeddb0]">
                <ShoppingBag size={32} />
              </div>
              <h3 className="text-lg font-bold text-[#1a1c22] mb-1">Your Quotation is Empty</h3>
              <p className="text-sm text-[#575e6d] max-w-xs mx-auto mb-6">
                Explore our premium royal switches, switch boxes, fans, and luxury lights to create your customized quotation.
              </p>
              <button 
                type="button" 
                className="px-5 py-2.5 rounded-full border border-[#d8d4c7] bg-white hover:bg-[#f6f5ef] text-sm font-bold text-[#1a1c22] cursor-pointer shadow-xs transition-all"
                onClick={onClose}
              >
                Browse Products
              </button>
            </div>
          ) : (
            <>
              {/* Products List */}
              <div className="space-y-3">
                {quotationItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3.5 p-3.5 bg-[#faf9f6] rounded-xl border border-[#eae7de]" id={`quote-item-${item.id}`}>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-14 h-14 rounded-lg object-cover border border-[#eae7de] bg-white flex-shrink-0" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=400&q=80';
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#1a1c22] truncate" title={item.name}>{item.name}</h4>
                      <p className="text-xs text-[#575e6d] font-mono mt-0.5">{formatCurrency(item.price)} each</p>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center bg-white border border-[#d8d4c7] rounded-lg p-1 shadow-2xs">
                      <button
                        type="button"
                        className="w-6 h-6 rounded flex items-center justify-center text-[#575e6d] hover:bg-[#f6f5ef] cursor-pointer"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        title="Reduce quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-mono text-xs font-bold text-[#1a1c22] px-2">{item.quantity}</span>
                      <button
                        type="button"
                        className="w-6 h-6 rounded flex items-center justify-center text-[#575e6d] hover:bg-[#f6f5ef] cursor-pointer"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        title="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Total & Delete */}
                    <div className="text-right">
                      <span className="font-mono text-sm font-extrabold text-[#946c1a] block">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="text-[#8c93a3] hover:text-red-500 p-1 cursor-pointer transition-colors"
                      onClick={() => onRemoveItem(item.id)}
                      title="Remove product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="bg-[#faf8f3] rounded-xl border border-[#eeddb0] p-4.5 space-y-2.5">
                <div className="flex justify-between text-sm text-[#575e6d]">
                  <span>Subtotal ({totals.itemCount} items)</span>
                  <span className="font-mono font-bold text-[#1a1c22]">{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-[#575e6d]">
                  <span>GST (18%)</span>
                  <span className="font-mono font-bold text-[#1a1c22]">{formatCurrency(totals.gstAmount)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-[#1a1c22] pt-2 border-t border-[#d8d4c7]">
                  <span>Total Quotation Amount</span>
                  <span className="font-mono text-lg text-[#946c1a]">{formatCurrency(totals.total)}</span>
                </div>
              </div>

              {/* Purchase Details / Submit Form */}
              <div className="bg-white rounded-xl border border-[#eae7de] p-5 shadow-xs">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-[#1a1c22]">Customer Details</h3>
                  <p className="text-xs text-[#575e6d]">Please enter your contact details to submit the quotation request.</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                  {/* Name */}
                  <div>
                    <label htmlFor="customer-name" className="block text-xs font-bold text-[#1a1c22] mb-1.5">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <User size={16} className="absolute left-3.5 text-[#8c93a3] pointer-events-none" />
                      <input
                        id="customer-name"
                        type="text"
                        className={`w-full pl-10 pr-4 py-2 text-sm bg-white border rounded-xl outline-none transition-all ${
                          errors.name ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-[#d8d4c7] focus:border-[#b38728] focus:ring-2 focus:ring-[#c59b27]/20'
                        }`}
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    </div>
                    {errors.name && (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600 mt-1 font-semibold">
                        <AlertCircle size={12} /> {errors.name}
                      </span>
                    )}
                  </div>

                  {/* Mobile No */}
                  <div>
                    <label htmlFor="customer-mobile" className="block text-xs font-bold text-[#1a1c22] mb-1.5">
                      Mobile No. <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Phone size={16} className="absolute left-3.5 text-[#8c93a3] pointer-events-none" />
                      <input
                        id="customer-mobile"
                        type="tel"
                        className={`w-full pl-10 pr-4 py-2 text-sm bg-white border rounded-xl outline-none transition-all ${
                          errors.mobile ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-[#d8d4c7] focus:border-[#b38728] focus:ring-2 focus:ring-[#c59b27]/20'
                        }`}
                        placeholder="Enter 10-digit mobile number"
                        value={formData.mobile}
                        onChange={(e) => handleInputChange('mobile', e.target.value)}
                      />
                    </div>
                    {errors.mobile && (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600 mt-1 font-semibold">
                        <AlertCircle size={12} /> {errors.mobile}
                      </span>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="customer-email" className="block text-xs font-bold text-[#1a1c22] mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Mail size={16} className="absolute left-3.5 text-[#8c93a3] pointer-events-none" />
                      <input
                        id="customer-email"
                        type="email"
                        className={`w-full pl-10 pr-4 py-2 text-sm bg-white border rounded-xl outline-none transition-all ${
                          errors.email ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-[#d8d4c7] focus:border-[#b38728] focus:ring-2 focus:ring-[#c59b27]/20'
                        }`}
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>
                    {errors.email && (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600 mt-1 font-semibold">
                        <AlertCircle size={12} /> {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    id="submit-quotation-btn"
                    type="submit"
                    className="w-full py-3 px-4 bg-gold-btn text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(197,155,39,0.28)] transition-all cursor-pointer hover:shadow-[0_6px_20px_rgba(197,155,39,0.38)] mt-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span>Submitting Quotation...</span>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Submit Quotation</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
