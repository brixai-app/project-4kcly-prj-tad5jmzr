export type ID = string;

export type ProductCategory =
  | 'Outerwear'
  | 'Dresses'
  | 'Tailoring'
  | 'Knitwear'
  | 'Accessories'
  | 'Footwear'
  | 'Shirts'
  | 'Trousers';

export type Product = {
  id: ID;
  slug: string;
  name: string;
  category: ProductCategory | string;
  price: number;
  currency?: string;
  description?: string;
  image: string;
  gallery?: string[];
  sizes?: string[];
  colors?: string[];
  material?: string;
  inStock?: boolean;
  featured?: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Review = {
  id: ID;
  productId: ID;
  userId?: ID;
  userName: string;
  rating: number;
  title?: string;
  body: string;
  createdAt: string;
  updatedAt?: string;
};

export type CartItem = {
  productId: ID;
  product?: Product;
  quantity: number;
  size?: string;
  color?: string;
};

export type OrderItem = {
  productId: ID;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
};

export type Order = {
  id: ID;
  userId?: ID;
  email: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax?: number;
  total: number;
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled';
  shippingAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
};

export type UserProfile = {
  id: ID;
  name?: string;
  email: string;
  image?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type FilterState = {
  query: string;
  categories: string[];
  sizes: string[];
  colors: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating';
};

export type CheckoutPayload = {
  email: string;
  items: CartItem[];
  shippingAddress: string;
  notes?: string;
};

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
};

export type ProductsResponse = ApiResponse<Product[]>;
export type ProductResponse = ApiResponse<Product>;
export type ReviewsResponse = ApiResponse<Review[]>;
export type ReviewResponse = ApiResponse<Review>;
export type OrdersResponse = ApiResponse<Order[]>;
export type OrderResponse = ApiResponse<Order>;
export type UserResponse = ApiResponse<UserProfile>;

export type AuthPayload = {
  email: string;
  password: string;
  name?: string;
};

export type SessionUser = {
  id: ID;
  email: string;
  name?: string;
  image?: string;
};

export type SessionState = {
  user?: SessionUser | null;
  isAuthenticated: boolean;
};

export default {};