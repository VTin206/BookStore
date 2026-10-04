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
  const { isAuthenticated, username, token } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => isAuthenticated ? [] : cartService.getLocalCart());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const cartMutationVersion = useRef(0);
  const identity = `${isAuthenticated}:${username}:${token}`;
  const identityRef = useRef(identity);
  identityRef.current = identity;
  const persistedIdentity = useRef(identity);
  const mutationQueue = useRef<Promise<unknown>>(Promise.resolve());
  const enqueue = <T,>(action: () => Promise<T>): Promise<T> => {
    const result = mutationQueue.current.then(() => {
      if (identityRef.current !== identity) throw new Error('Session changed');
      return action();
    });
    mutationQueue.current = result.catch(() => undefined);
    return result;
  };
  const { success, error } = useToast();

  // Load from backend if logged in, otherwise local storage
  const refreshCart = useCallback(async () => {
    cartMutationVersion.current += 1;
    const startedAtVersion = cartMutationVersion.current;
    if (isAuthenticated) {
      setItems([]);
      cartService.clearLocalCart();
      try {
        setIsLoading(true);
        const remoteCart = await cartService.getRemoteCart();
        if (startedAtVersion === cartMutationVersion.current) {
          setItems(remoteCart.items);
        }
      } catch {
        if (startedAtVersion === cartMutationVersion.current) {
          error('Không thể tải giỏ hàng. Vui lòng thử lại.');
        }
      } finally {
        if (startedAtVersion === cartMutationVersion.current) setIsLoading(false);
      }
    } else {
      setIsLoading(false);
      setItems(cartService.getLocalCart());
    }
  }, [identity]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Persist to local cart whenever items change
  useEffect(() => {
    if (persistedIdentity.current === identity && !isAuthenticated) cartService.setLocalCart(items);
    persistedIdentity.current = identity;
  }, [items, identity, isAuthenticated]);

  const addToCart = async (book: Book, quantity: number = 1): Promise<boolean> => {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000 || book.stock < quantity) {
      error(`Sách "${book.title}" hiện đã hết hàng.`);
      return false;
    }

    if (isAuthenticated) {
      cartMutationVersion.current += 1;
      const version = cartMutationVersion.current;
      try {
        const remoteCart = await enqueue(() => cartService.addToRemoteCart(book.id, quantity));
        if (!remoteCart.items.some((item) => item.book.id === book.id)) {
          throw new Error('Added book missing from cart response');
        }
        if (identityRef.current !== identity || version !== cartMutationVersion.current) return false;
        setIsLoading(false);
        setItems(remoteCart.items);
        success(`Đã thêm "${book.title}" vào giỏ hàng!`);
        return true;
      } catch (requestError) {
        if (identityRef.current !== identity) return false;
        setIsLoading(false);
        if (isAxiosError(requestError)) {
          if (requestError.response?.status === 401) {
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
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 1000) {
      error('Số lượng không hợp lệ.');
      return;
    }
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    if (isAuthenticated && typeof cartItemId === 'number') {
      const version = ++cartMutationVersion.current;
      try {
        const remoteCart = await enqueue(() => cartService.updateRemoteCart(cartItemId, quantity));
        if (identityRef.current === identity && version === cartMutationVersion.current) setItems(remoteCart.items);
        return;
      } catch {
        error('Không thể cập nhật giỏ hàng. Vui lòng thử lại.');
        return;
      }
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          const maxStock = item.book.stock;
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  };

  const removeFromCart = async (cartItemId: number | string) => {
    ++cartMutationVersion.current;
    try {
      if (isAuthenticated && typeof cartItemId === 'number') {
        try {
          await enqueue(() => cartService.removeFromRemoteCart(cartItemId));
        } catch {
          error('Không thể xóa sách khỏi giỏ hàng. Vui lòng thử lại.');
          return;
        }
      }
      if (identityRef.current !== identity) return;
      setItems((prev) => prev.filter((item) => item.id !== cartItemId));
      success('Đã xóa sách khỏi giỏ hàng.');
    } catch {
      error('Không thể xóa sản phẩm khỏi giỏ.');
    }
  };

  const clearCart = async () => {
    ++cartMutationVersion.current;
    if (isAuthenticated) {
      try {
        await enqueue(() => cartService.clearRemoteCart());
      } catch {
        error('Không thể xóa giỏ hàng. Vui lòng thử lại.');
        return;
      }
    }
    if (identityRef.current !== identity) return;
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
