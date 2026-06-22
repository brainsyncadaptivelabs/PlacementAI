import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export const StorageService = {
  async uploadProfileImage(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    // Update the user's profile with the new avatar URL
    await supabase
      .from('users')
      .update({ avatar_url: data.publicUrl })
      .eq('id', userId);

    return data.publicUrl;
  },

  async uploadResumePDF(userId: string, resumeId: string, file: File) {
    const fileName = `${resumeId}-${Date.now()}.pdf`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('resume-exports')
      .upload(filePath, file, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Create an export record in the database
    const { data, error: dbError } = await supabase
      .from('exports')
      .insert({
        user_id: userId,
        resume_id: resumeId,
        file_url: filePath,
        export_type: 'pdf'
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return data;
  },

  async getSignedUrl(filePath: string, bucket: string = 'resume-exports') {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 60); // 60 seconds expiry

    if (error) throw error;
    return data.signedUrl;
  },

  async deleteFile(filePath: string, bucket: string = 'resume-exports') {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw error;
    return true;
  }
};
