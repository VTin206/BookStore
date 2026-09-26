package com.bookstore.cart.entity;

import com.bookstore.book.entity.Book;
import jakarta.persistence.*;

@Entity
@Table(name = "cart_items")
public class CartItem {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "cart_id", nullable = false)
  private Cart cart;

  @ManyToOne
  @JoinColumn(name = "book_id", nullable = false)
  private Book book;

  private Integer quantity;

  public CartItem() {}
  public CartItem(Cart cart, Book book, Integer quantity) {
    this.cart = cart;
    this.book = book;
    this.quantity = quantity;
  }
  public Long getId() { return id; }
  public Cart getCart() { return cart; }
  public Book getBook() { return book; }
  public Integer getQuantity() { return quantity; }
  public void setQuantity(Integer value) { quantity = value; }
}
