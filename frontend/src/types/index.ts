export interface Category {
  id: number;
  name: string;
  description?: string;
}


export interface Voucher {
  id: number; code: string; discountType: 'PERCENTAGE' | 'FIXED'; discountValue: number; minOrderAmount: number; expiresAt?: string; usageLimit?: number | null; usedCount: number; active: boolean; createdAt?: string;
}

export interface VoucherRequest {
  code: string; discountType: 'PERCENTAGE' | 'FIXED'; discountValue: number; minOrderAmount: number; expiresAt?: string; usageLimit?: number | null; active: boolean;
}
export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  stock: number;
  active?: boolean;
  category?: Category | null;
  categories?: Category[];
  authorId?: number | null;
  publisherId?: number | null;
  isbn?: string;
  description?: string;
  imageUrl?: string;
  rating?: number;
  reviewsCount?: number;
  publicationDate?: string;
}

export interface BookRequest {
  title: string;
  author: string;
  price: number;
  stock: number;
  categoryId?: number | null;
  categoryIds?: number[];
  authorId?: number | null;
  publisherId?: number | null;
  isbn?: string;
  description?: string;
  imageUrl?: string;
  publicationDate?: string;
}

export interface Author {
  id: number;
  name: string;
  biography?: string;
}

export interface Publisher {
  id: number;
  name: string;
  address?: string;
  website?: string;
}

export interface CartItem {
  id: number | string;
  book: Book;
  quantity: number;
}

export interface Cart {
  id?: number;
  items: CartItem[];
}

export interface OrderItem {
  id?: number;
  book?: Book;
  bookId?: number;
  quantity: number;
  unitPrice?: number;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED';

export type ShippingMethod = 'STANDARD' | 'EXPRESS' | 'SAME_DAY';
export type PaymentMethod = 'COD' | 'BANK' | 'MOMO' | 'VNPAY' | 'CARD';

export interface Order {
  id: number;
  trackingCode?: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  shippingFee?: number;
  discountAmount?: number;
  shippingMethod?: ShippingMethod | string;
  couponCode?: string;
  note?: string;
  status: OrderStatus | string;
  createdAt: string;
  shippingAddress?: string;
  phone?: string;
  items?: OrderItem[];
}

export interface CreateOrderRequest {
  customerName: string;
  customerEmail: string;
  shippingAddress?: string;
  phone?: string;
  note?: string;
  shippingFee: number;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  items: { bookId: number; quantity: number }[];
  couponCode?: string;
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'CUSTOMER' | 'ADMIN' | string;
  createdAt?: string;
}

export interface WishlistItem {
  id: number;
  book: Book;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
}

export interface Review {
  id: number;
  userId?: number;
  bookId: number;
  rating: number;
  comment?: string;
  createdAt?: string;
  userName?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}
