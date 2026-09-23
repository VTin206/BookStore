import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Customer Pages
import { HomePage } from './pages/customer/HomePage';
import { BookListPage } from './pages/customer/BookListPage';
import { BookDetailPage } from './pages/customer/BookDetailPage';
import { CartPage } from './pages/customer/CartPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrderSuccessPage } from './pages/customer/OrderSuccessPage';
import { OrderHistoryPage } from './pages/customer/OrderHistoryPage';
import { ProfilePage } from './pages/customer/ProfilePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminBooksPage } from './pages/admin/AdminBooksPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminAuthorsPublishersPage } from './pages/admin/AdminAuthorsPublishersPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Customer Facing Routes */}
            <Route
              path="/"
              element={
                <CustomerLayout>
                  <HomePage />
                </CustomerLayout>
              }
            />
            <Route
              path="/books"
              element={
                <CustomerLayout>
                  <BookListPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/books/:id"
              element={
                <CustomerLayout>
                  <BookDetailPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/cart"
              element={
                <CustomerLayout>
                  <CartPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/checkout"
              element={
                <CustomerLayout>
                  <CheckoutPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/order-success/:id"
              element={
                <CustomerLayout>
                  <OrderSuccessPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/orders"
              element={
                <CustomerLayout>
                  <OrderHistoryPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <CustomerLayout>
                  <ProfilePage />
                </CustomerLayout>
              }
            />
            <Route
              path="/login"
              element={
                <CustomerLayout>
                  <LoginPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/register"
              element={
                <CustomerLayout>
                  <RegisterPage />
                </CustomerLayout>
              }
            />

            {/* Admin Portal Routes */}
            <Route
              path="/admin"
              element={
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/books"
              element={
                <AdminLayout>
                  <AdminBooksPage />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <AdminLayout>
                  <AdminCategoriesPage />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminLayout>
                  <AdminOrdersPage />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/authors"
              element={
                <AdminLayout>
                  <AdminAuthorsPublishersPage />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminLayout>
                  <AdminUsersPage />
                </AdminLayout>
              }
            />

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
