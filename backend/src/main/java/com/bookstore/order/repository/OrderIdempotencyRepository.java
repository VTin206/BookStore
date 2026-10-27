package com.bookstore.order.repository;

import com.bookstore.order.entity.OrderIdempotency;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderIdempotencyRepository extends JpaRepository<OrderIdempotency, Long> {
  Optional<OrderIdempotency> findByScopeKeyAndIdempotencyKey(String scopeKey, String idempotencyKey);

  @Query(
      value =
          "SELECT pg_advisory_xact_lock(hashtext(CONCAT(:scopeKey, ':', :idempotencyKey)))",
      nativeQuery = true)
  void acquireRequestLock(
      @Param("scopeKey") String scopeKey, @Param("idempotencyKey") String idempotencyKey);
}
