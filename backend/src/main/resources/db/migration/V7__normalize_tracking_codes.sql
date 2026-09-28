UPDATE orders SET tracking_code = upper(substr(md5(random()::text || id::text), 1, 10));
