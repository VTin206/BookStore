package com.bookstore.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

record ReviewRequest(
    @NotNull Long bookId,
    @NotNull @Min(1) @Max(5) Integer rating,
    String comment) {}
