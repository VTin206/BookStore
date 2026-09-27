package com.bookstore.review;

import com.bookstore.book.repository.BookRepository;
import com.bookstore.user.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewService {
  private final ReviewRepository reviews;
  private final UserRepository users;
  private final BookRepository books;

  public ReviewService(ReviewRepository reviews, UserRepository users, BookRepository books) {
    this.reviews = reviews;
    this.users = users;
    this.books = books;
  }

  @Transactional(readOnly = true)
  public List<Review> byBook(Long bookId) {
    books.findById(bookId).orElseThrow();
    var result = reviews.findByBookIdOrderByCreatedAtDesc(bookId);
    result.forEach(this::attachUserName);
    return result;
  }

  @Transactional
  public Review create(String username, ReviewRequest request) {
    var user = users.findByUsername(username).orElseThrow();
    books.findById(request.bookId()).orElseThrow();
    if (reviews.existsByUserIdAndBookId(user.getId(), request.bookId())) {
      throw new IllegalArgumentException("Bạn đã đánh giá sách này");
    }

    var review = new Review();
    review.setUserId(user.getId());
    review.setBookId(request.bookId());
    review.setRating(request.rating());
    review.setComment(request.comment());
    review.setUserName(user.getFullName());
    return reviews.save(review);
  }

  private void attachUserName(Review review) {
    users.findById(review.getUserId()).ifPresent(user -> review.setUserName(user.getFullName()));
  }
}
