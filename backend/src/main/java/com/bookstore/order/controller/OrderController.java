package com.bookstore.order.controller;

import com.bookstore.order.dto.OrderRequest;
import com.bookstore.order.dto.OrderTrackingResponse;
import com.bookstore.order.entity.Order;
import com.bookstore.order.service.OrderService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
  private final OrderService orderService;

  public OrderController(OrderService orderService) {
    this.orderService = orderService;
  }

  @GetMapping
  public org.springframework.data.domain.Page<com.bookstore.order.dto.OrderResponse> all(Authentication authentication,
      @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size) {
    return orderService.allForUser(authentication.getName(), pageRequest(page, size));
  }

  @PostMapping
  public com.bookstore.order.dto.OrderResponse create(Authentication authentication, @Valid @RequestBody OrderRequest request) {
    return orderService.createResponse(authentication == null ? null : authentication.getName(), request);
  }

  @GetMapping("/lookup")
  public OrderTrackingResponse lookup(@RequestParam String code) {
    return orderService.lookup(code);
  }

  @PostMapping("/quote")
  public com.bookstore.order.dto.OrderQuote quote(@Valid @RequestBody com.bookstore.order.dto.OrderQuoteRequest request) {
    return orderService.quote(request);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @GetMapping("/admin")
  public org.springframework.data.domain.Page<com.bookstore.order.dto.OrderResponse> allForAdmin(
      @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size) {
    return orderService.allForAdmin(pageRequest(page, size));
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PatchMapping("/admin/{id}/status")
  public com.bookstore.order.dto.OrderResponse updateStatus(@PathVariable Long id, @RequestParam("orderStatus") String orderStatus) {
    return orderService.updateStatusResponse(id, orderStatus);
  }

  private org.springframework.data.domain.PageRequest pageRequest(int page, int size) {
    if (page < 0 || size < 1 || size > 100) throw new IllegalArgumentException("Phân trang không hợp lệ");
    return org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("id").descending());
  }
}
