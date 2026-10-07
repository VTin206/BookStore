package com.bookstore.inventory.entity;

import com.bookstore.book.entity.Book;
import com.bookstore.catalog.entity.Publisher;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "stock_receipts")
public class StockReceipt {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(name = "receipt_number", nullable = false, unique = true) private String receiptNumber;
  @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "supplier_id") private Supplier supplier;
  @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "publisher_id") private Publisher publisher;
  @Column(name = "received_at", nullable = false) private LocalDateTime receivedAt = LocalDateTime.now();
  @Column(columnDefinition = "TEXT") private String note;
  @Column(name = "total_cost", nullable = false, precision = 14, scale = 2) private BigDecimal totalCost = BigDecimal.ZERO;
  @Column(name = "created_by") private String createdBy;
  @Column(name = "created_at", nullable = false) private LocalDateTime createdAt = LocalDateTime.now();
  @OneToMany(mappedBy = "receipt", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<StockReceiptItem> items = new ArrayList<>();

  public Long getId() { return id; }
  public String getReceiptNumber() { return receiptNumber; }
  public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }
  public Supplier getSupplier() { return supplier; }
  public void setSupplier(Supplier supplier) { this.supplier = supplier; }
  public Publisher getPublisher() { return publisher; }
  public void setPublisher(Publisher publisher) { this.publisher = publisher; }
  public LocalDateTime getReceivedAt() { return receivedAt; }
  public void setReceivedAt(LocalDateTime receivedAt) { this.receivedAt = receivedAt; }
  public String getNote() { return note; }
  public void setNote(String note) { this.note = note; }
  public BigDecimal getTotalCost() { return totalCost; }
  public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }
  public String getCreatedBy() { return createdBy; }
  public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
  public LocalDateTime getCreatedAt() { return createdAt; }
  public List<StockReceiptItem> getItems() { return items; }
}
