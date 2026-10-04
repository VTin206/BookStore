package com.bookstore.user.service;

import java.nio.charset.StandardCharsets;

final class PasswordPolicy {
  private PasswordPolicy() {}
  static void validate(String password) {
    if (password == null || password.isBlank() || password.length() < 6
        || password.getBytes(StandardCharsets.UTF_8).length > 72) {
      throw new IllegalArgumentException("Mật khẩu cần ít nhất 6 ký tự và không quá 72 byte UTF-8");
    }
  }
}
