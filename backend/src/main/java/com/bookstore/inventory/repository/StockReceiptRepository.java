package com.bookstore.inventory.repository;
import com.bookstore.inventory.entity.StockReceipt;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
public interface StockReceiptRepository extends JpaRepository<StockReceipt, Long> {
  boolean existsByReceiptNumber(String receiptNumber);
  @EntityGraph(attributePaths = {"items", "items.book", "supplier", "publisher"})
  List<StockReceipt> findTop100ByOrderByReceivedAtDesc();
  @EntityGraph(attributePaths = {"items", "items.book", "supplier", "publisher"})
  Optional<StockReceipt> findWithItemsById(Long id);
}
