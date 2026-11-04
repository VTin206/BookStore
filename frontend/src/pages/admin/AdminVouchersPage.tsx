import React, { useEffect, useState } from 'react';
import { Edit2, Plus, Ticket, Trash2 } from 'lucide-react';
import { voucherService } from '../../services/voucherService';
import { Voucher, VoucherRequest } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { useToast } from '../../context/ToastContext';

const PAGE_SIZE = 20;
const blank: VoucherRequest = {
  code: '',
  discountType: 'PERCENTAGE',
  discountValue: 10,
  minOrderAmount: 0,
  expiresAt: '',
  usageLimit: null,
  active: true,
};

export const AdminVouchersPage: React.FC = () => {
  const [items, setItems] = useState<Voucher[]>([]);
  const [form, setForm] = useState<VoucherRequest>({ ...blank });
  const [editing, setEditing] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const { success, error } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const page = await voucherService.getPage(currentPage - 1, PAGE_SIZE);
        if (page.content.length === 0 && currentPage > 1) {
          setCurrentPage((value) => value - 1);
          return;
        }
        setItems(page.content);
        setTotalPages(page.totalPages);
        setTotalItems(page.totalElements);
      } catch (loadError) {
        console.error('Failed to load vouchers', loadError);
        error('Không thể tải voucher.');
      }
    };
    void load();
  }, [currentPage, error, refreshKey]);

  const reloadCurrentPage = () => setRefreshKey((value) => value + 1);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount),
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiresAt: form.expiresAt || undefined,
      };
      if (editing) await voucherService.update(editing, payload);
      else await voucherService.create(payload);
      success(editing ? 'Đã cập nhật voucher.' : 'Đã tạo voucher.');
      setOpen(false);
      setEditing(null);
      setForm({ ...blank });
      reloadCurrentPage();
    } catch (submitError: any) {
      error(submitError.response?.data?.message || 'Không thể lưu voucher.');
    }
  };

  const edit = (voucher: Voucher) => {
    setEditing(voucher.id);
    setForm({
      code: voucher.code,
      discountType: voucher.discountType,
      discountValue: Number(voucher.discountValue),
      minOrderAmount: Number(voucher.minOrderAmount),
      expiresAt: voucher.expiresAt?.slice(0, 16) || '',
      usageLimit: voucher.usageLimit ?? null,
      active: voucher.active,
    });
    setOpen(true);
  };

  const remove = async (id: number) => {
    if (!window.confirm('Xóa voucher này?')) return;
    try {
      await voucherService.delete(id);
      success('Đã xóa voucher.');
      reloadCurrentPage();
    } catch (removeError: any) {
      error(removeError.response?.data?.message || 'Không thể xóa voucher.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Quản lý voucher</h1>
          <p style={{ color: 'var(--text-muted)' }}>Tạo và quản lý mã giảm giá cho khách hàng ({totalItems} voucher).</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ ...blank }); setOpen(true); }} leftIcon={<Plus size={16} />}>
          Tạo voucher
        </Button>
      </div>

      {open && (
        <form onSubmit={submit} className="card" style={{ padding: '1.5rem', display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          <Input label="Mã voucher" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} required />
          <Select label="Loại giảm" value={form.discountType} onChange={(event) => setForm({ ...form, discountType: event.target.value as VoucherRequest['discountType'] })} options={[{ value: 'PERCENTAGE', label: 'Phần trăm (%)' }, { value: 'FIXED', label: 'Số tiền (₫)' }]} />
          <Input label="Giá trị giảm" type="number" min="1" value={form.discountValue} onChange={(event) => setForm({ ...form, discountValue: Number(event.target.value) })} required />
          <Input label="Đơn tối thiểu" type="number" min="0" value={form.minOrderAmount} onChange={(event) => setForm({ ...form, minOrderAmount: Number(event.target.value) })} />
          <Input label="Hạn sử dụng" type="datetime-local" value={form.expiresAt} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} />
          <Input label="Lượt dùng tối đa" type="number" min="1" value={form.usageLimit ?? ''} onChange={(event) => setForm({ ...form, usageLimit: event.target.value ? Number(event.target.value) : null })} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} /> Đang hoạt động
          </label>
          <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8 }}>
            <Button type="submit">Lưu</Button>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Hủy</Button>
          </div>
        </form>
      )}

      <div className="card table-container">
        <table className="table">
          <thead><tr><th>Mã</th><th>Giảm</th><th>Đơn tối thiểu</th><th>Sử dụng</th><th>Trạng thái</th><th /></tr></thead>
          <tbody>
            {items.map((voucher) => (
              <tr key={voucher.id}>
                <td><strong><Ticket size={15} /> {voucher.code}</strong></td>
                <td>{voucher.discountType === 'PERCENTAGE' ? `${voucher.discountValue}%` : `${Number(voucher.discountValue).toLocaleString('vi-VN')} ₫`}</td>
                <td>{Number(voucher.minOrderAmount).toLocaleString('vi-VN')} ₫</td>
                <td>{voucher.usedCount}{voucher.usageLimit ? ` / ${voucher.usageLimit}` : ''}</td>
                <td>{voucher.active ? 'Đang bật' : 'Đã tắt'}</td>
                <td>
                  <Button size="sm" variant="ghost" onClick={() => edit(voucher)}><Edit2 size={15} /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(voucher.id)}><Trash2 size={15} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p style={{ padding: '1rem', color: 'var(--text-muted)' }}>Chưa có voucher.</p>}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
};
