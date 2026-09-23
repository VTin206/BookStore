package com.bookstore.order.dto;
import jakarta.validation.Valid; import jakarta.validation.constraints.*; import java.util.List;
public record OrderRequest(@NotBlank String customerName,@Email @NotBlank String customerEmail,@NotEmpty List<@Valid Item> items) { public record Item(@NotNull Long bookId,@NotNull @Positive Integer quantity) {} }
