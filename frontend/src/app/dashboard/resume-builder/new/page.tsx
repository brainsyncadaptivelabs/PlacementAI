"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useResumeBuilderSession } from "@/providers/ResumeBuilderSessionProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowRight, UploadCloud, FileText, CheckCircle2, Star, Sparkles, AlertCircle } from "lucide-react";

export default function ResumeWizardPage() {
  const router = useRouter();
  const { session, setSession } = useResumeBuilderSession();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Type, 2: JD Upload, 3: Blueprint
  const [resumeType, setResumeType] = useState<"general" | "company" | null>(null);
  const [hasJD, setHasJD] = useState<boolean | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectType = (type: "general" | "company") => {
    setResumeType(type);
    setSession(prev => ({ ...prev, resumeType: type }));
    if (type === "general") {
      setStep(2);
    } else {
      setHasJD(true);
      setStep(2);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setResumeType(null);
    setHasJD(null);
  };

  const handleSkipJD = () => {
    setSession(prev => ({ ...prev, jobDescription: "" }));
    router.push("/dashboard/resume-builder/templates");
  };

  const handleAnalyzeJD = async () => {
    if (!jobDescription.trim()) {
      setError("Please paste a job description or upload a file first.");
      return;
    }
    setLoading(true);
    setError(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";

    try {
      const response = await fetch(`${API_URL}/resume-builder/blueprint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobDescription }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate AI Resume Blueprint.");
      }

      const data = await response.json();
      setSession(prev => ({
        ...prev,
        jobDescription,
        blueprint: data,
      }));
      setStep(3);
    } catch (err: any) {
      setError(err.message || "An error occurred during AI analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    // Simulate premium document parser extraction
    setTimeout(() => {
      const dummyJd = `Job Description: Senior Java Backend Developer
Experience Required: 2-5 years
Core Requirements:
- Develop scalable REST APIs using Java and Spring Boot.
- Manage databases using SQL, PostgreSQL, or Hibernate.
- Deploy applications containerized with Docker and Kubernetes on AWS.
- Write unit and integration tests to ensure system stability.`;
      setJobDescription(dummyJd);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-300 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
          PlacementAI Resume Wizard
        </h1>
        <p className="text-muted-foreground">
          Step-by-step smart optimization blueprint for your next career move.
        </p>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <Card
            onClick={() => handleSelectType("general")}
            className="cursor-pointer group hover:border-indigo-500 hover:shadow-lg transition-all duration-300 rounded-2xl flex flex-col justify-between"
          >
            <CardHeader className="space-y-2">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-650 rounded-xl flex items-center justify-center font-extrabold text-xl group-hover:scale-110 transition-transform">
                🟦
              </div>
              <CardTitle className="text-xl font-bold">General ATS Resume</CardTitle>
              <CardDescription className="text-sm">
                Best for sending to multiple companies. Build a highly optimized, clean resume matching general industry roles.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <Button className="w-full bg-slate-900 text-white rounded-xl py-5 font-bold group-hover:bg-indigo-650 transition-colors">
                Continue
              </Button>
            </CardContent>
          </Card>

          <Card
            onClick={() => handleSelectType("company")}
            className="cursor-pointer group hover:border-amber-500 hover:shadow-lg transition-all duration-300 rounded-2xl flex flex-col justify-between"
          >
            <CardHeader className="space-y-2">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-extrabold text-xl group-hover:scale-110 transition-transform">
                🟨
              </div>
              <CardTitle className="text-xl font-bold">Company-tailored Resume</CardTitle>
              <CardDescription className="text-sm">
                Optimized for one specific company. Tailor every bullet point and skill directly to the job post description.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <Button className="w-full bg-slate-900 text-white rounded-xl py-5 font-bold group-hover:bg-amber-650 transition-colors">
                Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 2 && (
        <Card className="rounded-2xl border border-border shadow-sm p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-border/50 pb-4">
            <h2 className="text-lg font-bold text-foreground">
              {resumeType === "general" ? "General ATS Configuration" : "Company Specific Configuration"}
            </h2>
            <Button variant="ghost" onClick={handleBackToStep1} className="text-xs font-semibold">
              Back
            </Button>
          </div>

          {resumeType === "general" && hasJD === null && (
            <div className="space-y-4 text-center py-6">
              <p className="text-sm font-semibold text-muted-foreground">Do you have a Job Description for target roles?</p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => setHasJD(true)} className="rounded-xl px-8 py-5 font-bold bg-slate-900 text-white hover:bg-indigo-650">
                  Yes
                </Button>
                <Button onClick={handleSkipJD} variant="outline" className="rounded-xl px-8 py-5 font-bold border-border/50">
                  No
                </Button>
              </div>
            </div>
          )}

          {(hasJD === true || resumeType === "company") && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Paste Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  placeholder="Paste the complete Job Description here, or upload a PDF, DOCX, or screenshot. PlacementAI will analyze the role and generate an AI Resume Blueprint tailored to the position."
                  className="w-full min-h-[300px] max-h-[600px] p-4 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 bg-slate-50/50 resize-y overflow-y-auto leading-relaxed"
                />
              </div>

              {/* OR divider */}
              <div className="text-center py-2 text-xs font-black text-muted-foreground/60 uppercase tracking-widest flex items-center justify-center gap-4">
                <div className="h-px bg-border/80 flex-1" />
                OR
                <div className="h-px bg-border/80 flex-1" />
              </div>

              {/* Drag and Drop Container */}
              <div className="border-2 border-dashed border-border/80 hover:border-indigo-500 hover:bg-slate-50/20 transition-all rounded-2xl p-8 text-center relative group cursor-pointer flex flex-col items-center justify-center gap-3">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,image/*"
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
                <div className="w-12 h-12 bg-indigo-50 text-indigo-650 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Drag & Drop PDF / DOCX / Screenshot Here</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF • DOCX • Image • Screenshot</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg text-xs font-bold border-border/60 mt-1 pointer-events-none">
                  Browse Files
                </Button>
              </div>

              <div className="flex items-center gap-4 justify-between border-t border-border/40 pt-6">
                <div>
                  {loading && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-650">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Parsing document contents...
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  {resumeType === "general" && (
                    <Button variant="ghost" onClick={handleSkipJD} className="text-xs font-bold">
                      Skip
                    </Button>
                  )}
                  <Button
                    onClick={handleAnalyzeJD}
                    disabled={loading}
                    className="rounded-xl bg-slate-900 hover:bg-indigo-650 text-white font-bold px-6 py-5 text-xs flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing with AI...
                      </>
                    ) : (
                      <>
                        Analyze JD & Generate Blueprint
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </Card>
      )}

      {step === 3 && session.blueprint && (
        <Card className="rounded-2xl border border-border shadow-sm p-8 space-y-8 animate-in slide-in-from-bottom duration-500">
          {/* Title */}
          <div className="border-b border-border/50 pb-5">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-650 text-[10px] font-black uppercase tracking-widest rounded-full">
                ★ AI Resume Blueprint
              </span>
              <span className="text-xs text-muted-foreground font-semibold">Ready for generation</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-foreground mt-3">
              We've created a personalized optimization strategy for your resume.
            </h2>
          </div>

          {/* Readiness Meter & Match Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-border/40">
            <div className="space-y-2">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                Resume Readiness Meter
              </span>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-650 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${session.blueprint.currentMatch}%` }}
                  />
                </div>
                <span className="text-sm font-extrabold text-indigo-650">{session.blueprint.currentMatch}%</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Current state needs work to match JD parameters.</p>
            </div>

            <div className="flex justify-between items-center gap-4">
              <div className="text-center p-3 bg-white rounded-xl border border-border/50 flex-1">
                <span className="text-[10px] text-muted-foreground font-bold block">Current ATS Score</span>
                <span className="text-2xl font-extrabold text-slate-700">{session.blueprint.currentMatch}%</span>
              </div>
              <div className="text-center p-3 bg-indigo-50 rounded-xl border border-indigo-100/50 flex-1">
                <span className="text-[10px] text-indigo-650 font-bold block">Target Match</span>
                <span className="text-2xl font-extrabold text-indigo-650">{session.blueprint.estimatedMatch}%</span>
              </div>
            </div>
          </div>

          {/* Role details & strategy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Target Role</h3>
                <p className="text-lg font-extrabold text-slate-900 mt-1">{session.blueprint.targetRole}</p>
                <p className="text-xs text-muted-foreground">Experience level: {session.blueprint.experienceLevel}</p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Top Skills (Priority list)
                </h3>
                <div className="space-y-2">
                  {session.blueprint.topSkills.map((skill, index) => {
                    const stars = 5 - index > 2 ? 5 - index : 3;
                    return (
                      <div key={skill} className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-700">{skill}</span>
                        <div className="flex text-amber-400 gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < stars ? "fill-amber-400" : "text-slate-200"}`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Expected Improvements</h3>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-border/50">
                    <span className="text-indigo-600 font-extrabold text-lg block">+{session.blueprint.atsKeywordsCount}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">ATS Keywords</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-border/50">
                    <span className="text-indigo-600 font-extrabold text-lg block">+{session.blueprint.topSkills.length}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">Tech Skills</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-border/50">
                    <span className="text-indigo-600 font-extrabold text-lg block">+{session.blueprint.actionVerbs.length}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">Action Verbs</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-border/50">
                    <span className="text-indigo-600 font-extrabold text-lg block">+3</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">STAR Bullets</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Recommended Template
                </h3>
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-650">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{session.blueprint.recommendedTemplate}</span>
                  </div>
                  <p className="text-muted-foreground/80 mt-1">{session.blueprint.recommendedTemplateReason}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="flex justify-end pt-4 border-t border-border/50">
            <Button
              onClick={() => router.push("/dashboard/resume-builder/templates")}
              className="rounded-xl bg-slate-900 hover:bg-indigo-650 text-white font-extrabold px-8 py-5 text-sm flex items-center gap-2 shadow-md shadow-indigo-500/10"
            >
              Generate My Resume
              <Sparkles className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
