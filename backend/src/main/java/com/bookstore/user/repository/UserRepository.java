package com.bookstore.user.repository;
import com.bookstore.user.entity.User; import org.springframework.data.jpa.repository.JpaRepository;
public interface UserRepository extends JpaRepository<User,Long> { }
