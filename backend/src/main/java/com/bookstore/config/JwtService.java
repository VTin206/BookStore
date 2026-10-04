package com.bookstore.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final SecretKey signingKey;

  public JwtService(
      @Value("${app.jwt.secret}") String secret) {
    if (secret == null || secret.isBlank() || secret.startsWith("change-this")
        || secret.equals("book-store-dev-secret-key-32-characters")) {
      throw new IllegalStateException("JWT_SECRET must be a private, randomly generated key");
    }
    signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
  }

  public String create(String username, String role, long tokenVersion) {
    return Jwts.builder()
        .subject(username)
        .claim("role", role)
        .claim("version", tokenVersion)
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + 86400000))
        .signWith(signingKey)
        .compact();
  }

  public Claims parse(String token) {
    return Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload();
  }
}
