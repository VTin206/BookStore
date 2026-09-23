import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { BookOpen, UserPlus } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !fullName.trim() || !email.trim()) {
      error('Vui lòng điền đầy đủ các trường bắt buộc (*).');
      return;
    }

    try {
      setIsLoading(true);
      await register({
        username: username.trim(),
        password: password.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
      });
      success('Đăng ký tài khoản thành công! Bạn đã được tự động đăng nhập.');
      navigate('/');
    } catch (err: any) {
      console.error('Registration error', err);
      const msg = err.response?.data?.message || 'Tên đăng nhập hoặc email đã tồn tại.';
      error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="container"
      style={{
        padding: '3.5rem 1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        className="fade-in"
        style={{
          width: '100%',
          maxWidth: '480px',
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
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>Đăng ký tài khoản</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Gia nhập cộng đồng người yêu sách tại BookStore
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Họ và tên *"
            placeholder="Ví dụ: Lê Minh Châu"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <Input
            label="Tên đăng nhập *"
            placeholder="Ví dụ: minhchau99"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            label="Email *"
            type="email"
            placeholder="name@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Số điện thoại"
            type="tel"
            placeholder="09xx xxx xxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            label="Mật khẩu *"
            type="password"
            placeholder="Tối thiểu 6 ký tự"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div style={{ marginTop: '1.75rem' }}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              style={{ width: '100%', fontWeight: 700 }}
              leftIcon={<UserPlus size={18} />}
            >
              Tạo tài khoản mới
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
          Đã có tài khoản?{' '}
          <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)' }}>
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
