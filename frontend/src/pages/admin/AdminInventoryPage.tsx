import React, { useEffect, useState } from 'react';
import { Download, PackagePlus, ClipboardCheck, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { bookService } from '../../services/bookService';
import { publisherService } from '../../services/publisherService';
import { inventoryService, InventoryBook, InventoryReceipt, InventorySupplier, Stocktake } from '../../services/inventoryService';
import type { Book, Publisher } from '../../types';

type Tab = 'stock' | 'receipts' | 'adjustments' | 'stocktakes' | 'suppliers';

export const AdminInventoryPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('stock');
  const [books, setBooks] = useState<Book[]>([]);
  const [stock, setStock] = useState<InventoryBook[]>([]);
  const [lowStock, setLowStock] = useState<InventoryBook[]>([]);
  const [receipts, setReceipts] = useState<InventoryReceipt[]>([]);
  const [suppliers, setSuppliers] = useState<InventorySupplier[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [stocktakes, setStocktakes] = useState<Stocktake[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  const [supplierForm, setSupplierForm] = useState({ name: '', contactName: '', phone: '', email: '', address: '' });
  const [receiptForm, setReceiptForm] = useState({ receiptNumber: '', supplierId: '', publisherId: '', bookId: '', quantity: '1', unitCost: '0', note: '' });
  const [adjustmentForm, setAdjustmentForm] = useState({ bookId: '', quantityDelta: '', type: 'DAMAGE', reason: '' });
  const [stocktakeForm, setStocktakeForm] = useState({ stocktakeNumber: '', bookId: '', countedQuantity: '', reason: '', note: '' });
  const [thresholdForm, setThresholdForm] = useState({ bookId: '', value: '10' });

  const load = async () => {
    try {
      setIsLoading(true);
      const [stockData, lowData, receiptData, supplierData, publisherData, bookData, stocktakeData] = await Promise.all([
        inventoryService.getStock(), inventoryService.getLowStock(), inventoryService.getReceipts(), inventoryService.getSuppliers(), publisherService.getAll(), bookService.getAll(undefined, undefined, true), inventoryService.getStocktakes(),
      ]);
      setStock(stockData); setLowStock(lowData); setReceipts(receiptData); setSuppliers(supplierData); setPublishers(publisherData); setBooks(bookData); setStocktakes(stocktakeData);
    } catch (err: any) { error(err.response?.data?.message || 'Không thể tải dữ liệu kho.'); } finally { setIsLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const submit = async (action: () => Promise<unknown>, message: string) => {
    try { setIsSubmitting(true); await action(); success(message); await load(); } catch (err: any) { error(err.response?.data?.message || 'Không thể thực hiện thao tác.'); } finally { setIsSubmitting(false); }
  };

  const submitSupplier = () => submit(() => inventoryService.createSupplier(supplierForm), 'Đã thêm nhà cung cấp.').then(() => setSupplierForm({ name: '', contactName: '', phone: '', email: '', address: '' }));
  const submitReceipt = () => submit(() => inventoryService.createReceipt({ receiptNumber: receiptForm.receiptNumber, supplierId: receiptForm.supplierId ? Number(receiptForm.supplierId) : undefined, publisherId: receiptForm.publisherId ? Number(receiptForm.publisherId) : undefined, note: receiptForm.note || undefined, items: [{ bookId: Number(receiptForm.bookId), quantity: Number(receiptForm.quantity), unitCost: Number(receiptForm.unitCost) }] }), 'Đã lập phiếu nhập và cập nhật tồn kho.');
  const submitAdjustment = () => submit(() => inventoryService.createAdjustment({ bookId: Number(adjustmentForm.bookId), quantityDelta: Number(adjustmentForm.quantityDelta), type: adjustmentForm.type, reason: adjustmentForm.reason }), 'Đã ghi nhận điều chỉnh tồn kho.');
  const submitStocktake = () => submit(() => inventoryService.createStocktake({ stocktakeNumber: stocktakeForm.stocktakeNumber, note: stocktakeForm.note || undefined, items: [{ bookId: Number(stocktakeForm.bookId), countedQuantity: Number(stocktakeForm.countedQuantity), reason: stocktakeForm.reason || undefined }] }), 'Đã tạo phiếu kiểm kê.');
  const submitThreshold = () => submit(() => inventoryService.setMinimumStock(Number(thresholdForm.bookId), Number(thresholdForm.value)), 'Đã cập nhật ngưỡng tồn tối thiểu.');

  const selectedBook = (id: string) => books.find((book) => book.id === Number(id));
  const tabs: [Tab, string][] = [['stock', 'Tồn kho'], ['receipts', 'Phiếu nhập'], ['adjustments', 'Điều chỉnh'], ['stocktakes', 'Kiểm kê'], ['suppliers', 'Nhà cung cấp']];

  return <div className="container" style={{ padding: '2.5rem 1rem 5rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
      <div><h1 style={{ marginBottom: '0.35rem' }}>Quản lý kho</h1><p style={{ color: 'var(--text-muted)' }}>Theo dõi tồn kho, giá vốn, nhập hàng và kiểm kê.</p></div>
      <div style={{ display: 'flex', gap: '0.5rem' }}><Button variant="secondary" onClick={() => void load()} leftIcon={<RefreshCw size={16} />}>Tải lại</Button><Button variant="primary" onClick={() => void inventoryService.exportExcel()} leftIcon={<Download size={16} />}>Xuất Excel</Button></div>
    </div>
    {lowStock.length > 0 && <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem', borderColor: 'var(--warning, #d97706)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><AlertTriangle color="var(--warning, #d97706)" size={20} /><strong>{lowStock.length} sách đang dưới hoặc bằng ngưỡng tồn tối thiểu.</strong></div>}
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>{tabs.map(([value, label]) => <Button key={value} variant={tab === value ? 'primary' : 'secondary'} onClick={() => setTab(value)}>{label}</Button>)}</div>

    {isLoading ? <div className="card" style={{ padding: '2rem' }}>Đang tải dữ liệu kho…</div> : <>
      {tab === 'stock' && <div style={{ display: 'grid', gap: '1.25rem' }}><div className="card" style={{ padding: '1.5rem' }}><h2>Cấu hình cảnh báo tồn kho</h2><div className="form-grid"><Select label="Sách" value={thresholdForm.bookId} onChange={(e) => setThresholdForm({ ...thresholdForm, bookId: e.target.value })}><option value="">Chọn sách</option>{books.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</Select><Input label="Ngưỡng tối thiểu" type="number" min="0" value={thresholdForm.value} onChange={(e) => setThresholdForm({ ...thresholdForm, value: e.target.value })} /></div><Button disabled={isSubmitting || !thresholdForm.bookId} isLoading={isSubmitting} onClick={() => void submitThreshold()}>Lưu ngưỡng</Button></div><div className="card" style={{ overflowX: 'auto' }}><table className="table"><thead><tr><th>Sách</th><th>Tồn kho</th><th>Ngưỡng tối thiểu</th><th>Giá vốn</th><th>Giá trị tồn</th></tr></thead><tbody>{stock.map((item) => <tr key={item.id}><td><strong>{item.title}</strong><br /><small>{item.isbn || 'Chưa có ISBN'}</small></td><td style={{ color: item.stock <= item.minimumStock ? 'var(--danger)' : undefined }}>{item.stock}</td><td>{item.minimumStock}</td><td>{Number(item.costPrice).toLocaleString('vi-VN')} ₫</td><td>{Number(item.stockValue).toLocaleString('vi-VN')} ₫</td></tr>)}</tbody></table></div></div>}

      {tab === 'receipts' && <div style={{ display: 'grid', gap: '1.25rem' }}><div className="card" style={{ padding: '1.5rem' }}><h2><PackagePlus size={20} /> Lập phiếu nhập kho</h2><div className="form-grid"><Input label="Số phiếu *" value={receiptForm.receiptNumber} onChange={(e) => setReceiptForm({ ...receiptForm, receiptNumber: e.target.value })} placeholder="PN-2026-001" /><Select label="Nhà cung cấp" value={receiptForm.supplierId} onChange={(e) => setReceiptForm({ ...receiptForm, supplierId: e.target.value })}><option value="">Chọn nhà cung cấp</option>{suppliers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select><Select label="Nhà xuất bản" value={receiptForm.publisherId} onChange={(e) => setReceiptForm({ ...receiptForm, publisherId: e.target.value })}><option value="">Chọn NXB</option>{publishers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select><Select label="Sách *" value={receiptForm.bookId} onChange={(e) => setReceiptForm({ ...receiptForm, bookId: e.target.value })}><option value="">Chọn sách</option>{books.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</Select><Input label="Số lượng *" type="number" min="1" value={receiptForm.quantity} onChange={(e) => setReceiptForm({ ...receiptForm, quantity: e.target.value })} /><Input label="Giá vốn/ cuốn *" type="number" min="0" value={receiptForm.unitCost} onChange={(e) => setReceiptForm({ ...receiptForm, unitCost: e.target.value })} /></div><Button disabled={isSubmitting || !receiptForm.bookId} isLoading={isSubmitting} onClick={() => void submitReceipt()}>Lưu phiếu nhập</Button></div><div className="card" style={{ overflowX: 'auto' }}><table className="table"><thead><tr><th>Số phiếu</th><th>Nguồn hàng</th><th>Ngày nhập</th><th>Tổng giá vốn</th><th>Số dòng</th></tr></thead><tbody>{receipts.map((item) => <tr key={item.id}><td>{item.receiptNumber}</td><td>{item.supplierName || item.publisherName || '—'}</td><td>{new Date(item.receivedAt).toLocaleString('vi-VN')}</td><td>{Number(item.totalCost).toLocaleString('vi-VN')} ₫</td><td>{item.items.length}</td></tr>)}</tbody></table></div></div>}

      {tab === 'adjustments' && <div className="card" style={{ padding: '1.5rem' }}><h2>Điều chỉnh tồn kho</h2><p style={{ color: 'var(--text-muted)' }}>Dùng số dương để ghi tăng, số âm để ghi giảm. Mọi thay đổi đều được lưu lịch sử.</p><div className="form-grid"><Select label="Sách *" value={adjustmentForm.bookId} onChange={(e) => setAdjustmentForm({ ...adjustmentForm, bookId: e.target.value })}><option value="">Chọn sách</option>{books.map((item) => <option key={item.id} value={item.id}>{item.title} (tồn {item.stock})</option>)}</Select><Select label="Loại điều chỉnh" value={adjustmentForm.type} onChange={(e) => setAdjustmentForm({ ...adjustmentForm, type: e.target.value })}><option value="DAMAGE">Sách lỗi/hư hỏng</option><option value="LOSS">Mất mát</option><option value="ADJUSTMENT">Điều chỉnh khác</option><option value="RETURN">Hàng trả về</option></Select><Input label="Số lượng thay đổi *" type="number" value={adjustmentForm.quantityDelta} onChange={(e) => setAdjustmentForm({ ...adjustmentForm, quantityDelta: e.target.value })} placeholder="-2 hoặc 5" /><Input label="Lý do *" value={adjustmentForm.reason} onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })} placeholder="Ghi rõ nguyên nhân" /></div><Button disabled={isSubmitting || !adjustmentForm.bookId} isLoading={isSubmitting} onClick={() => void submitAdjustment()}>Ghi nhận điều chỉnh</Button></div>}

      {tab === 'stocktakes' && <div style={{ display: 'grid', gap: '1.25rem' }}><div className="card" style={{ padding: '1.5rem' }}><h2><ClipboardCheck size={20} /> Lập phiếu kiểm kê</h2><div className="form-grid"><Input label="Số phiếu *" value={stocktakeForm.stocktakeNumber} onChange={(e) => setStocktakeForm({ ...stocktakeForm, stocktakeNumber: e.target.value })} placeholder="KK-2026-001" /><Select label="Sách *" value={stocktakeForm.bookId} onChange={(e) => setStocktakeForm({ ...stocktakeForm, bookId: e.target.value })}><option value="">Chọn sách</option>{books.map((item) => <option key={item.id} value={item.id}>{item.title} (hệ thống {item.stock})</option>)}</Select><Input label="Số lượng thực đếm *" type="number" min="0" value={stocktakeForm.countedQuantity} onChange={(e) => setStocktakeForm({ ...stocktakeForm, countedQuantity: e.target.value })} /><Input label="Lý do chênh lệch" value={stocktakeForm.reason} onChange={(e) => setStocktakeForm({ ...stocktakeForm, reason: e.target.value })} /></div><Button disabled={isSubmitting || !stocktakeForm.bookId} isLoading={isSubmitting} onClick={() => void submitStocktake()}>Tạo phiếu kiểm kê</Button></div><div className="card" style={{ overflowX: 'auto' }}><table className="table"><thead><tr><th>Số phiếu</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead><tbody>{stocktakes.map((item) => <tr key={item.id}><td>{item.number}</td><td>{item.status === 'DRAFT' ? 'Nháp' : 'Đã hoàn tất'}</td><td>{new Date(item.createdAt).toLocaleString('vi-VN')}</td><td>{item.status === 'DRAFT' && <Button size="sm" variant="primary" onClick={() => void submit(() => inventoryService.completeStocktake(item.id), 'Đã hoàn tất kiểm kê và cập nhật tồn kho.')}>Hoàn tất</Button>}</td></tr>)}</tbody></table></div></div>}

      {tab === 'suppliers' && <div style={{ display: 'grid', gap: '1.25rem' }}><div className="card" style={{ padding: '1.5rem' }}><h2>Thêm nhà cung cấp</h2><div className="form-grid"><Input label="Tên nhà cung cấp *" value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} /><Input label="Người liên hệ" value={supplierForm.contactName} onChange={(e) => setSupplierForm({ ...supplierForm, contactName: e.target.value })} /><Input label="Số điện thoại" value={supplierForm.phone} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} /><Input label="Email" type="email" value={supplierForm.email} onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })} /></div><Button disabled={isSubmitting || !supplierForm.name} isLoading={isSubmitting} onClick={() => void submitSupplier()}>Thêm nhà cung cấp</Button></div><div className="card" style={{ overflowX: 'auto' }}><table className="table"><thead><tr><th>Nhà cung cấp</th><th>Liên hệ</th><th>Số điện thoại</th><th>Email</th></tr></thead><tbody>{suppliers.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.contactName || '—'}</td><td>{item.phone || '—'}</td><td>{item.email || '—'}</td></tr>)}</tbody></table></div></div>}
    </>}
  </div>;
};
