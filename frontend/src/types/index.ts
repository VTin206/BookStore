export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  stock: number;
  category?: Category | null;
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

export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  shippingFee?: number;
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
  paymentMethod: 'COD' | 'BANK' | 'CARD';
  items: { bookId: number; quantity: number }[];
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
