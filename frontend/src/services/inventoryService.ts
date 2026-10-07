import { apiClient } from './apiClient';

export interface InventoryBook { id: number; title: string; isbn?: string; stock: number; minimumStock: number; costPrice: number; stockValue: number; }
export interface InventorySupplier { id: number; name: string; contactName?: string; phone?: string; email?: string; address?: string; active: boolean; }
export interface InventoryReceiptItem { bookId: number; title: string; quantity: number; unitCost: number; lineTotal: number; }
export interface InventoryReceipt { id: number; receiptNumber: string; supplierId?: number; supplierName?: string; publisherId?: number; publisherName?: string; receivedAt: string; totalCost: number; note?: string; items: InventoryReceiptItem[]; }
export interface InventoryTransaction { id: number; bookId: number; title: string; type: string; quantityDelta: number; quantityBefore: number; quantityAfter: number; unitCost: number; reason: string; referenceType?: string; referenceId?: number; createdAt: string; }
export interface StocktakeItem { bookId: number; title: string; systemQuantity: number; countedQuantity: number; delta: number; reason?: string; }
export interface Stocktake { id: number; number: string; status: 'DRAFT' | 'COMPLETED'; note?: string; createdAt: string; completedAt?: string; items: StocktakeItem[]; }

export const inventoryService = {
  async getStock(): Promise<InventoryBook[]> { return (await apiClient.get<InventoryBook[]>('/inventory/stock')).data; },
  async getLowStock(): Promise<InventoryBook[]> { return (await apiClient.get<InventoryBook[]>('/inventory/low-stock')).data; },
  async setMinimumStock(bookId: number, value: number): Promise<InventoryBook> { return (await apiClient.patch<InventoryBook>(`/inventory/stock/${bookId}/minimum`, null, { params: { value } })).data; },
  async getSuppliers(): Promise<InventorySupplier[]> { return (await apiClient.get<InventorySupplier[]>('/inventory/suppliers')).data; },
  async createSupplier(data: { name: string; contactName?: string; phone?: string; email?: string; address?: string }): Promise<InventorySupplier> { const payload = { ...data, email: data.email?.trim() || undefined, contactName: data.contactName?.trim() || undefined, phone: data.phone?.trim() || undefined, address: data.address?.trim() || undefined }; return (await apiClient.post<InventorySupplier>('/inventory/suppliers', payload)).data; },
  async getReceipts(): Promise<InventoryReceipt[]> { return (await apiClient.get<InventoryReceipt[]>('/inventory/receipts')).data; },
  async createReceipt(data: { receiptNumber: string; supplierId?: number; publisherId?: number; receivedAt?: string; note?: string; items: { bookId: number; quantity: number; unitCost: number }[] }): Promise<InventoryReceipt> { return (await apiClient.post<InventoryReceipt>('/inventory/receipts', data)).data; },
  async getTransactions(): Promise<InventoryTransaction[]> { return (await apiClient.get<InventoryTransaction[]>('/inventory/transactions')).data; },
  async createAdjustment(data: { bookId: number; quantityDelta: number; reason: string; type: string; unitCost?: number }): Promise<InventoryTransaction> { return (await apiClient.post<InventoryTransaction>('/inventory/adjustments', data)).data; },
  async getStocktakes(): Promise<Stocktake[]> { return (await apiClient.get<Stocktake[]>('/inventory/stocktakes')).data; },
  async createStocktake(data: { stocktakeNumber: string; note?: string; items: { bookId: number; countedQuantity: number; reason?: string }[] }): Promise<Stocktake> { return (await apiClient.post<Stocktake>('/inventory/stocktakes', data)).data; },
  async completeStocktake(id: number): Promise<Stocktake> { return (await apiClient.post<Stocktake>(`/inventory/stocktakes/${id}/complete`)).data; },
  async exportExcel(): Promise<void> { const response = await apiClient.get('/inventory/export.xlsx', { responseType: 'blob' }); const url = URL.createObjectURL(response.data); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'inventory.xlsx'; anchor.click(); URL.revokeObjectURL(url); },
};
