export type ID = string;

export interface ProductImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface Product {
  id: ID;
  slug: string;
  name: string;
  description: string;
  price: number;
  currency?: string;
  category: string;
  collection?: string;
  material?: string;
  color?: string;
  sizes?: string[];
  images: ProductImage[];
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
  userId: ID;
  userName: string;
  rating: number;
  title?: string;
  body: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: ID;
  productId: ID;
  product?: Product;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  addedAt?: string;
}

export interface ShippingAddress {
  fullName: string;
  email?: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: ID;
  userId?: ID;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  currency?: string;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: ID;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  role?: "customer" | "admin";
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface ProductListParams {
  query?: string;
  category?: string;
  collection?: string;
  sort?: "featured" | "newest" | "price-asc" | "price-desc";
  page?: number;
  limit?: number;
}

export interface CreateReviewPayload {
  productId: ID;
  rating: number;
  title?: string;
  body: string;
}

export interface CreateOrderPayload {
  items: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod?: string;
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
}

export default {} as const;