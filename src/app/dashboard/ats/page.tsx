"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function ResumeATSPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setIsAnalyzed(true);
    }, 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold font-heading text-slate-900">Resume & ATS Analysis</h1>
        <p className="text-slate-500">Optimize your resume for applicant tracking systems and increase your chances.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Upload Section */}
        <Card className="border-2 border-dashed border-slate-200 bg-white shadow-none">
          <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center space-y-4">
             <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
             </div>
             <div className="text-center space-y-1">
                <h3 className="font-bold text-lg">Upload Your Resume</h3>
                <p className="text-sm text-slate-500">PDF, DOCX (Max 5MB)</p>
             </div>
             <Button 
               onClick={handleUpload} 
               disabled={isUploading}
               className="bg-primary hover:bg-primary/90 px-8"
             >
               {isUploading ? "Analyzing..." : "Upload Resume"}
             </Button>
             {isUploading && (
               <div className="w-full max-w-xs space-y-2 pt-4">
                 <Progress value={66} className="h-1" />
                 <p className="text-[10px] text-center text-slate-400 uppercase font-bold tracking-widest animate-pulse">Scanning keywords...</p>
               </div>
             )}
          </CardContent>
        </Card>

        {/* Analysis Result */}
        {isAnalyzed ? (
          <Card className="border-none shadow-sm bg-white overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-primary/5">
                <CardTitle className="text-lg font-bold font-heading text-primary">Analysis Result</CardTitle>
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary font-bold shadow-sm">
                   78
                </div>
             </div>
             <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                   <h3 className="font-bold text-slate-900 flex items-center gap-2">
                     Good! But can be better.
                   </h3>
                   <p className="text-sm text-slate-500 italic">Improve your resume to increase your chances.</p>
                </div>

                <div className="space-y-4">
                   <div className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700">Add more keywords related to your role</p>
                   </div>
                   <div className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700">Include quantified achievements (e.g., 20% growth)</p>
                   </div>
                   <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700 font-medium">Improve skills section - missing Java/Spring</p>
                   </div>
                   <div className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700">Add more project details with tech stack</p>
                   </div>
                </div>

                <Button className="w-full py-6 group bg-slate-900 hover:bg-slate-800">
                   View Full Analysis 
                   <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
             </CardContent>
          </Card>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-100/50 rounded-2xl border border-slate-200 border-dashed">
             <FileText className="w-12 h-12 text-slate-300 mb-4" />
             <p className="text-slate-400 text-sm text-center">Your analysis results will appear here after you upload a resume.</p>
          </div>
        )}
      </div>
    </div>
  );
}
