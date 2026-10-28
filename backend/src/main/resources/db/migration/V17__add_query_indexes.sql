CREATE INDEX idx_orders_user_created
  ON orders(user_id, created_at DESC);

CREATE INDEX idx_order_items_book
  ON order_items(book_id);

CREATE INDEX idx_cart_items_book
  ON cart_items(book_id);

CREATE INDEX idx_reviews_book_created
  ON reviews(book_id, created_at DESC);

CREATE INDEX idx_wishlist_items_user_created
  ON wishlist_items(user_id, created_at DESC);

CREATE INDEX idx_book_categories_category
  ON book_categories(category_id, book_id);

CREATE INDEX idx_books_active_created
  ON books(active, created_at DESC);
