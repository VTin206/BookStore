ALTER TABLE books
  ADD COLUMN book_condition VARCHAR(10) NOT NULL DEFAULT 'NEW'
  CHECK (book_condition IN ('NEW', 'USED'));
