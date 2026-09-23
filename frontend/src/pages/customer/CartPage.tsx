import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { getBookCover } from '../../utils/bookCovers';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import {
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShoppingBag,
  ArrowLeft,
  Truck,
  Tag,
  ShieldCheck,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const { items, totalAmount, updateQuantity, removeFromCart, clearCart } = useCart();
  const { success, warning } = useToast();
  const navigate = useNavigate();

  const [itemToDelete, setItemToDelete] = useState<number | string | null>(null);
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const shippingFee = totalAmount >= 250000 || totalAmount === 0 ? 0 : 30000;
  const finalTotal = Math.max(0, totalAmount + shippingFee - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'TRIAN30') {
      const discount = Math.round(totalAmount * 0.3);
      setDiscountAmount(discount);
      success('Áp dụng thành công mã giảm giá 30%!');
    } else if (couponCode.trim()) {
      warning('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
    }
  };

  const confirmDelete = async () => {
    if (itemToDelete !== null) {
      await removeFromCart(itemToDelete);
      setItemToDelete(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div
          style={{
            maxWidth: '460px',
            margin: '0 auto',
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border)',
            padding: '3.5rem 2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              margin: '0 auto 1.5rem',
            }}
          >
            <ShoppingBag size={36} />
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>Giỏ hàng của bạn đang trống</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            Hãy dạo quanh các danh mục sách để tìm những cuốn sách tâm đắc và bổ sung vào giỏ hàng ngay nhé!
          </p>
          <Link to="/books" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
            Khám phá sách ngay <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Giỏ hàng của bạn</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Bạn đang có <strong>{items.reduce((s, i) => s + i.quantity, 0)}</strong> sản phẩm trong giỏ
        </p>
      </div>

      {/* 2 Column Layout (Left: Items, Right: Summary) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 360px',
          gap: '2.5rem',
          alignItems: 'start',
        }}
        className="cart-layout"
      >
        {/* Left: Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            {/* Table Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(240px, 3fr) 1.2fr 1.2fr 48px',
                padding: '1rem 1.5rem',
                backgroundColor: 'var(--surface-alt)',
                borderBottom: '1px solid var(--border)',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
              className="cart-header"
            >
              <span>Sách</span>
              <span style={{ textAlign: 'center' }}>Số lượng</span>
              <span style={{ textAlign: 'right' }}>Thành tiền</span>
              <span />
            </div>

            {/* Items Rows */}
            {items.map((item) => {
              const coverUrl = getBookCover(item.book.title, item.book.category?.name, item.book.imageUrl);
              const lineTotal = Number(item.book.price) * item.quantity;

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(240px, 3fr) 1.2fr 1.2fr 48px',
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--border-light)',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                  className="cart-row"
                >
                  {/* Book Info */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '60px',
                        height: '80px',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        backgroundColor: 'var(--surface-alt)',
                        flexShrink: 0,
                        border: '1px solid var(--border)',
                      }}
                    >
                      <img
                        src={coverUrl}
                        alt={item.book.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <Link
                        to={`/books/${item.book.id}`}
                        style={{
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: 'var(--text-primary)',
                          display: 'block',
                          marginBottom: '4px',
                        }}
                      >
                        {item.book.title}
                      </Link>
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                        {item.book.author}
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)', marginTop: '4px' }}>
                        {Number(item.book.price).toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--surface)',
                      }}
                    >
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{
                          padding: '4px 10px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-secondary)',
                        }}
                        aria-label="Giảm số lượng"
                      >
                        <Minus size={14} />
                      </button>
                      <span
                        style={{
                          padding: '0 8px',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          minWidth: '28px',
                          textAlign: 'center',
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{
                          padding: '4px 10px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-secondary)',
                        }}
                        aria-label="Tăng số lượng"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {lineTotal.toLocaleString('vi-VN')} ₫
                  </div>

                  {/* Remove Button */}
                  <div style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => setItemToDelete(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--error)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                      title="Xóa khỏi giỏ"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Bottom Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <Link
              to="/books"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--primary)',
              }}
            >
              <ArrowLeft size={16} /> Tiếp tục chọn thêm sách
            </Link>

            <button
              onClick={clearCart}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Xóa toàn bộ giỏ hàng
            </button>
          </div>
        </div>

        {/* Right: Order Summary Card */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border)',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-sm)',
            position: 'sticky',
            top: '90px',
          }}
        >
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Tóm tắt đơn hàng</h3>

          {/* Coupon Form */}
          <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder="Mã giảm giá (TRIAN30)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
            />
            <Button type="submit" variant="secondary" size="sm">
              Áp dụng
            </Button>
          </form>

          {/* Pricing breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Tạm tính</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {totalAmount.toLocaleString('vi-VN')} ₫
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Phí vận chuyển</span>
              <span style={{ fontWeight: 600, color: shippingFee === 0 ? 'var(--success)' : 'var(--text-primary)' }}>
                {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')} ₫`}
              </span>
            </div>

            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                <span>Giảm giá khuyến mãi</span>
                <span style={{ fontWeight: 600 }}>-{discountAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
            )}

            <div
              style={{
                height: '1px',
                backgroundColor: 'var(--border)',
                margin: '0.5rem 0',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>Tổng thanh toán</span>
              <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary)' }}>
                {finalTotal.toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>

          <div style={{ marginTop: '1.75rem' }}>
            <Button
              variant="primary"
              size="lg"
              style={{ width: '100%', fontWeight: 700 }}
              onClick={() => navigate('/checkout')}
            >
              Tiến hành thanh toán <ArrowRight size={18} />
            </Button>
          </div>

          <div
            style={{
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={14} color="var(--primary)" /> Miễn phí giao hàng cho đơn từ 250k
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#059669" /> Đảm bảo quyền lợi khách hàng 100%
            </div>
          </div>
        </div>
      </div>

      {/* Delete Item Confirmation Dialog */}
      <ConfirmDialog
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Xóa sách khỏi giỏ hàng"
        message="Bạn có chắc chắn muốn xóa cuốn sách này khỏi giỏ hàng không?"
        confirmText="Xóa"
        isDanger={true}
      />
    </div>
  );
};
