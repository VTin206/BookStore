package com.bookstore.review;

import com.bookstore.book.repository.BookRepository;
import com.bookstore.order.repository.OrderRepository;
import com.bookstore.user.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewService {
  private final ReviewRepository reviewRepository;
  private final UserRepository userRepository;
  private final BookRepository bookRepository;
  private final OrderRepository orderRepository;

  public ReviewService(ReviewRepository reviewRepository, UserRepository userRepository, BookRepository bookRepository, OrderRepository orderRepository) {
    this.reviewRepository = reviewRepository;
    this.userRepository = userRepository;
    this.bookRepository = bookRepository;
    this.orderRepository = orderRepository;
  }

  @Transactional(readOnly = true)
  public List<Review> byBook(Long bookId) {
    bookRepository.findById(bookId).orElseThrow();
    var result = reviewRepository.findByBookIdOrderByCreatedAtDesc(bookId);
    result.forEach(this::attachUserName);
    return result;
  }

  @Transactional(readOnly = true)
  public boolean canReview(String username, Long bookId) {
    return orderRepository.existsByUserUsernameAndStatusAndItemsBookId(username, "DELIVERED", bookId);
  }

  @Transactional
  public Review create(String username, ReviewRequest request) {
    var user = userRepository.findByUsername(username).orElseThrow();
    bookRepository.findById(request.bookId()).orElseThrow();
    if (!orderRepository.existsByUserUsernameAndStatusAndItemsBookId(username, "DELIVERED", request.bookId())) {
      throw new IllegalArgumentException("Bạn chỉ có thể đánh giá sách sau khi đã nhận hàng");
    }
    if (reviewRepository.existsByUserIdAndBookId(user.getId(), request.bookId())) {
      throw new IllegalArgumentException("Bạn đã đánh giá sách này");
    }

    var review = new Review();
    review.setUserId(user.getId());
    review.setBookId(request.bookId());
    review.setRating(request.rating());
    review.setComment(request.comment());
    review.setUserName(user.getFullName());
    return reviewRepository.save(review);
  }

  private void attachUserName(Review review) {
    userRepository.findById(review.getUserId()).ifPresent(user -> review.setUserName(user.getFullName()));
  }
}
