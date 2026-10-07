package com.bookstore.inventory.entity;

import com.bookstore.book.entity.Book;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_transactions")
public class InventoryTransaction {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "book_id", nullable = false) private Book book;
  @Column(name = "transaction_type", nullable = false) private String transactionType;
  @Column(name = "quantity_delta", nullable = false) private Integer quantityDelta;
  @Column(name = "quantity_before", nullable = false) private Integer quantityBefore;
  @Column(name = "quantity_after", nullable = false) private Integer quantityAfter;
  @Column(name = "unit_cost", nullable = false, precision = 12, scale = 2) private BigDecimal unitCost = BigDecimal.ZERO;
  private String reason;
  @Column(name = "reference_type") private String referenceType;
  @Column(name = "reference_id") private Long referenceId;
  @Column(name = "created_by") private String createdBy;
  @Column(name = "created_at", nullable = false) private LocalDateTime createdAt = LocalDateTime.now();

  public Long getId() { return id; }
  public Book getBook() { return book; }
  public void setBook(Book book) { this.book = book; }
  public String getTransactionType() { return transactionType; }
  public void setTransactionType(String transactionType) { this.transactionType = transactionType; }
  public Integer getQuantityDelta() { return quantityDelta; }
  public void setQuantityDelta(Integer quantityDelta) { this.quantityDelta = quantityDelta; }
  public Integer getQuantityBefore() { return quantityBefore; }
  public void setQuantityBefore(Integer quantityBefore) { this.quantityBefore = quantityBefore; }
  public Integer getQuantityAfter() { return quantityAfter; }
  public void setQuantityAfter(Integer quantityAfter) { this.quantityAfter = quantityAfter; }
  public BigDecimal getUnitCost() { return unitCost; }
  public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }
  public String getReason() { return reason; }
  public void setReason(String reason) { this.reason = reason; }
  public String getReferenceType() { return referenceType; }
  public void setReferenceType(String referenceType) { this.referenceType = referenceType; }
  public Long getReferenceId() { return referenceId; }
  public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }
  public String getCreatedBy() { return createdBy; }
  public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
  public LocalDateTime getCreatedAt() { return createdAt; }
}
