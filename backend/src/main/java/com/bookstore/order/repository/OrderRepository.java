package com.bookstore.order.repository;

import com.bookstore.order.entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
  @EntityGraph(attributePaths = {"items", "items.book"})
  java.util.List<Order> findByUserUsername(String username);

  java.util.Optional<Order> findByTrackingCode(String trackingCode);

  boolean existsByUserUsernameAndStatusAndItemsBookId(String username, String status, Long bookId);
}
