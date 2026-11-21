export type CurrencyCode = 'INR' | 'USD' | 'EUR';

export interface ProductImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface ProductVariant {
  id: string;
  label: string;
  sku?: string;
  price?: number;
  stock?: number;
  color?: string;
  size?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description?: string;
  category: string;
  collection?: string;
  price: number;
  compareAtPrice?: number;
  currency?: CurrencyCode;
  stock: number;
  rating?: number;
  reviewCount?: number;
  featured?: boolean;
  images: ProductImage[];
  variants?: ProductVariant[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewAuthor {
  id?: string;
  name: string;
  avatarUrl?: string;
}

export interface Review {
  id: string;
  productId: string;
  author: ReviewAuthor;
  rating: number;
  title?: string;
  body: string;
  createdAt: string;
  verifiedPurchase?: boolean;
}

export interface Address {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  currency?: CurrencyCode;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
  stock?: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
}

export interface Order {
  id: string;
  userId?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax?: number;
  total: number;
  currency?: CurrencyCode;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  billingAddress?: Address;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

export interface CheckoutFormValues {
  email: string;
  phone?: string;
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: 'card' | 'upi' | 'cod';
  saveAddress?: boolean;
  agreeToTerms: boolean;
}

export interface FilterState {
  query: string;
  categories: string[];
  collections: string[];
  priceMin?: number;
  priceMax?: number;
  inStockOnly: boolean;
  featuredOnly: boolean;
  sortBy: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating';
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ProductsResponse extends ApiResponse<Product[]> {}
export interface ProductResponse extends ApiResponse<Product> {}
export interface ReviewsResponse extends ApiResponse<Review[]> {}
export interface OrdersResponse extends ApiResponse<Order[]> {}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: 'customer' | 'admin';
  createdAt?: string;
}

export interface SessionPayload {
  user: AuthUser | null;
  expiresAt?: string;
}

export interface CreateOrderPayload {
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  email: string;
  phone?: string;
  paymentMethod: CheckoutFormValues['paymentMethod'];
  notes?: string;
}

export interface UpdateCartItemPayload {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface StockMap {
  [productId: string]: number;
}

export default {};