package com.bookstore.inventory.entity;

import com.bookstore.book.entity.Book;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "stock_receipt_items")
public class StockReceiptItem {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "receipt_id", nullable = false) private StockReceipt receipt;
  @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "book_id", nullable = false) private Book book;
  @Column(nullable = false) private Integer quantity;
  @Column(name = "unit_cost", nullable = false, precision = 12, scale = 2) private BigDecimal unitCost;
  @Column(name = "line_total", nullable = false, precision = 14, scale = 2) private BigDecimal lineTotal;

  public Long getId() { return id; }
  public void setReceipt(StockReceipt receipt) { this.receipt = receipt; }
  public Book getBook() { return book; }
  public void setBook(Book book) { this.book = book; }
  public Integer getQuantity() { return quantity; }
  public void setQuantity(Integer quantity) { this.quantity = quantity; }
  public BigDecimal getUnitCost() { return unitCost; }
  public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }
  public BigDecimal getLineTotal() { return lineTotal; }
  public void setLineTotal(BigDecimal lineTotal) { this.lineTotal = lineTotal; }
}
