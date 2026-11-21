export type ProductVariant = {
  id: string;
  name: string;
  sku?: string;
  price: number;
  compareAtPrice?: number | null;
  color?: string | null;
  size?: string | null;
  stock?: number;
  image?: string | null;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  category?: string;
  collection?: string;
  price: number;
  compareAtPrice?: number | null;
  currency?: string;
  images: string[];
  variants?: ProductVariant[];
  featured?: boolean;
  inStock?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type CartItem = {
  productId: string;
  variantId?: string | null;
  name: string;
  image?: string | null;
  price: number;
  quantity: number;
  color?: string | null;
  size?: string | null;
};

export type OrderItem = {
  productId: string;
  variantId?: string | null;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
};

export type Order = {
  id: string;
  userId?: string | null;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency?: string;
  status: "pending" | "paid" | "fulfilled" | "cancelled";
  shippingAddress?: Address | null;
  billingAddress?: Address | null;
  createdAt: string;
  updatedAt?: string;
};

export type UserProfile = {
  id: string;
  name?: string | null;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role?: "customer" | "admin";
  createdAt?: string;
};

export type Address = {
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
  country: string;
};

export type CheckoutForm = {
  email: string;
  name: string;
  phone?: string;
  shippingAddress: Address;
  billingAddress?: Address;
  notes?: string;
};

export type FilterState = {
  query: string;
  categories: string[];
  collections: string[];
  minPrice?: number | null;
  maxPrice?: number | null;
  inStockOnly: boolean;
  featuredOnly: boolean;
  sortBy: "featured" | "newest" | "price-asc" | "price-desc";
};

export type ApiResponse<T> = {
  data: T;
  message?: string;
  error?: string;
};

export type ProductsResponse = ApiResponse<Product[]>;
export type ProductResponse = ApiResponse<Product>;
export type OrdersResponse = ApiResponse<Order[]>;
export type OrderResponse = ApiResponse<Order>;
export type UserResponse = ApiResponse<UserProfile>;
export type CheckoutResponse = ApiResponse<{ orderId: string; paymentUrl?: string | null }>;

export type AuthPayload = {
  email: string;
  password: string;
  name?: string;
};

export type CartPayload = {
  items: CartItem[];
};

export default Product;