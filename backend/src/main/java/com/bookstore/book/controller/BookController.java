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
  private final BookService service;

  public BookController(BookService service) {
    this.service = service;
  }

  @GetMapping
  public List<Book> all(
      @RequestParam(required = false) String search,
      @RequestParam(required = false) String filter) {
    return service.byFilter(search, filter);
  }

  @GetMapping("/{id}")
  public Book byId(@PathVariable Long id) {
    return service.byId(id);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping
  public Book create(@Valid @RequestBody BookRequest r) {
    return service.create(r);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PutMapping("/{id}")
  public Book update(@PathVariable Long id, @Valid @RequestBody BookRequest r) {
    return service.update(id, r);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PatchMapping("/{id}/stock")
  public Book stock(@PathVariable Long id, @RequestParam Integer value) {
    return service.adjustStock(id, value);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    service.delete(id);
  }
}
