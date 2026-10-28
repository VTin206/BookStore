package com.bookstore.book.service;

import com.bookstore.book.dto.BookRequest;
import com.bookstore.book.entity.Book;
import com.bookstore.book.repository.BookRepository;
import com.bookstore.catalog.repository.AuthorRepository;
import com.bookstore.catalog.repository.PublisherRepository;
import com.bookstore.category.entity.Category;
import com.bookstore.category.repository.CategoryRepository;
import com.bookstore.common.exception.ConflictException;
import com.bookstore.common.exception.ResourceNotFoundException;
import com.bookstore.inventory.service.InventoryService;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookService {
  private final BookRepository bookRepository;
  private final CategoryRepository categoryRepository;
  private final AuthorRepository authorRepository;
  private final PublisherRepository publisherRepository;
  private InventoryService inventoryService;

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

  @org.springframework.beans.factory.annotation.Autowired
  void setInventoryService(InventoryService inventoryService) {
    this.inventoryService = inventoryService;
  }

  public List<Book> all() {
    return bookRepository.findAllByActiveTrue();
  }

  public List<Book> allIncludingInactive() {
    return bookRepository.findAll();
  }

  public List<Book> search(String search) {
    return search == null || search.isBlank() ? bookRepository.findAllByActiveTrue() : bookRepository.searchActive(search.trim());
  }

  public List<Book> byFilter(String search, String filter) {
    var normalizedFilter = filter == null ? "" : filter.trim().toUpperCase();
    if ("BEST-SELLER".equals(normalizedFilter)) {
      return bookRepository.findActiveBestSellers();
    }
    if ("NEW".equals(normalizedFilter)) {
      return bookRepository.findAllByActiveTrueOrderByPublicationDateDescCreatedAtDesc();
    }
    return search(search);
  }

  public Book byId(Long id) {
    return bookRepository.findById(id).orElseThrow();
  }

  public Book create(BookRequest request) {
    return save(new Book(), request);
  }

  public BookCover cover(Long id) {
    return cover(id, false);
  }

  public BookCover cover(Long id, boolean allowInactive) {
    var book = byId(id);
    if (!book.isActive() && !allowInactive) {
      throw new ResourceNotFoundException("Sách không tồn tại");
    }
    return BookCover.decode(book.getImageUrl());
  }

  @Transactional
  public Book update(Long id, BookRequest request) {
    return save(bookRepository.findByIdForUpdate(id).orElseThrow(), request);
  }

  @Transactional
  public Book setActive(Long id, boolean active) {
    var book = bookRepository.findByIdForUpdate(id).orElseThrow();
    book.setActive(active);
    return bookRepository.save(book);
  }

  @Transactional
  public void delete(Long id) {
    // Keep the row lock while checking references and deleting. PostgreSQL's
    // foreign-key checks then cannot add a new reference between the checks
    // and the delete.
    if (bookRepository.findByIdForUpdate(id).isEmpty()) {
      throw new ResourceNotFoundException("Sách không còn tồn tại. Vui lòng tải lại danh sách.");
    }
    var reasons = new ArrayList<String>();
    if (bookRepository.hasOrderItems(id)) {
      reasons.add("đã có trong đơn hàng (kể cả đơn đã hủy)");
    }
    if (bookRepository.hasCartItems(id)) {
      reasons.add("đang có trong giỏ hàng của khách hàng");
    }
    if (bookRepository.hasReviews(id)) {
      reasons.add("đã có đánh giá của khách hàng");
    }
    if (!reasons.isEmpty()) {
      throw new ConflictException("Không thể xóa sách vì sách " + String.join("; ", reasons) + ".");
    }
    try {
      bookRepository.deleteById(id);
    } catch (DataIntegrityViolationException exception) {
      // A reference may be added after the checks above.
      throw new ConflictException(
          "Không thể xóa sách vì có dữ liệu liên quan. Vui lòng tải lại danh sách và thử lại.");
    }
  }

  @Transactional
  public Book adjustStock(Long id, Integer stock) {
    var book = bookRepository.findByIdForUpdate(id).orElseThrow();
    if (stock < 0) {
      throw new IllegalArgumentException("Stock cannot be negative");
    }
    var before = book.getStock();
    book.setStock(stock);
    var saved = bookRepository.save(book);
    recordStockChange(saved, before, "BOOK_UPDATE", "Cập nhật tồn kho từ thông tin sách");
    return saved;
  }

  private Book save(Book book, BookRequest request) {
    var existingBook = book.getId() != null;
    var beforeStock = book.getStock();
    book.setTitle(request.title());
    book.setAuthor(request.author());
    book.setPrice(request.price());
    book.setStock(request.stock());
    if (request.costPrice() != null) book.setCostPrice(request.costPrice());
    if (request.minimumStock() != null) book.setMinimumStock(request.minimumStock());
    var selectedCategoryIds = new LinkedHashSet<Long>();
    if (request.categoryId() != null) selectedCategoryIds.add(request.categoryId());
    if (request.categoryIds() != null) {
      request.categoryIds().stream()
          .filter(categoryId -> categoryId != null)
          .forEach(selectedCategoryIds::add);
    }
    var selectedCategories = new LinkedHashSet<Category>();
    Category primaryCategory = null;
    for (var categoryId : selectedCategoryIds) {
      var category = categoryRepository.findById(categoryId).orElseThrow();
      selectedCategories.add(category);
      if (categoryId.equals(request.categoryId())) primaryCategory = category;
    }
    book.setCategory(primaryCategory != null ? primaryCategory : selectedCategories.stream().findFirst().orElse(null));
    book.setCategories(selectedCategories);
    book.setAuthorRef(
        request.authorId() == null ? null : authorRepository.findById(request.authorId()).orElseThrow());
    book.setPublisher(
        request.publisherId() == null
            ? null
            : publisherRepository.findById(request.publisherId()).orElseThrow());
    book.setIsbn(request.isbn());
    book.setDescription(request.description());
    if (!(book.getId() != null && ("/api/books/" + book.getId() + "/cover").equals(request.imageUrl()))) {
      BookCover.validate(request.imageUrl());
      book.setImageUrl(request.imageUrl());
    }
    book.setPublicationDate(request.publicationDate());
    var saved = bookRepository.save(book);
    if (existingBook) {
      recordStockChange(saved, beforeStock, "BOOK_UPDATE", "Cập nhật tồn kho từ thông tin sách");
    }
    return saved;
  }

  private void recordStockChange(Book book, Integer beforeStock, String referenceType, String reason) {
    if (inventoryService == null || beforeStock == null || beforeStock.equals(book.getStock())) {
      return;
    }
    var delta = Math.subtractExact(book.getStock(), beforeStock);
    inventoryService.recordExistingChange(
        book, delta, "ADJUSTMENT", reason, referenceType, book.getId(), null);
  }
}
