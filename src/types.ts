export type ProductCategory = 'tailoring' | 'outerwear' | 'knitwear' | 'shirts' | 'trousers' | 'accessories';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number | null;
  category: ProductCategory | string;
  collection?: string;
  image: string;
  images?: string[];
  color?: string;
  size?: string[];
  material?: string;
  inStock?: boolean;
  featured?: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug?: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  role?: 'customer' | 'admin';
  createdAt?: string;
}

export interface Address {
  id: string;
  userId?: string;
  fullName: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string | null;
  isDefault?: boolean;
}

export interface OrderItem {
  id: string;
  orderId?: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string | null;
  color?: string | null;
}

export interface Order {
  id: string;
  userId?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress?: Address | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId?: string;
  userName?: string;
  rating: number;
  title?: string;
  body: string;
  createdAt?: string;
}

export interface ProductFilters {
  query?: string;
  category?: string;
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating';
  inStock?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface CartPayload {
  productId: string;
  quantity?: number;
  size?: string;
  color?: string;
}

export interface CheckoutPayload {
  items: CartItem[];
  address: Address;
  email: string;
  phone?: string;
}

export interface AuthPayload {
  email: string;
  password: string;
  name?: string;
}

export default Product;