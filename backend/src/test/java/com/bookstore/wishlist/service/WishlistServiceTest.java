package com.bookstore.wishlist.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bookstore.book.entity.Book;
import com.bookstore.book.repository.BookRepository;
import com.bookstore.user.entity.User;
import com.bookstore.user.repository.UserRepository;
import com.bookstore.wishlist.entity.WishlistItem;
import com.bookstore.wishlist.repository.WishlistRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class WishlistServiceTest {
  @Mock private WishlistRepository wishlist;
  @Mock private UserRepository users;
  @Mock private BookRepository books;
  @InjectMocks private WishlistService service;

  @Test
  void getAllReturnsUsersWishlistInRepositoryOrder() {
    var first = new WishlistItem(new User(), new Book());
    var second = new WishlistItem(new User(), new Book());
    when(wishlist.findByUserUsernameOrderByCreatedAtDesc("alice"))
        .thenReturn(List.of(first, second));

    var result = service.getAll("alice");

    assertEquals(List.of(first, second), result);
  }

  @Test
  void addReturnsExistingItemWithoutCreatingDuplicate() {
    var existing = new WishlistItem(new User(), new Book());
    when(wishlist.findByUserUsernameAndBookId("alice", 7L)).thenReturn(Optional.of(existing));

    var result = service.add("alice", 7L);

    assertEquals(existing, result);
    org.mockito.Mockito.verifyNoInteractions(users, books);
  }

  @Test
  void addCreatesNewItemForExistingUserAndBook() {
    var user = new User();
    var book = new Book();
    when(wishlist.findByUserUsernameAndBookId("alice", 7L)).thenReturn(Optional.empty());
    when(users.findByUsername("alice")).thenReturn(Optional.of(user));
    when(books.findById(7L)).thenReturn(Optional.of(book));
    when(wishlist.save(any(WishlistItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

    var result = service.add("alice", 7L);

    assertEquals(book, result.getBook());
  }

  @Test
  void removeDeletesExistingItemAndIgnoresMissingItem() {
    var existing = new WishlistItem(new User(), new Book());
    when(wishlist.findByUserUsernameAndBookId("alice", 7L)).thenReturn(Optional.of(existing));
    service.remove("alice", 7L);
    verify(wishlist).delete(existing);

    when(wishlist.findByUserUsernameAndBookId("alice", 8L)).thenReturn(Optional.empty());
    service.remove("alice", 8L);
    org.mockito.Mockito.verifyNoMoreInteractions(wishlist);
  }
}