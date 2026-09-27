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
import java.math.RoundingMode;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class OrderService {
  private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("250000");
  private static final BigDecimal STANDARD_SHIPPING_FEE = new BigDecimal("30000");
  private static final BigDecimal TRIAN30_RATE = new BigDecimal("0.30");
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
    order.setCouponCode(normalizeCoupon(request.couponCode()));

    var subtotal = BigDecimal.ZERO;
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
      subtotal = subtotal.add(book.getPrice().multiply(BigDecimal.valueOf(itemRequest.quantity())));
    }

    var shippingFee = calculateShippingFee(subtotal);
    var discountAmount = calculateDiscount(subtotal, order.getCouponCode());
    order.setShippingFee(shippingFee);
    order.setDiscountAmount(discountAmount);
    order.setTotalAmount(subtotal.add(shippingFee).subtract(discountAmount));
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

  private BigDecimal calculateShippingFee(BigDecimal subtotal) {
    return subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0
        ? BigDecimal.ZERO
        : STANDARD_SHIPPING_FEE;
  }

  private BigDecimal calculateDiscount(BigDecimal subtotal, String couponCode) {
    if (couponCode == null) {
      return BigDecimal.ZERO;
    }
    if (!couponCode.equals("TRIAN30")) {
      throw new IllegalArgumentException("Mã giảm giá không hợp lệ hoặc đã hết hạn");
    }
    return subtotal.multiply(TRIAN30_RATE).setScale(0, RoundingMode.HALF_UP);
  }

  private String normalizeCoupon(String couponCode) {
    if (couponCode == null || couponCode.isBlank()) {
      return null;
    }
    return couponCode.trim().toUpperCase();
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
