package com.bookstore.wishlist.repository;

import com.bookstore.wishlist.entity.WishlistItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {
  List<WishlistItem> findByUserUsernameOrderByCreatedAtDesc(String username);
  Optional<WishlistItem> findByUserUsernameAndBookId(String username, Long bookId);
}
