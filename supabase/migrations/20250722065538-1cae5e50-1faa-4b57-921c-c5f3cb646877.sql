-- Create ads table for paid advertisements
CREATE TABLE public.ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  stripe_session_id TEXT,
  paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Create policies for ads access
CREATE POLICY "Vendors can view their own ads" 
ON public.ads 
FOR SELECT 
USING (vendor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'vendor'));

CREATE POLICY "Vendors can create their own ads" 
ON public.ads 
FOR INSERT 
WITH CHECK (vendor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'vendor'));

CREATE POLICY "Vendors can update their own ads" 
ON public.ads 
FOR UPDATE 
USING (vendor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'vendor'));

-- Create policy for public to view active paid ads (for homepage banner)
CREATE POLICY "Anyone can view active paid ads" 
ON public.ads 
FOR SELECT 
USING (paid = true AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE);

-- Create indexes for better performance
CREATE INDEX idx_ads_vendor_id ON public.ads(vendor_id);
CREATE INDEX idx_ads_paid_dates ON public.ads(paid, start_date, end_date);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ads_updated_at
BEFORE UPDATE ON public.ads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();