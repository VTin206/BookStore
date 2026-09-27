package com.bookstore.order.controller;

import com.bookstore.order.dto.OrderRequest;
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
  private final OrderService service;

  public OrderController(OrderService service) {
    this.service = service;
  }

  @GetMapping
  public List<Order> all(Authentication authentication) {
    return service.allForUser(authentication.getName());
  }

  @PostMapping
  public Order create(Authentication authentication, @Valid @RequestBody OrderRequest request) {
    return service.create(authentication.getName(), request);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @GetMapping("/admin")
  public List<Order> allForAdmin() {
    return service.allForAdmin();
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PatchMapping("/admin/{id}/status")
  public Order updateStatus(@PathVariable Long id, @RequestParam String value) {
    return service.updateStatus(id, value);
  }
}
