"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Download, DollarSign, Sparkles, Loader2,
  AlertCircle, TrendingUp, UserCheck, ThumbsUp, ThumbsDown,
  CheckCircle2, XCircle, Info, Search, ChevronRight, Filter, Check, X, ChevronDown, Award, Briefcase, GraduationCap, Mail, Phone, Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Radar, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from "recharts";

interface AtsAnalysisData {
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  matchedKeywords: string[];
  suggestions: string[];
  bestRole: string;
  extractedText: string;
  sectionScores?: Record<string, number>;
  recruiterFeedback?: string;
  recommendedRoles?: string[];
  
  industry?: string;
  careerDomain?: string;
  primaryProfession?: string;
  subDomain?: string;
  experienceLevel?: string;
  targetRole?: string;
  placementReadiness?: Record<string, number>;
  criticalSkills?: string[];
  importantSkills?: string[];
  niceToHaveSkills?: string[];
  companyMatches?: Array<{ name: string; score: number; reason: string }>;
  improvements?: Array<{ action: string; boost: number; note: string }>;
  minSalary?: string;
  maxSalary?: string;
  salaryExplanation?: string;
  isJobDescriptionComparison?: boolean;
  jobDescriptionTitle?: string;

  // V2 Fields
  scoreBand?: string;
  candidateType?: string;
  candidateTypeConfidence?: number;
  candidateTypeEvidence?: string[];
  confidence?: string;
  parseConfidence?: number;
  parseWarnings?: string[];
  extractedCharacterCount?: number;
  detectedSectionCount?: number;
  checks?: Array<{
    checkId: string;
    category: string;
    title: string;
    description: string;
    maxPoints: number;
    earnedPoints: number;
    severity: string;
    status: string;
    evidence: string;
    recommendation: string;
  }>;
  skillEvidence?: Array<{
    skill: string;
    listedInSkills: boolean;
    foundInProjects: boolean;
    foundInExperience: boolean;
    foundInInternships: boolean;
    evidenceCount: number;
    evidenceSnippets: string[];
    credibilityStatus: string;
  }>;
  weakBullets?: Array<{
    originalBullet: string;
    problems: string[];
    whyItIsWeak: string;
    improvementStrategy: string;
    rewriteSuggestion: string;
  }>;
  atsSectionScores?: Array<{
    section: string;
    score: number;
    status: string;
    explanation: string;
    strengths: string[];
    improvements: string[];
  }>;
}

function buildScoringEngine(analysis: AtsAnalysisData) {
  const score = analysis.atsScore ?? null;

  // Evaluation grade
  const getGrade = (s: number | null) => {
    if (s === null) return { grade: "N/A", verdict: "Insufficient info", style: "text-slate-600 bg-slate-50 border-slate-200" };
    if (s >= 89) return { grade: "A+", verdict: "Exceptional", style: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (s >= 79) return { grade: "A", verdict: "Strong", style: "text-green-600 bg-green-50 border-green-200" };
    if (s >= 66) return { grade: "B+", verdict: "Good", style: "text-blue-600 bg-blue-50 border-blue-200" };
    if (s >= 50) return { grade: "C", verdict: "Average", style: "text-amber-600 bg-amber-50 border-amber-100" };
    return { grade: "D", verdict: "Needs Work", style: "text-red-600 bg-red-50 border-red-100" };
  };
  const evaluation = getGrade(score);

  // Radar Data
  const breakdown: Record<string, number> = analysis.sectionScores || {};
  const radarData = Object.entries(breakdown).map(([subject, value]) => ({ subject, value, fullMark: 100 }));

  // Placement Readiness
  const readiness = analysis.placementReadiness || {};

  // Company Compatibility
  const companiesList = analysis.companyMatches || [];

  // Recruiter Assessment
  const formattingVal = breakdown["Formatting"] || 75;
  const contactVal = breakdown["Contact"] || 80;
  const grammarVal = breakdown["Grammar"] || 80;
  
  const atsParsability = Math.min(98, Math.round(contactVal * 0.5 + formattingVal * 0.5));
  const visualQuality = parseFloat(Math.min(9.8, formattingVal / 10).toFixed(1));
  const readabilityScore = grammarVal;
  const professionalismScore = Math.min(95, Math.round((score || 70) * 0.8 + 10));

  const recruiterVerdict = score === null ? "Insufficient Information" :
    score >= 89 ? "Strong Shortlist" :
      score >= 79 ? "Likely Interview" :
        score >= 65 ? "Borderline" :
          score >= 50 ? "Needs Improvement" : "Reject";

  const verdictStyle = score === null ? "bg-slate-100 text-slate-800" :
    score >= 89 ? "bg-emerald-100 text-emerald-800" :
      score >= 79 ? "bg-blue-100 text-blue-800" :
        score >= 65 ? "bg-amber-100 text-amber-800" :
          score >= 50 ? "bg-orange-100 text-orange-800" : "bg-red-100 text-red-800";

  // Salary Prediction
  const salary = {
    current: analysis.minSalary || "N/A",
    potential: analysis.maxSalary || "N/A",
    stretch: analysis.maxSalary || "N/A",
    basis: analysis.salaryExplanation || "N/A",
  };

  // Recruiter Funnel
  const funnel = score === null ? [] : [
    { stage: "Resume Screening", prob: Math.min(95, Math.round(score * 0.9 + 5)), color: "#3b82f6" },
    { stage: "Technical Round", prob: Math.min(90, Math.round(score * 0.8)), color: "#8b5cf6" },
    { stage: "Manager Round", prob: Math.min(85, Math.round(score * 0.7)), color: "#f59e0b" },
    { stage: "Offer Probability", prob: Math.min(80, Math.round(score * 0.6)), color: "#10b981" },
  ];

  // Benchmarks
  const topBenchmarks = score === null ? [] : [
    { metric: "ATS Score", you: score, top: 91 },
    { metric: "Skills", you: breakdown["Skills"] || 70, top: 93 },
    { metric: "Projects", you: breakdown["Projects"] || 65, top: 92 },
    { metric: "Experience", you: breakdown["Experience"] || 60, top: 89 },
    { metric: "Education", you: breakdown["Education"] || 75, top: 90 },
  ];

  // Missing Skills
  const criticalMissing = analysis.criticalSkills || [];
  const importantMissing = analysis.importantSkills || [];
  const niceToHaveMissing = analysis.niceToHaveSkills || [];

  // Improvements
  const improvements = analysis.improvements || [];

  // AI Confidence
  const aiConfidence = score === null ? 0 : 90;

  // Verdict text
  const verdict = analysis.recruiterFeedback || "Resume evaluation completed.";

  return {
    score, breakdown, radarData, evaluation,
    readiness, companiesList,
    atsParsability, visualQuality, readabilityScore, professionalismScore,
    recruiterVerdict, verdictStyle,
    salary, funnel,
    topBenchmarks,
    criticalMissing,
    importantMissing,
    niceToHaveMissing,
    improvements,
    aiConfidence,
    verdict,
    matchedKwCount: analysis.matchedKeywords?.length || 0,
    missingKwCount: analysis.missingKeywords?.length || 0,
    matchedKeywords: analysis.matchedKeywords || [],
    missingKeywords: analysis.missingKeywords || [],
    expLevel: analysis.experienceLevel || "Fresher",
  };
}

export default function AtsAnalysisDashboard() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AtsAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "SECTION ANALYSIS" | "SKILL INTELLIGENCE" | "RECRUITER VIEW" | "ATS CHECKS">("OVERVIEW");
  const [selectedSection, setSelectedSection] = useState<string>("Projects");
  const [skillSearch, setSkillSearch] = useState<string>("");
  const [skillFilter, setSkillFilter] = useState<string>("ALL");
  const [checksFilter, setChecksFilter] = useState<"ALL" | "ISSUES" | "FAILED" | "WARNING" | "PASSED">("ISSUES");
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

  useEffect(() => {
    const sources = [
      () => sessionStorage.getItem("ats-analysis"),
      () => localStorage.getItem("latest_ats_analysis"),
    ];
    for (const src of sources) {
      const saved = src();
      if (saved) {
        try { setAnalysis(JSON.parse(saved)); break; }
        catch { /* ignore */ }
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="container py-20 text-center flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-semibold">Generating Premium ATS Intelligence Dashboard...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="container py-20 max-w-md mx-auto text-center space-y-6">
        <Card className="border border-dashed p-8 flex flex-col items-center shadow-sm">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold">No ATS Analysis Available</h2>
          <p className="text-muted-foreground text-sm mt-2 mb-6">
            Please upload a resume first to view the full analytics dashboard.
          </p>
          <Button onClick={() => router.push("/dashboard/ats")} className="w-full font-bold">
            Upload &amp; Analyze Resume
          </Button>
        </Card>
      </div>
    );
  }

  const s = buildScoringEngine(analysis);

  const isInsufficient = s.score === null || 
                         analysis.bestRole === "Insufficient information" || 
                         analysis.suggestions?.[0] === "Insufficient information";

  if (isInsufficient) {
    return (
      <div className="container py-20 max-w-lg mx-auto text-center space-y-6">
        <Card className="border border-dashed p-8 flex flex-col items-center shadow-sm">
          <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-xl font-bold">Insufficient Information</h2>
          <p className="text-muted-foreground text-sm mt-2 mb-6">
            The uploaded file does not contain sufficient information to perform an ATS intelligence analysis. Please upload a comprehensive resume containing details about your skills, projects, and experience.
          </p>
          <Button onClick={() => router.push("/dashboard/ats")} className="w-full font-bold">
            Upload &amp; Analyze Another Resume
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground print:h-auto print:overflow-visible">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-3 border-b shrink-0 print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/ats")} className="hover:bg-slate-100">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
              ATS Intelligence Workspace <Sparkles className="w-4 h-4 text-primary" />
            </h1>
            <p className="text-xs text-muted-foreground">Evidence-based recruiter-grade resume analytics</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => window.print()} className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-9">
            <Download className="w-3.5 h-3.5 mr-1.5" /> PDF Report
          </Button>
        </div>
      </div>

      {/* Top Summary Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 py-4 border-b bg-slate-50/50 dark:bg-slate-900/30 shrink-0 print:grid-cols-3">
        {/* Left: Overall ATS Score */}
        <div className="flex items-center gap-4 bg-background p-4 rounded-xl border border-border/60 shadow-sm">
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
              <circle cx="48" cy="48" r="40"
                stroke="var(--primary)" strokeWidth="7" fill="transparent"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - (s.score || 0) / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-foreground">{s.score}</span>
              <span className="text-[8px] text-muted-foreground font-bold uppercase">/100</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Overall ATS Score</span>
            <Badge className={cn("text-[10px] font-bold border px-2 py-0.5", s.evaluation.style)}>
              Grade {s.evaluation.grade} &bull; {s.evaluation.verdict}
            </Badge>
            <p className="text-[10px] text-muted-foreground leading-normal mt-1">
              Target 85+ for product companies.<br />92+ indicates elite resume evidence quality.
            </p>
          </div>
        </div>

        {/* Center: Placement Readiness Cards */}
        <div className="flex flex-col justify-center bg-background p-4 rounded-xl border border-border/60 shadow-sm space-y-2.5">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Placement Readiness™</span>
          <div className="space-y-2">
            {Object.entries(s.readiness).map(([label, value], i) => (
              <div key={i} className="space-y-0.5">
                <div className="flex justify-between text-[9px] font-bold text-muted-foreground uppercase">
                  <span>{label}</span>
                  <span className="text-foreground">{value}%</span>
                </div>
                <Progress value={value} className="h-1" />
              </div>
            ))}
            {Object.keys(s.readiness).length === 0 && (
              <p className="text-[10px] text-muted-foreground italic">Readiness metrics unavailable</p>
            )}
          </div>
        </div>

        {/* Right: Detected Profile & AI Confidence */}
        <div className="flex flex-col justify-between bg-background p-4 rounded-xl border border-border/60 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Detected Profile</span>
              <div className="text-sm font-black text-foreground">{analysis.careerDomain || "General Profession"}</div>
              <div className="text-[10px] text-muted-foreground">Industry: {analysis.industry || "N/A"}</div>
            </div>
            <div className="text-right space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Experience Track</span>
              <div className="text-xs font-bold text-foreground">{analysis.experienceLevel || "Fresher"}</div>
              <div className="text-[10px] text-muted-foreground">Target: {analysis.targetRole || "N/A"}</div>
            </div>
          </div>
          <div className="border-t pt-2 mt-2 flex items-center justify-between gap-4">
            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block shrink-0">AI Confidence</span>
            <div className="flex-1 flex items-center gap-2">
              <Progress value={s.aiConfidence} className="h-1" />
              <span className="text-[10px] font-bold text-primary shrink-0">{s.aiConfidence}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex border-b bg-slate-50 dark:bg-slate-900 shrink-0 px-6 overflow-x-auto print:hidden">
        {([
          { key: "OVERVIEW", label: "Overview" },
          { key: "SECTION ANALYSIS", label: "Section Analysis" },
          { key: "SKILL INTELLIGENCE", label: "Skill Intelligence" },
          { key: "RECRUITER VIEW", label: "Recruiter View" },
          { key: "ATS CHECKS", label: "ATS Checks" }
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-3 text-xs font-bold border-b-2 -mb-[2px] transition-all whitespace-nowrap",
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Workspaces */}
      <div className="flex-1 overflow-hidden p-6 print:overflow-visible print:p-0">
        
        {/* OVERVIEW TAB */}
        {activeTab === "OVERVIEW" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-y-auto pr-2 pb-6 print:grid-cols-3 print:overflow-visible">
            {/* Left large column: Section Performance */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black uppercase tracking-wider text-foreground">Section Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.atsSectionScores && analysis.atsSectionScores.map((sec) => (
                      <button
                        key={sec.section}
                        onClick={() => {
                          setSelectedSection(sec.section);
                          setActiveTab("SECTION ANALYSIS");
                        }}
                        className="p-3 text-left rounded-lg border border-border hover:border-primary/50 hover:bg-muted/10 transition-all space-y-1.5 focus:outline-none block w-full"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-foreground uppercase tracking-wide">{sec.section}</span>
                          <span className={cn("text-[9px] font-black uppercase px-1.5 py-0.5 rounded",
                            sec.status === "STRONG" ? "bg-green-100 text-green-800" :
                            sec.status === "GOOD" ? "bg-blue-100 text-blue-800" :
                            "bg-amber-100 text-amber-800"
                          )}>
                            {sec.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={sec.score} className="h-1.5 flex-1" />
                          <span className="text-xs font-black text-foreground shrink-0">{sec.score}%</span>
                        </div>
                      </button>
                    ))}
                    {(!analysis.atsSectionScores || analysis.atsSectionScores.length === 0) && (
                      <p className="text-xs text-muted-foreground py-4 text-center col-span-2">Section scores unavailable.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Roadmap */}
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black uppercase tracking-wider text-foreground">🚀 High-Impact Improvement Roadmap</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {s.improvements.slice(0, 3).map((imp, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-900/60 flex justify-between items-center gap-4">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-foreground">{imp.action}</h4>
                        <p className="text-[10px] text-muted-foreground">{imp.note}</p>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 border-none shrink-0 font-extrabold text-[10px]">
                        Potential impact: +{imp.boost} Score
                      </Badge>
                    </div>
                  ))}
                  {s.improvements.length === 0 && (
                    <p className="text-xs text-muted-foreground py-4 text-center">No immediate actions suggested.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right column: Priority Gaps & Strengths */}
            <div className="lg:col-span-1 space-y-6">
              {/* Priority Gaps */}
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black uppercase tracking-wider text-foreground">⚠️ Top Priority Gaps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.weaknesses?.slice(0, 3).map((w, i) => (
                    <div key={i} className="p-3 rounded-lg border border-red-100 bg-red-500/5 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-red-700">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Priority gap #{i+1}</span>
                      </div>
                      <p className="text-xs text-foreground font-semibold leading-relaxed">{w}</p>
                    </div>
                  ))}
                  {(!analysis.weaknesses || analysis.weaknesses.length === 0) && (
                    <p className="text-xs text-muted-foreground py-2 text-center">No major gaps identified.</p>
                  )}
                </CardContent>
              </Card>

              {/* Top Strengths */}
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black uppercase tracking-wider text-foreground">Top Strengths</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.strengths?.slice(0, 3).map((str, i) => (
                    <div key={i} className="flex gap-2.5 text-xs text-muted-foreground leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-foreground font-medium">{str}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* SECTION ANALYSIS TAB */}
        {activeTab === "SECTION ANALYSIS" && (
          <div className="flex h-full border rounded-xl overflow-hidden bg-card border-border shadow-sm">
            {/* Sidebar Inside Workspace */}
            <div className="w-64 border-r bg-slate-50/50 dark:bg-slate-900/30 overflow-y-auto shrink-0 flex flex-col divide-y divide-border/60">
              <span className="p-4 text-[10px] uppercase font-bold text-muted-foreground tracking-wider block shrink-0 bg-slate-100/50 dark:bg-slate-900/60">Resume Sections</span>
              <div className="p-2 space-y-1">
                {["Summary", "Education", "Skills", "Projects", "Experience", "Certifications", "Contact & Profile"].map((secName) => {
                  const mappedSec = analysis.atsSectionScores?.find(s => (s.section || "").toLowerCase().startsWith((secName || "").toLowerCase().split(" ")[0]));
                  return (
                    <button
                      key={secName}
                      onClick={() => setSelectedSection(secName)}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg text-xs text-left font-bold transition-all flex justify-between items-center focus:outline-none",
                        selectedSection === secName
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                      )}
                    >
                      <span>{secName}</span>
                      {mappedSec && (
                        <span className="text-[10px] opacity-80 font-black">{mappedSec.score}%</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Section Details Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {(() => {
                const secDetails = analysis.atsSectionScores?.find(s => (s.section || "").toLowerCase().startsWith((selectedSection || "").toLowerCase().split(" ")[0]));
                if (!secDetails) {
                  return <p className="text-xs text-muted-foreground">Section details unavailable for {selectedSection}.</p>;
                }
                
                // Filter weak bullets for experience/projects/summary sections
                const sectionBullets = analysis.weakBullets?.filter(wb => {
                  if (!wb || !wb.originalBullet) return false;
                  const lowerSec = (selectedSection || "").toLowerCase();
                  const lowerOrig = (wb.originalBullet || "").toLowerCase();
                  if (lowerSec.startsWith("proj")) {
                    return lowerOrig.includes("project") || lowerOrig.includes("built") || lowerOrig.includes("developed") || lowerOrig.includes("designed");
                  }
                  if (lowerSec.startsWith("exp")) {
                    return lowerOrig.includes("intern") || lowerOrig.includes("work") || lowerOrig.includes("role") || lowerOrig.includes("job");
                  }
                  return false;
                }) || [];

                return (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b pb-4">
                      <div>
                        <h2 className="text-lg font-black uppercase tracking-wide text-foreground">{secDetails.section} Analysis</h2>
                        <p className="text-xs text-muted-foreground">Deep evaluation parameters for this section</p>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Section Score</span>
                          <span className="text-lg font-black text-foreground">{secDetails.score} <span className="text-xs text-muted-foreground">/ 100</span></span>
                        </div>
                        <Badge className={cn("text-xs font-bold border px-3 py-1 border-none",
                          secDetails.status === "STRONG" ? "bg-green-100 text-green-800" :
                          secDetails.status === "GOOD" ? "bg-blue-100 text-blue-800" :
                          "bg-amber-100 text-amber-800"
                        )}>
                          {secDetails.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column: Explanation & Signals */}
                      <div className="space-y-6">
                        <Card className="border-none shadow-sm">
                          <CardHeader className="pb-2"><span className="text-xs uppercase font-bold text-muted-foreground">Why this score</span></CardHeader>
                          <CardContent><p className="text-xs text-foreground leading-relaxed font-semibold">{secDetails.explanation}</p></CardContent>
                        </Card>

                        {/* Strengths */}
                        {Array.isArray(secDetails.strengths) && secDetails.strengths.length > 0 && (
                          <Card className="border-none shadow-sm">
                            <CardHeader className="pb-2"><span className="text-xs font-bold text-green-700 uppercase">Strengths</span></CardHeader>
                            <CardContent>
                              <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
                                {secDetails.strengths.map((str, idx) => (
                                  <li key={idx} className="text-foreground">{str}</li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}
                      </div>

                      {/* Right Column: Improvements & Checks */}
                      <div className="space-y-6">
                        {/* Improvements */}
                        {Array.isArray(secDetails.improvements) && secDetails.improvements.length > 0 && (
                          <Card className="border-none shadow-sm">
                            <CardHeader className="pb-2"><span className="text-xs font-bold text-amber-700 uppercase">Improvements Required</span></CardHeader>
                            <CardContent>
                              <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
                                {secDetails.improvements.map((imp, idx) => (
                                  <li key={idx} className="text-foreground">{imp}</li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>

                    {/* Section Bullets Quality */}
                    {sectionBullets.length > 0 && (
                      <Card className="border-none shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs uppercase font-black text-muted-foreground tracking-wider">✍️ Bullet Point Diagnostics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {sectionBullets.map((wb, idx) => (
                            <div key={idx} className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-900/60 space-y-2">
                              <div className="text-[10px] text-muted-foreground font-bold uppercase">Original Bullet:</div>
                              <p className="text-xs text-foreground font-semibold">"{wb.originalBullet}"</p>
                              <div className="flex flex-wrap gap-1.5">
                                {wb.problems.map((prob, pIdx) => (
                                  <Badge key={pIdx} variant="destructive" className="text-[9px] px-1.5 py-0.5 border-none">{prob}</Badge>
                                ))}
                              </div>
                              <div className="text-xs pt-1 leading-relaxed">
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">Suggested Safe Rewrite:</span>
                                <p className="text-foreground font-medium italic">"{wb.rewriteSuggestion}"</p>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* SKILL INTELLIGENCE TAB */}
        {activeTab === "SKILL INTELLIGENCE" && (
          <div className="flex flex-col h-full space-y-6">
            {/* Top: Skill Gap Summary */}
            <Card className="border-none shadow-sm shrink-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black uppercase tracking-wider text-foreground">🎯 Dynamic Skill Gap Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-red-200/60 bg-red-500/5 space-y-2">
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest block">Critical Skills Gap</span>
                    <div className="flex flex-wrap gap-1.5">
                      {s.criticalMissing.map((skill, i) => (
                        <span key={i} className="text-[10px] px-2 py-1 bg-red-100 text-red-800 font-bold rounded-md">{skill}</span>
                      ))}
                      {s.criticalMissing.length === 0 && <span className="text-[10px] text-muted-foreground italic">No critical gaps</span>}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-amber-200/60 bg-amber-500/5 space-y-2">
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">Important Gaps</span>
                    <div className="flex flex-wrap gap-1.5">
                      {s.importantMissing.map((skill, i) => (
                        <span key={i} className="text-[10px] px-2 py-1 bg-amber-100 text-amber-800 font-bold rounded-md">{skill}</span>
                      ))}
                      {s.importantMissing.length === 0 && <span className="text-[10px] text-muted-foreground italic">No important gaps</span>}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-blue-200/60 bg-blue-500/5 space-y-2">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block">Nice-to-Have Gaps</span>
                    <div className="flex flex-wrap gap-1.5">
                      {s.niceToHaveMissing.map((skill, i) => (
                        <span key={i} className="text-[10px] px-2 py-1 bg-blue-100 text-blue-800 font-bold rounded-md">{skill}</span>
                      ))}
                      {s.niceToHaveMissing.length === 0 && <span className="text-[10px] text-muted-foreground italic">No nice-to-have gaps</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottom: Skill Evidence Matrix with internal scroll and filters */}
            <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-sm">
              <CardHeader className="pb-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <CardTitle className="text-sm font-black uppercase tracking-wider text-foreground">🔍 Skill Evidence Graph</CardTitle>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-60">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search skill evidence..."
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      className="w-full text-xs h-8 pl-8 pr-3 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
                    />
                  </div>
                  <select
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    className="text-xs h-8 px-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
                  >
                    <option value="ALL">All Levels</option>
                    <option value="LISTED_ONLY">Listed Only</option>
                    <option value="PARTIAL_EVIDENCE">Partial Evidence</option>
                    <option value="STRONG_EVIDENCE">Strong Evidence</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-0 border-t">
                {(() => {
                  const filteredSkills = analysis.skillEvidence?.filter(sk => {
                    const skillName = sk.skill || "";
                    const matchesSearch = skillName.toLowerCase().includes(skillSearch.toLowerCase());
                    const matchesType = skillFilter === "ALL" || sk.credibilityStatus === skillFilter;
                    return matchesSearch && matchesType;
                  }) || [];

                  return (
                    <div className="h-full overflow-y-auto">
                      <table className="w-full text-left text-sm relative border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 text-[9px] uppercase font-bold text-muted-foreground tracking-wider border-b border-border z-10">
                          <tr>
                            <th className="py-2.5 px-4 bg-slate-50 dark:bg-slate-900">Skill</th>
                            <th className="py-2.5 px-4 bg-slate-50 dark:bg-slate-900">Listed</th>
                            <th className="py-2.5 px-4 bg-slate-50 dark:bg-slate-900">In Projects</th>
                            <th className="py-2.5 px-4 bg-slate-50 dark:bg-slate-900">In Experience</th>
                            <th className="py-2.5 px-4 bg-slate-50 dark:bg-slate-900">In Internships</th>
                            <th className="py-2.5 px-4 text-center bg-slate-50 dark:bg-slate-900">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-xs">
                          {filteredSkills.map((sk, i) => (
                            <tr key={i} className="hover:bg-muted/30">
                              <td className="py-2 px-4 font-bold text-foreground">{sk.skill}</td>
                              <td className="py-2 px-4">{sk.listedInSkills ? "✅" : "❌"}</td>
                              <td className="py-2 px-4">{sk.foundInProjects ? "✅" : "❌"}</td>
                              <td className="py-2 px-4">{sk.foundInExperience ? "✅" : "❌"}</td>
                              <td className="py-2 px-4">{sk.foundInInternships ? "✅" : "❌"}</td>
                              <td className="py-2 px-4 text-center">
                                <Badge className={cn("text-[9px] font-bold border-none",
                                  sk.credibilityStatus === "STRONG_EVIDENCE" ? "bg-green-100 text-green-800" :
                                  sk.credibilityStatus === "PARTIAL_EVIDENCE" ? "bg-blue-100 text-blue-800" :
                                  "bg-amber-100 text-amber-800"
                                )}>
                                  {sk.credibilityStatus.replace("_", " ")}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                          {filteredSkills.length === 0 && (
                            <tr>
                              <td colSpan={6} className="py-4 text-center text-muted-foreground italic">No matching skills found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}

        {/* RECRUITER VIEW TAB */}
        {activeTab === "RECRUITER VIEW" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-y-auto pr-2 pb-6 print:grid-cols-3 print:overflow-visible">
            {/* Left large column */}
            <div className="lg:col-span-2 space-y-6">
              {/* KPI Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 shrink-0">
                {[
                  { label: "Initial Scan", value: "6–8 sec", sub: "Recruiter attention" },
                  { label: "ATS Parse Success", value: `${s.atsParsability}%`, sub: "Formatting safety" },
                  { label: "Visual Quality", value: `${s.visualQuality}/10`, sub: "Layout clarity" },
                  { label: "Formatting Quality", value: `${s.readabilityScore}%`, sub: "Uniform segments" },
                  { label: "Professionalism", value: `${s.professionalismScore}%`, sub: "Language safety" }
                ].map((kpi, i) => (
                  <div key={i} className="p-3 rounded-xl border border-border/60 bg-background shadow-sm space-y-0.5 text-center">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold block">{kpi.label}</span>
                    <span className="text-base font-black text-foreground block">{kpi.value}</span>
                    <span className="text-[8px] text-muted-foreground block">{kpi.sub}</span>
                  </div>
                ))}
              </div>

              {/* Company Compatibility Matches Table */}
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black uppercase tracking-wider text-foreground">🏢 Company Compatibility Matches</CardTitle>
                </CardHeader>
                <CardContent className="p-0 border-t">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-[10px] uppercase font-bold text-muted-foreground tracking-wider border-b border-border">
                        <tr>
                          <th className="py-2.5 px-4">Company</th>
                          <th className="py-2.5 px-4 text-center">Match</th>
                          <th className="py-2.5 px-4">Recruiter Insight</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-xs">
                        {s.companiesList.map((comp) => {
                          const isExpanded = expandedCompany === comp.name;
                          return (
                            <>
                              <tr key={comp.name} className="hover:bg-muted/30">
                                <td className="py-2.5 px-4 font-bold text-foreground">{comp.name}</td>
                                <td className="py-2.5 px-4 text-center">
                                  <span className={cn("font-black text-xs",
                                    comp.score >= 90 ? "text-green-600" :
                                    comp.score >= 80 ? "text-blue-600" :
                                    comp.score >= 70 ? "text-amber-600" : "text-red-600"
                                  )}>{comp.score}%</span>
                                </td>
                                <td className="py-2.5 px-4">
                                  <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => setExpandedCompany(isExpanded ? null : comp.name)}
                                    className="p-0 h-auto text-[11px] font-bold text-primary"
                                  >
                                    {isExpanded ? "Hide Recruiter Insight" : "View Recruiter Insight"}
                                  </Button>
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr key={`${comp.name}-detail`}>
                                  <td colSpan={3} className="bg-slate-50 dark:bg-slate-900/60 p-4 text-xs leading-relaxed text-muted-foreground border-t-0">
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-bold text-foreground uppercase tracking-wider block">Stack Alignment & Analysis</span>
                                      <p>{comp.reason}</p>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Recruiter Verdict */}
              <Card className="border-none shadow-sm border border-primary/15 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" /> Recruiter Verdict
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-background p-3 rounded-lg border border-border shadow-sm">
                    <span className="font-bold text-foreground">Initial Assessment</span>
                    <Badge className={cn("font-black text-xs border-none px-2.5 py-0.5", s.verdictStyle)}>
                      {s.recruiterVerdict.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-normal font-semibold mt-2">{s.verdict}</p>
                </CardContent>
              </Card>

              {/* CTC Package Forecast */}
              {(() => {
                const isUnavailable = s.salary.current === "N/A" || s.salary.potential === "N/A";
                return (
                  <Card className={cn("border-none shadow-sm", isUnavailable ? "bg-slate-500/5 border border-slate-500/10" : "bg-emerald-500/5 border border-emerald-500/20")}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs uppercase font-black text-foreground tracking-widest flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> CTC Package Forecast
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {isUnavailable ? (
                        <div className="text-center py-4 space-y-1">
                          <span className="text-xs font-bold text-slate-500 block uppercase">PACKAGE FORECAST UNAVAILABLE</span>
                          <p className="text-[10px] text-muted-foreground">Insufficient reliable profile or market evidence to estimate compensation.</p>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            {[
                              { label: "Minimum LPA", value: s.salary.current, color: "text-foreground" },
                              { label: "Maximum LPA", value: s.salary.potential, color: "text-emerald-600 dark:text-emerald-400" },
                            ].map((tier, i) => (
                              <div key={i} className="text-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/10">
                                <span className="text-[9px] text-muted-foreground uppercase font-extrabold block">{tier.label}</span>
                                <span className={cn("text-sm font-black block mt-0.5", tier.color)}>{tier.value}</span>
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] font-semibold text-foreground/80 leading-relaxed border-t border-emerald-500/20 pt-2">
                            Basis: {s.salary.basis}. Estimates are conservative market benchmarks.
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })()}
            </div>
          </div>
        )}

        {/* ATS CHECKS TAB */}
        {activeTab === "ATS CHECKS" && (
          <div className="flex flex-col h-full space-y-4">
            {/* Filters and counters */}
            <Card className="border-none shadow-sm shrink-0">
              <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-muted-foreground shrink-0">{analysis.checks?.length || 0} Checks Run</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-800 rounded">
                      {analysis.checks?.filter(c => c.status === "PASS").length || 0} Passed
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                      {analysis.checks?.filter(c => c.status === "WARNING").length || 0} Warnings
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-800 rounded">
                      {analysis.checks?.filter(c => c.status === "FAIL").length || 0} Failed
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-muted-foreground">Filter:</span>
                  <div className="flex border rounded-lg bg-background overflow-hidden h-8">
                    {([
                      { key: "ALL", label: "All" },
                      { key: "ISSUES", label: "Issues" },
                      { key: "FAILED", label: "Failed" },
                      { key: "WARNING", label: "Warnings" },
                      { key: "PASSED", label: "Passed" }
                    ] as const).map((filter) => (
                      <button
                        key={filter.key}
                        onClick={() => setChecksFilter(filter.key)}
                        className={cn(
                          "px-2.5 text-[10px] font-bold transition-all focus:outline-none border-r border-border last:border-0",
                          checksFilter === filter.key
                            ? "bg-slate-100 text-foreground dark:bg-slate-800"
                            : "text-muted-foreground hover:bg-muted/10"
                        )}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* List with internal scroll */}
            <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-sm">
              <CardContent className="flex-1 overflow-y-auto p-0">
                {(() => {
                  const filteredChecks = analysis.checks?.filter(c => {
                    if (checksFilter === "ALL") return true;
                    if (checksFilter === "ISSUES") return c.status === "FAIL" || c.status === "WARNING";
                    if (checksFilter === "FAILED") return c.status === "FAIL";
                    if (checksFilter === "WARNING") return c.status === "WARNING";
                    if (checksFilter === "PASSED") return c.status === "PASS";
                    return true;
                  }) || [];

                  return (
                    <div className="divide-y divide-border h-full overflow-y-auto">
                      {filteredChecks.map((ch) => {
                        const isExpanded = expandedCheck === ch.checkId;
                        return (
                          <div key={ch.checkId} className="hover:bg-muted/5 transition-all">
                            <button
                              onClick={() => setExpandedCheck(isExpanded ? null : ch.checkId)}
                              className="w-full p-4 flex justify-between items-start text-left focus:outline-none"
                            >
                              <div className="flex gap-3">
                                <span className="mt-0.5 shrink-0">
                                  {ch.status === "PASS" ? <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                                   ch.status === "FAIL" ? <XCircle className="w-4 h-4 text-red-500" /> :
                                   <AlertCircle className="w-4 h-4 text-amber-500" />}
                                </span>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-bold text-foreground">{ch.title}</h4>
                                    <Badge className={cn("text-[8px] font-black uppercase px-1 py-0 border-none shrink-0",
                                      ch.status === "PASS" ? "bg-green-100 text-green-800" :
                                      ch.status === "FAIL" ? "bg-red-100 text-red-800" :
                                      "bg-amber-100 text-amber-800"
                                    )}>
                                      {ch.status}
                                    </Badge>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground">{ch.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-right shrink-0">
                                <div className="space-y-0.5">
                                  <span className="text-xs font-black text-foreground block">{ch.earnedPoints} <span className="text-[10px] text-muted-foreground">/ {ch.maxPoints} pts</span></span>
                                </div>
                                <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform", isExpanded && "transform rotate-90")} />
                              </div>
                            </button>
                            
                            {isExpanded && (
                              <div className="px-11 pb-4 text-xs space-y-2 border-t pt-3 bg-slate-50 dark:bg-slate-900/40 border-border/40 animate-fadeIn">
                                {ch.evidence && (
                                  <div className="space-y-0.5">
                                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Full Evidence</span>
                                    <p className="font-mono text-[10px] text-foreground bg-slate-100 dark:bg-slate-800 p-2 rounded border border-border/40 leading-relaxed">{ch.evidence}</p>
                                  </div>
                                )}
                                {ch.recommendation && (
                                  <div className="space-y-0.5">
                                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Actionable Recommendation</span>
                                    <p className="text-primary font-semibold leading-relaxed">{ch.recommendation}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {filteredChecks.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-6 italic">No checks match this filter.</p>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
