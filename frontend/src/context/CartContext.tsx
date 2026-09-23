import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Book } from '../types';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  addToCart: (book: Book, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: number | string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number | string) => Promise<void>;
  clearCart: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => cartService.getLocalCart());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();

  // Load from backend if logged in, otherwise local storage
  const refreshCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        setIsLoading(true);
        const remoteCart = await cartService.getRemoteCart();
        if (remoteCart && remoteCart.items) {
          setItems(remoteCart.items);
          cartService.setLocalCart(remoteCart.items);
        }
      } catch {
        // Fallback to local
        setItems(cartService.getLocalCart());
      } finally {
        setIsLoading(false);
      }
    } else {
      setItems(cartService.getLocalCart());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Persist to local cart whenever items change
  useEffect(() => {
    cartService.setLocalCart(items);
  }, [items]);

  const addToCart = async (book: Book, quantity: number = 1) => {
    if (book.stock <= 0) {
      error(`Sách "${book.title}" hiện đã hết hàng.`);
      return;
    }

    try {
      if (isAuthenticated) {
        try {
          await cartService.addToRemoteCart(book.id, quantity);
          await refreshCart();
          success(`Đã thêm "${book.title}" vào giỏ hàng!`);
          return;
        } catch {
          // If remote fails, fallback to local update
        }
      }

      // Local update
      setItems((prev) => {
        const existingIndex = prev.findIndex((i) => i.book.id === book.id);
        if (existingIndex > -1) {
          const updated = [...prev];
          const newQty = updated[existingIndex].quantity + quantity;
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: Math.min(newQty, book.stock || newQty),
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: `local-${book.id}-${Date.now()}`,
              book,
              quantity: Math.min(quantity, book.stock || quantity),
            },
          ];
        }
      });
      success(`Đã thêm "${book.title}" vào giỏ hàng!`);
    } catch {
      error('Không thể thêm sách vào giỏ hàng.');
    }
  };

  const updateQuantity = async (cartItemId: number | string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId || item.book.id === cartItemId) {
          const maxStock = item.book.stock || 999;
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  };

  const removeFromCart = async (cartItemId: number | string) => {
    try {
      if (isAuthenticated && typeof cartItemId === 'number') {
        try {
          await cartService.removeFromRemoteCart(cartItemId);
        } catch {
          // continue to remove locally
        }
      }
      setItems((prev) => prev.filter((item) => item.id !== cartItemId && item.book.id !== cartItemId));
      success('Đã xóa sách khỏi giỏ hàng.');
    } catch {
      error('Không thể xóa sản phẩm khỏi giỏ.');
    }
  };

  const clearCart = () => {
    setItems([]);
    cartService.clearLocalCart();
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + Number(item.book.price) * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalAmount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
