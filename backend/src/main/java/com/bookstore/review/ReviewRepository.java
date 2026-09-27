package com.bookstore.review;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

interface ReviewRepository extends JpaRepository<Review, Long> {
  List<Review> findByBookIdOrderByCreatedAtDesc(Long bookId);

  boolean existsByUserIdAndBookId(Long userId, Long bookId);
}
