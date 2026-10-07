package com.bookstore.inventory.dto;

import com.bookstore.inventory.entity.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public final class InventoryResponses {
  private InventoryResponses() {}
  public record BookStock(Long id, String title, String isbn, int stock, int minimumStock, BigDecimal costPrice, BigDecimal stockValue) {
    public static BookStock from(com.bookstore.book.entity.Book book) {
      return new BookStock(book.getId(), book.getTitle(), book.getIsbn(), book.getStock(), book.getMinimumStock(), book.getCostPrice(), book.getCostPrice().multiply(BigDecimal.valueOf(book.getStock())));
    }
  }
  public record SupplierView(Long id, String name, String contactName, String phone, String email, String address, boolean active) {
    public static SupplierView from(Supplier s) { return new SupplierView(s.getId(), s.getName(), s.getContactName(), s.getPhone(), s.getEmail(), s.getAddress(), s.isActive()); }
  }
  public record ReceiptItemView(Long bookId, String title, int quantity, BigDecimal unitCost, BigDecimal lineTotal) {}
  public record ReceiptView(Long id, String receiptNumber, Long supplierId, String supplierName, Long publisherId, String publisherName, LocalDateTime receivedAt, BigDecimal totalCost, String note, List<ReceiptItemView> items) {
    public static ReceiptView from(StockReceipt r) { return new ReceiptView(r.getId(), r.getReceiptNumber(), r.getSupplier() == null ? null : r.getSupplier().getId(), r.getSupplier() == null ? null : r.getSupplier().getName(), r.getPublisher() == null ? null : r.getPublisher().getId(), r.getPublisher() == null ? null : r.getPublisher().getName(), r.getReceivedAt(), r.getTotalCost(), r.getNote(), r.getItems().stream().map(i -> new ReceiptItemView(i.getBook().getId(), i.getBook().getTitle(), i.getQuantity(), i.getUnitCost(), i.getLineTotal())).toList()); }
  }
  public record TransactionView(Long id, Long bookId, String title, String type, int quantityDelta, int quantityBefore, int quantityAfter, BigDecimal unitCost, String reason, String referenceType, Long referenceId, String createdBy, LocalDateTime createdAt) {
    public static TransactionView from(InventoryTransaction t) { return new TransactionView(t.getId(), t.getBook().getId(), t.getBook().getTitle(), t.getTransactionType(), t.getQuantityDelta(), t.getQuantityBefore(), t.getQuantityAfter(), t.getUnitCost(), t.getReason(), t.getReferenceType(), t.getReferenceId(), t.getCreatedBy(), t.getCreatedAt()); }
  }
  public record StocktakeItemView(Long bookId, String title, int systemQuantity, int countedQuantity, int delta, String reason) {}
  public record StocktakeView(Long id, String number, String status, String note, LocalDateTime createdAt, LocalDateTime completedAt, List<StocktakeItemView> items) {
    public static StocktakeView from(Stocktake s) { return new StocktakeView(s.getId(), s.getStocktakeNumber(), s.getStatus(), s.getNote(), s.getCreatedAt(), s.getCompletedAt(), s.getItems().stream().map(i -> new StocktakeItemView(i.getBook().getId(), i.getBook().getTitle(), i.getSystemQuantity(), i.getCountedQuantity(), i.getDelta(), i.getReason())).toList()); }
  }
}
