package com.bookstore.book.entity;

import com.bookstore.catalog.entity.Author;
import com.bookstore.catalog.entity.Publisher;
import com.bookstore.category.entity.Category;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "books")
public class Book {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @com.fasterxml.jackson.annotation.JsonIgnore
  @Version
  @Column(name = "row_version", nullable = false)
  private long rowVersion;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false)
  private String author;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal price;

  @Column(nullable = false)
  private Integer stock;

  @Column(nullable = false)
  private boolean active = true;

  @Column private String isbn;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(name = "image_url", columnDefinition = "TEXT")
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

  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(name = "book_categories", joinColumns = @JoinColumn(name = "book_id"), inverseJoinColumns = @JoinColumn(name = "category_id"))
  private Set<Category> categories = new LinkedHashSet<>();

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

  public void setTitle(String title) {
    this.title = title;
  }

  public String getAuthor() {
    return author;
  }

  public void setAuthor(String author) {
    this.author = author;
  }

  public BigDecimal getPrice() {
    return price;
  }

  public void setPrice(BigDecimal price) {
    this.price = price;
  }

  public Integer getStock() {
    return stock;
  }

  public void setStock(Integer stock) {
    this.stock = stock;
  }

  public boolean isActive() {
    return active;
  }

  public void setActive(boolean active) {
    this.active = active;
  }

  public Set<Category> getCategories() {
    return categories;
  }

  public void setCategories(Set<Category> categories) {
    this.categories = categories == null ? new LinkedHashSet<>() : categories;
  }

  public Category getCategory() {
    return category;
  }

  public void setCategory(Category category) {
    this.category = category;
  }

  public Author getAuthorRef() {
    return authorRef;
  }

  public void setAuthorRef(Author author) {
    this.authorRef = author;
  }

  public Long getAuthorId() {
    return authorRef == null ? null : authorRef.getId();
  }

  public Publisher getPublisher() {
    return publisher;
  }

  public void setPublisher(Publisher publisher) {
    this.publisher = publisher;
  }

  public Long getPublisherId() {
    return publisher == null ? null : publisher.getId();
  }

  public String getIsbn() {
    return isbn;
  }

  public void setIsbn(String isbn) {
    this.isbn = isbn;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  @com.fasterxml.jackson.annotation.JsonIgnore
  public String getImageUrl() {
    return imageUrl;
  }

  @com.fasterxml.jackson.annotation.JsonProperty("imageUrl")
  public String getPublicImageUrl() {
    return imageUrl != null && imageUrl.startsWith("data:") && id != null
        ? "/api/books/" + id + "/cover" : imageUrl;
  }

  public void setImageUrl(String imageUrl) {
    this.imageUrl = imageUrl;
  }

  public LocalDate getPublicationDate() {
    return publicationDate;
  }

  public void setPublicationDate(LocalDate publicationDate) {
    this.publicationDate = publicationDate;
  }
}
