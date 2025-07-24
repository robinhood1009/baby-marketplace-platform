-- Create vendors table
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create brands table
CREATE TABLE public.brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on vendors table
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Enable RLS on brands table
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Create policies for vendors table
CREATE POLICY "Anyone can view vendors" 
ON public.vendors 
FOR SELECT 
USING (true);

CREATE POLICY "Vendors can update their own info" 
ON public.vendors 
FOR UPDATE 
USING (id IN (
  SELECT vendor_id FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'vendor'
));

CREATE POLICY "Vendors can insert their own info" 
ON public.vendors 
FOR INSERT 
WITH CHECK (true);

-- Create policies for brands table
CREATE POLICY "Anyone can view brands" 
ON public.brands 
FOR SELECT 
USING (true);

CREATE POLICY "Vendors can manage their own brands" 
ON public.brands 
FOR ALL 
USING (vendor_id IN (
  SELECT vendor_id FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'vendor'
));

-- Add vendor_id to profiles table
ALTER TABLE public.profiles ADD COLUMN vendor_id UUID REFERENCES public.vendors(id);

-- Create index for better performance
CREATE INDEX idx_brands_vendor_id ON public.brands(vendor_id);
CREATE INDEX idx_profiles_vendor_id ON public.profiles(vendor_id);

-- Add triggers for timestamp updates
CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update offers table to reference brands instead of vendor directly
ALTER TABLE public.offers DROP COLUMN IF EXISTS vendor_id;
ALTER TABLE public.offers DROP COLUMN IF EXISTS brand;
ALTER TABLE public.offers ADD COLUMN brand_id UUID REFERENCES public.brands(id);

-- Update offers policies to work with new structure
DROP POLICY IF EXISTS "Vendors can manage their own offers" ON public.offers;

CREATE POLICY "Vendors can manage offers for their brands" 
ON public.offers 
FOR ALL 
USING (brand_id IN (
  SELECT b.id FROM public.brands b
  JOIN public.profiles p ON b.vendor_id = p.vendor_id
  WHERE p.user_id = auth.uid() AND p.role = 'vendor'
));

-- Update ads table to reference vendors instead of profiles
ALTER TABLE public.ads DROP COLUMN IF EXISTS vendor_id;
ALTER TABLE public.ads ADD COLUMN vendor_id UUID REFERENCES public.vendors(id);

-- Update ads policies
DROP POLICY IF EXISTS "Vendors can create their own ads" ON public.ads;
DROP POLICY IF EXISTS "Vendors can update their own ads" ON public.ads;
DROP POLICY IF EXISTS "Vendors can view their own ads" ON public.ads;

CREATE POLICY "Vendors can create their own ads" 
ON public.ads 
FOR INSERT 
WITH CHECK (vendor_id IN (
  SELECT vendor_id FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'vendor'
));

CREATE POLICY "Vendors can update their own ads" 
ON public.ads 
FOR UPDATE 
USING (vendor_id IN (
  SELECT vendor_id FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'vendor'
));

CREATE POLICY "Vendors can view their own ads" 
ON public.ads 
FOR SELECT 
USING (vendor_id IN (
  SELECT vendor_id FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'vendor'
));