import React, { useState, useEffect, useMemo } from 'react';
import { isAxiosError } from 'axios';
import { bookService } from '../../services/bookService';
import { categoryService } from '../../services/categoryService';
import { authorService } from '../../services/authorService';
import { publisherService } from '../../services/publisherService';
import { Author, Book, BookRequest, Category, Publisher } from '../../types';
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
  Ban,
  RotateCcw,
  Trash2,
  BookOpen,
  Filter,
} from 'lucide-react';

const ITEMS_PER_PAGE = 8;

export const AdminBooksPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
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
    authorId: null,
    publisherId: null,
    isbn: '',
    description: '',
    imageUrl: '',
    publicationDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [deleteBookId, setDeleteBookId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isQuickAuthorOpen, setIsQuickAuthorOpen] = useState(false);
  const [isQuickCategoryOpen, setIsQuickCategoryOpen] = useState(false);
  const [isQuickPublisherOpen, setIsQuickPublisherOpen] = useState(false);
  const [quickAuthorName, setQuickAuthorName] = useState('');
  const [quickCategoryName, setQuickCategoryName] = useState('');
  const [quickPublisherName, setQuickPublisherName] = useState('');
  const [isQuickCreating, setIsQuickCreating] = useState(false);


  const { success, error } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [booksData, catsData, authorsData, publishersData] = await Promise.all([
        bookService.getAll(undefined, undefined, true),
        categoryService.getAll(),
        authorService.getAll(),
        publisherService.getAll(),
      ]);
      setBooks(booksData);
      setCategories(catsData);
      setAuthors(authorsData);
      setPublishers(publishersData);
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
    setForm({
      title: '',
      author: '',
      price: 50000,
      stock: 10,
      categoryId: categories[0]?.id || null,
      authorId: authors[0]?.id || null,
      publisherId: null,
      isbn: '',
      description: '',
      imageUrl: '',
      publicationDate: '',
    });
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
      authorId: book.authorId || null,
      publisherId: book.publisherId || null,
      isbn: book.isbn || '',
      description: book.description || '',
      imageUrl: book.imageUrl || '',
      publicationDate: book.publicationDate || '',
    });
    setIsModalOpen(true);
  };

  const handleQuickCreateAuthor = async () => {
    const name = quickAuthorName.trim();
    if (!name) return;
    try {
      setIsQuickCreating(true);
      const created = await authorService.create({ name });
      setAuthors((items) => [...items, created]);
      setForm((current) => ({ ...current, authorId: created.id, author: created.name }));
      setQuickAuthorName('');
      setIsQuickAuthorOpen(false);
      success('\u0110\u00e3 th\u00eam t\u00e1c gi\u1ea3 "' + created.name + '".');
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      error(typeof message === 'string' && message.trim() ? message : 'Kh\u00f4ng th\u1ec3 th\u00eam t\u00e1c gi\u1ea3.');
    } finally { setIsQuickCreating(false); }
  };

  const handleQuickCreateCategory = async () => {
    const name = quickCategoryName.trim();
    if (!name) return;
    try {
      setIsQuickCreating(true);
      const created = await categoryService.create({ name });
      setCategories((items) => [...items, created]);
      setForm((current) => ({ ...current, categoryId: created.id }));
      setQuickCategoryName('');
      setIsQuickCategoryOpen(false);
      success('\u0110\u00e3 th\u00eam danh m\u1ee5c "' + created.name + '".');
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      error(typeof message === 'string' && message.trim() ? message : 'Kh\u00f4ng th\u1ec3 th\u00eam danh m\u1ee5c.');
    } finally { setIsQuickCreating(false); }
  };

  const handleQuickCreatePublisher = async () => {
    const name = quickPublisherName.trim();
    if (!name) return;
    try {
      setIsQuickCreating(true);
      const created = await publisherService.create({ name });
      setPublishers((items) => [...items, created]);
      setForm((current) => ({ ...current, publisherId: created.id }));
      setQuickPublisherName('');
      setIsQuickPublisherOpen(false);
      success('Đã thêm nhà xuất bản "' + created.name + '".');
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      error(typeof message === 'string' && message.trim() ? message : 'Không thể thêm nhà xuất bản.');
    } finally { setIsQuickCreating(false); }
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
        authorId: form.authorId ? Number(form.authorId) : null,
        publisherId: form.publisherId ? Number(form.publisherId) : null,
        isbn: form.isbn?.trim() || undefined,
        description: form.description?.trim() || undefined,
        imageUrl: form.imageUrl?.trim() || undefined,
        publicationDate: form.publicationDate || undefined,
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

  const handleToggleBookStatus = async (book: Book) => {
    const active = book.active === false;
    try {
      await bookService.setActive(book.id, active);
      success(active ? `Đã mở bán lại sách "${book.title}".` : `Đã ngừng bán sách "${book.title}".`);
      loadData();
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      error(typeof message === 'string' && message.trim() ? message : 'Không thể cập nhật trạng thái sách.');
    }
  };

  const handleDeleteBook = async () => {
    if (deleteBookId === null) return;
    try {
      setIsDeleting(true);
      await bookService.delete(deleteBookId);
      success('Đã xóa sách khỏi hệ thống.');
      setDeleteBookId(null);
      loadData();
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      error(typeof message === 'string' && message.trim() ? message : 'Không thể xóa sách. Nếu sách đã phát sinh giao dịch, hãy ngừng bán.');
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

  const currentPageIds = paginatedBooks.map((book) => book.id);
  const allCurrentPageSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedBookIds.includes(id));

  const toggleBookSelection = (id: number) => {
    setSelectedBookIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  };

  const toggleCurrentPageSelection = () => {
    setSelectedBookIds((ids) => allCurrentPageSelected
      ? ids.filter((id) => !currentPageIds.includes(id))
      : Array.from(new Set([...ids, ...currentPageIds])));
  };

  const handleBulkDelete = async () => {
    if (selectedBookIds.length === 0) return;
    setIsBulkDeleting(true);
    const results = await Promise.allSettled(selectedBookIds.map((id) => bookService.delete(id)));
    const deleted = results.filter((result) => result.status === 'fulfilled').length;
    const blocked = results.length - deleted;
    setSelectedBookIds([]);
    await loadData();
    if (blocked > 0) {
      error(`Đã xóa ${deleted} sách. ${blocked} sách không thể xóa vì đã phát sinh giao dịch hoặc dữ liệu liên quan; hãy ngừng bán các sách đó.`);
    } else {
      success(`Đã xóa ${deleted} sách Đã chọn.`);
    }
    setIsBulkDeleting(false);
  };

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

      {selectedBookIds.length > 0 && (
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem' }}>
          <span>Đã chọn <strong>{selectedBookIds.length}</strong> sách</span>
          <Button variant="secondary" size="sm" onClick={() => setSelectedBookIds(allCurrentPageSelected ? [] : currentPageIds)}>{allCurrentPageSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}</Button><Button variant="danger" size="sm" onClick={() => setIsBulkConfirmOpen(true)} isLoading={isBulkDeleting} leftIcon={<Trash2 size={14} />}>
            Xóa đã chọn
          </Button>
        </div>
      )}

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
                  <tr key={b.id} style={{ opacity: b.active === false ? 0.58 : 1 }}>
                    <td><input type="checkbox" aria-label={`Chọn sách ${b.title}`} checked={selectedBookIds.includes(b.id)} onChange={() => toggleBookSelection(b.id)} /></td>
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
                          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: b.active === false ? 'grayscale(1)' : 'none' }}
                        />
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{b.title}</div>
                      {b.active === false && <span className="badge badge-outofstock">Ngừng bán</span>}
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
                          variant={b.active === false ? 'secondary' : 'danger'}
                          size="sm"
                          onClick={() => handleToggleBookStatus(b)}
                          leftIcon={b.active === false ? <RotateCcw size={14} /> : <Ban size={14} />}
                        >
                          {b.active === false ? 'Bán lại' : 'Ngừng bán'}
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


          <Select
            label="Tác giả"
            value={form.authorId || ''}
            onChange={(e) => {
              const authorId = e.target.value ? Number(e.target.value) : null;
              const author = authors.find((item) => item.id === authorId);
              setForm({
                ...form,
                authorId,
                author: author?.name || form.author,
              });
            }}
            options={authors.map((author) => ({ value: author.id, label: author.name }))}
            placeholder="-- Chọn tác giả --"
          />
          <button type="button" className="quick-add-button" onClick={() => setIsQuickAuthorOpen(true)}><Plus size={16} /><span>Thêm tác giả mới</span></button>

          <Select
            label="Nhà xuất bản"
            value={form.publisherId || ''}
            onChange={(e) =>
              setForm({ ...form, publisherId: e.target.value ? Number(e.target.value) : null })
            }
            options={publishers.map((publisher) => ({ value: publisher.id, label: publisher.name }))}
            placeholder="-- Chọn nhà xuất bản --"
          /> 
          <button type="button" className="quick-add-button" onClick={() => setIsQuickPublisherOpen(true)}><Plus size={16} /><span>Thêm nhà xuất bản mới</span></button>         <Select
            label="Danh mục thể loại"
            value={form.categoryId || ''}
            onChange={(e) =>
              setForm({ ...form, categoryId: e.target.value ? Number(e.target.value) : null })
            }
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="-- Chọn danh mục --"
          />
          <button type="button" className="quick-add-button" onClick={() => setIsQuickCategoryOpen(true)}><Plus size={16} /><span>Thêm danh mục mới</span></button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Giá bán (nghìn VNĐ) *"
              type="number"
              min="0"
              step="1"
              required
              value={form.price ? form.price / 1000 : ""}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) * 1000 })}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="ISBN"
              value={form.isbn || ''}
              onChange={(e) => setForm({ ...form, isbn: e.target.value })}
            />
            <Input
              label="Ngày xuất bản"
              type="date"
              value={form.publicationDate || ''}
              onChange={(e) => setForm({ ...form, publicationDate: e.target.value })}
            />
          </div>

          <Input
            label="URL ảnh bìa"
            value={form.imageUrl || ''}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />

          <div className="form-group">
            <label className="form-label">Mô tả sách</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
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

      <Modal isOpen={isQuickAuthorOpen} onClose={() => setIsQuickAuthorOpen(false)} title="Thêm tác giả mới" maxWidth="440px">
        <form onSubmit={(event) => { event.preventDefault(); void handleQuickCreateAuthor(); }}>
          <div className="quick-create-panel"><div className="quick-create-icon"><Edit2 size={20} /></div><div><strong>Tạo tác giả ngay trong lúc thêm sách</strong><p>Thông tin sẽ được lưu vào danh sách tác giả để bạn chọn lại sau.</p></div></div>
          <Input label="Tên tác giả *" placeholder="Ví dụ: Nguyễn Nhật Ánh" required autoFocus value={quickAuthorName} onChange={(event) => setQuickAuthorName(event.target.value)} />
          <div className="quick-create-actions"><Button type="button" variant="ghost" onClick={() => setIsQuickAuthorOpen(false)}>Hủy</Button><Button type="submit" variant="primary" isLoading={isQuickCreating} leftIcon={<Plus size={16} />}>Thêm tác giả</Button></div>
        </form>
      </Modal>

      <Modal isOpen={isQuickPublisherOpen} onClose={() => setIsQuickPublisherOpen(false)} title="Thêm nhà xuất bản mới" maxWidth="440px">
        <form onSubmit={(event) => { event.preventDefault(); void handleQuickCreatePublisher(); }}>
          <div className="quick-create-panel"><div className="quick-create-icon"><BookOpen size={20} /></div><div><strong>Tạo nhà xuất bản ngay trong lúc thêm sách</strong><p>Nhà xuất bản mới sẽ được chọn sẵn cho cuốn sách này.</p></div></div>
          <Input label="Tên nhà xuất bản *" placeholder="Ví dụ: Nhà xuất bản Trẻ" required autoFocus value={quickPublisherName} onChange={(event) => setQuickPublisherName(event.target.value)} />
          <div className="quick-create-actions"><Button type="button" variant="ghost" onClick={() => setIsQuickPublisherOpen(false)}>Hủy</Button><Button type="submit" variant="primary" isLoading={isQuickCreating} leftIcon={<Plus size={16} />}>Thêm nhà xuất bản</Button></div>
        </form>
      </Modal>

      <Modal isOpen={isQuickCategoryOpen} onClose={() => setIsQuickCategoryOpen(false)} title="Thêm danh mục mới" maxWidth="440px">
        <form onSubmit={(event) => { event.preventDefault(); void handleQuickCreateCategory(); }}>
          <div className="quick-create-panel"><div className="quick-create-icon"><Filter size={20} /></div><div><strong>Tạo danh mục ngay trong lúc thêm sách</strong><p>Danh mục mới sẽ được chọn sẵn cho cuốn sách này.</p></div></div>
          <Input label="Tên danh mục *" placeholder="Ví dụ: Kinh doanh" required autoFocus value={quickCategoryName} onChange={(event) => setQuickCategoryName(event.target.value)} />
          <div className="quick-create-actions"><Button type="button" variant="ghost" onClick={() => setIsQuickCategoryOpen(false)}>Hủy</Button><Button type="submit" variant="primary" isLoading={isQuickCreating} leftIcon={<Plus size={16} />}>Thêm danh mục</Button></div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={isBulkConfirmOpen} onClose={() => setIsBulkConfirmOpen(false)} onConfirm={async () => { setIsBulkConfirmOpen(false); await handleBulkDelete(); }} title="Xác nhận xóa sách" message={`Bạn có chắc muốn xóa ${selectedBookIds.length} sách Đã chọn không? Sách đã phát sinh giao dịch sẽ được giữ lại.`} confirmText="Xóa đã chọn" isLoading={isBulkDeleting} />

      <ConfirmDialog
        isOpen={deleteBookId !== null}
        onClose={() => setDeleteBookId(null)}
        onConfirm={handleDeleteBook}
        title="Xóa đầu sách"
        message="Chỉ xóa được sách chưa phát sinh giao dịch hoặc dữ liệu liên quan. Với sách đã bán, hãy chọn Ngừng bán."
        confirmText="Xác nhận xóa"
        isDanger
        isLoading={isDeleting}
      />
    </div>
  );
};
