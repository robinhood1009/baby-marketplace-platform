-- Add baby-related fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN baby_birthdate DATE,
ADD COLUMN baby_age TEXT;

-- Create an enum for baby age groups for better data consistency
CREATE TYPE public.baby_age_group AS ENUM (
  '0-3 months',
  '3-6 months', 
  '6-12 months',
  '1-2 years',
  '2-3 years',
  '3+ years'
);

-- Update the baby_age column to use the enum
ALTER TABLE public.profiles 
ALTER COLUMN baby_age TYPE baby_age_group USING baby_age::baby_age_group;