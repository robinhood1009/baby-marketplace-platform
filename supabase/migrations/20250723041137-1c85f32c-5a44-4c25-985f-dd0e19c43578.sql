-- First, properly update the category_id mapping with better logic
UPDATE public.offers 
SET category_id = (
  SELECT c.id FROM public.categories c 
  WHERE 
    -- Direct name match (case insensitive)
    LOWER(c.name) = LOWER(offers.category) 
    OR
    -- Match specific text patterns to category names
    (LOWER(offers.category) LIKE '%toy%' AND LOWER(c.name) = 'toys & play') OR
    (LOWER(offers.category) LIKE '%food%' AND LOWER(c.name) = 'feeding') OR
    (LOWER(offers.category) LIKE '%nutrition%' AND LOWER(c.name) = 'feeding') OR
    (LOWER(offers.category) LIKE '%health%' AND LOWER(c.name) = 'health') OR
    (LOWER(offers.category) LIKE '%safety%' AND LOWER(c.name) = 'health') OR
    (LOWER(offers.category) LIKE '%gear%' AND LOWER(c.name) = 'gear') OR
    (LOWER(offers.category) LIKE '%furniture%' AND LOWER(c.name) = 'gear') OR
    (LOWER(offers.category) LIKE '%cloth%' AND LOWER(c.name) = 'clothing') OR
    (LOWER(offers.category) LIKE '%care%' AND LOWER(c.name) = 'care') OR
    (LOWER(offers.category) LIKE '%diaper%' AND LOWER(c.name) = 'diapers') OR
    (LOWER(offers.category) LIKE '%essential%' AND LOWER(c.name) = 'essentials') OR
    (LOWER(offers.category) LIKE '%book%' AND LOWER(c.name) = 'essentials') OR
    (LOWER(offers.category) LIKE '%development%' AND LOWER(c.name) = 'toys & play')
  LIMIT 1
)
WHERE category_id IS NULL;