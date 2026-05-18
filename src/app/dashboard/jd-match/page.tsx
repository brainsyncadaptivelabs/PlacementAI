"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle2, AlertCircle, ArrowRight, Zap, Briefcase } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function JDMatchPage() {
  const [isMatching, setIsMatching] = useState(false);
  const [isResultReady, setIsResultReady] = useState(false);

  const handleMatch = () => {
    setIsMatching(true);
    setTimeout(() => {
      setIsMatching(false);
      setIsResultReady(true);
    }, 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold font-heading text-slate-900">Job Description Matching</h1>
        <p className="text-slate-500">Paste a Job Description to see how well your resume matches the requirements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
               <CardTitle className="text-base font-bold font-heading flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" /> Job Description
               </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
               <Textarea 
                 placeholder="Paste the Job Description here..." 
                 className="min-h-[300px] border-slate-200 focus-visible:ring-primary/20 resize-none"
               />
               <Button 
                 onClick={handleMatch} 
                 disabled={isMatching}
                 className="w-full bg-primary hover:bg-primary/90 h-12 text-lg"
               >
                  {isMatching ? "Analyzing Match..." : "Check Match Score"}
               </Button>
            </CardContent>
         </Card>

         {isResultReady ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <Card className="border-none shadow-xl bg-white overflow-hidden">
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
                             strokeDasharray="65, 100"
                             strokeLinecap="round"
                           />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-3xl font-black text-primary">65%</span>
                        </div>
                     </div>
                     <h3 className="text-xl font-bold font-heading">Strong Match!</h3>
                     <p className="text-sm text-slate-500">Your resume is a good fit, but some key skills are missing.</p>
                  </div>
                  <CardContent className="p-6 space-y-6">
                     <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Matching Skills</h4>
                        <div className="flex flex-wrap gap-2">
                           {["React", "Node.js", "TypeScript", "Tailwind CSS", "AWS"].map(s => (
                              <Badge key={s} className="bg-green-50 text-green-700 border-green-100 hover:bg-green-100">{s}</Badge>
                           ))}
                        </div>
                     </div>
                     <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Missing Skills</h4>
                        <div className="flex flex-wrap gap-2">
                           {["Docker", "Kubernetes", "GraphQL", "Redis"].map(s => (
                              <Badge key={s} className="bg-red-50 text-red-700 border-red-100 hover:bg-red-100">{s}</Badge>
                           ))}
                        </div>
                     </div>
                  </CardContent>
               </Card>

               <Card className="border-none shadow-sm bg-slate-900 text-white p-6">
                  <div className="flex items-start gap-4">
                     <div className="p-2 bg-primary/20 rounded-lg shrink-0">
                        <Zap className="w-5 h-5 text-primary" />
                     </div>
                     <div className="space-y-2">
                        <h4 className="font-bold">Optimization Tips</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">Add &apos;Docker&apos; and &apos;GraphQL&apos; to your skills section. The JD mentions them 3+ times. Also, emphasize your experience with AWS deployment.</p>
                     </div>
                  </div>
               </Card>
            </div>
         ) : (
            <Card className="border-none shadow-sm bg-slate-100/50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center space-y-4">
               <Target className="w-12 h-12 text-slate-300" />
               <div className="space-y-1">
                  <h3 className="font-bold text-slate-400">Match Results</h3>
                  <p className="text-sm text-slate-400">Results will appear here after you paste a JD and click analyze.</p>
               </div>
            </Card>
         )}
      </div>
    </div>
  );
}
