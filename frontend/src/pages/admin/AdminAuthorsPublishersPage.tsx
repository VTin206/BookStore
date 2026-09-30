import React, { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { authorService } from '../../services/authorService';
import { publisherService } from '../../services/publisherService';
import { Author, Publisher } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { Building, Edit2, Feather, Plus, Trash2 } from 'lucide-react';

type DeleteTarget = {
  type: 'author' | 'publisher';
  id: number;
  name: string;
};

export const AdminAuthorsPublishersPage: React.FC = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'authors' | 'publishers'>('authors');
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [authorBio, setAuthorBio] = useState('');
  const [isPublisherModalOpen, setIsPublisherModalOpen] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(null);
  const [publisherName, setPublisherName] = useState('');
  const [publisherAddress, setPublisherAddress] = useState('');
  const [publisherWebsite, setPublisherWebsite] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedAuthorIds, setSelectedAuthorIds] = useState<number[]>([]);
  const [selectedPublisherIds, setSelectedPublisherIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const { success, error } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [authorsData, publishersData] = await Promise.all([
        authorService.getAll(),
        publisherService.getAll(),
      ]);
      setAuthors(authorsData);
      setPublishers(publishersData);
    } catch (err) {
      console.error('Failed to load authors and publishers', err);
      error('Không thể tải danh sách tác giả và nhà xuất bản.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateAuthor = () => {
    setEditingAuthor(null);
    setAuthorName('');
    setAuthorBio('');
    setIsAuthorModalOpen(true);
  };

  const openEditAuthor = (author: Author) => {
    setEditingAuthor(author);
    setAuthorName(author.name);
    setAuthorBio(author.biography || '');
    setIsAuthorModalOpen(true);
  };

  const openCreatePublisher = () => {
    setEditingPublisher(null);
    setPublisherName('');
    setPublisherAddress('');
    setPublisherWebsite('');
    setIsPublisherModalOpen(true);
  };

  const openEditPublisher = (publisher: Publisher) => {
    setEditingPublisher(publisher);
    setPublisherName(publisher.name);
    setPublisherAddress(publisher.address || '');
    setPublisherWebsite(publisher.website || '');
    setIsPublisherModalOpen(true);
  };

  const handleSaveAuthor = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!authorName.trim()) {
      error('Vui lòng nhập tên tác giả.');
      return;
    }

    try {
      setIsSubmitting(true);
      const data = { name: authorName.trim(), biography: authorBio.trim() || undefined };
      if (editingAuthor) {
        await authorService.update(editingAuthor.id, data);
        success('Đã cập nhật tác giả.');
      } else {
        await authorService.create(data);
        success('Đã thêm tác giả.');
      }
      setIsAuthorModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to save author', err);
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      error(typeof message === 'string' && message.trim() ? message : 'Không thể lưu tác giả.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePublisher = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!publisherName.trim()) {
      error('Vui lòng nhập tên nhà xuất bản.');
      return;
    }

    try {
      setIsSubmitting(true);
      const data = {
        name: publisherName.trim(),
        address: publisherAddress.trim() || undefined,
        website: publisherWebsite.trim() || undefined,
      };
      if (editingPublisher) {
        await publisherService.update(editingPublisher.id, data);
        success('Đã cập nhật nhà xuất bản.');
      } else {
        await publisherService.create(data);
        success('Đã thêm nhà xuất bản.');
      }
      setIsPublisherModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to save publisher', err);
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      error(typeof message === 'string' && message.trim() ? message : 'Không thể lưu nhà xuất bản.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setIsDeleting(true);
      if (deleteTarget.type === 'author') {
        await authorService.delete(deleteTarget.id);
      } else {
        await publisherService.delete(deleteTarget.id);
      }
      success('Đã xóa thành công.');
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete catalog item', err);
      error('Không thể xóa mục đang được sách sử dụng.');
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedIds = activeTab === 'authors' ? selectedAuthorIds : selectedPublisherIds;
  const currentItems = activeTab === 'authors' ? authors : publishers;
  const allCurrentSelected = currentItems.length > 0 && currentItems.every((item) => selectedIds.includes(item.id));
  const toggleCatalogItem = (id: number) => {
    const setter = activeTab === 'authors' ? setSelectedAuthorIds : setSelectedPublisherIds;
    setter((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  };
  const toggleAllCurrent = () => {
    const setter = activeTab === 'authors' ? setSelectedAuthorIds : setSelectedPublisherIds;
    setter(allCurrentSelected ? [] : currentItems.map((item) => item.id));
  };
  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    setIsBulkDeleting(true);
    const remove = activeTab === 'authors' ? authorService.delete : publisherService.delete;
    const results = await Promise.allSettled(selectedIds.map((id) => remove(id)));
    const deleted = results.filter((item) => item.status === 'fulfilled').length;
    const blocked = results.length - deleted;
    if (activeTab === 'authors') setSelectedAuthorIds([]); else setSelectedPublisherIds([]);
    await loadData();
    if (blocked) error(`Đã xóa ${deleted} mục. ${blocked} mục đang được sách sử dụng nên không thể xóa.`);
    else success(`Đã xóa ${deleted} mục đã chọn.`);
    setIsBulkDeleting(false);
  };

  return (
    <div className="admin-catalog-page" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>Tác giả và nhà xuất bản</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            Quản lý thông tin dùng khi phát hành sách
          </p>
        </div>
        <Button
          variant="primary"
          onClick={activeTab === 'authors' ? openCreateAuthor : openCreatePublisher}
          leftIcon={<Plus size={18} />}
        >
          {activeTab === 'authors' ? 'Thêm tác giả' : 'Thêm nhà xuất bản'}
        </Button>
      </div>

      <div className="admin-catalog-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '1rem' }}>
        <button className={`tab-button ${activeTab === 'authors' ? 'is-active' : ''}`} onClick={() => setActiveTab('authors')}>
          <Feather size={18} /> Tác giả ({authors.length})
        </button>
        <button className={`tab-button ${activeTab === 'publishers' ? 'is-active' : ''}`} onClick={() => setActiveTab('publishers')}>
          <Building size={18} /> Nhà xuất bản ({publishers.length})
        </button>
      </div>

      {selectedIds.length > 0 && <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem' }}><span>Đã chọn <strong>{selectedIds.length}</strong> mục</span><Button variant="secondary" size="sm" onClick={() => { const setter = activeTab === 'authors' ? setSelectedAuthorIds : setSelectedPublisherIds; setter(allCurrentSelected ? [] : currentItems.map((item) => item.id)); }}>{allCurrentSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}</Button><Button variant="danger" size="sm" onClick={() => setIsBulkConfirmOpen(true)} isLoading={isBulkDeleting} leftIcon={<Trash2 size={14} />}>Xóa đã chọn</Button></div>}

      {isLoading ? (
        <div className="card"><TableSkeleton rows={4} /></div>
      ) : activeTab === 'authors' ? (
        <div className="table-container admin-catalog-table">
          <table className="table">
            <thead>
              <tr><th className="catalog-select-column" aria-label="Chọn"><span className="sr-only">Chọn</span></th><th>ID</th><th>Tên tác giả</th><th>Tiểu sử</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {authors.map((author) => (
                <tr key={author.id}>
                  <td><input type="checkbox" aria-label={`Chọn tác giả ${author.name}`} checked={selectedAuthorIds.includes(author.id)} onChange={() => toggleCatalogItem(author.id)} /></td>
                  <td>#{author.id}</td>
                  <td><strong>{author.name}</strong></td>
                  <td>{author.biography || '—'}</td>
                  <td>
                    <div className="catalog-row-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button variant="secondary" size="sm" onClick={() => openEditAuthor(author)} leftIcon={<Edit2 size={14} />}>Sửa</Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteTarget({ type: 'author', id: author.id, name: author.name })} leftIcon={<Trash2 size={14} />}>Xóa</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-container admin-catalog-table">
          <table className="table">
            <thead>
              <tr><th className="catalog-select-column" aria-label="Chọn"><span className="sr-only">Chọn</span></th><th>ID</th><th>Nhà xuất bản</th><th>Địa chỉ</th><th>Website</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {publishers.map((publisher) => (
                <tr key={publisher.id}>
                  <td><input type="checkbox" aria-label={`Chọn nhà xuất bản ${publisher.name}`} checked={selectedPublisherIds.includes(publisher.id)} onChange={() => toggleCatalogItem(publisher.id)} /></td>
                  <td>#{publisher.id}</td>
                  <td><strong>{publisher.name}</strong></td>
                  <td>{publisher.address || '—'}</td>
                  <td>{publisher.website ? <a href={publisher.website} target="_blank" rel="noreferrer">{publisher.website}</a> : '—'}</td>
                  <td>
                    <div className="catalog-row-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button variant="secondary" size="sm" onClick={() => openEditPublisher(publisher)} leftIcon={<Edit2 size={14} />}>Sửa</Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteTarget({ type: 'publisher', id: publisher.id, name: publisher.name })} leftIcon={<Trash2 size={14} />}>Xóa</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isAuthorModalOpen} onClose={() => setIsAuthorModalOpen(false)} title={editingAuthor ? 'Chỉnh sửa tác giả' : 'Thêm tác giả mới'} maxWidth="520px">
        <form onSubmit={handleSaveAuthor} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', padding: '1rem', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, var(--primary-light), var(--surface-alt))', border: '1px solid var(--border)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', display: 'grid', placeItems: 'center', background: 'var(--primary)', color: '#fff' }}><Feather size={22} /></div>
            <div><strong style={{ display: 'block', color: 'var(--text-primary)' }}>{editingAuthor ? 'Cập nhật hồ sơ tác giả' : 'Tạo hồ sơ tác giả'}</strong><span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Thông tin này sẽ xuất hiện khi chọn tác giả cho sách.</span></div>
          </div>
          <Input label="Tên tác giả *" placeholder="Ví dụ: Nguyễn Nhật Ánh" required value={authorName} onChange={(event) => setAuthorName(event.target.value)} />
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="author-biography">Tiểu sử</label>
            <textarea id="author-biography" className="form-textarea" rows={5} placeholder="Giới thiệu ngắn về tác giả (không bắt buộc)" value={authorBio} onChange={(event) => setAuthorBio(event.target.value)} />
            <span style={{ display: 'block', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{authorBio.length}/500 ký tự</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.25rem', borderTop: '1px solid var(--border)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsAuthorModalOpen(false)} disabled={isSubmitting}>Hủy</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>{editingAuthor ? 'Lưu thay đổi' : 'Tạo tác giả'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isPublisherModalOpen} onClose={() => setIsPublisherModalOpen(false)} title={editingPublisher ? 'Sửa nhà xuất bản' : 'Thêm nhà xuất bản'} maxWidth="460px">
        <form onSubmit={handleSavePublisher}>
          <Input label="Tên nhà xuất bản *" required value={publisherName} onChange={(event) => setPublisherName(event.target.value)} />
          <Input label="Địa chỉ" value={publisherAddress} onChange={(event) => setPublisherAddress(event.target.value)} />
          <Input label="Website" value={publisherWebsite} onChange={(event) => setPublisherWebsite(event.target.value)} placeholder="https://..." />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button type="button" variant="ghost" onClick={() => setIsPublisherModalOpen(false)}>Hủy</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>Lưu</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={isBulkConfirmOpen} onClose={() => setIsBulkConfirmOpen(false)} onConfirm={async () => { setIsBulkConfirmOpen(false); await handleBulkDelete(); }} title="Xác nhận xóa mục" message={`Bạn có chắc muốn xóa ${selectedIds.length} mục đã chọn không? Những mục đang được sách sử dụng sẽ được giữ lại.`} confirmText="Xóa đã chọn" isLoading={isBulkDeleting} />

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc muốn xóa "${deleteTarget?.name || ''}" không? Nếu đang được sách sử dụng, hệ thống sẽ từ chối.`}
        confirmText="Xóa"
        isLoading={isDeleting}
      />
    </div>
  );
};