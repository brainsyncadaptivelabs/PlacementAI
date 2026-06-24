"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Plus, Edit2, Trash2, FileText, CheckCircle2 } from "lucide-react";
import { ACTIVE_TEMPLATES, TEMPLATE_REGISTRY } from "@/lib/resume/templates/templates";
import { ResumeState } from "@/lib/resume/templates/placementai-educator/schema";
import { ResumeService } from "@/services/resume.service";
import { useAuth } from "@/hooks/use-auth";

interface ResumeDto {
  id: string;
  title: string;
  template_id: string;
  resume_data: any;
}

export default function ResumeBuilderPortal() {
  const router = useRouter();
  const { user } = useAuth();
  const [resumes, setResumes] = useState<ResumeDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResumes = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await ResumeService.getAllResumes(user.id);
      setResumes(response as ResumeDto[]);
    } catch (err) {
      console.error("Failed to fetch resumes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this resume?")) return;
    setLoading(true);
    try {
      await ResumeService.deleteResume(id);
      fetchResumes();
    } catch (err) {
      console.error("Failed to delete resume", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditResume = (resume: ResumeDto) => {
    const templateId = resume.template_id || "placementai-educator";
    const reg = TEMPLATE_REGISTRY[templateId] || TEMPLATE_REGISTRY["placementai-educator"];

    // The data is natively JSON now due to Supabase JSONB
    const parsedState: ResumeState = resume.resume_data || { ...reg.initialState };

    // Set draft data in local storage
    localStorage.setItem("placementai_resume_draft", JSON.stringify(parsedState));
    localStorage.setItem("placementai_template", templateId);
    
    // Redirect to editor
    router.push(`/dashboard/resume-builder/editor?template=${templateId}&id=${resume.id}`);
  };

  if (loading && resumes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-650" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Resume Builder</h1>
          <p className="text-muted-foreground mt-1">Create and manage high-fidelity professional resumes with AI feedback.</p>
        </div>
        <Button 
          onClick={() => router.push("/dashboard/resume-builder/templates")} 
          className="rounded-xl bg-slate-900 text-white hover:bg-indigo-650 py-5 text-xs font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> New Resume
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resumes.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-16 bg-card rounded-2xl border border-border shadow-sm text-center">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-650 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No resumes created yet</h3>
            <p className="text-muted-foreground/70 mt-1 max-w-xs">Start building your first job-winning professional resume today.</p>
            <Button 
              onClick={() => router.push("/dashboard/resume-builder/templates")} 
              className="mt-6 rounded-xl bg-slate-900 text-white font-bold px-6 py-4 text-xs hover:bg-indigo-650 transition-colors"
            >
              Select a Template
            </Button>
          </div>
        ) : (
          resumes.map((resume) => {
            const template = ACTIVE_TEMPLATES.find(t => t.id === resume.template_id);
            const templateName = template ? template.name : "Custom Template";
            const atsScore = template ? template.atsScore : 90;
            
            const fullName = resume.resume_data?.personalInfo?.name || "Candidate";
            const summary = resume.resume_data?.summary || "No summary provided.";

            return (
              <Card 
                key={resume.id} 
                onClick={() => handleEditResume(resume)}
                className="group border border-border hover:border-indigo-150 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.04)] transition-all duration-300 rounded-2xl cursor-pointer bg-card relative flex flex-col justify-between"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold text-foreground group-hover:text-indigo-650 transition-colors leading-tight">
                      {resume.title || "Untitled Resume"}
                    </CardTitle>
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditResume(resume)}
                        className="w-8 h-8 rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-muted"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => handleDelete(e, resume.id)}
                        className="w-8 h-8 rounded-lg text-muted-foreground/70 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-xs font-semibold text-muted-foreground/70 flex items-center gap-1.5 mt-0.5">
                    <span>Template: {templateName}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="text-xs font-medium text-muted-foreground line-clamp-2 leading-relaxed">
                    {summary}
                  </div>
                </CardContent>
                <CardFooter className="border-t border-border/50 bg-muted/30 flex justify-between items-center py-3.5 rounded-b-2xl px-6">
                  <span className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wider">{fullName}</span>
                  <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ATS Score: {atsScore}</span>
                  </div>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
