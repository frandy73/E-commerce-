
export type Category = 'Ebook' | 'Electronic' | 'Shop' | 'Provisions' | 'All';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  description: string;
  image: string;
  isCustom?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderDetails {
  customerName: string;
  address: string;
  phone: string;
}

export interface PastOrder {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
}
