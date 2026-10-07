package com.bookstore.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public final class InventoryRequests {
  private InventoryRequests() {}
  public record SupplierRequest(@NotBlank @Size(max = 200) String name, @Size(max = 150) String contactName,
      @Size(max = 30) String phone, @Email @Size(max = 255) String email, @Size(max = 500) String address) {}
  public record ReceiptRequest(@NotBlank @Size(max = 50) String receiptNumber, Long supplierId, Long publisherId,
      LocalDateTime receivedAt, @Size(max = 2000) String note,
      @NotEmpty @Size(max = 200) List<@NotNull @Valid ReceiptItem> items) {}
  public record ReceiptItem(@NotNull @Positive Long bookId, @NotNull @Positive Integer quantity,
      @NotNull @PositiveOrZero @Digits(integer = 10, fraction = 2) BigDecimal unitCost) {}
  public record AdjustmentRequest(@NotNull @Positive Long bookId, @NotNull Integer quantityDelta,
      @NotBlank @Size(max = 500) String reason, @Size(max = 30) String type,
      @PositiveOrZero @Digits(integer = 10, fraction = 2) BigDecimal unitCost) {}
  public record StocktakeRequest(@NotBlank @Size(max = 50) String stocktakeNumber, @Size(max = 2000) String note,
      @NotEmpty @Size(max = 5000) List<@NotNull @Valid StocktakeItemRequest> items) {}
  public record StocktakeItemRequest(@NotNull @Positive Long bookId, @NotNull @PositiveOrZero Integer countedQuantity,
      @Size(max = 500) String reason) {}
}
