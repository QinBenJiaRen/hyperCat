-- =====================================================
-- HypeCat AI - Database Setup for User System
-- =====================================================
-- Execute this SQL in your Supabase SQL Editor
-- =====================================================

-- 1. Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create social media authorizations table
CREATE TABLE IF NOT EXISTS public.social_authorizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'x')),
  account_id TEXT NOT NULL,
  account_name TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform, account_id)
);

-- 3. Create content calendar events table
CREATE TABLE IF NOT EXISTS public.content_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  promotional_content TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'x')),
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'failed')),
  published_at TIMESTAMP WITH TIME ZONE,
  post_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create publishing history table
CREATE TABLE IF NOT EXISTS public.publishing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'x')),
  content TEXT NOT NULL,
  post_id TEXT,
  post_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Indexes for better performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_social_auth_user_platform 
ON public.social_authorizations(user_id, platform);

CREATE INDEX IF NOT EXISTS idx_content_events_user_date 
ON public.content_events(user_id, scheduled_date);

CREATE INDEX IF NOT EXISTS idx_publishing_history_user 
ON public.publishing_history(user_id, created_at DESC);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publishing_history ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.user_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Social authorizations policies
CREATE POLICY "Users can view own authorizations" 
ON public.social_authorizations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own authorizations" 
ON public.social_authorizations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own authorizations" 
ON public.social_authorizations FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own authorizations" 
ON public.social_authorizations FOR DELETE 
USING (auth.uid() = user_id);

-- Content events policies
CREATE POLICY "Users can view own content events" 
ON public.content_events FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content events" 
ON public.content_events FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content events" 
ON public.content_events FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own content events" 
ON public.content_events FOR DELETE 
USING (auth.uid() = user_id);

-- Publishing history policies
CREATE POLICY "Users can view own publishing history" 
ON public.publishing_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own publishing history" 
ON public.publishing_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- Triggers for updated_at timestamps
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at 
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_authorizations_updated_at 
BEFORE UPDATE ON public.social_authorizations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_events_updated_at 
BEFORE UPDATE ON public.content_events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Function to automatically create user profile on signup
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Setup Complete!
-- =====================================================
-- Next steps:
-- 1. Configure Supabase Auth settings in your dashboard
-- 2. Enable Email provider
-- 3. Update your .env.local with Supabase credentials
-- =====================================================
