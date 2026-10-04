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
    var user = userRepository.findByUsernameForUpdate(username).orElseThrow();
    return cartRepository
        .findByUserUsername(username)
        .orElseGet(() -> cartRepository.save(new Cart(user)));
  }

  @Transactional
  public Cart add(String username, CartItemRequest request) {
    validateQuantity(request.quantity());
    var cart = get(username);
    var book = bookRepository.findById(request.bookId()).orElseThrow();
    if (!book.isActive()) {
      throw new IllegalStateException("Sách này hiện đã ngừng bán");
    }
    var item =
        cart.getItems().stream()
            .filter(existing -> existing.getBook().getId().equals(book.getId()))
            .findFirst()
            .orElse(null);
    var newQuantity = request.quantity();
    if (item == null) {
      if (cart.getItems().size() >= 100) throw new IllegalArgumentException("Giỏ hàng tối đa 100 đầu sách");
      if (newQuantity > book.getStock()) {
        throw new IllegalArgumentException("Số lượng vượt quá tồn kho");
      }
      cart.getItems().add(new CartItem(cart, book, newQuantity));
    } else {
      newQuantity = Math.addExact(newQuantity, item.getQuantity());
      validateQuantity(newQuantity);
      if (newQuantity > book.getStock()) {
        throw new IllegalArgumentException("Số lượng vượt quá tồn kho");
      }
      item.setQuantity(newQuantity);
    }
    return cartRepository.save(cart);
  }

  @Transactional
  public Cart update(String username, Long itemId, Integer quantity) {
    validateQuantity(quantity);
    var item = getOwnedItem(username, itemId);
    if (!item.getBook().isActive() || quantity > item.getBook().getStock()) {
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
    userRepository.findByUsernameForUpdate(username).orElseThrow();
    var item = cartItemRepository.findById(itemId).orElseThrow();
    if (!item.getCart().getUser().getUsername().equals(username)) {
      throw new IllegalArgumentException("Bạn không có quyền thao tác giỏ hàng này");
    }
    return item;
  }

  private void validateQuantity(Integer quantity) {
    if (quantity == null || quantity < 1 || quantity > 1000) throw new IllegalArgumentException("Số lượng phải từ 1 đến 1.000");
  }
}
