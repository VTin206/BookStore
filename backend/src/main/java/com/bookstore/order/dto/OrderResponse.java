package com.bookstore.order.dto;

import com.bookstore.order.entity.Order;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(Long id, String trackingCode, String customerName, String customerEmail,
    String shippingAddress, String phone, String note, BigDecimal shippingFee, BigDecimal discountAmount,
    String couponCode, BigDecimal totalAmount, String status, LocalDateTime createdAt, List<Item> items) {
  public record BookSummary(Long id, String title, String author, String imageUrl) {}
  public record Item(BookSummary book, int quantity, BigDecimal unitPrice) {}

  public static OrderResponse from(Order order) {
    return new OrderResponse(order.getId(), order.getTrackingCode(), order.getCustomerName(),
        order.getCustomerEmail(), order.getShippingAddress(), order.getPhone(), order.getNote(),
        order.getShippingFee(), order.getDiscountAmount(), order.getCouponCode(), order.getTotalAmount(),
        order.getStatus(), order.getCreatedAt(), order.getItems().stream().map(item -> {
          var book = item.getBook();
          return new Item(new BookSummary(book.getId(), book.getTitle(), book.getAuthor(), book.getPublicImageUrl()),
              item.getQuantity(), item.getUnitPrice());
        }).toList());
  }
}
