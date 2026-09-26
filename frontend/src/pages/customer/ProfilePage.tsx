import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { OrderHistoryPage } from './OrderHistoryPage';
import { userService } from '../../services/userService';
import { WishlistItem } from '../../types';
import {
  User,
  MapPin,
  ShoppingBag,
  KeyRound,
  Heart,
  LogOut,
  Save,
  CheckCircle,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { username, role, logout } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'info' | 'address' | 'orders' | 'password' | 'wishlist'>('info');

  // Personal Info Form
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  // Address
  const [address, setAddress] = useState<string>('');

  // Password
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [profile, wishlistItems] = await Promise.all([
          userService.getMe(),
          userService.getWishlist(),
        ]);
        setFullName(profile.fullName || '');
        setEmail(profile.email || '');
        setPhone(profile.phone || '');
        setAddress(profile.address || '');
        setWishlist(wishlistItems);
      } catch {
        error('Không thể tải thông tin tài khoản.');
      }
    };
    loadProfile();
  }, [error]);
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.updateMe({ fullName, email, phone, address });
      success('Đã cập nhật thông tin cá nhân thành công!');
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể cập nhật thông tin cá nhân.');
    }
  };
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.updateMe({ fullName, email, phone, address });
      success('Đã lưu địa chỉ giao nhận mặc định!');
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể lưu địa chỉ.');
    }
  };
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      error('Mật khẩu xác nhận không trùng khớp.');
      return;
    }
    try {
      await userService.changePassword({ currentPassword, newPassword });
      success('Đã thay đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể thay đổi mật khẩu.');
    }
  };

  const handleRemoveWishlist = async (bookId: number) => {
    try {
      await userService.removeFromWishlist(bookId);
      setWishlist((items) => items.filter((item) => item.book.id !== bookId));
      success('Đã xóa sách khỏi danh sách yêu thích.');
    } catch {
      error('Không thể cập nhật danh sách yêu thích.');
    }
  };
  return (
    <div className="container" style={{ padding: '2.5rem 1rem 5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Tài khoản của tôi</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Quản lý thông tin bảo mật và đơn hàng cá nhân
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '2.5rem',
          alignItems: 'start',
        }}
        className="profile-layout"
      >
        {/* Left Sidebar Tabs */}
        <aside
          style={{
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          {/* User Preview */}
          <div
            style={{
              padding: '1rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '0.75rem',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
              }}
            >
              {username ? username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{username || 'Người dùng'}</div>
              <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                {role || 'CUSTOMER'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { id: 'info', label: 'Thông tin cá nhân', icon: User },
              { id: 'address', label: 'Sổ địa chỉ', icon: MapPin },
              { id: 'orders', label: 'Đơn hàng của tôi', icon: ShoppingBag },
              { id: 'password', label: 'Đổi mật khẩu', icon: KeyRound },
              { id: 'wishlist', label: 'Sách yêu thích', icon: Heart },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '8px 0' }} />

            <button
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--error)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <LogOut size={18} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* Right Tab Content */}
        <main
          style={{
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border)',
            padding: '2rem',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          {activeTab === 'info' && (
            <div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Thông tin cá nhân</h2>
              <form onSubmit={handleSaveInfo} style={{ maxWidth: '520px' }}>
                <Input
                  label="Họ và tên"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <Input
                  label="Tên đăng nhập (Username)"
                  value={username || ''}
                  disabled
                  helperText="Tên đăng nhập không thể thay đổi"
                />
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Số điện thoại"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Button type="submit" variant="primary" leftIcon={<Save size={16} />}>
                  Lưu thay đổi
                </Button>
              </form>
            </div>
          )}

          {activeTab === 'address' && (
            <div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Sổ địa chỉ nhận hàng</h2>
              <form onSubmit={handleSaveAddress} style={{ maxWidth: '560px' }}>
                <div className="form-group">
                  <label className="form-label">Địa chỉ giao hàng mặc định</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" variant="primary" leftIcon={<Save size={16} />}>
                  Lưu địa chỉ
                </Button>
              </form>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <OrderHistoryPage />
            </div>
          )}

          {activeTab === 'password' && (
            <div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Đổi mật khẩu tài khoản</h2>
              <form onSubmit={handleChangePassword} style={{ maxWidth: '440px' }}>
                <Input
                  label="Mật khẩu hiện tại"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <Input
                  label="Mật khẩu mới"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Input
                  label="Xác nhận mật khẩu mới"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button type="submit" variant="primary" leftIcon={<CheckCircle size={16} />}>
                  Cập nhật mật khẩu
                </Button>
              </form>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Danh sách yêu thích</h2>
              {wishlist.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Bạn hiện chưa lưu cuốn sách nào vào danh sách yêu thích.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {wishlist.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        borderBottom: '1px solid var(--border)',
                        paddingBottom: '0.75rem',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700 }}>{item.book.title}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.book.author}</div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveWishlist(item.book.id)}>
                        Xóa
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
