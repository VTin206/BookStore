package com.bookstore.voucher.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record VoucherRequest(
    @NotBlank @Size(max = 50) String code,
    @NotBlank String discountType,
    @NotNull @Positive BigDecimal discountValue,
    @NotNull @PositiveOrZero BigDecimal minOrderAmount,
    LocalDateTime expiresAt,
    @Positive Integer usageLimit,
    Boolean active) {}