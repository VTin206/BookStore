ALTER TABLE order_idempotency
  ALTER COLUMN request_hash TYPE VARCHAR(64);
