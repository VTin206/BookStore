package com.bookstore.user.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bookstore.user.entity.User;
import com.bookstore.user.repository.UserRepository;
import java.lang.reflect.Field;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
  @Mock private UserRepository users;
  @Mock private PasswordEncoder passwordEncoder;
  @InjectMocks private UserService service;

  @Test
  void adminCanChangeAnotherUsersRole() throws Exception {
    var current = userWithId(1L);
    var target = userWithId(2L);
    when(users.findByUsername("admin")).thenReturn(Optional.of(current));
    when(users.findById(2L)).thenReturn(Optional.of(target));
    when(users.save(target)).thenReturn(target);

    var updated = service.updateRole("admin", 2L, "customer");

    assertEquals(target, updated);
    assertEquals("CUSTOMER", target.getRole());
  }

  @Test
  void adminCannotChangeOwnRole() throws Exception {
    var current = userWithId(1L);
    when(users.findByUsername("admin")).thenReturn(Optional.of(current));
    when(users.findById(1L)).thenReturn(Optional.of(current));

    assertThrows(
        IllegalArgumentException.class, () -> service.updateRole("admin", 1L, "CUSTOMER"));
  }

  private static User userWithId(Long id) throws Exception {
    var user = new User();
    Field idField = User.class.getDeclaredField("id");
    idField.setAccessible(true);
    idField.set(user, id);
    return user;
  }
}