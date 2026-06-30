"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import {
  Target,
  Zap,
  Briefcase,
  FileText,
  AlertCircle,
  Loader2,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  Award,
  Clock,
  Sparkles,
  DollarSign,
  UserCheck
} from "lucide-react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";

type AtsQualification = {
  atsPercentage: number;
  atsVerdict: string;
  atsReason: string;
};

type ShortlistingChance = {
  shortlistPercentage: number;
  shortlistVerdict: string;
  shortlistReasons: string[];
};

type InterviewProbability = {
  probabilityPercentage: number;
  probabilityVerdict: string;
  probabilityReason: string;
};

type CompanyReadiness = {
  companyName: string;
  readyPercentage: number;
};

type RadarCategory = {
  subject: string;
  score: number;
};

type SkillItem = {
  skillName: string;
  reason: string;
};

type SkillPriority = {
  critical: SkillItem[];
  important: SkillItem[];
  optional: SkillItem[];
};

type RecruiterFeedback = {
  verdict: string;
  opinion: string;
  critiques: string[];
  actionPoints: string[];
  strengths?: string[];
  weaknesses?: string[];
};

type ImprovementStep = {
  stepNumber: number;
  action: string;
  estimatedTime: string;
  impact: string;
  priority?: string;
  difficulty?: string;
};

type ImprovementPlan = {
  targetPercentage: number;
  steps: ImprovementStep[];
};

type Benchmark = {
  category?: string;
  score?: number;
  percentile?: number;
  explanation?: string;
  technicalSkillsCandidate?: number;
  technicalSkillsAverage?: number;
  projectsCandidate?: number;
  projectsAverage?: number;
  atsCandidate?: number;
  atsAverage?: number;
  experienceCandidate?: number;
  experienceAverage?: number;
};

type RiskAnalysis = {
  riskLevel: string;
  riskType: string;
  reasoning: string;
  reason?: string;
  recommendation?: string;
};

type SalaryPrediction = {
  expectedMinLpa: string;
  expectedMaxLpa: string;
  explanation: string;
};

type ConfidenceScore = {
  confidencePercentage: number;
  explanation: string;
  reason?: string;
  certainty?: number;
};

type JdMatchResponse = {
  matchPercentage: number;
  missingSkills: string[];
  matchedSkills: string[];
  suggestions: string[];
  bestFitRole?: string;
  overallRating?: string;
  aiSummary?: string;
  learningRecommendations?: string[];

  // 2.0 metrics
  placementAIScore?: number;
  atsQualification?: AtsQualification;
  shortlistingChance?: ShortlistingChance;
  interviewProbability?: InterviewProbability;
  companyReadiness?: CompanyReadiness[];
  resumeRadar?: RadarCategory[];
  skillPriority?: SkillPriority;
  recruiterFeedback?: RecruiterFeedback;
  improvementPlan?: ImprovementPlan;
  benchmark?: Benchmark;
  riskAnalysis?: RiskAnalysis[];
  salaryPrediction?: SalaryPrediction;
  confidenceScore?: ConfidenceScore;
};

export default function JDMatchPage() {
  const [activeSource, setActiveSource] = useState<"upload" | "saved">("upload");
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [savedResumes, setSavedResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  
  const [jobDescription, setJobDescription] = useState("");
  const [isMatching, setIsMatching] = useState(false);
  const [result, setResult] = useState<JdMatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Recharts hydration match
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch saved resumes from Resume Builder
  useEffect(() => {
    const fetchSavedResumes = async () => {
      try {
        const response = await api.get("/resume-builder");
        setSavedResumes(response.data || []);
      } catch (err) {
        console.error("Failed to load saved resumes", err);
      }
    };
    fetchSavedResumes();
  }, []);

  // Handle PDF/DOCX file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setError(null);
    setResult(null);
    setFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const text = response.data.extractedText;
      if (!text) {
        throw new Error("Extracted resume text is empty.");
      }
      setResumeText(text);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, "Failed to upload and parse resume. Please try again."));
      setResumeText("");
      setFileName("");
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle selecting a resume from Resume Builder list
  const handleSelectSavedResume = (id: string) => {
    setSelectedResumeId(id);
    setResult(null);
    setError(null);

    if (!id) {
      setResumeText("");
      return;
    }

    const selected = savedResumes.find((r) => String(r.id) === id);
    if (selected) {
      const text = `
Title: ${selected.title || ""}
Name: ${selected.fullName || ""}
Summary: ${selected.summary || ""}
Skills: ${selected.skills || ""}
Projects: ${selected.projects || ""}
Experience: ${selected.experience || ""}
Education: ${selected.education || ""}
Certifications: ${selected.certifications || ""}
      `.trim();
      setResumeText(text);
    } else {
      setResumeText("");
    }
  };

  // Handle Job Description change
  const handleJdChange = (val: string) => {
    setJobDescription(val);
    setResult(null);
    setError(null);
  };

  // Perform AI match analysis
  const handleMatch = async () => {
    if (!resumeText || !jobDescription.trim()) return;

    setIsMatching(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post("/jd/match", {
        resumeText: resumeText,
        jobDescription: jobDescription,
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, "Unable to analyze the Job Description. Please try again."));
    } finally {
      setIsMatching(false);
    }
  };

  // Get color indicators based on percentages
  const getColorClasses = (percentage: number) => {
    if (percentage >= 90) {
      return {
        text: "text-green-600 dark:text-green-400",
        border: "border-green-200 dark:border-green-900/30",
        bg: "bg-green-50 dark:bg-green-950/20",
        stroke: "#22c55e",
        badge: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300"
      };
    }
    if (percentage >= 75) {
      return {
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-900/30",
        bg: "bg-blue-50 dark:bg-blue-950/20",
        stroke: "#3b82f6",
        badge: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
      };
    }
    if (percentage >= 60) {
      return {
        text: "text-orange-600 dark:text-orange-400",
        border: "border-orange-200 dark:border-orange-900/30",
        bg: "bg-orange-50 dark:bg-orange-950/20",
        stroke: "#f97316",
        badge: "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300"
      };
    }
    return {
      text: "text-red-600 dark:text-red-400",
      border: "border-red-200 dark:border-red-900/30",
      bg: "bg-red-50 dark:bg-red-950/20",
      stroke: "#ef4444",
      badge: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
    };
  };

  const isButtonDisabled = !resumeText || !jobDescription.trim() || isMatching || uploadingFile;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold font-heading text-foreground">PlacementAI Intelligence Engine™</h1>
        <p className="text-muted-foreground">Premium diagnostic analysis mapping ATS, recruiter filters, and skill compatibility.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Input Panel (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm bg-card overflow-hidden">
            <CardHeader className="bg-muted/50 border-b border-border p-4">
              <CardTitle className="text-sm font-bold font-heading flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" /> Analysis Inputs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Resume Source Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Resume Input</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={activeSource === "upload" ? "default" : "outline"}
                    onClick={() => {
                      setActiveSource("upload");
                      setResumeText("");
                      setFileName("");
                      setSelectedResumeId("");
                      setResult(null);
                      setError(null);
                    }}
                    className="flex-1 text-xs h-9"
                  >
                    Upload File
                  </Button>
                  <Button
                    type="button"
                    variant={activeSource === "saved" ? "default" : "outline"}
                    onClick={() => {
                      setActiveSource("saved");
                      setResumeText("");
                      setFileName("");
                      setSelectedResumeId("");
                      setResult(null);
                      setError(null);
                    }}
                    className="flex-1 text-xs h-9"
                  >
                    Saved Resume
                  </Button>
                </div>
              </div>

              {/* Resume Action Fields */}
              {activeSource === "upload" ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">Resume File</label>
                  <div className="border border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center space-y-2 bg-muted/10">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.docx"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFile}
                      className="w-full text-xs h-8"
                    >
                      {uploadingFile ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-2 inline-block" />
                          Extracting text...
                        </>
                      ) : fileName ? (
                        "Change File"
                      ) : (
                        "Choose PDF/DOCX"
                      )}
                    </Button>
                    {fileName && (
                      <div className="flex items-center gap-2 text-xs text-primary font-medium">
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[150px]">{fileName}</span>
                      </div>
                    )}
                    {!fileName && !uploadingFile && (
                      <p className="text-[9px] text-muted-foreground/70">PDF or DOCX format (max 5MB)</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">Select Saved Resume</label>
                  <select
                    value={selectedResumeId}
                    onChange={(e) => handleSelectSavedResume(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">-- Select Resume --</option>
                    {savedResumes.map((r: any) => (
                      <option key={r.id} value={r.id}>
                        {r.title || `Resume #${r.id}`} ({r.fullName})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Job Description Textarea */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">Job Description</label>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => handleJdChange(e.target.value)}
                  placeholder="Paste the Job Description here..."
                  className="min-h-[180px] border-border focus-visible:ring-primary/20 resize-none text-xs"
                />
              </div>

              {/* Submit button */}
              {isButtonDisabled ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="w-full block">
                      <Button
                        disabled
                        className="w-full bg-primary/50 text-white h-10 text-sm cursor-not-allowed pointer-events-none opacity-50"
                      >
                        Check Match Score
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Upload a resume and paste a Job Description
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  onClick={handleMatch}
                  disabled={isMatching}
                  className="w-full bg-primary hover:bg-primary/90 h-10 text-sm text-white font-bold"
                >
                  {isMatching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2 inline-block" />
                      Analyzing...
                    </>
                  ) : (
                    "Check Match Score"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Dashboard Panel (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. LOADING STATE */}
          {(isMatching || uploadingFile) && (
            <div className="space-y-6 animate-pulse">
              <Card className="border-none shadow-sm bg-card overflow-hidden">
                <div className="p-6 flex flex-col items-center text-center space-y-4 bg-primary/5">
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground/50" />
                  </div>
                  <div className="h-6 w-48 bg-muted rounded"></div>
                  <div className="h-4 w-72 bg-muted rounded"></div>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-16 bg-muted rounded"></div>
                    <div className="h-16 bg-muted rounded"></div>
                  </div>
                  <div className="h-48 bg-muted rounded"></div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 2. ERROR STATE */}
          {!isMatching && !uploadingFile && error && (
            <Card className="border-none shadow-sm bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 flex flex-col items-center justify-center p-12 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <div className="space-y-2">
                <h3 className="font-bold text-red-800 dark:text-red-400">Analysis Failed</h3>
                <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
              </div>
              <Button variant="outline" onClick={handleMatch} className="border-red-200 text-red-700 hover:bg-red-50">
                <RefreshCw className="w-4 h-4 mr-2" /> Retry
              </Button>
            </Card>
          )}

          {/* 3. SUCCESS / INTELLIGENCE DASHBOARD STATE */}
          {!isMatching && !uploadingFile && !error && result && (
            <div className="space-y-6 animate-in fade-in duration-500">
              
              {/* Overview Row: 4 Primary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* 1. PlacementAI Score */}
                <Card className="border-none shadow-sm bg-card overflow-hidden flex flex-col items-center text-center p-4">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">PlacementAI Score™</div>
                  <div className="relative w-20 h-20 mb-2">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="3.5"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={getColorClasses(result.placementAIScore || result.matchPercentage).stroke}
                        strokeWidth="3.5"
                        strokeDasharray={`${result.placementAIScore || result.matchPercentage}, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-extrabold text-foreground">{result.placementAIScore || result.matchPercentage}</span>
                    </div>
                  </div>
                  <div className={`text-xs font-bold ${getColorClasses(result.placementAIScore || result.matchPercentage).text}`}>
                    {result.overallRating || "Analyzed"}
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-1">Weighted Placement Fit</div>
                </Card>

                {/* 2. ATS Qualification Chance */}
                <Card className="border-none shadow-sm bg-card overflow-hidden flex flex-col items-center text-center p-4">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">ATS Qualification</div>
                  <div className={`text-3xl font-black mb-1 ${getColorClasses(result.atsQualification?.atsPercentage || 0).text}`}>
                    {result.atsQualification?.atsPercentage || 0}%
                  </div>
                  <div className="mb-2">
                    <Badge className={getColorClasses(result.atsQualification?.atsPercentage || 0).badge + " border-none"}>
                      {result.atsQualification?.atsVerdict || "Medium"}
                    </Badge>
                  </div>
                  <div className="text-[9px] text-muted-foreground leading-normal line-clamp-3">
                    {result.atsQualification?.atsReason || "Resume formatting and keyword compliance."}
                  </div>
                </Card>

                {/* 3. Recruiter Shortlisting */}
                <Card className="border-none shadow-sm bg-card overflow-hidden flex flex-col items-center text-center p-4">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Recruiter shortlisting</div>
                  <div className={`text-3xl font-black mb-1 ${getColorClasses(result.shortlistingChance?.shortlistPercentage || 0).text}`}>
                    {result.shortlistingChance?.shortlistPercentage || 0}%
                  </div>
                  <div className="mb-2">
                    <Badge className={getColorClasses(result.shortlistingChance?.shortlistPercentage || 0).badge + " border-none"}>
                      {result.shortlistingChance?.shortlistVerdict || "Medium"}
                    </Badge>
                  </div>
                  <div className="w-full text-left space-y-0.5 text-[9px] text-muted-foreground border-t border-border pt-1.5 mt-auto">
                    {result.shortlistingChance?.shortlistReasons?.slice(0, 3).map((r, i) => (
                      <div key={i} className="truncate" title={r}>{r}</div>
                    )) || <div>AI filters matched</div>}
                  </div>
                </Card>

                {/* 4. Interview Probability */}
                <Card className="border-none shadow-sm bg-card overflow-hidden flex flex-col items-center text-center p-4">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Interview Probability</div>
                  <div className={`text-3xl font-black mb-1 ${getColorClasses(result.interviewProbability?.probabilityPercentage || 0).text}`}>
                    {result.interviewProbability?.probabilityPercentage || 0}%
                  </div>
                  <div className="mb-2">
                    <Badge className={getColorClasses(result.interviewProbability?.probabilityPercentage || 0).badge + " border-none"}>
                      {result.interviewProbability?.probabilityVerdict || "Medium"}
                    </Badge>
                  </div>
                  <div className="text-[9px] text-muted-foreground leading-normal line-clamp-3">
                    {result.interviewProbability?.probabilityReason || "Estimated call probability based on current profile."}
                  </div>
                </Card>

              </div>

              {/* Radar Chart & Benchmark Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Resume Strength Radar (7 columns) */}
                <Card className="border-none shadow-sm bg-card md:col-span-7 p-4">
                  <CardHeader className="p-0 pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary" /> Resume Strength Radar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex items-center justify-center min-h-[300px]">
                    {isMounted && result.resumeRadar && result.resumeRadar.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={result.resumeRadar}>
                          <PolarGrid stroke="#cbd5e1" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--foreground)', fontSize: 9 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)', fontSize: 8 }} />
                          <Radar
                            name="Score"
                            dataKey="score"
                            stroke="var(--primary)"
                            fill="var(--primary)"
                            fillOpacity={0.25}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Generating visualization...</p>
                    )}
                  </CardContent>
                </Card>

                {/* Candidate Benchmarking (5 columns) */}
                <Card className="border-none shadow-sm bg-card md:col-span-5 p-4 flex flex-col">
                  <CardHeader className="p-0 pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" /> VS. Top Candidates
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 flex flex-col justify-center space-y-4">
                    {/* Tech Skills */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="font-semibold text-foreground">Technical Skills</span>
                        <span className="text-muted-foreground font-medium">
                          {result.benchmark?.technicalSkillsCandidate}% vs Top {result.benchmark?.technicalSkillsAverage}%
                        </span>
                      </div>
                      <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full bg-primary rounded-full"
                          style={{ width: `${result.benchmark?.technicalSkillsCandidate || 0}%` }}
                        ></div>
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-foreground/60 z-10"
                          style={{ left: `${result.benchmark?.technicalSkillsAverage || 90}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Projects */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="font-semibold text-foreground">Projects</span>
                        <span className="text-muted-foreground font-medium">
                          {result.benchmark?.projectsCandidate}% vs Top {result.benchmark?.projectsAverage}%
                        </span>
                      </div>
                      <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full bg-primary rounded-full"
                          style={{ width: `${result.benchmark?.projectsCandidate || 0}%` }}
                        ></div>
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-foreground/60 z-10"
                          style={{ left: `${result.benchmark?.projectsAverage || 90}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* ATS */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="font-semibold text-foreground">ATS Optimization</span>
                        <span className="text-muted-foreground font-medium">
                          {result.benchmark?.atsCandidate}% vs Top {result.benchmark?.atsAverage}%
                        </span>
                      </div>
                      <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full bg-primary rounded-full"
                          style={{ width: `${result.benchmark?.atsCandidate || 0}%` }}
                        ></div>
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-foreground/60 z-10"
                          style={{ left: `${result.benchmark?.atsAverage || 90}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Experience */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="font-semibold text-foreground">Experience</span>
                        <span className="text-muted-foreground font-medium">
                          {result.benchmark?.experienceCandidate}% vs Top {result.benchmark?.experienceAverage}%
                        </span>
                      </div>
                      <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full bg-primary rounded-full"
                          style={{ width: `${result.benchmark?.experienceCandidate || 0}%` }}
                        ></div>
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-foreground/60 z-10"
                          style={{ left: `${result.benchmark?.experienceAverage || 90}%` }}
                        ></div>
                      </div>
                    </div>

                    <p className="text-[9px] text-muted-foreground/80 pt-2 leading-tight">
                      Grey line indicates top candidate benchmark average. Aim to align scores to cross average parameters.
                    </p>
                  </CardContent>
                </Card>

              </div>

              {/* Skill Priority & Hiring Risk Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Skill Priority */}
                <Card className="border-none shadow-sm bg-card p-4">
                  <CardHeader className="p-0 pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" /> Skill Priority Classification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4">
                    {/* Critical */}
                    {result.skillPriority?.critical && result.skillPriority.critical.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Critical Skills</div>
                        <div className="space-y-1">
                          {result.skillPriority.critical.map((s, i) => (
                            <div key={i} className="text-xs bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-950/30 p-2 rounded flex flex-col gap-0.5">
                              <span className="font-bold text-red-700 dark:text-red-400">{s.skillName}</span>
                              <span className="text-[10px] text-red-600 dark:text-red-300/80 leading-snug">{s.reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Important */}
                    {result.skillPriority?.important && result.skillPriority.important.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Important Skills</div>
                        <div className="space-y-1">
                          {result.skillPriority.important.map((s, i) => (
                            <div key={i} className="text-xs bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-950/30 p-2 rounded flex flex-col gap-0.5">
                              <span className="font-bold text-orange-700 dark:text-orange-400">{s.skillName}</span>
                              <span className="text-[10px] text-orange-600 dark:text-orange-300/80 leading-snug">{s.reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Optional */}
                    {result.skillPriority?.optional && result.skillPriority.optional.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Optional Skills</div>
                        <div className="space-y-1">
                          {result.skillPriority.optional.map((s, i) => (
                            <div key={i} className="text-xs bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-950/30 p-2 rounded flex flex-col gap-0.5">
                              <span className="font-bold text-blue-700 dark:text-blue-400">{s.skillName}</span>
                              <span className="text-[10px] text-blue-600 dark:text-blue-300/80 leading-snug">{s.reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Hiring Risk Analysis */}
                <Card className="border-none shadow-sm bg-card p-4">
                  <CardHeader className="p-0 pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-primary" /> Hiring Risk Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-2">
                    {result.riskAnalysis && result.riskAnalysis.length > 0 ? (
                      result.riskAnalysis.map((r, i) => {
                        const isHigh = r.riskLevel.toLowerCase() === "high";
                        const isMedium = r.riskLevel.toLowerCase() === "medium";
                        return (
                          <div key={i} className="border border-border rounded-lg p-3 bg-muted/20 flex gap-3 items-start">
                            <div className="shrink-0 mt-0.5">
                              <AlertTriangle className={`w-4 h-4 ${isHigh ? "text-red-500" : isMedium ? "text-orange-500" : "text-gray-400"}`} />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-foreground">{r.riskType}</span>
                                <Badge className={`text-[8px] font-black uppercase py-0 px-1 border-none ${
                                  isHigh ? "bg-red-100 text-red-800" : isMedium ? "bg-orange-100 text-orange-800" : "bg-gray-100 text-gray-800"
                                }`}>
                                  {r.riskLevel}
                                </Badge>
                              </div>
                              <p className="text-[10px] text-muted-foreground leading-normal">{r.reasoning || r.reason}</p>
                              {r.recommendation && (
                                <p className="text-[9px] text-primary leading-normal mt-1 font-medium flex items-center gap-1">
                                  <span>💡</span>
                                  <span>Recommendation: {r.recommendation}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : null}
                  </CardContent>
                </Card>

              </div>

              {/* Improvement Plan & Recruiter Feedback */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* AI Improvement Plan */}
                <Card className="border-none shadow-sm bg-card p-4">
                  <CardHeader className="p-0 pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" /> AI Improvement Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4">
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">Opportunity Increase</span>
                      <span className="font-bold text-primary">
                        {result.interviewProbability?.probabilityPercentage || 0}% ➔ {result.improvementPlan?.targetPercentage || 91}%
                      </span>
                    </div>

                    <div className="relative border-l border-border/80 pl-4 ml-2 space-y-4">
                      {result.improvementPlan?.steps?.map((step, i) => (
                        <div key={i} className="relative">
                          {/* Indicator dot */}
                          <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card z-10"></div>
                          
                          <div className="space-y-0.5 text-xs">
                            <div className="flex items-center justify-between font-bold">
                              <span className="text-foreground">Step {step.stepNumber}: {step.action}</span>
                              <Badge className="bg-primary/10 text-primary border-none hover:bg-primary/10 text-[9px] font-bold">
                                {step.impact}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>Est: {step.estimatedTime}</span>
                              {step.priority && (
                                <Badge variant="outline" className="text-[8px] py-0 px-1 border-primary/20 bg-primary/5 text-primary">
                                  {step.priority}
                                </Badge>
                              )}
                              {step.difficulty && (
                                <Badge variant="outline" className="text-[8px] py-0 px-1 border-muted-foreground/20 text-muted-foreground">
                                  {step.difficulty}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )) || <p className="text-xs text-muted-foreground italic">No actions found.</p>}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Recruiter Feedback */}
                <Card className="border-none shadow-sm bg-card p-4 flex flex-col">
                  <CardHeader className="p-0 pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-primary" /> AI Recruiter Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground">Overall Verdict</span>
                        <Badge className="bg-slate-900 text-white dark:bg-slate-800 border-none font-bold text-[9px] uppercase">
                          {result.recruiterFeedback?.verdict || "Uncertain"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-normal italic">
                        &quot;{result.recruiterFeedback?.opinion}&quot;
                      </p>
                    </div>

                    {/* Strengths */}
                    {result.recruiterFeedback?.strengths && result.recruiterFeedback.strengths.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">Key Strengths</span>
                        <ul className="list-disc pl-4 text-[10px] text-muted-foreground space-y-0.5">
                          {result.recruiterFeedback.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {result.recruiterFeedback?.weaknesses && result.recruiterFeedback.weaknesses.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Weaknesses</span>
                        <ul className="list-disc pl-4 text-[10px] text-muted-foreground space-y-0.5">
                          {result.recruiterFeedback.weaknesses.map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Critiques */}
                    {result.recruiterFeedback?.critiques && result.recruiterFeedback.critiques.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Critiques</span>
                        <ul className="list-disc pl-4 text-[10px] text-muted-foreground space-y-0.5">
                          {result.recruiterFeedback.critiques.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Points */}
                    {result.recruiterFeedback?.actionPoints && result.recruiterFeedback.actionPoints.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Action Points</span>
                        <ul className="list-disc pl-4 text-[10px] text-muted-foreground space-y-0.5">
                          {result.recruiterFeedback.actionPoints.map((a, i) => (
                            <li key={i}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>

              {/* Company Readiness & Salary Predictions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Company Readiness Table */}
                <Card className="border-none shadow-sm bg-card p-4">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" /> Company Readiness
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground text-[10px] uppercase font-bold">
                            <th className="py-2">Company</th>
                            <th className="py-2 text-right">Readiness %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {result.companyReadiness?.map((comp, i) => (
                            <tr key={i}>
                              <td className="py-1.5 font-medium text-foreground">{comp.companyName}</td>
                              <td className="py-1.5 text-right font-bold text-primary">{comp.readyPercentage}%</td>
                            </tr>
                          )) || (
                            <tr>
                              <td colSpan={2} className="py-2 text-center text-muted-foreground italic">No data available.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Salary Predictions & Confidence */}
                <div className="space-y-6">
                  {/* Salary Pred */}
                  <Card className="border-none shadow-sm bg-card p-4">
                    <CardHeader className="p-0 pb-3">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" /> Salary Prediction
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Estimated Package:</span>
                        <span className="text-lg font-black text-primary">
                          ₹{result.salaryPrediction?.expectedMinLpa || "0.0"} LPA – ₹{result.salaryPrediction?.expectedMaxLpa || "0.0"} LPA
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-normal">
                        {result.salaryPrediction?.explanation || "Based on skills matching market standards."}
                      </p>
                    </CardContent>
                  </Card>

                  {/* AI Confidence */}
                  <Card className="border-none shadow-sm bg-card p-4">
                    <CardHeader className="p-0 pb-3">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-primary" /> AI Engine Confidence
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Confidence Level:</span>
                        <Badge className={`text-[9px] font-black border-none ${
                          getColorClasses(result.confidenceScore?.confidencePercentage || 0).badge
                        }`}>
                          {result.confidenceScore?.confidencePercentage || 0}%
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-normal">
                        {result.confidenceScore?.explanation || result.confidenceScore?.reason}
                      </p>
                      {result.confidenceScore?.certainty && (
                        <div className="text-[9px] text-primary/80 font-medium italic mt-1">
                          AI Certainty: {result.confidenceScore?.certainty}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

              </div>

            </div>
          )}

          {/* 4. INITIAL EMPTY STATE */}
          {!isMatching && !uploadingFile && !error && !result && (
            <Card className="border-none shadow-sm bg-muted/50 border-2 border-dashed border-border flex flex-col items-center justify-center p-12 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-foreground font-heading">PlacementAI Diagnostic Panel</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Upload your resume and paste a Job Description to generate an AI-powered compatibility score.
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 w-full max-w-xs text-left space-y-3 shadow-sm">
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                  <span className="text-sm">📄</span>
                  <span>Upload Resume (PDF/DOCX)</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                  <span className="text-sm">📝</span>
                  <span>Paste Job Description</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium border-t border-border/50 pt-2">
                  <span className="text-sm">✨</span>
                  <span>Click &quot;Check Match Score&quot;</span>
                </div>
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
