-- Drop the existing admin policies that access auth.users
DROP POLICY "Admin can view all offers" ON public.offers;
DROP POLICY "Admin can update all offers" ON public.offers;

-- Create new admin policies using JWT token
CREATE POLICY "Admin can view all offers" 
ON public.offers 
FOR SELECT 
USING (
  (auth.jwt() ->> 'email') = 'admin@yourdomain.com'
);

CREATE POLICY "Admin can update all offers" 
ON public.offers 
FOR UPDATE 
USING (
  (auth.jwt() ->> 'email') = 'admin@yourdomain.com'
);