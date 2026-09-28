import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, ArrowLeft } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { OrderStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const statusLabels: Record<string, string> = {
  PENDING: 'Ch? x?c nh?n', CONFIRMED: '?? x?c nh?n', PROCESSING: '?ang ??ng g?i',
  SHIPPING: '?ang giao h?ng', DELIVERED: '?? giao th?nh c?ng', CANCELLED: '?? h?y',
};

export const TrackOrderPage: React.FC = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const [order, setOrder] = useState<Awaited<ReturnType<typeof orderService.lookup>> | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const code = trackingCode.trim().toUpperCase();
    if (!code) {
      setError('Vui l?ng nh?p m? tra c?u ??n h?ng.');
      setOrder(null);
      return;
    }
    setIsLoading(true);
    setError('');
    setOrder(null);
    try {
      setOrder(await orderService.lookup(code));
    } catch {
      setError('Kh?ng t?m th?y ??n h?ng v?i m? tra c?u n?y.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 1rem 6rem' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Package size={42} color="var(--primary)" />
          <h1 style={{ margin: '1rem 0 0.5rem' }}>Tra c?u ??n h?ng</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Nh?p m? tra c?u ???c c?p sau khi ??t h?ng.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <Input label="M? tra c?u ??n h?ng" placeholder="V? d?: A1B2C3D4E5" value={trackingCode} onChange={(event) => setTrackingCode(event.target.value)} />
          {error && <p className="form-error">{error}</p>}
          <Button type="submit" variant="primary" isLoading={isLoading} leftIcon={<Search size={18} />} style={{ width: '100%', marginTop: '0.5rem' }}>Tra c?u</Button>
        </form>
        {order && (
          <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'var(--surface-alt)', borderRadius: 'var(--radius-lg)', display: 'grid', gap: '0.65rem' }}>
            <div><strong>M? ??n:</strong> {order.trackingCode}</div>
            <div><strong>Tr?ng th?i:</strong> {statusLabels[order.status] || order.status}</div>
            <div><strong>T?ng ti?n:</strong> {Number(order.totalAmount).toLocaleString('vi-VN')} ?</div>
            <div><strong>Ng?y ??t:</strong> {new Date(order.createdAt).toLocaleString('vi-VN')}</div>
          </div>
        )}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1.5rem', color: 'var(--primary)' }}><ArrowLeft size={16} /> Ti?p t?c mua s?m</Link>
      </div>
    </div>
  );
};
