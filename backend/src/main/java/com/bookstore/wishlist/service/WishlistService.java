package com.bookstore.wishlist.service;

import com.bookstore.book.repository.BookRepository;
import com.bookstore.user.repository.UserRepository;
import com.bookstore.wishlist.entity.WishlistItem;
import com.bookstore.wishlist.repository.WishlistRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WishlistService {
  private final WishlistRepository wishlistRepository;
  private final UserRepository userRepository;
  private final BookRepository bookRepository;

  public WishlistService(WishlistRepository wishlistRepository, UserRepository userRepository, BookRepository bookRepository) {
    this.wishlistRepository = wishlistRepository;
    this.userRepository = userRepository;
    this.bookRepository = bookRepository;
  }

  @Transactional(readOnly = true)
  public List<WishlistItem> getAll(String username) {
    return wishlistRepository.findByUserUsernameOrderByCreatedAtDesc(username);
  }

  @Transactional
  public WishlistItem add(String username, Long bookId) {
    return wishlistRepository
        .findByUserUsernameAndBookId(username, bookId)
        .orElseGet(
            () ->
                wishlistRepository.save(
                    new WishlistItem(
                        userRepository.findByUsername(username).orElseThrow(),
                        bookRepository.findById(bookId).orElseThrow())));
  }

  @Transactional
  public void remove(String username, Long bookId) {
    wishlistRepository.findByUserUsernameAndBookId(username, bookId).ifPresent(wishlistRepository::delete);
  }
}
