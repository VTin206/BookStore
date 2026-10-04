package com.bookstore.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;
import com.bookstore.order.dto.OrderRequest.Item;

public record OrderQuoteRequest(
    @NotEmpty @Size(max = 100) List<@NotNull @Valid Item> items,
    @Size(max = 50) String couponCode) {}
