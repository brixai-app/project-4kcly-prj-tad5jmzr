export type ID = string;

export interface ProductImage {
  url: string;
  alt?: string;
  order?: number;
}

export interface Product {
  id: ID;
  slug: string;
  name: string;
  description?: string;
  category: string;
  collection?: string;
  price: number;
  compareAtPrice?: number | null;
  currency?: string;
  images: ProductImage[];
  sizes?: string[];
  colors?: string[];
  inStock?: boolean;
  featured?: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: ID;
  productId: ID;
  userId?: ID;
  userName: string;
  rating: number;
  title?: string;
  body: string;
  createdAt: string;
}

export interface CartItem {
  id: ID;
  productId: ID;
  product?: Product;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
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

export interface UserProfile {
  id: ID;
  email: string;
  name?: string;
  avatarUrl?: string;
  role?: "customer" | "admin";
  phone?: string;
  address?: Address;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: ID;
  productId: ID;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Order {
  id: ID;
  userId: ID;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax?: number;
  total: number;
  currency?: string;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: Address;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface ProductsResponse extends ApiResponse<Product[]> {}
export interface ProductResponse extends ApiResponse<Product> {}
export interface ReviewsResponse extends ApiResponse<Review[]> {}
export interface CartResponse extends ApiResponse<CartItem[]> {}
export interface OrdersResponse extends ApiResponse<Order[]> {}
export interface UserResponse extends ApiResponse<UserProfile> {}

export interface CreateReviewPayload {
  productId: ID;
  rating: number;
  title?: string;
  body: string;
}

export interface AddToCartPayload {
  productId: ID;
  quantity?: number;
  size?: string;
  color?: string;
}

export interface UpdateCartItemPayload {
  quantity?: number;
  size?: string;
  color?: string;
}

export interface CheckoutPayload {
  items: CartItem[];
  shippingAddress: Address;
  email: string;
}

export interface AuthPayload {
  email: string;
  password: string;
  name?: string;
}

export default Product;