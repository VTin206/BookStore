package com.bookstore.catalog;

import com.bookstore.catalog.entity.Author;
import com.bookstore.catalog.entity.Publisher;
import com.bookstore.catalog.service.CatalogService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

record CatalogRequest(
    @NotBlank String name, String biography, String address, String website) {}

@RestController
@RequestMapping("/api")
class SimpleCatalogController {
  private final CatalogService service;

  SimpleCatalogController(CatalogService service) {
    this.service = service;
  }

  @GetMapping("/authors")
  List<Author> authors() {
    return service.allAuthors();
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping("/authors")
  Author createAuthor(@Valid @RequestBody CatalogRequest request) {
    return service.createAuthor(request.name(), request.biography());
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PutMapping("/authors/{id}")
  Author updateAuthor(@PathVariable Long id, @Valid @RequestBody CatalogRequest request) {
    return service.updateAuthor(id, request.name(), request.biography());
  }

  @PreAuthorize("hasRole('ADMIN')")
  @DeleteMapping("/authors/{id}")
  void deleteAuthor(@PathVariable Long id) {
    service.deleteAuthor(id);
  }

  @GetMapping("/publishers")
  List<Publisher> publishers() {
    return service.allPublishers();
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping("/publishers")
  Publisher createPublisher(@Valid @RequestBody CatalogRequest request) {
    return service.createPublisher(request.name(), request.address(), request.website());
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PutMapping("/publishers/{id}")
  Publisher updatePublisher(@PathVariable Long id, @Valid @RequestBody CatalogRequest request) {
    return service.updatePublisher(id, request.name(), request.address(), request.website());
  }

  @PreAuthorize("hasRole('ADMIN')")
  @DeleteMapping("/publishers/{id}")
  void deletePublisher(@PathVariable Long id) {
    service.deletePublisher(id);
  }
}