import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ShoppingBag, Eye, Calendar, DollarSign, Package } from 'lucide-react';

export const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const data = await orderService.getAll();
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case 'PENDING':
        return <Badge variant="pending">Chờ xác nhận</Badge>;
      case 'CONFIRMED':
        return <Badge variant="confirmed">Đã xác nhận</Badge>;
      case 'PROCESSING':
        return <Badge variant="processing">Đang đóng gói</Badge>;
      case 'SHIPPING':
        return <Badge variant="shipping">Đang giao hàng</Badge>;
      case 'DELIVERED':
        return <Badge variant="delivered">Đã giao thành công</Badge>;
      case 'CANCELLED':
        return <Badge variant="cancelled">Đã hủy</Badge>;
      default:
        return <Badge variant="primary">{status}</Badge>;
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Lịch sử đơn hàng</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Theo dõi và tra cứu tình trạng đơn mua của bạn
        </p>
      </div>

      {isLoading ? (
        <div className="card">
          <TableSkeleton rows={4} />
        </div>
      ) : orders.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Ngày đặt</th>
                <th>Người nhận</th>
                <th>Tổng thanh toán</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>#{o.id}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                      <Calendar size={14} color="var(--text-muted)" />
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : 'Mới đặt'}
                    </div>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{o.customerEmail}</div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {Number(o.totalAmount).toLocaleString('vi-VN')} ₫
                    </span>
                  </td>
                  <td>{getStatusBadge(o.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedOrder(o)}
                      leftIcon={<Eye size={15} />}
                    >
                      Chi tiết
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<ShoppingBag size={32} />}
          title="Bạn chưa có đơn hàng nào"
          description="Khám phá ngay hàng ngàn tựa sách hấp dẫn tại BookStore để tạo đơn hàng đầu tiên."
          actionText="Bắt đầu mua sách"
          onAction={() => (window.location.href = '/books')}
        />
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          title={`Chi tiết đơn hàng #${selectedOrder.id}`}
          maxWidth="600px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--surface-alt)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Trạng thái đơn:</div>
                <div style={{ marginTop: '4px' }}>{getStatusBadge(selectedOrder.status)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tổng thanh toán:</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {Number(selectedOrder.totalAmount).toLocaleString('vi-VN')} ₫
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Thông tin người nhận</h4>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <div><strong>Họ tên:</strong> {selectedOrder.customerName}</div>
                <div><strong>Email:</strong> {selectedOrder.customerEmail}</div>
                {selectedOrder.shippingAddress && <div><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress}</div>}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Danh sách sản phẩm</h4>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <table className="table" style={{ fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th>Sách</th>
                        <th style={{ textAlign: 'center' }}>SL</th>
                        <th style={{ textAlign: 'right' }}>Đơn giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.book?.title || `Sách ID #${item.bookId}`}</td>
                          <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                          <td style={{ textAlign: 'right' }}>
                            {item.unitPrice ? `${Number(item.unitPrice).toLocaleString('vi-VN')} ₫` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Đơn hàng bao gồm các sách đã đăng ký trong gói đặt mua.
                </p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button variant="secondary" onClick={() => setSelectedOrder(null)}>
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
