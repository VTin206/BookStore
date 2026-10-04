ALTER TABLE users ADD COLUMN token_version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN row_version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE books ADD COLUMN row_version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE vouchers ADD COLUMN row_version BIGINT NOT NULL DEFAULT 0;
CREATE INDEX idx_orders_pending_expiry ON orders(status, created_at);
ALTER TABLE book_categories DROP CONSTRAINT book_categories_category_id_fkey;
ALTER TABLE book_categories ADD CONSTRAINT book_categories_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT;
