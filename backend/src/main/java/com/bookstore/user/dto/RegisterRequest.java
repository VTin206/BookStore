package com.bookstore.user.dto;
import jakarta.validation.constraints.*;
public record RegisterRequest(@NotBlank String username,@Size(min=6) String password,@NotBlank String fullName,@Email @NotBlank String email,String phone) { }
