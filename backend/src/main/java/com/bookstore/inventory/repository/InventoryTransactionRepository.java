package com.bookstore.inventory.repository;
import com.bookstore.inventory.entity.InventoryTransaction;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
  List<InventoryTransaction> findTop500ByOrderByCreatedAtDesc();
}
