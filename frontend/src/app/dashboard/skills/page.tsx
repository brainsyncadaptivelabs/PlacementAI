"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, Sparkles, Loader2, FileX } from "lucide-react";
import api from "@/lib/api";

type SkillGapResult = {
  strongSkills: string[];
  missingSkills: string[];
  recommendedSkills: string[];
  careerLevel: string;
};

export default function SkillGapPage() {
  const [result, setResult] = useState<SkillGapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeSkills = async () => {
    setLoading(true);
    setError("");
    try {
      const resumeRes = await api.get("/resume/latest");
      const resumeText = resumeRes.data;

      if (!resumeText) {
        setError("No resume found. Please upload your resume first.");
        setLoading(false);
        return;
      }

      const response = await api.post("/skills/analyze", { resumeText });
      setResult(response.data);
    } catch (err) {
      console.error("Skill analysis error:", err);
      setError("Failed to analyze skills. Please check if Ollama is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyzeSkills();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-slate-500 font-medium italic">Scanning your expertise and identifying growth gaps...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
          <FileX className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{error}</h2>
        <Button onClick={() => window.location.href='/dashboard/ats'} size="lg">Go to Resume Upload</Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold font-heading text-slate-900 flex items-center gap-2">
            Skill Gap Analysis <Badge className="bg-primary/10 text-primary border-none">Real-time AI</Badge>
          </h1>
          <p className="text-slate-500">Understand your position in the current job market and identify growth opportunities.</p>
        </div>
        <Card className="border-none shadow-sm bg-white px-6 py-3 flex items-center gap-4">
           <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">AI Assessed Level</p>
              <p className="text-sm font-black text-slate-900">{result?.careerLevel || "Determining..."}</p>
           </div>
           <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <TrendingUp className="w-5 h-5" />
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
               <CardTitle className="text-lg font-bold font-heading flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" /> Skills Breakdown
               </CardTitle>
            </CardHeader>
            <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Strong Skills</h3>
                  <div className="flex flex-wrap gap-2">
                     {result?.strongSkills.map(skill => (
                        <Badge key={skill} className="bg-green-50 text-green-700 border-green-100 px-3 py-1">{skill}</Badge>
                     ))}
                  </div>
               </div>
               <div className="space-y-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Missing / Gap Skills</h3>
                  <div className="flex flex-wrap gap-2">
                     {result?.missingSkills.map(skill => (
                        <Badge key={skill} className="bg-amber-50 text-amber-700 border-amber-100 px-3 py-1">{skill}</Badge>
                     ))}
                  </div>
               </div>
            </CardContent>
         </Card>

         <div className="space-y-6">
            <Card className="border-none shadow-xl bg-slate-900 text-white p-6 relative overflow-hidden">
               <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                     <Sparkles className="w-4 h-4" /> Recommended for You
                  </div>
                  <h3 className="text-lg font-bold font-heading leading-tight">Master These Next</h3>
                  <div className="space-y-2">
                    {result?.recommendedSkills.slice(0, 3).map(skill => (
                      <div key={skill} className="flex items-center gap-2 text-sm text-slate-300">
                        <div className="w-1 h-1 rounded-full bg-primary" /> {skill}
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90 mt-2" onClick={() => window.location.href='/dashboard/roadmap'}>View Learning Path</Button>
               </div>
               <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            </Card>

            <Card className="border-none shadow-sm bg-white p-6">
               <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Next Step</h3>
                  <p className="text-xs text-slate-500">Ready to test your skills? Practice with our AI interviewer.</p>
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/5" onClick={() => window.location.href='/mock-interview'}>
                     Start Mock Interview
                  </Button>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}
