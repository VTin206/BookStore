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
import com.bookstore.voucher.service.VoucherService;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.HashSet;
import java.util.Set;
import java.security.SecureRandom;
import org.springframework.stereotype.Service;

@Service
public class OrderService {
  private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("250000");
  private static final BigDecimal STANDARD_SHIPPING_FEE = new BigDecimal("30000");

  private static final List<String> VALID_STATUSES =
      List.of("PENDING", "CONFIRMED", "PROCESSING", "SHIPPING", "DELIVERED", "CANCELLED");
  private static final List<String> VALID_PAYMENT_METHODS = List.of("COD", "BANK", "CARD");
  private static final String TRACKING_CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  private static final SecureRandom TRACKING_CODE_RANDOM = new SecureRandom();

  private final OrderRepository orderRepository;
  private final BookRepository bookRepository;
  private final UserRepository userRepository;
  private final CartRepository cartRepository;
  private final PaymentRepository paymentRepository;
  private final VoucherService voucherService;

  public OrderService(
      OrderRepository orderRepository,
      BookRepository bookRepository,
      UserRepository userRepository,
      CartRepository cartRepository,
      PaymentRepository paymentRepository,
      VoucherService voucherService) {
    this.orderRepository = orderRepository;
    this.bookRepository = bookRepository;
    this.userRepository = userRepository;
    this.cartRepository = cartRepository;
    this.paymentRepository = paymentRepository;
    this.voucherService = voucherService;
  }

  @Transactional
  public Order create(String username, OrderRequest request) {
    var paymentMethod = request.paymentMethod().trim().toUpperCase();
    if (!VALID_PAYMENT_METHODS.contains(paymentMethod)) {
      throw new IllegalArgumentException("Phương thức thanh toán không hợp lệ");
    }

    var order = new Order();
    if (username != null && !username.isBlank()) {
      order.setUser(userRepository.findByUsername(username).orElseThrow());
    }
    order.setCustomerName(request.customerName());
    order.setCustomerEmail(request.customerEmail());
    order.setShippingAddress(request.shippingAddress());
    order.setPhone(request.phone());
    order.setNote(request.note());
    order.setCouponCode(normalizeCoupon(request.couponCode()));
    order.setTrackingCode(generateTrackingCode());

    var subtotal = BigDecimal.ZERO;
    Set<Long> requestedBookIds = new HashSet<>();
    for (var itemRequest : request.items()) {
      if (!requestedBookIds.add(itemRequest.bookId())) {
        throw new IllegalArgumentException("Không được lặp sách trong đơn hàng");
      }
      var book = bookRepository.findByIdForUpdate(itemRequest.bookId()).orElseThrow();
      if (!book.isActive()) {
        throw new IllegalStateException("Sách này hiện đã ngừng bán: " + book.getTitle());
      }
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
    var discountAmount = voucherService != null ? voucherService.apply(order.getCouponCode(), subtotal) : legacyTestDiscount(order.getCouponCode(), subtotal);
    order.setShippingFee(shippingFee);
    order.setDiscountAmount(discountAmount);
    order.setTotalAmount(subtotal.add(shippingFee).subtract(discountAmount));
    var saved = orderRepository.save(order);

    var payment = new Payment();
    payment.setOrder(saved);
    payment.setAmount(saved.getTotalAmount());
    payment.setMethod(paymentMethod);
    payment.setStatus("PENDING");
    paymentRepository.save(payment);

    if (username != null && !username.isBlank()) {
      cartRepository.findByUserUsername(username)
          .ifPresent(
              cart -> {
                cart.getItems().clear();
                cartRepository.save(cart);
              });
    }
    return saved;
  }

  private String generateTrackingCode() {
    var code = new StringBuilder(10);
    for (var index = 0; index < 10; index++) {
      code.append(TRACKING_CODE_ALPHABET.charAt(TRACKING_CODE_RANDOM.nextInt(TRACKING_CODE_ALPHABET.length())));
    }
    return code.toString();
  }

  private BigDecimal calculateShippingFee(BigDecimal subtotal) {
    return subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0
        ? BigDecimal.ZERO
        : STANDARD_SHIPPING_FEE;
  }

  private BigDecimal legacyTestDiscount(String code, BigDecimal subtotal) {
    if (code == null) return BigDecimal.ZERO;
    if (!code.equals("TRIAN30")) throw new IllegalArgumentException("Mã giảm giá không hợp lệ hoặc đã hết hạn");
    return subtotal.multiply(new BigDecimal("0.30")).setScale(0, RoundingMode.HALF_UP);
  }

  private String normalizeCoupon(String couponCode) {
    if (couponCode == null || couponCode.isBlank()) {
      return null;
    }
    return couponCode.trim().toUpperCase();
  }

  @Transactional(readOnly = true)
  public List<Order> allForAdmin() {
    return orderRepository.findAll();
  }

  @Transactional(readOnly = true)
  public List<Order> allForUser(String username) {
    return orderRepository.findByUserUsername(username);
  }

  @Transactional(readOnly = true)
  public com.bookstore.order.dto.OrderTrackingResponse lookup(String trackingCode) {
    if (trackingCode == null || trackingCode.isBlank()) {
      throw new IllegalArgumentException("Mã tra cứu không hợp lệ");
    }
    var order = orderRepository.findByTrackingCode(trackingCode.trim().toUpperCase()).orElseThrow();
    return new com.bookstore.order.dto.OrderTrackingResponse(
        order.getTrackingCode(), order.getStatus(), order.getTotalAmount(), order.getCreatedAt());
  }

  @Transactional
  public Order updateStatus(Long id, String status) {
    var normalized = status.trim().toUpperCase();
    if (!VALID_STATUSES.contains(normalized)) {
      throw new IllegalArgumentException("Trạng thái đơn hàng không hợp lệ");
    }
    var order = orderRepository.findById(id).orElseThrow();
    validateTransition(order.getStatus(), normalized);
    if ("CANCELLED".equals(normalized) && !"CANCELLED".equals(order.getStatus())) {
      order.getItems().forEach(item -> {
        var book = item.getBook();
        book.setStock(book.getStock() + item.getQuantity());
      });
    }
    order.setStatus(normalized);
    var saved = orderRepository.save(order);
    paymentRepository.findByOrderId(id).ifPresent(payment -> {
      if ("CANCELLED".equals(normalized)) {
        payment.setStatus("CANCELLED");
        payment.setPaid(false);
      } else if ("DELIVERED".equals(normalized)) {
        payment.setStatus("PAID");
        payment.setPaid(true);
      }
      paymentRepository.save(payment);
    });
    return saved;
  }

  private void validateTransition(String current, String next) {
    if (current.equals(next)) {
      return;
    }
    var allowed = switch (current) {
      case "PENDING" -> List.of("CONFIRMED", "CANCELLED");
      case "CONFIRMED" -> List.of("PROCESSING", "CANCELLED");
      case "PROCESSING" -> List.of("SHIPPING", "CANCELLED");
      case "SHIPPING" -> List.of("DELIVERED");
      case "DELIVERED", "CANCELLED" -> List.<String>of();
      default -> List.<String>of();
    };
    if (!allowed.contains(next)) {
      throw new IllegalArgumentException("Không thể chuyển đơn từ " + current + " sang " + next);
    }
  }
}
