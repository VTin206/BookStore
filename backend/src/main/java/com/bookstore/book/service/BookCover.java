package com.bookstore.book.service;

import java.util.Base64;
import java.util.Set;

public record BookCover(String contentType, byte[] bytes) {
  public static BookCover decode(String value) {
    if (value == null || value.length() > 2800000) throw new IllegalArgumentException("Ảnh bìa tối đa 2 MB");
    int separator = value.indexOf(";base64,");
    if (!value.startsWith("data:") || separator < 0) throw new IllegalArgumentException("Ảnh bìa không hợp lệ");
    String type = value.substring(5, separator);
    if (!Set.of("image/png", "image/jpeg", "image/webp").contains(type)) {
      throw new IllegalArgumentException("Chỉ hỗ trợ ảnh PNG, JPEG hoặc WebP");
    }
    byte[] bytes = Base64.getDecoder().decode(value.substring(separator + 8));
    if (bytes.length == 0 || bytes.length > 2 * 1024 * 1024) throw new IllegalArgumentException("Ảnh bìa tối đa 2 MB");
    return new BookCover(type, bytes);
  }

  public static void validate(String value) {
    if (value == null || value.isBlank()) return;
    if (value.startsWith("data:")) { decode(value); return; }
    var uri = java.net.URI.create(value);
    if (value.length() > 2048 || uri.getHost() == null
        || !("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme()))) {
      throw new IllegalArgumentException("Đường dẫn ảnh bìa phải dùng HTTP hoặc HTTPS");
    }
  }
}
