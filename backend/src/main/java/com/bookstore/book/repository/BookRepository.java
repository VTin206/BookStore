package com.bookstore.book.repository;

import com.bookstore.book.entity.Book;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookRepository extends JpaRepository<Book, Long> {
  List<Book> findByTitleContainingIgnoreCase(String title);

  @Query("select count(b) > 0 from Book b where b.category.id = :categoryId")
  boolean existsByCategoryId(@Param("categoryId") Long categoryId);

  @Query("select count(b) > 0 from Book b where b.authorRef.id = :authorId")
  boolean existsByAuthorId(@Param("authorId") Long authorId);

  @Query("select count(b) > 0 from Book b where b.publisher.id = :publisherId")
  boolean existsByPublisherId(@Param("publisherId") Long publisherId);
}