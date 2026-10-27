package com.bookstore.cart.dto;

import com.bookstore.book.entity.Book;
import com.bookstore.cart.entity.Cart;
import java.math.BigDecimal;
import java.util.List;

public record CartResponse(Long id, List<CartItemResponse> items) {
  public static CartResponse from(Cart cart) {
    return new CartResponse(
        cart.getId(),
        cart.getItems().stream().map(CartItemResponse::from).toList());
  }

  public record CartItemResponse(Long id, BookResponse book, Integer quantity) {
    private static CartItemResponse from(com.bookstore.cart.entity.CartItem item) {
      return new CartItemResponse(item.getId(), BookResponse.from(item.getBook()), item.getQuantity());
    }
  }

  public record BookResponse(
      Long id,
      String title,
      String author,
      BigDecimal price,
      Integer stock,
      boolean active,
      String isbn,
      String description,
      String imageUrl,
      CategoryResponse category,
      List<CategoryResponse> categories) {
    private static BookResponse from(Book book) {
      return new BookResponse(
          book.getId(),
          book.getTitle(),
          book.getAuthor(),
          book.getPrice(),
          book.getStock(),
          book.isActive(),
          book.getIsbn(),
          book.getDescription(),
          book.getPublicImageUrl(),
          CategoryResponse.from(book.getCategory()),
          book.getCategories().stream().map(CategoryResponse::from).toList());
    }
  }

  public record CategoryResponse(Long id, String name, String description) {
    private static CategoryResponse from(com.bookstore.category.entity.Category category) {
      return category == null ? null : new CategoryResponse(category.getId(), category.getName(), category.getDescription());
    }
  }
}
