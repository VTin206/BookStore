ALTER TABLE books ADD COLUMN cost_price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (cost_price >= 0);
ALTER TABLE books ADD COLUMN minimum_stock INT NOT NULL DEFAULT 10 CHECK (minimum_stock >= 0);

CREATE TABLE suppliers (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL UNIQUE,
  contact_name VARCHAR(150),
  phone VARCHAR(30),
  email VARCHAR(255),
  address VARCHAR(500),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_receipts (
  id BIGSERIAL PRIMARY KEY,
  receipt_number VARCHAR(50) NOT NULL UNIQUE,
  supplier_id BIGINT REFERENCES suppliers(id),
  publisher_id BIGINT REFERENCES publishers(id),
  received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  note TEXT,
  total_cost NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (total_cost >= 0),
  created_by VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_receipt_items (
  id BIGSERIAL PRIMARY KEY,
  receipt_id BIGINT NOT NULL REFERENCES stock_receipts(id) ON DELETE CASCADE,
  book_id BIGINT NOT NULL REFERENCES books(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_cost NUMERIC(12,2) NOT NULL CHECK (unit_cost >= 0),
  line_total NUMERIC(14,2) NOT NULL CHECK (line_total >= 0),
  UNIQUE(receipt_id, book_id)
);

CREATE TABLE inventory_transactions (
  id BIGSERIAL PRIMARY KEY,
  book_id BIGINT NOT NULL REFERENCES books(id),
  transaction_type VARCHAR(30) NOT NULL,
  quantity_delta INT NOT NULL CHECK (quantity_delta <> 0),
  quantity_before INT NOT NULL CHECK (quantity_before >= 0),
  quantity_after INT NOT NULL CHECK (quantity_after >= 0),
  unit_cost NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (unit_cost >= 0),
  reason VARCHAR(500),
  reference_type VARCHAR(50),
  reference_id BIGINT,
  created_by VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_inventory_transactions_book_created ON inventory_transactions(book_id, created_at DESC);

CREATE TABLE stocktakes (
  id BIGSERIAL PRIMARY KEY,
  stocktake_number VARCHAR(50) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  note TEXT,
  created_by VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE stocktake_items (
  id BIGSERIAL PRIMARY KEY,
  stocktake_id BIGINT NOT NULL REFERENCES stocktakes(id) ON DELETE CASCADE,
  book_id BIGINT NOT NULL REFERENCES books(id),
  system_quantity INT NOT NULL CHECK (system_quantity >= 0),
  counted_quantity INT NOT NULL CHECK (counted_quantity >= 0),
  delta INT NOT NULL,
  reason VARCHAR(500),
  UNIQUE(stocktake_id, book_id)
);
