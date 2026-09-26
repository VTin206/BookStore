import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  Users,
  ShoppingBag,
  Building,
  Feather,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Menu,
} from 'lucide-react';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { username, logout, isAuthenticated, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/books', label: 'Quản lý Sách', icon: BookOpen },
    { path: '/admin/categories', label: 'Danh mục', icon: FolderTree },
    { path: '/admin/orders', label: 'Đơn hàng', icon: ShoppingBag },
    { path: '/admin/authors', label: 'Tác giả & NXB', icon: Feather },
    { path: '/admin/users', label: 'Người dùng', icon: Users },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      {/* Sidebar Desktop */}
      <aside
        style={{
          width: collapsed ? '72px' : '250px',
          backgroundColor: '#0f172a',
          color: '#cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s ease',
          zIndex: 100,
          position: 'sticky',
          top: 0,
          height: '100vh',
          flexShrink: 0,
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        }}
        className="admin-sidebar"
      >
        {/* Brand / Logo */}
        <div
          style={{
            height: '68px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? '0' : '0 1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0,
              }}
            >
              <BookOpen size={20} />
            </div>
            {!collapsed && (
              <div>
                <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '1.05rem', lineHeight: 1 }}>
                  ADMIN PORTAL
                </div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.08em' }}>
                  BOOK STORE MGMT
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Thu nhỏ sidebar"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {collapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
            <button
              onClick={() => setCollapsed(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
              }}
              title="Mở rộng sidebar"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Navigation list */}
        <div style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  transition: 'all 0.15s ease',
                }}
                title={collapsed ? item.label : undefined}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon size={19} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div
          style={{
            padding: '1rem 0.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              color: '#93c5fd',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
            title={collapsed ? 'Về cửa hàng' : undefined}
          >
            <ExternalLink size={17} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Về cửa hàng</span>}
          </Link>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              color: '#f87171',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
            title={collapsed ? 'Đăng xuất' : undefined}
          >
            <LogOut size={17} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Admin Header */}
        <header
          style={{
            height: '68px',
            backgroundColor: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              Hệ thống Quản trị BookStore
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Link
              to="/"
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <ExternalLink size={15} /> Xem Store
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                {username ? username.charAt(0).toUpperCase() : 'A'}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{username || 'Administrator'}</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ padding: '2rem', flex: 1 }}>{children}</main>
      </div>
    </div>
  );
};
