package com.bookstore.review;

import com.bookstore.user.repository.UserRepository;
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
import org.springframework.data.jpa.repository.JpaRepository;
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

  Long userId;
  Long bookId;
  Integer rating;
  String comment;
  LocalDateTime createdAt = LocalDateTime.now();

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
}

interface ReviewRepository extends JpaRepository<Review, Long> {
  List<Review> findByBookId(Long bookId);
}

record ReviewRequest(
    @NotNull Long bookId,
    @NotNull @Min(1) @Max(5) Integer rating,
    String comment) {}

@RestController
@RequestMapping("/api/reviews")
class ReviewController {
  private final ReviewRepository reviews;
  private final UserRepository users;

  ReviewController(ReviewRepository reviews, UserRepository users) {
    this.reviews = reviews;
    this.users = users;
  }

  @GetMapping("/book/{bookId}")
  List<Review> byBook(@PathVariable Long bookId) {
    return reviews.findByBookId(bookId);
  }

  @PostMapping
  Review create(Authentication authentication, @Valid @RequestBody ReviewRequest request) {
    var review = new Review();
    review.setUserId(users.findByUsername(authentication.getName()).orElseThrow().getId());
    review.setBookId(request.bookId());
    review.setRating(request.rating());
    review.setComment(request.comment());
    return reviews.save(review);
  }
}
