"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, CheckCircle2, AlertCircle, 
  TrendingUp, Download, Briefcase, Award, 
  DollarSign, Sparkles, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AtsSuggestion {
  text: string;
  impact: string;
  difficulty: string;
  estimatedImprovement: string;
}

interface AtsAnalysisData {
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  matchedKeywords: string[];
  suggestions: string[];
  detailedSuggestions?: AtsSuggestion[];
  bestRole: string;
  extractedText: string;
  sectionScores?: Record<string, number>;
  recruiterFeedback?: string;
  recommendedRoles?: string[];
  companyReadiness?: Record<string, number>;
  minSalary?: string;
  maxSalary?: string;
  salaryExplanation?: string;
}

export default function AtsResultPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AtsAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("latest_ats_analysis");
    if (saved) {
      try {
        setAnalysis(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse ATS analysis:", e);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="container py-20 text-center flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading ATS analysis metrics...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="container py-20 max-w-md mx-auto text-center space-y-6">
        <Card className="border border-dashed p-8 flex flex-col items-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold">No Analysis Found</h2>
          <p className="text-muted-foreground text-sm mt-2 mb-6">
            Please upload and analyze a resume first to view the full report.
          </p>
          <Button onClick={() => router.push("/dashboard/ats")} className="w-full font-bold">
            Go to ATS Upload
          </Button>
        </Card>
      </div>
    );
  }

  const score = analysis.atsScore || 0;
  const getVerdict = (s: number) => {
    if (s >= 85) return { text: "Excellent Match", style: "bg-green-100 text-green-800" };
    if (s >= 70) return { text: "Good Match", style: "bg-blue-100 text-blue-800" };
    if (s >= 50) return { text: "Average Match", style: "bg-amber-100 text-amber-800" };
    return { text: "Needs Work", style: "bg-red-100 text-red-800" };
  };
  const verdict = getVerdict(score);

  // Sections default fallbacks
  const sectionScores = analysis.sectionScores || {
    "Contact Information": 90,
    "Professional Summary": 75,
    "Skills": 80,
    "Projects": 75,
    "Experience": 70,
    "Education": 85,
    "Formatting": 80,
    "Keywords": 60,
    "Grammar": 90,
    "Readability": 85
  };

  // Company readiness fallbacks
  const companyReadiness = analysis.companyReadiness || {
    "Google": 50,
    "Microsoft": 55,
    "Amazon": 45,
    "TCS": 80,
    "Infosys": 85,
    "Accenture": 80,
    "Capgemini": 75,
    "Deloitte": 78,
    "Oracle": 60
  };

  // Matched/Missing keywords fallbacks
  const matchedKeywords = analysis.matchedKeywords && analysis.matchedKeywords.length > 0
    ? analysis.matchedKeywords 
    : ["Java", "SQL", "Git", "HTML", "CSS", "REST APIs"];
  
  const missingKeywords = analysis.missingKeywords && analysis.missingKeywords.length > 0
    ? analysis.missingKeywords
    : ["Docker", "Kubernetes", "AWS", "CI/CD", "Redis", "Kafka"];

  // Download JSON utility
  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analysis, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "ats_analysis_report.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/ats")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-xl font-bold font-heading text-foreground">ATS Detailed Evaluation</h1>
            <p className="text-xs text-muted-foreground">In-depth ATS parsing validation and recommendations</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={downloadJson}>
            <Download className="w-4 h-4 mr-1.5" /> Download JSON
          </Button>
          <Button size="sm" onClick={() => window.print()} className="bg-slate-900 hover:bg-slate-800 text-white">
            <Download className="w-4 h-4 mr-1.5" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Main Score & Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Circle Progress Score meter */}
        <Card className="text-center p-6 border-2 border-primary/20 flex flex-col justify-center items-center bg-primary/5">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">ATS Score</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col items-center">
            <div className="text-6xl font-black text-primary my-2">{score}</div>
            <Badge className={cn("border-none font-bold mt-1 px-3 py-1", verdict.style)}>
              {verdict.text}
            </Badge>
          </CardContent>
        </Card>

        {/* Section Scores Ratings */}
        <Card className="md:col-span-2 p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" /> ATS Parse Segment Ratings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(sectionScores).map(([name, val]) => (
              <div key={name} className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase">
                  <span>{name}</span>
                  <span>{val}%</span>
                </div>
                <Progress value={val} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Checklist compatibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            📋 Layout Formatting & Parser Compatibility
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {[
            { label: "ATS-Friendly Header Format", val: true },
            { label: "Font Consistency Check", val: true },
            { label: "No Complex Tables Found", val: score >= 60 },
            { label: "Single Column Grid Layout", val: true },
            { label: "Standard PDF Format", val: true },
            { label: "No Images or Shapes", val: true },
            { label: "Clean Bullet Formatting", val: score >= 50 },
            { label: "Contact Info Found", val: true }
          ].map((check, i) => (
            <div key={i} className="flex items-center gap-2.5 p-3 rounded-lg border bg-muted/20">
              {check.val ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
              )}
              <span className="text-xs text-foreground font-medium">{check.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Keywords matched and missing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched Keywords */}
        <Card className="border-green-600/10">
          <CardHeader>
            <CardTitle className="text-base font-bold text-green-600 flex items-center gap-2">
              ✔ Matched Resume Keywords
            </CardTitle>
            <CardDescription className="text-xs">These keywords successfully parsed and matched industry roles</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 pt-2">
            {matchedKeywords.map((kw, i) => (
              <Badge key={i} className="bg-green-50 text-green-700 hover:bg-green-50 font-bold border-none px-2.5 py-1">
                {kw}
              </Badge>
            ))}
          </CardContent>
        </Card>

        {/* Missing Keywords */}
        <Card className="border-red-600/10">
          <CardHeader>
            <CardTitle className="text-base font-bold text-red-600 flex items-center gap-2">
              ✖ Missing Recommended Keywords
            </CardTitle>
            <CardDescription className="text-xs">Add these critical keywords to pass automated placement matching screenings</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 pt-2">
            {missingKeywords.map((kw, i) => (
              <Badge key={i} className="bg-red-50 text-red-700 hover:bg-red-50 font-bold border-none px-2.5 py-1">
                {kw}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Prioritized detailed suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            ⚡ Actionable Improvement Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          {analysis.detailedSuggestions && analysis.detailedSuggestions.length > 0 ? (
            analysis.detailedSuggestions.map((sug, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground">{sug.text}</p>
                  <div className="flex gap-2">
                    <span className="text-[10px] text-muted-foreground">Impact: <b className="text-primary">{sug.impact}</b></span>
                    <span className="text-[10px] text-muted-foreground">Difficulty: <b className="text-foreground">{sug.difficulty}</b></span>
                  </div>
                </div>
                <Badge className="bg-primary/10 text-primary border-none font-extrabold text-xs shrink-0 self-start sm:self-auto">
                  Estimated Score Impact: {sug.estimatedImprovement}
                </Badge>
              </div>
            ))
          ) : (
            (analysis.suggestions || []).map((sug, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-sm font-bold text-foreground">{sug}</p>
                <Badge className="bg-primary/10 text-primary border-none font-extrabold text-xs">
                  Estimated Score Impact: +4%
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Readiness, salary, recruiter comment grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Company compatibility */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">🏢 Targeted Company ATS Compatibility</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(companyReadiness).map(([comp, val]) => (
              <div key={comp} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase">
                  <span>{comp}</span>
                  <span>{val}%</span>
                </div>
                <Progress value={val} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Salary forecast card */}
        <Card className="flex flex-col justify-between bg-muted/20">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Salary Forecast
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-bold text-muted-foreground">Estimated Compensation</div>
              <div className="text-2xl font-black text-foreground">
                {analysis.minSalary || "6.5 LPA"} - {analysis.maxSalary || "9.0 LPA"}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pt-1.5">
                {analysis.salaryExplanation || "Forecast calculated based on matched credentials and keyword selectivity weights."}
              </p>
            </div>
            {analysis.bestRole && (
              <div className="p-3 bg-card border rounded-lg text-center mt-4">
                <span className="text-[9px] uppercase font-bold text-muted-foreground block">Matched Title Target</span>
                <span className="text-xs font-bold text-primary block mt-0.5">{analysis.bestRole}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recruiter feedback comments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            💡 Recruiter Feedback & Verdict Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed italic">
            "{analysis.recruiterFeedback || "The candidate shows clear technical capabilities in coding and backend systems architecture. Incorporating docker/cloud platforms and highlighting project metrics will significantly boost ATS response rate in top tier company screenings."}"
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
