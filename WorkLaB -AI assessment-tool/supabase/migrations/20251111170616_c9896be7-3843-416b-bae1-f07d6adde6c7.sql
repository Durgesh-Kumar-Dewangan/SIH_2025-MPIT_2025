-- Create table for storing class schedules
CREATE TABLE public.class_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  schedule_data JSONB,
  analyzed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for study sessions
CREATE TABLE public.study_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  course_name TEXT,
  location TEXT,
  session_type TEXT NOT NULL DEFAULT 'study',
  color TEXT DEFAULT 'hsl(var(--primary))',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for class_schedules
CREATE POLICY "Users can view their own schedules"
  ON public.class_schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own schedules"
  ON public.class_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules"
  ON public.class_schedules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules"
  ON public.class_schedules FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for study_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.study_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON public.study_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.study_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON public.study_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for schedules if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('schedules', 'schedules', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for schedules
CREATE POLICY "Users can view their own schedule files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'schedules' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own schedule files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'schedules' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own schedule files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'schedules' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own schedule files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'schedules' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Trigger for updated_at
CREATE TRIGGER update_class_schedules_updated_at
  BEFORE UPDATE ON public.class_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_study_sessions_updated_at
  BEFORE UPDATE ON public.study_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();