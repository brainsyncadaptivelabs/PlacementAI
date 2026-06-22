-- Migration: Initial Supabase Setup for BrainSync Resume Builder

-- 1. Create tables
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    template_id TEXT NOT NULL DEFAULT 'placementai-educator',
    resume_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.resume_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
    version_name TEXT NOT NULL,
    snapshot_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Resumes Policies
CREATE POLICY "Users can view own resumes" ON public.resumes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes" ON public.resumes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes" ON public.resumes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes" ON public.resumes
    FOR DELETE USING (auth.uid() = user_id);

-- Resume Versions Policies
CREATE POLICY "Users can manage own resume versions" ON public.resume_versions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.resumes 
            WHERE resumes.id = resume_versions.resume_id 
            AND resumes.user_id = auth.uid()
        )
    );

-- 4. Enable Realtime
-- To enable realtime auto-save and collaboration, we add tables to the publication
alter publication supabase_realtime add table public.resumes;

-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_resume_update
    BEFORE UPDATE ON public.resumes
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER on_profile_update
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- 6. Trigger to automatically create a profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
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
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('exports', 'exports', false);

-- 8. Storage RLS Policies

-- Profile Images (Publicly readable, only owner can upload/update/delete)
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-images');
CREATE POLICY "Users can upload their own avatars." ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.uid() = owner);
CREATE POLICY "Users can update their own avatars." ON storage.objects
    FOR UPDATE USING (bucket_id = 'profile-images' AND auth.uid() = owner);

-- Resumes and Exports (Private, only owner can access)
CREATE POLICY "Users can access their own private storage." ON storage.objects
    FOR ALL USING (
        (bucket_id = 'resumes' OR bucket_id = 'exports') 
        AND auth.uid() = owner
    );
