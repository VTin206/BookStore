package com.bookstore.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Digits;
import java.math.BigDecimal;
import java.util.List;

public record OrderRequest(
    @NotBlank @Size(max = 150) String customerName,
    @Email @NotBlank @Size(max = 255) String customerEmail,
    @NotBlank @Size(max = 255) String shippingAddress,
    @NotBlank @Size(max = 30) String phone,
    @Size(max = 2000) String note,
    @NotNull @PositiveOrZero @Digits(integer = 10, fraction = 2) BigDecimal shippingFee,
    @NotBlank @Size(max = 30) String shippingMethod,
    @NotBlank @Size(max = 20) String paymentMethod,
    @NotEmpty @Size(max = 100) List<@NotNull @Valid Item> items,
    @Size(max = 50) String couponCode) {

  public OrderRequest(
      String customerName,
      String customerEmail,
      String shippingAddress,
      String phone,
      String note,
      BigDecimal shippingFee,
      String paymentMethod,
      List<@Valid Item> items) {
    this(customerName, customerEmail, shippingAddress, phone, note, shippingFee, "STANDARD", paymentMethod, items, null);
  }

  public OrderRequest(
      String customerName, String customerEmail, String shippingAddress, String phone, String note,
      BigDecimal shippingFee, String paymentMethod, List<@Valid Item> items, String couponCode) {
    this(customerName, customerEmail, shippingAddress, phone, note, shippingFee, "STANDARD", paymentMethod, items, couponCode);
  }

  public record Item(
      @NotNull @Positive Long bookId,
      @NotNull @Positive @Max(1000) Integer quantity) {}
}
