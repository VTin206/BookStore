package com.bookstore.inventory.repository;
import com.bookstore.inventory.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
public interface SupplierRepository extends JpaRepository<Supplier, Long> {}
