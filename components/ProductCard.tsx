
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onDelete?: (id: string) => void;
  onEdit?: (product: Product) => void;
  onToggleWishlist: (id: string) => void;
  isWishlisted: boolean;
  isAdminMode: boolean;
  whatsappNumber: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  onDelete, 
  onEdit,
  onToggleWishlist,
  isWishlisted,
  isAdminMode,
  whatsappNumber
}) => {
  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    let message = `*Boutik Paw Ayiti - Achte Kounye a*\n\n`;
    message += `Mwen enterese nan pwodui sa a :\n`;
    message += `- *${product.name}*\n`;
    message += `- Pri : *${product.price.toLocaleString()} Gdes*\n\n`;
    message += `Silvouplè, kontakte mwen pou m ka finalize kòmand la.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="group bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 relative flex flex-col h-full animate-in fade-in zoom-in duration-500">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute top-5 left-5">
          <div className="bg-white/90 backdrop-blur-md text-indigo-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm border border-indigo-50">
            {product.category}
          </div>
        </div>
        
        <div className="absolute top-5 right-5 flex flex-col gap-3 z-10 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-xl ${
              isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'
            }`}
          >
            <i className={`fa-solid fa-heart ${isWishlisted ? 'animate-bounce' : ''}`}></i>
          </button>
          
          {isAdminMode && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit?.(product); }}
                className="w-10 h-10 rounded-2xl bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all shadow-xl"
                title="Modifye pwodui"
              >
                <i className="fa-solid fa-pen-to-square"></i>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete?.(product.id); }}
                className="w-10 h-10 rounded-2xl bg-white text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-xl"
                title="Efase pwodui"
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="p-8 flex flex-col flex-1">
        <div className="mb-4">
          <h3 className="font-black text-gray-900 text-xl mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-400 text-xs font-medium line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
        
        <div className="mt-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest">Pri Boutik</span>
              <span className="text-2xl font-black text-gray-900">{product.price.toLocaleString()}<span className="text-sm ml-1 text-indigo-500 font-bold">G</span></span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
              className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white w-14 h-14 rounded-2xl transition-all flex items-center justify-center active:scale-90 group/btn shadow-inner"
            >
              <i className="fa-solid fa-plus text-xl group-hover/btn:rotate-90 transition-transform"></i>
            </button>
          </div>

          <button 
            onClick={handleBuyNow}
            className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-100 active:scale-95 text-sm uppercase tracking-widest"
          >
            <i className="fa-brands fa-whatsapp text-xl"></i>
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
