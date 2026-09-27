package com.bookstore.review;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.bookstore.book.entity.Book;
import com.bookstore.book.repository.BookRepository;
import com.bookstore.user.entity.User;
import com.bookstore.user.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {
  @Mock private ReviewRepository reviews;
  @Mock private UserRepository users;
  @Mock private BookRepository books;
  @InjectMocks private ReviewService service;

  @Test
  void createRejectsDuplicateAndReturnsUserName() {
    var user = new User();
    user.setUsername("alice");
    user.setFullName("Alice");
    var book = new Book();
    when(users.findByUsername("alice")).thenReturn(Optional.of(user));
    when(books.findById(7L)).thenReturn(Optional.of(book));
    when(reviews.existsByUserIdAndBookId(null, 7L)).thenReturn(false);
    when(reviews.save(any(Review.class))).thenAnswer(invocation -> invocation.getArgument(0));

    var result = service.create("alice", new ReviewRequest(7L, 5, "Great"));

    assertEquals("Alice", result.getUserName());
    assertEquals(5, result.getRating());
  }

  @Test
  void createRejectsExistingReview() {
    var user = new User();
    user.setUsername("alice");
    var book = new Book();
    when(users.findByUsername("alice")).thenReturn(Optional.of(user));
    when(books.findById(7L)).thenReturn(Optional.of(book));
    when(reviews.existsByUserIdAndBookId(null, 7L)).thenReturn(true);

    assertThrows(
        IllegalArgumentException.class,
        () -> service.create("alice", new ReviewRequest(7L, 5, null)));
  }

  @Test
  void byBookAttachesUserName() {
    var user = new User();
    user.setFullName("Alice");
    var review = new Review();
    review.setUserId(3L);
    when(books.findById(7L)).thenReturn(Optional.of(new Book()));
    when(reviews.findByBookIdOrderByCreatedAtDesc(7L)).thenReturn(List.of(review));
    when(users.findById(3L)).thenReturn(Optional.of(user));

    assertEquals("Alice", service.byBook(7L).getFirst().getUserName());
  }
}
