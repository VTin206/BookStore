package com.bookstore.common;
import org.springframework.http.*; import org.springframework.web.bind.annotation.*; import java.util.Map;
@RestControllerAdvice public class ApiExceptionHandler {
 @ExceptionHandler(IllegalArgumentException.class) ResponseEntity<Map<String,String>> bad(IllegalArgumentException e){return ResponseEntity.badRequest().body(Map.of("message",e.getMessage()==null?"Invalid request":e.getMessage()));}
 @ExceptionHandler(java.util.NoSuchElementException.class) ResponseEntity<Map<String,String>> missing(java.util.NoSuchElementException e){return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message","Resource not found"));}
}
