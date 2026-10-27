package com.bookstore.order.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "order_idempotency",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uk_order_idempotency_scope_key",
            columnNames = {"scope_key", "idempotency_key"}))
public class OrderIdempotency {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "scope_key", nullable = false, length = 100)
  private String scopeKey;

  @Column(name = "idempotency_key", nullable = false, length = 100)
  private String idempotencyKey;

  @Column(name = "request_hash", nullable = false, length = 64)
  private String requestHash;

  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "order_id", nullable = false, unique = true)
  private Order order;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt = LocalDateTime.now();

  public void setScopeKey(String scopeKey) {
    this.scopeKey = scopeKey;
  }

  public void setIdempotencyKey(String idempotencyKey) {
    this.idempotencyKey = idempotencyKey;
  }

  public void setRequestHash(String requestHash) {
    this.requestHash = requestHash;
  }

  public void setOrder(Order order) {
    this.order = order;
  }

  public String getRequestHash() {
    return requestHash;
  }

  public Order getOrder() {
    return order;
  }
}
