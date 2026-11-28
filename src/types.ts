export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  category: Category;
  image: string;
  gallery?: string[];
  sizes?: string[];
  colors?: string[];
  featured?: boolean;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
};

export type Review = {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title?: string;
  body: string;
  createdAt: string;
};

export type CartItem = {
  productId: string;
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
};

export type Order = {
  id: string;
  userId?: string;
  email: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: "pending" | "paid" | "fulfilled" | "cancelled";
  createdAt: string;
};

export type FilterState = {
  query: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  sortBy: "featured" | "newest" | "price-asc" | "price-desc";
  sizes: string[];
  colors: string[];
};

export type CheckoutForm = {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  paymentMethod: "card" | "cod";
};

export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type ProductsResponse = ApiResponse<Product[]>;
export type ProductResponse = ApiResponse<Product>;
export type ReviewsResponse = ApiResponse<Review[]>;
export type OrdersResponse = ApiResponse<Order[]>;
export type OrderResponse = ApiResponse<Order>;

export type CreateReviewPayload = {
  productId: string;
  author: string;
  rating: number;
  title?: string;
  body: string;
};

export type CreateOrderPayload = {
  email: string;
  items: OrderItem[];
  shippingAddress: CheckoutForm;
  paymentMethod: CheckoutForm["paymentMethod"];
};

export type AuthPayload = {
  email: string;
  password: string;
  name?: string;
};

export default {};