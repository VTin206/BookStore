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
  private final WishlistRepository wishlist;
  private final UserRepository users;
  private final BookRepository books;

  public WishlistService(WishlistRepository wishlist, UserRepository users, BookRepository books) {
    this.wishlist = wishlist;
    this.users = users;
    this.books = books;
  }

  @Transactional(readOnly = true)
  public List<WishlistItem> getAll(String username) {
    return wishlist.findByUserUsernameOrderByCreatedAtDesc(username);
  }

  @Transactional
  public WishlistItem add(String username, Long bookId) {
    return wishlist
        .findByUserUsernameAndBookId(username, bookId)
        .orElseGet(
            () ->
                wishlist.save(
                    new WishlistItem(
                        users.findByUsername(username).orElseThrow(),
                        books.findById(bookId).orElseThrow())));
  }

  @Transactional
  public void remove(String username, Long bookId) {
    wishlist.findByUserUsernameAndBookId(username, bookId).ifPresent(wishlist::delete);
  }
}
