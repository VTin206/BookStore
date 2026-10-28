package com.bookstore.inventory.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bookstore.book.entity.Book;
import com.bookstore.book.repository.BookRepository;
import com.bookstore.catalog.repository.PublisherRepository;
import com.bookstore.inventory.entity.InventoryTransaction;
import com.bookstore.inventory.repository.InventoryTransactionRepository;
import com.bookstore.inventory.repository.StockReceiptRepository;
import com.bookstore.inventory.repository.StocktakeRepository;
import com.bookstore.inventory.repository.SupplierRepository;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {
  @Mock private BookRepository books;
  @Mock private SupplierRepository suppliers;
  @Mock private PublisherRepository publishers;
  @Mock private StockReceiptRepository receipts;
  @Mock private InventoryTransactionRepository transactions;
  @Mock private StocktakeRepository stocktakes;
  @InjectMocks private InventoryService service;

  @Test
  void adjustDeltaChangesStockAndRecordsMovement() {
    var book = new Book();
    book.setStock(5);
    book.setCostPrice(new BigDecimal("10.00"));
    when(books.findByIdForUpdate(1L)).thenReturn(Optional.of(book));
    when(books.save(book)).thenReturn(book);
    when(transactions.save(any(InventoryTransaction.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    service.adjustDelta(1L, 3, "admin");

    assertEquals(8, book.getStock());
    var transaction = org.mockito.ArgumentCaptor.forClass(InventoryTransaction.class);
    verify(transactions).save(transaction.capture());
    assertEquals(3, transaction.getValue().getQuantityDelta());
    assertEquals(5, transaction.getValue().getQuantityBefore());
    assertEquals(8, transaction.getValue().getQuantityAfter());
  }

  @Test
  void adjustDeltaRejectsNegativeResult() {
    var book = new Book();
    book.setStock(2);
    when(books.findByIdForUpdate(1L)).thenReturn(Optional.of(book));

    assertThrows(IllegalArgumentException.class, () -> service.adjustDelta(1L, -3, "admin"));
    org.mockito.Mockito.verifyNoInteractions(transactions);
  }
}
