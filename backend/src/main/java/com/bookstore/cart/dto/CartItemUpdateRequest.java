package com.bookstore.cart.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CartItemUpdateRequest(@NotNull @Positive Integer quantity) {}
