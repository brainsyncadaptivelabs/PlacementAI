import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';

type ResumeRow = Database['public']['Tables']['resumes']['Row'];
type ResumeInsert = Database['public']['Tables']['resumes']['Insert'];
type ResumeUpdate = Database['public']['Tables']['resumes']['Update'];

const supabase = createClient();

export const ResumeService = {
  async createResume(data: ResumeInsert) {
    const { data: resume, error } = await supabase
      .from('resumes')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return resume;
  },

  async getResume(id: string) {
    const { data: resume, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return resume;
  },

  async getAllResumes(userId: string) {
    const { data: resumes, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return resumes;
  },

  async updateResume(id: string, data: ResumeUpdate) {
    const { data: resume, error } = await supabase
      .from('resumes')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return resume;
  },

  async deleteResume(id: string) {
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async saveVersion(resumeId: string, versionNumber: number, resumeData: any) {
    const { data, error } = await supabase
      .from('resume_versions')
      .insert({
        resume_id: resumeId,
        version_number: versionNumber,
        resume_data: resumeData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
