package com.bookstore.book.dto;
import jakarta.validation.constraints.*; import java.math.BigDecimal;
public record BookRequest(@NotBlank String title,@NotBlank String author,@NotNull @PositiveOrZero BigDecimal price,@NotNull @PositiveOrZero Integer stock,Long categoryId) { }
