
import React, { useState } from 'react';
import { Product, PastOrder, Category } from '../types';

interface AdminPanelProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  whatsappNumber: string;
  setWhatsappNumber: (num: string) => void;
  onClose: () => void;
  onEditProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddProduct: () => void;
  totalStockValue: number;
}

type AdminTab = 'dashboard' | 'products' | 'orders' | 'settings';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  setProducts,
  whatsappNumber,
  setWhatsappNumber,
  onClose,
  onEditProduct,
  onDeleteProduct,
  onAddProduct,
  totalStockValue
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [orders] = useState<PastOrder[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('quickorder_history') || '[]');
    } catch { return []; }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-HT', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-indigo-900 text-white flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-indigo-800">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <i className="fa-solid fa-user-shield"></i>
          </div>
          <div>
            <h2 className="font-black text-lg leading-none">Admin</h2>
            <span className="text-xs text-indigo-300 uppercase tracking-widest">Panel</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 shadow-lg text-white' : 'text-indigo-200 hover:bg-white/5'}`}>
            <i className="fa-solid fa-chart-pie w-6"></i>
            <span className="font-bold text-sm">Apèsi</span>
          </button>
          <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeTab === 'products' ? 'bg-indigo-600 shadow-lg text-white' : 'text-indigo-200 hover:bg-white/5'}`}>
            <i className="fa-solid fa-box w-6"></i>
            <span className="font-bold text-sm">Pwodui yo</span>
          </button>
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-indigo-600 shadow-lg text-white' : 'text-indigo-200 hover:bg-white/5'}`}>
            <i className="fa-solid fa-receipt w-6"></i>
            <span className="font-bold text-sm">Kòmand</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-indigo-600 shadow-lg text-white' : 'text-indigo-200 hover:bg-white/5'}`}>
            <i className="fa-solid fa-gear w-6"></i>
            <span className="font-bold text-sm">Anviwònman</span>
          </button>
        </nav>

        <div className="p-4 border-t border-indigo-800">
          <button onClick={onClose} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white transition-all font-bold text-sm">
            <i className="fa-solid fa-power-off"></i>
            Retounen nan Boutik
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen">
        <header className="bg-white border-b px-8 py-5 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-2xl font-black text-gray-800 capitalize">
            {activeTab === 'dashboard' ? 'Tablodbò' :
              activeTab === 'products' ? 'Jesyòn Stock' :
                activeTab === 'orders' ? 'Istorik Kòmand' : 'Paramèt'}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <i className="fa-solid fa-bell"></i>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm">
              A
            </div>
          </div>
        </header>

        <div className="p-8">

          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-xl"><i className="fa-solid fa-money-bill-wave"></i></div>
                    <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-full">+12%</span>
                  </div>
                  <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Valè Stock</p>
                  <h3 className="text-3xl font-black text-gray-900 mt-1">{totalStockValue.toLocaleString()} G</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl"><i className="fa-solid fa-box-open"></i></div>
                  </div>
                  <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Total Pwodui</p>
                  <h3 className="text-3xl font-black text-gray-900 mt-1">{products.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl"><i className="fa-solid fa-receipt"></i></div>
                  </div>
                  <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Kòmand (Lokal)</p>
                  <h3 className="text-3xl font-black text-gray-900 mt-1">{orders.length}</h3>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-[2rem] p-8 text-white flex justify-between items-center shadow-xl shadow-indigo-200">
                <div>
                  <h3 className="text-2xl font-black mb-2">Ajoute nouvo stock?</h3>
                  <p className="text-indigo-100 max-w-md text-sm">Kenbe envantè ou ajou pou kliyan yo toujou jwenn sa yo bezwen.</p>
                </div>
                <button onClick={onAddProduct} className="px-6 py-4 bg-white text-indigo-600 rounded-xl font-black shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                  <i className="fa-solid fa-plus"></i> Ajoute Pwodui
                </button>
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-700">Lis Pwodui yo</h3>
                <button onClick={onAddProduct} className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors">
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Imaj</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Non</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Kategori</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Pri</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Aksyon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                            <img src={product.image} className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-800">{product.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold uppercase">{product.category}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-indigo-600">{product.price.toLocaleString()} G</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEditProduct(product)} className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all"><i className="fa-solid fa-pen"></i></button>
                            <button onClick={() => onDeleteProduct(product.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"><i className="fa-solid fa-trash"></i></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 text-amber-800 text-sm">
                <i className="fa-solid fa-triangle-exclamation mt-0.5"></i>
                <p><strong>Remak:</strong> Sa se lis kòmand ki te pwodwi sou telefòn sa a sèlman. Piske aplikasyon an pa gen sèvè, ou pa ka wè kòmand lòt kliyan yo isit la si yo itilize pwòp telefòn pa yo.</p>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <i className="fa-solid fa-clipboard-list text-6xl mb-4 opacity-20"></i>
                  <p>Pa gen kòmand nan istorik la.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {orders.map((order, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 font-bold text-lg">
                          #{idx + 1}
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-400 uppercase mb-1">{formatDate(order.date)}</p>
                          <h4 className="font-black text-lg text-gray-800">{order.items.length} Atik</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {order.items.map(i => i.name).join(', ').substring(0, 50)}...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-gray-50 pt-4 md:pt-0">
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 uppercase font-black">Total</p>
                          <p className="text-xl font-black text-indigo-600">{order.total.toLocaleString()} G</p>
                        </div>
                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-xs font-bold">
                          <i className="fa-brands fa-whatsapp mr-2"></i>
                          Voye
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto bg-white p-8 rounded-[2.5rem] shadow-lg shadow-indigo-50 border border-gray-100 animate-in zoom-in-95 duration-500">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4">
                  <i className="fa-solid fa-sliders"></i>
                </div>
                <h2 className="text-2xl font-black text-gray-900">Konfigirasyon</h2>
                <p className="text-gray-400">Jere enfòmasyon debaz boutik ou a.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nimewo WhatsApp Biznis</label>
                  <div className="relative">
                    <i className="fa-brands fa-whatsapp absolute left-4 top-1/2 -translate-y-1/2 text-green-500 text-xl"></i>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-600 font-bold text-gray-800 outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 ml-1">Kliyan yo pral voye kòmand yo sou nimewo sa a.</p>
                </div>

                <div className="pt-4">
                  <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all active:scale-95">
                    Anrejistre
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
