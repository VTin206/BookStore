package com.bookstore.review;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

interface ReviewRepository extends JpaRepository<Review, Long> {
  List<Review> findByBookIdOrderByCreatedAtDesc(Long bookId);

  Page<Review> findByBookId(Long bookId, Pageable pageable);

  boolean existsByUserIdAndBookId(Long userId, Long bookId);
}
