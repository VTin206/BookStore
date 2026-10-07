package com.bookstore.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;
import com.bookstore.order.dto.OrderRequest.Item;

public record OrderQuoteRequest(
    @NotEmpty @Size(max = 100) List<@NotNull @Valid Item> items,
    @NotBlank @Size(max = 30) String shippingMethod,
    @Size(max = 50) String couponCode) {
  public OrderQuoteRequest(List<@NotNull @Valid Item> items, String couponCode) {
    this(items, "STANDARD", couponCode);
  }
}
