package com.bookstore.cart.service;

import com.bookstore.book.repository.BookRepository;
import com.bookstore.cart.dto.CartItemRequest;
import com.bookstore.cart.entity.Cart;
import com.bookstore.cart.entity.CartItem;
import com.bookstore.cart.repository.CartItemRepository;
import com.bookstore.cart.repository.CartRepository;
import com.bookstore.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartService {
  private final CartRepository carts;
  private final CartItemRepository items;
  private final BookRepository books;
  private final UserRepository users;

  public CartService(CartRepository carts, CartItemRepository items, BookRepository books, UserRepository users) {
    this.carts = carts;
    this.items = items;
    this.books = books;
    this.users = users;
  }

  @Transactional
  public Cart get(String username) {
    return carts
        .findByUserUsername(username)
        .orElseGet(() -> carts.save(new Cart(users.findByUsername(username).orElseThrow())));
  }

  @Transactional
  public Cart add(String username, CartItemRequest request) {
    var cart = get(username);
    var book = books.findById(request.bookId()).orElseThrow();
    var item =
        cart.getItems().stream()
            .filter(existing -> existing.getBook().getId().equals(book.getId()))
            .findFirst()
            .orElse(null);
    var newQuantity = request.quantity();
    if (item == null) {
      if (newQuantity > book.getStock()) {
        throw new IllegalArgumentException("Số lượng vượt quá tồn kho");
      }
      cart.getItems().add(new CartItem(cart, book, newQuantity));
    } else {
      newQuantity += item.getQuantity();
      if (newQuantity > book.getStock()) {
        throw new IllegalArgumentException("Số lượng vượt quá tồn kho");
      }
      item.setQuantity(newQuantity);
    }
    return carts.save(cart);
  }

  @Transactional
  public Cart update(String username, Long itemId, Integer quantity) {
    var item = getOwnedItem(username, itemId);
    if (quantity > item.getBook().getStock()) {
      throw new IllegalArgumentException("Số lượng vượt quá tồn kho");
    }
    item.setQuantity(quantity);
    return carts.save(item.getCart());
  }

  @Transactional
  public void remove(String username, Long itemId) {
    var item = getOwnedItem(username, itemId);
    items.delete(item);
  }

  private CartItem getOwnedItem(String username, Long itemId) {
    var item = items.findById(itemId).orElseThrow();
    if (!item.getCart().getUser().getUsername().equals(username)) {
      throw new IllegalArgumentException("Bạn không có quyền thao tác giỏ hàng này");
    }
    return item;
  }
}
