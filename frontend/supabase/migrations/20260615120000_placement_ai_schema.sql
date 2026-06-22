-- Migration: Complete Supabase Integration for PlacementAI

-- 1. Create Tables
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    template_id TEXT NOT NULL DEFAULT 'placementai-educator',
    resume_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.resume_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
    version_number INTEGER NOT NULL,
    resume_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
    file_url TEXT NOT NULL,
    export_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Users Policies
CREATE POLICY "Users can view own record" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own record" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Resumes Policies
CREATE POLICY "Users can view own resumes" ON public.resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resumes" ON public.resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resumes" ON public.resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resumes" ON public.resumes FOR DELETE USING (auth.uid() = user_id);

-- Resume Versions Policies
CREATE POLICY "Users can manage own resume versions" ON public.resume_versions
    FOR ALL USING (EXISTS (SELECT 1 FROM public.resumes WHERE resumes.id = resume_versions.resume_id AND resumes.user_id = auth.uid()));

-- Exports Policies
CREATE POLICY "Users can view own exports" ON public.exports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own exports" ON public.exports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own exports" ON public.exports FOR DELETE USING (auth.uid() = user_id);

-- 4. Enable Realtime
-- Important: Use publication supabase_realtime
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.resumes;

-- 5. Auto Update Timestamp Trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_resumes_modtime
    BEFORE UPDATE ON public.resumes
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_users_modtime
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 6. Auto-Create User Profile on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Create Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('resume-exports', 'resume-exports', false);

-- 8. Storage RLS Policies
-- profile-images (Public view, Authenticated owners can manage)
CREATE POLICY "Profile images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');
CREATE POLICY "Users can upload their own profile image." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.uid() = owner);
CREATE POLICY "Users can update their own profile image." ON storage.objects FOR UPDATE USING (bucket_id = 'profile-images' AND auth.uid() = owner);
CREATE POLICY "Users can delete their own profile image." ON storage.objects FOR DELETE USING (bucket_id = 'profile-images' AND auth.uid() = owner);

-- resume-exports (Private, Authenticated owners only)
CREATE POLICY "Users can access their own private exports." ON storage.objects FOR SELECT USING (bucket_id = 'resume-exports' AND auth.uid() = owner);
CREATE POLICY "Users can upload to their own private exports." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resume-exports' AND auth.uid() = owner);
CREATE POLICY "Users can update their own private exports." ON storage.objects FOR UPDATE USING (bucket_id = 'resume-exports' AND auth.uid() = owner);
CREATE POLICY "Users can delete their own private exports." ON storage.objects FOR DELETE USING (bucket_id = 'resume-exports' AND auth.uid() = owner);
