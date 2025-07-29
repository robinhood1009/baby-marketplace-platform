-- Add foreign key constraints to establish relationships between tables

-- Add foreign key from offers to vendors
ALTER TABLE public.offers 
ADD CONSTRAINT fk_offers_vendor_id 
FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);

-- Add foreign key from brands to vendors  
ALTER TABLE public.brands 
ADD CONSTRAINT fk_brands_vendor_id 
FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);

-- Add foreign key from offers to categories
ALTER TABLE public.offers 
ADD CONSTRAINT fk_offers_category_id 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

-- Add foreign key from favorites to offers
ALTER TABLE public.favorites 
ADD CONSTRAINT fk_favorites_offer_id 
FOREIGN KEY (offer_id) REFERENCES public.offers(id);

-- Add foreign key from click_logs to offers
ALTER TABLE public.click_logs 
ADD CONSTRAINT fk_click_logs_offer_id 
FOREIGN KEY (offer_id) REFERENCES public.offers(id);