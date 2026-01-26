
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Category, Product, CartItem, Banner, DbCategory } from './types';
import { PRODUCTS as INITIAL_PRODUCTS, WHATSAPP_NUMBER as DEFAULT_WHATSAPP } from './constants';
import { ProductCard } from './components/ProductCard';
import { Cart } from './components/Cart';
import { AdminPanel } from './components/AdminPanel';
import { getShoppingAdvice, generateProductDescription, getShoppingAssistantResponse } from './geminiService';
import { subscribeToProducts, addProductToDb, updateProductInDb, deleteProductFromDb, subscribeToBanner, subscribeToCategories } from './services/db';
import { uploadProductImage, deleteProductImage } from './services/storage';
import logo from './logo.jpg';

const ADMIN_PASSWORD = "1234";

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [whatsappNumber, setWhatsappNumber] = useState(() => {
    return localStorage.getItem('boutikpaw_wa_number') || DEFAULT_WHATSAPP;
  });

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [dynamicCategories, setDynamicCategories] = useState<DbCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('quickorder_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('quickorder_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [advice, setAdvice] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // AI Assistant State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiHistory, setAiHistory] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [productNameInput, setProductNameInput] = useState('');
  const [productPriceInput, setProductPriceInput] = useState('');
  const [productCategoryInput, setProductCategoryInput] = useState<Category>('Shop');
  const [productDescInput, setProductDescInput] = useState('');
  const [productSupplierNameInput, setProductSupplierNameInput] = useState('');
  const [productSupplierContactInput, setProductSupplierContactInput] = useState('');

  const [currentBanner, setCurrentBanner] = useState<Banner | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const aiScrollRef = useRef<HTMLDivElement>(null);

  // Abònman ak Supabase (Realtime)
  useEffect(() => {
    setIsLoadingProducts(true);
    const unsubscribe = subscribeToProducts((products) => {
      if (products.length === 0 && isLoadingProducts) {
        // Si DB vide nan kòmansman, nou ka montre initial products oswa kite l vid
        setAllProducts(INITIAL_PRODUCTS);
      } else {
        setAllProducts(products);
      }
      setIsLoadingProducts(false);
    });

    setIsLoadingCategories(true);
    const unsubscribeCategories = subscribeToCategories((categories) => {
      setDynamicCategories(categories);
      setIsLoadingCategories(false);
    });

    const unsubscribeBanner = subscribeToBanner((banner) => {
      setCurrentBanner(banner);
    });

    return () => {
      if (unsubscribe) unsubscribe();
      if (unsubscribeCategories) unsubscribeCategories();
      if (unsubscribeBanner) unsubscribeBanner();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('quickorder_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('boutikpaw_wa_number', whatsappNumber);
  }, [whatsappNumber]);

  useEffect(() => {
    if (aiScrollRef.current) {
      aiScrollRef.current.scrollTop = aiScrollRef.current.scrollHeight;
    }
  }, [aiHistory]);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleAiChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;

    const userMsg = aiMessage;
    setAiMessage('');
    setAiHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAiLoading(true);

    const response = await getShoppingAssistantResponse(userMsg, cart, allProducts);
    setAiHistory(prev => [...prev, { role: 'assistant', text: response }]);
    setIsAiLoading(false);
  };

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const totalStockValue = useMemo(() => allProducts.reduce((sum, p) => sum + p.price, 0), [allProducts]);

  const categories = useMemo(() => {
    return ['All', ...dynamicCategories.map(c => c.name)];
  }, [dynamicCategories]);

  const filteredProducts = useMemo(() => {
    let result = allProducts;
    if (selectedCategory !== 'All') result = result.filter(p => p.category === selectedCategory);
    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(lowSearch) || p.description.toLowerCase().includes(lowSearch));
    }
    return result;
  }, [selectedCategory, searchTerm, allProducts]);

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    addToast(`${product.name} ajoute nan panyen!`);
  };

  const handleToggleWishlist = (id: string) => {
    setWishlist(prev => {
      const isAdding = !prev.includes(id);
      addToast(isAdding ? "Ajoute nan favori!" : "Retire nan favori", isAdding ? 'success' : 'info');
      return isAdding ? [...prev, id] : prev.filter(i => i !== id);
    });
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Èske ou vle efase pwodui sa a nan Supabase?")) {
      const productToDelete = allProducts.find(p => p.id === id);

      // Efase foto a nan Storage si li egziste
      if (productToDelete && productToDelete.image.includes('product-images')) {
        await deleteProductImage(productToDelete.image);
      }

      const success = await deleteProductFromDb(id);
      if (success) {
        addToast("Pwodui efase!");
      } else {
        addToast("Erè nan efasman", "error");
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductNameInput(product.name);
    setProductPriceInput(product.price.toString());
    setProductCategoryInput(product.category);
    setProductDescInput(product.description);
    setImagePreview(product.image);
    setProductSupplierNameInput(product.supplierName || '');
    setProductSupplierContactInput(product.supplierContact || '');
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProductNameInput('');
    setProductPriceInput('');
    setProductCategoryInput('Shop');
    setProductDescInput('');
    setImagePreview(null);
    setProductSupplierNameInput('');
    setProductSupplierContactInput('');
    setIsModalOpen(true);
  };

  const handleAiDescribe = async () => {
    if (!productNameInput) {
      addToast("Antre non pwodui a dabò", "error");
      return;
    }
    setIsGeneratingDesc(true);
    const desc = await generateProductDescription(productNameInput, productCategoryInput);
    setProductDescInput(desc);
    setIsGeneratingDesc(false);
    addToast("Deskripsyon jenere pa IA!", "info");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verifye si se yon imaj
    if (!file.type.startsWith('image/')) {
      addToast("Tanpri chwazi yon foto (JPG, PNG, etc.)", "error");
      return;
    }

    // Verifye gwosè fichye a (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast("Foto a twò gwo! Maximum 5MB", "error");
      return;
    }

    // Montre preview imedyatman
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);

    // Upload nan Supabase Storage
    setIsUploadingImage(true);
    setUploadProgress(0);

    try {
      // Simile pwogresyon (paske Supabase pa bay pwogresyon reyèl)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const imageUrl = await uploadProductImage(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (imageUrl) {
        setImagePreview(imageUrl);
        addToast("✅ Foto upload avèk siksè!", "success");
      } else {
        addToast("❌ Erè pandan upload foto a", "error");
      }
    } catch (error) {
      console.error("Erè upload:", error);
      addToast("❌ Erè pandan upload foto a", "error");
    } finally {
      setIsUploadingImage(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };


  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name: productNameInput,
      price: Number(productPriceInput),
      category: productCategoryInput,
      description: productDescInput,
      image: imagePreview || `https://picsum.photos/seed/${Date.now()}/400/400`,
      supplierName: productSupplierNameInput,
      supplierContact: productSupplierContactInput
    } as Product;

    let success = false;
    if (editingProduct) {
      // Si nou chanje foto a, efase ansyen an
      if (editingProduct.image !== imagePreview && editingProduct.image.includes('product-images')) {
        await deleteProductImage(editingProduct.image);
      }
      success = await updateProductInDb(editingProduct.id, productData);
    } else {
      success = await addProductToDb(productData);
    }

    if (success) {
      addToast(editingProduct ? "Mizajou fèt!" : "Pwodui ajoute!");
      setIsModalOpen(false);
    } else {
      addToast("Erè koneksyon ak Supabase", "error");
    }
  };

  useEffect(() => {
    const fetchAdvice = async () => {
      if (cart.length > 0 || allProducts.length > 0) {
        const res = await getShoppingAdvice(cartTotal, allProducts);
        setAdvice(res);
      }
    };
    fetchAdvice();
  }, [cartTotal]);

  return (
    <>
      {showAdminPanel ? (
        <AdminPanel
          products={allProducts}
          setProducts={setAllProducts}
          whatsappNumber={whatsappNumber}
          setWhatsappNumber={setWhatsappNumber}
          onClose={() => setShowAdminPanel(false)}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onAddProduct={handleOpenAddModal}
          totalStockValue={totalStockValue}
          currentBanner={currentBanner}
          dbCategories={dynamicCategories}
        />
      ) : (
        <div className="min-h-screen bg-[#FAFAFF] pb-24 font-sans selection:bg-indigo-100">
          {/* Toasts */}
          <div className="fixed top-24 right-4 z-[300] flex flex-col gap-2 pointer-events-none">
            {toasts.map(toast => (
              <div key={toast.id} className={`px-6 py-4 rounded-2xl shadow-2xl pointer-events-auto animate-in slide-in-from-right duration-300 flex items-center gap-3 border ${toast.type === 'success' ? 'bg-white border-green-100 text-green-600' :
                toast.type === 'error' ? 'bg-white border-red-100 text-red-600' : 'bg-white border-indigo-100 text-indigo-600'
                }`}>
                <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : toast.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info'}`}></i>
                <span className="font-bold text-sm">{toast.message}</span>
              </div>
            ))}
          </div>

          <header className="bg-white/90 backdrop-blur-xl shadow-sm sticky top-0 z-[100] border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setSelectedCategory('All'); setSearchTerm(''); }}>
                <img src={logo} alt="Boutik Paw Logo" className="w-12 h-12 rounded-2xl object-cover shadow-lg shadow-indigo-200 rotate-3 group-hover:rotate-0 transition-transform" />
                <div className="hidden sm:block">
                  <h1 className="text-xl font-black text-gray-900 leading-none">Boutik Paw</h1>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-indigo-500 font-black">Ayiti Premium</span>
                </div>
              </div>

              <div className="flex-1 max-w-lg mx-8 relative hidden lg:block">
                <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"></i>
                <input
                  type="text"
                  placeholder="Chache yon pwodui..."
                  className="w-full bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl py-3.5 pl-14 pr-6 focus:ring-2 focus:ring-indigo-600 focus:bg-white text-sm outline-none transition-all shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => isAdminMode ? setShowAdminPanel(true) : setIsAuthModalOpen(true)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isAdminMode ? 'bg-indigo-900 text-white shadow-indigo-200 shadow-lg' : 'bg-gray-50 text-gray-400 hover:text-indigo-600'}`}
                >
                  <i className={`fa-solid ${isAdminMode ? 'fa-user-shield' : 'fa-lock'}`}></i>
                </button>
                <button onClick={() => setIsCartOpen(true)} className="relative h-12 px-6 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-3 border border-indigo-100 group">
                  <i className="fa-solid fa-bag-shopping text-xl"></i>
                  <span className="font-black text-sm">{cartTotal.toLocaleString()} G</span>
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-white animate-bounce">
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* Auth Modal */}
          {isAuthModalOpen && (
            <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setIsAuthModalOpen(false)}></div>
              <div className={`relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-10 text-center ${authError ? 'animate-shake' : 'animate-in zoom-in duration-300'}`}>
                <h2 className="text-2xl font-black mb-6">Mòd Admin</h2>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (passwordInput === ADMIN_PASSWORD) {
                    setIsAdminMode(true);
                    setShowAdminPanel(true);
                    setIsAuthModalOpen(false);
                    addToast("Byenveni Boss!");
                  } else {
                    setAuthError(true);
                    setTimeout(() => setAuthError(false), 500);
                  }
                }}>
                  <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="****" className="w-full bg-gray-50 border-none ring-2 ring-gray-100 focus:ring-indigo-600 py-4 rounded-2xl text-center text-3xl tracking-widest outline-none mb-4" />
                  <button className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all">Deboke</button>
                </form>
              </div>
            </div>
          )}

          {/* AI Assistant Chat */}
          <div className="fixed bottom-8 right-8 z-[150] flex flex-col items-end gap-4">
            {isAiOpen && (
              <div className="w-80 h-[450px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
                <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <i className="fa-solid fa-robot"></i>
                    </div>
                    <div>
                      <h4 className="font-black text-sm">Boutik Assistant</h4>
                      <span className="text-[10px] text-indigo-200">En liy • IA</span>
                    </div>
                  </div>
                  <button onClick={() => setIsAiOpen(false)} className="text-white/60 hover:text-white transition-colors">
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>

                <div ref={aiScrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                  {aiHistory.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-xs text-gray-400 font-bold mb-2">Bonjou! Kijan m ka ede w jwenn sa w bezwen an jodi a?</p>
                    </div>
                  )}
                  {aiHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm font-medium ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white shadow-sm text-gray-800 rounded-tl-none border border-gray-100'
                        }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white px-4 py-3 rounded-2xl shadow-sm text-gray-400 text-xs animate-pulse">
                        M'ap reflechi...
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleAiChat} className="p-4 bg-white border-t">
                  <div className="relative">
                    <input
                      type="text"
                      value={aiMessage}
                      onChange={e => setAiMessage(e.target.value)}
                      placeholder="Poze yon kesyon..."
                      className="w-full bg-gray-50 rounded-xl py-3 pl-4 pr-12 text-sm border-none focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                    />
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-800 p-2">
                      <i className="fa-solid fa-paper-plane"></i>
                    </button>
                  </div>
                </form>
              </div>
            )}

            <button
              onClick={() => setIsAiOpen(!isAiOpen)}
              className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center text-2xl transition-all shadow-2xl active:scale-90 ${isAiOpen ? 'bg-gray-800 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 scale-110'
                }`}
            >
              {isAiOpen ? <i className="fa-solid fa-chevron-down"></i> : <i className="fa-solid fa-robot animate-bounce"></i>}
            </button>
          </div>

          <main className="max-w-7xl mx-auto px-4 py-8">
            {/* Banner */}
            <div className="mb-12 relative rounded-[3rem] overflow-hidden group shadow-2xl shadow-indigo-100 min-h-[400px] flex">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                style={{ backgroundImage: `url(${currentBanner?.image || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop'})` }}
              >
                <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-[2px]"></div>
              </div>
              <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 w-full">
                <div className="max-w-2xl text-white">
                  <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest mb-6">
                    {currentBanner?.subtitle || 'Boutik Paw 2026'}
                  </span>
                  <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                    {currentBanner?.title.split(',')[0] || 'Pi bon kalite'}, <br />
                    <span className="text-indigo-200 underline decoration-wavy underline-offset-8">
                      {currentBanner?.title.split(',')[1] || 'pi bon pri!'}
                    </span>
                  </h2>
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-indigo-400 flex items-center justify-center font-bold text-[10px]">{i}k+</div>)}
                    </div>
                    <p className="text-indigo-50 font-medium">{currentBanner?.promoText || 'Plis pase 4,000 moun fè nou konfyans.'}</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 w-full max-w-sm shadow-2xl">
                  <p className="text-indigo-100 italic text-lg font-medium leading-relaxed mb-4">"{advice || 'Chache sa ou bezwen an yon sèl klike!'}"</p>
                  <div className="h-1 w-20 bg-indigo-300 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-3 mb-12">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-8 py-3.5 rounded-2xl font-black transition-all border-2 ${selectedCategory === cat
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100 -translate-y-1'
                    : 'bg-white text-gray-400 border-gray-100 hover:border-indigo-200 hover:text-indigo-600'
                    }`}
                >
                  {cat === 'All' ? 'Tout Pwodui' : cat}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {isLoadingProducts ? (
                <div className="col-span-full py-24 text-center">
                  <i className="fa-solid fa-circle-notch animate-spin text-4xl text-indigo-600 mb-4"></i>
                  <p className="font-bold text-gray-400">N'ap chaje pwodui yo depi Supabase...</p>
                </div>
              ) : filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAdminMode={isAdminMode}
                  isWishlisted={wishlist.includes(product.id)}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  onDelete={handleDeleteProduct}
                  onEdit={handleEditProduct}
                  whatsappNumber={whatsappNumber}
                />
              ))}
              {!isLoadingProducts && filteredProducts.length === 0 && (
                <div className="col-span-full py-24 text-center">
                  <p className="text-gray-400 font-bold">Pa gen okenn pwodui nan kategori sa a kounye a.</p>
                </div>
              )}
            </div>
          </main>

          <Cart
            items={cart}
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            onUpdateQuantity={(id, d) => setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i))}
            onRemove={id => { setCart(prev => prev.filter(i => i.id !== id)); addToast("Retire nan panyen", "info"); }}
            whatsappNumber={whatsappNumber}
          />
        </div>
      )}

      {/* Modal Product - Visible in both views */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            <div className="bg-indigo-600 p-10 text-white flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-3xl font-black">{editingProduct ? 'Modifye Pwodui' : 'Pwodui Nèf'}</h2>
                <p className="text-indigo-100 text-sm">Supabase ap estoke done sa yo kounye a.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 transition-colors flex items-center justify-center"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleSaveProduct} className="flex flex-col overflow-hidden h-full">
              <div className="p-10 space-y-6 overflow-y-auto flex-1">
                <div onClick={() => !isUploadingImage && fileInputRef.current?.click()} className={`w-full aspect-video rounded-3xl border-4 border-dashed border-indigo-50 flex flex-col items-center justify-center overflow-hidden relative transition-all group shrink-0 ${isUploadingImage ? 'cursor-wait' : 'cursor-pointer hover:bg-indigo-50'}`}>
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} className="w-full h-full object-cover" />
                      {!isUploadingImage && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white font-bold text-sm">Klike pou chanje foto a</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center">
                      <i className="fa-solid fa-cloud-arrow-up text-4xl text-indigo-200 mb-3 group-hover:scale-110 transition-transform"></i>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Klike pou chwazi foto</p>
                      <p className="text-[10px] text-gray-300 mt-1">JPG, PNG oswa GIF (Max 5MB)</p>
                    </div>
                  )}
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-indigo-600/90 flex flex-col items-center justify-center">
                      <i className="fa-solid fa-spinner animate-spin text-white text-4xl mb-3"></i>
                      <p className="text-white font-bold">Upload foto... {uploadProgress}%</p>
                      <div className="w-3/4 h-2 bg-white/20 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-white transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploadingImage}
                  />
                </div>

                <div className="space-y-4">
                  <input value={productNameInput} onChange={e => setProductNameInput(e.target.value)} required placeholder="Non Pwodui" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-indigo-600 outline-none font-bold" />
                  <div className="grid grid-cols-2 gap-4">
                    <input value={productPriceInput} onChange={e => setProductPriceInput(e.target.value)} required type="number" placeholder="Pri (Gdes)" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-indigo-600 outline-none font-bold" />
                    <select value={productCategoryInput} onChange={e => setProductCategoryInput(e.target.value as Category)} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-indigo-600 outline-none font-bold">
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="relative">
                    <textarea value={productDescInput} onChange={e => setProductDescInput(e.target.value)} placeholder="Deskripsyon..." className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-indigo-600 outline-none h-32 resize-none font-medium text-sm" />
                    <button type="button" onClick={handleAiDescribe} disabled={isGeneratingDesc} className="absolute bottom-4 right-4 bg-indigo-600 text-white text-[10px] font-black px-4 py-2 rounded-full shadow-lg hover:bg-indigo-700 disabled:bg-gray-400 flex items-center gap-2 transition-all">
                      {isGeneratingDesc ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                      {isGeneratingDesc ? 'IA ap travay...' : 'AI DESC'}
                    </button>
                  </div>
                </div>

                <div className="bg-indigo-50/50 p-6 rounded-3xl space-y-4 border border-indigo-100">
                  <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-truck-ramp-box"></i> Enfòmasyon Founisè (Admin)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={productSupplierNameInput} onChange={e => setProductSupplierNameInput(e.target.value)} placeholder="Non Founisè" className="w-full px-6 py-4 rounded-2xl bg-white border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-sm" />
                    <input value={productSupplierContactInput} onChange={e => setProductSupplierContactInput(e.target.value)} placeholder="Kontak (WhatsApp...)" className="w-full px-6 py-4 rounded-2xl bg-white border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-sm" />
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium">Enfòmasyon sa yo sèlman vizib pou ou nan lis pwodui yo nan Admin.</p>
                </div>
              </div>

              <div className="p-10 pt-0">
                <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95 text-lg">
                  {editingProduct ? 'ANREXISTRE SOU SUPABASE' : 'KONFIME SOU SUPABASE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
