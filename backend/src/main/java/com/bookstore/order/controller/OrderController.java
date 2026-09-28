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
  public List<Order> all(Authentication authentication) {
    return orderService.allForUser(authentication.getName());
  }

  @PostMapping
  public Order create(Authentication authentication, @Valid @RequestBody OrderRequest request) {
    return orderService.create(authentication == null ? null : authentication.getName(), request);
  }

  @GetMapping("/lookup")
  public OrderTrackingResponse lookup(@RequestParam String code) {
    return orderService.lookup(code);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @GetMapping("/admin")
  public List<Order> allForAdmin() {
    return orderService.allForAdmin();
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PatchMapping("/admin/{id}/status")
  public Order updateStatus(@PathVariable Long id, @RequestParam String orderStatus) {
    return orderService.updateStatus(id, orderStatus);
  }
}
