package com.bookstore.category.repository;
import com.bookstore.category.entity.Category; import org.springframework.data.jpa.repository.JpaRepository;
public interface CategoryRepository extends JpaRepository<Category,Long> { }
