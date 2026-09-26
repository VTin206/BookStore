package com.bookstore.cart.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bookstore.book.entity.Book;
import com.bookstore.book.repository.BookRepository;
import com.bookstore.cart.dto.CartItemRequest;
import com.bookstore.cart.entity.Cart;
import com.bookstore.cart.entity.CartItem;
import com.bookstore.cart.repository.CartItemRepository;
import com.bookstore.cart.repository.CartRepository;
import com.bookstore.user.entity.User;
import com.bookstore.user.repository.UserRepository;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {
  @Mock private CartRepository carts;
  @Mock private CartItemRepository items;
  @Mock private BookRepository books;
  @Mock private UserRepository users;
  @InjectMocks private CartService service;

  @Test
  void getCreatesCartForExistingUserWhenMissing() {
    var user = user("alice");
    when(carts.findByUserUsername("alice")).thenReturn(Optional.empty());
    when(users.findByUsername("alice")).thenReturn(Optional.of(user));
    when(carts.save(any(Cart.class))).thenAnswer(invocation -> invocation.getArgument(0));

    var result = service.get("alice");

    assertEquals(user, result.getUser());
    assertEquals(0, result.getItems().size());
  }

  @Test
  void addCreatesItemWhenBookIsInStock() throws Exception {
    var cart = new Cart(user("alice"));
    var book = book(10L, "Book", 5, new BigDecimal("100"));
    when(carts.findByUserUsername("alice")).thenReturn(Optional.of(cart));
    when(books.findById(10L)).thenReturn(Optional.of(book));
    when(carts.save(cart)).thenReturn(cart);

    var result = service.add("alice", new CartItemRequest(10L, 3));

    assertEquals(1, result.getItems().size());
    assertEquals(3, result.getItems().get(0).getQuantity());
  }

  @Test
  void addRejectsQuantityAboveStock() {
    var cart = new Cart(user("alice"));
    var book = book(10L, "Book", 2, BigDecimal.TEN);
    when(carts.findByUserUsername("alice")).thenReturn(Optional.of(cart));
    when(books.findById(10L)).thenReturn(Optional.of(book));

    assertThrows(
        IllegalArgumentException.class, () -> service.add("alice", new CartItemRequest(10L, 3)));
  }

  @Test
  void addMergesExistingItemAndChecksCombinedStock() throws Exception {
    var cart = new Cart(user("alice"));
    var book = book(10L, "Book", 5, BigDecimal.TEN);
    var existing = new CartItem(cart, book, 2);
    cart.getItems().add(existing);
    when(carts.findByUserUsername("alice")).thenReturn(Optional.of(cart));
    when(books.findById(10L)).thenReturn(Optional.of(book));
    when(carts.save(cart)).thenReturn(cart);

    service.add("alice", new CartItemRequest(10L, 3));

    assertEquals(5, existing.getQuantity());
  }

  @Test
  void updateRejectsItemOwnedByAnotherUser() throws Exception {
    var cart = new Cart(user("bob"));
    var item = new CartItem(cart, book(10L, "Book", 5, BigDecimal.TEN), 1);
    setId(item, 20L);
    when(items.findById(20L)).thenReturn(Optional.of(item));

    assertThrows(IllegalArgumentException.class, () -> service.update("alice", 20L, 2));
  }

  @Test
  void updateChangesOwnedItemQuantity() throws Exception {
    var cart = new Cart(user("alice"));
    var item = new CartItem(cart, book(10L, "Book", 5, BigDecimal.TEN), 1);
    setId(item, 20L);
    when(items.findById(20L)).thenReturn(Optional.of(item));
    when(carts.save(cart)).thenReturn(cart);

    service.update("alice", 20L, 4);

    assertEquals(4, item.getQuantity());
    verify(carts).save(cart);
  }

  @Test
  void removeDeletesOnlyOwnedItem() throws Exception {
    var cart = new Cart(user("alice"));
    var item = new CartItem(cart, book(10L, "Book", 5, BigDecimal.TEN), 1);
    setId(item, 20L);
    when(items.findById(20L)).thenReturn(Optional.of(item));

    service.remove("alice", 20L);

    verify(items).delete(item);
  }

  private static User user(String username) {
    var user = new User();
    user.setUsername(username);
    return user;
  }

  private static Book book(Long id, String title, int stock, BigDecimal price) {
    var book = new Book();
    setId(book, id);
    book.setTitle(title);
    book.setStock(stock);
    book.setPrice(price);
    return book;
  }

  private static void setId(Object target, Long id) {
    try {
      Field field = target.getClass().getDeclaredField("id");
      field.setAccessible(true);
      field.set(target, id);
    } catch (ReflectiveOperationException exception) {
      throw new AssertionError(exception);
    }
  }
}