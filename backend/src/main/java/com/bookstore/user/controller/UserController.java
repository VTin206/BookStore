package com.bookstore.user.controller;
import com.bookstore.user.entity.User; import org.springframework.security.access.prepost.PreAuthorize; import com.bookstore.user.repository.UserRepository; import lombok.RequiredArgsConstructor; import org.springframework.web.bind.annotation.*; import java.util.List;
@RestController @RequestMapping("/api/users") public class UserController { private final UserRepository repo; public UserController(UserRepository repo){this.repo=repo;} @PreAuthorize("hasRole('ADMIN')") @GetMapping public List<User> all(){return repo.findAll();} }

