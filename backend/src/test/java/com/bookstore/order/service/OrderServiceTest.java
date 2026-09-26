package com.bookstore.order.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bookstore.book.entity.Book;
import com.bookstore.book.repository.BookRepository;
import com.bookstore.cart.entity.Cart;
import com.bookstore.order.dto.OrderRequest;
import com.bookstore.order.entity.Order;
import com.bookstore.order.entity.Payment;
import com.bookstore.order.repository.OrderRepository;
import com.bookstore.order.repository.PaymentRepository;
import com.bookstore.cart.repository.CartRepository;
import com.bookstore.user.entity.User;
import com.bookstore.user.repository.UserRepository;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
  @Mock private OrderRepository orders;
  @Mock private BookRepository books;
  @Mock private UserRepository users;
  @Mock private CartRepository carts;
  @Mock private PaymentRepository payments;
  @InjectMocks private OrderService service;

  @Test
  void createCalculatesTotalPersistsPaymentAndClearsCart() throws Exception {
    var user = new User();
    user.setUsername("alice");
    var book = book(7L, "Book", 10, new BigDecimal("25"));
    var cart = new Cart(user);
    cart.getItems().add(new com.bookstore.cart.entity.CartItem(cart, book, 1));
    when(users.findByUsername("alice")).thenReturn(Optional.of(user));
    when(books.findById(7L)).thenReturn(Optional.of(book));
    when(orders.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(carts.findByUserUsername("alice")).thenReturn(Optional.of(cart));
    when(carts.save(cart)).thenReturn(cart);

    var request =
        new OrderRequest(
            "Alice",
            "alice@example.com",
            "1 Main Street",
            "0900000000",
            "Leave at door",
            new BigDecimal("5"),
            " bank ",
            List.of(new OrderRequest.Item(7L, 2)));

    var result = service.create("alice", request);

    assertEquals(new BigDecimal("55"), result.getTotalAmount());
    assertEquals(new BigDecimal("5"), result.getShippingFee());
    assertEquals("Leave at door", result.getNote());
    assertEquals(1, result.getItems().size());
    assertEquals(2, result.getItems().get(0).getQuantity());
    assertEquals(8, book.getStock());
    assertEquals(0, cart.getItems().size());

    var paymentCaptor = ArgumentCaptor.forClass(Payment.class);
    verify(payments).save(paymentCaptor.capture());
    assertEquals(result, readField(paymentCaptor.getValue(), "order"));
    assertEquals(new BigDecimal("55"), readField(paymentCaptor.getValue(), "amount"));
    assertEquals("BANK", readField(paymentCaptor.getValue(), "method"));
    assertEquals("PENDING", readField(paymentCaptor.getValue(), "status"));
  }

  @Test
  void createRejectsUnsupportedPaymentMethod() {
    var request =
        new OrderRequest(
            "Alice",
            "alice@example.com",
            "Address",
            null,
            null,
            BigDecimal.ZERO,
            "PAYPAL",
            List.of(new OrderRequest.Item(7L, 1)));

    assertThrows(IllegalArgumentException.class, () -> service.create("alice", request));
  }

  @Test
  void createRejectsInsufficientStockBeforeSavingOrder() {
    var user = new User();
    var book = book(7L, "Book", 1, BigDecimal.TEN);
    when(users.findByUsername("alice")).thenReturn(Optional.of(user));
    when(books.findById(7L)).thenReturn(Optional.of(book));
    var request =
        new OrderRequest(
            "Alice",
            "alice@example.com",
            "Address",
            null,
            null,
            BigDecimal.ZERO,
            "COD",
            List.of(new OrderRequest.Item(7L, 2)));

    assertThrows(IllegalArgumentException.class, () -> service.create("alice", request));
    org.mockito.Mockito.verifyNoInteractions(orders, payments);
  }

  @Test
  void updateStatusNormalizesAndPersistsSupportedStatus() {
    var order = new Order();
    when(orders.findById(4L)).thenReturn(Optional.of(order));
    when(orders.save(order)).thenReturn(order);

    var result = service.updateStatus(4L, " delivered ");

    assertEquals("DELIVERED", result.getStatus());
  }

  @Test
  void updateStatusRejectsUnsupportedStatus() {
    assertThrows(IllegalArgumentException.class, () -> service.updateStatus(4L, "REFUNDED"));
  }

  private static Book book(Long id, String title, int stock, BigDecimal price) {
    var book = new Book();
    setId(book, id);
    book.setTitle(title);
    book.setStock(stock);
    book.setPrice(price);
    return book;
  }

  private static Object readField(Object target, String name) throws Exception {
    Field field = target.getClass().getDeclaredField(name);
    field.setAccessible(true);
    return field.get(target);
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