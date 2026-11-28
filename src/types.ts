export type ID = string;

export interface ProductImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface Product {
  id: ID;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  compareAtPrice?: number | null;
  currency?: string;
  category?: string;
  collection?: string;
  material?: string;
  color?: string;
  sizes?: string[];
  images?: ProductImage[];
  image?: string;
  featured?: boolean;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: ID;
  productId: ID;
  userId?: ID;
  userName?: string;
  rating: number;
  title?: string;
  body?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: ID;
  productId: ID;
  product?: Product;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
}

export interface OrderItem {
  productId: ID;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
}

export interface Order {
  id: ID;
  userId?: ID;
  items: OrderItem[];
  subtotal: number;
  shipping?: number;
  tax?: number;
  total: number;
  status?: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus?: "unpaid" | "authorized" | "paid" | "refunded";
  shippingAddress?: Address;
  billingAddress?: Address;
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

export interface UserProfile {
  id: ID;
  name?: string;
  email?: string;
  avatarUrl?: string;
  role?: "customer" | "admin" | "editor";
  phone?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FilterState {
  query?: string;
  category?: string;
  collection?: string;
  color?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "featured" | "newest" | "price-asc" | "price-desc" | "rating";
}

export interface CheckoutAddressPayload {
  name?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface CheckoutPayload {
  items: Array<{
    productId: ID;
    quantity: number;
    size?: string;
    color?: string;
  }>;
  shippingAddress: CheckoutAddressPayload;
  billingAddress?: CheckoutAddressPayload;
  email: string;
  notes?: string;
  paymentMethod?: "card" | "cod" | "upi";
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface AuthPayload {
  email: string;
  password: string;
  name?: string;
}

export interface SessionUser {
  id: ID;
  name?: string;
  email?: string;
  image?: string;
  role?: "customer" | "admin" | "editor";
}

export interface CatalogQuery {
  search?: string;
  category?: string;
  collection?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export default Product;