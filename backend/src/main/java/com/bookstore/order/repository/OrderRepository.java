package com.bookstore.order.repository;
import com.bookstore.order.entity.Order; import org.springframework.data.jpa.repository.JpaRepository;
public interface OrderRepository extends JpaRepository<Order,Long> { }
