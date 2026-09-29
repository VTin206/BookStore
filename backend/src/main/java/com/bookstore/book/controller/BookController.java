package com.bookstore.book.controller;

import com.bookstore.book.dto.BookRequest;
import com.bookstore.book.entity.Book;
import com.bookstore.book.service.BookService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/books")
public class BookController {
  private final BookService bookService;

  public BookController(BookService bookService) {
    this.bookService = bookService;
  }

  @GetMapping
  public List<Book> all(
      @RequestParam(required = false) String search,
      @RequestParam(required = false) String filter,
      @RequestParam(defaultValue = "false") boolean includeInactive) {
    return includeInactive ? bookService.allIncludingInactive() : bookService.byFilter(search, filter);
  }

  @GetMapping("/{id}")
  public Book byId(@PathVariable Long id) {
    return bookService.byId(id);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping
  public Book create(@Valid @RequestBody BookRequest request) {
    return bookService.create(request);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PutMapping("/{id}")
  public Book update(@PathVariable Long id, @Valid @RequestBody BookRequest request) {
    return bookService.update(id, request);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PatchMapping("/{id}/stock")
  public Book stock(@PathVariable Long id, @RequestParam Integer stockDelta) {
    return bookService.adjustStock(id, stockDelta);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PatchMapping("/{id}/status")
  public Book status(@PathVariable Long id, @RequestParam boolean active) {
    return bookService.setActive(id, active);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    bookService.delete(id);
  }
}
