package com.bookstore.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class RateLimitFilter extends OncePerRequestFilter {
  private final RequestRateLimiter limiter;
  public RateLimitFilter(RequestRateLimiter limiter) { this.limiter = limiter; }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
      FilterChain chain) throws ServletException, IOException {
    String path = request.getServletPath();
    String method = request.getMethod();
    int limit = 0;
    long window = 60000;
    if ("POST".equals(method) && path.equals("/api/orders/quote")) limit = 60;
    if ("POST".equals(method) && path.equals("/api/auth/login")) limit = 10;
    if ("POST".equals(method) && path.equals("/api/auth/register")) { limit = 5; window = 3600000; }
    if ("POST".equals(method) && path.equals("/api/orders")) { limit = 5; window = 600000; }
    if ("GET".equals(method) && (path.equals("/api/orders/lookup") || path.equals("/api/vouchers/validate"))) limit = 60;
    // Do not trust client-supplied X-Forwarded-For headers.
    if (limit > 0 && !limiter.allow(path + ":" + request.getRemoteAddr(), limit, window)) {
      response.setStatus(429);
      response.setHeader("Retry-After", Long.toString(window / 1000));
      response.setContentType("application/json;charset=UTF-8");
      response.getWriter().write("{\"message\":\"Bạn thao tác quá nhanh. Vui lòng thử lại sau.\"}");
      return;
    }
    chain.doFilter(request, response);
  }
}
