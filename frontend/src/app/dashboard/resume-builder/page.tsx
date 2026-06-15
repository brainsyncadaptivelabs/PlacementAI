"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Plus, Edit2, Trash2, FileText, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import { ACTIVE_TEMPLATES, TEMPLATE_REGISTRY } from "@/lib/resume/templates/templates";
import { ResumeState } from "@/lib/resume/templates/placementai-classic/schema";

interface ResumeDto {
  id: number;
  title: string;
  templateName: string;
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  summary: string;
  skills: string;
  projects: string;
  experience: string;
  certifications: string;
  education: string;
}

export default function ResumeBuilderPortal() {
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const response = await api.get("/resume-builder");
      setResumes(response.data);
    } catch (err) {
      console.error("Failed to fetch resumes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this resume?")) return;
    setLoading(true);
    try {
      await api.delete(`/resume-builder/${id}`);
      fetchResumes();
    } catch (err) {
      console.error("Failed to delete resume", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditResume = (resume: ResumeDto) => {
    const templateId = resume.templateName || "placementai-classic";
    const reg = TEMPLATE_REGISTRY[templateId] || TEMPLATE_REGISTRY["placementai-classic"];

    // Parse the DB fields back into structured JSON state
    let parsedState: ResumeState = { ...reg.initialState };
    try {
      parsedState = {
        personalInfo: {
          name: resume.fullName || "",
          email: resume.email || "",
          phone: resume.phone || "",
          linkedin: resume.linkedin || "",
          github: resume.github || "",
          leetcode: ""
        },
        summary: resume.summary || "",
        skills: resume.skills ? (resume.skills.startsWith("[") ? JSON.parse(resume.skills) : [resume.skills]) : [],
        experience: resume.experience ? (resume.experience.startsWith("[") ? JSON.parse(resume.experience) : []) : [],
        projects: resume.projects ? (resume.projects.startsWith("[") ? JSON.parse(resume.projects) : []) : [],
        education: resume.education ? (resume.education.startsWith("[") ? JSON.parse(resume.education) : []) : [],
        certifications: resume.certifications ? (resume.certifications.startsWith("[") ? JSON.parse(resume.certifications) : []) : []
      };
    } catch (e) {
      console.error("Error parsing DB fields to ResumeState", e);
    }

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
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Resume Builder</h1>
          <p className="text-slate-500 mt-1">Create and manage high-fidelity professional resumes with AI feedback.</p>
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
          <div className="col-span-full flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-650 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No resumes created yet</h3>
            <p className="text-slate-400 mt-1 max-w-xs">Start building your first job-winning professional resume today.</p>
            <Button 
              onClick={() => router.push("/dashboard/resume-builder/templates")} 
              className="mt-6 rounded-xl bg-slate-900 text-white font-bold px-6 py-4 text-xs hover:bg-indigo-650 transition-colors"
            >
              Select a Template
            </Button>
          </div>
        ) : (
          resumes.map((resume) => {
            const template = ACTIVE_TEMPLATES.find(t => t.id === resume.templateName);
            const templateName = template ? template.name : "Custom Template";
            const atsScore = template ? template.atsScore : 90;

            return (
              <Card 
                key={resume.id} 
                onClick={() => handleEditResume(resume)}
                className="group border border-slate-100 hover:border-indigo-150 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.04)] transition-all duration-300 rounded-2xl cursor-pointer bg-white relative flex flex-col justify-between"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-indigo-650 transition-colors leading-tight">
                      {resume.title || "Untitled Resume"}
                    </CardTitle>
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditResume(resume)}
                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => handleDelete(e, resume.id)}
                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span>Template: {templateName}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed">
                    {resume.summary || "No summary profile provided."}
                  </div>
                </CardContent>
                <CardFooter className="border-t border-slate-50/50 bg-slate-50/30 flex justify-between items-center py-3.5 rounded-b-2xl px-6">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{resume.fullName || "Candidate"}</span>
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
