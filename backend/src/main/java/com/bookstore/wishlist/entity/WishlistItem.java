package com.bookstore.wishlist.entity;

import com.bookstore.book.entity.Book;
import com.bookstore.user.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "wishlist_items",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "book_id"}))
public class WishlistItem {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @JsonIgnore
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  @JoinColumn(name = "book_id", nullable = false)
  private Book book;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt = LocalDateTime.now();

  public WishlistItem() {}

  public WishlistItem(User user, Book book) {
    this.user = user;
    this.book = book;
  }

  public Long getId() { return id; }
  public Book getBook() { return book; }
  public LocalDateTime getCreatedAt() { return createdAt; }
}
