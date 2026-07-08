"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useResumeBuilderSession } from "@/providers/ResumeBuilderSessionProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowRight, UploadCloud, Star, Sparkles, AlertCircle, FileText, CheckCircle2, ChevronRight } from "lucide-react";

export default function ResumeWizardPage() {
  const router = useRouter();
  const { session, setSession } = useResumeBuilderSession();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Select Type, 2: JD Decision/Upload, 3: Blueprint
  const [hasJD, setHasJD] = useState<boolean | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectType = () => {
    setSession(prev => ({ ...prev, resumeType: "general" }));
    setStep(2);
  };

  const handleBackToStep1 = () => {
    setStep(1);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const fileNameLower = file.name.toLowerCase();
    if (fileNameLower.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setJobDescription(event.target.result as string);
        }
        setLoading(false);
      };
      reader.onerror = () => {
        setError("Failed to read text file.");
        setLoading(false);
      };
      reader.readAsText(file);
      return;
    }

    if (fileNameLower.endsWith(".pdf") || fileNameLower.endsWith(".docx")) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(`${API_URL}/resume/extract-text`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to extract text from file. Please ensure it is a valid PDF or DOCX.");
        }

        const text = await response.text();
        setJobDescription(text);
      } catch (err: any) {
        setError(err.message || "An error occurred during file parsing.");
      } finally {
        setLoading(false);
      }
      return;
    }

    setError("Unsupported file format. Please upload a PDF, DOCX, or TXT file.");
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in duration-500 space-y-12">
      {/* Header & Stepper */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-750 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 animate-spin duration-[4s]" />
          AI Resume Copilot Wizard
        </div>
        <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-tight">
          Craft an Outstanding Resume
        </h1>
        <p className="text-muted-foreground text-md max-w-xl mx-auto font-medium">
          Step-by-step smart optimization blueprint tailored to current hiring markets.
        </p>

        {/* Stepper Progress */}
        <div className="flex items-center justify-center gap-4 pt-6 max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 1 ? "bg-slate-900 text-white shadow-md" : "bg-slate-100 text-muted-foreground"
            }`}>1</span>
            <span className="text-xs font-semibold text-slate-700">Choose Mode</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 2 ? "bg-slate-900 text-white shadow-md" : "bg-slate-100 text-muted-foreground"
            }`}>2</span>
            <span className="text-xs font-semibold text-slate-700">Setup JD</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 3 ? "bg-slate-900 text-white shadow-md" : "bg-slate-100 text-muted-foreground"
            }`}>3</span>
            <span className="text-xs font-semibold text-slate-700">Strategy</span>
          </div>
        </div>
      </div>

      {/* Step 1 – Redesigned General Card */}
      {step === 1 && (
        <div className="flex justify-center pt-2">
          <Card
            onClick={handleSelectType}
            className="cursor-pointer group relative overflow-hidden hover:border-indigo-500 hover:shadow-2xl transition-all duration-500 rounded-3xl border border-border/80 flex flex-col justify-between max-w-[620px] w-full p-8 space-y-6 shadow-xl"
          >
            {/* Top gradient highlight */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            <div className="space-y-4">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-650 rounded-2xl flex items-center justify-center font-extrabold text-2xl group-hover:scale-110 transition-transform shadow-inner">
                🟦
              </div>
              <CardHeader className="p-0 space-y-2">
                <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  General ATS Resume
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                </CardTitle>
                <CardDescription className="text-sm font-medium leading-relaxed text-muted-foreground">
                  Build a professional, ATS-optimized resume. Opt-in to target a specific Job Description (JD) to extract blueprints, keywords, and templates tailored for direct applications.
                </CardDescription>
              </CardHeader>
            </div>
            <CardContent className="p-0 pt-4">
              <Button className="w-full h-12 bg-slate-950 text-white rounded-2xl font-bold group-hover:bg-indigo-650 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-950/10">
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2 – Premium JD Cards */}
      {step === 2 && (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500 max-w-3xl mx-auto">
          <div className="flex justify-between items-center pb-2">
            <h2 className="text-xl font-black text-slate-900">
              Customize with target Job Description?
            </h2>
            <Button variant="ghost" onClick={handleBackToStep1} className="text-xs font-bold text-slate-650 hover:bg-slate-50">
              ← Change Mode
            </Button>
          </div>

          {hasJD === null ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card Option: YES */}
              <Card 
                onClick={() => setHasJD(true)}
                className="cursor-pointer group hover:border-indigo-500 hover:shadow-2xl transition-all duration-300 rounded-3xl border border-border/80 p-8 flex flex-col justify-between h-[240px]"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-650 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Yes, optimize for JD</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Analyze a specific JD to extract core parameters and generate an AI blueprint.
                    </p>
                  </div>
                </div>
                <Button className="w-full bg-slate-900 text-white group-hover:bg-indigo-650 transition-all rounded-xl h-10 font-bold">
                  Upload or paste JD
                </Button>
              </Card>

              {/* Card Option: NO */}
              <Card 
                onClick={handleSkipJD}
                className="cursor-pointer group hover:border-slate-400 hover:shadow-2xl transition-all duration-300 rounded-3xl border border-border/80 p-8 flex flex-col justify-between h-[240px]"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-650 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">No, build general</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Build a generalized ATS resume and choose a template layout directly.
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full border-border group-hover:border-slate-800 transition-all rounded-xl h-10 font-bold">
                  Skip target JD
                </Button>
              </Card>
            </div>
          ) : (
            /* Upload JD interface */
            <Card className="rounded-3xl border border-border/80 shadow-2xl p-8 space-y-6">
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Paste Target Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  placeholder="Paste the complete Job Description text here..."
                  className="w-full min-h-[220px] max-h-[400px] p-4 border border-border/60 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 bg-slate-50/50 resize-y leading-relaxed"
                />
              </div>

              <div className="text-center py-2 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest flex items-center justify-center gap-4">
                <div className="h-px bg-border/80 flex-1" />
                OR
                <div className="h-px bg-border/80 flex-1" />
              </div>

              {/* Drag & Drop Container */}
              <div className="border-2 border-dashed border-border/80 hover:border-indigo-500 hover:bg-slate-50/20 transition-all rounded-2xl p-6 text-center relative group cursor-pointer flex flex-col items-center justify-center gap-2">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.txt"
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
                <div className="w-10 h-10 bg-indigo-50 text-indigo-650 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Drag & Drop PDF / DOCX / TXT here</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Parse text from file instantly</p>
                </div>
              </div>

              <div className="flex items-center gap-4 justify-between border-t border-border/40 pt-6">
                <Button variant="ghost" onClick={() => setHasJD(null)} className="text-xs font-bold text-slate-650">
                  Cancel
                </Button>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleSkipJD} className="text-xs font-bold border-border/60 rounded-xl">
                    Skip
                  </Button>
                  <Button
                    onClick={handleAnalyzeJD}
                    disabled={loading}
                    className="rounded-xl bg-slate-900 hover:bg-indigo-650 text-white font-bold px-6 h-11 text-xs flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze JD & Generate Strategy
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Step 3 – Redesigned AI Resume Blueprint */}
      {step === 3 && session.blueprint && (
        <Card className="rounded-3xl border border-border/80 shadow-2xl p-8 space-y-8 animate-in slide-in-from-bottom duration-500 max-w-3xl mx-auto">
          {/* Header */}
          <div className="border-b border-border/50 pb-5">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-750 text-[10px] font-black uppercase tracking-widest rounded-full">
                ★ AI Optimization Strategy
              </span>
              <span className="text-xs text-muted-foreground font-semibold">Blueprint Ready</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-4 leading-tight">
              We've created a personalized optimization strategy for your resume.
            </h2>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-border/40">
            <div className="space-y-3">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                Target Match score
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
              <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                Add matching keywords and structure sections to reach target scores.
              </p>
            </div>

            <div className="flex justify-between items-center gap-4">
              <div className="text-center p-3 bg-white rounded-xl border border-border/50 flex-1 shadow-sm">
                <span className="text-[9px] text-muted-foreground font-bold block uppercase tracking-wider">Current Score</span>
                <span className="text-2xl font-extrabold text-slate-700">{session.blueprint.currentMatch}%</span>
              </div>
              <div className="text-center p-3 bg-indigo-55 rounded-xl border border-indigo-100 flex-1 shadow-sm">
                <span className="text-[9px] text-indigo-650 font-bold block uppercase tracking-wider">Estimated Score</span>
                <span className="text-2xl font-extrabold text-indigo-650">+{session.blueprint.estimatedMatch}%</span>
              </div>
            </div>
          </div>

          {/* Blueprint Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Target Role</h3>
                <p className="text-lg font-black text-slate-900 mt-1 leading-tight">{session.blueprint.targetRole}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Experience Level: {session.blueprint.experienceLevel}</p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Priority Skills (Target List)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {session.blueprint.topSkills.map((skill) => (
                    <span key={skill} className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estimated Improvements</h3>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-border/50">
                    <span className="text-indigo-650 font-extrabold text-lg block">+{session.blueprint.atsKeywordsCount}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">Keywords</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-border/50">
                    <span className="text-indigo-650 font-extrabold text-lg block">+{session.blueprint.actionVerbs.length}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">Verbs</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Recommended Template Design
                </h3>
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-750">
                    <CheckCircle2 className="w-4 h-4 text-indigo-650" />
                    <span>{session.blueprint.recommendedTemplate}</span>
                  </div>
                  <p className="text-muted-foreground/80 mt-1 leading-relaxed">{session.blueprint.recommendedTemplateReason}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="flex justify-end pt-4 border-t border-border/50">
            <Button
              onClick={() => router.push("/dashboard/resume-builder/templates")}
              className="rounded-2xl bg-slate-950 hover:bg-indigo-650 text-white font-extrabold px-8 h-12 text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/10"
            >
              Continue to Templates Gallery
              <Sparkles className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
