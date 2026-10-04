package com.bookstore.order.service;

import com.bookstore.order.repository.OrderRepository;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@EnableScheduling
public class OrderExpiryJob {
  private static final org.slf4j.Logger LOG = org.slf4j.LoggerFactory.getLogger(OrderExpiryJob.class);
  private final OrderRepository orders;
  private final OrderService service;
  private final long ttlHours;

  public OrderExpiryJob(OrderRepository orders, OrderService service,
      @Value("${app.orders.pending-ttl-hours:24}") long ttlHours) {
    if (ttlHours < 1) throw new IllegalArgumentException("Pending order TTL must be positive");
    this.orders = orders;
    this.service = service;
    this.ttlHours = ttlHours;
  }

  @Scheduled(fixedDelayString = "${app.orders.expiry-interval-ms:60000}")
  public void expire() {
    var cutoff = LocalDateTime.now().minusHours(ttlHours);
    for (var id : orders.findExpiredPendingIds(cutoff, PageRequest.of(0, 100))) {
      try { service.expirePendingOrder(id, cutoff); }
      catch (RuntimeException exception) { LOG.warn("Failed to expire pending order {}", id, exception); }
    }
  }
}
