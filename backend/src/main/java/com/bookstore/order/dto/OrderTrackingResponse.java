package com.bookstore.order.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderTrackingResponse(
    String trackingCode,
    String status,
    BigDecimal totalAmount,
    LocalDateTime createdAt) {}
