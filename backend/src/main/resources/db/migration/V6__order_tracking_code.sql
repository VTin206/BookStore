ALTER TABLE orders ADD COLUMN tracking_code VARCHAR(32);
UPDATE orders SET tracking_code = 'ORD-' || LPAD(id::text, 8, '0') WHERE tracking_code IS NULL;
ALTER TABLE orders ALTER COLUMN tracking_code SET NOT NULL;
ALTER TABLE orders ADD CONSTRAINT uk_orders_tracking_code UNIQUE (tracking_code);
