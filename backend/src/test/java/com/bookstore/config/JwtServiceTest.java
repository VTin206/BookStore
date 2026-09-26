package com.bookstore.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;

class JwtServiceTest {
  private final JwtService service = new JwtService("book-store-test-secret-key-32-characters");

  @Test
  void createAndParsePreservesSubjectAndRole() {
    var token = service.create("alice", "ADMIN");
    var claims = service.parse(token);

    assertEquals("alice", claims.getSubject());
    assertEquals("ADMIN", claims.get("role"));
    assertNotNull(claims.getIssuedAt());
    assertNotNull(claims.getExpiration());
  }

  @Test
  void parseRejectsTamperedToken() {
    var token = service.create("alice", "CUSTOMER");
    var tampered = token.substring(0, token.length() - 1) + "x";

    assertThrows(JwtException.class, () -> service.parse(tampered));
  }
}