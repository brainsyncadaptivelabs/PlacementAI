"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scale, FileText, CheckCircle2, AlertCircle, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import api from "@/lib/api";

type ResumeItem = {
  id: number;
  fileName: string;
  atsScore: number;
  analyzedRole?: string;
};

type AtsAnalysis = {
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  bestRole?: string;
};

export default function ResumeComparePage() {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [resumeAId, setResumeAId] = useState<string>("");
  const [resumeBId, setResumeBId] = useState<string>("");
  const [analysisA, setAnalysisA] = useState<AtsAnalysis | null>(null);
  const [analysisB, setAnalysisB] = useState<AtsAnalysis | null>(null);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [isComparing, setIsComparing] = useState(false);
  const [isResultReady, setIsResultReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await api.get("/resume/all");
        setResumes(response.data || []);
      } catch (err) {
        console.error("Failed to load resumes", err);
        setError("Failed to load your resumes. Please try again.");
      } finally {
        setLoadingResumes(false);
      }
    };
    fetchResumes();
  }, []);

  const handleCompare = async () => {
    if (!resumeAId || !resumeBId) {
      setError("Please select both Resume A and Resume B to compare.");
      return;
    }
    if (resumeAId === resumeBId) {
      setError("Please select two different resumes to compare.");
      return;
    }

    setIsComparing(true);
    setError(null);
    setIsResultReady(false);

    try {
      const [resA, resB] = await Promise.all([
        api.get(`/resume/${resumeAId}/analysis`),
        api.get(`/resume/${resumeBId}/analysis`),
      ]);
      setAnalysisA(resA.data);
      setAnalysisB(resB.data);
      setIsResultReady(true);
    } catch (err: any) {
      console.error("Comparison failed", err);
      setError("Failed to fetch resume analyses. Please ensure both selected resumes have valid evaluations.");
    } finally {
      setIsComparing(false);
    }
  };

  const resumeA = resumes.find(r => r.id.toString() === resumeAId);
  const resumeB = resumes.find(r => r.id.toString() === resumeBId);

  const scoreA = analysisA?.atsScore || 0;
  const scoreB = analysisB?.atsScore || 0;
  const scoreDiff = scoreB - scoreA;

  let winnerName = "";
  let winnerPercentage = 0;
  let verdictText = "";

  if (isResultReady) {
    if (scoreDiff > 0) {
      winnerName = resumeB?.fileName || "Resume B";
      winnerPercentage = scoreDiff;
      verdictText = `${winnerName} follows professional ATS standards more closely and holds stronger key skill alignment.`;
    } else if (scoreDiff < 0) {
      winnerName = resumeA?.fileName || "Resume A";
      winnerPercentage = Math.abs(scoreDiff);
      verdictText = `${winnerName} follows professional ATS standards more closely and holds stronger key skill alignment.`;
    } else {
      verdictText = "Both resumes are equally effective, yielding matching ATS scores and formatting compliance.";
    }
  }

  if (loadingResumes) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Loading your resumes...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-bold font-heading text-foreground">Resume Comparison</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Select two resumes from your library to compare their effectiveness and see which one performs better.</p>
      </div>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5 text-destructive p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold">{error}</p>
        </Card>
      )}

      {resumes.length < 2 ? (
        <Card className="border-border bg-card p-12 text-center flex flex-col items-center justify-center gap-4 max-w-lg mx-auto">
          <Scale className="w-12 h-12 text-muted-foreground/40" />
          <h3 className="font-bold text-lg">Not Enough Resumes</h3>
          <p className="text-sm text-muted-foreground">You need to upload at least two resumes in order to perform a side-by-side comparison.</p>
          <Link href="/dashboard/resume-builder/new">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl px-6">
              Create/Upload Resume
            </Button>
          </Link>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex w-12 h-12 rounded-full bg-card border border-border items-center justify-center z-10 font-bold text-muted-foreground/70">VS</div>
            
            {/* Resume 1 */}
            <Card className="border-2 border-border bg-card shadow-none hover:border-primary/40 transition-colors p-6">
              <CardContent className="flex flex-col items-center justify-center space-y-4 pt-4">
                 <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                 </div>
                 <h3 className="font-bold text-sm">Select Resume A</h3>
                 <select
                   value={resumeAId}
                   onChange={e => { setResumeAId(e.target.value); setIsResultReady(false); setError(null); }}
                   className="w-full bg-background border border-border/80 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer text-slate-800 dark:text-slate-200"
                 >
                   <option value="">-- Choose Resume A --</option>
                   {resumes.map(r => (
                     <option key={r.id} value={r.id}>
                       {r.fileName} (Score: {r.atsScore}%)
                     </option>
                   ))}
                 </select>
              </CardContent>
            </Card>

            {/* Resume 2 */}
            <Card className="border-2 border-border bg-card shadow-none hover:border-secondary/40 transition-colors p-6">
              <CardContent className="flex flex-col items-center justify-center space-y-4 pt-4">
                 <div className="w-12 h-12 rounded-lg bg-secondary/5 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-secondary" />
                 </div>
                 <h3 className="font-bold text-sm">Select Resume B</h3>
                 <select
                   value={resumeBId}
                   onChange={e => { setResumeBId(e.target.value); setIsResultReady(false); setError(null); }}
                   className="w-full bg-background border border-border/80 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:outline-none cursor-pointer text-slate-800 dark:text-slate-200"
                 >
                   <option value="">-- Choose Resume B --</option>
                   {resumes.map(r => (
                     <option key={r.id} value={r.id}>
                       {r.fileName} (Score: {r.atsScore}%)
                     </option>
                   ))}
                 </select>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
             <Button 
               size="lg" 
               onClick={handleCompare} 
               disabled={isComparing || !resumeAId || !resumeBId}
               className="bg-slate-900 hover:bg-slate-800 px-12 py-6 text-lg group rounded-xl"
             >
               {isComparing ? (
                 <>
                   <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                   Comparing...
                 </>
               ) : (
                 <>
                   Compare Resumes
                   <Scale className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                 </>
               )}
             </Button>
          </div>
        </>
      )}

      {isResultReady && analysisA && analysisB && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Resume A Result */}
              <Card className="border-none shadow-sm overflow-hidden bg-card">
                 <div className="p-6 border-b border-border flex items-center justify-between">
                    <div>
                       <h4 className="font-bold text-foreground truncate max-w-[200px] md:max-w-[300px]">{resumeA?.fileName}</h4>
                       <p className="text-xs text-muted-foreground/70 font-medium uppercase tracking-wider">
                         {analysisA.bestRole || resumeA?.analyzedRole || "Role Not Specified"}
                       </p>
                    </div>
                    <Badge className="bg-muted text-muted-foreground font-bold border-none text-sm px-3 py-1">{scoreA}%</Badge>
                 </div>
                 <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                       <div className="flex justify-between text-xs font-bold text-muted-foreground">
                          <span>ATS Score</span>
                          <span>{scoreA}/100</span>
                       </div>
                       <Progress value={scoreA} className="h-2 bg-muted" />
                    </div>
                    <div className="space-y-3 pt-2">
                       {analysisA.strengths && analysisA.strengths.slice(0, 3).map((st, i) => (
                         <div key={i} className="flex gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            {st}
                         </div>
                       ))}
                       {analysisA.weaknesses && analysisA.weaknesses.slice(0, 2).map((wk, i) => (
                         <div key={i} className="flex gap-2 text-sm text-muted-foreground">
                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            {wk}
                         </div>
                       ))}
                    </div>
                 </CardContent>
              </Card>

              {/* Resume B Result */}
              <Card className={`shadow-xl overflow-hidden bg-card relative ${scoreDiff !== 0 ? "border-2 border-primary/20" : "border-none"}`}>
                 {scoreDiff > 0 && (
                   <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-4 py-1 rounded-bl-lg uppercase tracking-widest shadow-lg">Better Choice</div>
                 )}
                 {scoreDiff < 0 && (
                   <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-4 py-1 rounded-bl-lg uppercase tracking-widest shadow-lg">Resume A is Better</div>
                 )}
                 <div className={`p-6 border-b border-border flex items-center justify-between ${scoreDiff > 0 ? "bg-primary/5" : ""}`}>
                    <div>
                       <h4 className="font-bold text-foreground truncate max-w-[200px] md:max-w-[300px]">{resumeB?.fileName}</h4>
                       <p className="text-xs text-muted-foreground/70 font-medium uppercase tracking-wider">
                         {analysisB.bestRole || resumeB?.analyzedRole || "Role Not Specified"}
                       </p>
                    </div>
                    <Badge className="bg-primary text-white font-bold border-none text-sm px-3 py-1">{scoreB}%</Badge>
                 </div>
                 <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                       <div className="flex justify-between text-xs font-bold text-primary">
                          <span>ATS Score</span>
                          <span>{scoreB}/100</span>
                       </div>
                       <Progress value={scoreB} className="h-2 bg-primary/10" indicatorClassName="bg-primary" />
                    </div>
                    <div className="space-y-3 pt-2">
                       {analysisB.strengths && analysisB.strengths.slice(0, 3).map((st, i) => (
                         <div key={i} className="flex gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            {st}
                         </div>
                       ))}
                       {analysisB.weaknesses && analysisB.weaknesses.slice(0, 2).map((wk, i) => (
                         <div key={i} className="flex gap-2 text-sm text-muted-foreground">
                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            {wk}
                         </div>
                       ))}
                    </div>
                 </CardContent>
              </Card>
           </div>

           <Card className="border-none shadow-sm bg-slate-900 text-white p-8 rounded-2xl">
              <div className="flex flex-col md:flex-row items-center gap-8">
                 <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-10 h-10 text-primary" />
                 </div>
                 <div className="space-y-2 flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold font-heading">
                      {scoreDiff > 0 ? (
                        `AI Verdict: ${resumeB?.fileName} is ${winnerPercentage}% more effective`
                      ) : scoreDiff < 0 ? (
                        `AI Verdict: ${resumeA?.fileName} is ${winnerPercentage}% more effective`
                      ) : (
                        "AI Verdict: Tie between the two resumes"
                      )}
                    </h3>
                    <p className="text-muted-foreground/75 text-sm">{verdictText}</p>
                 </div>
                 {scoreDiff !== 0 && (
                   <Link href={`/dashboard/ats/analysis/${scoreDiff > 0 ? resumeBId : resumeAId}`}>
                     <Button className="bg-primary hover:bg-primary/90 whitespace-nowrap text-white rounded-xl font-bold px-6 py-2.5">
                        View Detailed Analysis <ArrowRight className="ml-2 w-4 h-4" />
                     </Button>
                   </Link>
                 )}
              </div>
           </Card>
        </div>
      )}
    </div>
  );
}
