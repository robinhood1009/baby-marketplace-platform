-- Create favorites table
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, offer_id)
);

-- Enable Row Level Security
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own favorites
CREATE POLICY "Users can view their own favorites" 
ON public.favorites 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for users to manage their own favorites
CREATE POLICY "Users can manage their own favorites" 
ON public.favorites 
FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_offer_id ON public.favorites(offer_id);
CREATE INDEX idx_favorites_user_offer ON public.favorites(user_id, offer_id);