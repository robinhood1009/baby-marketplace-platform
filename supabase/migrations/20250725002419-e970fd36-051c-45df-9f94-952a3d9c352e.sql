-- Check if there's a trigger that's overriding the role
-- Let's drop the old trigger and function that sets default role to 'mother'
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();