CREATE TABLE book_categories (
  book_id BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, category_id)
);

INSERT INTO book_categories (book_id, category_id)
SELECT id, category_id FROM books WHERE category_id IS NOT NULL;