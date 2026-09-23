import React, { useState, useEffect } from 'react';
import { authorService } from '../../services/authorService';
import { publisherService } from '../../services/publisherService';
import { Author, Publisher } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { Feather, Building, Plus } from 'lucide-react';

export const AdminAuthorsPublishersPage: React.FC = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'authors' | 'publishers'>('authors');

  // Modals
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorBio, setAuthorBio] = useState('');

  const [isPubModalOpen, setIsPubModalOpen] = useState(false);
  const [pubName, setPubName] = useState('');
  const [pubAddress, setPubAddress] = useState('');
  const [pubWebsite, setPubWebsite] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [authorsData, pubsData] = await Promise.all([
        authorService.getAll().catch(() => []),
        publisherService.getAll().catch(() => []),
      ]);
      setAuthors(authorsData);
      setPublishers(pubsData);
    } catch (err) {
      console.error('Failed to load authors/publishers', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      error('Vui lòng nhập tên tác giả.');
      return;
    }
    try {
      setIsSubmitting(true);
      await authorService.create({ name: authorName.trim(), biography: authorBio.trim() });
      success(`Đã thêm tác giả "${authorName}"!`);
      setAuthorName('');
      setAuthorBio('');
      setIsAuthorModalOpen(false);
      loadData();
    } catch {
      error('Không thể thêm tác giả vào hệ thống.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePublisher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubName.trim()) {
      error('Vui lòng nhập tên nhà xuất bản.');
      return;
    }
    try {
      setIsSubmitting(true);
      await publisherService.create({
        name: pubName.trim(),
        address: pubAddress.trim() || undefined,
        website: pubWebsite.trim() || undefined,
      });
      success(`Đã thêm nhà xuất bản "${pubName}"!`);
      setPubName('');
      setPubAddress('');
      setPubWebsite('');
      setIsPubModalOpen(false);
      loadData();
    } catch {
      error('Không thể thêm nhà xuất bản vào hệ thống.');
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
          <h1 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>Tác giả & Nhà xuất bản</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            Hồ sơ tác giả và đơn vị xuất bản phát hành sách
          </p>
        </div>

        <div>
          {activeTab === 'authors' ? (
            <Button
              variant="primary"
              onClick={() => setIsAuthorModalOpen(true)}
              leftIcon={<Plus size={18} />}
            >
              Thêm tác giả
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => setIsPubModalOpen(true)}
              leftIcon={<Plus size={18} />}
            >
              Thêm nhà xuất bản
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          gap: '1rem',
        }}
      >
        <button
          onClick={() => setActiveTab('authors')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: activeTab === 'authors' ? 700 : 500,
            color: activeTab === 'authors' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'authors' ? '2px solid var(--primary)' : 'none',
          }}
        >
          <Feather size={18} /> Danh sách Tác giả ({authors.length})
        </button>

        <button
          onClick={() => setActiveTab('publishers')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: activeTab === 'publishers' ? 700 : 500,
            color: activeTab === 'publishers' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'publishers' ? '2px solid var(--primary)' : 'none',
          }}
        >
          <Building size={18} /> Danh sách Nhà xuất bản ({publishers.length})
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="card">
          <TableSkeleton rows={4} />
        </div>
      ) : activeTab === 'authors' ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Tên tác giả</th>
                <th>Tiểu sử / Giới thiệu</th>
              </tr>
            </thead>
            <tbody>
              {authors.length > 0 ? (
                authors.map((a) => (
                  <tr key={a.id}>
                    <td>#{a.id}</td>
                    <td><strong>{a.name}</strong></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{a.biography || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>
                    Chưa có tác giả nào trong hệ thống.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Tên Nhà xuất bản</th>
                <th>Địa chỉ</th>
                <th>Website</th>
              </tr>
            </thead>
            <tbody>
              {publishers.length > 0 ? (
                publishers.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.address || '—'}</td>
                    <td>
                      {p.website ? (
                        <a href={p.website} target="_blank" rel="noreferrer">
                          {p.website}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>
                    Chưa có nhà xuất bản nào trong hệ thống.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Author Modal */}
      <Modal
        isOpen={isAuthorModalOpen}
        onClose={() => setIsAuthorModalOpen(false)}
        title="Thêm tác giả mới"
        maxWidth="460px"
      >
        <form onSubmit={handleCreateAuthor}>
          <Input
            label="Tên tác giả *"
            required
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />
          <div className="form-group">
            <label className="form-label">Tiểu sử tác giả</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={authorBio}
              onChange={(e) => setAuthorBio(e.target.value)}
              placeholder="Tóm tắt tiểu sử và sự nghiệp sáng tác..."
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button type="button" variant="ghost" onClick={() => setIsAuthorModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Lưu tác giả
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Publisher Modal */}
      <Modal
        isOpen={isPubModalOpen}
        onClose={() => setIsPubModalOpen(false)}
        title="Thêm Nhà xuất bản mới"
        maxWidth="460px"
      >
        <form onSubmit={handleCreatePublisher}>
          <Input
            label="Tên Nhà xuất bản *"
            required
            value={pubName}
            onChange={(e) => setPubName(e.target.value)}
          />
          <Input
            label="Địa chỉ trụ sở"
            value={pubAddress}
            onChange={(e) => setPubAddress(e.target.value)}
          />
          <Input
            label="Website chính thức"
            value={pubWebsite}
            onChange={(e) => setPubWebsite(e.target.value)}
            placeholder="https://..."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button type="button" variant="ghost" onClick={() => setIsPubModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Lưu NXB
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
