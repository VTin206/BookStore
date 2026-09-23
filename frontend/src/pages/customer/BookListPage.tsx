import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { bookService } from '../../services/bookService';
import { categoryService } from '../../services/categoryService';
import { Book, Category } from '../../types';
import { BookCard } from '../../components/book/BookCard';
import { BookCardSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { Button } from '../../components/ui/Button';
import { Filter, SlidersHorizontal, X, Search, Check } from 'lucide-react';

const ITEMS_PER_PAGE = 8;

export const BookListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [priceRange, setPriceRange] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('default');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [booksData, catsData] = await Promise.all([
          bookService.getAll(searchParam),
          categoryService.getAll(),
        ]);
        setBooks(booksData);
        setCategories(catsData);
      } catch (err) {
        console.error('Failed to load books', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [searchParam]);

  // Client-side filtering & sorting
  const filteredBooks = useMemo(() => {
    let result = [...books];

    // Category filter
    if (selectedCategory) {
      result = result.filter(
        (b) => b.category?.id?.toString() === selectedCategory || b.category?.name === selectedCategory
      );
    }

    // Price range filter
    if (priceRange === 'under-100') {
      result = result.filter((b) => Number(b.price) < 100000);
    } else if (priceRange === '100-200') {
      result = result.filter((b) => Number(b.price) >= 100000 && Number(b.price) <= 200000);
    } else if (priceRange === 'over-200') {
      result = result.filter((b) => Number(b.price) > 200000);
    }

    // In-stock only filter
    if (inStockOnly) {
      result = result.filter((b) => b.stock > 0);
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.title.localeCompare(a.title));
    }

    return result;
  }, [books, selectedCategory, priceRange, inStockOnly, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBooks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBooks, currentPage]);

  const clearAllFilters = () => {
    setSelectedCategory('');
    setPriceRange('all');
    setInStockOnly(false);
    setSortBy('default');
    setCurrentPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = !!selectedCategory || priceRange !== 'all' || inStockOnly || !!searchParam;

  const renderFilterPanel = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal size={18} color="var(--primary)" /> Bộ lọc tìm kiếm
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          Danh mục sách
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.875rem',
              cursor: 'pointer',
              color: !selectedCategory ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: !selectedCategory ? 700 : 400,
            }}
          >
            <input
              type="radio"
              name="category"
              checked={!selectedCategory}
              onChange={() => {
                setSelectedCategory('');
                setCurrentPage(1);
              }}
            />
            Tất cả danh mục
          </label>
          {categories.map((c) => (
            <label
              key={c.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.875rem',
                cursor: 'pointer',
                color: selectedCategory === c.id.toString() ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: selectedCategory === c.id.toString() ? 700 : 400,
              }}
            >
              <input
                type="radio"
                name="category"
                checked={selectedCategory === c.id.toString()}
                onChange={() => {
                  setSelectedCategory(c.id.toString());
                  setCurrentPage(1);
                }}
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          Khoảng giá
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { value: 'all', label: 'Tất cả mức giá' },
            { value: 'under-100', label: 'Dưới 100.000₫' },
            { value: '100-200', label: '100.000₫ - 200.000₫' },
            { value: 'over-200', label: 'Trên 200.000₫' },
          ].map((item) => (
            <label
              key={item.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.875rem',
                cursor: 'pointer',
                color: priceRange === item.value ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: priceRange === item.value ? 700 : 400,
              }}
            >
              <input
                type="radio"
                name="priceRange"
                checked={priceRange === item.value}
                onChange={() => {
                  setPriceRange(item.value);
                  setCurrentPage(1);
                }}
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      {/* Availability Filter */}
      <div>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          Tình trạng
        </h4>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => {
              setInStockOnly(e.target.checked);
              setCurrentPage(1);
            }}
          />
          Chỉ hiện sách còn hàng
        </label>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ padding: '2.5rem 1rem' }}>
      {/* Search Header Banner */}
      {searchParam && (
        <div
          style={{
            backgroundColor: 'var(--primary-light)',
            border: '1px solid var(--primary-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={18} color="var(--primary)" />
            <span style={{ fontSize: '0.95rem' }}>
              Kết quả tìm kiếm cho: <strong>"{searchParam}"</strong>
            </span>
          </div>
          <button
            onClick={() => {
              setSearchParams({});
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <X size={16} /> Bỏ tìm kiếm
          </button>
        </div>
      )}

      {/* Main 2-column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '2.5rem',
          alignItems: 'start',
        }}
        className="book-list-layout"
      >
        {/* Desktop Sidebar Filter */}
        <aside
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-xs)',
            position: 'sticky',
            top: '90px',
          }}
          className="desktop-filter-sidebar"
        >
          {renderFilterPanel()}
        </aside>

        {/* Right Main Content */}
        <main>
          {/* Top Control Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '1.5rem',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.85rem 1.25rem',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Hiển thị <strong>{filteredBooks.length}</strong> tựa sách
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Mobile Filter Toggle */}
              <button
                className="btn btn-secondary btn-sm mobile-filter-btn"
                onClick={() => setIsMobileFilterOpen(true)}
                style={{ display: 'none' }}
              >
                <Filter size={16} /> Lọc ({hasActiveFilters ? '1+' : '0'})
              </button>

              {/* Sort Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface)',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                >
                  <option value="default">Mặc định</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                  <option value="name-asc">Tên sách: A - Z</option>
                  <option value="name-desc">Tên sách: Z - A</option>
                </select>
              </div>
            </div>
          </div>

          {/* Book Cards Grid */}
          {isLoading ? (
            <div className="grid-books">
              {Array.from({ length: 8 }).map((_, i) => (
                <BookCardSkeleton key={i} />
              ))}
            </div>
          ) : paginatedBooks.length > 0 ? (
            <>
              <div className="grid-books">
                {paginatedBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </>
          ) : (
            <EmptyState
              title="Không tìm thấy sách nào phù hợp"
              description="Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ các tiêu chí lọc để xem thêm nhiều sách hơn."
              actionText="Xóa toàn bộ bộ lọc"
              onAction={clearAllFilters}
            />
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer Modal */}
      {isMobileFilterOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMobileFilterOpen(false);
          }}
        >
          <div
            className="fade-in"
            style={{
              width: '85%',
              maxWidth: '320px',
              height: '100%',
              backgroundColor: 'var(--surface)',
              padding: '1.5rem',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Bộ lọc sách</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>
            {renderFilterPanel()}
            <div style={{ marginTop: '2rem' }}>
              <Button
                variant="primary"
                style={{ width: '100%' }}
                onClick={() => setIsMobileFilterOpen(false)}
              >
                Áp dụng bộ lọc
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
