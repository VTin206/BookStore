package com.bookstore.user.service;

import com.bookstore.config.JwtService;
import com.bookstore.user.dto.*;
import com.bookstore.user.entity.User;
import com.bookstore.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  public AuthResponse register(RegisterRequest request) {
    if (userRepository.existsByUsernameIgnoreCase(request.username()))
      throw new IllegalArgumentException("Tên đăng nhập đã tồn tại");
    if (userRepository.existsByEmailIgnoreCase(request.email()))
      throw new IllegalArgumentException("Email đã tồn tại");
    var user = new User();
    user.setUsername(request.username());
    user.setPassword(passwordEncoder.encode(request.password()));
    user.setFullName(request.fullName());
    user.setEmail(request.email());
    user.setPhone(request.phone());
    userRepository.save(user);
    return new AuthResponse(jwtService.create(user.getUsername(), user.getRole()), user.getUsername(), user.getRole());
  }

  public AuthResponse login(AuthRequest request) {
    var user = userRepository.findByUsername(request.username()).orElseThrow();
    if (!passwordEncoder.matches(request.password(), user.getPassword()))
      throw new IllegalArgumentException("Invalid credentials");
    return new AuthResponse(jwtService.create(user.getUsername(), user.getRole()), user.getUsername(), user.getRole());
  }
}
