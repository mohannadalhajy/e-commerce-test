-- Seed data for Order API Assessment

-- Insert Users
-- First create users without referrals
INSERT INTO users (id, name, email, is_developer, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'John Doe', 'john@example.com', FALSE, NOW() - INTERVAL '30 days'),
  ('22222222-2222-2222-2222-222222222222', 'Jane Smith', 'jane@example.com', TRUE, NOW() - INTERVAL '25 days'),
  ('33333333-3333-3333-3333-333333333333', 'Admin User', 'admin@example.com', TRUE, NOW() - INTERVAL '40 days');

-- Then add users with referrals
INSERT INTO users (id, name, email, referred_by, is_developer, created_at)
VALUES 
  ('44444444-4444-4444-4444-444444444444', 'Bob Johnson', 'bob@example.com', '11111111-1111-1111-1111-111111111111', FALSE, NOW() - INTERVAL '20 days'),
  ('55555555-5555-5555-5555-555555555555', 'Alice Brown', 'alice@example.com', '11111111-1111-1111-1111-111111111111', FALSE, NOW() - INTERVAL '15 days'),
  ('66666666-6666-6666-6666-666666666666', 'Charlie Davis', 'charlie@example.com', '22222222-2222-2222-2222-222222222222', TRUE, NOW() - INTERVAL '10 days'),
  ('77777777-7777-7777-7777-777777777777', 'Diana Evans', 'diana@example.com', '44444444-4444-4444-4444-444444444444', FALSE, NOW() - INTERVAL '5 days');

-- Insert Products
INSERT INTO products (id, name, price, stock, created_at)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Laptop', 1299.99, 50, NOW() - INTERVAL '60 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Smartphone', 699.99, 100, NOW() - INTERVAL '50 days'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Headphones', 149.99, 200, NOW() - INTERVAL '40 days'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Tablet', 499.99, 75, NOW() - INTERVAL '30 days'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Smartwatch', 249.99, 150, NOW() - INTERVAL '20 days');

-- Insert Orders
INSERT INTO orders (id, user_id, total_amount, created_at)
VALUES 
  ('11111111-aaaa-1111-aaaa-111111111111', '11111111-1111-1111-1111-111111111111', 1299.99, NOW() - INTERVAL '25 days'),
  ('22222222-bbbb-2222-bbbb-222222222222', '22222222-2222-2222-2222-222222222222', 849.98, NOW() - INTERVAL '20 days'),
  ('33333333-cccc-3333-cccc-333333333333', '44444444-4444-4444-4444-444444444444', 1199.97, NOW() - INTERVAL '15 days'),
  ('44444444-dddd-4444-dddd-444444444444', '11111111-1111-1111-1111-111111111111', 749.98, NOW() - INTERVAL '10 days'),
  ('55555555-eeee-5555-eeee-555555555555', '55555555-5555-5555-5555-555555555555', 1949.97, NOW() - INTERVAL '5 days');

-- Insert Order Items
INSERT INTO order_items (id, order_id, product_id, quantity, price)
VALUES 
  (uuid_generate_v4(), '11111111-aaaa-1111-aaaa-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, 1299.99),
  
  (uuid_generate_v4(), '22222222-bbbb-2222-bbbb-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, 699.99),
  (uuid_generate_v4(), '22222222-bbbb-2222-bbbb-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 1, 149.99),
  
  (uuid_generate_v4(), '33333333-cccc-3333-cccc-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, 699.99),
  (uuid_generate_v4(), '33333333-cccc-3333-cccc-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 1, 499.98),
  
  (uuid_generate_v4(), '44444444-dddd-4444-dddd-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 1, 499.99),
  (uuid_generate_v4(), '44444444-dddd-4444-dddd-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 1, 249.99),
  
  (uuid_generate_v4(), '55555555-eeee-5555-eeee-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, 1299.99),
  (uuid_generate_v4(), '55555555-eeee-5555-eeee-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, 699.99);

-- Update stock levels to reflect orders
UPDATE products SET stock = stock - 1 WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'; -- Laptop (ordered twice)
UPDATE products SET stock = stock - 2 WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'; -- Smartphone (ordered twice)
UPDATE products SET stock = stock - 1 WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'; -- Headphones
UPDATE products SET stock = stock - 2 WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'; -- Tablet
UPDATE products SET stock = stock - 1 WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'; -- Smartwatch
