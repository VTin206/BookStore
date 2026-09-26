package com.bookstore.book.entity;

import com.bookstore.catalog.entity.Author;
import com.bookstore.catalog.entity.Publisher;
import com.bookstore.category.entity.Category;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "books")
public class Book {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false)
  private String author;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal price;

  @Column(nullable = false)
  private Integer stock;

  @Column private String isbn;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(name = "image_url")
  private String imageUrl;

  @Column(name = "publication_date")
  private LocalDate publicationDate;

  @Column(name = "created_at")
  private LocalDateTime createdAt = LocalDateTime.now();

  @Column(name = "updated_at")
  private LocalDateTime updatedAt = LocalDateTime.now();

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "category_id")
  private Category category;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "author_id")
  private Author authorRef;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "publisher_id")
  private Publisher publisher;

  public Book() {}

  public Long getId() {
    return id;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String value) {
    title = value;
  }

  public String getAuthor() {
    return author;
  }

  public void setAuthor(String value) {
    author = value;
  }

  public BigDecimal getPrice() {
    return price;
  }

  public void setPrice(BigDecimal value) {
    price = value;
  }

  public Integer getStock() {
    return stock;
  }

  public void setStock(Integer value) {
    stock = value;
  }

  public Category getCategory() {
    return category;
  }

  public void setCategory(Category value) {
    category = value;
  }

  public Author getAuthorRef() {
    return authorRef;
  }

  public void setAuthorRef(Author value) {
    authorRef = value;
  }

  public Long getAuthorId() {
    return authorRef == null ? null : authorRef.getId();
  }

  public Publisher getPublisher() {
    return publisher;
  }

  public void setPublisher(Publisher value) {
    publisher = value;
  }

  public Long getPublisherId() {
    return publisher == null ? null : publisher.getId();
  }

  public String getIsbn() {
    return isbn;
  }

  public void setIsbn(String value) {
    isbn = value;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String value) {
    description = value;
  }

  public String getImageUrl() {
    return imageUrl;
  }

  public void setImageUrl(String value) {
    imageUrl = value;
  }

  public LocalDate getPublicationDate() {
    return publicationDate;
  }

  public void setPublicationDate(LocalDate value) {
    publicationDate = value;
  }
}