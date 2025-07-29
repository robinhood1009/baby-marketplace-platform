-- Insert template vendors
INSERT INTO public.vendors (id, name, email, phone, address) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'BabyFirst Co.', 'contact@babyfirst.com', '+1-555-0101', '123 Baby Street, Infant City, BC 12345'),
  ('550e8400-e29b-41d4-a716-446655440002', 'TinyToes Ltd.', 'hello@tinytoes.com', '+1-555-0102', '456 Toddler Ave, Little Town, LT 67890'),
  ('550e8400-e29b-41d4-a716-446655440003', 'LittleSteps Inc.', 'support@littlesteps.com', '+1-555-0103', '789 Growth Blvd, Development City, DC 13579'),
  ('550e8400-e29b-41d4-a716-446655440004', 'BabyBloom Co.', 'info@babybloom.com', '+1-555-0104', '321 Blossom Rd, Bloom Valley, BV 24680'),
  ('550e8400-e29b-41d4-a716-446655440005', 'CuddleCare Ltd.', 'care@cuddlecare.com', '+1-555-0105', '654 Comfort Lane, Snuggle Springs, SS 97531'),
  ('550e8400-e29b-41d4-a716-446655440006', 'SafeStart Inc.', 'safety@safestart.com', '+1-555-0106', '987 Security St, Protection Plaza, PP 86420'),
  ('550e8400-e29b-41d4-a716-446655440007', 'PureBaby Co.', 'pure@purebaby.com', '+1-555-0107', '147 Clean Court, Pure Paradise, PP 75319'),
  ('550e8400-e29b-41d4-a716-446655440008', 'GrowthGear Ltd.', 'grow@growthgear.com', '+1-555-0108', '258 Development Dr, Progress Park, PP 64208');

-- Insert template brands
INSERT INTO public.brands (id, name, image_url, vendor_id) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'BabyFirst', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&h=100&fit=crop', '550e8400-e29b-41d4-a716-446655440001'),
  ('650e8400-e29b-41d4-a716-446655440002', 'TinyToes', 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=200&h=100&fit=crop', '550e8400-e29b-41d4-a716-446655440002'),
  ('650e8400-e29b-41d4-a716-446655440003', 'LittleSteps', 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=200&h=100&fit=crop', '550e8400-e29b-41d4-a716-446655440003'),
  ('650e8400-e29b-41d4-a716-446655440004', 'BabyBloom', 'https://images.unsplash.com/photo-1612461100946-2b706fe6a042?w=200&h=100&fit=crop', '550e8400-e29b-41d4-a716-446655440004'),
  ('650e8400-e29b-41d4-a716-446655440005', 'CuddleCare', 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=200&h=100&fit=crop', '550e8400-e29b-41d4-a716-446655440005'),
  ('650e8400-e29b-41d4-a716-446655440006', 'SafeStart', 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=200&h=100&fit=crop', '550e8400-e29b-41d4-a716-446655440006'),
  ('650e8400-e29b-41d4-a716-446655440007', 'PureBaby', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=100&fit=crop', '550e8400-e29b-41d4-a716-446655440007'),
  ('650e8400-e29b-41d4-a716-446655440008', 'GrowthGear', 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=200&h=100&fit=crop', '550e8400-e29b-41d4-a716-446655440008');

-- Link brands to vendors
UPDATE public.vendors SET brand_id = '650e8400-e29b-41d4-a716-446655440001' WHERE id = '550e8400-e29b-41d4-a716-446655440001';
UPDATE public.vendors SET brand_id = '650e8400-e29b-41d4-a716-446655440002' WHERE id = '550e8400-e29b-41d4-a716-446655440002';
UPDATE public.vendors SET brand_id = '650e8400-e29b-41d4-a716-446655440003' WHERE id = '550e8400-e29b-41d4-a716-446655440003';
UPDATE public.vendors SET brand_id = '650e8400-e29b-41d4-a716-446655440004' WHERE id = '550e8400-e29b-41d4-a716-446655440004';
UPDATE public.vendors SET brand_id = '650e8400-e29b-41d4-a716-446655440005' WHERE id = '550e8400-e29b-41d4-a716-446655440005';
UPDATE public.vendors SET brand_id = '650e8400-e29b-41d4-a716-446655440006' WHERE id = '550e8400-e29b-41d4-a716-446655440006';
UPDATE public.vendors SET brand_id = '650e8400-e29b-41d4-a716-446655440007' WHERE id = '550e8400-e29b-41d4-a716-446655440007';
UPDATE public.vendors SET brand_id = '650e8400-e29b-41d4-a716-446655440008' WHERE id = '550e8400-e29b-41d4-a716-446655440008';