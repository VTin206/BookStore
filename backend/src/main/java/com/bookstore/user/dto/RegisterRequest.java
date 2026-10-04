package com.bookstore.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank @Size(max = 100) String username,
    @NotBlank @Size(min = 6, max = 72) String password,
    @NotBlank @Size(max = 150) String fullName,
    @Email @NotBlank @Size(max = 255) String email,
    @Size(max = 30) String phone) {}
