package com.bookstore.order.repository;

import com.bookstore.order.entity.Payment;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
  Optional<Payment> findByOrderId(Long orderId);
}
