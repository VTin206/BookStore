import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Logo } from '../components/ui/Logo';
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
  const location = useLocation();

  const isActiveNav = (path: string, search = '') =>
    location.pathname === path && location.search === search;

  const getNavLinkStyle = (active: boolean, accent = false): React.CSSProperties => ({
    color: active ? (accent ? 'var(--accent-hover)' : 'var(--primary)') : 'var(--text-secondary)',
    backgroundColor: active ? 'var(--primary-light)' : 'transparent',
    borderBottom: active ? `3px solid ${accent ? 'var(--accent)' : 'var(--primary)'}` : '3px solid transparent',
    borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
    padding: '0.7rem 0.75rem 0.55rem',
    fontWeight: active || accent ? 700 : 600,
    textDecoration: 'none',
    transition: 'all 0.15s ease',
  });

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
    <div className="store-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Notification Announcement Bar */}
      <div
        style={{
          backgroundColor: 'var(--surface-dark, #16222E)',
          color: '#cbd5e1',
          fontSize: '0.8rem',
          padding: '7px 0',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={14} color="#5BB573" />
            <span>Miễn phí vận chuyển toàn quốc từ <strong>250.000₫</strong> • Ưu đãi tri thức 2026</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={13} color="#94a3b8" /> Hotline: <strong style={{ color: '#ffffff' }}>1900 6868</strong> (8h - 21h)
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className="store-header"
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
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <Logo variant="horizontal" size="md" />
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
          className="store-nav"
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
            <Link to="/" style={getNavLinkStyle(isActiveNav('/'))}>
              Trang chủ
            </Link>
            <Link to="/books" style={getNavLinkStyle(isActiveNav('/books'))}>
              Tất cả sách
            </Link>
            <Link to="/books?filter=best-seller" style={getNavLinkStyle(isActiveNav('/books', '?filter=best-seller'))}>
              Sách bán chạy
            </Link>
            <Link to="/books?filter=new" style={getNavLinkStyle(isActiveNav('/books', '?filter=new'))}>
              Sách mới về
            </Link>
            <Link to="/books?filter=promo" style={getNavLinkStyle(isActiveNav('/books', '?filter=promo'), true)}>
              Khuyến mãi HOT
            </Link>
            <Link to="/track-order" style={getNavLinkStyle(isActiveNav('/orders'))}>
              Tra cứu đơn hàng
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Page Content */}
      <main style={{ flex: 1, backgroundColor: 'var(--bg-main)' }}>{children}</main>

      {/* Footer */}
      <footer
        className="store-footer"
        style={{
          backgroundColor: 'var(--surface-dark, #16222E)',
          color: '#94a3b8',
          paddingTop: '4rem',
          paddingBottom: '2.5rem',
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
              <div style={{ marginBottom: '1.25rem' }}>
                <Logo variant="horizontal" size="md" theme="dark" />
              </div>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#94a3b8', marginBottom: '1.25rem' }}>
                Nhà sách trực tuyến với sứ mệnh lan tỏa văn hóa đọc, ươm mầm tri thức và nuôi dưỡng tâm hồn qua từng ấn phẩm chất lượng, nguồn gốc chính hãng và dịch vụ tận tâm.
              </p>
              <div style={{ display: 'flex', gap: '1rem', color: '#cbd5e1' }}>
                <span style={{ fontSize: '0.85rem' }}>Hotline hỗ trợ: <strong style={{ color: '#ffffff' }}>1900 6868</strong></span>
              </div>
            </div>

            {/* Col 2: Customer Service */}
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1.25rem', fontWeight: 700 }}>
                Hỗ trợ khách hàng
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
                <li><Link to="/track-order" style={{ color: '#94a3b8' }}>Tra cứu đơn hàng</Link></li>
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
                Cam kết từ Book Store
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Truck size={18} color="#5BB573" />
                  <span>Giao hàng nhanh toàn quốc</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <RotateCcw size={18} color="#5BB573" />
                  <span>Đổi trả dễ dàng trong 30 ngày</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Headphones size={18} color="#F59E0B" />
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
            <div>© {new Date().getFullYear()} Book Store — Khám Phá Thế Giới. Toàn bộ bản quyền được bảo lưu.</div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <span>Ươm mầm tri thức • Đồng hành tương lai</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
