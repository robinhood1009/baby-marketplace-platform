-- Create click_logs table
CREATE TABLE public.click_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  offer_id UUID NOT NULL REFERENCES public.offers(id),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.click_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own click logs
CREATE POLICY "Users can view their own click logs" 
ON public.click_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for users to insert their own click logs
CREATE POLICY "Users can create their own click logs" 
ON public.click_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy for anonymous users to insert click logs
CREATE POLICY "Anonymous users can log clicks" 
ON public.click_logs 
FOR INSERT 
WITH CHECK (user_id IS NULL);

-- Create index for better performance
CREATE INDEX idx_click_logs_user_id ON public.click_logs(user_id);
CREATE INDEX idx_click_logs_offer_id ON public.click_logs(offer_id);
CREATE INDEX idx_click_logs_timestamp ON public.click_logs(timestamp);