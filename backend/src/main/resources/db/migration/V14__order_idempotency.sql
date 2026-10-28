CREATE TABLE order_idempotency (
  id BIGSERIAL PRIMARY KEY,
  scope_key VARCHAR(100) NOT NULL,
  idempotency_key VARCHAR(100) NOT NULL,
  request_hash CHAR(64) NOT NULL,
  order_id BIGINT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_order_idempotency_scope_key UNIQUE (scope_key, idempotency_key)
);
