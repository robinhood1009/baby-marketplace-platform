-- Create offers table
CREATE TABLE public.offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  age_range TEXT NOT NULL,
  category TEXT NOT NULL,
  affiliate_link TEXT,
  image_url TEXT,
  vendor_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to view approved offers (public access)
CREATE POLICY "Anyone can view approved offers" 
ON public.offers 
FOR SELECT 
USING (status = 'approved');

-- Create policy for vendors to manage their own offers
CREATE POLICY "Vendors can manage their own offers" 
ON public.offers 
FOR ALL 
USING (auth.uid() = vendor_id);

-- Create indexes for better performance
CREATE INDEX idx_offers_status ON public.offers(status);
CREATE INDEX idx_offers_age_range ON public.offers(age_range);
CREATE INDEX idx_offers_category ON public.offers(category);
CREATE INDEX idx_offers_is_featured ON public.offers(is_featured);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_offers_updated_at
BEFORE UPDATE ON public.offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();