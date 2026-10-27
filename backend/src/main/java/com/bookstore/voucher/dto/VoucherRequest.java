package com.bookstore.voucher.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Digits;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record VoucherRequest(
    @NotBlank @Size(max = 50) String code,
    @NotBlank @Size(max = 20) String discountType,
    @NotNull @Positive @Digits(integer = 10, fraction = 2) BigDecimal discountValue,
    @NotNull @PositiveOrZero @Digits(integer = 10, fraction = 2) BigDecimal minOrderAmount,
    LocalDateTime expiresAt,
    @Positive Integer usageLimit,
    Boolean active) {}
