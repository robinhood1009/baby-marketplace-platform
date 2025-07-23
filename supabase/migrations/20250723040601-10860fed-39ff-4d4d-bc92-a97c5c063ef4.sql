-- Add category_id column to reference categories table
ALTER TABLE public.offers 
ADD COLUMN category_id UUID REFERENCES public.categories(id);

-- Create index for better performance
CREATE INDEX idx_offers_category_id ON public.offers(category_id);

-- Update existing offers to map text categories to category IDs
-- This assumes we have some default categories in the categories table
UPDATE public.offers 
SET category_id = (
  SELECT id FROM public.categories 
  WHERE LOWER(categories.name) = LOWER(offers.category) 
  OR LOWER(categories.slug) = LOWER(offers.category)
  LIMIT 1
);

-- After migration, you may want to drop the old category column and make category_id NOT NULL
-- This is commented out for safety - run these manually after verifying data migration
-- ALTER TABLE public.offers DROP COLUMN category;
-- ALTER TABLE public.offers ALTER COLUMN category_id SET NOT NULL;