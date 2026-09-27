package com.bookstore.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.List;

public record OrderRequest(
    @NotBlank String customerName,
    @Email @NotBlank String customerEmail,
    @NotBlank String shippingAddress,
    String phone,
    String note,
    @NotNull @PositiveOrZero BigDecimal shippingFee,
    @NotBlank String paymentMethod,
    @NotEmpty List<@Valid Item> items,
    String couponCode) {

  public OrderRequest(
      String customerName,
      String customerEmail,
      String shippingAddress,
      String phone,
      String note,
      BigDecimal shippingFee,
      String paymentMethod,
      List<@Valid Item> items) {
    this(customerName, customerEmail, shippingAddress, phone, note, shippingFee, paymentMethod, items, null);
  }

  public record Item(
      @NotNull Long bookId,
      @NotNull @Positive Integer quantity) {}
}
