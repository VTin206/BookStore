package com.bookstore.book.service;

import com.bookstore.book.dto.BookRequest;
import com.bookstore.book.entity.Book;
import com.bookstore.book.repository.BookRepository;
import com.bookstore.catalog.repository.AuthorRepository;
import com.bookstore.catalog.repository.PublisherRepository;
import com.bookstore.category.repository.CategoryRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class BookService {
  private final BookRepository bookRepository;
  private final CategoryRepository categoryRepository;
  private final AuthorRepository authorRepository;
  private final PublisherRepository publisherRepository;

  public BookService(
      BookRepository bookRepository,
      CategoryRepository categoryRepository,
      AuthorRepository authorRepository,
      PublisherRepository publisherRepository) {
    this.bookRepository = bookRepository;
    this.categoryRepository = categoryRepository;
    this.authorRepository = authorRepository;
    this.publisherRepository = publisherRepository;
  }

  public List<Book> all() {
    return bookRepository.findAll();
  }

  public List<Book> search(String search) {
    return search == null || search.isBlank() ? bookRepository.findAll() : bookRepository.search(search.trim());
  }

  public List<Book> byFilter(String search, String filter) {
    var normalizedFilter = filter == null ? "" : filter.trim().toUpperCase();
    if ("BEST-SELLER".equals(normalizedFilter)) {
      return bookRepository.findBestSellers();
    }
    if ("NEW".equals(normalizedFilter)) {
      return bookRepository.findAllByOrderByPublicationDateDescCreatedAtDesc();
    }
    return search(search);
  }

  public Book byId(Long id) {
    return bookRepository.findById(id).orElseThrow();
  }

  public Book create(BookRequest request) {
    return save(new Book(), request);
  }

  public Book update(Long id, BookRequest request) {
    return save(bookRepository.findById(id).orElseThrow(), request);
  }

  public void delete(Long id) {
    bookRepository.deleteById(id);
  }

  public Book adjustStock(Long id, Integer stock) {
    var book = bookRepository.findById(id).orElseThrow();
    if (stock < 0) {
      throw new IllegalArgumentException("Stock cannot be negative");
    }
    book.setStock(stock);
    return bookRepository.save(book);
  }

  private Book save(Book book, BookRequest request) {
    book.setTitle(request.title());
    book.setAuthor(request.author());
    book.setPrice(request.price());
    book.setStock(request.stock());
    book.setCategory(
        request.categoryId() == null
            ? null
            : categoryRepository.findById(request.categoryId()).orElseThrow());
    book.setAuthorRef(
        request.authorId() == null ? null : authorRepository.findById(request.authorId()).orElseThrow());
    book.setPublisher(
        request.publisherId() == null
            ? null
            : publisherRepository.findById(request.publisherId()).orElseThrow());
    book.setIsbn(request.isbn());
    book.setDescription(request.description());
    book.setImageUrl(request.imageUrl());
    book.setPublicationDate(request.publicationDate());
    return bookRepository.save(book);
  }
}
