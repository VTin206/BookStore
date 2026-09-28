package com.bookstore.user.controller;

import com.bookstore.user.dto.ChangePasswordRequest;
import com.bookstore.user.dto.ProfileUpdateRequest;
import com.bookstore.user.entity.User;
import com.bookstore.user.repository.UserRepository;
import com.bookstore.user.userService.UserService;
import com.bookstore.wishlistService.entity.WishlistItem;
import com.bookstore.wishlistService.userService.WishlistService;
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
  private final UserRepository userRepository;
  private final UserService userService;
  private final WishlistService wishlistService;

  public UserController(UserRepository userRepository, UserService userService, WishlistService wishlistService) {
    this.userRepository = userRepository;
    this.userService = userService;
    this.wishlistService = wishlistService;
  }

  @GetMapping("/me")
  public User me(Authentication authentication) {
    return userService.getByUsername(authentication.getName());
  }

  @PutMapping("/me")
  public User updateMe(
      Authentication authentication, @Valid @RequestBody ProfileUpdateRequest request) {
    return userService.updateProfile(authentication.getName(), request);
  }

  @PutMapping("/me/password")
  public void changePassword(
      Authentication authentication, @Valid @RequestBody ChangePasswordRequest request) {
    userService.changePassword(authentication.getName(), request);
  }

  @GetMapping("/me/wishlistService")
  public List<WishlistItem> wishlist(Authentication authentication) {
    return wishlistService.getAll(authentication.getName());
  }

  @PostMapping("/me/wishlistService/{bookId}")
  public WishlistItem addWishlist(Authentication authentication, @PathVariable Long bookId) {
    return wishlistService.add(authentication.getName(), bookId);
  }

  @DeleteMapping("/me/wishlistService/{bookId}")
  public void removeWishlist(Authentication authentication, @PathVariable Long bookId) {
    wishlistService.remove(authentication.getName(), bookId);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PatchMapping("/{id}/role")
  public User updateRole(
      Authentication authentication, @PathVariable Long id, @RequestParam String role) {
    return userService.updateRole(authentication.getName(), id, role);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @GetMapping
  public List<User> all() {
    return userRepository.findAll();
  }
}