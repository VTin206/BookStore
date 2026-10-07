package com.bookstore.inventory.entity;

import com.bookstore.book.entity.Book;
import jakarta.persistence.*;

@Entity
@Table(name = "stocktake_items")
public class StocktakeItem {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "stocktake_id", nullable = false) private Stocktake stocktake;
  @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "book_id", nullable = false) private Book book;
  @Column(name = "system_quantity", nullable = false) private Integer systemQuantity;
  @Column(name = "counted_quantity", nullable = false) private Integer countedQuantity;
  @Column(nullable = false) private Integer delta;
  private String reason;

  public Long getId() { return id; }
  public void setStocktake(Stocktake stocktake) { this.stocktake = stocktake; }
  public Book getBook() { return book; }
  public void setBook(Book book) { this.book = book; }
  public Integer getSystemQuantity() { return systemQuantity; }
  public void setSystemQuantity(Integer systemQuantity) { this.systemQuantity = systemQuantity; }
  public Integer getCountedQuantity() { return countedQuantity; }
  public void setCountedQuantity(Integer countedQuantity) { this.countedQuantity = countedQuantity; }
  public Integer getDelta() { return delta; }
  public void setDelta(Integer delta) { this.delta = delta; }
  public String getReason() { return reason; }
  public void setReason(String reason) { this.reason = reason; }
}
