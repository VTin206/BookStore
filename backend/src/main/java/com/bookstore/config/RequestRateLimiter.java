package com.bookstore.config;

import java.time.Clock;
import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Service;

/** Bounded, single-instance limiter. Use a shared edge limiter for multi-instance deployment. */
@Service
public class RequestRateLimiter {
  private record Window(long expiresAt, int count) {}
  private final Map<String, Window> windows = new HashMap<>();
  private final Clock clock;

  public RequestRateLimiter() { this(Clock.systemUTC()); }
  RequestRateLimiter(Clock clock) { this.clock = clock; }

  public synchronized boolean allow(String key, int limit, long windowMillis) {
    long now = clock.millis();
    windows.entrySet().removeIf(entry -> entry.getValue().expiresAt() <= now);
    Window previous = windows.get(key);
    if (previous == null) {
      if (windows.size() >= 10000) return false;
      windows.put(key, new Window(now + windowMillis, 1));
      return true;
    }
    if (previous.count() >= limit) return false;
    windows.put(key, new Window(previous.expiresAt(), previous.count() + 1));
    return true;
  }
}
