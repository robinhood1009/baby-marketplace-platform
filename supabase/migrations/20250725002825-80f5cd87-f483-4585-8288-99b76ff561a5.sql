-- Update offers table to use vendor_id instead of brand_id
-- First, add vendor_id column to offers
ALTER TABLE public.offers ADD COLUMN vendor_id uuid;

-- Copy data from brand_id relationships to vendor_id
UPDATE public.offers 
SET vendor_id = brands.vendor_id 
FROM public.brands 
WHERE offers.brand_id = brands.id;

-- Drop the brand_id column from offers
ALTER TABLE public.offers DROP COLUMN brand_id;

-- Make vendor_id not null
ALTER TABLE public.offers ALTER COLUMN vendor_id SET NOT NULL;

-- Add brand_id to vendors table if it doesn't exist
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES public.brands(id);

-- Update RLS policies for offers to use vendor_id
DROP POLICY IF EXISTS "Vendors can manage offers for their brands" ON public.offers;

CREATE POLICY "Vendors can manage their own offers" 
ON public.offers 
FOR ALL 
USING (vendor_id IN ( 
  SELECT profiles.vendor_id
  FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'vendor'::user_role))
));