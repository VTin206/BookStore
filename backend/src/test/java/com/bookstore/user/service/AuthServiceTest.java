package com.bookstore.user.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bookstore.config.JwtService;
import com.bookstore.user.dto.AuthRequest;
import com.bookstore.user.dto.RegisterRequest;
import com.bookstore.user.entity.User;
import com.bookstore.user.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
  @Mock private UserRepository users;
  @Mock private PasswordEncoder encoder;
  private JwtService jwt;
  private AuthService service;

  @BeforeEach
  void setUp() {
    jwt = new JwtService("book-store-test-secret-key-32-characters");
    service = new AuthService(users, encoder, jwt);
  }

  @Test
  void registerHashesPasswordSavesCustomerAndReturnsToken() {
    when(users.existsByUsernameIgnoreCase("alice")).thenReturn(false);
    when(users.existsByEmailIgnoreCase("alice@example.com")).thenReturn(false);
    when(encoder.encode("secret123")).thenReturn("hashed");
    when(users.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

    var result =
        service.register(
            new RegisterRequest("alice", "secret123", "Alice", "alice@example.com", "0900"));

    var claims = jwt.parse(result.token());
    assertEquals("alice", claims.getSubject());
    assertEquals("CUSTOMER", result.role());
    var saved = ArgumentCaptor.forClass(User.class);
    verify(users).save(saved.capture());
    assertEquals("hashed", saved.getValue().getPassword());
  }

  @Test
  void registerRejectsDuplicateUsername() {
    when(users.existsByUsernameIgnoreCase("alice")).thenReturn(true);

    assertThrows(
        IllegalArgumentException.class,
        () -> service.register(new RegisterRequest("alice", "secret123", "Alice", "a@b.com", null)));
  }

  @Test
  void registerRejectsDuplicateEmail() {
    when(users.existsByUsernameIgnoreCase("alice")).thenReturn(false);
    when(users.existsByEmailIgnoreCase("a@b.com")).thenReturn(true);

    assertThrows(
        IllegalArgumentException.class,
        () -> service.register(new RegisterRequest("alice", "secret123", "Alice", "a@b.com", null)));
  }

  @Test
  void loginReturnsTokenWithRoleWhenPasswordMatches() {
    var user = new User();
    user.setUsername("alice");
    user.setPassword("hashed");
    when(users.findByUsername("alice")).thenReturn(Optional.of(user));
    when(encoder.matches("secret123", "hashed")).thenReturn(true);

    var result = service.login(new AuthRequest("alice", "secret123"));

    assertEquals("alice", jwt.parse(result.token()).getSubject());
    assertEquals("CUSTOMER", result.role());
  }

  @Test
  void loginRejectsWrongPassword() {
    var user = new User();
    user.setUsername("alice");
    user.setPassword("hashed");
    when(users.findByUsername("alice")).thenReturn(Optional.of(user));
    when(encoder.matches("wrong", "hashed")).thenReturn(false);

    assertThrows(
        IllegalArgumentException.class, () -> service.login(new AuthRequest("alice", "wrong")));
  }
}