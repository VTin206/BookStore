package com.bookstore.catalog.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bookstore.book.repository.BookRepository;
import com.bookstore.catalog.entity.Author;
import com.bookstore.catalog.entity.Publisher;
import com.bookstore.catalog.repository.AuthorRepository;
import com.bookstore.catalog.repository.PublisherRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CatalogServiceTest {
  @Mock private AuthorRepository authors;
  @Mock private PublisherRepository publishers;
  @Mock private BookRepository books;
  @InjectMocks private CatalogService service;

  @Test
  void authorCrudTrimsNameAndStoresBiography() {
    when(authors.save(any(Author.class))).thenAnswer(invocation -> invocation.getArgument(0));
    var created = service.createAuthor("  Author  ", "Biography");
    assertEquals("Author", created.getName());
    assertEquals("Biography", created.getBiography());

    when(authors.findById(1L)).thenReturn(Optional.of(created));
    var updated = service.updateAuthor(1L, " Updated ", "New bio");
    assertEquals("Updated", updated.getName());
    assertEquals("New bio", updated.getBiography());
  }

  @Test
  void authorDeleteRejectsBooksReference() {
    when(books.existsByAuthorId(1L)).thenReturn(true);
    assertThrows(IllegalStateException.class, () -> service.deleteAuthor(1L));
  }

  @Test
  void authorDeleteRemovesUnusedAuthor() {
    when(books.existsByAuthorId(1L)).thenReturn(false);
    service.deleteAuthor(1L);
    verify(authors).deleteById(1L);
  }

  @Test
  void publisherCrudStoresAllFields() {
    when(publishers.save(any(Publisher.class))).thenAnswer(invocation -> invocation.getArgument(0));
    var publisher = service.createPublisher(" Publisher ", "Address", "https://example.com");
    assertEquals("Publisher", publisher.getName());
    assertEquals("Address", publisher.getAddress());
    assertEquals("https://example.com", publisher.getWebsite());

    when(publishers.findById(2L)).thenReturn(Optional.of(publisher));
    var updated = service.updatePublisher(2L, "Updated", "New address", "https://new.example.com");
    assertEquals("Updated", updated.getName());
    assertEquals("New address", updated.getAddress());
  }

  @Test
  void publisherDeleteRejectsBooksReference() {
    when(books.existsByPublisherId(2L)).thenReturn(true);
    assertThrows(IllegalStateException.class, () -> service.deletePublisher(2L));
  }
}