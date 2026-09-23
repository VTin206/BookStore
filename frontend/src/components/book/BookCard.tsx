import React from 'react';
import { Link } from 'react-router-dom';
import { Book } from '../../types';
import { useCart } from '../../context/CartContext';
import { getBookCover } from '../../utils/bookCovers';
import { ShoppingBag, Star } from 'lucide-react';

interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { addToCart } = useCart();
  const coverUrl = getBookCover(book.title, book.category?.name, book.imageUrl);
  const isOutOfStock = book.stock <= 0;
  const rating = book.rating || 4.8;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(book, 1);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        e.currentTarget.style.borderColor = '#cbd5e1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {/* Book Cover Image */}
      <Link
        to={`/books/${book.id}`}
        style={{
          display: 'block',
          position: 'relative',
          paddingTop: '135%', // 3:4 aspect ratio
          backgroundColor: 'var(--surface-alt)',
          overflow: 'hidden',
        }}
      >
        <img
          src={coverUrl}
          alt={book.title}
          loading="lazy"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          onError={(e) => {
            // Fallback gracefully to default image if network error
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80';
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLImageElement).style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLImageElement).style.transform = 'scale(1)';
          }}
        />

        {/* Stock / Promotion Badges */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px', zIndex: 2 }}>
          {isOutOfStock ? (
            <span
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.92)',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                letterSpacing: '0.02em',
                backdropFilter: 'blur(4px)',
              }}
            >
              HẾT HÀNG
            </span>
          ) : book.category ? (
            <span
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                backdropFilter: 'blur(4px)',
              }}
            >
              {book.category.name}
            </span>
          ) : null}
        </div>
      </Link>

      {/* Book Info */}
      <div
        style={{
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {rating.toFixed(1)}
            </span>
          </div>

          <Link
            to={`/books/${book.id}`}
            style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              height: '2.7em',
              marginBottom: '4px',
            }}
            title={book.title}
          >
            {book.title}
          </Link>

          <p
            style={{
              fontSize: '0.825rem',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              margin: 0,
            }}
          >
            {book.author}
          </p>
        </div>

        {/* Price & Add to Cart Action */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '0.5rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid var(--border-light)',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: 'var(--primary)',
                letterSpacing: '-0.01em',
              }}
            >
              {Number(book.price).toLocaleString('vi-VN')} ₫
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: isOutOfStock ? 'var(--surface-alt)' : 'var(--primary-light)',
              color: isOutOfStock ? 'var(--text-muted)' : 'var(--primary)',
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isOutOfStock) {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
                e.currentTarget.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (!isOutOfStock) {
                e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                e.currentTarget.style.color = 'var(--primary)';
              }
            }}
            title={isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
            aria-label="Thêm vào giỏ"
          >
            <ShoppingBag size={17} />
          </button>
        </div>
      </div>
    </div>
  );
};
