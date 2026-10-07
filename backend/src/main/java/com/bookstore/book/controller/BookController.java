package com.bookstore.book.controller;

import com.bookstore.book.dto.BookRequest;
import com.bookstore.book.entity.Book;
import com.bookstore.book.service.BookService;
import com.bookstore.inventory.service.InventoryService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/books")
public class BookController {
  private final BookService bookService;
  private final InventoryService inventoryService;

  public BookController(BookService bookService, InventoryService inventoryService) {
    this.bookService = bookService;
    this.inventoryService = inventoryService;
  }

  @GetMapping
  @PreAuthorize("!#includeInactive or hasRole('ADMIN')")
  public List<Book> all(
      @RequestParam(required = false) String search,
      @RequestParam(required = false) String filter,
      @RequestParam(defaultValue = "false") boolean includeInactive) {
    return includeInactive ? bookService.allIncludingInactive() : bookService.byFilter(search, filter);
  }

  @GetMapping("/{id}")
  @org.springframework.security.access.prepost.PostAuthorize("returnObject.active or hasRole('ADMIN')")
  public Book byId(@PathVariable Long id) {
    return bookService.byId(id);
  }

  @GetMapping("/{id}/cover")
  public org.springframework.http.ResponseEntity<byte[]> cover(@PathVariable Long id) {
    var cover = bookService.cover(id);
    return org.springframework.http.ResponseEntity.ok()
        .contentType(org.springframework.http.MediaType.parseMediaType(cover.contentType()))
        .header("X-Content-Type-Options", "nosniff")
        .cacheControl(org.springframework.http.CacheControl.noCache())
        .body(cover.bytes());
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
  public Book stock(Authentication authentication, @PathVariable Long id, @RequestParam Integer stockDelta) {
    return inventoryService.adjustAbsolute(id, stockDelta, authentication.getName());
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
