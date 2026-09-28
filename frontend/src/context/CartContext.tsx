import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { isAxiosError } from 'axios';
import { CartItem, Book } from '../types';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  addToCart: (book: Book, quantity?: number) => Promise<boolean>;
  updateQuantity: (cartItemId: number | string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number | string) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => cartService.getLocalCart());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const cartMutationVersion = useRef(0);
  const { isAuthenticated, logout } = useAuth();
  const { success, error } = useToast();

  // Load from backend if logged in, otherwise local storage
  const refreshCart = useCallback(async () => {
    const startedAtVersion = cartMutationVersion.current;
    if (isAuthenticated) {
      try {
        setIsLoading(true);
        const remoteCart = await cartService.getRemoteCart();
        if (startedAtVersion === cartMutationVersion.current) {
          setItems(remoteCart.items);
          cartService.setLocalCart(remoteCart.items);
        }
      } catch {
        if (startedAtVersion === cartMutationVersion.current) {
          setItems(cartService.getLocalCart());
        }
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

  const addToCart = async (book: Book, quantity: number = 1): Promise<boolean> => {
    if (book.stock <= 0) {
      error(`Sách "${book.title}" hiện đã hết hàng.`);
      return false;
    }

    if (isAuthenticated) {
      cartMutationVersion.current += 1;
      try {
        const remoteCart = await cartService.addToRemoteCart(book.id, quantity);
        if (!remoteCart.items.some((item) => item.book.id === book.id)) {
          throw new Error('Added book missing from cart response');
        }
        setItems(remoteCart.items);
        success(`Đã thêm "${book.title}" vào giỏ hàng!`);
        return true;
      } catch (requestError) {
        if (isAxiosError(requestError)) {
          if (requestError.response?.status === 401 || requestError.response?.status === 403) {
            logout();
            error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          } else if (requestError.response?.status === 400 || requestError.response?.status === 409) {
            error(requestError.response.data?.message || 'Không thể thêm sách vào giỏ hàng.');
          } else {
            error('Không thể thêm sách vào giỏ hàng. Vui lòng thử lại.');
          }
        } else {
          error('Không thể thêm sách vào giỏ hàng. Vui lòng thử lại.');
        }
        return false;
      }
    }

    cartMutationVersion.current += 1;
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.book.id === book.id);
      if (existingItem) {
        return currentItems.map((item) =>
          item.book.id === book.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, book.stock) }
            : item
        );
      }
      return [
        ...currentItems,
        { id: `local-${book.id}-${Date.now()}`, book, quantity: Math.min(quantity, book.stock) },
      ];
    });
    success(`Đã thêm "${book.title}" vào giỏ hàng!`);
    return true;
  };

  const updateQuantity = async (cartItemId: number | string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    if (isAuthenticated && typeof cartItemId === 'number') {
      try {
        const remoteCart = await cartService.updateRemoteCart(cartItemId, quantity);
        setItems(remoteCart.items);
        cartService.setLocalCart(remoteCart.items);
        return;
      } catch {
        // Fall back to local state if the remote cart is unavailable.
      }
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

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await cartService.clearRemoteCart();
      } catch {
        // Keep the local cart usable if the remote cart is unavailable.
      }
    }
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
