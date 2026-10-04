import { useEffect, useState } from 'react';
import { CartItem } from '../types';
import { orderService } from '../services/orderService';

type Quote = Awaited<ReturnType<typeof orderService.quote>>;

export function useOrderQuote(items: CartItem[], couponCode?: string) {
  const key = JSON.stringify({ items: items.map(item => ({ bookId: item.book.id, quantity: item.quantity })), couponCode });
  const [result, setResult] = useState<{ key: string; quote?: Quote; error?: string }>();
  useEffect(() => {
    let active = true;
    if (!items.length) return;
    const request = JSON.parse(key);
    orderService.quote(request.items, request.couponCode).then(quote => {
      if (active) setResult({ key, quote });
    }).catch(err => {
      if (active) setResult({ key, error: err.response?.data?.message || 'Không thể kiểm tra giá và tồn kho. Vui lòng tải lại trang.' });
    });
    return () => { active = false; };
  }, [key]);
  return {
    quote: result?.key === key ? result.quote : undefined,
    quoteError: result?.key === key ? result.error : undefined,
  };
}
