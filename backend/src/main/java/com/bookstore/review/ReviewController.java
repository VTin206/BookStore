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

  public void setUserId(Long userId) {
    this.userId = userId;
  }

  public void setBookId(Long bookId) {
    this.bookId = bookId;
  }

  public void setRating(Integer rating) {
    this.rating = rating;
  }

  public void setComment(String comment) {
    this.comment = comment;
  }
  public void setUserName(String userName) {
    this.userName = userName;
  }
}

@RestController
@RequestMapping("/api/reviews")
class ReviewController {
  private final ReviewService reviewService;

  ReviewController(ReviewService reviewService) {
    this.reviewService = reviewService;
  }

  @GetMapping("/book/{bookId}")
  List<Review> byBook(@PathVariable Long bookId) {
    return reviewService.byBook(bookId);
  }

  @GetMapping("/book/{bookId}/can-review")
  boolean canReview(Authentication authentication, @PathVariable Long bookId) {
    return authentication != null && reviewService.canReview(authentication.getName(), bookId);
  }

  @PostMapping
  Review create(Authentication authentication, @Valid @RequestBody ReviewRequest request) {
    return reviewService.create(authentication.getName(), request);
  }
}
