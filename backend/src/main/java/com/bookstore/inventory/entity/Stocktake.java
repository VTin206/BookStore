package com.bookstore.inventory.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "stocktakes")
public class Stocktake {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(name = "stocktake_number", nullable = false, unique = true) private String stocktakeNumber;
  @Column(nullable = false) private String status = "DRAFT";
  private String note;
  @Column(name = "created_by") private String createdBy;
  @Column(name = "created_at", nullable = false) private LocalDateTime createdAt = LocalDateTime.now();
  @Column(name = "completed_at") private LocalDateTime completedAt;
  @OneToMany(mappedBy = "stocktake", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<StocktakeItem> items = new ArrayList<>();

  public Long getId() { return id; }
  public String getStocktakeNumber() { return stocktakeNumber; }
  public void setStocktakeNumber(String stocktakeNumber) { this.stocktakeNumber = stocktakeNumber; }
  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }
  public String getNote() { return note; }
  public void setNote(String note) { this.note = note; }
  public String getCreatedBy() { return createdBy; }
  public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
  public LocalDateTime getCreatedAt() { return createdAt; }
  public LocalDateTime getCompletedAt() { return completedAt; }
  public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
  public List<StocktakeItem> getItems() { return items; }
}
