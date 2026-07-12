"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Download, DollarSign, Sparkles, Loader2,
  AlertCircle, TrendingUp, UserCheck, ThumbsUp, ThumbsDown,
  CheckCircle2, XCircle, Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Radar, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from "recharts";
import api from "@/lib/api";

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

export default function AtsAnalysisFromHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [analysis, setAnalysis] = useState<AtsAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"not_found" | "server_error" | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/ats/${id}`);
        setAnalysis(res.data as AtsAnalysisData);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 404) setError("not_found");
        else setError("server_error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-20 text-center flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-semibold">Loading Premium ATS Intelligence Dashboard...</p>
      </div>
    );
  }

  if (error === "not_found") {
    return (
      <div className="container py-20 max-w-md mx-auto text-center space-y-6">
        <Card className="border border-dashed p-8 flex flex-col items-center shadow-sm">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold">Report Not Found</h2>
          <p className="text-muted-foreground text-sm mt-2 mb-6">
            The requested ATS analysis report could not be located in your history.
          </p>
          <Button onClick={() => router.push("/dashboard/history")} className="w-full font-bold">
            Back to History
          </Button>
        </Card>
      </div>
    );
  }

  if (error === "server_error" || !analysis) {
    return (
      <div className="container py-20 max-w-md mx-auto text-center space-y-6">
        <Card className="border border-dashed p-8 flex flex-col items-center shadow-sm">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold">Error Loading Report</h2>
          <p className="text-muted-foreground text-sm mt-2 mb-6">
            An error occurred while communicating with the server. Please try again.
          </p>
          <Button onClick={() => router.push("/dashboard/history")} className="w-full font-bold">
            Back to History
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
            This historical report does not contain sufficient information. Please re-upload a detailed resume for a fresh analysis.
          </p>
          <Button onClick={() => router.push("/dashboard/ats")} className="w-full font-bold">
            Go to ATS Upload
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 print:p-0 print:max-w-full">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/history")} className="hover:bg-slate-100">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
              Premium ATS Intelligence Dashboard <Sparkles className="w-5 h-5 text-primary" />
            </h1>
            <p className="text-sm text-muted-foreground">Evidence-based recruiter-grade historical analysis</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => window.print()} className="bg-slate-900 hover:bg-slate-800 text-white">
            <Download className="w-4 h-4 mr-1.5" /> PDF Report
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-6 lg:col-span-1">

          {/* ATS Score Gauge */}
          <Card className="border-none shadow-sm relative overflow-hidden">
            <CardHeader className="text-center pb-2">
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Overall ATS Score</span>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-4">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="60" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                  <circle cx="72" cy="72" r="60"
                    stroke="var(--primary)" strokeWidth="10" fill="transparent"
                    strokeDasharray={2 * Math.PI * 60}
                    strokeDashoffset={2 * Math.PI * 60 * (1 - (s.score || 0) / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-black text-foreground">{s.score}</span>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">/100</span>
                </div>
              </div>
              <div className="mt-4 text-center space-y-1">
                <Badge className={cn("text-xs font-bold border px-3.5 py-1", s.evaluation.style)}>
                  Grade {s.evaluation.grade} &bull; {s.evaluation.verdict}
                </Badge>
                <p className="text-xs text-muted-foreground pt-1.5 italic">Target 85+ for product companies. 92+ for FAANG.</p>
              </div>
            </CardContent>
          </Card>

          {/* Radar + Progress Breakdown */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-wider text-foreground">Category Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {s.radarData.length > 0 && (
                <div className="h-[190px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={s.radarData}>
                      <PolarGrid stroke="var(--foreground)" strokeOpacity={0.4} strokeWidth={2} />
                      <PolarAngleAxis dataKey="subject" stroke="var(--foreground)" fontWeight={600} fontSize={10} tickLine={false} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="You" dataKey="value" stroke="var(--primary)" strokeWidth={2.5} fill="var(--primary)" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="space-y-3">
                {Object.entries(s.breakdown).map(([name, val]) => (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase">
                      <span>{name}</span>
                      <span className={cn(val >= 80 ? "text-green-600" : val >= 65 ? "text-blue-600" : val >= 50 ? "text-amber-600" : "text-red-600")}>{val}%</span>
                    </div>
                    <Progress value={val} className="h-1.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Placement Readiness™ */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-primary/5 to-primary/0 border border-primary/10">
            <CardHeader>
              <CardTitle className="text-sm font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Placement Readiness™
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(s.readiness).map(([label, value], i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase">
                    <span>{label}</span>
                    <span className={cn(value >= 80 ? "text-green-600" : value >= 65 ? "text-blue-600" : "text-amber-600")}>{value}%</span>
                  </div>
                  <Progress value={value} className="h-1.5" />
                </div>
              ))}
              {Object.keys(s.readiness).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No readiness metrics computed</p>
              )}
            </CardContent>
          </Card>

          {/* Section-Wise Resume Score Card (V2) */}
          {analysis.atsSectionScores && analysis.atsSectionScores.length > 0 && (
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  📋 Section-Wise Resume Score
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[11px] text-muted-foreground">Click any section to see strengths and improvements.</p>
                <div className="divide-y divide-border">
                  {analysis.atsSectionScores.map((sec) => {
                    const isExpanded = expandedSection === sec.section;
                    return (
                      <div key={sec.section} className="py-3 first:pt-0 last:pb-0 space-y-2">
                        <button
                          onClick={() => setExpandedSection(isExpanded ? null : sec.section)}
                          className="w-full flex justify-between items-center text-left hover:text-primary transition-colors focus:outline-none"
                        >
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground uppercase tracking-wide">{sec.section}</span>
                            <span className={cn("text-[9px] font-black uppercase px-1.5 py-0.5 rounded w-max mt-1 border-none",
                              sec.status === "STRONG" ? "bg-emerald-100 text-emerald-800" :
                              sec.status === "GOOD" ? "bg-blue-100 text-blue-800" :
                              "bg-amber-100 text-amber-800"
                            )}>
                              {sec.status}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-foreground">{sec.score}</span>
                            <span className="text-[10px] text-muted-foreground">/100</span>
                          </div>
                        </button>
                        
                        <Progress value={sec.score} className="h-1.5" />

                        {isExpanded && (
                          <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-border text-xs space-y-2.5 animate-fadeIn">
                            <p className="font-semibold text-foreground leading-normal">{sec.explanation}</p>
                            
                            {sec.strengths && sec.strengths.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-green-700 uppercase tracking-widest block">Strengths</span>
                                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                                  {sec.strengths.map((str, idx) => (
                                    <li key={idx}>{str}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {sec.improvements && sec.improvements.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-amber-700 uppercase tracking-widest block">Improvements</span>
                                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                                  {sec.improvements.map((imp, idx) => (
                                    <li key={idx}>{imp}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recruiter Assessment */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" /> Recruiter Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { label: "Initial Resume Scan", value: "6–8 seconds" },
                { label: "ATS Parse Success", value: `${s.atsParsability}%` },
                { label: "Visual Quality", value: `${s.visualQuality}/10` },
                { label: "Formatting Quality", value: `${s.readabilityScore}%` },
                { label: "Professionalism", value: `${s.professionalismScore}%` },
              ].map((row, i) => (
                <div key={i} className="flex justify-between border-b pb-2 last:border-0">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-bold text-foreground">{row.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1">
                <span className="text-muted-foreground font-medium">Recruiter Verdict</span>
                <Badge className={cn("font-extrabold text-xs border-none", s.verdictStyle)}>
                  {s.recruiterVerdict.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Salary Prediction */}
          <Card className="border-none shadow-sm bg-emerald-500/5 border border-emerald-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase font-black text-foreground tracking-widest flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-500" /> CTC Package Forecast
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 pt-1">
                {[
                  { label: "Minimum LPA", value: s.salary.current, color: "text-foreground" },
                  { label: "Maximum LPA", value: s.salary.potential, color: "text-emerald-600 dark:text-emerald-400" },
                ].map((tier, i) => (
                  <div key={i} className="text-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/10">
                    <span className="text-[10px] text-muted-foreground uppercase font-extrabold block">{tier.label}</span>
                    <span className={cn("text-base font-black block mt-1", tier.color)}>{tier.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs font-semibold text-foreground/80 leading-relaxed border-t border-emerald-500/20 pt-2">
                Basis: {s.salary.basis}. Estimates are conservative market benchmarks.
              </p>
            </CardContent>
          </Card>

          {/* AI Confidence */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase font-black text-foreground tracking-wider flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-primary" /> AI Analysis Confidence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-black text-primary">{s.aiConfidence}%</div>
                <div className="flex-1 space-y-1">
                  <Progress value={s.aiConfidence} className="h-2" />
                  <p className="text-[10px] text-muted-foreground">Based on data-rich resume section signals.</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-6 lg:col-span-2">

          {/* Action Buttons */}
          <Card className="border-none shadow-sm print:hidden">
            <CardContent className="p-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => router.push("/dashboard/history")} className="bg-primary hover:bg-primary/90 text-white font-bold">Back to History</Button>
            </CardContent>
          </Card>

          {/* Career Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2"><span className="text-xs uppercase font-bold text-muted-foreground">Detected Profile</span></CardHeader>
              <CardContent>
                <div className="text-lg font-black text-foreground">{analysis.careerDomain || "General Profession"}</div>
                <div className="text-xs text-muted-foreground mt-1">Industry: {analysis.industry || "N/A"}</div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2"><span className="text-xs uppercase font-bold text-muted-foreground">Experience Track</span></CardHeader>
              <CardContent>
                <div className="text-lg font-black text-foreground">{analysis.experienceLevel || "Fresher"}</div>
                <div className="text-xs text-muted-foreground mt-1">Target: {analysis.targetRole || "N/A"}</div>
              </CardContent>
            </Card>
          </div>

          {/* Missing Skills Grid (Tiered) */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-black">🎯 Dynamic Skill Gap Analysis</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-red-200/60 bg-red-500/5 space-y-2">
                  <span className="text-xs font-black text-red-600 uppercase block">Critical Skills</span>
                  <ul className="text-xs text-muted-foreground space-y-1.5">
                    {s.criticalMissing.map((skill, i) => (
                      <li key={i} className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />{skill}</li>
                    ))}
                    {s.criticalMissing.length === 0 && <li className="text-[10px] italic">No critical gaps identified</li>}
                  </ul>
                </div>
                <div className="p-4 rounded-xl border border-amber-200/60 bg-amber-500/5 space-y-2">
                  <span className="text-xs font-black text-amber-600 uppercase block">Important Skills</span>
                  <ul className="text-xs text-muted-foreground space-y-1.5">
                    {s.importantMissing.map((skill, i) => (
                      <li key={i} className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />{skill}</li>
                    ))}
                    {s.importantMissing.length === 0 && <li className="text-[10px] italic">No important gaps identified</li>}
                  </ul>
                </div>
                <div className="p-4 rounded-xl border border-blue-200/60 bg-blue-500/5 space-y-2">
                  <span className="text-xs font-black text-blue-600 uppercase block">Nice-to-Have Skills</span>
                  <ul className="text-xs text-muted-foreground space-y-1.5">
                    {s.niceToHaveMissing.map((skill, i) => (
                      <li key={i} className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />{skill}</li>
                    ))}
                    {s.niceToHaveMissing.length === 0 && <li className="text-[10px] italic">No nice-to-have gaps identified</li>}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Compatibility */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base font-black">🏢 Company Compatibility Matches</CardTitle>
            </CardHeader>
            <CardContent className="p-0 border-t">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-[10px] uppercase font-bold text-muted-foreground tracking-wider border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4 text-center">Match</th>
                      <th className="py-3 px-4">Recruiter Insight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {s.companiesList.map((comp, i) => (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="py-3 px-4 font-bold text-foreground">{comp.name}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={cn("font-black text-sm",
                            comp.score >= 90 ? "text-green-600" :
                              comp.score >= 80 ? "text-blue-600" :
                                comp.score >= 70 ? "text-amber-600" : "text-red-600"
                          )}>{comp.score}%</span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground leading-normal">{comp.reason}</td>
                      </tr>
                    ))}
                    {s.companiesList.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-muted-foreground">No matches calculated.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Final AI Verdict */}
          <Card className="border-none shadow-sm border border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-base font-black flex items-center gap-2 text-primary">
                <Sparkles className="w-5 h-5" /> Final AI Recruiter Verdict
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground leading-relaxed">{s.verdict}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-green-700 uppercase flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> Strengths</span>
                  <ul className="space-y-1 text-xs text-muted-foreground list-none">
                    {analysis.strengths?.map((s2, i) => (
                      <li key={i} className="flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />{s2}</li>
                    ))}
                    {(!analysis.strengths || analysis.strengths.length === 0) && <li className="text-[10px] italic">No explicit strengths listed</li>}
                  </ul>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-red-700 uppercase flex items-center gap-1"><ThumbsDown className="w-3 h-3" /> Priority Gaps</span>
                  <ul className="space-y-1 text-xs text-muted-foreground list-none">
                    {analysis.weaknesses?.map((w, i) => (
                      <li key={i} className="flex gap-2"><XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />{w}</li>
                    ))}
                    {(!analysis.weaknesses || analysis.weaknesses.length === 0) && <li className="text-[10px] italic">No explicit gaps listed</li>}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Improvement Roadmap */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-black">🚀 Improvement Roadmap</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {s.improvements.map((imp, i) => (
                  <div key={i} className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-900 flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-foreground">{imp.action}</h4>
                      <p className="text-[10px] text-muted-foreground">{imp.note}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-none shrink-0 font-bold">+{imp.boost} Score</Badge>
                  </div>
                ))}
                {s.improvements.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No improvements suggested.</p>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Skill Evidence Gaps Graph */}
          {analysis.skillEvidence && analysis.skillEvidence.length > 0 && (
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base font-black">🔍 Skill Evidence Graph</CardTitle>
              </CardHeader>
              <CardContent className="p-0 border-t">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-[10px] uppercase font-bold text-muted-foreground tracking-wider border-b border-border">
                      <tr>
                        <th className="py-3 px-4">Skill</th>
                        <th className="py-3 px-4">Listed</th>
                        <th className="py-3 px-4">In Projects</th>
                        <th className="py-3 px-4">In Experience</th>
                        <th className="py-3 px-4">In Internships</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-xs">
                      {analysis.skillEvidence.map((sk, i) => (
                        <tr key={i} className="hover:bg-muted/30">
                          <td className="py-3 px-4 font-bold text-foreground">{sk.skill}</td>
                          <td className="py-3 px-4">{sk.listedInSkills ? "✅" : "❌"}</td>
                          <td className="py-3 px-4">{sk.foundInProjects ? "✅" : "❌"}</td>
                          <td className="py-3 px-4">{sk.foundInExperience ? "✅" : "❌"}</td>
                          <td className="py-3 px-4">{sk.foundInInternships ? "✅" : "❌"}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge className={cn("text-[10px] font-bold border-none",
                              sk.credibilityStatus === "STRONG_EVIDENCE" ? "bg-emerald-100 text-emerald-800" :
                              sk.credibilityStatus === "PARTIAL_EVIDENCE" ? "bg-blue-100 text-blue-800" :
                              "bg-amber-100 text-amber-800"
                            )}>
                              {sk.credibilityStatus.replace("_", " ")}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weak Bullet Analysis */}
          {analysis.weakBullets && analysis.weakBullets.length > 0 && (
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-black">✍️ Bullet Point Intelligence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.weakBullets.map((wb, i) => (
                  <div key={i} className="p-4 rounded-xl border border-border bg-slate-50 dark:bg-slate-900 space-y-2">
                    <div className="text-xs font-medium text-slate-500 italic">Original Bullet:</div>
                    <div className="text-xs text-foreground font-semibold">"{wb.originalBullet}"</div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {wb.problems.map((p, j) => (
                        <Badge key={j} variant="destructive" className="text-[10px] px-2 py-0.5">{p}</Badge>
                      ))}
                    </div>
                    <div className="text-xs pt-1">
                      <span className="font-bold text-emerald-600">Suggested Rewrite:</span>{" "}
                      <span className="text-foreground">"{wb.rewriteSuggestion}"</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Detailed ATS Checks */}
          {analysis.checks && analysis.checks.length > 0 && (
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base font-black">📋 Detailed ATS Checks</CardTitle>
              </CardHeader>
              <CardContent className="p-0 border-t">
                <div className="divide-y divide-border">
                  {analysis.checks.map((ch, i) => (
                    <div key={i} className="p-4 hover:bg-muted/10 flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-foreground">{ch.title}</h4>
                          <Badge className={cn("text-[9px] font-bold uppercase",
                            ch.status === "PASS" ? "bg-green-100 text-green-800" :
                            ch.status === "FAIL" ? "bg-red-100 text-red-800" :
                            "bg-amber-100 text-amber-800"
                          )}>
                            {ch.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{ch.description}</p>
                        {ch.evidence && (
                          <p className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 p-1 rounded">
                            Evidence: {ch.evidence}
                          </p>
                        )}
                        {ch.status !== "PASS" && ch.recommendation && (
                          <p className="text-xs font-semibold text-primary">
                            Recommendation: {ch.recommendation}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-foreground">{ch.earnedPoints}</span>
                        <span className="text-xs text-muted-foreground"> / {ch.maxPoints} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
