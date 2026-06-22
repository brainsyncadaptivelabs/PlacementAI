import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ResumeService } from '@/services/resume.service';

const SAVE_DELAY_MS = 3000; // Debounce 3 seconds

export function useResumeAutoSave(resumeId: string | null, initialState: any) {
  const [data, setData] = useState(initialState);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  // 1. Debounced Auto-Save
  useEffect(() => {
    if (!resumeId) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setSaveStatus('idle');

    timerRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await ResumeService.updateResume(resumeId, {
          resume_data: data
        });
        setSaveStatus('saved');
      } catch (err) {
        console.error('Failed to auto-save resume:', err);
        setSaveStatus('error');
      }
    }, SAVE_DELAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, resumeId]);

  // 2. Realtime Synchronization
  useEffect(() => {
    if (!resumeId) return;

    const channel = supabase
      .channel(`resume-${resumeId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'resumes',
          filter: `id=eq.${resumeId}`
        },
        (payload) => {
          // If the payload matches what we have, skip to avoid loops.
          // Otherwise, update the state with the incoming remote changes.
          const newData = payload.new.resume_data;
          
          // Basic deep equality check avoidance could go here
          // setData(newData);
          console.log("Realtime update received", payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [resumeId, supabase]);

  return {
    data,
    setData,
    saveStatus
  };
}
