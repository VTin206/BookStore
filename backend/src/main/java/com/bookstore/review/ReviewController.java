package com.bookstore.review;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Entity
@Table(name = "reviews")
class Review {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  Long id;

  @Column(name = "user_id", nullable = false)
  Long userId;
  @Column(name = "book_id", nullable = false)
  Long bookId;
  @Column(nullable = false)
  Integer rating;
  @Column(columnDefinition = "TEXT")
  String comment;
  @Column(name = "created_at", nullable = false)
  LocalDateTime createdAt = LocalDateTime.now();
  @jakarta.persistence.Transient
  String userName;

  public Long getId() {
    return id;
  }

  public Long getUserId() {
    return userId;
  }

  public Long getBookId() {
    return bookId;
  }

  public Integer getRating() {
    return rating;
  }

  public String getComment() {
    return comment;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public String getUserName() {
    return userName;
  }

  public void setUserId(Long value) {
    userId = value;
  }

  public void setBookId(Long value) {
    bookId = value;
  }

  public void setRating(Integer value) {
    rating = value;
  }

  public void setComment(String value) {
    comment = value;
  }
  public void setUserName(String value) {
    userName = value;
  }
}

@RestController
@RequestMapping("/api/reviews")
class ReviewController {
  private final ReviewService service;

  ReviewController(ReviewService service) {
    this.service = service;
  }

  @GetMapping("/book/{bookId}")
  List<Review> byBook(@PathVariable Long bookId) {
    return service.byBook(bookId);
  }

  @PostMapping
  Review create(Authentication authentication, @Valid @RequestBody ReviewRequest request) {
    return service.create(authentication.getName(), request);
  }
}
