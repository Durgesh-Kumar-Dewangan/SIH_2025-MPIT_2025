
-- Migration: 20251108161207

-- Migration: 20251107140530

-- Migration: 20251101162819
-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create theme_settings table
CREATE TABLE public.theme_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  background_color TEXT DEFAULT 'hsl(0 0% 100%)',
  template_color TEXT DEFAULT 'hsl(0 0% 100%)',
  logo_color TEXT DEFAULT 'hsl(221.2 83.2% 53.3%)',
  button_colors JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for theme_settings
CREATE POLICY "Users can view their own theme settings" 
ON public.theme_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own theme settings" 
ON public.theme_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own theme settings" 
ON public.theme_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for theme_settings timestamp updates
CREATE TRIGGER update_theme_settings_updated_at
BEFORE UPDATE ON public.theme_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migration: 20251102180140
-- Add new fields to profiles table for student information
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS social_media_id TEXT,
ADD COLUMN IF NOT EXISTS institute_enrollment TEXT;

-- Update the handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, social_media_id, institute_enrollment)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'social_media_id',
    NEW.raw_user_meta_data->>'institute_enrollment'
  );
  RETURN NEW;
END;
$function$;

-- Migration: 20251102181052
-- Add new profile fields for the enhanced profile view
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS introduction TEXT,
ADD COLUMN IF NOT EXISTS posts_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- Migration: 20251103082836
-- Add additional profile fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS introduction text,
ADD COLUMN IF NOT EXISTS posts_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS followers_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS facebook_url text,
ADD COLUMN IF NOT EXISTS twitter_url text,
ADD COLUMN IF NOT EXISTS instagram_url text,
ADD COLUMN IF NOT EXISTS youtube_url text;

-- Migration: 20251103083635
-- Create table for hosted exam sessions
CREATE TABLE public.hosted_exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assessment_data JSONB NOT NULL,
  scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  access_code TEXT NOT NULL UNIQUE,
  allow_late_submission BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for student exam sessions
CREATE TABLE public.student_exam_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hosted_exam_id UUID NOT NULL REFERENCES public.hosted_exams(id) ON DELETE CASCADE,
  student_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  student_email TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  answers JSONB,
  score NUMERIC,
  evaluation_result JSONB,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'in_progress', 'submitted', 'evaluated')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hosted_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_exam_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for hosted_exams
CREATE POLICY "Users can view their own hosted exams"
  ON public.hosted_exams FOR SELECT
  USING (auth.uid() = host_user_id);

CREATE POLICY "Users can create their own hosted exams"
  ON public.hosted_exams FOR INSERT
  WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Users can update their own hosted exams"
  ON public.hosted_exams FOR UPDATE
  USING (auth.uid() = host_user_id);

CREATE POLICY "Users can delete their own hosted exams"
  ON public.hosted_exams FOR DELETE
  USING (auth.uid() = host_user_id);

-- Policies for student_exam_sessions
CREATE POLICY "Hosts can view sessions for their exams"
  ON public.student_exam_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.hosted_exams
      WHERE hosted_exams.id = student_exam_sessions.hosted_exam_id
      AND hosted_exams.host_user_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own sessions"
  ON public.student_exam_sessions FOR SELECT
  USING (auth.uid() = student_user_id);

CREATE POLICY "Anyone can create a session (for exam access)"
  ON public.student_exam_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Students can update their own sessions"
  ON public.student_exam_sessions FOR UPDATE
  USING (auth.uid() = student_user_id OR student_user_id IS NULL);

-- Add trigger for updated_at
CREATE TRIGGER update_hosted_exams_updated_at
  BEFORE UPDATE ON public.hosted_exams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_exam_sessions_updated_at
  BEFORE UPDATE ON public.student_exam_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for student sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_exam_sessions;

-- Function to generate unique access codes
CREATE OR REPLACE FUNCTION public.generate_access_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    SELECT EXISTS(SELECT 1 FROM public.hosted_exams WHERE access_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$;

-- Migration: 20251103083706
-- Fix search_path for generate_access_code function
DROP FUNCTION IF EXISTS public.generate_access_code();

CREATE OR REPLACE FUNCTION public.generate_access_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    SELECT EXISTS(SELECT 1 FROM public.hosted_exams WHERE access_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$;

-- Migration: 20251105104604
-- Create lab_works table for code sharing
CREATE TABLE public.lab_works (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  output TEXT,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lab_works ENABLE ROW LEVEL SECURITY;

-- Create policies for lab_works
CREATE POLICY "Lab works are viewable by everyone" 
ON public.lab_works 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own lab works" 
ON public.lab_works 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lab works" 
ON public.lab_works 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lab works" 
ON public.lab_works 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_lab_works_updated_at
BEFORE UPDATE ON public.lab_works
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migration: 20251106095830
-- Add foreign key constraint from lab_works to profiles
ALTER TABLE public.lab_works
ADD CONSTRAINT lab_works_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;


-- Migration: 20251108160149
-- Trigger types regeneration by adding a comment to profiles table
COMMENT ON TABLE public.profiles IS 'User profile information';

-- Ensure all tables have proper comments for better documentation
COMMENT ON TABLE public.lab_works IS 'User lab work submissions';
COMMENT ON TABLE public.hosted_exams IS 'Hosted exam configurations';
COMMENT ON TABLE public.student_exam_sessions IS 'Student exam session records';
COMMENT ON TABLE public.theme_settings IS 'User theme preferences';

