-- Admin enhancements migration
-- 1) Extend contact_messages for admin inbox
ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS subject text,
  ADD COLUMN IF NOT EXISTS is_read boolean NOT NULL DEFAULT false;

-- 2) Extend profiles for admin user management
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- 3) Extend vendors for suspension
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS suspended boolean NOT NULL DEFAULT false;

-- 4) RLS policies for admin control using email match
-- Offers: allow admin delete in addition to existing update/select
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'offers' AND policyname = 'Admin can delete all offers'
  ) THEN
    CREATE POLICY "Admin can delete all offers"
    ON public.offers
    FOR DELETE
    USING ((auth.jwt() ->> 'email') = 'admin@yourdomain.com');
  END IF;
END $$;

-- Ads: admin view and update all ads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ads' AND policyname = 'Admin can view all ads'
  ) THEN
    CREATE POLICY "Admin can view all ads"
    ON public.ads
    FOR SELECT
    USING ((auth.jwt() ->> 'email') = 'admin@yourdomain.com');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ads' AND policyname = 'Admin can update all ads'
  ) THEN
    CREATE POLICY "Admin can update all ads"
    ON public.ads
    FOR UPDATE
    USING ((auth.jwt() ->> 'email') = 'admin@yourdomain.com');
  END IF;
END $$;

-- Categories: admin full CRUD
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Admin can insert categories'
  ) THEN
    CREATE POLICY "Admin can insert categories"
    ON public.categories
    FOR INSERT
    WITH CHECK ((auth.jwt() ->> 'email') = 'admin@yourdomain.com');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Admin can update categories'
  ) THEN
    CREATE POLICY "Admin can update categories"
    ON public.categories
    FOR UPDATE
    USING ((auth.jwt() ->> 'email') = 'admin@yourdomain.com');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Admin can delete categories'
  ) THEN
    CREATE POLICY "Admin can delete categories"
    ON public.categories
    FOR DELETE
    USING ((auth.jwt() ->> 'email') = 'admin@yourdomain.com');
  END IF;
END $$;

-- Contact messages: admin view/update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'contact_messages' AND policyname = 'Admin can view all contact messages'
  ) THEN
    CREATE POLICY "Admin can view all contact messages"
    ON public.contact_messages
    FOR SELECT
    USING ((auth.jwt() ->> 'email') = 'admin@yourdomain.com');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'contact_messages' AND policyname = 'Admin can update contact messages'
  ) THEN
    CREATE POLICY "Admin can update contact messages"
    ON public.contact_messages
    FOR UPDATE
    USING ((auth.jwt() ->> 'email') = 'admin@yourdomain.com');
  END IF;
END $$;

-- Vendors: admin can update (e.g., suspend)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'vendors' AND policyname = 'Admin can update all vendors'
  ) THEN
    CREATE POLICY "Admin can update all vendors"
    ON public.vendors
    FOR UPDATE
    USING ((auth.jwt() ->> 'email') = 'admin@yourdomain.com');
  END IF;
END $$;

-- Profiles: admin can view and update any profile (role changes, deactivate)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Admin can view all profiles'
  ) THEN
    CREATE POLICY "Admin can view all profiles"
    ON public.profiles
    FOR SELECT
    USING ((auth.jwt() ->> 'email') = 'admin@yourdomain.com');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Admin can update all profiles'
  ) THEN
    CREATE POLICY "Admin can update all profiles"
    ON public.profiles
    FOR UPDATE
    USING ((auth.jwt() ->> 'email') = 'admin@yourdomain.com');
  END IF;
END $$;