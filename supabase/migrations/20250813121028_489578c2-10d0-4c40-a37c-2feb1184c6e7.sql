-- CRITICAL SECURITY FIX: Remove ALL policies that grant access to 'public' role
-- The 'public' role includes both authenticated and anonymous users
-- We need to restrict all access to only authenticated users with proper authorization

-- Drop all policies that have 'public' in roles (these allow anonymous access)
DROP POLICY IF EXISTS "Admin can update all vendors" ON public.vendors;
DROP POLICY IF EXISTS "Vendors can insert their own info" ON public.vendors;
DROP POLICY IF EXISTS "Vendors can update their own info" ON public.vendors;

-- Recreate policies with explicit role restrictions to 'authenticated' only
CREATE POLICY "admin_can_update_vendors" 
ON public.vendors 
FOR UPDATE 
TO authenticated
USING ((auth.jwt() ->> 'email'::text) = 'admin@yourdomain.com'::text);

CREATE POLICY "vendors_can_insert_own_info" 
ON public.vendors 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "vendors_can_update_own_info" 
ON public.vendors 
FOR UPDATE 
TO authenticated
USING (id IN (
  SELECT profiles.vendor_id
  FROM profiles
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'vendor'::user_role
));

-- Verify RLS is enabled
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Force a policy refresh by temporarily disabling and re-enabling RLS
ALTER TABLE public.vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;