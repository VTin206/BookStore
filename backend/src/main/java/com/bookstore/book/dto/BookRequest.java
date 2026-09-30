package com.bookstore.book.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record BookRequest(
    @NotBlank String title,
    @NotBlank String author,
    @NotNull @PositiveOrZero BigDecimal price,
    @NotNull @PositiveOrZero Integer stock,
    Long categoryId,
    Long authorId,
    Long publisherId,
    String isbn,
    String description,
    String imageUrl,
    LocalDate publicationDate,
    List<Long> categoryIds) {
  public BookRequest(
      String title, String author, BigDecimal price, Integer stock, Long categoryId, Long authorId,
      Long publisherId, String isbn, String description, String imageUrl, LocalDate publicationDate) {
    this(title, author, price, stock, categoryId, authorId, publisherId, isbn, description, imageUrl, publicationDate, null);
  }
}