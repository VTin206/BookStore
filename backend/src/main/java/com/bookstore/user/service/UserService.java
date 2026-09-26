package com.bookstore.user.service;

import com.bookstore.user.dto.ChangePasswordRequest;
import com.bookstore.user.dto.ProfileUpdateRequest;
import com.bookstore.user.entity.User;
import com.bookstore.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
  private final UserRepository users;
  private final PasswordEncoder passwordEncoder;

  public UserService(UserRepository users, PasswordEncoder passwordEncoder) {
    this.users = users;
    this.passwordEncoder = passwordEncoder;
  }

  @Transactional(readOnly = true)
  public User getByUsername(String username) {
    return users.findByUsername(username).orElseThrow();
  }

  @Transactional
  public User updateProfile(String username, ProfileUpdateRequest request) {
    var user = getByUsername(username);
    var emailChanged = !user.getEmail().equalsIgnoreCase(request.email());
    if (emailChanged && users.existsByEmailIgnoreCase(request.email())) {
      throw new IllegalArgumentException("Email đã tồn tại");
    }
    user.setFullName(request.fullName());
    user.setEmail(request.email());
    user.setPhone(request.phone());
    user.setAddress(request.address());
    return users.save(user);
  }


  @Transactional
  public User updateRole(String currentUsername, Long userId, String role) {
    var normalizedRole = role == null ? "" : role.trim().toUpperCase();
    if (!normalizedRole.equals("ADMIN") && !normalizedRole.equals("CUSTOMER")) {
      throw new IllegalArgumentException("Role must be ADMIN or CUSTOMER");
    }

    var currentUser = getByUsername(currentUsername);
    var user = users.findById(userId).orElseThrow();
    if (currentUser.getId().equals(user.getId())) {
      throw new IllegalArgumentException("You cannot change your own role");
    }

    user.setRole(normalizedRole);
    return users.save(user);
  }
  @Transactional
  public void changePassword(String username, ChangePasswordRequest request) {
    var user = getByUsername(username);
    if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
      throw new IllegalArgumentException("Mật khẩu hiện tại không đúng");
    }
    user.setPassword(passwordEncoder.encode(request.newPassword()));
    users.save(user);
  }
}
