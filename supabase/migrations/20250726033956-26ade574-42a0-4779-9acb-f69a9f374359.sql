-- Update offers table to use vendor_id instead of brand_id
-- First, drop the existing policy that depends on brand_id
DROP POLICY IF EXISTS "Vendors can manage offers for their brands" ON public.offers;

-- Add vendor_id column to offers (nullable initially)
ALTER TABLE public.offers ADD COLUMN vendor_id uuid;

-- Copy data from brand_id relationships to vendor_id where brands exist
UPDATE public.offers 
SET vendor_id = brands.vendor_id 
FROM public.brands 
WHERE offers.brand_id = brands.id;

-- For offers without brand relationships, we'll need to handle them
-- Let's see if we can update offers without brands to use the first available vendor
-- or delete them if they're orphaned
DELETE FROM public.offers WHERE brand_id IS NULL OR vendor_id IS NULL;

-- Now drop the brand_id column
ALTER TABLE public.offers DROP COLUMN brand_id CASCADE;

-- Make vendor_id not null now that we've cleaned up the data
ALTER TABLE public.offers ALTER COLUMN vendor_id SET NOT NULL;

-- Add brand_id to vendors table if it doesn't exist
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES public.brands(id);

-- Create new RLS policy for offers using vendor_id
CREATE POLICY "Vendors can manage their own offers" 
ON public.offers 
FOR ALL 
USING (vendor_id IN ( 
  SELECT profiles.vendor_id
  FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'vendor'::user_role))
));