package com.bookstore.category.service;

import com.bookstore.book.repository.BookRepository;
import com.bookstore.category.dto.CategoryRequest;
import com.bookstore.category.entity.Category;
import com.bookstore.category.repository.CategoryRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class CategoryService {
  private final CategoryRepository categoryRepository;
  private final BookRepository bookRepository;

  public CategoryService(CategoryRepository categoryRepository, BookRepository bookRepository) {
    this.categoryRepository = categoryRepository;
    this.bookRepository = bookRepository;
  }

  public List<Category> all() {
    return categoryRepository.findAll();
  }

  public Category create(CategoryRequest request) {
    return save(new Category(), request);
  }

  public Category update(Long id, CategoryRequest request) {
    return save(categoryRepository.findById(id).orElseThrow(), request);
  }

  public void delete(Long id) {
    if (bookRepository.existsByCategoryId(id)) {
      throw new IllegalStateException("Cannot delete a category linked to books");
    }
    categoryRepository.deleteById(id);
  }

  private Category save(Category category, CategoryRequest request) {
    category.setName(request.name().trim());
    category.setDescription(request.description());
    return categoryRepository.save(category);
  }
}