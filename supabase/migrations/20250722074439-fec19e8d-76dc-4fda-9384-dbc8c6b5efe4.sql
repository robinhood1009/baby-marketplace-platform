-- Drop the incorrect RLS policy
DROP POLICY "Vendors can manage their own offers" ON public.offers;

-- Create the correct RLS policy that checks vendor profiles
CREATE POLICY "Vendors can manage their own offers" 
ON public.offers 
FOR ALL 
USING (
  vendor_id IN (
    SELECT id 
    FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'vendor'
  )
);