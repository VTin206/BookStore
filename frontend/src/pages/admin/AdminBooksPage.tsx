import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  const coverInputRef = useRef<HTMLInputElement>(null);

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
      publicationDate: book.publicationDate ? book.publicationDate.slice(0, 4) : '',
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
      success('ÄÃ£ thÃªm nhÃ  xuáº¥t báº£n "' + created.name + '".');
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      error(typeof message === 'string' && message.trim() ? message : 'KhÃ´ng thá»ƒ thÃªm nhÃ  xuáº¥t báº£n.');
    } finally { setIsQuickCreating(false); }
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedAuthor = authors.find((item) => item.id === Number(form.authorId));
    const authorName = selectedAuthor?.name || form.author.trim();
    if (!form.title.trim() || !authorName) {
      error('Vui lÃ²ng nháº­p tÃªn sÃ¡ch vÃ  chá»n tÃ¡c giáº£.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: BookRequest = {
        title: form.title.trim(),
        author: authorName,
        price: Number(form.price),
        stock: Number(form.stock),
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        authorId: form.authorId ? Number(form.authorId) : null,
        publisherId: form.publisherId ? Number(form.publisherId) : null,
        isbn: form.isbn?.trim() || undefined,
        description: form.description?.trim() || undefined,
        imageUrl: form.imageUrl?.trim() || undefined,
        publicationDate: form.publicationDate ? (/^\d{4}$/.test(form.publicationDate) ? form.publicationDate + '-01-01' : form.publicationDate) : undefined,
      };

      if (editingBook) {
        await bookService.update(editingBook.id, payload);
        success(`ÄÃ£ cáº­p nháº­t sÃ¡ch "${payload.title}" thÃ nh cÃ´ng!`);
      } else {
        await bookService.create(payload);
        success(`ÄÃ£ thÃªm sÃ¡ch má»›i "${payload.title}"!`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Save book error', err);
      error('KhÃ´ng thá»ƒ lÆ°u thÃ´ng tin sÃ¡ch. Vui lÃ²ng kiá»ƒm tra láº¡i!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleBookStatus = async (book: Book) => {
    const active = book.active === false;
    try {
      await bookService.setActive(book.id, active);
      success(active ? `ÄÃ£ má»Ÿ bÃ¡n láº¡i sÃ¡ch "${book.title}".` : `ÄÃ£ ngá»«ng bÃ¡n sÃ¡ch "${book.title}".`);
      loadData();
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      error(typeof message === 'string' && message.trim() ? message : 'KhÃ´ng thá»ƒ cáº­p nháº­t tráº¡ng thÃ¡i sÃ¡ch.');
    }
  };

  const handleDeleteBook = async () => {
    if (deleteBookId === null) return;
    try {
      setIsDeleting(true);
      await bookService.delete(deleteBookId);
      success('ÄÃ£ xÃ³a sÃ¡ch khá»i há»‡ thá»‘ng.');
      setDeleteBookId(null);
      loadData();
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      error(typeof message === 'string' && message.trim() ? message : 'KhÃ´ng thá»ƒ xÃ³a sÃ¡ch. Náº¿u sÃ¡ch Ä‘Ã£ phÃ¡t sinh giao dá»‹ch, hÃ£y ngá»«ng bÃ¡n.');
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
      error(`ÄÃ£ xÃ³a ${deleted} sÃ¡ch. ${blocked} sÃ¡ch khÃ´ng thá»ƒ xÃ³a vÃ¬ Ä‘Ã£ phÃ¡t sinh giao dá»‹ch hoáº·c dá»¯ liá»‡u liÃªn quan; hÃ£y ngá»«ng bÃ¡n cÃ¡c sÃ¡ch Ä‘Ã³.`);
    } else {
      success(`ÄÃ£ xÃ³a ${deleted} sÃ¡ch ÄÃ£ chá»n.`);
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
          <h1 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>Quáº£n lÃ½ kho sÃ¡ch</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            Tá»•ng cá»™ng <strong>{books.length}</strong> Ä‘áº§u sÃ¡ch trong há»‡ thá»‘ng
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal} leftIcon={<Plus size={18} />}>
          ThÃªm sÃ¡ch má»›i
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
              placeholder="TÃ¬m theo tÃªn sÃ¡ch, tÃ¡c giáº£..."
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
            <option value="">Táº¥t cáº£ danh má»¥c</option>
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
          <span>ÄÃ£ chá»n <strong>{selectedBookIds.length}</strong> sÃ¡ch</span>
          <Button variant="secondary" size="sm" onClick={() => setSelectedBookIds(allCurrentPageSelected ? [] : currentPageIds)}>{allCurrentPageSelected ? 'Bá» chá»n táº¥t cáº£' : 'Chá»n táº¥t cáº£'}</Button><Button variant="danger" size="sm" onClick={() => setIsBulkConfirmOpen(true)} isLoading={isBulkDeleting} leftIcon={<Trash2 size={14} />}>
            XÃ³a Ä‘Ã£ chá»n
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
                <th style={{ width: '60px' }}>BÃ¬a</th>
                <th>TÃªn sÃ¡ch</th>
                <th>TÃ¡c giáº£</th>
                <th>Danh má»¥c</th>
                <th>GiÃ¡ bÃ¡n</th>
                <th>Tá»“n kho</th>
                <th style={{ textAlign: 'right' }}>Thao tÃ¡c</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBooks.map((b) => {
                const cover = getBookCover(b.title, b.category?.name, b.imageUrl);
                return (
                  <tr key={b.id} style={{ opacity: b.active === false ? 0.58 : 1 }}>
                    <td><input type="checkbox" aria-label={`Chá»n sÃ¡ch ${b.title}`} checked={selectedBookIds.includes(b.id)} onChange={() => toggleBookSelection(b.id)} /></td>
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
                      {b.active === false && <span className="badge badge-outofstock">Ngá»«ng bÃ¡n</span>}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MÃ£ ID: #{b.id}</div>
                    </td>
                    <td>{b.author}</td>
                    <td>
                      <span className="badge badge-primary">{b.category?.name || 'â€”'}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {Number(b.price).toLocaleString('vi-VN')} â‚«
                      </span>
                    </td>
                    <td>
                      {b.stock <= 0 ? (
                        <span className="badge badge-outofstock">Háº¿t hÃ ng</span>
                      ) : b.stock < 10 ? (
                        <span className="badge badge-lowstock">CÃ²n {b.stock}</span>
                      ) : (
                        <span className="badge badge-instock">CÃ²n {b.stock}</span>
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
                          Sá»­a
                        </Button>
                        <Button
                          variant={b.active === false ? 'secondary' : 'danger'}
                          size="sm"
                          onClick={() => handleToggleBookStatus(b)}
                          leftIcon={b.active === false ? <RotateCcw size={14} /> : <Ban size={14} />}
                        >
                          {b.active === false ? 'BÃ¡n láº¡i' : 'Ngá»«ng bÃ¡n'}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteBookId(b.id)}
                          leftIcon={<Trash2 size={14} />}
                        >
                          XÃ³a
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
          title="KhÃ´ng tÃ¬m tháº¥y sÃ¡ch nÃ o"
          description="Thá»­ thay Ä‘á»•i tá»« khÃ³a tÃ¬m kiáº¿m hoáº·c nháº¥n nÃºt '+ ThÃªm sÃ¡ch má»›i' Ä‘á»ƒ bá»• sung Ä‘áº§u sÃ¡ch vÃ o kho."
          actionText="+ ThÃªm sÃ¡ch má»›i"
          onAction={openCreateModal}
        />
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBook ? 'Chá»‰nh sá»­a thÃ´ng tin sÃ¡ch' : 'ThÃªm sÃ¡ch má»›i vÃ o kho'}
        maxWidth="540px"
      >
        <form onSubmit={handleSaveBook}>
          <Input
            label="TÃªn sÃ¡ch *"
            placeholder="Nháº­p tiÃªu Ä‘á» sÃ¡ch"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />


          <Select
            label="TÃ¡c giáº£"
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
            placeholder="-- Chá»n tÃ¡c giáº£ --"
          />
          <button type="button" className="quick-add-button" onClick={() => setIsQuickAuthorOpen(true)}><Plus size={16} /><span>ThÃªm tÃ¡c giáº£ má»›i</span></button>

          <Select
            label="NhÃ  xuáº¥t báº£n"
            value={form.publisherId || ''}
            onChange={(e) =>
              setForm({ ...form, publisherId: e.target.value ? Number(e.target.value) : null })
            }
            options={publishers.map((publisher) => ({ value: publisher.id, label: publisher.name }))}
            placeholder="-- Chá»n nhÃ  xuáº¥t báº£n --"
          /> 
          <button type="button" className="quick-add-button" onClick={() => setIsQuickPublisherOpen(true)}><Plus size={16} /><span>ThÃªm nhÃ  xuáº¥t báº£n má»›i</span></button>         <Select
            label="Danh má»¥c thá»ƒ loáº¡i"
            value={form.categoryId || ''}
            onChange={(e) =>
              setForm({ ...form, categoryId: e.target.value ? Number(e.target.value) : null })
            }
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="-- Chá»n danh má»¥c --"
          />
          <button type="button" className="quick-add-button" onClick={() => setIsQuickCategoryOpen(true)}><Plus size={16} /><span>ThÃªm danh má»¥c má»›i</span></button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="GiÃ¡ bÃ¡n (nghÃ¬n VNÄ) *"
              type="number"
              min="0"
              step="1"
              required
              value={form.price ? form.price / 1000 : ""}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) * 1000 })}
            />

            <Input
              label="Sá»‘ lÆ°á»£ng tá»“n kho *"
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
              label="NÄƒm xuáº¥t báº£n"
              type="number"
              min="1000"
              max={new Date().getFullYear()}
              step="1"
              placeholder="VÃ­ dá»¥: 2024"
              value={form.publicationDate || ''}
              onChange={(e) => setForm({ ...form, publicationDate: e.target.value.slice(0, 4) })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">áº¢nh bÃ¬a</label>
            <div className="cover-upload-row">
              <Input
                value={form.imageUrl || ''}
                placeholder="DÃ¡n URL áº£nh hoáº·c táº£i áº£nh lÃªn"
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
              <input ref={coverInputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (file.size > 2 * 1024 * 1024) { error('áº¢nh bÃ¬a khÃ´ng Ä‘Æ°á»£c vÆ°á»£t quÃ¡ 2MB.'); return; }
                const reader = new FileReader();
                reader.onload = () => setForm((current) => ({ ...current, imageUrl: String(reader.result) }));
                reader.readAsDataURL(file);
              }} />
              <Button type="button" variant="secondary" onClick={() => coverInputRef.current?.click()} leftIcon={<Plus size={16} />}>Táº£i áº£nh lÃªn</Button>
            </div>
            {form.imageUrl && <img className="cover-upload-preview" src={form.imageUrl} alt="Xem trÆ°á»›c áº£nh bÃ¬a" />}
          </div>

          <div className="form-group">
            <label className="form-label">MÃ´ táº£ sÃ¡ch</label>
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
              Há»§y
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingBook ? 'LÆ°u thay Ä‘á»•i' : 'ThÃªm sÃ¡ch'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isQuickAuthorOpen} onClose={() => setIsQuickAuthorOpen(false)} title="ThÃªm tÃ¡c giáº£ má»›i" maxWidth="440px">
        <form onSubmit={(event) => { event.preventDefault(); void handleQuickCreateAuthor(); }}>
          <div className="quick-create-panel"><div className="quick-create-icon"><Edit2 size={20} /></div><div><strong>Táº¡o tÃ¡c giáº£ ngay trong lÃºc thÃªm sÃ¡ch</strong><p>ThÃ´ng tin sáº½ Ä‘Æ°á»£c lÆ°u vÃ o danh sÃ¡ch tÃ¡c giáº£ Ä‘á»ƒ báº¡n chá»n láº¡i sau.</p></div></div>
          <Input label="TÃªn tÃ¡c giáº£ *" placeholder="VÃ­ dá»¥: Nguyá»…n Nháº­t Ãnh" required autoFocus value={quickAuthorName} onChange={(event) => setQuickAuthorName(event.target.value)} />
          <div className="quick-create-actions"><Button type="button" variant="ghost" onClick={() => setIsQuickAuthorOpen(false)}>Há»§y</Button><Button type="submit" variant="primary" isLoading={isQuickCreating} leftIcon={<Plus size={16} />}>ThÃªm tÃ¡c giáº£</Button></div>
        </form>
      </Modal>

      <Modal isOpen={isQuickPublisherOpen} onClose={() => setIsQuickPublisherOpen(false)} title="ThÃªm nhÃ  xuáº¥t báº£n má»›i" maxWidth="440px">
        <form onSubmit={(event) => { event.preventDefault(); void handleQuickCreatePublisher(); }}>
          <div className="quick-create-panel"><div className="quick-create-icon"><BookOpen size={20} /></div><div><strong>Táº¡o nhÃ  xuáº¥t báº£n ngay trong lÃºc thÃªm sÃ¡ch</strong><p>NhÃ  xuáº¥t báº£n má»›i sáº½ Ä‘Æ°á»£c chá»n sáºµn cho cuá»‘n sÃ¡ch nÃ y.</p></div></div>
          <Input label="TÃªn nhÃ  xuáº¥t báº£n *" placeholder="VÃ­ dá»¥: NhÃ  xuáº¥t báº£n Tráº»" required autoFocus value={quickPublisherName} onChange={(event) => setQuickPublisherName(event.target.value)} />
          <div className="quick-create-actions"><Button type="button" variant="ghost" onClick={() => setIsQuickPublisherOpen(false)}>Há»§y</Button><Button type="submit" variant="primary" isLoading={isQuickCreating} leftIcon={<Plus size={16} />}>ThÃªm nhÃ  xuáº¥t báº£n</Button></div>
        </form>
      </Modal>

      <Modal isOpen={isQuickCategoryOpen} onClose={() => setIsQuickCategoryOpen(false)} title="ThÃªm danh má»¥c má»›i" maxWidth="440px">
        <form onSubmit={(event) => { event.preventDefault(); void handleQuickCreateCategory(); }}>
          <div className="quick-create-panel"><div className="quick-create-icon"><Filter size={20} /></div><div><strong>Táº¡o danh má»¥c ngay trong lÃºc thÃªm sÃ¡ch</strong><p>Danh má»¥c má»›i sáº½ Ä‘Æ°á»£c chá»n sáºµn cho cuá»‘n sÃ¡ch nÃ y.</p></div></div>
          <Input label="TÃªn danh má»¥c *" placeholder="VÃ­ dá»¥: Kinh doanh" required autoFocus value={quickCategoryName} onChange={(event) => setQuickCategoryName(event.target.value)} />
          <div className="quick-create-actions"><Button type="button" variant="ghost" onClick={() => setIsQuickCategoryOpen(false)}>Há»§y</Button><Button type="submit" variant="primary" isLoading={isQuickCreating} leftIcon={<Plus size={16} />}>ThÃªm danh má»¥c</Button></div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={isBulkConfirmOpen} onClose={() => setIsBulkConfirmOpen(false)} onConfirm={async () => { setIsBulkConfirmOpen(false); await handleBulkDelete(); }} title="XÃ¡c nháº­n xÃ³a sÃ¡ch" message={`Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a ${selectedBookIds.length} sÃ¡ch ÄÃ£ chá»n khÃ´ng? SÃ¡ch Ä‘Ã£ phÃ¡t sinh giao dá»‹ch sáº½ Ä‘Æ°á»£c giá»¯ láº¡i.`} confirmText="XÃ³a Ä‘Ã£ chá»n" isLoading={isBulkDeleting} />

      <ConfirmDialog
        isOpen={deleteBookId !== null}
        onClose={() => setDeleteBookId(null)}
        onConfirm={handleDeleteBook}
        title="XÃ³a Ä‘áº§u sÃ¡ch"
        message="Chá»‰ xÃ³a Ä‘Æ°á»£c sÃ¡ch chÆ°a phÃ¡t sinh giao dá»‹ch hoáº·c dá»¯ liá»‡u liÃªn quan. Vá»›i sÃ¡ch Ä‘Ã£ bÃ¡n, hÃ£y chá»n Ngá»«ng bÃ¡n."
        confirmText="XÃ¡c nháº­n xÃ³a"
        isDanger
        isLoading={isDeleting}
      />
    </div>
  );
};

