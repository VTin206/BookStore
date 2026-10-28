package com.bookstore.book.entity;

import static org.junit.jupiter.api.Assertions.assertFalse;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class BookSerializationTest {
  private final ObjectMapper objectMapper = new ObjectMapper();

  @Test
  void doesNotExposeInternalInventoryPricingFields() throws Exception {
    var book = new Book();
    book.setTitle("Book");
    book.setAuthor("Author");
    book.setPrice(new BigDecimal("100000"));
    book.setStock(3);
    book.setCostPrice(new BigDecimal("50000"));
    book.setMinimumStock(10);

    var json = objectMapper.writeValueAsString(book);

    assertFalse(json.contains("costPrice"));
    assertFalse(json.contains("minimumStock"));
  }
}
