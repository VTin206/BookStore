package com.bookstore.catalog.service;

import com.bookstore.book.repository.BookRepository;
import com.bookstore.catalog.entity.Author;
import com.bookstore.catalog.entity.Publisher;
import com.bookstore.catalog.repository.AuthorRepository;
import com.bookstore.catalog.repository.PublisherRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class CatalogService {
  private final AuthorRepository authors;
  private final PublisherRepository publishers;
  private final BookRepository books;

  public CatalogService(
      AuthorRepository authors, PublisherRepository publishers, BookRepository books) {
    this.authors = authors;
    this.publishers = publishers;
    this.books = books;
  }

  public List<Author> allAuthors() {
    return authors.findAll();
  }

  public Author createAuthor(String name, String biography) {
    var author = new Author();
    author.setName(name.trim());
    author.setBiography(biography);
    return authors.save(author);
  }

  public Author updateAuthor(Long id, String name, String biography) {
    var author = authors.findById(id).orElseThrow();
    author.setName(name.trim());
    author.setBiography(biography);
    return authors.save(author);
  }

  public void deleteAuthor(Long id) {
    if (books.existsByAuthorId(id)) {
      throw new IllegalStateException("Cannot delete an author linked to books");
    }
    authors.deleteById(id);
  }

  public List<Publisher> allPublishers() {
    return publishers.findAll();
  }

  public Publisher createPublisher(String name, String address, String website) {
    var publisher = new Publisher();
    publisher.setName(name.trim());
    publisher.setAddress(address);
    publisher.setWebsite(website);
    return publishers.save(publisher);
  }

  public Publisher updatePublisher(Long id, String name, String address, String website) {
    var publisher = publishers.findById(id).orElseThrow();
    publisher.setName(name.trim());
    publisher.setAddress(address);
    publisher.setWebsite(website);
    return publishers.save(publisher);
  }

  public void deletePublisher(Long id) {
    if (books.existsByPublisherId(id)) {
      throw new IllegalStateException("Cannot delete a publisher linked to books");
    }
    publishers.deleteById(id);
  }
}