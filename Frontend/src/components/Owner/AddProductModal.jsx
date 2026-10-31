import React, { useState } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Plus,
  Tag,
  Sparkles
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const DEFAULT_CATEGORIES = ['Switches', 'Switch Boxes', 'Fans', 'Lights'];

const SAMPLE_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80'
];

export default function AddProductModal({
  isOpen,
  onClose,
  onAddProduct,
  existingCategories = []
}) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Switches');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const [photoMode, setPhotoMode] = useState('upload'); // 'upload' | 'url'
  const [photoData, setPhotoData] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [fileName, setFileName] = useState('');

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const allCategoryOptions = Array.from(new Set([...DEFAULT_CATEGORIES, ...existingCategories]));
  const activeImage = photoMode === 'upload' ? photoData : photoUrl;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, photo: 'Please upload a valid image file (JPG, PNG, WebP)' }));
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setPhotoData(uploadEvent.target.result);
      setErrors(prev => ({ ...prev, photo: null }));
    };
    reader.readAsDataURL(file);
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustomCategory(true);
      setCategory('');
    } else {
      setIsCustomCategory(false);
      setCategory(val);
    }
  };

  const handlePickSampleImage = (img) => {
    setPhotoMode('url');
    setPhotoUrl(img);
    setErrors(prev => ({ ...prev, photo: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Product name is required';
    }

    const numPrice = Number(price);
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = 'Please enter a valid price (greater than ₹0)';
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    if (!finalCategory) {
      newErrors.category = 'Please select or enter a category';
    }

    const finalImage = (photoMode === 'upload' ? photoData : photoUrl.trim()) || SAMPLE_FALLBACK_IMAGES[0];

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAddProduct({
      name: name.trim(),
      price: numPrice,
      category: finalCategory,
      image: finalImage
    });

    setName('');
    setPrice('');
    setCategory('Switches');
    setCustomCategory('');
    setIsCustomCategory(false);
    setPhotoData('');
    setPhotoUrl('');
    setFileName('');
    setErrors({});

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in" onClick={onClose}>
      <div
        className="relative bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-[#eeddb0] overflow-hidden flex flex-col animate-scale-up my-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Dialog Header */}
        <div className="px-6 py-4 border-b border-[#eae7de] flex items-center justify-between bg-gradient-to-r from-white to-[#faf9f5]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#fbf5e6] text-[#b38728] border border-[#eeddb0] flex items-center justify-center">
              <Plus size={22} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#1a1c22]">Add New Product</h2>
              <p className="text-xs text-[#575e6d]">Add photo, name, price, and category to list in store</p>
            </div>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-lg border border-[#eae7de] hover:bg-[#f6f5ef] text-[#575e6d] hover:text-[#1a1c22] flex items-center justify-center cursor-pointer transition-colors"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dialog Form */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto max-h-[80vh]">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side: Photo Upload & Preview */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#1a1c22]">
                Product Photo <span className="text-red-500">*</span>
              </label>

              {/* Photo Mode Switcher */}
              <div className="flex gap-1.5 bg-[#f6f5ef] p-1 rounded-xl">
                <button
                  type="button"
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${photoMode === 'upload' ? 'bg-white text-[#1a1c22] shadow-2xs' : 'text-[#575e6d] hover:text-[#1a1c22]'
                    }`}
                  onClick={() => setPhotoMode('upload')}
                >
                  <Upload size={13} />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${photoMode === 'url' ? 'bg-white text-[#1a1c22] shadow-2xs' : 'text-[#575e6d] hover:text-[#1a1c22]'
                    }`}
                  onClick={() => setPhotoMode('url')}
                >
                  <ImageIcon size={13} />
                  <span>Image URL</span>
                </button>
              </div>

              {photoMode === 'upload' ? (
                <div className="border-2 border-dashed border-[#d8d4c7] hover:border-[#b38728] rounded-xl bg-[#faf9f6] hover:bg-[#fdfbf7] transition-all cursor-pointer overflow-hidden">
                  <input
                    id="product-photo-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="product-photo-file-input" className="block cursor-pointer p-4 text-center">
                    {photoData ? (
                      <div className="relative w-full h-40 rounded-lg overflow-hidden">
                        <img src={photoData} alt="Preview" className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                          Click to Change
                        </span>
                      </div>
                    ) : (
                      <div className="py-6 flex flex-col items-center gap-2">
                        <Upload size={28} className="text-[#b38728]" />
                        <span className="text-xs font-bold text-[#1a1c22]">Click to upload photo</span>
                        <span className="text-[11px] text-[#8c93a3]">Supports PNG, JPG, WebP</span>
                      </div>
                    )}
                  </label>
                  {fileName && <span className="block text-[11px] text-[#575e6d] text-center pb-2 truncate px-3">{fileName}</span>}
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={photoUrl}
                    onChange={(e) => {
                      setPhotoUrl(e.target.value);
                      setErrors(prev => ({ ...prev, photo: null }));
                    }}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-[#d8d4c7] focus:border-[#b38728] rounded-xl outline-none"
                  />
                  {photoUrl && (
                    <div className="w-full h-36 rounded-xl overflow-hidden border border-[#eae7de]">
                      <img
                        src={photoUrl}
                        alt="URL Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = SAMPLE_FALLBACK_IMAGES[0];
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Sample Photo Quick Select */}
              <div>
                <span className="text-[11px] text-[#575e6d] block mb-1.5 font-medium">Or choose sample photo:</span>
                <div className="flex gap-2">
                  {SAMPLE_FALLBACK_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`w-11 h-11 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${activeImage === img ? 'border-[#b38728] ring-2 ring-[#c59b27]/30 scale-105' : 'border-transparent hover:scale-105'
                        }`}
                      onClick={() => handlePickSampleImage(img)}
                      title={`Sample photo ${idx + 1}`}
                    >
                      <img src={img} alt={`Sample ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {errors.photo && <span className="text-xs text-red-600 font-semibold block">{errors.photo}</span>}
            </div>

            {/* Right side: Name, Price, Category */}
            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label htmlFor="product-name-input" className="block text-xs font-bold text-[#1a1c22] mb-1.5">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="product-name-input"
                  type="text"
                  placeholder="e.g. Royal 24K Gold Touch Sensor Switch"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                  }}
                  className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl outline-none transition-all ${errors.name ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-[#d8d4c7] focus:border-[#b38728] focus:ring-2 focus:ring-[#c59b27]/20'
                    }`}
                  autoFocus
                />
                {errors.name && <span className="text-xs text-red-600 font-semibold mt-1 block">{errors.name}</span>}
              </div>

              {/* Product Price */}
              <div>
                <label htmlFor="product-price-input" className="block text-xs font-bold text-[#1a1c22] mb-1.5">
                  Price (INR) <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[#575e6d] font-bold text-sm pointer-events-none">₹</span>
                  <input
                    id="product-price-input"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="3450"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      if (errors.price) setErrors(prev => ({ ...prev, price: null }));
                    }}
                    className={`w-full pl-8 pr-24 py-2 text-sm font-mono font-bold bg-white border rounded-xl outline-none transition-all ${errors.price ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-[#d8d4c7] focus:border-[#b38728] focus:ring-2 focus:ring-[#c59b27]/20'
                      }`}
                  />
                  {price && !isNaN(Number(price)) && Number(price) > 0 && (
                    <span className="absolute right-3 bg-[#fbf5e6] text-[#946c1a] font-mono text-xs font-extrabold px-2 py-0.5 rounded-md pointer-events-none">
                      {formatCurrency(Number(price))}
                    </span>
                  )}
                </div>
                {errors.price && <span className="text-xs text-red-600 font-semibold mt-1 block">{errors.price}</span>}
              </div>

              {/* Product Category */}
              <div>
                <label htmlFor="product-category-select" className="block text-xs font-bold text-[#1a1c22] mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="product-category-select"
                  value={isCustomCategory ? '__custom__' : category}
                  onChange={handleCategoryChange}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#d8d4c7] focus:border-[#b38728] focus:ring-2 focus:ring-[#c59b27]/20 rounded-xl outline-none"
                >
                  {allCategoryOptions.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__custom__">+ Add Custom Category...</option>
                </select>

                {isCustomCategory && (
                  <input
                    type="text"
                    placeholder="Type custom category name..."
                    value={customCategory}
                    onChange={(e) => {
                      setCustomCategory(e.target.value);
                      if (errors.category) setErrors(prev => ({ ...prev, category: null }));
                    }}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-[#d8d4c7] focus:border-[#b38728] rounded-xl outline-none mt-2"
                    autoFocus
                  />
                )}
                {errors.category && <span className="text-xs text-red-600 font-semibold mt-1 block">{errors.category}</span>}
              </div>

              {/* Live Preview Pill */}
              <div className="bg-gradient-to-br from-white to-[#faf8f3] border border-[#eeddb0] rounded-xl p-3 shadow-2xs">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#946c1a] uppercase tracking-wider mb-1.5">
                  <Sparkles size={12} />
                  <span>Catalog Card Preview</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[#1a1c22] truncate">{name.trim() || 'Product Name'}</h4>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#575e6d] bg-white border border-[#eae7de] px-2 py-0.5 rounded-full mt-1">
                      <Tag size={10} className="text-[#b38728]" />
                      <span>{isCustomCategory ? (customCategory.trim() || 'Custom') : category}</span>
                    </span>
                  </div>
                  <div className="font-mono text-base font-extrabold text-[#946c1a] flex-shrink-0">
                    {price && !isNaN(Number(price)) && Number(price) > 0
                      ? formatCurrency(Number(price))
                      : '₹0'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dialog Action Buttons */}
          <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#eae7de] flex items-center justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 bg-white border border-[#d8d4c7] hover:bg-[#f6f5ef] text-[#575e6d] text-sm font-bold rounded-xl transition-all cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              id="confirm-add-product-btn"
              className="px-5 py-2 bg-gold-btn text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-[0_4px_14px_rgba(197,155,39,0.25)] transition-all cursor-pointer hover:shadow-[0_6px_18px_rgba(197,155,39,0.35)]"
            >
              <Plus size={16} />
              <span>Add Product</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
