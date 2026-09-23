import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { orderService } from '../../services/orderService';
import { getBookCover } from '../../utils/bookCovers';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  CheckCircle,
  Truck,
  CreditCard,
  Building,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { items, totalAmount, clearCart } = useCart();
  const { username, isAuthenticated } = useAuth();
  const { error, success } = useToast();
  const navigate = useNavigate();

  // Form states
  const [customerName, setCustomerName] = useState<string>(username || '');
  const [customerEmail, setCustomerEmail] = useState<string>('customer@example.com');
  const [phone, setPhone] = useState<string>('0901234567');
  const [address, setAddress] = useState<string>('123 Đường Sách, Quận 1, TP. Hồ Chí Minh');
  const [note, setNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank' | 'card'>('cod');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const shippingFee = totalAmount >= 250000 || totalAmount === 0 ? 0 : 30000;
  const finalTotal = totalAmount + shippingFee;

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>Không có sản phẩm nào để thanh toán</h2>
        <p style={{ margin: '1rem 0 2rem', color: 'var(--text-muted)' }}>
          Giỏ hàng của bạn đang trống. Vui lòng chọn sách trước khi tiếp tục.
        </p>
        <Link to="/books" className="btn btn-primary">Khám phá sách</Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      error('Vui lòng nhập họ và tên người nhận.');
      return;
    }
    if (!customerEmail.trim()) {
      error('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    try {
      setIsSubmitting(true);
      const orderPayload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        shippingAddress: address.trim(),
        phone: phone.trim(),
        items: items.map((i) => ({
          bookId: Number(i.book.id),
          quantity: i.quantity,
        })),
      };

      const createdOrder = await orderService.create(orderPayload);
      clearCart();
      success('Đặt hàng thành công! Mã đơn: #' + createdOrder.id);
      navigate(`/order-success/${createdOrder.id}`);
    } catch (err: any) {
      console.error('Order creation failed', err);
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!';
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 5rem' }}>
      {/* Checkout Stepper Progress */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          marginBottom: '3rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
          <CheckCircle size={20} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>1. Giỏ hàng</span>
        </div>
        <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--primary)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            2
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>2. Thông tin & Thanh toán</span>
        </div>
        <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--border)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--surface-alt)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            3
          </div>
          <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>3. Hoàn tất</span>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: '2.5rem',
            alignItems: 'start',
          }}
          className="checkout-layout"
        >
          {/* Left Form: Shipping & Payment Method */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Shipping Address Section */}
            <div
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border)',
                padding: '2rem',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Truck size={22} color="var(--primary)" /> Thông tin giao hàng
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <Input
                  label="Họ và tên người nhận *"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <Input
                  label="Email nhận thông báo *"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <Input
                  label="Số điện thoại liên hệ *"
                  type="tel"
                  placeholder="09xx xxx xxx"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Input
                  label="Địa chỉ chi tiết (Số nhà, đường, phường, quận) *"
                  placeholder="Ví dụ: 123 Lê Lợi, P. Bến Nghé, Quận 1"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Ghi chú đơn hàng (Tùy chọn)</label>
                <textarea
                  placeholder="Ghi chú về thời gian giao hàng, chỉ dẫn địa chỉ..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="form-textarea"
                />
              </div>
            </div>

            {/* Payment Method Section */}
            <div
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border)',
                padding: '2rem',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CreditCard size={22} color="var(--primary)" /> Phương thức thanh toán
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {/* Method 1: COD */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    border: `1.5px solid ${paymentMethod === 'cod' ? 'var(--primary)' : 'var(--border)'}`,
                    backgroundColor: paymentMethod === 'cod' ? 'var(--primary-light)' : 'var(--surface)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      Thanh toán khi nhận hàng (COD)
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      Thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng khi nhận sách.
                    </div>
                  </div>
                </label>

                {/* Method 2: Bank Transfer */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    border: `1.5px solid ${paymentMethod === 'bank' ? 'var(--primary)' : 'var(--border)'}`,
                    backgroundColor: paymentMethod === 'bank' ? 'var(--primary-light)' : 'var(--surface)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'bank'}
                    onChange={() => setPaymentMethod('bank')}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      Chuyển khoản Ngân hàng (Mã QR VietQR)
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      Quét mã QR tự động xác nhận thanh toán qua ứng dụng ngân hàng di động.
                    </div>
                  </div>
                </label>

                {/* Method 3: Card */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    border: `1.5px solid ${paymentMethod === 'card' ? 'var(--primary)' : 'var(--border)'}`,
                    backgroundColor: paymentMethod === 'card' ? 'var(--primary-light)' : 'var(--surface)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      Thẻ tín dụng / Ghi nợ quốc tế (Visa, Mastercard)
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      Bảo mật chuẩn mã hóa PCI-DSS quốc tế.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Summary Sticky Card */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Đơn hàng ({items.length} món)</h3>
              <Link to="/cart" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                Sửa giỏ hàng
              </Link>
            </div>

            {/* Compact items list */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                maxHeight: '260px',
                overflowY: 'auto',
                marginBottom: '1.5rem',
                paddingRight: '4px',
              }}
            >
              {items.map((i) => {
                const cover = getBookCover(i.book.title, i.book.category?.name, i.book.imageUrl);
                return (
                  <div key={i.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <img
                      src={cover}
                      alt={i.book.title}
                      style={{ width: '40px', height: '52px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {i.book.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        SL: {i.quantity} × {Number(i.book.price).toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                      {(Number(i.book.price) * i.quantity).toLocaleString('vi-VN')} ₫
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Tiền hàng</span>
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
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: '0.75rem',
                }}
              >
                <span style={{ fontSize: '1rem', fontWeight: 700 }}>Tổng cộng</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {finalTotal.toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>

            <div style={{ marginTop: '1.75rem' }}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                style={{ width: '100%', fontWeight: 700 }}
              >
                Đặt hàng ngay <ArrowRight size={18} />
              </Button>
            </div>

            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
              }}
            >
              <ShieldCheck size={14} color="#059669" /> Thông tin thanh toán được bảo mật an toàn
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
