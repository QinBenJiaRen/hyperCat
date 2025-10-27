-- Add subscription fields to user_profiles table
-- Run this in Supabase SQL Editor

-- Add new columns for subscription management
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer 
ON public.user_profiles(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status 
ON public.user_profiles(subscription_status);

-- Add comment
COMMENT ON COLUMN public.user_profiles.subscription_plan IS 'User subscription plan: free, plus, pro';
COMMENT ON COLUMN public.user_profiles.subscription_status IS 'Stripe subscription status: active, canceled, past_due, etc.';
COMMENT ON COLUMN public.user_profiles.stripe_customer_id IS 'Stripe customer ID';
COMMENT ON COLUMN public.user_profiles.stripe_subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN public.user_profiles.subscription_current_period_end IS 'End date of current billing period';
