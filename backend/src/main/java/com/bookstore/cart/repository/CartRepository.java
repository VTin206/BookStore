package com.bookstore.cart.repository;

import com.bookstore.cart.entity.Cart;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartRepository extends JpaRepository<Cart, Long> {
  @EntityGraph(attributePaths = {"items", "items.book"})
  Optional<Cart> findByUserUsername(String username);
}
