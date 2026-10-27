package com.bookstore.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

record ReviewRequest(
    @NotNull Long bookId,
    @NotNull @Min(1) @Max(5) Integer rating,
    @Size(max = 5000) String comment) {}
