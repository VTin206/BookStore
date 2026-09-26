package com.bookstore.catalog.repository;

import com.bookstore.catalog.entity.Publisher;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PublisherRepository extends JpaRepository<Publisher, Long> {}