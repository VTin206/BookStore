import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bookService } from '../../services/bookService';
import { reviewService } from '../../services/reviewService';
import { Book, Review } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getBookCover } from '../../utils/bookCovers';
import { Button } from '../../components/ui/Button';
import { BookCard } from '../../components/book/BookCard';
import { BookCardSkeleton } from '../../components/ui/LoadingSkeleton';
import {
  Star,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
  BookOpen,
  Send,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';

export const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, username } = useAuth();
  const { success, error } = useToast();

  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  // Review form
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await bookService.getById(id);
        setBook(data);

        // Fetch reviews
        const revs = await reviewService.getByBook(id);
        setReviews(revs);

        // Fetch related books
        const allBooks = await bookService.getAll();
        const related = allBooks.filter((b) => b.id.toString() !== id && b.category?.id === data.category?.id);
        setRelatedBooks(related.slice(0, 4));
      } catch (err) {
        console.error('Failed to load book detail', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBook();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '3rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 420px) 1fr', gap: '3rem' }}>
          <div style={{ height: '480px', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius-xl)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ height: '36px', width: '70%', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius-md)' }} />
            <div style={{ height: '24px', width: '40%', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius-md)' }} />
            <div style={{ height: '48px', width: '50%', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius-md)' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>Không tìm thấy cuốn sách này</h2>
        <p style={{ margin: '1rem 0 2rem' }}>Sách có thể đã bị xóa hoặc đường dẫn không chính xác.</p>
        <Link to="/books" className="btn btn-primary">Quay lại danh mục sách</Link>
      </div>
    );
  }

  const coverUrl = getBookCover(book.title, book.category?.name, book.imageUrl);
  const isOutOfStock = book.stock <= 0;

  const handleAddToCart = () => {
    addToCart(book, quantity);
  };

  const handleBuyNow = () => {
    addToCart(book, quantity);
    navigate('/cart');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      error('Vui lòng đăng nhập để gửi đánh giá.');
      navigate('/login');
      return;
    }
    if (!comment.trim()) {
      error('Vui lòng nhập nội dung đánh giá.');
      return;
    }

    try {
      setIsSubmittingReview(true);
      await reviewService.create({
        bookId: Number(book.id),
        rating,
        comment: comment.trim(),
      });
      success('Cảm ơn bạn đã gửi đánh giá cho cuốn sách!');
      setComment('');
      // Reload reviews
      const revs = await reviewService.getByBook(book.id);
      setReviews(revs);
    } catch {
      error('Không thể gửi đánh giá vào lúc này.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
      {/* Breadcrumbs */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          marginBottom: '2rem',
        }}
      >
        <Link to="/" style={{ color: 'var(--text-secondary)' }}>Trang chủ</Link>
        <ChevronRight size={14} />
        <Link to="/books" style={{ color: 'var(--text-secondary)' }}>Sách</Link>
        {book.category && (
          <>
            <ChevronRight size={14} />
            <Link to={`/books?category=${book.category.id}`} style={{ color: 'var(--text-secondary)' }}>
              {book.category.name}
            </Link>
          </>
        )}
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{book.title}</span>
      </nav>

      {/* Main Book Detail Card */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem',
        }}
      >
        {/* Book Image */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '340px',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xl)',
              backgroundColor: 'var(--surface-alt)',
              paddingTop: '135%',
            }}
          >
            <img
              src={coverUrl}
              alt={book.title}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
            * Hình ảnh minh họa bìa ấn phẩm chính thức
          </span>
        </div>

        {/* Book Info & Purchase Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {book.category && (
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  marginBottom: '0.75rem',
                }}
              >
                {book.category.name}
              </span>
            )}

            <h1
              style={{
                fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)',
                fontWeight: 800,
                lineHeight: 1.25,
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
              }}
            >
              {book.title}
            </h1>

            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Tác giả: <strong>{book.author}</strong>
            </p>

            {/* Rating Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={18} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {book.rating || 4.8}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                ({reviews.length} đánh giá từ độc giả)
              </span>
            </div>

            {/* Price Block */}
            <div
              style={{
                backgroundColor: 'var(--surface-alt)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'baseline',
                gap: '1rem',
                marginBottom: '1.75rem',
              }}
            >
              <span
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                {Number(book.price).toLocaleString('vi-VN')} ₫
              </span>
              <span
                style={{
                  fontSize: '1rem',
                  color: 'var(--text-muted)',
                  textDecoration: 'line-through',
                }}
              >
                {(Number(book.price) * 1.2).toLocaleString('vi-VN')} ₫
              </span>
              <span
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                -20% TIẾT KIỆM
              </span>
            </div>

            {/* Stock status & quantity stepper */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tình trạng kho:</span>
                {isOutOfStock ? (
                  <span className="badge badge-outofstock">Hết hàng</span>
                ) : (
                  <span className="badge badge-instock">Còn hàng ({book.stock} cuốn)</span>
                )}
              </div>

              {!isOutOfStock && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Số lượng:</span>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1.5px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--surface)',
                    }}
                  >
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{
                        padding: '6px 12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                      }}
                      aria-label="Giảm"
                    >
                      <Minus size={16} />
                    </button>
                    <span style={{ padding: '0 12px', fontWeight: 700, minWidth: '32px', textAlign: 'center' }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                      style={{
                        padding: '6px 12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                      }}
                      aria-label="Tăng"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Button
                variant="outline"
                size="lg"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                leftIcon={<ShoppingBag size={20} />}
                style={{ flex: 1, minWidth: '180px' }}
              >
                Thêm vào giỏ hàng
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                leftIcon={<Zap size={20} />}
                style={{ flex: 1, minWidth: '180px', backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' }}
              >
                Mua ngay
              </Button>
            </div>
          </div>

          {/* Guarantees */}
          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border)',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={16} color="var(--primary)" /> Giao nhanh 24-48h
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#059669" /> 100% Chính hãng
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RotateCcw size={16} color="var(--accent)" /> Đổi trả 30 ngày
            </div>
          </div>
        </div>
      </div>

      {/* Detail Tabs (Description, Specifications, Reviews) */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          marginBottom: '3.5rem',
        }}
      >
        {/* Tab Headers */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--surface-alt)',
          }}
        >
          {[
            { id: 'desc', label: 'Giới thiệu tác phẩm' },
            { id: 'specs', label: 'Thông tin chi tiết' },
            { id: 'reviews', label: `Đánh giá từ độc giả (${reviews.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '1rem 1.75rem',
                border: 'none',
                background: activeTab === tab.id ? 'var(--surface)' : 'transparent',
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : 'none',
                cursor: 'pointer',
                fontSize: '0.95rem',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: '2rem' }}>
          {activeTab === 'desc' && (
            <div style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              <p style={{ marginBottom: '1.25rem' }}>
                Tác phẩm <strong>"{book.title}"</strong> của tác giả <strong>{book.author}</strong> là một trong những cuốn sách tiêu biểu thuộc thể loại {book.category?.name || 'sách hay'}. Tác phẩm mang đến cho người đọc những góc nhìn sâu sắc, mở rộng hiểu biết và gợi mở nhiều chiêm nghiệm giá trị về cuộc sống và công việc.
              </p>
              <p>
                Với văn phong lôi cuốn, cô đọng nhưng không kém phần truyền cảm hứng, cuốn sách xứng đáng có một vị trí trang trọng trong tủ sách gia đình cũng như đồng hành cùng độc giả trên hành trình trau dồi tri thức mỗi ngày.
              </p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div style={{ maxWidth: '600px' }}>
              <table className="table">
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600, width: '40%', color: 'var(--text-secondary)' }}>Tên sách</td>
                    <td>{book.title}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Tác giả</td>
                    <td>{book.author}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Thể loại</td>
                    <td>{book.category?.name || 'Chung'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Mã ISBN</td>
                    <td>{book.isbn || '978-604-2-08543-1'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Hình thức bìa</td>
                    <td>Bìa mềm cao cấp</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Ngôn ngữ</td>
                    <td>Tiếng Việt</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              {/* Write Review Form */}
              <div
                style={{
                  backgroundColor: 'var(--surface-alt)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                }}
              >
                <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Viết đánh giá của bạn</h4>
                <form onSubmit={handleSubmitReview}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Chọn số sao:</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                        >
                          <Star
                            size={22}
                            fill={s <= rating ? '#f59e0b' : 'none'}
                            color={s <= rating ? '#f59e0b' : '#cbd5e1'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <textarea
                      placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      className="form-textarea"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSubmittingReview}
                    leftIcon={<Send size={15} />}
                  >
                    Gửi nhận xét
                  </Button>
                </form>
              </div>

              {/* Reviews List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {reviews.length > 0 ? (
                  reviews.map((r, i) => (
                    <div
                      key={r.id || i}
                      style={{
                        paddingBottom: '1.25rem',
                        borderBottom: '1px solid var(--border-light)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
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
                            fontSize: '0.8rem',
                          }}
                        >
                          <UserIcon size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                            {r.userName || 'Bạn đọc yêu sách'}
                          </div>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={12}
                                fill={s <= r.rating ? '#f59e0b' : 'none'}
                                color={s <= r.rating ? '#f59e0b' : '#cbd5e1'}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {r.comment || 'Sách rất hay và đáng đọc!'}
                      </p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Chưa có nhận xét nào. Hãy là người đầu tiên chia sẻ cảm nghĩ về cuốn sách này!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Books Section */}
      {relatedBooks.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} color="var(--primary)" /> Sách cùng thể loại gợi ý
          </h2>
          <div className="grid-books">
            {relatedBooks.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
