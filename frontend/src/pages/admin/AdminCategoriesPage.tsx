import React, { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService';
import { bookService } from '../../services/bookService';
import { Category, Book } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { FolderTree, Plus, BookOpen } from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { success, error } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [catsData, booksData] = await Promise.all([
        categoryService.getAll(),
        bookService.getAll().catch(() => []),
      ]);
      setCategories(catsData);
      setBooks(booksData);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      error('Vui lòng nhập tên danh mục.');
      return;
    }

    try {
      setIsSubmitting(true);
      await categoryService.create(newCatName.trim());
      success(`Đã thêm danh mục "${newCatName}" thành công!`);
      setNewCatName('');
      setIsModalOpen(false);
      loadData();
    } catch {
      error('Không thể tạo danh mục mới. Có thể tên đã tồn tại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
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
          <h1 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>Quản lý Danh mục Sách</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            Phân loại và tổ chức hệ thống sách ({categories.length} danh mục)
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus size={18} />}
        >
          Thêm danh mục mới
        </Button>
      </div>

      {isLoading ? (
        <div className="card">
          <TableSkeleton rows={4} />
        </div>
      ) : categories.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Tên danh mục</th>
                <th>Số lượng sách trực thuộc</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => {
                const bookCount = books.filter((b) => b.category?.id === c.id).length;
                return (
                  <tr key={c.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{c.id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {c.name}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{bookCount} đầu sách</span>
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
          description="Tạo các thể loại sách (Văn học, Kinh tế, Công nghệ, v.v.) để bạn đọc dễ dàng tìm kiếm."
          actionText="+ Thêm danh mục"
          onAction={() => setIsModalOpen(true)}
        />
      )}

      {/* Modal Add Category */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm danh mục sách mới"
        maxWidth="450px"
      >
        <form onSubmit={handleCreateCategory}>
          <Input
            label="Tên danh mục *"
            placeholder="Ví dụ: Khoa học viễn tưởng"
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
          />

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
              Tạo danh mục
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
