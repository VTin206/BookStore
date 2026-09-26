package com.bookstore.user.controller;

import com.bookstore.user.dto.ChangePasswordRequest;
import com.bookstore.user.dto.ProfileUpdateRequest;
import com.bookstore.user.entity.User;
import com.bookstore.user.repository.UserRepository;
import com.bookstore.user.service.UserService;
import com.bookstore.wishlist.entity.WishlistItem;
import com.bookstore.wishlist.service.WishlistService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
  private final UserRepository repo;
  private final UserService service;
  private final WishlistService wishlist;

  public UserController(UserRepository repo, UserService service, WishlistService wishlist) {
    this.repo = repo;
    this.service = service;
    this.wishlist = wishlist;
  }

  @GetMapping("/me")
  public User me(Authentication authentication) {
    return service.getByUsername(authentication.getName());
  }

  @PutMapping("/me")
  public User updateMe(
      Authentication authentication, @Valid @RequestBody ProfileUpdateRequest request) {
    return service.updateProfile(authentication.getName(), request);
  }

  @PutMapping("/me/password")
  public void changePassword(
      Authentication authentication, @Valid @RequestBody ChangePasswordRequest request) {
    service.changePassword(authentication.getName(), request);
  }

  @GetMapping("/me/wishlist")
  public List<WishlistItem> wishlist(Authentication authentication) {
    return wishlist.getAll(authentication.getName());
  }

  @PostMapping("/me/wishlist/{bookId}")
  public WishlistItem addWishlist(Authentication authentication, @PathVariable Long bookId) {
    return wishlist.add(authentication.getName(), bookId);
  }

  @DeleteMapping("/me/wishlist/{bookId}")
  public void removeWishlist(Authentication authentication, @PathVariable Long bookId) {
    wishlist.remove(authentication.getName(), bookId);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PatchMapping("/{id}/role")
  public User updateRole(
      Authentication authentication, @PathVariable Long id, @RequestParam String value) {
    return service.updateRole(authentication.getName(), id, value);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @GetMapping
  public List<User> all() {
    return repo.findAll();
  }
}