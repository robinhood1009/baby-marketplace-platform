-- Add missing fields to offers table for discount tracking and pricing
ALTER TABLE public.offers 
ADD COLUMN discount_percent INTEGER,
ADD COLUMN price DECIMAL(10,2),
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for better performance on these new fields
CREATE INDEX idx_offers_discount_percent ON public.offers(discount_percent);
CREATE INDEX idx_offers_price ON public.offers(price);
CREATE INDEX idx_offers_expires_at ON public.offers(expires_at);