package com.bookstore.cart.controller;

import com.bookstore.cart.dto.CartItemRequest;
import com.bookstore.cart.dto.CartItemUpdateRequest;
import com.bookstore.cart.entity.Cart;
import com.bookstore.cart.service.CartService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {
  private final CartService service;

  public CartController(CartService service) {
    this.service = service;
  }

  @GetMapping
  public Cart get(Authentication authentication) {
    return service.get(authentication.getName());
  }

  @PostMapping("/items")
  public Cart add(Authentication authentication, @Valid @RequestBody CartItemRequest request) {
    return service.add(authentication.getName(), request);
  }

  @PatchMapping("/items/{id}")
  public Cart update(
      Authentication authentication,
      @PathVariable Long id,
      @Valid @RequestBody CartItemUpdateRequest request) {
    return service.update(authentication.getName(), id, request.quantity());
  }

  @DeleteMapping("/items/{id}")
  public void remove(Authentication authentication, @PathVariable Long id) {
    service.remove(authentication.getName(), id);
  }
}
