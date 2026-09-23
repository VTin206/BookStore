import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookService } from '../../services/bookService';
import { categoryService } from '../../services/categoryService';
import { Book, Category } from '../../types';
import { BookCard } from '../../components/book/BookCard';
import { BookCardSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  TrendingUp,
  Percent,
  CheckCircle,
  Truck,
  ShieldCheck,
  Award,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [booksData, catsData] = await Promise.all([
          bookService.getAll(),
          categoryService.getAll(),
        ]);
        setBooks(booksData);
        setCategories(catsData);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const featuredBooks = books.slice(0, 4);
  const bestSellers = books.length > 4 ? books.slice(4, 8) : books;
  const newArrivals = books.length > 8 ? books.slice(8, 12) : books.slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)',
          color: '#ffffff',
          padding: '4.5rem 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          className="container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: '3rem',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Left Hero Text */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#93c5fd',
                marginBottom: '1.25rem',
              }}
            >
              <Sparkles size={16} color="#fbbf24" />
              <span>Khám phá tri thức mới mỗi ngày</span>
            </div>

            <h1
              style={{
                color: '#ffffff',
                fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                lineHeight: 1.2,
                marginBottom: '1.25rem',
              }}
            >
              Mở ra thế giới qua từng trang sách
            </h1>

            <p
              style={{
                color: '#e2e8f0',
                fontSize: '1.05rem',
                lineHeight: 1.6,
                maxWidth: '520px',
                marginBottom: '2rem',
              }}
            >
              Tuyển tập hàng ngàn tựa sách hay nhất từ văn học, kinh tế, công nghệ đến phát triển bản thân. Giao hàng nhanh chóng và đảm bảo 100% sách thật.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                to="/books"
                className="btn btn-lg"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#ffffff',
                  border: 'none',
                  boxShadow: 'var(--shadow-md)',
                  fontWeight: 700,
                }}
              >
                Khám phá sách <ArrowRight size={18} />
              </Link>
              <Link
                to="/books?filter=best-seller"
                className="btn btn-lg"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                Sách bán chạy
              </Link>
            </div>
          </div>

          {/* Right Hero Visual Banner */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                position: 'relative',
                maxWidth: '380px',
                width: '100%',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '4px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=80"
                alt="Book Collection"
                style={{ width: '100%', height: '420px', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  insetInline: 0,
                  padding: '1.5rem',
                  background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95), transparent)',
                }}
              >
                <span
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    display: 'inline-block',
                    marginBottom: '6px',
                  }}
                >
                  TỦ SÁCH TINH HOA
                </span>
                <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '4px' }}>
                  Đọc để kiến tạo tương lai
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: 0 }}>
                  Tuyển tập các tác phẩm kinh điển thay đổi tư duy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            backgroundColor: 'var(--surface)',
            padding: '1.75rem 2rem',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                flexShrink: 0,
              }}
            >
              <Truck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '2px' }}>Miễn phí vận chuyển</h4>
              <p style={{ fontSize: '0.825rem', margin: 0, color: 'var(--text-muted)' }}>
                Đơn hàng từ 250.000₫ toàn quốc
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '2px' }}>100% Sách Thật</h4>
              <p style={{ fontSize: '0.825rem', margin: 0, color: 'var(--text-muted)' }}>
                Nhà xuất bản uy tín chính hãng
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#fffbeb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706',
                flexShrink: 0,
              }}
            >
              <Award size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '2px' }}>Đổi trả trong 30 ngày</h4>
              <p style={{ fontSize: '0.825rem', margin: 0, color: 'var(--text-muted)' }}>
                Nếu phát hiện lỗi in ấn từ NXB
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <BookOpen size={24} color="var(--primary)" />
              Danh mục nổi bật
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
              Tìm kiếm sách theo thể loại yêu thích của bạn
            </p>
          </div>
          <Link to="/books" style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            Xem tất cả <ArrowRight size={16} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {categories.length > 0 ? (
            categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/books?category=${cat.id}`}
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: 'var(--shadow-xs)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    marginBottom: '0.85rem',
                  }}
                >
                  <BookOpen size={24} />
                </div>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {cat.name}
                </h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Khám phá ngay
                </span>
              </Link>
            ))
          ) : (
            ['Văn học', 'Kinh tế', 'Công nghệ', 'Kỹ năng sống', 'Tâm lý', 'Khoa học'].map((name, i) => (
              <Link
                key={i}
                to={`/books?search=${encodeURIComponent(name)}`}
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    marginBottom: '0.85rem',
                  }}
                >
                  <BookOpen size={24} />
                </div>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {name}
                </h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Khám phá ngay
                </span>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <Sparkles size={24} color="var(--accent)" />
              Sách nổi bật gợi ý
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
              Những tác phẩm được bạn đọc quan tâm và đánh giá cao nhất
            </p>
          </div>
          <Link to="/books" style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            Xem toàn bộ <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid-books">
            {Array.from({ length: 4 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : featuredBooks.length > 0 ? (
          <div className="grid-books">
            {featuredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Chưa có sách nào trong kho"
            description="Hãy truy cập trang Quản trị (Admin) để thêm sách mới hoặc nạp dữ liệu mẫu thử nghiệm."
            actionText="Khám phá kho sách"
            onAction={() => window.location.href = '/books'}
          />
        )}
      </section>

      {/* Promotion Banner */}
      <section className="container">
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #4338ca 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '3rem 2.5rem',
            color: '#ffffff',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ maxWidth: '600px', position: 'relative', zIndex: 1 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                backgroundColor: 'rgba(245, 158, 11, 0.25)',
                color: '#fef3c7',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '1rem',
              }}
            >
              <Percent size={14} /> ƯU ĐÃI THÁNG NÀY
            </div>
            <h2 style={{ color: '#ffffff', fontSize: '2rem', marginBottom: '0.75rem' }}>
              Tuần lễ văn hóa đọc - Giảm đến 30%
            </h2>
            <p style={{ color: '#e0e7ff', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
              Áp dụng cho mọi đơn hàng sách chuyên ngành, công nghệ và phát triển bản thân. Nhập mã <strong>TRIAN30</strong> khi thanh toán.
            </p>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <Link
              to="/books"
              className="btn btn-lg"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              Mua sắm ngay <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <TrendingUp size={24} color="#059669" />
              Sách bán chạy nhất
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
              Top các đầu sách liên tục dẫn đầu lượt mua hàng tuần qua
            </p>
          </div>
          <Link to="/books?filter=best-seller" style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            Xem thêm <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid-books">
            {Array.from({ length: 4 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : bestSellers.length > 0 ? (
          <div className="grid-books">
            {bestSellers.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
};
