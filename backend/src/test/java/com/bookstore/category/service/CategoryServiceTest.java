package com.bookstore.category.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bookstore.book.repository.BookRepository;
import com.bookstore.category.dto.CategoryRequest;
import com.bookstore.category.entity.Category;
import com.bookstore.category.repository.CategoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {
  @Mock private CategoryRepository categories;
  @Mock private BookRepository books;
  @InjectMocks private CategoryService service;

  @Test
  void createStoresNameAndDescription() {
    when(categories.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));

    var category = service.create(new CategoryRequest("  Fiction  ", "Books and novels"));

    assertEquals("Fiction", category.getName());
    assertEquals("Books and novels", category.getDescription());
  }

  @Test
  void deleteRejectsCategoryUsedByBooks() {
    when(books.existsByCategoryId(7L)).thenReturn(true);

    assertThrows(IllegalStateException.class, () -> service.delete(7L));
  }

  @Test
  void deleteRemovesUnusedCategory() {
    when(books.existsByCategoryId(7L)).thenReturn(false);

    service.delete(7L);

    verify(categories).deleteById(7L);
  }
}