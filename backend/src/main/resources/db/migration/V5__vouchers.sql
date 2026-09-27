CREATE TABLE vouchers (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
  discount_value NUMERIC(12,2) NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (min_order_amount >= 0),
  expires_at TIMESTAMP,
  usage_limit INT CHECK (usage_limit IS NULL OR usage_limit > 0),
  used_count INT NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);