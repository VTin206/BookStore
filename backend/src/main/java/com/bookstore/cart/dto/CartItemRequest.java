package com.bookstore.cart.dto;
import jakarta.validation.constraints.*;
public record CartItemRequest(@NotNull Long bookId,@NotNull @Positive Integer quantity) { }
