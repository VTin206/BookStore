package com.bookstore.order.service;

import com.bookstore.book.repository.BookRepository;
import com.bookstore.cart.repository.CartRepository;
import com.bookstore.order.dto.OrderRequest;
import com.bookstore.order.entity.Order;
import com.bookstore.order.entity.OrderItem;
import com.bookstore.order.entity.Payment;
import com.bookstore.order.entity.OrderIdempotency;
import com.bookstore.order.repository.OrderIdempotencyRepository;
import com.bookstore.order.repository.OrderRepository;
import com.bookstore.order.repository.PaymentRepository;
import com.bookstore.user.repository.UserRepository;
import com.bookstore.voucher.service.VoucherService;
import com.bookstore.inventory.service.InventoryService;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.HashSet;
import java.util.Set;
import java.util.Locale;
import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class OrderService {
  private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("250000");
  private static final BigDecimal STANDARD_SHIPPING_FEE = new BigDecimal("30000");
  private static final BigDecimal EXPRESS_SHIPPING_FEE = new BigDecimal("45000");
  private static final BigDecimal SAME_DAY_SHIPPING_FEE = new BigDecimal("60000");

  private static final List<String> VALID_STATUSES =
      List.of("PENDING", "CONFIRMED", "PROCESSING", "SHIPPING", "DELIVERED", "CANCELLED");
  private static final List<String> VALID_PAYMENT_METHODS = List.of("COD", "BANK");
  private static final List<String> VALID_SHIPPING_METHODS = List.of("STANDARD", "EXPRESS", "SAME_DAY");
  private static final String TRACKING_CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  private static final SecureRandom TRACKING_CODE_RANDOM = new SecureRandom();

  private final OrderRepository orderRepository;
  private final BookRepository bookRepository;
  private final UserRepository userRepository;
  private final CartRepository cartRepository;
  private final PaymentRepository paymentRepository;
  private final OrderIdempotencyRepository orderIdempotencyRepository;
  private final VoucherService voucherService;
  private final InventoryService inventoryService;

  public OrderService(
      OrderRepository orderRepository,
      BookRepository bookRepository,
      UserRepository userRepository,
      CartRepository cartRepository,
      PaymentRepository paymentRepository,
      OrderIdempotencyRepository orderIdempotencyRepository,
      VoucherService voucherService,
      InventoryService inventoryService) {
    this.orderRepository = orderRepository;
    this.bookRepository = bookRepository;
    this.userRepository = userRepository;
    this.cartRepository = cartRepository;
    this.paymentRepository = paymentRepository;
    this.orderIdempotencyRepository = orderIdempotencyRepository;
    this.voucherService = voucherService;
    this.inventoryService = inventoryService;
  }

  @Transactional
  public Order create(String username, OrderRequest request) {
    return create(username, request, null);
  }

  @Transactional
  public Order create(String username, OrderRequest request, String idempotencyKey) {
    var normalizedIdempotencyKey = normalizeIdempotencyKey(idempotencyKey);
    if (normalizedIdempotencyKey != null && (username == null || username.isBlank())) {
      throw new IllegalArgumentException("Idempotency-Key chỉ được dùng khi đã đăng nhập");
    }
    var requestHash = normalizedIdempotencyKey == null ? null : requestHash(request);
    var scopeKey = normalizedIdempotencyKey == null ? null : scopeKey(username);
    if (normalizedIdempotencyKey != null) {
      orderIdempotencyRepository.acquireRequestLock(scopeKey, normalizedIdempotencyKey);
      var existing = orderIdempotencyRepository.findByScopeKeyAndIdempotencyKey(scopeKey, normalizedIdempotencyKey);
      if (existing.isPresent()) {
        if (!existing.get().getRequestHash().equals(requestHash)) {
          throw new IllegalArgumentException("Idempotency-Key đã được dùng cho request khác");
        }
        return existing.get().getOrder();
      }
    }

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

    // The order ID is generated on save. Record the stock movements afterwards
    // so the audit trail can point back to the order that caused each change.
    if (inventoryService != null) {
      for (var item : saved.getItems()) {
        inventoryService.recordExistingChange(
            item.getBook(),
            -item.getQuantity(),
            "SALE",
            "Bán hàng",
            "ORDER",
            saved.getId(),
            username);
      }
    }

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
    if (normalizedIdempotencyKey != null) {
      var record = new OrderIdempotency();
      record.setScopeKey(scopeKey);
      record.setIdempotencyKey(normalizedIdempotencyKey);
      record.setRequestHash(requestHash);
      record.setOrder(saved);
      orderIdempotencyRepository.save(record);
    }
    return saved;
  }

  private String normalizeIdempotencyKey(String idempotencyKey) {
    if (idempotencyKey == null || idempotencyKey.isBlank()) {
      return null;
    }
    var normalized = idempotencyKey.trim();
    if (normalized.length() > 100) {
      throw new IllegalArgumentException("Idempotency-Key không được vượt quá 100 ký tự");
    }
    return normalized;
  }

  private String scopeKey(String username) {
    return username == null || username.isBlank() ? "anonymous" : username.trim().toLowerCase(Locale.ROOT);
  }

  private String requestHash(OrderRequest request) {
    var items = request.items().stream()
        .sorted(java.util.Comparator.comparing(OrderRequest.Item::bookId))
        .map(item -> item.bookId() + ":" + item.quantity())
        .collect(Collectors.joining(","));
    var payload = String.join("\u001F",
        value(request.customerName()), value(request.customerEmail()), value(request.shippingAddress()),
        value(request.phone()), value(request.note()), value(request.shippingFee()), value(request.shippingMethod()),
        value(request.paymentMethod()), items, value(request.couponCode()));
    try {
      return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
          .digest(payload.getBytes(StandardCharsets.UTF_8)));
    } catch (NoSuchAlgorithmException exception) {
      throw new IllegalStateException("Không thể tạo mã kiểm tra request", exception);
    }
  }

  private String value(Object value) {
    return value == null ? "" : value.toString();
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
    var payment = paymentRepository.findByOrderId(order.getId());
    if ("DELIVERED".equals(normalized)
        && payment.isPresent()
        && "BANK".equals(payment.get().getMethod())
        && !payment.get().isPaid()) {
      throw new IllegalStateException("Chưa thể giao đơn chuyển khoản khi thanh toán chưa được xác nhận");
    }
    if ("CANCELLED".equals(normalized)
        && payment.isPresent()
        && "BANK".equals(payment.get().getMethod())
        && payment.get().isPaid()) {
      throw new IllegalStateException("Không thể hủy đơn đã thanh toán chuyển khoản khi chưa có quy trình hoàn tiền");
    }
    if ("CANCELLED".equals(normalized) && !"CANCELLED".equals(order.getStatus())) {
      order.getItems().stream().sorted(java.util.Comparator.comparing(item -> item.getBook().getId())).forEach(item -> {
        var book = bookRepository.findByIdForUpdate(item.getBook().getId()).orElseThrow();
        book.setStock(Math.addExact(book.getStock(), item.getQuantity()));
        if (inventoryService != null) inventoryService.recordExistingChange(book, item.getQuantity(), "RETURN", "Hoàn tồn do hủy đơn", "ORDER", order.getId(), null);
      });
      voucherService.release(order.getCouponCode());
    }
    order.setStatus(normalized);
    var saved = orderRepository.save(order);
    payment.ifPresent(paymentRecord -> {
      if ("CANCELLED".equals(normalized)) {
        paymentRecord.setStatus("CANCELLED");
        paymentRecord.setPaid(false);
      } else if ("DELIVERED".equals(normalized) && "COD".equals(paymentRecord.getMethod())) {
        paymentRecord.setStatus("PAID");
        paymentRecord.setPaid(true);
      }
      paymentRepository.save(paymentRecord);
    });
    return saved;
  }

  @Transactional
  public com.bookstore.order.dto.OrderResponse confirmBankPayment(Long id, String transactionCode) {
    var normalizedCode = transactionCode == null ? "" : transactionCode.trim();
    if (normalizedCode.isBlank()) {
      throw new IllegalArgumentException("Mã giao dịch không được để trống");
    }
    var order = orderRepository.findByIdForUpdate(id).orElseThrow();
    if ("CANCELLED".equals(order.getStatus())) {
      throw new IllegalStateException("Không thể xác nhận thanh toán cho đơn đã hủy");
    }
    var payment = paymentRepository.findByOrderId(id).orElseThrow();
    if (!"BANK".equals(payment.getMethod())) {
      throw new IllegalArgumentException("Đơn hàng này không sử dụng thanh toán chuyển khoản");
    }
    if (payment.isPaid() && !normalizedCode.equals(payment.getTransactionCode())) {
      throw new IllegalStateException("Thanh toán của đơn hàng đã được xác nhận với mã giao dịch khác");
    }
    payment.setTransactionCode(normalizedCode);
    payment.setStatus("PAID");
    payment.setPaid(true);
    paymentRepository.save(payment);
    return com.bookstore.order.dto.OrderResponse.from(order);
  }

  @Transactional
  public com.bookstore.order.dto.OrderResponse createResponse(String username, OrderRequest request) {
    return com.bookstore.order.dto.OrderResponse.from(create(username, request));
  }

  @Transactional
  public com.bookstore.order.dto.OrderResponse createResponse(
      String username, OrderRequest request, String idempotencyKey) {
    return com.bookstore.order.dto.OrderResponse.from(create(username, request, idempotencyKey));
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
