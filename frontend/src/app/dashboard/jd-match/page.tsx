"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Target,
  Zap,
  Briefcase,
  FileText,
  AlertCircle,
  Loader2,
  TrendingUp,
  BookOpen,
  RefreshCw
} from "lucide-react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";

type JdMatchResponse = {
  matchPercentage: number;
  missingSkills: string[];
  matchedSkills: string[];
  suggestions: string[];
  bestFitRole?: string;
  overallRating?: string;
  aiSummary?: string;
  learningRecommendations?: string[];
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

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // 1. Upload to parse & store in user profile
      const response = await api.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // 2. Extracted text is now returned directly in AtsResponseDto as response.data.extractedText!
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

  const isButtonDisabled = !resumeText || !jobDescription.trim() || isMatching || uploadingFile;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold font-heading text-foreground">Job Description Matching</h1>
        <p className="text-muted-foreground">Compare your resume against a Job Description to verify ATS compatibility.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <Card className="border-none shadow-sm bg-card overflow-hidden">
          <CardHeader className="bg-muted/50 border-b border-border">
            <CardTitle className="text-base font-bold font-heading flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" /> JD Match Input
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Resume Source Toggler */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Choose Resume Source</label>
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
                  className="flex-1"
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
                  className="flex-1"
                >
                  Saved Resume
                </Button>
              </div>
            </div>

            {/* Resume Source Action Fields */}
            {activeSource === "upload" ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">Resume File</label>
                <div className="border border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center space-y-2 bg-muted/20">
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
                    className="w-full text-xs"
                  >
                    {uploadingFile ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-2 inline-block" />
                        Extracting text...
                      </>
                    ) : fileName ? (
                      "Change Resume PDF/DOCX"
                    ) : (
                      "Choose Resume PDF/DOCX"
                    )}
                  </Button>
                  {fileName && (
                    <div className="flex items-center gap-2 text-xs text-primary font-medium">
                      <FileText className="w-4 h-4 shrink-0" />
                      <span className="truncate max-w-[200px]">{fileName}</span>
                    </div>
                  )}
                  {!fileName && !uploadingFile && (
                    <p className="text-[10px] text-muted-foreground/70">Upload PDF or DOCX file (max 5MB)</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">Select Saved Resume</label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => handleSelectSavedResume(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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

            {/* Job Description Pasting */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">Job Description</label>
              <Textarea
                value={jobDescription}
                onChange={(e) => handleJdChange(e.target.value)}
                placeholder="Paste the Job Description here..."
                className="min-h-[220px] border-border focus-visible:ring-primary/20 resize-none text-sm"
              />
            </div>

            {/* Match trigger button */}
            {isButtonDisabled ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="w-full block">
                    <Button
                      disabled
                      className="w-full bg-primary/50 text-white h-12 text-lg cursor-not-allowed pointer-events-none opacity-50"
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
                className="w-full bg-primary hover:bg-primary/90 h-12 text-lg text-white font-bold"
              >
                {isMatching ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2 inline-block" />
                    Analyzing...
                  </>
                ) : (
                  "Check Match Score"
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Right Panel: Dynamic States */}
        <div className="space-y-6">
          {/* 1. LOADING STATE */}
          {(isMatching || uploadingFile) && (
            <div className="space-y-6 animate-pulse">
              <Card className="border-none shadow-xl bg-card overflow-hidden">
                <div className="p-8 flex flex-col items-center text-center space-y-4 bg-primary/5">
                  <div className="w-28 h-28 rounded-full bg-muted flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground/50" />
                  </div>
                  <div className="h-6 w-32 bg-muted rounded"></div>
                  <div className="h-4 w-48 bg-muted rounded"></div>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <div className="h-4 w-24 bg-muted rounded"></div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-muted rounded-full"></div>
                      <div className="h-6 w-20 bg-muted rounded-full"></div>
                      <div className="h-6 w-24 bg-muted rounded-full"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-24 bg-muted rounded"></div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-muted rounded-full"></div>
                      <div className="h-6 w-20 bg-muted rounded-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 2. ERROR STATE */}
          {!isMatching && !uploadingFile && error && (
            <Card className="border-none shadow-sm bg-red-50/50 border border-red-100 flex flex-col items-center justify-center p-12 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <div className="space-y-2">
                <h3 className="font-bold text-red-800">Analysis Failed</h3>
                <p className="text-sm text-red-600">{error}</p>
              </div>
              <Button variant="outline" onClick={handleMatch} className="border-red-200 text-red-700 hover:bg-red-50">
                <RefreshCw className="w-4 h-4 mr-2" /> Retry
              </Button>
            </Card>
          )}

          {/* 3. SUCCESS STATE */}
          {!isMatching && !uploadingFile && !error && result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <Card className="border-none shadow-xl bg-card overflow-hidden">
                <div className="p-8 flex flex-col items-center text-center space-y-4 bg-primary/5">
                  <div className="relative w-28 h-28">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="3"
                        strokeDasharray={`${result.matchPercentage}, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-primary">{result.matchPercentage}%</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold font-heading">{result.overallRating || "Match Analyzed"}</h3>
                  {result.bestFitRole && (
                    <p className="text-sm text-muted-foreground">
                      Best Fit Role: <span className="font-semibold text-primary">{result.bestFitRole}</span>
                    </p>
                  )}
                  {result.aiSummary && (
                    <p className="text-sm text-muted-foreground max-w-md italic">{result.aiSummary}</p>
                  )}
                </div>
                <CardContent className="p-6 space-y-6">
                  {/* Matching Skills */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted-foreground/70 uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-green-500" /> Matching Skills
                    </h4>
                    {result.matchedSkills && result.matchedSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.matchedSkills.map((s) => (
                          <Badge key={s} className="bg-green-50 text-green-700 border-green-100 hover:bg-green-100">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No matching skills identified.</p>
                    )}
                  </div>
                  {/* Missing Skills */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted-foreground/70 uppercase tracking-widest flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-red-500" /> Missing Skills / Skill Gap
                    </h4>
                    {result.missingSkills && result.missingSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.missingSkills.map((s) => (
                          <Badge key={s} className="bg-red-50 text-red-700 border-red-100 hover:bg-red-100">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No missing skills detected!</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Optimization suggestions */}
              {result.suggestions && result.suggestions.length > 0 && (
                <Card className="border-none shadow-sm bg-slate-900 text-white p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/20 rounded-lg shrink-0">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-primary">
                        ATS Optimization Tips
                      </h4>
                      <ul className="text-xs text-muted-foreground/70 leading-relaxed list-disc pl-4 space-y-1">
                        {result.suggestions.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              )}

              {/* Learning recommendations */}
              {result.learningRecommendations && result.learningRecommendations.length > 0 && (
                <Card className="border-none shadow-sm bg-card p-6 border border-border">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-foreground flex items-center gap-2 text-sm uppercase tracking-wider">
                        Learning Recommendations
                      </h4>
                      <ul className="text-xs text-muted-foreground leading-relaxed list-disc pl-4 space-y-1">
                        {result.learningRecommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* 4. INITIAL EMPTY STATE */}
          {!isMatching && !uploadingFile && !error && !result && (
            <Card className="border-none shadow-sm bg-muted/50 border-2 border-dashed border-border flex flex-col items-center justify-center p-12 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-foreground">JD Match Analysis</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Upload your resume and paste a Job Description to generate an AI-powered compatibility score.
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 w-full max-w-xs text-left space-y-3 shadow-sm">
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                  <span className="text-sm">📄</span>
                  <span>Upload Resume</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                  <span className="text-sm">📝</span>
                  <span>Paste Job Description</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium border-t border-border/50 pt-2">
                  <span className="text-sm">✨</span>
                  <span>Click "Check Match Score"</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

