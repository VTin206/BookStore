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
  private final JwtService jwt;

  public JwtFilter(JwtService jwt) {
    this.jwt = jwt;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {
    var h = req.getHeader("Authorization");
    if (h != null && h.startsWith("Bearer "))
      try {
        var c = jwt.parse(h.substring(7));
        var a =
            new UsernamePasswordAuthenticationToken(
                c.getSubject(), null, List.of(new SimpleGrantedAuthority("ROLE_" + c.get("role"))));
        SecurityContextHolder.getContext().setAuthentication(a);
      } catch (Exception ignored) {
      }
    chain.doFilter(req, res);
  }
}
