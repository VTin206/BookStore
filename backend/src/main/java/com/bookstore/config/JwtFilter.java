package com.bookstore.config;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtFilter extends OncePerRequestFilter {
  private final JwtService jwtService;
  private final com.bookstore.user.repository.UserRepository users;

  public JwtFilter(JwtService jwtService, com.bookstore.user.repository.UserRepository users) {
    this.jwtService = jwtService;
    this.users = users;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    var authorizationHeader = request.getHeader("Authorization");
    if (authorizationHeader != null && authorizationHeader.startsWith("Bearer "))
      try {
        var claims = jwtService.parse(authorizationHeader.substring(7));
        var user = users.findByUsername(claims.getSubject()).orElse(null);
        var version = claims.get("version", Number.class);
        if (user == null || version == null || version.longValue() != user.getTokenVersion()
            || !user.getRole().equals(claims.get("role", String.class))) {
          unauthorized(response);
          return;
        }
        var authentication =
            new UsernamePasswordAuthenticationToken(
                claims.getSubject(), null, List.of(new SimpleGrantedAuthority("ROLE_" + claims.get("role"))));
        SecurityContextHolder.getContext().setAuthentication(authentication);
      } catch (io.jsonwebtoken.JwtException | IllegalArgumentException exception) {
        unauthorized(response);
        return;
      }
    chain.doFilter(request, response);
  }

  private void unauthorized(HttpServletResponse response) throws IOException {
    SecurityContextHolder.clearContext();
    response.setStatus(401);
    response.setContentType("application/json;charset=UTF-8");
    response.getWriter().write("{\"message\":\"Phiên đăng nhập không hợp lệ hoặc đã hết hạn.\"}");
  }
}
