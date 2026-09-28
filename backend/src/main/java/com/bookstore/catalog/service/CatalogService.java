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
  private final AuthorRepository authorRepository;
  private final PublisherRepository publisherRepository;
  private final BookRepository bookRepository;

  public CatalogService(
      AuthorRepository authorRepository, PublisherRepository publisherRepository, BookRepository bookRepository) {
    this.authorRepository = authorRepository;
    this.publisherRepository = publisherRepository;
    this.bookRepository = bookRepository;
  }

  public List<Author> allAuthors() {
    return authorRepository.findAll();
  }

  public Author createAuthor(String name, String biography) {
    var author = new Author();
    author.setName(name.trim());
    author.setBiography(biography);
    return authorRepository.save(author);
  }

  public Author updateAuthor(Long id, String name, String biography) {
    var author = authorRepository.findById(id).orElseThrow();
    author.setName(name.trim());
    author.setBiography(biography);
    return authorRepository.save(author);
  }

  public void deleteAuthor(Long id) {
    if (bookRepository.existsByAuthorId(id)) {
      throw new IllegalStateException("Cannot delete an author linked to books");
    }
    authorRepository.deleteById(id);
  }

  public List<Publisher> allPublishers() {
    return publisherRepository.findAll();
  }

  public Publisher createPublisher(String name, String address, String website) {
    var publisher = new Publisher();
    publisher.setName(name.trim());
    publisher.setAddress(address);
    publisher.setWebsite(website);
    return publisherRepository.save(publisher);
  }

  public Publisher updatePublisher(Long id, String name, String address, String website) {
    var publisher = publisherRepository.findById(id).orElseThrow();
    publisher.setName(name.trim());
    publisher.setAddress(address);
    publisher.setWebsite(website);
    return publisherRepository.save(publisher);
  }

  public void deletePublisher(Long id) {
    if (bookRepository.existsByPublisherId(id)) {
      throw new IllegalStateException("Cannot delete a publisher linked to books");
    }
    publisherRepository.deleteById(id);
  }
}