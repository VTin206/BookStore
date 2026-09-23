package com.bookstore.book.repository;
import com.bookstore.book.entity.Book; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface BookRepository extends JpaRepository<Book,Long> { List<Book> findByTitleContainingIgnoreCase(String title); }
