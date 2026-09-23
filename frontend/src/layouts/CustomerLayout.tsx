import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  BookOpen,
  Search,
  ShoppingBag,
  User,
  LogOut,
  Shield,
  Menu,
  X,
  Phone,
  Truck,
  RotateCcw,
  Headphones,
  Heart,
  ChevronDown,
} from 'lucide-react';

export const CustomerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, username, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Notification Announcement Bar */}
      <div
        style={{
          backgroundColor: '#0f172a',
          color: '#cbd5e1',
          fontSize: '0.8rem',
          padding: '6px 0',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={14} color="#60a5fa" />
            <span>Miễn phí vận chuyển toàn quốc cho đơn hàng từ <strong>250.000₫</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={13} /> Hotline: <strong>1900 6868</strong> (8h - 21h)
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        style={{
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '76px',
            gap: '1.5rem',
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <BookOpen size={24} />
            </div>
            <div>
              <span
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  display: 'block',
                }}
              >
                BOOKSTORE
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 600 }}>
                TRI THỨC & VĂN HÓA
              </span>
            </div>
          </Link>

          {/* Prominent Search Bar (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              flex: 1,
              maxWidth: '560px',
              display: 'flex',
              position: 'relative',
            }}
          >
            <input
              type="text"
              placeholder="Tìm kiếm sách, tác giả, danh mục..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.7rem 1.1rem 0.7rem 2.8rem',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid var(--border)',
                backgroundColor: 'var(--bg-main)',
                fontSize: '0.925rem',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(30, 58, 138, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.backgroundColor = 'var(--bg-main)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                position: 'absolute',
                right: '4px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Tìm
            </button>
          </form>

          {/* Right Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
            {/* Cart Link with Badge */}
            <Link
              to="/cart"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                transition: 'background-color 0.15s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-alt)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ position: 'relative' }}>
                <ShoppingBag size={22} color="var(--primary)" />
                {itemCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-7px',
                      right: '-9px',
                      backgroundColor: 'var(--accent)',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1,
                      boxShadow: 'var(--shadow-xs)',
                    }}
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }} className="desktop-only">
                Giỏ hàng
              </span>
            </Link>

            {/* User Account / Dropdown */}
            <div style={{ position: 'relative' }}>
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'none',
                      border: '1px solid var(--border)',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--surface)',
                    }}
                  >
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                      }}
                    >
                      {username ? username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span>{username}</span>
                    <ChevronDown size={14} color="var(--text-muted)" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="fade-in"
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '115%',
                        backgroundColor: 'var(--surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-lg)',
                        width: '210px',
                        zIndex: 200,
                        overflow: 'hidden',
                        padding: '6px 0',
                      }}
                    >
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 16px',
                          fontSize: '0.875rem',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-alt)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <User size={16} /> Tài khoản của tôi
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 16px',
                          fontSize: '0.875rem',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-alt)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <ShoppingBag size={16} /> Lịch sử đơn hàng
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 16px',
                            fontSize: '0.875rem',
                            color: 'var(--primary)',
                            fontWeight: 700,
                            textDecoration: 'none',
                            backgroundColor: 'var(--primary-light)',
                          }}
                        >
                          <Shield size={16} /> Quản trị (Admin)
                        </Link>
                      )}

                      <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '4px 0' }} />

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 16px',
                          fontSize: '0.875rem',
                          color: 'var(--error)',
                          width: '100%',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-alt)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Link
                    to="/login"
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: 'var(--radius-full)' }}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary btn-sm desktop-only"
                    style={{ borderRadius: 'var(--radius-full)' }}
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-only"
              style={{
                background: 'none',
                border: 'none',
                padding: '6px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'none',
              }}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Secondary Category Navigation Bar */}
        <nav
          style={{
            backgroundColor: '#ffffff',
            borderTop: '1px solid var(--border-light)',
          }}
        >
          <div
            className="container"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              paddingTop: '0.65rem',
              paddingBottom: '0.65rem',
              fontSize: '0.92rem',
              fontWeight: 600,
            }}
          >
            <Link to="/" style={{ color: 'var(--primary)' }}>
              Trang chủ
            </Link>
            <Link to="/books" style={{ color: 'var(--text-secondary)' }}>
              Tất cả sách
            </Link>
            <Link to="/books?filter=best-seller" style={{ color: 'var(--text-secondary)' }}>
              Sách bán chạy
            </Link>
            <Link to="/books?filter=new" style={{ color: 'var(--text-secondary)' }}>
              Sách mới về
            </Link>
            <Link to="/books?filter=promo" style={{ color: 'var(--accent)', fontWeight: 700 }}>
              Khuyến mãi HOT
            </Link>
            <Link to="/orders" style={{ color: 'var(--text-secondary)' }}>
              Tra cứu đơn hàng
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Page Content */}
      <main style={{ flex: 1, backgroundColor: 'var(--bg-main)' }}>{children}</main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: '#0f172a',
          color: '#94a3b8',
          paddingTop: '4rem',
          paddingBottom: '2rem',
          marginTop: 'auto',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '2.5rem',
              marginBottom: '3rem',
            }}
          >
            {/* Col 1: About */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                  }}
                >
                  <BookOpen size={18} />
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  BOOKSTORE
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#94a3b8', marginBottom: '1.25rem' }}>
                Nhà sách trực tuyến với sứ mệnh lan tỏa văn hóa đọc, cung cấp các ấn phẩm chất lượng, nguồn gốc chính hãng và dịch vụ tận tâm.
              </p>
              <div style={{ display: 'flex', gap: '1rem', color: '#cbd5e1' }}>
                <span style={{ fontSize: '0.85rem' }}>Hotline: <strong>1900 6868</strong></span>
              </div>
            </div>

            {/* Col 2: Customer Service */}
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1.25rem', fontWeight: 700 }}>
                Hỗ trợ khách hàng
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
                <li><Link to="/orders" style={{ color: '#94a3b8' }}>Tra cứu đơn hàng</Link></li>
                <li><Link to="/books" style={{ color: '#94a3b8' }}>Hướng dẫn mua hàng</Link></li>
                <li><Link to="/cart" style={{ color: '#94a3b8' }}>Phương thức thanh toán</Link></li>
                <li><Link to="/profile" style={{ color: '#94a3b8' }}>Tài khoản của bạn</Link></li>
              </ul>
            </div>

            {/* Col 3: Policies */}
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1.25rem', fontWeight: 700 }}>
                Chính sách & Quy định
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
                <li><span style={{ color: '#94a3b8' }}>Chính sách đổi trả 30 ngày</span></li>
                <li><span style={{ color: '#94a3b8' }}>Chính sách vận chuyển & giao nhận</span></li>
                <li><span style={{ color: '#94a3b8' }}>Bảo mật thông tin khách hàng</span></li>
                <li><span style={{ color: '#94a3b8' }}>Điều khoản sử dụng</span></li>
              </ul>
            </div>

            {/* Col 4: Values */}
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1.25rem', fontWeight: 700 }}>
                Cam kết từ BookStore
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Truck size={18} color="#60a5fa" />
                  <span>Giao hàng nhanh toàn quốc</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <RotateCcw size={18} color="#34d399" />
                  <span>Đổi trả dễ dàng trong 30 ngày</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Headphones size={18} color="#f59e0b" />
                  <span>Hỗ trợ tư vấn 24/7 nhiệt tình</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div
            style={{
              paddingTop: '2rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              fontSize: '0.825rem',
            }}
          >
            <div>© {new Date().getFullYear()} BookStore E-Commerce. Toàn bộ bản quyền được bảo lưu.</div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <span>Designed with modern aesthetics & care</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
