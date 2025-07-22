-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view active categories
CREATE POLICY "Anyone can view active categories" 
ON public.categories 
FOR SELECT 
USING (is_active = true);

-- Insert default categories
INSERT INTO public.categories (name, slug, description, display_order) VALUES
  ('Essentials', 'essentials', 'Baby essentials and necessities', 1),
  ('Feeding', 'feeding', 'Bottles, formula, baby food and feeding accessories', 2),
  ('Diapers', 'diapers', 'Diapers, wipes and diaper accessories', 3),
  ('Toys & Play', 'toys-play', 'Educational toys and play items for babies', 4),
  ('Care', 'care', 'Baby care products and skincare', 5),
  ('Health', 'health', 'Health and safety products for babies', 6),
  ('Clothing', 'clothing', 'Baby clothes and accessories', 7),
  ('Gear', 'gear', 'Strollers, car seats and baby gear', 8);

-- Add trigger for timestamps
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();