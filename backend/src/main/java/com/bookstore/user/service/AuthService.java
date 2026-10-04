package com.bookstore.user.service;

import com.bookstore.config.JwtService;
import com.bookstore.user.dto.*;
import com.bookstore.user.entity.User;
import com.bookstore.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.bookstore.common.exception.UnauthorizedException;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final String dummyPasswordHash;

  public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.dummyPasswordHash = passwordEncoder.encode(java.util.UUID.randomUUID().toString());
  }

  @Transactional
  public AuthResponse register(RegisterRequest request) {
    PasswordPolicy.validate(request.password());
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
    return new AuthResponse(jwtService.create(user.getUsername(), user.getRole(), user.getTokenVersion()), user.getUsername(), user.getRole());
  }

  public AuthResponse login(AuthRequest request) {
    var user = userRepository.findByUsername(request.username()).orElse(null);
    boolean matches = passwordEncoder.matches(request.password(), user == null ? dummyPasswordHash : user.getPassword());
    if (user == null || !matches)
      throw new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không đúng.");
    return new AuthResponse(jwtService.create(user.getUsername(), user.getRole(), user.getTokenVersion()), user.getUsername(), user.getRole());
  }
}
