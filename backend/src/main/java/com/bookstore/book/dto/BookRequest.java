package com.bookstore.book.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record BookRequest(
    @NotBlank @Size(max = 255) String title,
    @NotBlank @Size(max = 200) String author,
    @NotNull @PositiveOrZero @Digits(integer = 10, fraction = 2) BigDecimal price,
    @NotNull @PositiveOrZero Integer stock,
    Long categoryId,
    Long authorId,
    Long publisherId,
    @Size(max = 255) String isbn,
    @Size(max = 20000) String description,
    @Size(max = 2800000) String imageUrl,
    LocalDate publicationDate,
    @Size(max = 50) List<@NotNull @Positive Long> categoryIds) {
  public BookRequest(
      String title, String author, BigDecimal price, Integer stock, Long categoryId, Long authorId,
      Long publisherId, String isbn, String description, String imageUrl, LocalDate publicationDate) {
    this(title, author, price, stock, categoryId, authorId, publisherId, isbn, description, imageUrl, publicationDate, null);
  }
}
