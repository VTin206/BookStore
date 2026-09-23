import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { BookOpen, LogIn, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      error('Vui lòng nhập tên đăng nhập và mật khẩu.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await login({ username: username.trim(), password: password.trim() });
      success(`Chào mừng bạn quay trở lại, ${res.username}!`);
      if (res.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Login error', err);
      error('Tên đăng nhập hoặc mật khẩu không chính xác.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="container"
      style={{
        padding: '4rem 1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        className="fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <BookOpen size={28} />
          </div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>Đăng nhập BookStore</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Chào mừng bạn quay trở lại với kho tàng tri thức
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Tên đăng nhập"
            placeholder="Nhập username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            label="Mật khẩu"
            type="password"
            placeholder="Nhập mật khẩu"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div style={{ marginTop: '1.5rem' }}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              style={{ width: '100%', fontWeight: 700 }}
              leftIcon={<LogIn size={18} />}
            >
              Đăng nhập
            </Button>
          </div>
        </form>

        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-light)',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
          }}
        >
          Chưa có tài khoản độc giả?{' '}
          <Link to="/register" style={{ fontWeight: 700, color: 'var(--primary)' }}>
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
