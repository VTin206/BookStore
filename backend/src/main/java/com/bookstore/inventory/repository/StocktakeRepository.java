package com.bookstore.inventory.repository;
import com.bookstore.inventory.entity.Stocktake;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
public interface StocktakeRepository extends JpaRepository<Stocktake, Long> {
  boolean existsByStocktakeNumber(String stocktakeNumber);
  @EntityGraph(attributePaths = {"items", "items.book"})
  List<Stocktake> findTop100ByOrderByCreatedAtDesc();
  @EntityGraph(attributePaths = {"items", "items.book"})
  Optional<Stocktake> findWithItemsById(Long id);
}
