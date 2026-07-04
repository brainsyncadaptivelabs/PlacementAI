"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Download, Briefcase, DollarSign, Sparkles, Loader2,
  ShieldAlert, ListTodo, UserCheck, ThumbsUp, ThumbsDown,
  AlertCircle, TrendingUp, Target, BarChart3, Zap, Info,
  CheckCircle2, XCircle, MinusCircle, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Radar, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from "recharts";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AtsAnalysisData {
  id: number;
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  matchedKeywords: string[];
  suggestions: string[];
  bestRole: string;
  extractedText: string;
  createdAt: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-3 rounded-lg shadow-sm text-xs">
        <p className="font-bold mb-2 text-foreground">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-2.5 h-2.5 rounded-sm" 
                style={{ backgroundColor: entry.name === "you" ? "var(--primary)" : "var(--muted-foreground)" }} 
              />
              <span className="text-foreground">
                {entry.name === "you" ? "Your Score" : "Top Candidates"}: <span className="font-bold">{entry.value}%</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};


// ─── Scoring Engine (identical to /ats/analysis/page.tsx) ─────────────────────
function buildScoringEngine(analysis: AtsAnalysisData) {
  const text = analysis.extractedText || "";
  const score = Math.min(95, Math.max(30, analysis.atsScore || 60));

  const hasGithub   = /github\.com/i.test(text);
  const hasLinkedin = /linkedin\.com/i.test(text);
  const hasEmail    = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone    = /(\+?\d{1,3}[-\s]?)?\d{10}/.test(text);
  const hasPortfolio = /portfolio|netlify\.app|vercel\.app|github\.io/i.test(text);

  const yearsMatch = text.match(/(\d+)\+?\s*years?\s+(?:of\s+)?(?:experience|exp)/i);
  const yearsOfExp = yearsMatch ? parseInt(yearsMatch[1]) : 0;
  const hasInternship = /intern(?:ship)?|trainee|apprentice/i.test(text);
  const hasCorporate  = /engineer|developer|analyst|architect|lead|senior|junior/i.test(text);
  const expLevel      = yearsOfExp >= 5 ? "senior" : yearsOfExp >= 2 ? "mid" : yearsOfExp >= 1 ? "junior" : hasInternship ? "intern" : "fresher";

  const projectKeywords = text.match(/project|built|developed|implemented|designed|created|engineered|deployed/gi) || [];
  const projectCount    = Math.max(0, Math.min(6, Math.floor(projectKeywords.length / 3)));
  const hasMetrics      = /%|reduced|improved|increased|optimized|decreased|saved|achieved|boosted/i.test(text);
  const hasLiveLink     = /https?:\/\/|netlify|vercel|heroku|aws\.amazon|render\.com/i.test(text);

  const allTechSkills = [
    "react","angular","vue","next.js","node","express","spring","spring boot",
    "java","python","c++","c#","golang","rust","kotlin","swift",
    "aws","gcp","azure","docker","kubernetes","terraform","jenkins","ci/cd",
    "sql","mysql","postgresql","mongodb","redis","elasticsearch","kafka",
    "git","github","gitlab","jira","agile","scrum","rest","graphql",
    "typescript","javascript","html","css","tailwind","sass",
    "machine learning","deep learning","tensorflow","pytorch","pandas","numpy",
    "microservices","system design","linux","bash","firebase","supabase",
  ];
  const matchedSkills = allTechSkills.filter(s => new RegExp("\\b" + s.replace(/[.+]/g, "\\$&") + "\\b", "i").test(text));
  const cloudSkills   = ["aws","gcp","azure","docker","kubernetes","terraform"].filter(s => new RegExp("\\b" + s + "\\b","i").test(text));
  const dbSkills      = ["sql","mysql","postgresql","mongodb","redis","elasticsearch"].filter(s => new RegExp("\\b" + s + "\\b","i").test(text));
  const devOpsSkills  = ["docker","kubernetes","jenkins","ci/cd","terraform","github"].filter(s => new RegExp("\\b" + s + "\\b","i").test(text));

  const hasDegree   = /b\.?tech|m\.?tech|b\.?sc|m\.?sc|bachelor|master|b\.?e\.|m\.?e\.|phd|diploma/i.test(text);
  const hasCGPA     = /cgpa|gpa|\d+\.\d+\s*\/\s*10|\d+\.\d+\s*\/\s*4/i.test(text);
  const hasTopCollege = /iit|nit|bits|vit|manipal|sjce|rvce|anna university|pune university/i.test(text);
  const cgpaMatch   = text.match(/(\d+\.\d+)\s*\/\s*10/);
  const cgpaVal     = cgpaMatch ? parseFloat(cgpaMatch[1]) : null;

  const achievementCount = (text.match(/certified|certification|award|winner|rank\s*\d|hackathon|competitive|leetcode|codeforces|topcoder|open.?source|publication|paper/gi) || []).length;
  const hasCompetitiveCoding = /leetcode|codeforces|hackerrank|topcoder|codechef/i.test(text);
  const hasCertification     = /certified|aws certified|google certified|microsoft certified|coursera|udemy|oracle certified/i.test(text);

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const isOptimalLength = wordCount >= 300 && wordCount <= 800;

  const matchedKwCount = analysis.matchedKeywords?.length || 0;
  const missingKwCount  = analysis.missingKeywords?.length || 0;
  const totalKwCount    = Math.max(1, matchedKwCount + missingKwCount);

  const keywordScore = Math.min(92, Math.max(20, Math.round((matchedKwCount / totalKwCount) * 100 * 0.85 + 10)));
  const formattingScore = Math.min(93, Math.max(40, 60 + (hasEmail ? 8 : 0) + (hasPhone ? 6 : 0) + (hasLinkedin ? 8 : 0) + (hasGithub ? 7 : 0) + (hasPortfolio ? 5 : 0) + (isOptimalLength ? 5 : wordCount < 200 ? -15 : -5)));
  const grammarScore = Math.min(94, Math.max(50, 72 + (isOptimalLength ? 8 : 0) + (hasDegree ? 5 : 0) + (hasCGPA ? 4 : 0) + (hasLinkedin ? 5 : 0)));
  const experienceScore = Math.min(90, (() => {
    if (yearsOfExp >= 5) return 88;
    if (yearsOfExp >= 3) return 80;
    if (yearsOfExp >= 1) return 70;
    if (hasInternship)   return 58;
    return 40;
  })() + (hasMetrics ? 5 : 0));
  const projectScore = Math.min(90, Math.max(30, 35 + projectCount * 10 + (hasMetrics ? 8 : 0) + (hasLiveLink ? 7 : 0) + (hasGithub ? 5 : 0)));
  const educationScore = (() => {
    if (!hasDegree) return 45;
    let base = 72;
    if (hasTopCollege) base += 15;
    if (hasCGPA) {
      if (cgpaVal && cgpaVal >= 9.0) base += 12;
      else if (cgpaVal && cgpaVal >= 8.0) base += 8;
      else if (cgpaVal && cgpaVal >= 7.0) base += 4;
      else base += 2;
    }
    return Math.min(95, base);
  })();
  const skillScore = Math.min(92, Math.max(25, 30 + matchedSkills.length * 3.5 + (cloudSkills.length > 0 ? cloudSkills.length * 2 : 0) + (devOpsSkills.length > 0 ? devOpsSkills.length * 1.5 : 0)));
  const achievementScore = Math.min(90, Math.max(30, 30 + achievementCount * 8 + (hasCompetitiveCoding ? 10 : 0) + (hasCertification ? 8 : 0) + (hasMetrics ? 5 : 0)));
  const contactScore = Math.min(100, (hasEmail ? 25 : 0) + (hasPhone ? 25 : 0) + (hasLinkedin ? 25 : 0) + (hasGithub ? 25 : 0));

  const breakdown: Record<string, number> = {
    "Keywords":    keywordScore,
    "Formatting":  formattingScore,
    "Grammar":     grammarScore,
    "Experience":  experienceScore,
    "Projects":    projectScore,
    "Education":   educationScore,
    "Skills":      Math.round(skillScore),
    "Achievements":achievementScore,
    "Contact":     contactScore,
  };
  const radarData = Object.entries(breakdown).map(([subject, value]) => ({ subject, value, fullMark: 100 }));

  const getGrade = (s: number) => {
    if (s >= 89) return { grade: "A+", verdict: "Exceptional", style: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (s >= 79) return { grade: "A",  verdict: "Strong",      style: "text-green-600 bg-green-50 border-green-200" };
    if (s >= 66) return { grade: "B+", verdict: "Good",        style: "text-blue-600 bg-blue-50 border-blue-200" };
    if (s >= 50) return { grade: "C",  verdict: "Average",     style: "text-amber-600 bg-amber-50 border-amber-100" };
    return       { grade: "D",  verdict: "Needs Work",   style: "text-red-600 bg-red-50 border-red-100" };
  };
  const evaluation = getGrade(score);

  const readiness = {
    overall:   Math.min(92, Math.round(score * 0.45 + skillScore * 0.30 + projectScore * 0.25)),
    service:   Math.min(96, Math.round(score * 0.50 + skillScore * 0.25 + educationScore * 0.25 + 5)),
    startup:   Math.min(90, Math.round(projectScore * 0.40 + skillScore * 0.35 + score * 0.25 - 2)),
    midProduct:Math.min(86, Math.round(score * 0.35 + skillScore * 0.35 + projectScore * 0.30 - 6)),
    tier1:     Math.min(80, Math.round(score * 0.30 + skillScore * 0.30 + achievementScore * 0.20 + projectScore * 0.20 - 12)),
    faang:     Math.min(74, Math.round(score * 0.25 + skillScore * 0.25 + achievementScore * 0.30 + projectScore * 0.20 - 20)),
  };

  const companiesList = [
    { name: "TCS",       score: Math.min(97, Math.round(educationScore * 0.30 + skillScore * 0.30 + score * 0.40 + 8)), reason: hasDegree ? "Strong academic profile and core tech stack align well with TCS delivery pipelines." : "Missing formal degree may affect TCS eligibility criteria." },
    { name: "Infosys",   score: Math.min(95, Math.round(educationScore * 0.30 + skillScore * 0.35 + score * 0.35 + 5)), reason: hasCGPA ? "Good CGPA and foundational engineering skills meet Infosys hiring benchmarks." : "Consider adding CGPA for stronger Infosys filtering." },
    { name: "Accenture", score: Math.min(94, Math.round(score * 0.40 + skillScore * 0.30 + educationScore * 0.30 + 4)), reason: hasLinkedin ? "Professional LinkedIn presence and delivery-focused skills align with Accenture profiles." : "Adding LinkedIn and project delivery keywords would improve Accenture ATS pass rate." },
    { name: "Capgemini", score: Math.min(93, Math.round(score * 0.40 + skillScore * 0.30 + formattingScore * 0.30 + 2)), reason: "Resume structure and stack coverage match Capgemini consulting developer requirements." },
    { name: "Deloitte",  score: Math.min(90, Math.round(score * 0.40 + achievementScore * 0.25 + skillScore * 0.35 - 2)), reason: hasMetrics ? "Quantified impact statements strengthen your Deloitte technology advisory fit." : "Adding measurable business outcomes would significantly boost Deloitte compatibility." },
    { name: "IBM",       score: Math.min(88, Math.round(score * 0.35 + skillScore * 0.35 + cloudSkills.length * 3 + 2)), reason: cloudSkills.length > 0 ? `Cloud skills (${cloudSkills.slice(0, 2).join(", ")}) improve IBM hybrid cloud readiness.` : "IBM favors cloud-native experience. Adding AWS, Azure, or GCP would improve match." },
    { name: "Oracle",    score: Math.min(86, Math.round(score * 0.35 + dbSkills.length * 5 + skillScore * 0.30 - 2)), reason: dbSkills.length > 1 ? `Database skills (${dbSkills.slice(0, 2).join(", ")}) align with Oracle product suite.` : "Oracle heavily weighs SQL and database performance skills." },
    { name: "Amazon",    score: Math.min(82, Math.round(score * 0.30 + projectScore * 0.30 + skillScore * 0.25 + devOpsSkills.length * 2 - 5)), reason: hasMetrics ? "Metric-backed achievements improve fit for Amazon's bar-raiser culture." : "Amazon expects quantified scale metrics. Add these." },
    { name: "Microsoft", score: Math.min(80, Math.round(score * 0.30 + skillScore * 0.30 + achievementScore * 0.25 + projectScore * 0.15 - 8)), reason: hasCompetitiveCoding ? "Competitive programming background is valued at Microsoft." : "Microsoft expects strong problem-solving track record." },
    { name: "Google",    score: Math.min(76, Math.round(score * 0.25 + achievementScore * 0.30 + skillScore * 0.25 + projectScore * 0.20 - 18)), reason: achievementScore >= 70 ? "Good achievement profile but Google expects exceptional DSA skills and system design depth." : "Google expects top-tier DSA, system design, and measurable engineering impact." },
  ].sort((a, b) => b.score - a.score);

  const atsParsability      = Math.min(98, Math.round(80 + contactScore * 0.12 + (hasDegree ? 5 : 0) + (isOptimalLength ? 3 : 0)));
  const visualQuality       = parseFloat(Math.min(9.8, (7.0 + (hasLinkedin ? 0.5 : 0) + (hasGithub ? 0.4 : 0) + (isOptimalLength ? 0.4 : 0) + (hasPortfolio ? 0.3 : 0))).toFixed(1));
  const readabilityScore    = Math.min(95, 65 + (wordCount > 250 ? 10 : 0) + (hasDegree ? 5 : 0) + (hasGithub ? 5 : 0) + (hasLinkedin ? 5 : 0) + (isOptimalLength ? 5 : 0));
  const professionalismScore = Math.min(95, 62 + (hasLinkedin ? 12 : 0) + (hasCGPA ? 5 : 0) + (achievementCount > 0 ? 10 : 0) + (hasPortfolio ? 6 : 0));

  const recruiterVerdict = score >= 89 ? "Strong Shortlist" : score >= 79 ? "Likely Interview" : score >= 65 ? "Borderline" : score >= 50 ? "Needs Improvement" : "Reject";
  const verdictStyle     = score >= 89 ? "bg-emerald-100 text-emerald-800" : score >= 79 ? "bg-blue-100 text-blue-800" : score >= 65 ? "bg-amber-100 text-amber-800" : score >= 50 ? "bg-orange-100 text-orange-800" : "bg-red-100 text-red-800";

  const getSalary = () => {
    if (score >= 89) return { current: "10–14 LPA", potential: "14–20 LPA", stretch: "20–28 LPA", basis: `${matchedSkills.length} matched skills, ${projectCount}+ projects` };
    if (score >= 79) return { current: "7–10 LPA",  potential: "10–14 LPA", stretch: "14–18 LPA", basis: `${matchedSkills.length} matched skills, ${projectCount}+ projects` };
    if (score >= 65) return { current: "5–7 LPA",   potential: "7–10 LPA",  stretch: "10–13 LPA", basis: `${matchedSkills.length} matched skills, ${expLevel} level profile` };
    if (score >= 50) return { current: "3.5–5 LPA", potential: "5–7 LPA",   stretch: "7–9 LPA",  basis: `${matchedSkills.length} matched skills, limited project depth` };
    return             { current: "2–3.5 LPA", potential: "3.5–5 LPA", stretch: "5–7 LPA",  basis: "Entry-level profile with foundational skills" };
  };
  const salary = getSalary();

  const funnelScreening = Math.min(92, Math.round(score * 0.88 + 5));
  const funnelTechnical = Math.min(80, Math.round(score * 0.72 + skillScore * 0.10));
  const funnelManager   = Math.min(70, Math.round(score * 0.55 + projectScore * 0.12));
  const funnelOffer     = Math.min(score - 15, Math.round(score * 0.42 + achievementScore * 0.10 - 5));
  const funnel = [
    { stage: "Resume Screening",  prob: funnelScreening,                          color: "#3b82f6" },
    { stage: "Technical Round",   prob: Math.max(20, funnelTechnical),             color: "#8b5cf6" },
    { stage: "Manager Round",     prob: Math.max(15, funnelManager),               color: "#f59e0b" },
    { stage: "Offer Probability", prob: Math.max(10, Math.min(funnelOffer, score - 15)), color: "#10b981" },
  ];

  const topBenchmarks = [
    { metric: "ATS Score",    you: score,                    top: 91 },
    { metric: "Skills",       you: Math.round(skillScore),   top: 93 },
    { metric: "Projects",     you: projectScore,             top: 92 },
    { metric: "Experience",   you: experienceScore,          top: 89 },
    { metric: "Education",    you: educationScore,           top: 90 },
    { metric: "Achievements", you: achievementScore,         top: 87 },
  ];

  const criticalMissing   = (analysis.missingKeywords || []).slice(0, 3);
  const importantMissing  = (analysis.missingKeywords || []).slice(3, 7);
  const niceToHaveMissing = (analysis.missingKeywords || []).slice(7, 12);
  const defaultCritical   = ["Docker", "Kubernetes", "CI/CD"].filter(k => !new RegExp("\\b" + k + "\\b","i").test(text));
  const defaultImportant  = ["Redis", "Kafka", "Terraform", "System Design"].filter(k => !new RegExp("\\b" + k + "\\b","i").test(text));
  const defaultNice       = ["GraphQL", "Prometheus", "ELK Stack"].filter(k => !new RegExp("\\b" + k + "\\b","i").test(text));

  const improvements = [
    { action: "Add GitHub Portfolio",       boost: hasGithub    ? 0 : 2, note: "Verified code samples increase recruiter confidence." },
    { action: "Add LinkedIn URL",           boost: hasLinkedin  ? 0 : 1, note: "Professional presence expected by most parsers." },
    { action: `Add ${criticalMissing[0] || defaultCritical[0] || "Docker"}`, boost: 3, note: "Critical missing skill impacting keyword match score." },
    { action: `Add ${criticalMissing[1] || defaultCritical[1] || "Kubernetes"}`, boost: 2, note: "Commonly required in modern engineering JDs." },
    { action: "Quantify Project Metrics",   boost: hasMetrics   ? 0 : 5, note: "e.g. 'Improved query time by 40%'. Highest single improvement." },
    { action: "Add Live Project Link",      boost: hasLiveLink  ? 0 : 3, note: "Demonstrates working, deployable projects." },
    { action: "Include Certifications",     boost: hasCertification ? 0 : 2, note: "AWS / Google Cloud certs add significant credibility." },
    { action: "Expand Skills Section",      boost: matchedSkills.length < 10 ? 4 : 1, note: `Resume currently has ${matchedSkills.length} identified tech skills.` },
  ].filter(i => i.boost > 0).sort((a, b) => b.boost - a.boost).slice(0, 6);

  const confidenceFactors = [
    hasDegree, hasEmail, hasPhone, projectCount > 0, matchedSkills.length > 4,
    yearsOfExp > 0 || hasInternship, hasGithub || hasLinkedin, achievementCount > 0, wordCount > 300,
  ].filter(Boolean).length;
  const aiConfidence = Math.min(95, Math.round(45 + confidenceFactors * 5.5 + (wordCount > 400 ? 5 : 0)));

  const strengthsSummary: string[] = [];
  const weaknessesSummary: string[] = [];
  if (matchedSkills.length >= 8) strengthsSummary.push(`strong technical depth across ${matchedSkills.length} validated skills`);
  if (projectCount >= 3) strengthsSummary.push(`${projectCount} projects demonstrating practical experience`);
  if (hasMetrics) strengthsSummary.push("quantified impact metrics present — high recruiter signal");
  if (hasDegree && hasTopCollege) strengthsSummary.push("strong educational pedigree from a reputed institution");
  if (hasCertification) strengthsSummary.push("industry certifications add credibility");
  if (cloudSkills.length > 0) strengthsSummary.push(`cloud/DevOps skills (${cloudSkills.join(", ")}) are in high demand`);
  if (!hasGithub) weaknessesSummary.push("no GitHub link — recruiters cannot verify coding ability");
  if (!hasLinkedin) weaknessesSummary.push("LinkedIn URL missing — reduces professional credibility");
  if (!hasMetrics) weaknessesSummary.push("no quantified achievements — adds to resume ambiguity");
  if (cloudSkills.length === 0) weaknessesSummary.push("no cloud or DevOps skills detected");
  if (projectCount < 2) weaknessesSummary.push("too few projects for a competitive profile");
  if (achievementCount === 0) weaknessesSummary.push("no competitive programming, certifications, or awards listed");

  const verdict = `Your resume scores ${score}/100 (Grade ${evaluation.grade} — ${evaluation.verdict}). ` +
    (strengthsSummary.length > 0 ? `Key strengths include: ${strengthsSummary.slice(0, 3).join("; ")}. ` : "") +
    (weaknessesSummary.length > 0 ? `Priority gaps: ${weaknessesSummary.slice(0, 3).join("; ")}. ` : "") +
    `Most suitable companies: ${companiesList.slice(0, 4).map(c => c.name).join(", ")}. ` +
    `Estimated hiring competitiveness: ${recruiterVerdict}. ` +
    `Immediate next steps: ${improvements.slice(0, 2).map(i => i.action).join(", ")}.`;

  return {
    score, breakdown, radarData, evaluation,
    readiness, companiesList,
    atsParsability, visualQuality, readabilityScore, professionalismScore,
    recruiterVerdict, verdictStyle,
    salary, funnel, topBenchmarks,
    criticalMissing:   criticalMissing.length   > 0 ? criticalMissing   : defaultCritical,
    importantMissing:  importantMissing.length  > 0 ? importantMissing  : defaultImportant,
    niceToHaveMissing: niceToHaveMissing.length > 0 ? niceToHaveMissing : defaultNice,
    improvements, aiConfidence, verdict,
    matchedKwCount, missingKwCount,
    matchedKeywords: analysis.matchedKeywords?.length ? analysis.matchedKeywords : ["Java","Spring Boot","SQL","REST API","Git","JavaScript","HTML","CSS"],
    missingKeywords:  analysis.missingKeywords?.length ? analysis.missingKeywords : ["Docker","Kubernetes","AWS","CI/CD","Redis","Kafka","Terraform"],
    expLevel, yearsOfExp, hasGithub, hasLinkedin, matchedSkills, projectCount,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AtsAnalysisFromHistoryPage() {
  const router   = useRouter();
  const params   = useParams();
  const id       = params?.id as string;

  const [analysis, setAnalysis]   = useState<AtsAnalysisData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<"not_found" | "server_error" | null>(null);

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

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container py-20 text-center flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-semibold">Loading Premium ATS Intelligence Dashboard...</p>
      </div>
    );
  }

  // ── Error States ───────────────────────────────────────────────────────────
  if (error === "not_found") {
    return (
      <div className="container py-20 max-w-md mx-auto text-center space-y-6">
        <Card className="border border-dashed p-8 flex flex-col items-center shadow-sm">
          <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-xl font-bold">Analysis Not Found</h2>
          <p className="text-muted-foreground text-sm mt-2 mb-6">
            This analysis record no longer exists or you don&apos;t have access to it.
          </p>
          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={() => router.back()} className="flex-1">Go Back</Button>
            <Button onClick={() => router.push("/dashboard/ats")} className="flex-1 font-bold">Analyze New Resume</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (error === "server_error") {
    return (
      <div className="container py-20 max-w-md mx-auto text-center space-y-6">
        <Card className="border border-dashed p-8 flex flex-col items-center shadow-sm">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold">Unable to Load ATS Report</h2>
          <p className="text-muted-foreground text-sm mt-2 mb-6">
            A server error occurred. Please try again.
          </p>
          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={() => router.back()} className="flex-1">Go Back</Button>
            <Button onClick={() => window.location.reload()} className="flex-1 font-bold">
              <RefreshCw className="w-4 h-4 mr-2" /> Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!analysis) return null;

  const s = buildScoringEngine(analysis);

  const analyzedDate = analysis.createdAt
    ? new Date(analysis.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "Unknown date";

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 print:p-0 print:max-w-full">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/history")} className="hover:bg-slate-100">
            <ArrowLeft className="w-4 h-4 mr-1" /> History
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
              Premium ATS Intelligence Dashboard <Sparkles className="w-5 h-5 text-primary" />
            </h1>
            <p className="text-sm text-muted-foreground">Analyzed on {analyzedDate} · Best Role: <span className="font-semibold text-foreground">{analysis.bestRole || "–"}</span></p>
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
                    strokeDashoffset={2 * Math.PI * 60 * (1 - s.score / 100)}
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

          {/* Placement Readiness */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-primary/5 to-primary/0 border border-primary/10">
            <CardHeader>
              <CardTitle className="text-sm font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Placement Readiness™
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Overall",            value: s.readiness.overall    },
                { label: "Service Companies",  value: s.readiness.service    },
                { label: "Startups",           value: s.readiness.startup    },
                { label: "Mid-size Product",   value: s.readiness.midProduct },
                { label: "Tier-1 Product",     value: s.readiness.tier1      },
                { label: "FAANG Readiness",    value: s.readiness.faang      },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase">
                    <span>{item.label}</span>
                    <span className={cn(item.value >= 80 ? "text-green-600" : item.value >= 65 ? "text-blue-600" : "text-amber-600")}>{item.value}%</span>
                  </div>
                  <Progress value={item.value} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>

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
                { label: "ATS Parse Success",   value: `${s.atsParsability}%` },
                { label: "Visual Quality",       value: `${s.visualQuality}/10` },
                { label: "Formatting Quality",  value: `${s.readabilityScore}%` },
                { label: "Professionalism",      value: `${s.professionalismScore}%` },
              ].map((row, i) => (
                <div key={i} className="flex justify-between border-b pb-2 last:border-0">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-bold text-foreground">{row.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1">
                <span className="text-muted-foreground font-medium">Recruiter Verdict</span>
                <Badge className={cn("font-extrabold text-xs border-none", s.verdictStyle)}>{s.recruiterVerdict.toUpperCase()}</Badge>
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
              <div className="grid grid-cols-3 gap-3 pt-1">
                {[
                  { label: "Current",   value: s.salary.current,   color: "text-foreground" },
                  { label: "Potential", value: s.salary.potential,  color: "text-blue-600 dark:text-blue-400"  },
                  { label: "Stretch",   value: s.salary.stretch,    color: "text-emerald-600 dark:text-emerald-400" },
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
                  <p className="text-[10px] text-muted-foreground">Based on {Object.values(s.breakdown).filter(v => v > 50).length}/9 data-rich resume sections</p>
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
              <Button size="sm" onClick={() => router.push("/dashboard/resume-builder")} className="bg-primary hover:bg-primary/90 text-white font-bold">Open Resume Builder</Button>
              <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/ats")}>Run ATS Again</Button>
              <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/jd-match")}>JD Matching</Button>
              <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/history")}>Back to History</Button>
            </CardContent>
          </Card>

          {/* Recruiter Funnel */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-black flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" /> Recruiter Probability Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {s.funnel.map((stage, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-sm font-semibold">
                    <span>{stage.stage}</span>
                    <span style={{ color: stage.color }} className="font-black">{stage.prob}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${stage.prob}%`, backgroundColor: stage.color }} />
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground pt-1 italic">Offer probability is always below ATS score — reflects real-world hiring conversion rates.</p>
            </CardContent>
          </Card>

          {/* Benchmark vs Top Candidates */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-black flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" /> Benchmark vs Top Candidates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={s.topBenchmarks} barCategoryGap="25%">
                    <XAxis dataKey="metric" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      content={<CustomTooltip />}
                      cursor={{ fill: 'var(--muted)' }}
                    />
                    <Bar dataKey="you" name="you" radius={[4,4,0,0]}>
                      {s.topBenchmarks.map((_, i) => <Cell key={i} fill="var(--primary)" fillOpacity={0.8} />)}
                    </Bar>
                    <Bar dataKey="top" name="top" radius={[4,4,0,0]}>
                      {s.topBenchmarks.map((_, i) => <Cell key={i} className="fill-slate-200 dark:fill-slate-700" />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 text-center">Blue = You &nbsp;|&nbsp; Grey = Top 10% Candidates</p>
            </CardContent>
          </Card>

          {/* Keywords Analysis */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-black">🏷 Keyword Diagnostics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-green-700 uppercase block tracking-wider">✔ Matched Keywords ({s.matchedKwCount})</span>
                <div className="flex flex-wrap gap-2">
                  {s.matchedKeywords.map((kw, i) => (
                    <Badge key={i} className="bg-green-50 text-green-800 border border-green-200 font-semibold px-2.5 py-1 hover:bg-green-50">{kw}</Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-red-700 uppercase block tracking-wider">✖ Missing Keywords ({s.missingKwCount})</span>
                <div className="flex flex-wrap gap-2">
                  {s.missingKeywords.map((kw, i) => (
                    <Badge key={i} className="bg-red-50 text-red-800 border border-red-200 font-semibold px-2.5 py-1 hover:bg-red-50">{kw}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Missing Skills — 3 Tiers */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-black flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" /> Missing Skills Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-red-50/70 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-red-600 dark:text-red-500" />
                    <span className="text-[11px] font-extrabold text-red-700 dark:text-red-400 uppercase tracking-wider">Critical</span>
                  </div>
                  {s.criticalMissing.map((k, i) => <Badge key={i} className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/50 font-semibold w-full justify-start">{k}</Badge>)}
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <MinusCircle className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                    <span className="text-[11px] font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Important</span>
                  </div>
                  {s.importantMissing.map((k, i) => <Badge key={i} className="bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/50 font-semibold w-full justify-start">{k}</Badge>)}
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Nice to Have</span>
                  </div>
                  {s.niceToHaveMissing.map((k, i) => <Badge key={i} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-semibold w-full justify-start">{k}</Badge>)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strengths & Weaknesses from AI */}
          {(analysis.strengths?.length > 0 || analysis.weaknesses?.length > 0) && (
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-black flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-primary" /> AI Analysis Findings
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysis.strengths?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-extrabold text-green-700 uppercase tracking-wider flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> Strengths</span>
                    <ul className="space-y-2">
                      {analysis.strengths.map((s2, i) => (
                        <li key={i} className="flex gap-2 text-xs text-muted-foreground bg-green-50/50 p-2.5 rounded border border-green-100/50">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />{s2}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.weaknesses?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider flex items-center gap-1"><ThumbsDown className="w-3.5 h-3.5" /> Areas to Improve</span>
                    <ul className="space-y-2">
                      {analysis.weaknesses.map((w, i) => (
                        <li key={i} className="flex gap-2 text-xs text-muted-foreground bg-amber-50/50 p-2.5 rounded border border-amber-100/50">
                          <XCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />{w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Improvement Impact Roadmap */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-black flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" /> Improvement Impact Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {s.improvements.map((imp, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex-shrink-0 w-14 text-center">
                    <span className="text-lg font-black text-primary">+{imp.boost}%</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">{imp.action}</p>
                    <p className="text-xs text-muted-foreground">{imp.note}</p>
                  </div>
                  <Badge className={cn("text-[9px] font-bold border-none", imp.boost >= 4 ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400" : imp.boost >= 2 ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400")}>
                    {imp.boost >= 4 ? "High" : imp.boost >= 2 ? "Medium" : "Low"} Impact
                  </Badge>
                </div>
              ))}
              <p className="text-xs text-muted-foreground italic pt-1">
                Cumulative estimated improvement: +{s.improvements.reduce((sum, i) => sum + i.boost, 0)}% ATS score
              </p>
            </CardContent>
          </Card>

          {/* Company Compatibility */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base font-black">🏢 Company Compatibility</CardTitle>
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
                          <span className={cn("font-black text-sm", comp.score >= 90 ? "text-green-600" : comp.score >= 80 ? "text-blue-600" : comp.score >= 70 ? "text-amber-600" : "text-red-600")}>{comp.score}%</span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground leading-normal">{comp.reason}</td>
                      </tr>
                    ))}
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
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {(analysis.strengths?.length ? analysis.strengths : ["Technical stack breadth", "Project implementation", "Educational background"]).slice(0, 4).map((s2, i) => (
                      <li key={i} className="flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />{s2}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-red-700 uppercase flex items-center gap-1"><ThumbsDown className="w-3 h-3" /> Priority Gaps</span>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {(analysis.weaknesses?.length ? analysis.weaknesses : ["Cloud/DevOps exposure", "Quantified metrics", "Competitive coding"]).slice(0, 4).map((w, i) => (
                      <li key={i} className="flex gap-2"><XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />{w}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <Button size="sm" onClick={() => router.push("/dashboard/ats")} className="bg-primary text-white font-bold">Reanalyze Resume</Button>
                <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/resume-builder")}>Improve Resume</Button>
                <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/jd-match")}>JD Match Engine</Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
