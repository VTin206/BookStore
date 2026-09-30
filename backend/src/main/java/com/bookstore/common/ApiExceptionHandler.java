package com.bookstore.common;

import java.util.Map;
import com.bookstore.common.exception.ApiException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.security.access.AccessDeniedException;

@RestControllerAdvice
public class ApiExceptionHandler {
  @ExceptionHandler(ApiException.class)
  ResponseEntity<Map<String, String>> api(ApiException exception) {
    return ResponseEntity.status(exception.getStatus()).body(Map.of("message", exception.getMessage()));
  }

  @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
  ResponseEntity<Map<String, String>> bad(RuntimeException exception) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(
            Map.of(
                "message",
                exception.getMessage() == null ? "Invalid request" : exception.getMessage()));
  }

  @ExceptionHandler(java.util.NoSuchElementException.class)
  ResponseEntity<Map<String, String>> missing(java.util.NoSuchElementException exception) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Resource not found"));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<Map<String, String>> validation(MethodArgumentNotValidException exception) {
    var message =
        exception.getBindingResult().getFieldErrors().stream()
            .findFirst()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .orElse("Request validation failed");
    return ResponseEntity.badRequest().body(Map.of("message", message));
  }

  @ExceptionHandler(AccessDeniedException.class)
  ResponseEntity<Map<String, String>> accessDenied(AccessDeniedException exception) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(Map.of("message", "Bạn cần quyền quản trị viên để thực hiện thao tác này."));
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  ResponseEntity<Map<String, String>> conflict(DataIntegrityViolationException exception) {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(Map.of("message", "Resource conflicts with existing data"));
  }
}
