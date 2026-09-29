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

const formatPriceLimit = (thousandVnd: number) => thousandVnd >= 1000
  ? (thousandVnd / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' triệu VNĐ'
  : thousandVnd.toLocaleString('vi-VN') + ' nghìn VNĐ';

export const BookListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';
  const filterParam = searchParams.get('filter') || '';

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters state
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categoryParam ? [categoryParam] : []);
  const [maxPrice, setMaxPrice] = useState(0);
  const [condition, setCondition] = useState<'all' | 'new' | 'used'>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('default');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    setSelectedCategories(categoryParam ? [categoryParam] : []);
  }, [categoryParam]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [booksData, catsData] = await Promise.all([
          bookService.getAll(searchParam, filterParam),
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
  }, [searchParam, filterParam]);

  // Client-side filtering & sorting
  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (selectedCategories.length) result = result.filter((b) => selectedCategories.includes(b.category?.id?.toString() || '') || selectedCategories.includes(b.category?.name || ''));
    if (maxPrice > 0) result = result.filter((b) => Number(b.price) <= maxPrice * 1000);
    if (condition !== 'all') result = result.filter((b) => ((b as Book & { condition?: string }).condition || 'new') === condition);

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
  }, [books, selectedCategories, maxPrice, condition, inStockOnly, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBooks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBooks, currentPage]);

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setMaxPrice(0);
    setCondition('all');
    setInStockOnly(false);
    setSortBy('default');
    setCurrentPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = selectedCategories.length > 0 || maxPrice > 0 || condition !== 'all' || inStockOnly || !!searchParam;

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
        <h4 className="filter-heading">Danh mục sách</h4>
        <div className="filter-options">
          {categories.map((c) => (
            <label key={c.id} className="filter-option">
              <input type="checkbox" checked={selectedCategories.includes(c.id.toString())} onChange={() => { setSelectedCategories((items) => items.includes(c.id.toString()) ? items.filter((id) => id !== c.id.toString()) : [...items, c.id.toString()]); setCurrentPage(1); }} />
              <span>{c.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="filter-heading">Khoảng giá</h4>
        {(() => {
          const highestPrice = Math.max(1000, Math.ceil(Math.max(...books.map((b) => Number(b.price)), 1000000) / 1000));
          const selectedPrice = maxPrice || highestPrice;
          return (
            <>
              <div className="price-range-labels"><span>{formatPriceLimit(0)}</span><span>{formatPriceLimit(selectedPrice)}</span></div>
              <input className="price-range-input" type="range" min="0" max={highestPrice} step="1" value={selectedPrice} onChange={(e) => { setMaxPrice(Number(e.target.value) >= highestPrice ? 0 : Number(e.target.value)); setCurrentPage(1); }} />
            </>
          );
        })()}
      </div>

      {/* Condition Filter */}
      <div>
        <h4 className="filter-heading">Tình trạng sách</h4>
        <div className="filter-options">
          {[['all', 'Tất cả'], ['new', 'Sách mới'], ['used', 'Sách cũ']].map(([value, label]) => <label key={value} className="filter-option"><input type="radio" name="condition" checked={condition === value} onChange={() => { setCondition(value as 'all' | 'new' | 'used'); setCurrentPage(1); }} /><span>{label}</span></label>)}
        </div>
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

      {filterParam === 'promo' && (
        <div
          style={{
            backgroundColor: 'var(--primary-light)',
            border: '1px solid var(--primary-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.5rem',
            marginBottom: '2rem',
          }}
        >
          Mã <strong>TRIAN30</strong> giảm 30% cho toàn bộ sách ở trang này.
        </div>
      )}

      {/* Main 2-column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
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
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Bá»™ lá»c sÃ¡ch</h3>
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
                Ãp dá»¥ng bá»™ lá»c
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



