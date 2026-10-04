package com.bookstore.order.dto;

import java.math.BigDecimal;

public record OrderQuote(BigDecimal subtotal, BigDecimal shippingFee,
    BigDecimal discountAmount, BigDecimal totalAmount) {}
