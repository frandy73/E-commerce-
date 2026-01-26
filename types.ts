
export type Category = string;

export interface DbCategory {
  id: number;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  description: string;
  image: string;
  isCustom?: boolean;
  supplierName?: string;
  supplierContact?: string;
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

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  promoText: string;
  buttonText: string;
  image: string;
}
