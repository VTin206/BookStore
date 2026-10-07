package com.bookstore.inventory.service;

import com.bookstore.book.entity.Book;
import com.bookstore.book.repository.BookRepository;
import com.bookstore.catalog.entity.Publisher;
import com.bookstore.catalog.repository.PublisherRepository;
import com.bookstore.inventory.dto.InventoryRequests.*;
import com.bookstore.inventory.dto.InventoryResponses.*;
import com.bookstore.inventory.entity.*;
import com.bookstore.inventory.repository.*;
import jakarta.transaction.Transactional;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

@Service
public class InventoryService {
  private final BookRepository books;
  private final SupplierRepository suppliers;
  private final PublisherRepository publishers;
  private final StockReceiptRepository receipts;
  private final InventoryTransactionRepository transactions;
  private final StocktakeRepository stocktakes;

  public InventoryService(BookRepository books, SupplierRepository suppliers, PublisherRepository publishers,
      StockReceiptRepository receipts, InventoryTransactionRepository transactions, StocktakeRepository stocktakes) {
    this.books = books; this.suppliers = suppliers; this.publishers = publishers;
    this.receipts = receipts; this.transactions = transactions; this.stocktakes = stocktakes;
  }

  public List<BookStock> stock() { return books.findAllByOrderByStockAscTitleAsc().stream().map(BookStock::from).toList(); }
  public List<BookStock> lowStock() { return stock().stream().filter(b -> b.stock() <= b.minimumStock()).toList(); }
  public List<SupplierView> allSuppliers() { return suppliers.findAll().stream().map(SupplierView::from).toList(); }
  public List<ReceiptView> allReceipts() { return receipts.findTop100ByOrderByReceivedAtDesc().stream().map(ReceiptView::from).toList(); }
  public List<TransactionView> allTransactions() { return transactions.findTop500ByOrderByCreatedAtDesc().stream().map(TransactionView::from).toList(); }
  public List<StocktakeView> allStocktakes() { return stocktakes.findTop100ByOrderByCreatedAtDesc().stream().map(StocktakeView::from).toList(); }

  @Transactional
  public BookStock setMinimumStock(Long bookId, int minimumStock) {
    if (minimumStock < 0) throw new IllegalArgumentException("Ngưỡng tồn kho không thể âm");
    var book = books.findByIdForUpdate(bookId).orElseThrow(); book.setMinimumStock(minimumStock); books.save(book); return BookStock.from(book);
  }

  @Transactional
  public Book adjustAbsolute(Long bookId, int newStock, String username) {
    var book = books.findByIdForUpdate(bookId).orElseThrow();
    if (newStock < 0) throw new IllegalArgumentException("Tồn kho không thể âm");
    var delta = newStock - book.getStock();
    if (delta == 0) return book;
    var before = book.getStock(); book.setStock(newStock); books.save(book);
    record(book, "ADJUSTMENT", delta, before, newStock, book.getCostPrice(), "Điều chỉnh nhanh từ danh mục sách", "MANUAL", null, username);
    return book;
  }

  @Transactional
  public void recordExistingChange(Book book, int delta, String type, String reason, String referenceType, Long referenceId, String username) {
    record(book, type, delta, book.getStock() - delta, book.getStock(), book.getCostPrice(), reason, referenceType, referenceId, username);
  }

  @Transactional
  public SupplierView createSupplier(SupplierRequest request) {
    var supplier = new Supplier();
    supplier.setName(request.name().trim()); supplier.setContactName(request.contactName()); supplier.setPhone(request.phone());
    supplier.setEmail(request.email()); supplier.setAddress(request.address());
    return SupplierView.from(suppliers.save(supplier));
  }

  @Transactional
  public ReceiptView receive(String username, ReceiptRequest request) {
    if (request.supplierId() == null && request.publisherId() == null) throw new IllegalArgumentException("Cần chọn nhà cung cấp hoặc nhà xuất bản");
    if (receipts.existsByReceiptNumber(request.receiptNumber().trim())) throw new IllegalArgumentException("Số phiếu nhập đã tồn tại");
    var receipt = new StockReceipt();
    receipt.setReceiptNumber(request.receiptNumber().trim()); receipt.setCreatedBy(username); receipt.setNote(request.note());
    receipt.setReceivedAt(request.receivedAt() == null ? LocalDateTime.now() : request.receivedAt());
    if (request.supplierId() != null) receipt.setSupplier(suppliers.findById(request.supplierId()).orElseThrow());
    if (request.publisherId() != null) receipt.setPublisher(publishers.findById(request.publisherId()).orElseThrow());
    var total = BigDecimal.ZERO;
    var savedReceipt = receipts.save(receipt);
    for (var input : request.items()) {
      var book = books.findByIdForUpdate(input.bookId()).orElseThrow();
      var before = book.getStock();
      book.setStock(Math.addExact(before, input.quantity())); book.setCostPrice(input.unitCost()); books.save(book);
      var lineTotal = input.unitCost().multiply(BigDecimal.valueOf(input.quantity())); total = total.add(lineTotal);
      var item = new StockReceiptItem(); item.setReceipt(receipt); item.setBook(book); item.setQuantity(input.quantity()); item.setUnitCost(input.unitCost()); item.setLineTotal(lineTotal); receipt.getItems().add(item);
      record(book, "RECEIPT", input.quantity(), before, book.getStock(), input.unitCost(), "Nhập kho", "STOCK_RECEIPT", savedReceipt.getId(), username);
    }
    receipt.setTotalCost(total);
    return ReceiptView.from(receipts.save(receipt));
  }

  @Transactional
  public TransactionView adjust(String username, AdjustmentRequest request) {
    if (request.quantityDelta() == 0) throw new IllegalArgumentException("Số lượng điều chỉnh không được bằng 0");
    var book = books.findByIdForUpdate(request.bookId()).orElseThrow();
    var before = book.getStock(); var after = before + request.quantityDelta();
    if (after < 0) throw new IllegalArgumentException("Tồn kho không thể âm");
    book.setStock(after); if (request.unitCost() != null) book.setCostPrice(request.unitCost()); books.save(book);
    return TransactionView.from(record(book, request.type() == null ? "ADJUSTMENT" : request.type().toUpperCase(), request.quantityDelta(), before, after, request.unitCost() == null ? book.getCostPrice() : request.unitCost(), request.reason(), "MANUAL", null, username));
  }

  @Transactional
  public StocktakeView createStocktake(String username, StocktakeRequest request) {
    if (stocktakes.existsByStocktakeNumber(request.stocktakeNumber().trim())) throw new IllegalArgumentException("Số phiếu kiểm kê đã tồn tại");
    var stocktake = new Stocktake(); stocktake.setStocktakeNumber(request.stocktakeNumber().trim()); stocktake.setNote(request.note()); stocktake.setCreatedBy(username);
    for (var input : request.items()) {
      var book = books.findById(input.bookId()).orElseThrow();
      var item = new StocktakeItem(); item.setStocktake(stocktake); item.setBook(book); item.setSystemQuantity(book.getStock()); item.setCountedQuantity(input.countedQuantity()); item.setDelta(input.countedQuantity() - book.getStock()); item.setReason(input.reason()); stocktake.getItems().add(item);
    }
    return StocktakeView.from(stocktakes.save(stocktake));
  }

  @Transactional
  public StocktakeView completeStocktake(String username, Long id) {
    var stocktake = stocktakes.findWithItemsById(id).orElseThrow();
    if (!"DRAFT".equals(stocktake.getStatus())) throw new IllegalArgumentException("Phiếu kiểm kê đã được hoàn tất");
    for (var item : stocktake.getItems()) {
      var book = books.findByIdForUpdate(item.getBook().getId()).orElseThrow();
      var before = book.getStock(); var delta = item.getCountedQuantity() - before;
      if (delta != 0) { book.setStock(item.getCountedQuantity()); books.save(book); record(book, "STOCKTAKE", delta, before, item.getCountedQuantity(), book.getCostPrice(), item.getReason() == null ? "Điều chỉnh theo kiểm kê" : item.getReason(), "STOCKTAKE", stocktake.getId(), username); }
      item.setSystemQuantity(before); item.setDelta(delta);
    }
    stocktake.setStatus("COMPLETED"); stocktake.setCompletedAt(LocalDateTime.now());
    return StocktakeView.from(stocktakes.save(stocktake));
  }

  private InventoryTransaction record(Book book, String type, int delta, int before, int after, BigDecimal cost, String reason, String referenceType, Long referenceId, String username) {
    var tx = new InventoryTransaction(); tx.setBook(book); tx.setTransactionType(type); tx.setQuantityDelta(delta); tx.setQuantityBefore(before); tx.setQuantityAfter(after); tx.setUnitCost(cost == null ? BigDecimal.ZERO : cost); tx.setReason(reason); tx.setReferenceType(referenceType); tx.setReferenceId(referenceId); tx.setCreatedBy(username); return transactions.save(tx);
  }

  public byte[] exportWorkbook() {
    try (var workbook = new XSSFWorkbook(); var output = new ByteArrayOutputStream()) {
      var stockSheet = workbook.createSheet("Tồn kho");
      writeRow(stockSheet, 0, "Mã sách", "Tên sách", "ISBN", "Tồn kho", "Tồn tối thiểu", "Giá vốn", "Giá trị tồn");
      var row = 1; for (var item : stock()) writeRow(stockSheet, row++, item.id(), item.title(), item.isbn(), item.stock(), item.minimumStock(), item.costPrice(), item.stockValue());
      var txSheet = workbook.createSheet("Lịch sử tồn kho");
      writeRow(txSheet, 0, "Thời gian", "Mã sách", "Tên sách", "Loại", "Chênh lệch", "Trước", "Sau", "Giá vốn", "Lý do", "Người thực hiện");
      row = 1; for (var item : allTransactions()) writeRow(txSheet, row++, item.createdAt(), item.bookId(), item.title(), item.type(), item.quantityDelta(), item.quantityBefore(), item.quantityAfter(), item.unitCost(), item.reason(), item.createdBy());
      for (var sheet : List.of(stockSheet, txSheet)) { sheet.createFreezePane(0, 1); for (var i = 0; i < 12; i++) sheet.autoSizeColumn(i); }
      workbook.write(output); return output.toByteArray();
    } catch (Exception exception) { throw new IllegalStateException("Không thể xuất file Excel", exception); }
  }

  private void writeRow(Sheet sheet, int rowNumber, Object... values) { var row = sheet.createRow(rowNumber); for (var i = 0; i < values.length; i++) { var cell = row.createCell(i); var value = values[i]; if (value instanceof Number n) cell.setCellValue(n.doubleValue()); else if (value instanceof java.time.temporal.TemporalAccessor) cell.setCellValue(value.toString()); else cell.setCellValue(value == null ? "" : value.toString()); } }
}
