package com.bookstore.config;

import com.bookstore.user.entity.User;
import com.bookstore.user.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtFilterTest {
  private final JwtService jwt = new JwtService("test-only-private-signing-secret-32-bytes");
  private final UserRepository users = mock(UserRepository.class);
  private final JwtFilter filter = new JwtFilter(jwt, users);

  @AfterEach void clearContext() { SecurityContextHolder.clearContext(); }

  @Test void acceptsCurrentSession() throws Exception {
    var user = new User();
    when(users.findByUsername("alice")).thenReturn(Optional.of(user));
    var response = request(jwt.create("alice", "CUSTOMER", 0));
    assertEquals(204, response.getStatus());
    assertEquals("alice", SecurityContextHolder.getContext().getAuthentication().getName());
  }

  @Test void rejectsRevokedSession() throws Exception {
    var user = new User();
    user.revokeTokens();
    when(users.findByUsername("alice")).thenReturn(Optional.of(user));
    assertEquals(401, request(jwt.create("alice", "CUSTOMER", 0)).getStatus());
    assertNull(SecurityContextHolder.getContext().getAuthentication());
  }

  @Test void rejectsOldAdminRole() throws Exception {
    when(users.findByUsername("alice")).thenReturn(Optional.of(new User()));
    assertEquals(401, request(jwt.create("alice", "ADMIN", 0)).getStatus());
  }

  @Test void rejectsDeletedUserAndMalformedToken() throws Exception {
    when(users.findByUsername("alice")).thenReturn(Optional.empty());
    assertEquals(401, request(jwt.create("alice", "CUSTOMER", 0)).getStatus());
    assertEquals(401, request("invalid").getStatus());
  }

  @Test void rejectsPublicOrWeakSigningKeys() {
    assertThrows(IllegalStateException.class, () -> new JwtService("change-this-secret-key-before-deploy"));
    assertThrows(RuntimeException.class, () -> new JwtService("short"));
  }

  private MockHttpServletResponse request(String token) throws Exception {
    var request = new MockHttpServletRequest();
    request.addHeader("Authorization", "Bearer " + token);
    var response = new MockHttpServletResponse();
    filter.doFilter(request, response, (req, res) -> ((MockHttpServletResponse) res).setStatus(204));
    return response;
  }
}
