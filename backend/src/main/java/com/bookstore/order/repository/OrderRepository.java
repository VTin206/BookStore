package com.bookstore.order.repository;

import com.bookstore.order.entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query("select o from Order o where o.id = :id")
  java.util.Optional<Order> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") Long id);

  org.springframework.data.domain.Page<Order> findByUserUsername(String username, org.springframework.data.domain.Pageable pageable);

  @org.springframework.data.jpa.repository.Query("select o.id from Order o where o.status = 'PENDING' and o.createdAt < :cutoff order by o.id")
  java.util.List<Long> findExpiredPendingIds(@org.springframework.data.repository.query.Param("cutoff") java.time.LocalDateTime cutoff,
      org.springframework.data.domain.Pageable pageable);
  @EntityGraph(attributePaths = {"items", "items.book"})
  java.util.List<Order> findByUserUsername(String username);

  java.util.Optional<Order> findByTrackingCode(String trackingCode);

  boolean existsByUserUsernameAndStatusAndItemsBookId(String username, String status, Long bookId);
}
