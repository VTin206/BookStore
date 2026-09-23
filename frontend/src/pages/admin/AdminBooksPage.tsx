import React, { useState, useEffect, useMemo } from 'react';
import { bookService } from '../../services/bookService';
import { categoryService } from '../../services/categoryService';
import { Book, Category, BookRequest } from '../../types';
import { useToast } from '../../context/ToastContext';
import { getBookCover } from '../../utils/bookCovers';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Pagination } from '../../components/ui/Pagination';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Filter,
} from 'lucide-react';

const ITEMS_PER_PAGE = 8;

export const AdminBooksPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal create/edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form, setForm] = useState<BookRequest>({
    title: '',
    author: '',
    price: 0,
    stock: 0,
    categoryId: null,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Confirm delete
  const [deleteBookId, setDeleteBookId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const { success, error } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [booksData, catsData] = await Promise.all([
        bookService.getAll(),
        categoryService.getAll(),
      ]);
      setBooks(booksData);
      setCategories(catsData);
    } catch (err) {
      console.error('Failed to load books for admin', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingBook(null);
    setForm({ title: '', author: '', price: 50000, stock: 10, categoryId: categories[0]?.id || null });
    setIsModalOpen(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setForm({
      title: book.title,
      author: book.author,
      price: Number(book.price),
      stock: book.stock,
      categoryId: book.category?.id || null,
    });
    setIsModalOpen(true);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) {
      error('Vui lòng nhập tên sách và tác giả.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: BookRequest = {
        title: form.title.trim(),
        author: form.author.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        categoryId: form.categoryId ? Number(form.categoryId) : null,
      };

      if (editingBook) {
        await bookService.update(editingBook.id, payload);
        success(`Đã cập nhật sách "${payload.title}" thành công!`);
      } else {
        await bookService.create(payload);
        success(`Đã thêm sách mới "${payload.title}"!`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Save book error', err);
      error('Không thể lưu thông tin sách. Vui lòng kiểm tra lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!deleteBookId) return;
    try {
      setIsDeleting(true);
      await bookService.delete(deleteBookId);
      success('Đã xóa sách khỏi kho thành công.');
      setDeleteBookId(null);
      loadData();
    } catch {
      error('Không thể xóa sách vào lúc này.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & Search
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchSearch =
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter ? b.category?.id?.toString() === categoryFilter : true;
      return matchSearch && matchCat;
    });
  }, [books, search, categoryFilter]);

  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>Quản lý kho sách</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            Tổng cộng <strong>{books.length}</strong> đầu sách trong hệ thống
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal} leftIcon={<Plus size={18} />}>
          Thêm sách mới
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '1rem',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '280px', maxWidth: '600px' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Tìm theo tên sách, tác giả..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="form-input"
              style={{ paddingLeft: '38px', fontSize: '0.875rem' }}
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="form-select"
            style={{ width: '180px', fontSize: '0.875rem' }}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id.toString()}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <div className="card">
          <TableSkeleton rows={6} />
        </div>
      ) : paginatedBooks.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Bìa</th>
                <th>Tên sách</th>
                <th>Tác giả</th>
                <th>Danh mục</th>
                <th>Giá bán</th>
                <th>Tồn kho</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBooks.map((b) => {
                const cover = getBookCover(b.title, b.category?.name, b.imageUrl);
                return (
                  <tr key={b.id}>
                    <td>
                      <div
                        style={{
                          width: '42px',
                          height: '56px',
                          borderRadius: 'var(--radius-xs)',
                          overflow: 'hidden',
                          backgroundColor: 'var(--surface-alt)',
                        }}
                      >
                        <img
                          src={cover}
                          alt={b.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{b.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mã ID: #{b.id}</div>
                    </td>
                    <td>{b.author}</td>
                    <td>
                      <span className="badge badge-primary">{b.category?.name || '—'}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {Number(b.price).toLocaleString('vi-VN')} ₫
                      </span>
                    </td>
                    <td>
                      {b.stock <= 0 ? (
                        <span className="badge badge-outofstock">Hết hàng</span>
                      ) : b.stock < 10 ? (
                        <span className="badge badge-lowstock">Còn {b.stock}</span>
                      ) : (
                        <span className="badge badge-instock">Còn {b.stock}</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openEditModal(b)}
                          leftIcon={<Edit2 size={14} />}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteBookId(b.id)}
                          leftIcon={<Trash2 size={14} />}
                        >
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ padding: '1rem' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen size={32} />}
          title="Không tìm thấy sách nào"
          description="Thử thay đổi từ khóa tìm kiếm hoặc nhấn nút '+ Thêm sách mới' để bổ sung đầu sách vào kho."
          actionText="+ Thêm sách mới"
          onAction={openCreateModal}
        />
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBook ? 'Chỉnh sửa thông tin sách' : 'Thêm sách mới vào kho'}
        maxWidth="540px"
      >
        <form onSubmit={handleSaveBook}>
          <Input
            label="Tên sách *"
            placeholder="Nhập tiêu đề sách"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <Input
            label="Tác giả *"
            placeholder="Tên tác giả"
            required
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
          />

          <Select
            label="Danh mục thể loại"
            value={form.categoryId || ''}
            onChange={(e) =>
              setForm({ ...form, categoryId: e.target.value ? Number(e.target.value) : null })
            }
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="-- Chọn danh mục --"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Giá bán (VNĐ) *"
              type="number"
              min="0"
              step="1000"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />

            <Input
              label="Số lượng tồn kho *"
              type="number"
              min="0"
              required
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '1.5rem',
            }}
          >
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingBook ? 'Lưu thay đổi' : 'Thêm sách'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteBookId !== null}
        onClose={() => setDeleteBookId(null)}
        onConfirm={handleDeleteBook}
        title="Xóa đầu sách"
        message="Hành động này sẽ xóa vĩnh viễn cuốn sách khỏi kho dữ liệu và không thể hoàn tác. Bạn có chắc chắn muốn xóa?"
        confirmText="Xác nhận xóa"
        isDanger={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
