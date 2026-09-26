package com.bookstore.common;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class ApiExceptionHandlerTest {
  private final ApiExceptionHandler handler = new ApiExceptionHandler();

  @Test
  void illegalArgumentMapsToBadRequest() {
    var response = handler.bad(new IllegalArgumentException("bad input"));

    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    assertEquals("bad input", response.getBody().get("message"));
  }

  @Test
  void illegalStateMapsToBadRequest() {
    var response = handler.bad(new IllegalStateException("in use"));

    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    assertEquals("in use", response.getBody().get("message"));
  }

  @Test
  void missingResourceMapsToNotFound() {
    var response = handler.missing(new java.util.NoSuchElementException());

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertEquals("Resource not found", response.getBody().get("message"));
  }
}