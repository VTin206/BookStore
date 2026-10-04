package com.bookstore.order.service;

import com.bookstore.order.dto.OrderQuoteRequest;
import com.bookstore.order.dto.OrderRequest;
import com.bookstore.user.dto.RegisterRequest;
import jakarta.validation.Validation;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class OrderValidationTest {
  @Test void rejectsNullAndUnboundedLineItemsAndNullPassword() {
    try (var factory = Validation.buildDefaultValidatorFactory()) {
      var validator = factory.getValidator();
      assertFalse(validator.validate(new OrderQuoteRequest(Arrays.asList((OrderRequest.Item) null), null)).isEmpty());
      assertFalse(validator.validate(new OrderQuoteRequest(List.of(new OrderRequest.Item(1L, 1001)), null)).isEmpty());
      assertFalse(validator.validate(new RegisterRequest("alice", null, "Alice", "a@example.com", null)).isEmpty());
    }
  }
}
