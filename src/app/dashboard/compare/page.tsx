"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scale, FileText, CheckCircle2, AlertCircle, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function ResumeComparePage() {
  const [isComparing, setIsComparing] = useState(false);
  const [isResultReady, setIsResultReady] = useState(false);

  const handleCompare = () => {
    setIsComparing(true);
    setTimeout(() => {
      setIsComparing(false);
      setIsResultReady(true);
    }, 2500);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-bold font-heading text-slate-900">Resume Comparison</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">Upload or select two resumes to compare their effectiveness and see which one performs better for your target role.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex w-12 h-12 rounded-full bg-white border border-slate-200 items-center justify-center z-10 font-bold text-slate-400">VS</div>
        
        {/* Resume 1 */}
        <Card className="border-2 border-dashed border-slate-200 bg-white shadow-none hover:border-primary/40 transition-colors">
          <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center space-y-4">
             <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
             </div>
             <h3 className="font-bold">Select Resume A</h3>
             <Button variant="outline" size="sm">Choose File</Button>
          </CardContent>
        </Card>

        {/* Resume 2 */}
        <Card className="border-2 border-dashed border-slate-200 bg-white shadow-none hover:border-primary/40 transition-colors">
          <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center space-y-4">
             <div className="w-12 h-12 rounded-lg bg-secondary/5 flex items-center justify-center">
                <FileText className="w-6 h-6 text-secondary" />
             </div>
             <h3 className="font-bold">Select Resume B</h3>
             <Button variant="outline" size="sm">Choose File</Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
         <Button 
           size="lg" 
           onClick={handleCompare} 
           disabled={isComparing}
           className="bg-slate-900 hover:bg-slate-800 px-12 py-6 text-lg group"
         >
           {isComparing ? "Comparing..." : "Compare Resumes"}
           {!isComparing && <Scale className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />}
         </Button>
      </div>

      {isResultReady && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Resume A Result */}
              <Card className="border-none shadow-sm overflow-hidden bg-white">
                 <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <div>
                       <h4 className="font-bold text-slate-900">Resume_A_v1.pdf</h4>
                       <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Candidate A</p>
                    </div>
                    <Badge className="bg-slate-100 text-slate-600 font-bold border-none">62%</Badge>
                 </div>
                 <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                       <div className="flex justify-between text-xs font-bold text-slate-500">
                          <span>ATS Score</span>
                          <span>62/100</span>
                       </div>
                       <Progress value={62} className="h-2 bg-slate-100" />
                    </div>
                    <div className="space-y-3 pt-2">
                       <div className="flex gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          Good layout and contact info
                       </div>
                       <div className="flex gap-2 text-sm text-slate-600">
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          Missing technical keywords
                       </div>
                    </div>
                 </CardContent>
              </Card>

              {/* Resume B Result */}
              <Card className="border-2 border-primary/20 shadow-xl overflow-hidden bg-white relative">
                 <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-4 py-1 rounded-bl-lg uppercase tracking-widest shadow-lg">Better Choice</div>
                 <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-primary/5">
                    <div>
                       <h4 className="font-bold text-primary">Java_Dev_Resume.pdf</h4>
                       <p className="text-xs text-primary/60 font-medium uppercase tracking-wider">Candidate B</p>
                    </div>
                    <Badge className="bg-primary text-white font-bold border-none">78%</Badge>
                 </div>
                 <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                       <div className="flex justify-between text-xs font-bold text-primary">
                          <span>ATS Score</span>
                          <span>78/100</span>
                       </div>
                       <Progress value={78} className="h-2 bg-primary/10" indicatorClassName="bg-primary" />
                    </div>
                    <div className="space-y-3 pt-2">
                       <div className="flex gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          Strong skill section with Java/Next.js
                       </div>
                       <div className="flex gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          Quantified achievements present
                       </div>
                    </div>
                 </CardContent>
              </Card>
           </div>

           <Card className="border-none shadow-sm bg-slate-900 text-white p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                 <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-10 h-10 text-primary" />
                 </div>
                 <div className="space-y-2 flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold font-heading">AI Verdict: Resume B is 16% more effective</h3>
                    <p className="text-slate-400 text-sm">Resume B follows professional standards more closely and contains 85% of the required keywords for a Backend Engineer role compared to 55% in Resume A.</p>
                 </div>
                 <Button className="bg-primary hover:bg-primary/90 whitespace-nowrap">
                    Download Winner <ArrowRight className="ml-2 w-4 h-4" />
                 </Button>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
}
