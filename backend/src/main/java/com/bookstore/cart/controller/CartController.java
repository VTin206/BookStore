package com.bookstore.cart.controller;

import com.bookstore.cart.dto.CartItemRequest;
import com.bookstore.cart.dto.CartItemUpdateRequest;
import com.bookstore.cart.entity.Cart;
import com.bookstore.cart.cartService.CartService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {
  private final CartService cartService;

  public CartController(CartService cartService) {
    this.cartService = cartService;
  }

  @GetMapping
  public Cart get(Authentication authentication) {
    return cartService.get(authentication.getName());
  }

  @PostMapping("/items")
  public Cart add(Authentication authentication, @Valid @RequestBody CartItemRequest request) {
    return cartService.add(authentication.getName(), request);
  }

  @PatchMapping("/items/{id}")
  public Cart update(
      Authentication authentication,
      @PathVariable Long id,
      @Valid @RequestBody CartItemUpdateRequest request) {
    return cartService.update(authentication.getName(), id, request.quantity());
  }

  @DeleteMapping("/items/{id}")
  public void remove(Authentication authentication, @PathVariable Long id) {
    cartService.remove(authentication.getName(), id);
  }

  @DeleteMapping
  public void clear(Authentication authentication) {
    cartService.clear(authentication.getName());
  }
}
