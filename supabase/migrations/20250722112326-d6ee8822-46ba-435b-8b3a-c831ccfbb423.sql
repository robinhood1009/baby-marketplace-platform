-- Add new columns to ads table for enhanced ad functionality
ALTER TABLE public.ads ADD COLUMN image_url TEXT;
ALTER TABLE public.ads ADD COLUMN link_url TEXT;
ALTER TABLE public.ads ADD COLUMN headline TEXT;

-- Create storage bucket for ad banner images
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-banners', 'ad-banners', true);

-- Create storage policies for ad banner uploads
CREATE POLICY "Anyone can view ad banners" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'ad-banners');

CREATE POLICY "Vendors can upload ad banners" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'ad-banners' AND auth.uid() IS NOT NULL);

CREATE POLICY "Vendors can update their own ad banners" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'ad-banners' AND auth.uid() IS NOT NULL);

CREATE POLICY "Vendors can delete their own ad banners" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'ad-banners' AND auth.uid() IS NOT NULL);

-- Add index for better performance on paid active ads
CREATE INDEX idx_ads_paid_active ON public.ads (paid, start_date, end_date) WHERE paid = true;