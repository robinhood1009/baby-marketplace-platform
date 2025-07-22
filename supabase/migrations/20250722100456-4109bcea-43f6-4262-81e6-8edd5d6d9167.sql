-- Add sample data to existing offers to demonstrate discount/price/expiry functionality
UPDATE offers 
SET 
  discount_percent = 25,
  price = 19.99,
  expires_at = NOW() + INTERVAL '7 days'
WHERE id = 'fc09a5ba-5db3-4d04-8261-92266dc41a18';

UPDATE offers 
SET 
  discount_percent = 30,
  price = 0,
  expires_at = NOW() + INTERVAL '3 days'
WHERE id = '3f0640d6-0513-45c8-9efc-dfb6b19ea948';

UPDATE offers 
SET 
  discount_percent = NULL,
  price = 0,
  expires_at = NOW() + INTERVAL '5 days'
WHERE id = '56bf205b-6337-4527-a6ef-368e0486717f';

UPDATE offers 
SET 
  discount_percent = 15,
  price = 29.99,
  expires_at = NOW() + INTERVAL '10 days'
WHERE id = 'd072a97d-4b03-4d52-b0e3-f2d93f453dba';

UPDATE offers 
SET 
  discount_percent = NULL,
  price = 12.99,
  expires_at = NULL
WHERE id = '76beaac5-1fc5-4d99-acaa-2111aabb5567';