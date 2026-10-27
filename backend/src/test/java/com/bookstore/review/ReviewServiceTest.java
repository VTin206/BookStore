package com.bookstore.review;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.bookstore.book.entity.Book;
import com.bookstore.book.repository.BookRepository;
import com.bookstore.order.repository.OrderRepository;
import com.bookstore.user.entity.User;
import com.bookstore.user.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {
  @Mock private ReviewRepository reviews;
  @Mock private UserRepository users;
  @Mock private BookRepository bookRepository;
  @Mock private OrderRepository orderRepository;
  @InjectMocks private ReviewService service;

  @Test
  void createRejectsDuplicateAndReturnsUserName() {
    var user = new User();
    user.setUsername("alice");
    user.setFullName("Alice");
    var book = new Book();
    when(users.findByUsername("alice")).thenReturn(Optional.of(user));
    when(bookRepository.findById(7L)).thenReturn(Optional.of(book));
    when(orderRepository.existsByUserUsernameAndStatusAndItemsBookId("alice", "DELIVERED", 7L)).thenReturn(true);
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
    when(bookRepository.findById(7L)).thenReturn(Optional.of(book));
    when(orderRepository.existsByUserUsernameAndStatusAndItemsBookId("alice", "DELIVERED", 7L)).thenReturn(true);
    when(reviews.existsByUserIdAndBookId(null, 7L)).thenReturn(true);

    assertThrows(
        IllegalArgumentException.class,
        () -> service.create("alice", new ReviewRequest(7L, 5, null)));
  }

  @Test
  void byBookAttachesUserName() {
    var user = new User();
    ReflectionTestUtils.setField(user, "id", 3L);
    user.setFullName("Alice");
    var review = new Review();
    review.setUserId(3L);
    when(bookRepository.findById(7L)).thenReturn(Optional.of(new Book()));
    when(reviews.findByBookIdOrderByCreatedAtDesc(7L)).thenReturn(List.of(review));
    when(users.findAllById(List.of(3L))).thenReturn(List.of(user));

    assertEquals("Alice", service.byBook(7L).getFirst().getUserName());
  }

  @Test
  void byBookLoadsDistinctReviewAuthorsInOneBatch() {
    var firstUser = new User();
    ReflectionTestUtils.setField(firstUser, "id", 3L);
    firstUser.setFullName("Alice");
    var secondUser = new User();
    ReflectionTestUtils.setField(secondUser, "id", 4L);
    secondUser.setFullName("Bob");
    var firstReview = new Review();
    firstReview.setUserId(3L);
    var secondReview = new Review();
    secondReview.setUserId(4L);
    when(bookRepository.findById(7L)).thenReturn(Optional.of(new Book()));
    when(reviews.findByBookIdOrderByCreatedAtDesc(7L)).thenReturn(List.of(firstReview, secondReview));
    when(users.findAllById(List.of(3L, 4L))).thenReturn(List.of(firstUser, secondUser));

    var result = service.byBook(7L);

    assertEquals(List.of("Alice", "Bob"), result.stream().map(Review::getUserName).toList());
    org.mockito.Mockito.verify(users).findAllById(List.of(3L, 4L));
  }
}
