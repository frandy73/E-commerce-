
import React, { useState } from 'react';
import { CartItem, OrderDetails, PastOrder } from '../types';
import logo from '../logo.jpg';

interface CartProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  whatsappNumber: string;
}

export const Cart: React.FC<CartProps> = ({ items, isOpen, onClose, onUpdateQuantity, onRemove, whatsappNumber }) => {
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    customerName: '',
    address: '',
    phone: '',
  });
  const [showWarning, setShowWarning] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSendWhatsApp = () => {
    if (!orderDetails.customerName || !orderDetails.address || !orderDetails.phone) {
      setShowWarning(true);
      return;
    }

    const history: PastOrder[] = JSON.parse(localStorage.getItem('quickorder_history') || '[]');
    const newOrder: PastOrder = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: [...items],
      total: total
    };
    localStorage.setItem('quickorder_history', JSON.stringify([newOrder, ...history]));

    let message = `*📦 NOUVÈL KÒMAND - BOUTIK PAW*\n\n`;
    message += `👤 *Kliyan:* ${orderDetails.customerName}\n`;
    message += `📍 *Livrezon:* ${orderDetails.address}\n`;
    message += `📞 *Tel:* ${orderDetails.phone}\n\n`;
    message += `🛒 *Panyen:*\n`;

    items.forEach(item => {
      message += `• ${item.name} (${item.quantity}x) : *${(item.price * item.quantity).toLocaleString()} G*\n`;
    });

    message += `\n---`;
    message += `\n💰 *TOTAL POU PEYE:* *${total.toLocaleString()} Gdes*`;
    message += `\n\n_Voye mesaj sa a kounye a pou nou ka kòmanse prepare kòmand ou an!_`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[200] overflow-hidden">
        <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-md transition-opacity" onClick={onClose}></div>
        <div className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl flex flex-col transform transition-transform duration-500 ease-out border-l border-gray-100">

          {/* Header */}
          <div className="p-8 border-b flex justify-between items-center bg-indigo-600 text-white shrink-0">
            <div>
              <h2 className="text-2xl font-black flex items-center gap-3">
                <i className={`fa-solid ${step === 'cart' ? 'fa-bag-shopping' : 'fa-truck-fast'}`}></i>
                {step === 'cart' ? 'Panyen Ou' : 'Livrezon'}
              </h2>
              <p className="text-indigo-100 text-xs font-medium mt-1">
                {items.length} atik • {total.toLocaleString()} Gdes
              </p>
            </div>
            <button onClick={onClose} className="w-12 h-12 rounded-2xl hover:bg-white/20 transition-colors flex items-center justify-center">
              <i className="fa-solid fa-xmark text-2xl"></i>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {items.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-32 h-32 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 rotate-3 shadow-inner">
                  <i className="fa-solid fa-cart-plus text-5xl text-gray-200"></i>
                </div>
                <p className="text-gray-400 font-bold text-lg mb-2">Panyen ou vid nèt!</p>
                <p className="text-gray-300 text-sm mb-8">Al chèche sa ou renmen yo kounye a.</p>
                <button onClick={onClose} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Kòmanse Achte</button>
              </div>
            ) : step === 'cart' ? (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-6 p-4 rounded-3xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                    <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-black text-gray-800 text-base leading-tight mb-1">{item.name}</h4>
                        <p className="text-indigo-600 font-black text-sm">{item.price.toLocaleString()} G</p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                          <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-600">-</button>
                          <span className="w-10 text-center font-black text-gray-800">{item.quantity}</span>
                          <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-600">+</button>
                        </div>
                        <button onClick={() => onRemove(item.id)} className="text-red-400 hover:text-red-600 p-2 transition-colors">
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Kiyès k'ap kòmande?</label>
                  <div className="relative">
                    <i className="fa-solid fa-user absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"></i>
                    <input
                      type="text"
                      placeholder="Non konplè ou"
                      className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none font-bold transition-all"
                      value={orderDetails.customerName}
                      onChange={(e) => setOrderDetails({ ...orderDetails, customerName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Ki kote pou n pote l?</label>
                  <div className="relative">
                    <i className="fa-solid fa-location-dot absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"></i>
                    <input
                      type="text"
                      placeholder="Adrès livrezon (Ri, Vil...)"
                      className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none font-bold transition-all"
                      value={orderDetails.address}
                      onChange={(e) => setOrderDetails({ ...orderDetails, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Ki nimewo n'ap ka jwenn ou?</label>
                  <div className="relative">
                    <i className="fa-solid fa-phone absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"></i>
                    <input
                      type="tel"
                      placeholder="Nimewo telefòn (WhatsApp)"
                      className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none font-bold transition-all"
                      value={orderDetails.phone}
                      onChange={(e) => setOrderDetails({ ...orderDetails, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex gap-4">
                  <i className="fa-solid fa-circle-info text-amber-500 mt-1"></i>
                  <p className="text-amber-800 text-xs font-medium leading-relaxed">
                    Lè w klike sou bouton an, sa pral louvri WhatsApp ou otomatikman pou w ka konfime kòmand la ak ajan nou yo.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-8 bg-gray-50 border-t shrink-0 space-y-6">
              <div className="flex justify-between items-center px-2">
                <span className="text-gray-400 font-black text-xs uppercase tracking-[0.2em]">Total Final</span>
                <span className="text-3xl font-black text-gray-900">{total.toLocaleString()} G</span>
              </div>

              <div className="flex gap-4">
                {step === 'checkout' && (
                  <button
                    onClick={() => setStep('cart')}
                    className="w-16 h-16 bg-white border border-gray-200 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-gray-100 transition-all active:scale-90"
                  >
                    <i className="fa-solid fa-arrow-left"></i>
                  </button>
                )}
                <button
                  onClick={step === 'cart' ? () => setStep('checkout') : handleSendWhatsApp}
                  className={`flex-1 h-16 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 text-lg ${step === 'cart'
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                    : 'bg-[#25D366] text-white hover:bg-[#128C7E] shadow-green-100'
                    }`}
                >
                  {step === 'cart' ? (
                    <>PASER KÒMAND <i className="fa-solid fa-arrow-right"></i></>
                  ) : (
                    <><i className="fa-brands fa-whatsapp text-2xl"></i> VOYE SOU WHATSAPP</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {
        showWarning && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowWarning(false)}></div>
            <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full relative z-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-200 shadow-2xl">
              <img src={logo} alt="Boutik Paw" className="w-24 h-24 rounded-3xl object-cover shadow-xl shadow-indigo-100 mb-6 rotate-3" />
              <h3 className="text-2xl font-black text-gray-900 mb-2">Ops!</h3>
              <p className="text-gray-500 font-medium mb-8 leading-relaxed">Silvouplè, ranpli tout enfòmasyon yo pou nou ka livre kòmand ou an san pwoblèm.</p>
              <button onClick={() => setShowWarning(false)} className="bg-indigo-600 text-white w-full py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95">
                Ok, Mwen Konprann
              </button>
            </div>
          </div>
        )
      }
    </>
  );
};
