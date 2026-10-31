import React, { useState, useMemo, useEffect } from 'react';
import {
  Navigation,
  ProductCard,
  QuotationModal,
  QuotationSuccessModal
} from './components/Customer';
import {
  OwnerDashboard,
  OwnerLoginModal,
  Toast
} from './components/Owner';
import { PRODUCTS, CATEGORIES } from './data/products';
import { INITIAL_QUOTATIONS } from './data/sampleQuotations';
import { Sparkles, PackageSearch, RefreshCcw } from 'lucide-react';
import './App.css';

export default function App() {
  // Quotation cart state with LocalStorage persistence
  const [quotationItems, setQuotationItems] = useState(() => {
    try {
      const saved = localStorage.getItem('royal_quote_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Owner Authentication & View States
  const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState(() => {
    try {
      return localStorage.getItem('royal_owner_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [currentView, setCurrentView] = useState('store'); // 'store' | 'owner'
  const [isOwnerLoginModalOpen, setIsOwnerLoginModalOpen] = useState(false);

  // All Quotations (Master Ledger) with sample data fallback
  const [quotationRecords, setQuotationRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('royal_all_quotations');
      return saved ? JSON.parse(saved) : INITIAL_QUOTATIONS;
    } catch {
      return INITIAL_QUOTATIONS;
    }
  });

  // Products catalog with LocalStorage persistence and fallback
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('royal_products');
      return saved ? JSON.parse(saved) : PRODUCTS;
    } catch {
      return PRODUCTS;
    }
  });

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [submittedQuotation, setSubmittedQuotation] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('royal_quote_items', JSON.stringify(quotationItems));
    } catch (err) {
      console.error('Failed to save quotation items to localStorage', err);
    }
  }, [quotationItems]);

  // Save quotation records to local storage
  useEffect(() => {
    try {
      localStorage.setItem('royal_all_quotations', JSON.stringify(quotationRecords));
    } catch (err) {
      console.error('Failed to save quotation records to localStorage', err);
    }
  }, [quotationRecords]);

  // Save products to local storage
  useEffect(() => {
    try {
      localStorage.setItem('royal_products', JSON.stringify(products));
    } catch (err) {
      console.error('Failed to save products to localStorage', err);
    }
  }, [products]);

  // Add new product to catalog
  const handleAddProduct = (newProductData) => {
    const newProduct = {
      id: Date.now(),
      name: newProductData.name.trim(),
      price: Number(newProductData.price),
      category: newProductData.category.trim(),
      image: newProductData.image || 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80'
    };

    setProducts(prev => [newProduct, ...prev]);
    showToast(`Product "${newProduct.name}" added to store catalog!`);
    return newProduct;
  };

  // Toast Helper
  const showToast = (message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  // Add product to quotation
  const handleAddToQuotation = (product) => {
    setQuotationItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`Added "${product.name}" to quotation`);
  };

  // Update item quantity
  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setQuotationItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove single item
  const handleRemoveItem = (productId) => {
    const item = quotationItems.find(i => i.id === productId);
    setQuotationItems(prev => prev.filter(i => i.id !== productId));
    if (item) {
      showToast(`Removed "${item.name}" from quotation`);
    }
  };

  // Clear quotation
  const handleClearQuotation = () => {
    setQuotationItems([]);
    showToast('Quotation list cleared');
  };

  // Handle final submission of customer details
  const handleSubmitQuotation = (quotationPayload) => {
    setSubmittedQuotation(quotationPayload);
    setIsQuotationModalOpen(false);
    setQuotationItems([]);

    // Add to all quotations master list
    setQuotationRecords(prev => [quotationPayload, ...prev]);

    showToast('Quotation request submitted successfully!');
  };

  // Owner Authentication Actions
  const handleOpenOwnerModal = () => {
    setIsOwnerLoginModalOpen(true);
  };

  const handleTogglePurchased = (quotationId) => {
    setQuotationRecords(prev =>
      prev.map(q => {
        if (q.quotationId === quotationId) {
          const nextStatus = !q.isPurchased;
          return {
            ...q,
            isPurchased: nextStatus,
            purchasedAt: nextStatus ? new Date().toISOString() : null
          };
        }
        return q;
      })
    );
  };

  const handleOwnerLoginSuccess = () => {
    setIsOwnerLoggedIn(true);
    try {
      localStorage.setItem('royal_owner_auth', 'true');
    } catch (e) {
      console.error(e);
    }
    setIsOwnerLoginModalOpen(false);
    setCurrentView('owner');
    showToast('Login successful! Welcome to the Owner Quotation Portal.');
  };

  const handleOwnerLogout = () => {
    setIsOwnerLoggedIn(false);
    try {
      localStorage.setItem('royal_owner_auth', 'false');
    } catch (e) {
      console.error(e);
    }
    setCurrentView('store');
    showToast('Logged out from Owner Portal.');
  };

  const handleBackToStore = () => {
    setCurrentView('store');
  };

  const handleViewOwnerDashboard = () => {
    setCurrentView('owner');
  };

  // Available categories based on default and dynamically added products
  const availableCategories = useMemo(() => {
    const catSet = new Set(CATEGORIES);
    products.forEach(p => {
      if (p.category) catSet.add(p.category);
    });
    return Array.from(catSet);
  }, [products]);

  // Filter Products by search & category
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#fcfbf9] text-[#1a1c22]">
      {currentView === 'owner' ? (
        /* Owner Dashboard View */
        <OwnerDashboard
          quotations={quotationRecords}
          products={products}
          onAddProduct={handleAddProduct}
          onBackToStore={handleBackToStore}
          onLogout={handleOwnerLogout}
          showToast={showToast}
          onTogglePurchased={handleTogglePurchased}
        />
      ) : (
        /* Public Storefront View */
        <>
          {/* Sticky Navigation Bar with Owner button at top right */}
          <Navigation
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            quotationItems={quotationItems}
            onOpenQuotation={() => setIsQuotationModalOpen(true)}
            onOpenOwner={handleOpenOwnerModal}
            isOwnerLoggedIn={isOwnerLoggedIn}
            onViewOwnerDashboard={handleViewOwnerDashboard}
          />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
            {/* Royal Hero Banner */}
            <section className="text-center max-w-3xl mx-auto pt-6 pb-10">
              {/* <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fbf5e6] text-[#946c1a] border border-[#eeddb0] text-xs font-bold tracking-wide uppercase mb-4 shadow-xs">
                <Sparkles size={14} />
                <span>Royal & Modern Electrical Quotations</span>
              </div> */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1a1c22] tracking-tight leading-tight mb-4">
                Trending Royal Switches, Fans & <span className="text-gold-gradient">Designer Lights</span>
              </h2>
              {/* <p className="text-base sm:text-lg text-[#575e6d] max-w-2xl mx-auto leading-relaxed">
                Curated collection of {products.length} premium switches, switch boxes, fans, and luxury lights. Select your products and request an instant quotation.
              </p> */}
            </section>

            {/* Category Filter Chips */}
            <section className="mb-8">
              <div className="flex items-center justify-center flex-wrap gap-2.5 mb-5" role="tablist" aria-label="Product categories">
                {availableCategories.map(category => (
                  <button
                    key={category}
                    type="button"
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer shadow-xs ${selectedCategory === category
                      ? 'bg-brand-gradient text-white shadow-[0_4px_14px_rgba(197,155,39,0.28)] scale-105'
                      : 'bg-white text-[#575e6d] border border-[#d8d4c7] hover:border-[#b38728] hover:text-[#1a1c22] hover:bg-[#fbf5e6]'
                      }`}
                    onClick={() => setSelectedCategory(category)}
                    role="tab"
                    aria-selected={selectedCategory === category}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm text-[#575e6d] px-1">
                <div>
                  Showing <b className="text-[#1a1c22] font-extrabold">{filteredProducts.length}</b> products
                  {selectedCategory !== 'All' && <span> in <b className="text-[#1a1c22]">{selectedCategory}</b></span>}
                  {searchQuery && <span> matching "<b className="text-[#1a1c22]">{searchQuery}</b>"</span>}
                </div>
              </div>
            </section>

            {/* Products Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16" id="products-grid-container">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => {
                  const quotationItem = quotationItems.find(item => item.id === product.id);
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      quotationItem={quotationItem}
                      onAddToQuotation={handleAddToQuotation}
                      onUpdateQuantity={handleUpdateQuantity}
                    />
                  );
                })
              ) : (
                <div className="col-span-full bg-white rounded-2xl border border-dashed border-[#d8d4c7] p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#fbf5e6] text-[#b38728] flex items-center justify-center mx-auto mb-4">
                    <PackageSearch size={36} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1c22] mb-1">No matching electrical products found</h3>
                  <p className="text-sm text-[#575e6d] mb-5">Try searching for switch, switch box, fan, or light.</p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#d8d4c7] bg-white hover:bg-[#f6f5ef] text-sm font-bold text-[#1a1c22] transition-all cursor-pointer shadow-xs"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                  >
                    <RefreshCcw size={14} />
                    <span>Reset Filters</span>
                  </button>
                </div>
              )}
            </section>
          </main>

          {/* Quotation Slide Drawer / Review Modal */}
          <QuotationModal
            isOpen={isQuotationModalOpen}
            onClose={() => setIsQuotationModalOpen(false)}
            quotationItems={quotationItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearQuotation={handleClearQuotation}
            onSubmitQuotation={handleSubmitQuotation}
          />

          {/* Quotation Submission Success / Printable Receipt Modal */}
          <QuotationSuccessModal
            quotationData={submittedQuotation}
            onClose={() => setSubmittedQuotation(null)}
          />

          {/* Clean Light Theme Footer */}
          <footer className="mt-auto border-t border-[#eae7de] py-6 text-center text-xs text-[#8c93a3] bg-white">
            <p>© {new Date().getFullYear()} Royal Luxe Electricals. Premium Quotation Portal.</p>
          </footer>
        </>
      )}

      {/* Owner Authentication Modal */}
      <OwnerLoginModal
        isOpen={isOwnerLoginModalOpen}
        onClose={() => setIsOwnerLoginModalOpen(false)}
        onLoginSuccess={handleOwnerLoginSuccess}
      />

      {/* Dynamic Floating Toast Notifications */}
      <Toast toasts={toasts} />
    </div>
  );
}
