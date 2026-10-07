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
import java.util.List;
import java.util.HashSet;
import java.util.Set;
import java.security.SecureRandom;
import org.springframework.stereotype.Service;

@Service
public class OrderService {
  private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("250000");
  private static final BigDecimal STANDARD_SHIPPING_FEE = new BigDecimal("30000");
  private static final BigDecimal EXPRESS_SHIPPING_FEE = new BigDecimal("45000");
  private static final BigDecimal SAME_DAY_SHIPPING_FEE = new BigDecimal("60000");

  private static final List<String> VALID_STATUSES =
      List.of("PENDING", "CONFIRMED", "PROCESSING", "SHIPPING", "DELIVERED", "CANCELLED");
  private static final List<String> VALID_PAYMENT_METHODS = List.of("COD", "BANK", "MOMO", "VNPAY", "CARD");
  private static final List<String> VALID_SHIPPING_METHODS = List.of("STANDARD", "EXPRESS", "SAME_DAY");
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
    var shippingMethod = normalizeShippingMethod(request.shippingMethod());
    if (username != null && !username.isBlank()) {
      order.setUser(userRepository.findByUsernameForUpdate(username).orElseThrow());
    }
    order.setCustomerName(request.customerName());
    order.setCustomerEmail(request.customerEmail());
    order.setShippingAddress(request.shippingAddress());
    order.setPhone(request.phone());
    order.setNote(request.note());
    order.setShippingMethod(shippingMethod);
    order.setCouponCode(normalizeCoupon(request.couponCode()));
    order.setTrackingCode(generateTrackingCode());

    var subtotal = BigDecimal.ZERO;
    Set<Long> requestedBookIds = new HashSet<>();
    for (var itemRequest : request.items().stream().sorted(java.util.Comparator.comparing(OrderRequest.Item::bookId)).toList()) {
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

    var shippingFee = calculateShippingFee(subtotal, shippingMethod);
    var discountAmount = voucherService.apply(order.getCouponCode(), subtotal);
    order.setShippingFee(shippingFee);
    order.setDiscountAmount(discountAmount);
    order.setTotalAmount(validateTotal(subtotal.add(shippingFee).subtract(discountAmount)));
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

  @Transactional(readOnly = true)
  public com.bookstore.order.dto.OrderQuote quote(com.bookstore.order.dto.OrderQuoteRequest request) {
    var subtotal = BigDecimal.ZERO;
    Set<Long> ids = new HashSet<>();
    for (var item : request.items()) {
      if (!ids.add(item.bookId())) throw new IllegalArgumentException("Không được lặp sách trong đơn hàng");
      var book = bookRepository.findById(item.bookId()).orElseThrow();
      if (!book.isActive() || book.getStock() < item.quantity()) {
        throw new IllegalArgumentException("Sách ngừng bán hoặc không đủ tồn kho: " + book.getTitle());
      }
      subtotal = subtotal.add(book.getPrice().multiply(BigDecimal.valueOf(item.quantity())));
    }
    var shipping = calculateShippingFee(subtotal, normalizeShippingMethod(request.shippingMethod()));
    var discount = voucherService.preview(request.couponCode(), subtotal);
    return new com.bookstore.order.dto.OrderQuote(subtotal, shipping, discount, validateTotal(subtotal.add(shipping).subtract(discount)));
  }

  private BigDecimal validateTotal(BigDecimal total) {
    if (total.signum() < 0 || total.compareTo(new BigDecimal("9999999999.99")) > 0) {
      throw new IllegalArgumentException("Tổng giá trị đơn hàng vượt giới hạn cho phép");
    }
    return total;
  }

  private BigDecimal calculateShippingFee(BigDecimal subtotal, String shippingMethod) {
    return switch (shippingMethod) {
      case "EXPRESS" -> EXPRESS_SHIPPING_FEE;
      case "SAME_DAY" -> SAME_DAY_SHIPPING_FEE;
      default -> subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0
          ? BigDecimal.ZERO
          : STANDARD_SHIPPING_FEE;
    };
  }

  private String normalizeShippingMethod(String shippingMethod) {
    var normalized = shippingMethod == null ? "STANDARD" : shippingMethod.trim().toUpperCase();
    if (!VALID_SHIPPING_METHODS.contains(normalized)) {
      throw new IllegalArgumentException("Invalid shipping method");
    }
    return normalized;
  }

  private String normalizeCoupon(String couponCode) {
    if (couponCode == null || couponCode.isBlank()) {
      return null;
    }
    return couponCode.trim().toUpperCase();
  }

  @Transactional(readOnly = true)
  public org.springframework.data.domain.Page<com.bookstore.order.dto.OrderResponse> allForAdmin(org.springframework.data.domain.Pageable pageable) {
    return orderRepository.findAll(pageable).map(com.bookstore.order.dto.OrderResponse::from);
  }

  @Transactional(readOnly = true)
  public org.springframework.data.domain.Page<com.bookstore.order.dto.OrderResponse> allForUser(String username, org.springframework.data.domain.Pageable pageable) {
    return orderRepository.findByUserUsername(username, pageable).map(com.bookstore.order.dto.OrderResponse::from);
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
    var order = orderRepository.findByIdForUpdate(id).orElseThrow();
    return transition(order, normalized);
  }

  private Order transition(Order order, String normalized) {
    validateTransition(order.getStatus(), normalized);
    if ("CANCELLED".equals(normalized) && !"CANCELLED".equals(order.getStatus())) {
      order.getItems().stream().sorted(java.util.Comparator.comparing(item -> item.getBook().getId())).forEach(item -> {
        var book = bookRepository.findByIdForUpdate(item.getBook().getId()).orElseThrow();
        book.setStock(Math.addExact(book.getStock(), item.getQuantity()));
      });
      voucherService.release(order.getCouponCode());
    }
    order.setStatus(normalized);
    var saved = orderRepository.save(order);
    paymentRepository.findByOrderId(order.getId()).ifPresent(payment -> {
      if ("CANCELLED".equals(normalized)) {
        payment.setStatus("CANCELLED");
        payment.setPaid(false);
      } else if ("DELIVERED".equals(normalized) && "COD".equals(payment.getMethod())) {
        payment.setStatus("PAID");
        payment.setPaid(true);
      }
      paymentRepository.save(payment);
    });
    return saved;
  }

  @Transactional
  public com.bookstore.order.dto.OrderResponse createResponse(String username, OrderRequest request) {
    return com.bookstore.order.dto.OrderResponse.from(create(username, request));
  }

  @Transactional
  public com.bookstore.order.dto.OrderResponse updateStatusResponse(Long id, String status) {
    return com.bookstore.order.dto.OrderResponse.from(updateStatus(id, status));
  }

  @Transactional
  public com.bookstore.order.dto.OrderResponse cancelForUser(String username, Long id) {
    var order = orderRepository.findByIdForUpdate(id).orElseThrow();
    if (order.getUser() == null || !username.equals(order.getUser().getUsername())) {
      throw new org.springframework.security.access.AccessDeniedException("Bạn không có quyền hủy đơn hàng này");
    }
    if (!List.of("PENDING", "CONFIRMED").contains(order.getStatus())) {
      throw new IllegalArgumentException("Đơn hàng chỉ có thể hủy khi chưa được đóng gói");
    }
    return com.bookstore.order.dto.OrderResponse.from(transition(order, "CANCELLED"));
  }

  @Transactional
  public void expirePendingOrder(Long id, java.time.LocalDateTime cutoff) {
    orderRepository.findByIdForUpdate(id).ifPresent(order -> {
      if ("PENDING".equals(order.getStatus()) && order.getCreatedAt().isBefore(cutoff)) transition(order, "CANCELLED");
    });
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
