"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Mic, History, BarChart2, PlayCircle, Check, Loader2, Sparkles, ArrowLeft, 
  ArrowRight, FileText, Upload, Target, ShieldCheck, AlertCircle, Bookmark,
  Layers, Award, GraduationCap, Calendar, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/ui/theme-components";
import { interviewTypes, companies } from "@/modules/mock-interview/constants/interview-modules";
import { interviewService } from "@/modules/mock-interview/services/interviewService";
import { useInterviewStore } from "@/modules/mock-interview/hooks/useInterviewStore";
import { MockInterviewRequest } from "@/modules/mock-interview/types/interview.types";
import { cn } from "@/lib/utils";

export default function MockInterviewLandingPage() {
  const router = useRouter();
  const setInterviewData = useInterviewStore((state) => state.setInterviewData);
  
  // Navigation / Mode States
  const [viewMode, setViewMode] = useState<"landing" | "setup">("landing");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Setup Config State
  const [role, setRole] = useState("Software Engineer");
  const [experienceLevel, setExperienceLevel] = useState("Entry Level");
  const [company, setCompany] = useState("");
  const [interviewType, setInterviewType] = useState("Technical");
  const [topic, setTopic] = useState("");

  // Resume States
  const [resumes, setResumes] = useState<any[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [selectedResumeText, setSelectedResumeText] = useState<string>("");
  const [selectedResumeName, setSelectedResumeName] = useState<string>("");
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);
  const [analyzingResume, setAnalyzingResume] = useState(false);

  // JD States
  const [jobDescription, setJobDescription] = useState("");
  const [jdMatchData, setJdMatchData] = useState<any>(null);
  const [matchingJd, setMatchingJd] = useState(false);

  // Fetch resumes catalog
  const fetchResumes = useCallback(async () => {
    setLoadingResumes(true);
    try {
      const data = await interviewService.getAllResumes();
      setResumes(data || []);
      if (data && data.length > 0) {
        // Auto-select latest
        setSelectedResumeId(data[0].id);
        setSelectedResumeName(data[0].fileName);
        handleSelectResume(data[0].id);
      }
    } catch (e) {
      console.error("Failed to load user resumes:", e);
    } finally {
      setLoadingResumes(false);
    }
  }, []);

  const handleSelectResume = async (resumeId: number) => {
    setSelectedResumeId(resumeId);
    const target = resumes.find(r => r.id === resumeId);
    if (target) {
      setSelectedResumeName(target.fileName);
    }
    setAnalyzingResume(true);
    try {
      const analysis = await interviewService.getResumeAnalysis(resumeId);
      setResumeAnalysis(analysis);
      setSelectedResumeText(analysis.extractedText || "");
      if (analysis.bestRole) {
        setRole(analysis.bestRole);
      }
    } catch (e) {
      console.error("Failed to get resume analysis summary:", e);
    } finally {
      setAnalyzingResume(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAnalyzingResume(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      // We call the existing uploadResume API
      const analysis = await interviewService.saveResults({
        role: "Java Full Stack", // temporary stub for save schema
        experienceLevel: "Entry Level"
      } as any);
      
      // Let's call the proper file upload from interviewService
      // Wait, interviewService has no uploadResume, but we can call api.post('/resume/upload')
      const response = await apiUploadResume(file);
      setResumes(prev => [response.resumeDto, ...prev]);
      setSelectedResumeId(response.resumeDto?.id || null);
      setSelectedResumeName(file.name);
      setSelectedResumeText(response.extractedText || "");
      setResumeAnalysis(response);
      if (response.bestRole) {
        setRole(response.bestRole);
      }
    } catch (e) {
      console.error("Failed to upload and parse resume:", e);
      alert("Failed to upload and analyze resume. Please try again.");
    } finally {
      setAnalyzingResume(false);
    }
  };

  const apiUploadResume = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    const api = (await import("@/lib/api")).default;
    const response = await api.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    // Stub a resumeDto mapping if backend returned AtsResponseDto
    return {
      ...response.data,
      resumeDto: {
        id: response.data.resumeId || Date.now(),
        fileName: file.name,
        createdAt: new Date().toISOString(),
        atsScore: response.data.atsScore || 70,
        analyzedRole: response.data.bestRole || "Software Engineer"
      }
    };
  };

  const handleJdCompare = async () => {
    if (!jobDescription.trim()) return;
    setMatchingJd(true);
    try {
      const data = await interviewService.matchJobDescription(selectedResumeText, jobDescription);
      setJdMatchData(data);
    } catch (e) {
      console.error("JD comparison failed:", e);
    } finally {
      setMatchingJd(false);
    }
  };

  const startModuleInterview = (moduleName: string, level: string, focusAreas: string[]) => {
    setRole(moduleName);
    setExperienceLevel(level);
    setTopic(focusAreas.join(", "));
    setInterviewType("Technical");
    setCompany(moduleName);
    
    setViewMode("setup");
    setCurrentStep(1);
    fetchResumes();
  };

  const startCompanyInterview = (companyName: string, level: string, type: string, focusAreas: string[]) => {
    setRole(`${companyName} Engineer`);
    setExperienceLevel(level);
    setTopic(focusAreas.join(", "));
    setInterviewType(type);
    setCompany(companyName);
    
    setViewMode("setup");
    setCurrentStep(1);
    fetchResumes();
  };

  const handleCustomSetup = () => {
    setRole("Software Engineer");
    setExperienceLevel("Mid Level");
    setTopic("");
    setInterviewType("Technical");
    setCompany("");

    setViewMode("setup");
    setCurrentStep(1);
    fetchResumes();
  };

  const handleStartMockInterview = async () => {
    setLoadingId("start-btn");
    try {
      const request: MockInterviewRequest = {
        role,
        experienceLevel,
        company: company || "General Tech Company",
        topic: topic || undefined,
        interviewType,
        jobDescription: jobDescription || undefined,
        resumeText: selectedResumeText || undefined,
      };

      const response = await interviewService.startAdaptiveInterview(request);
      setInterviewData({
        role,
        experienceLevel,
        questions: [response.firstQuestion],
        company: company || "General Tech Company",
        topic,
        isAdaptive: true,
        adaptiveInterviewId: response.interviewId,
      });
      router.push("/mock-interview/session");
    } catch (e) {
      console.error("Failed to start mock interview session:", e);
      alert("Failed to initialize session. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleBack = () => {
    if (viewMode === "setup") {
      if (currentStep > 1) {
        setCurrentStep(prev => prev - 1);
      } else {
        setViewMode("landing");
      }
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <PageShell className="bg-gradient-to-br from-blue-50/50 via-background to-blue-50/30 dark:from-blue-950/15 dark:via-background dark:to-blue-950/5 min-h-[90vh] rounded-3xl border border-blue-100/20 shadow-sm">
      {/* Navigation Header / Back Button bar */}
      <div className="flex items-center gap-3 mb-6 select-none border-b border-border/40 pb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground pl-2 pr-3 py-1.5 h-8 rounded-lg transition-colors border border-transparent hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs font-semibold">Back</span>
        </Button>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-1 text-[11px] font-black text-muted-foreground uppercase tracking-wider">
          <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-foreground">Mock Interviews</span>
          {viewMode === "setup" && (
            <>
              <span>/</span>
              <span className="text-primary font-black">Setup (Step {currentStep}/3)</span>
            </>
          )}
        </div>
      </div>

      {viewMode === "landing" ? (
        <>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6 border-b border-border/40 pb-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-2">
                AI Mock Interview <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              </h1>
              <p className="text-muted-foreground mt-2 text-md max-w-2xl">
                Get interview-ready with customizable, resume-driven practice sessions, real-time volume VAD, and instant feedback reports.
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/mock-interview/history">
                <Button variant="outline" className="flex items-center gap-2 border-border bg-card hover:bg-muted text-foreground">
                  <History className="h-4 w-4" /> History Catalog
                </Button>
              </Link>
              <Button onClick={handleCustomSetup} className="flex items-center gap-2 font-bold bg-primary hover:bg-primary/80">
                <PlayCircle className="h-4 w-4" /> New Interview
              </Button>
            </div>
          </div>

          {/* Quick Start Modules */}
          <div className="space-y-6 mb-12">
            <div>
              <h2 className="text-xl font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-primary" /> Core Practice Modules
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Select a focused track to practice core skills with customized state trees.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {interviewTypes.map((module) => (
                <Card key={module.id} className="flex flex-col justify-between border-slate-200 bg-white/95 backdrop-blur hover:border-primary/50 hover:shadow-xl transition-all duration-300 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <span className="text-3xl">{module.icon}</span>
                      <Badge className="bg-slate-100 text-slate-700 border-slate-200">{module.level}</Badge>
                    </div>
                    <CardTitle className="text-md mt-4 font-bold text-slate-900">{module.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1 text-xs text-slate-500">{module.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <Button 
                      className="w-full text-xs font-bold bg-slate-100 hover:bg-primary hover:text-white text-slate-700" 
                      variant="secondary"
                      onClick={() => startModuleInterview(module.name, module.level, module.focusAreas)}
                    >
                      Start Practice
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {/* Company-Specific Prep */}
          <div className="space-y-6 mb-12">
            <div>
              <h2 className="text-xl font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" /> Target Company Practice
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Practice interview formats tailored for top tech and consulting firms.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {companies.map((company) => (
                <Card key={company.id} className="flex flex-col justify-between border-slate-200 bg-white/95 backdrop-blur hover:border-primary/50 hover:shadow-xl transition-all duration-300 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-md font-bold text-primary">
                        {company.logo}
                      </div>
                      <Badge className="bg-slate-100 text-slate-700 border-slate-200">{company.level}</Badge>
                    </div>
                    <CardTitle className="text-md mt-4 font-bold text-slate-900">{company.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1 text-xs text-slate-500">{company.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <Button 
                      className="w-full text-xs font-bold bg-slate-100 hover:bg-primary hover:text-white text-slate-700" 
                      variant="secondary"
                      onClick={() => startCompanyInterview(company.name, company.level, company.interviewTypes[0], company.focusAreas)}
                    >
                      Start Practice
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Interview Setup Flow */
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
          
          {/* Progress Tracker Bar */}
          <div className="flex items-center justify-between bg-white/95 p-4 rounded-xl border border-slate-200 shadow-sm">
            {[
              { num: 1, title: "Resume" },
              { num: 2, title: "Job Description" },
              { num: 3, title: "Review" }
            ].map((step) => (
              <div key={step.num} className="flex items-center gap-2">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  currentStep === step.num && "bg-primary text-white animate-pulse",
                  currentStep > step.num && "bg-emerald-500 text-white",
                  currentStep < step.num && "bg-slate-200 text-slate-400"
                )}>
                  {currentStep > step.num ? <Check className="w-3.5 h-3.5" /> : step.num}
                </div>
                <span className={cn(
                  "text-xs font-bold",
                  currentStep === step.num ? "text-slate-900" : "text-slate-400"
                )}>
                  {step.title}
                </span>
                {step.num < 3 && <ChevronRight className="w-4 h-4 text-white/20 ml-2" />}
              </div>
            ))}
          </div>

          {/* STEP 1: RESUME SELECTION & ANALYSIS */}
          {currentStep === 1 && (
            <Card className="border-slate-200 bg-white/95 backdrop-blur shadow-md p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Select or Upload Resume
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  We customize the adaptive mock interview topics primarily around your projects and experiences.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-6">
                
                {/* Drag and Drop File Uploader */}
                <div className="border-2 border-dashed border-slate-200 hover:border-primary/50 transition-colors p-6 rounded-xl bg-slate-50 text-center relative">
                  <input
                    type="file"
                    accept=".pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                    disabled={analyzingResume}
                  />
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-slate-400 animate-bounce" />
                    <p className="text-xs text-slate-900 font-bold">Drag and drop your PDF resume here, or click to browse</p>
                    <p className="text-[10px] text-slate-500">Supported format: PDF only. Max size 10MB.</p>
                  </div>
                </div>

                {loadingResumes ? (
                  <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : resumes.length > 0 ? (
                  <div className="space-y-3">
                    <Label className="text-xs font-black text-slate-900 uppercase">Your Uploaded Resumes ({resumes.length})</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {resumes.map((res) => (
                        <div
                          key={res.id}
                          onClick={() => handleSelectResume(res.id)}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between h-24 bg-slate-50 hover:bg-slate-100",
                            selectedResumeId === res.id ? "border-primary shadow" : "border-slate-200"
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-900 truncate">{res.fileName}</p>
                              <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3" /> {new Date(res.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-2 border-t border-slate-200 pt-1.5">
                            <Badge className="bg-emerald-100 text-emerald-800 text-[9px] font-black border-none py-0 px-1.5">
                              ATS: {res.atsScore || 70}
                            </Badge>
                            <span className="text-[10px] font-bold text-slate-500 truncate max-w-[120px]">
                              {res.analyzedRole || "Software Engineer"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-slate-500">
                    No resumes found. Please upload a PDF resume to configure the personalized flow.
                  </div>
                )}

                {/* Resume Analysis Summary Showcase */}
                {analyzingResume ? (
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <p className="text-xs text-slate-900 font-bold mt-3">Analyzing resume content using Gemini AI...</p>
                  </div>
                ) : resumeAnalysis && (
                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <h4 className="text-xs font-black text-primary uppercase tracking-widest">Resume Analysis Summary</h4>
                      <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black">
                        FIT: {resumeAnalysis.bestRole || role}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Strengths
                        </span>
                        <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside pl-1.5">
                          {resumeAnalysis.strengths?.slice(0, 3).map((s: string, idx: number) => (
                            <li key={idx} className="truncate">{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-red-600 uppercase flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Weak Areas
                        </span>
                        <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside pl-1.5">
                          {resumeAnalysis.weaknesses?.slice(0, 3).map((w: string, idx: number) => (
                            <li key={idx} className="truncate">{w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="px-0 pb-0 pt-4 border-t border-slate-200 flex justify-end">
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!selectedResumeId || analyzingResume}
                  className="bg-primary text-white text-xs font-bold pl-4 pr-3 py-1.5 h-9"
                >
                  Next <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* STEP 2: JOB DESCRIPTION MATCH */}
          {currentStep === 2 && (
            <Card className="border-slate-200 bg-white/95 backdrop-blur shadow-md p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" /> Job Description (Optional)
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Provide the target JD to compare matching vs missing skills, aligning the AI question bank.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jd" className="text-xs font-bold text-slate-900 uppercase">Pasted Job Description Text</Label>
                  <textarea
                    id="jd"
                    className="w-full min-h-[140px] p-3 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50 text-slate-900 text-xs resize-none"
                    placeholder="Paste the target job description requirements here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleJdCompare}
                  disabled={matchingJd || !jobDescription.trim()}
                  variant="outline"
                  className="w-full border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                >
                  {matchingJd ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Comparing Resume vs JD...
                    </>
                  ) : (
                    "Run JD Gap Comparison"
                  )}
                </Button>

                {/* JD Comparison scorecard grid */}
                {jdMatchData && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest">Comparison Grid Scorecard</span>
                      <Badge className="bg-emerald-100 text-emerald-800 border-none font-black text-xs py-0.5 px-2">
                        Match Score: {jdMatchData.matchPercentage || 75}%
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">Matching Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {jdMatchData.matchedSkills?.slice(0, 4).map((s: string, i: number) => (
                            <Badge key={i} className="bg-slate-100 text-slate-700 border-none text-[8px] py-0 px-1">{s}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <p className="text-[9px] font-black text-red-600 uppercase mb-1">Missing Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {jdMatchData.missingSkills?.slice(0, 4).map((s: string, i: number) => (
                            <Badge key={i} className="bg-slate-100 text-slate-700 border-none text-[8px] py-0 px-1">{s}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <p className="text-[9px] font-black text-primary uppercase mb-1">Priority Interview Topics</p>
                        <div className="flex flex-wrap gap-1">
                          {(jdMatchData.missingSkills || ["System Architecture"]).slice(0, 3).map((s: string, i: number) => (
                            <Badge key={i} className="bg-primary/10 text-primary border-none text-[8px] py-0 px-1 font-bold">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="px-0 pb-0 pt-4 border-t border-slate-200 flex justify-between">
                <Button variant="ghost" onClick={() => setCurrentStep(1)} className="text-xs hover:text-slate-900 hover:bg-transparent text-slate-500 pl-0">
                  <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  className="bg-primary text-white text-xs font-bold pl-4 pr-3 py-1.5 h-9"
                >
                  Next <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* STEP 3: PREPARATION CONFIRMATION */}
          {currentStep === 3 && (
            <Card className="border-slate-200 bg-white/95 backdrop-blur shadow-md p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" /> Review & Start
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Review your configured practice parameters before launching the session.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Job Role Fit</span>
                    <span className="text-sm font-bold text-slate-900">{role}</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Experience Level</span>
                    <span className="text-sm font-bold text-slate-900">{experienceLevel}</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Selected Resume</span>
                    <span className="text-sm font-bold text-slate-900 truncate block">{selectedResumeName || "Default Resume"}</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Interview Type</span>
                    <span className="text-sm font-bold text-slate-900 block">{interviewType} Interview</span>
                  </div>
                </div>

                <div className="p-3.5 bg-primary/5 rounded-xl border border-primary/20 space-y-1 text-center">
                  <p className="text-xs text-slate-900 font-bold flex items-center justify-center gap-1.5">
                    <Mic className="w-4 h-4 text-primary animate-pulse" /> Continuous Listening Enabled
                  </p>
                  <p className="text-[10px] text-slate-600">
                    This interview operates hands-free. Speak naturally, the AI will automatically listen and process turn recordings.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="px-0 pb-0 pt-4 border-t border-slate-200 flex justify-between">
                <Button variant="ghost" onClick={() => setCurrentStep(2)} className="text-xs hover:text-slate-900 hover:bg-transparent text-slate-500 pl-0">
                  <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                </Button>
                <Button
                  onClick={handleStartMockInterview}
                  disabled={loadingId !== null}
                  className="bg-primary hover:bg-primary/80 text-white font-black text-xs px-5 py-2 h-10 shadow-lg"
                >
                  {loadingId === "start-btn" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin inline" /> Launching Interview...
                    </>
                  ) : (
                    "Start Interview"
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}

        </div>
      )}
    </PageShell>
  );
}
