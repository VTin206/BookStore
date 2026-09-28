package com.bookstore.cart.entity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import com.bookstore.book.entity.Book;
import com.bookstore.user.entity.User;
import com.fasterxml.jackson.databind.json.JsonMapper;
import org.junit.jupiter.api.Test;

class CartSerializationTest {
  @Test
  void cartItemResponseDoesNotContainCartBackReference() throws Exception {
    var book = new Book();
    book.setTitle("Book");
    var user = new User();
    user.setUsername("alice");
    var cart = new Cart(user);
    cart.getItems().add(new CartItem(cart, book, 1));

    var mapper = JsonMapper.builder().findAndAddModules().build();
    var json = mapper.readTree(mapper.writeValueAsString(cart));

    assertFalse(json.has("user"));
    assertEquals(1, json.path("items").size());
    assertEquals(1, json.path("items").get(0).path("quantity").asInt());
    assertFalse(json.path("items").get(0).has("cart"));
  }
}
