package com.bookstore.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import static org.junit.jupiter.api.Assertions.*;

class RateLimitFilterTest {
  @Test void limitsLoginAndIgnoresSpoofedForwardedAddresses() throws Exception {
    var filter = new RateLimitFilter(new RequestRateLimiter());
    for (int i = 0; i < 11; i++) {
      var request = new MockHttpServletRequest("POST", "/api/auth/login");
      request.setServletPath("/api/auth/login");
      request.setRemoteAddr("127.0.0.1");
      request.addHeader("X-Forwarded-For", "192.0.2." + i);
      var response = new MockHttpServletResponse();
      filter.doFilter(request, response, (req, res) -> ((MockHttpServletResponse) res).setStatus(204));
      assertEquals(i < 10 ? 204 : 429, response.getStatus());
    }
  }
}
