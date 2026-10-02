package com.bookstore.book.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.doThrow;

import com.bookstore.common.exception.ConflictException;
import com.bookstore.common.exception.ResourceNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

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
import java.util.List;
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

  @ParameterizedTest
  @CsvSource({
    "true,false,false,đã có trong đơn hàng (kể cả đơn đã hủy)",
    "false,true,false,đang có trong giỏ hàng của khách hàng",
    "false,false,true,đã có đánh giá của khách hàng",
    "true,true,true,đã có trong đơn hàng (kể cả đơn đã hủy); đang có trong giỏ hàng của khách hàng; đã có đánh giá của khách hàng"
  })
  void deleteReportsRelatedData(boolean orders, boolean carts, boolean reviews, String reason) {
    when(books.existsById(1L)).thenReturn(true);
    when(books.hasOrderItems(1L)).thenReturn(orders);
    when(books.hasCartItems(1L)).thenReturn(carts);
    when(books.hasReviews(1L)).thenReturn(reviews);
    var exception = assertThrows(ConflictException.class, () -> service.delete(1L));
    assertEquals("Không thể xóa sách vì sách " + reason + ".", exception.getMessage());
    assertEquals(org.springframework.http.HttpStatus.CONFLICT, exception.getStatus());
    verify(books, never()).deleteById(any());
  }

  @Test
  void deleteAllowsBookWithoutRelatedData() {
    when(books.existsById(1L)).thenReturn(true);
    service.delete(1L);
    verify(books).deleteById(1L);
  }

  @Test
  void deleteReportsMissingBook() {
    assertThrows(ResourceNotFoundException.class, () -> service.delete(1L));
    verify(books, never()).deleteById(any());
  }

  @Test
  void deleteHandlesReferenceAddedAfterChecks() {
    when(books.existsById(1L)).thenReturn(true);
    doThrow(new DataIntegrityViolationException("constraint")).when(books).deleteById(1L);
    var exception = assertThrows(ConflictException.class, () -> service.delete(1L));
    assertEquals(
        "Không thể xóa sách vì có dữ liệu liên quan. Vui lòng tải lại danh sách và thử lại.",
        exception.getMessage());
  }

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
  void createDeduplicatesPrimaryAndAdditionalCategories() {
    var category = new Category();
    category.setName("Fiction");
    when(categories.findById(1L)).thenReturn(Optional.of(category));
    when(books.save(any(Book.class))).thenAnswer(invocation -> invocation.getArgument(0));

    var result = service.create(new BookRequest(
        "Book", "Author", BigDecimal.TEN, 1, 1L, null, null, null, null, null, null,
        List.of(1L, 1L)));

    assertEquals(category, result.getCategory());
    assertEquals(1, result.getCategories().size());
    verify(categories).findById(1L);
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
