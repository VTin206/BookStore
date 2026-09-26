import React, { useEffect, useState } from 'react';
import { categoryService } from '../../services/categoryService';
import { bookService } from '../../services/bookService';
import { Book, Category } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Edit2, FolderTree, Plus, Trash2 } from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { success, error } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [categoriesData, booksData] = await Promise.all([
        categoryService.getAll(),
        bookService.getAll().catch(() => []),
      ]);
      setCategories(categoriesData);
      setBooks(booksData);
    } catch (err) {
      console.error('Failed to load categories', err);
      error('Không thể tải danh mục sách.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || '');
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      error('Vui lòng nhập tên danh mục.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = { name: name.trim(), description: description.trim() || undefined };
      if (editingCategory) {
        await categoryService.update(editingCategory.id, payload);
        success('Đã cập nhật danh mục.');
      } else {
        await categoryService.create(payload);
        success('Đã thêm danh mục mới.');
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to save category', err);
      error('Không thể lưu danh mục. Có thể tên đã tồn tại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (deleteCategoryId === null) {
      return;
    }

    try {
      setIsDeleting(true);
      await categoryService.delete(deleteCategoryId);
      success('Đã xóa danh mục.');
      setDeleteCategoryId(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete category', err);
      error('Không thể xóa danh mục đang được sách sử dụng.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>Quản lý danh mục sách</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            Phân loại và tổ chức hệ thống sách ({categories.length} danh mục)
          </p>
        </div>
        <Button variant="primary" onClick={openCreateModal} leftIcon={<Plus size={18} />}>
          Thêm danh mục mới
        </Button>
      </div>

      {isLoading ? (
        <div className="card"><TableSkeleton rows={4} /></div>
      ) : categories.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên danh mục</th>
                <th>Mô tả</th>
                <th>Số lượng sách</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const bookCount = books.filter((book) => book.category?.id === category.id).length;
                return (
                  <tr key={category.id}>
                    <td>#{category.id}</td>
                    <td><strong>{category.name}</strong></td>
                    <td>{category.description || '—'}</td>
                    <td><span className="badge badge-primary">{bookCount} đầu sách</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <Button variant="secondary" size="sm" onClick={() => openEditModal(category)} leftIcon={<Edit2 size={14} />}>
                          Sửa
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteCategoryId(category.id)} leftIcon={<Trash2 size={14} />}>
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<FolderTree size={32} />}
          title="Chưa có danh mục nào"
          description="Tạo các thể loại sách để độc giả dễ dàng tìm kiếm."
          actionText="+ Thêm danh mục"
          onAction={openCreateModal}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục sách mới'}
        maxWidth="450px"
      >
        <form onSubmit={handleSaveCategory}>
          <Input
            label="Tên danh mục *"
            placeholder="Ví dụ: Khoa học viễn tưởng"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingCategory ? 'Lưu thay đổi' : 'Tạo danh mục'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteCategoryId !== null}
        onClose={() => setDeleteCategoryId(null)}
        onConfirm={handleDeleteCategory}
        title="Xác nhận xóa danh mục"
        message="Danh mục đang được sách sử dụng sẽ không thể xóa. Bạn có chắc muốn tiếp tục?"
        confirmText="Xóa"
        isLoading={isDeleting}
      />
    </div>
  );
};