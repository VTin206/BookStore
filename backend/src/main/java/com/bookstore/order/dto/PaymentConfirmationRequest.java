package com.bookstore.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PaymentConfirmationRequest(
    @NotBlank(message = "Mã giao dịch không được để trống")
    @Size(max = 100, message = "Mã giao dịch không được vượt quá 100 ký tự")
    String transactionCode) {}
