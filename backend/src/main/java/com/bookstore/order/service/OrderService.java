package com.bookstore.order.service;

import com.bookstore.book.repository.BookRepository;
import com.bookstore.cart.repository.CartRepository;
import com.bookstore.order.dto.OrderRequest;
import com.bookstore.order.entity.Order;
import com.bookstore.order.entity.OrderItem;
import com.bookstore.order.entity.Payment;
import com.bookstore.order.repository.OrderRepository;
import com.bookstore.order.repository.PaymentRepository;
import com.bookstore.user.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class OrderService {
  private static final List<String> VALID_STATUSES =
      List.of("PENDING", "CONFIRMED", "PROCESSING", "SHIPPING", "DELIVERED", "CANCELLED");
  private static final List<String> VALID_PAYMENT_METHODS = List.of("COD", "BANK", "CARD");

  private final OrderRepository orders;
  private final BookRepository books;
  private final UserRepository users;
  private final CartRepository carts;
  private final PaymentRepository payments;

  public OrderService(
      OrderRepository orders,
      BookRepository books,
      UserRepository users,
      CartRepository carts,
      PaymentRepository payments) {
    this.orders = orders;
    this.books = books;
    this.users = users;
    this.carts = carts;
    this.payments = payments;
  }

  @Transactional
  public Order create(String username, OrderRequest request) {
    var paymentMethod = request.paymentMethod().trim().toUpperCase();
    if (!VALID_PAYMENT_METHODS.contains(paymentMethod)) {
      throw new IllegalArgumentException("Phương thức thanh toán không hợp lệ");
    }

    var order = new Order();
    order.setUser(users.findByUsername(username).orElseThrow());
    order.setCustomerName(request.customerName());
    order.setCustomerEmail(request.customerEmail());
    order.setShippingAddress(request.shippingAddress());
    order.setPhone(request.phone());
    order.setNote(request.note());
    order.setShippingFee(request.shippingFee());

    var total = request.shippingFee();
    for (var itemRequest : request.items()) {
      var book = books.findById(itemRequest.bookId()).orElseThrow();
      if (book.getStock() < itemRequest.quantity()) {
        throw new IllegalArgumentException("Sách không đủ tồn kho: " + book.getTitle());
      }
      book.setStock(book.getStock() - itemRequest.quantity());

      var item = new OrderItem();
      item.setOrder(order);
      item.setBook(book);
      item.setQuantity(itemRequest.quantity());
      item.setUnitPrice(book.getPrice());
      order.getItems().add(item);
      total = total.add(book.getPrice().multiply(BigDecimal.valueOf(itemRequest.quantity())));
    }

    order.setTotalAmount(total);
    var saved = orders.save(order);

    var payment = new Payment();
    payment.setOrder(saved);
    payment.setAmount(saved.getTotalAmount());
    payment.setMethod(paymentMethod);
    payment.setStatus("PENDING");
    payments.save(payment);

    carts.findByUserUsername(username)
        .ifPresent(
            cart -> {
              cart.getItems().clear();
              carts.save(cart);
            });
    return saved;
  }

  @Transactional(readOnly = true)
  public List<Order> allForAdmin() {
    return orders.findAll();
  }

  @Transactional
  public Order updateStatus(Long id, String status) {
    var normalized = status.trim().toUpperCase();
    if (!VALID_STATUSES.contains(normalized)) {
      throw new IllegalArgumentException("Trạng thái đơn hàng không hợp lệ");
    }
    var order = orders.findById(id).orElseThrow();
    order.setStatus(normalized);
    return orders.save(order);
  }
}
