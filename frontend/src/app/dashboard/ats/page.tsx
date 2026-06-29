"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";

type AnalysisResult = {
  atsScore?: number;
  suggestions?: string[];
  bestRole?: string;
};

export default function ResumeATSPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const atsScore = analysisResult?.atsScore ?? 0;

  useEffect(() => {
    const saved = localStorage.getItem("latest_ats_analysis");
    if (saved) {
      try {
        setAnalysisResult(JSON.parse(saved));
        setIsAnalyzed(true);
      } catch (e) {
        console.error("Failed to parse cached ATS analysis:", e);
      }
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    setIsAnalyzed(false);
    setError("");

    try {
      const response = await api.post("/resume/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setAnalysisResult(response.data);
      localStorage.setItem("latest_ats_analysis", JSON.stringify(response.data));
      setIsAnalyzed(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to analyze resume"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold font-heading text-foreground">Resume & ATS Analysis</h1>
        <p className="text-muted-foreground">Optimize your resume for applicant tracking systems and increase your chances.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Upload Section */}
        <Card className="border-2 border-dashed border-border bg-card shadow-none">
          <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center space-y-4">
             <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
             </div>
             <div className="text-center space-y-1">
                <h3 className="font-bold text-lg">Upload Your Resume</h3>
                <p className="text-sm text-muted-foreground">PDF, DOCX (Max 5MB)</p>
             </div>
             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleFileChange} 
               className="hidden" 
               accept=".pdf,.docx"
             />
             <Button 
               onClick={() => fileInputRef.current?.click()} 
               disabled={isUploading}
               className="bg-primary hover:bg-primary/90 px-8"
             >
               {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
               {isUploading ? "Analyzing..." : "Upload Resume"}
             </Button>
             {isUploading && (
               <div className="w-full max-w-xs space-y-2 pt-4">
                 <Progress value={66} className="h-1" />
                 <p className="text-[10px] text-center text-muted-foreground/70 uppercase font-bold tracking-widest animate-pulse">Scanning keywords...</p>
               </div>
             )}
          </CardContent>
        </Card>

        {/* Analysis Result */}
        {isAnalyzed && analysisResult ? (
          <Card className="border-none shadow-sm bg-card overflow-hidden">
             <div className="p-6 border-b border-border flex items-center justify-between bg-primary/5">
                <CardTitle className="text-lg font-bold font-heading text-primary">Analysis Result</CardTitle>
                <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center text-primary font-bold shadow-md border-2 border-primary/20 text-xl">
                   {atsScore}
                </div>
             </div>
             <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                   <h3 className="font-bold text-foreground flex items-center gap-2">
                     {atsScore >= 80 ? "🚀 Great job! High Match" : 
                      atsScore >= 50 ? "📈 Good! But can be better." : 
                      "⚠️ Significant improvements needed"}
                   </h3>
                   <p className="text-sm text-muted-foreground italic">Target a score of 85+ for best results with major companies.</p>
                </div>

                <div className="space-y-4">
                   <h4 className="font-semibold text-sm text-foreground uppercase tracking-wider">Key Suggestions</h4>
                   {analysisResult.suggestions?.map((suggestion: string, index: number) => (
                     <div key={index} className="flex gap-3 bg-muted p-3 rounded-lg border border-border">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground">{suggestion}</p>
                     </div>
                   ))}
                   {(!analysisResult.suggestions || analysisResult.suggestions.length === 0) && (
                     <div className="flex gap-3 bg-muted p-3 rounded-lg border border-border">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">No specific suggestions found. Try adding more details to your resume.</p>
                     </div>
                   )}
                </div>

                {analysisResult.bestRole && (
                   <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                      <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Recommended Role</p>
                      <p className="font-bold text-foreground">{analysisResult.bestRole}</p>
                   </div>
                )}

                <Button 
                  onClick={() => {
                    console.log("View Full Analysis clicked");
                    // Persist the latest ATS analysis for the dashboard page
                    if (analysisResult) {
                      sessionStorage.setItem("ats-analysis", JSON.stringify(analysisResult));
                    }
                    router.push("/dashboard/ats/analysis");
                  }} 
                  className="w-full py-6 group bg-slate-900 hover:bg-slate-800"
                >
                   View Full Analysis 
                   <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
             </CardContent>
          </Card>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 bg-muted/50 rounded-2xl border border-border border-dashed">
             <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
             <p className="text-muted-foreground/70 text-sm text-center">Your analysis results will appear here after you upload a resume.</p>
          </div>
        )}
      </div>
    </div>
  );
}
