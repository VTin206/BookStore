import React, { useState, useEffect, useMemo } from 'react';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ShoppingBag, Eye, Calendar, Search } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const data = await orderService.getAllAdmin();
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (status: OrderStatus) => {
    if (!selectedOrder || status === selectedOrder.status) {
      return;
    }

    try {
      setUpdatingStatus(true);
      const updatedOrder = await orderService.updateStatus(selectedOrder.id, status);
      setOrders((current) =>
        current.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)),
      );
      setSelectedOrder(updatedOrder);
      success('Đã cập nhật trạng thái đơn hàng.');
    } catch (err) {
      console.error('Failed to update order status', err);
      error('Không thể cập nhật trạng thái đơn hàng.');
    } finally {
      setUpdatingStatus(false);
    }
  };
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
        o.id.toString().includes(search);
      const matchStatus = statusFilter ? o.status === statusFilter : true;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>Quản lý Đơn hàng</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
          Theo dõi và xử lý tiến độ các đơn hàng bán ra ({orders.length} đơn)
        </p>
      </div>

      {/* Filter and Search */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '280px', maxWidth: '600px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, họ tên, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '38px', fontSize: '0.875rem' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ width: '180px', fontSize: '0.875rem' }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="SHIPPING">Đang giao</option>
            <option value="DELIVERED">Đã giao</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="card">
          <TableSkeleton rows={5} />
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày tạo</th>
                <th>Địa chỉ giao</th>
                <th>Tổng thanh toán</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--primary)' }}>#{o.id}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{o.customerEmail}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                      <Calendar size={14} color="var(--text-muted)" />
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : 'Mới'}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {o.shippingAddress || '—'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
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
                      Xem chi tiết
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
          title="Không tìm thấy đơn hàng nào"
          description="Chưa có đơn hàng nào khớp với các tiêu chí tìm kiếm hoặc bộ lọc hiện tại."
        />
      )}

      {/* Detail Modal */}
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
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Trạng thái:</div>
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
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Thông tin khách hàng</h4>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <div><strong>Họ và tên:</strong> {selectedOrder.customerName}</div>
                <div><strong>Email:</strong> {selectedOrder.customerEmail}</div>
                {selectedOrder.shippingAddress && <div><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress}</div>}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Chi tiết sách đặt mua</h4>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <table className="table" style={{ fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th>Sách</th>
                        <th style={{ textAlign: 'center' }}>Số lượng</th>
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
                  Đơn hàng đặt các mục sách trong hệ thống.
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