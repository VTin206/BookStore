package com.bookstore.cart.repository;
import com.bookstore.cart.entity.Cart; import org.springframework.data.jpa.repository.JpaRepository; import java.util.Optional;
public interface CartRepository extends JpaRepository<Cart,Long> { Optional<Cart> findByUserUsername(String username); }
