-- Update some offers to use vendors that have brands
UPDATE offers 
SET vendor_id = (SELECT v.id FROM vendors v JOIN brands b ON v.id = b.vendor_id WHERE b.name = 'BabyBloom' LIMIT 1)
WHERE title IN ('Baby Sleep Training Guide', 'baby milk') 
AND status = 'approved';

UPDATE offers 
SET vendor_id = (SELECT v.id FROM vendors v JOIN brands b ON v.id = b.vendor_id WHERE b.name = 'PureBaby' LIMIT 1)
WHERE title IN ('Organic Baby Food Starter Set')
AND status = 'approved';

UPDATE offers 
SET vendor_id = (SELECT v.id FROM vendors v JOIN brands b ON v.id = b.vendor_id WHERE b.name = 'SafeStart' LIMIT 1)
WHERE title IN ('Baby Monitor with App', 'Natural Baby Skincare Bundle')
AND status = 'approved';