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
  private final BookRepository books;
  private final CategoryRepository categories;
  private final AuthorRepository authors;
  private final PublisherRepository publishers;

  public BookService(
      BookRepository books,
      CategoryRepository categories,
      AuthorRepository authors,
      PublisherRepository publishers) {
    this.books = books;
    this.categories = categories;
    this.authors = authors;
    this.publishers = publishers;
  }

  public List<Book> all() {
    return books.findAll();
  }

  public Book byId(Long id) {
    return books.findById(id).orElseThrow();
  }

  public Book create(BookRequest request) {
    return save(new Book(), request);
  }

  public Book update(Long id, BookRequest request) {
    return save(books.findById(id).orElseThrow(), request);
  }

  public void delete(Long id) {
    books.deleteById(id);
  }

  public Book adjustStock(Long id, Integer stock) {
    var book = books.findById(id).orElseThrow();
    if (stock < 0) {
      throw new IllegalArgumentException("Stock cannot be negative");
    }
    book.setStock(stock);
    return books.save(book);
  }

  private Book save(Book book, BookRequest request) {
    book.setTitle(request.title());
    book.setAuthor(request.author());
    book.setPrice(request.price());
    book.setStock(request.stock());
    book.setCategory(
        request.categoryId() == null
            ? null
            : categories.findById(request.categoryId()).orElseThrow());
    book.setAuthorRef(
        request.authorId() == null ? null : authors.findById(request.authorId()).orElseThrow());
    book.setPublisher(
        request.publisherId() == null
            ? null
            : publishers.findById(request.publisherId()).orElseThrow());
    book.setIsbn(request.isbn());
    book.setDescription(request.description());
    book.setImageUrl(request.imageUrl());
    book.setPublicationDate(request.publicationDate());
    return books.save(book);
  }
}