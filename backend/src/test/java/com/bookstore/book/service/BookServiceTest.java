package com.bookstore.book.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.bookstore.book.dto.BookRequest;
import com.bookstore.book.entity.Book;
import com.bookstore.book.repository.BookRepository;
import com.bookstore.catalog.entity.Author;
import com.bookstore.catalog.entity.Publisher;
import com.bookstore.catalog.repository.AuthorRepository;
import com.bookstore.catalog.repository.PublisherRepository;
import com.bookstore.category.entity.Category;
import com.bookstore.category.repository.CategoryRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BookServiceTest {
  @Mock private BookRepository books;
  @Mock private CategoryRepository categories;
  @Mock private AuthorRepository authors;
  @Mock private PublisherRepository publishers;
  @InjectMocks private BookService service;

  @Test
  void createMapsAllBookFieldsAndRelations() {
    var category = new Category();
    category.setName("Fiction");
    var author = new Author();
    author.setName("Author");
    var publisher = new Publisher();
    publisher.setName("Publisher");
    when(categories.findById(1L)).thenReturn(Optional.of(category));
    when(authors.findById(2L)).thenReturn(Optional.of(author));
    when(publishers.findById(3L)).thenReturn(Optional.of(publisher));
    when(books.save(any(Book.class))).thenAnswer(invocation -> invocation.getArgument(0));

    var request =
        new BookRequest(
            "Book",
            "Author",
            new BigDecimal("120000"),
            8,
            1L,
            2L,
            3L,
            "978-1",
            "Description",
            "https://image",
            LocalDate.of(2024, 1, 2));

    var result = service.create(request);

    assertEquals("Book", result.getTitle());
    assertEquals("Author", result.getAuthor());
    assertEquals(new BigDecimal("120000"), result.getPrice());
    assertEquals(8, result.getStock());
    assertEquals(category, result.getCategory());
    assertEquals(author, result.getAuthorRef());
    assertEquals(publisher, result.getPublisher());
    assertEquals("978-1", result.getIsbn());
    assertEquals("Description", result.getDescription());
    assertEquals("https://image", result.getImageUrl());
    assertEquals(LocalDate.of(2024, 1, 2), result.getPublicationDate());
  }

  @Test
  void createAllowsOptionalRelationsAndMetadata() {
    when(books.save(any(Book.class))).thenAnswer(invocation -> invocation.getArgument(0));

    var result =
        service.create(
            new BookRequest(
                "Book", "Author", BigDecimal.TEN, 0, null, null, null, null, null, null, null));

    assertEquals("Book", result.getTitle());
    org.junit.jupiter.api.Assertions.assertNull(result.getCategory());
    org.junit.jupiter.api.Assertions.assertNull(result.getAuthorRef());
    org.junit.jupiter.api.Assertions.assertNull(result.getPublisher());
  }

  @Test
  void adjustStockRejectsNegativeValue() {
    var book = new Book();
    when(books.findById(1L)).thenReturn(Optional.of(book));

    assertThrows(IllegalArgumentException.class, () -> service.adjustStock(1L, -1));
  }

  @Test
  void adjustStockPersistsValidValue() {
    var book = new Book();
    book.setStock(2);
    when(books.findById(1L)).thenReturn(Optional.of(book));
    when(books.save(book)).thenReturn(book);

    var result = service.adjustStock(1L, 10);

    assertEquals(10, result.getStock());
  }
}