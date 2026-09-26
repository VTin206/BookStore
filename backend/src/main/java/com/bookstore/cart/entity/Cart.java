package com.bookstore.cart.entity;

import com.bookstore.user.entity.User;
import jakarta.persistence.*;
import java.util.*;

@Entity
@Table(name = "carts")
public class Cart {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private User user;

  @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<CartItem> items = new ArrayList<>();

  public Cart() {}

  public Cart(User u) {
    user = u;
  }

  public Long getId() {
    return id;
  }

  public User getUser() {
    return user;
  }

  public List<CartItem> getItems() {
    return items;
  }
}
