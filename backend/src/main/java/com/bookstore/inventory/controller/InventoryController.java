package com.bookstore.inventory.controller;

import com.bookstore.inventory.dto.InventoryRequests.*;
import com.bookstore.inventory.dto.InventoryResponses.*;
import com.bookstore.inventory.service.InventoryService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@PreAuthorize("hasRole('ADMIN')")
public class InventoryController {
  private final InventoryService inventory;
  public InventoryController(InventoryService inventory) { this.inventory = inventory; }

  @GetMapping("/stock") public List<BookStock> stock() { return inventory.stock(); }
  @GetMapping("/low-stock") public List<BookStock> lowStock() { return inventory.lowStock(); }
  @PatchMapping("/stock/{bookId}/minimum") public BookStock setMinimum(@PathVariable Long bookId, @RequestParam int value) { return inventory.setMinimumStock(bookId, value); }
  @GetMapping("/suppliers") public List<SupplierView> suppliers() { return inventory.allSuppliers(); }
  @PostMapping("/suppliers") public SupplierView createSupplier(@Valid @RequestBody SupplierRequest request) { return inventory.createSupplier(request); }
  @GetMapping("/receipts") public List<ReceiptView> receipts() { return inventory.allReceipts(); }
  @PostMapping("/receipts") public ReceiptView receive(Authentication auth, @Valid @RequestBody ReceiptRequest request) { return inventory.receive(auth.getName(), request); }
  @GetMapping("/transactions") public List<TransactionView> transactions() { return inventory.allTransactions(); }
  @PostMapping("/adjustments") public TransactionView adjust(Authentication auth, @Valid @RequestBody AdjustmentRequest request) { return inventory.adjust(auth.getName(), request); }
  @GetMapping("/stocktakes") public List<StocktakeView> stocktakes() { return inventory.allStocktakes(); }
  @PostMapping("/stocktakes") public StocktakeView createStocktake(Authentication auth, @Valid @RequestBody StocktakeRequest request) { return inventory.createStocktake(auth.getName(), request); }
  @PostMapping("/stocktakes/{id}/complete") public StocktakeView completeStocktake(Authentication auth, @PathVariable Long id) { return inventory.completeStocktake(auth.getName(), id); }

  @GetMapping("/export.xlsx")
  public ResponseEntity<ByteArrayResource> export() {
    var resource = new ByteArrayResource(inventory.exportWorkbook());
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
        .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename("inventory.xlsx").build().toString())
        .contentLength(resource.contentLength()).body(resource);
  }
}
