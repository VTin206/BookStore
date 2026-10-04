package com.bookstore.book.service;

import com.bookstore.book.entity.Book;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class BookCoverTest {
  @Test void returnsCoverLinkInsteadOfEmbeddedImage() throws Exception {
    var book = new Book();
    var id = Book.class.getDeclaredField("id");
    id.setAccessible(true);
    id.set(book, 12L);
    book.setImageUrl("data:image/png;base64,AQID");
    var json = new ObjectMapper().findAndRegisterModules().valueToTree(book);
    assertEquals("/api/books/12/cover", json.get("imageUrl").asText());
    assertFalse(json.has("publicImageUrl"));
    assertFalse(json.toString().contains("base64"));
  }

  @Test void rejectsActiveContentAndOversizedImages() {
    assertThrows(IllegalArgumentException.class, () -> BookCover.validate("javascript:alert(1)"));
    assertThrows(IllegalArgumentException.class, () -> BookCover.validate("data:image/svg+xml;base64,AQID"));
    assertThrows(IllegalArgumentException.class, () -> BookCover.validate("data:image/png;base64," + "A".repeat(2800000)));
    assertDoesNotThrow(() -> BookCover.validate("https://example.com/book.png"));
  }
}
