import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Package, Home, ShoppingBag } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container" style={{ padding: '4rem 1rem 6rem', textAlign: 'center' }}>
      <div
        className="fade-in"
        style={{
          maxWidth: '560px',
          margin: '0 auto',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)',
          padding: '3.5rem 2.5rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <CheckCircle2 size={48} />
        </div>

        <span
          style={{
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            fontSize: '0.8rem',
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            display: 'inline-block',
            marginBottom: '1rem',
          }}
        >
          MÃ ĐƠN HÀNG: #{id}
        </span>

        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          Đặt hàng thành công!
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          Cảm ơn bạn đã tin tưởng lựa chọn BookStore. Chúng tôi đã nhận được thông tin đơn hàng và đang chuẩn bị những cuốn sách thật chu đáo để giao đến tay bạn sớm nhất.
        </p>

        <div
          style={{
            backgroundColor: 'var(--surface-alt)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            textAlign: 'left',
            marginBottom: '2rem',
            fontSize: '0.875rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Thời gian giao hàng dự kiến:</span>
            <span style={{ fontWeight: 600 }}>1 - 3 ngày làm việc</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Trạng thái thanh toán:</span>
            <span style={{ fontWeight: 600, color: 'var(--warning-text)' }}>Chờ xử lý / COD</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/orders" className="btn btn-secondary">
            <ShoppingBag size={18} /> Xem lịch sử đơn hàng
          </Link>
          <Link to="/" className="btn btn-primary">
            <Home size={18} /> Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
};
