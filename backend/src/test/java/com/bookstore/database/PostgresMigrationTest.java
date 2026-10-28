package com.bookstore.database;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.bookstore.BookStoreApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(classes = BookStoreApplication.class)
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = true)
class PostgresMigrationTest {
  @Container
  static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine")
      .withDatabaseName("book_store_test")
      .withUsername("bookstore")
      .withPassword("bookstore-test-password");

  @Autowired private JdbcTemplate jdbc;

  @DynamicPropertySource
  static void databaseProperties(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
    registry.add("spring.datasource.username", POSTGRES::getUsername);
    registry.add("spring.datasource.password", POSTGRES::getPassword);
    registry.add("app.jwt.secret", () -> "book-store-test-secret-key-32-characters");
  }

  @Test
  void appliesAllMigrationsAndCreatesCriticalConstraints() {
    assertEquals(1, tableCount("order_idempotency"));
    assertEquals(1, indexCount("uk_users_username_lower"));
    assertEquals(1, indexCount("uk_users_email_lower"));
    assertEquals(1, constraintCount("uk_order_idempotency_scope_key"));
  }

  @Test
  void rejectsUsernamesThatOnlyDifferByCase() {
    jdbc.update(
        "INSERT INTO users (username, password, full_name, email) VALUES (?, ?, ?, ?)",
        "Alice", "not-a-real-password", "Alice", "alice-one@example.com");

    assertThrows(DataAccessException.class, () -> jdbc.update(
        "INSERT INTO users (username, password, full_name, email) VALUES (?, ?, ?, ?)",
        "alice", "not-a-real-password", "Alice 2", "alice-two@example.com"));
  }

  private int tableCount(String name) {
    return jdbc.queryForObject(
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = ?",
        Integer.class,
        name);
  }

  private int indexCount(String name) {
    return jdbc.queryForObject(
        "SELECT COUNT(*) FROM pg_indexes WHERE indexname = ?",
        Integer.class,
        name);
  }

  private int constraintCount(String name) {
    return jdbc.queryForObject(
        "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_name = ?",
        Integer.class,
        name);
  }
}
