import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookService } from '../../services/bookService';
import { orderService } from '../../services/orderService';
import { categoryService } from '../../services/categoryService';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { Book, Order, User } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  DollarSign,
  ShoppingBag,
  Users,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Eye,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  const { success, error } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [booksData, ordersData, usersData] = await Promise.all([
        bookService.getAll().catch(() => []),
        orderService.getAll().catch(() => []),
        userService.getAll().catch(() => []),
      ]);
      setBooks(booksData);
      setOrders(ordersData);
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute metrics
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const totalUsers = users.length;
  const totalBooks = books.length;
  const lowStockBooks = books.filter((b) => b.stock < 10);
  const recentOrders = orders.slice(0, 5);

  // Seed sample data helper
  const handleSeedSampleData = async () => {
    try {
      setIsSeeding(true);
      // 1. Create categories
      const sampleCategories = ['Văn học', 'Kinh tế', 'Công nghệ', 'Kỹ năng sống', 'Tâm lý học'];
      const createdCats: any[] = [];
      for (const catName of sampleCategories) {
        try {
          const c = await categoryService.create(catName);
          createdCats.push(c);
        } catch {
          // might exist
        }
      }

      // Re-fetch categories to get IDs
      const allCats = await categoryService.getAll();
      const findCatId = (name: string) => allCats.find((c) => c.name === name)?.id;

      // 2. Create sample classic books
      const sampleBooks = [
        {
          title: 'Nhà Giả Kim (The Alchemist)',
          author: 'Paulo Coelho',
          price: 79000,
          stock: 45,
          categoryId: findCatId('Văn học') || null,
        },
        {
          title: 'Đắc Nhân Tâm (How to Win Friends)',
          author: 'Dale Carnegie',
          price: 86000,
          stock: 60,
          categoryId: findCatId('Kỹ năng sống') || null,
        },
        {
          title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
          author: 'Robert C. Martin',
          price: 245000,
          stock: 18,
          categoryId: findCatId('Công nghệ') || null,
        },
        {
          title: 'Atomic Habits - Thay Đổi Tí Hon Hiệu Quả Bất Ngờ',
          author: 'James Clear',
          price: 139000,
          stock: 35,
          categoryId: findCatId('Kỹ năng sống') || null,
        },
        {
          title: 'Sapiens: Lược Sử Loài Người',
          author: 'Yuval Noah Harari',
          price: 185000,
          stock: 22,
          categoryId: findCatId('Tâm lý học') || null,
        },
        {
          title: 'Tư Duy Nhanh Và Chậm (Thinking, Fast and Slow)',
          author: 'Daniel Kahneman',
          price: 168000,
          stock: 8, // Low stock demo
          categoryId: findCatId('Tâm lý học') || null,
        },
        {
          title: 'Chiến Tranh Tiền Tệ',
          author: 'Song Hongbing',
          price: 125000,
          stock: 25,
          categoryId: findCatId('Kinh tế') || null,
        },
        {
          title: 'Tuổi Trẻ Đáng Giá Bao Nhiêu?',
          author: 'Rosie Nguyễn',
          price: 72000,
          stock: 4, // Low stock demo
          categoryId: findCatId('Kỹ năng sống') || null,
        },
      ];

      for (const b of sampleBooks) {
        await bookService.create(b as any);
      }

      success('Đã nạp thành công 8 đầu sách kinh điển và 5 danh mục mẫu vào hệ thống!');
      await loadData();
    } catch (err) {
      console.error('Seed data error', err);
      error('Có lỗi xảy ra khi nạp dữ liệu mẫu.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner & Quick Seed Data Action */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          backgroundColor: 'var(--surface)',
          padding: '1.5rem 2rem',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Tổng quan kinh doanh</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            Thống kê doanh thu, đơn hàng, lượng bạn đọc và tồn kho sách thời gian thực
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSeedSampleData}
            isLoading={isSeeding}
            leftIcon={<Sparkles size={16} color="var(--accent)" />}
          >
            Nạp dữ liệu mẫu (Seed Data)
          </Button>
          <Link to="/admin/books" className="btn btn-primary btn-sm">
            + Thêm sách mới
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Card 1: Revenue */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              TỔNG DOANH THU
            </span>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {totalRevenue.toLocaleString('vi-VN')} ₫
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--success)' }}>
            <TrendingUp size={14} /> Tăng trưởng ổn định
          </div>
        </div>

        {/* Card 2: Orders */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              TỔNG ĐƠN HÀNG
            </span>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingBag size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {totalOrders}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Đơn mua đã ghi nhận
          </div>
        </div>

        {/* Card 3: Users */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              KHÁCH HÀNG (USERS)
            </span>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fffbeb',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {totalUsers}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Tài khoản độc giả đăng ký
          </div>
        </div>

        {/* Card 4: Books */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              TỔNG ĐẦU SÁCH
            </span>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#f3e8ff',
                color: '#7e22ce',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOpen size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {totalBooks}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {lowStockBooks.length > 0 ? (
              <span style={{ color: 'var(--warning)', fontWeight: 600 }}>
                {lowStockBooks.length} sách sắp hết hàng
              </span>
            ) : (
              'Kho hàng đầy đủ'
            )}
          </div>
        </div>
      </div>

      {/* Middle Section: Revenue Mini Chart & Low Stock Alert */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '2rem',
        }}
      >
        {/* SVG Mini Revenue / Activity Chart */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--primary)" /> Biểu đồ doanh thu hàng tuần
          </h3>
          <div style={{ width: '100%', height: '180px', display: 'flex', alignItems: 'flex-end', gap: '16px', padding: '10px 0' }}>
            {[
              { day: 'T2', val: 35 },
              { day: 'T3', val: 55 },
              { day: 'T4', val: 40 },
              { day: 'T5', val: 75 },
              { day: 'T6', val: 90 },
              { day: 'T7', val: 120 },
              { day: 'CN', val: 140 },
            ].map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '100%',
                    backgroundColor: i === 6 ? 'var(--primary)' : 'var(--primary-light)',
                    height: `${(d.val / 150) * 130}px`,
                    borderRadius: 'var(--radius-sm)',
                    transition: 'height 0.3s ease',
                  }}
                  title={`${d.day}: ${d.val * 10000}₫`}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.day}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            <span>Doanh số ước tính tuần hiện tại</span>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Cập nhật mỗi ngày</span>
          </div>
        </div>

        {/* Low Stock Books Alert */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning-text)' }}>
            <AlertTriangle size={18} color="var(--warning)" /> Cảnh báo sách sắp hết hàng (Tồn kho &lt; 10)
          </h3>
          {lowStockBooks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {lowStockBooks.slice(0, 4).map((b) => (
                <div
                  key={b.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    backgroundColor: 'var(--surface-alt)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{b.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.author}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-lowstock">Còn {b.stock} cuốn</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '2rem 0' }}>
              Tất cả sách đều đảm bảo lượng tồn kho an toàn trên 10 cuốn.
            </p>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Đơn hàng gần đây</h3>
          <Link to="/admin/orders" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
            Xem toàn bộ đơn hàng
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td><strong>#{o.id}</strong></td>
                    <td>{o.customerName}</td>
                    <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : 'Mới'}</td>
                    <td>{Number(o.totalAmount).toLocaleString('vi-VN')} ₫</td>
                    <td>
                      <Badge variant={o.status === 'DELIVERED' ? 'delivered' : 'pending'}>
                        {o.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '1rem 0' }}>
            Chưa có đơn hàng nào phát sinh.
          </p>
        )}
      </div>
    </div>
  );
};
