package com.bookstore.category.service;

import com.bookstore.book.repository.BookRepository;
import com.bookstore.category.dto.CategoryRequest;
import com.bookstore.category.entity.Category;
import com.bookstore.category.repository.CategoryRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class CategoryService {
  private final CategoryRepository categories;
  private final BookRepository books;

  public CategoryService(CategoryRepository categories, BookRepository books) {
    this.categories = categories;
    this.books = books;
  }

  public List<Category> all() {
    return categories.findAll();
  }

  public Category create(CategoryRequest request) {
    return save(new Category(), request);
  }

  public Category update(Long id, CategoryRequest request) {
    return save(categories.findById(id).orElseThrow(), request);
  }

  public void delete(Long id) {
    if (books.existsByCategoryId(id)) {
      throw new IllegalStateException("Cannot delete a category linked to books");
    }
    categories.deleteById(id);
  }

  private Category save(Category category, CategoryRequest request) {
    category.setName(request.name().trim());
    category.setDescription(request.description());
    return categories.save(category);
  }
}