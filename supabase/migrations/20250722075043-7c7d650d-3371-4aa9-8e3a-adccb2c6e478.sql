-- Create admin policy to allow admin user to view all offers
CREATE POLICY "Admin can view all offers" 
ON public.offers 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'admin@yourdomain.com'
  )
);

-- Create admin policy to allow admin user to update all offers
CREATE POLICY "Admin can update all offers" 
ON public.offers 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'admin@yourdomain.com'
  )
);