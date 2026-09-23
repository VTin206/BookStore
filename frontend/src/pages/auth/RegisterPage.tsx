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
      error('Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ cÃ¡c trÆ°á»ng báº¯t buá»™c (*).');
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
      success('ÄÄƒng kÃ½ tÃ i khoáº£n thÃ nh cÃ´ng! Báº¡n Ä‘Ã£ Ä‘Æ°á»£c tá»± Ä‘á»™ng Ä‘Äƒng nháº­p.');
      navigate('/');
    } catch (err: any) {
      console.error('Registration error', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Dang ky that bai. Vui long thu lai.';
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
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>ÄÄƒng kÃ½ tÃ i khoáº£n</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Gia nháº­p cá»™ng Ä‘á»“ng ngÆ°á»i yÃªu sÃ¡ch táº¡i BookStore
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Há» vÃ  tÃªn *"
            placeholder="VÃ­ dá»¥: LÃª Minh ChÃ¢u"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <Input
            label="TÃªn Ä‘Äƒng nháº­p *"
            placeholder="VÃ­ dá»¥: minhchau99"
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
            label="Sá»‘ Ä‘iá»‡n thoáº¡i"
            type="tel"
            placeholder="09xx xxx xxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            label="Máº­t kháº©u *"
            type="password"
            placeholder="Tá»‘i thiá»ƒu 6 kÃ½ tá»±"
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
              Táº¡o tÃ i khoáº£n má»›i
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
          ÄÃ£ cÃ³ tÃ i khoáº£n?{' '}
          <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)' }}>
            ÄÄƒng nháº­p ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

