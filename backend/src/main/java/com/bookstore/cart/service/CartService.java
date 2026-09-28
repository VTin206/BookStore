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
  private final CartRepository cartRepository;
  private final CartItemRepository cartItemRepository;
  private final BookRepository bookRepository;
  private final UserRepository userRepository;

  public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository, BookRepository bookRepository, UserRepository userRepository) {
    this.cartRepository = cartRepository;
    this.cartItemRepository = cartItemRepository;
    this.bookRepository = bookRepository;
    this.userRepository = userRepository;
  }

  @Transactional
  public Cart get(String username) {
    return cartRepository
        .findByUserUsername(username)
        .orElseGet(() -> cartRepository.save(new Cart(userRepository.findByUsername(username).orElseThrow())));
  }

  @Transactional
  public Cart add(String username, CartItemRequest request) {
    var cart = get(username);
    var book = bookRepository.findById(request.bookId()).orElseThrow();
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
    return cartRepository.save(cart);
  }

  @Transactional
  public Cart update(String username, Long itemId, Integer quantity) {
    var item = getOwnedItem(username, itemId);
    if (quantity > item.getBook().getStock()) {
      throw new IllegalArgumentException("Số lượng vượt quá tồn kho");
    }
    item.setQuantity(quantity);
    cartRepository.save(item.getCart());
    return get(username);
  }

  @Transactional
  public void remove(String username, Long itemId) {
    var item = getOwnedItem(username, itemId);
    cartItemRepository.delete(item);
  }

  @Transactional
  public void clear(String username) {
    var cart = get(username);
    cart.getItems().clear();
    cartRepository.save(cart);
  }

  private CartItem getOwnedItem(String username, Long itemId) {
    var item = cartItemRepository.findById(itemId).orElseThrow();
    if (!item.getCart().getUser().getUsername().equals(username)) {
      throw new IllegalArgumentException("Bạn không có quyền thao tác giỏ hàng này");
    }
    return item;
  }
}
