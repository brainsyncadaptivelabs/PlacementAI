"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, CheckCircle2, AlertCircle, ArrowUpRight, TrendingUp, Sparkles, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function SkillGapPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold font-heading text-slate-900 flex items-center gap-2">
            Skill Gap Analysis <Badge className="bg-primary/10 text-primary border-none">Beta</Badge>
          </h1>
          <p className="text-slate-500">Understand your position in the current job market and identify growth opportunities.</p>
        </div>
        <Card className="border-none shadow-sm bg-white px-6 py-3 flex items-center gap-4">
           <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Career Level</p>
              <p className="text-sm font-black text-slate-900">Junior Developer</p>
           </div>
           <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <TrendingUp className="w-5 h-5" />
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Gaps Card */}
         <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
               <CardTitle className="text-lg font-bold font-heading flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" /> Skills Breakdown
               </CardTitle>
            </CardHeader>
            <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Strong Skills</h3>
                  <div className="space-y-4">
                     {[
                        { label: "Frontend (React/Next)", value: 85 },
                        { label: "TypeScript", value: 78 },
                        { label: "Tailwind CSS", value: 92 },
                        { label: "Git & Version Control", value: 80 },
                     ].map(s => (
                        <div key={s.label} className="space-y-2">
                           <div className="flex justify-between text-sm font-semibold text-slate-700">
                              <span>{s.label}</span>
                              <span className="text-green-600">{s.value}%</span>
                           </div>
                           <Progress value={s.value} className="h-1.5" indicatorClassName="bg-green-500" />
                        </div>
                     ))}
                  </div>
               </div>
               <div className="space-y-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Growth Needed</h3>
                  <div className="space-y-4">
                     {[
                        { label: "System Design", value: 35 },
                        { label: "Backend (Node/Python)", value: 45 },
                        { label: "DevOps (Docker/AWS)", value: 20 },
                        { label: "Database Optimization", value: 50 },
                     ].map(s => (
                        <div key={s.label} className="space-y-2">
                           <div className="flex justify-between text-sm font-semibold text-slate-700">
                              <span>{s.label}</span>
                              <span className="text-amber-600">{s.value}%</span>
                           </div>
                           <Progress value={s.value} className="h-1.5" indicatorClassName="bg-amber-500" />
                        </div>
                     ))}
                  </div>
               </div>
            </CardContent>
         </Card>

         {/* Recommendations */}
         <div className="space-y-6">
            <Card className="border-none shadow-xl bg-slate-900 text-white p-6 relative overflow-hidden">
               <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                     <Sparkles className="w-4 h-4" /> AI Recommendations
                  </div>
                  <h3 className="text-lg font-bold font-heading leading-tight">Focus on Backend Fundamentals</h3>
                  <p className="text-sm text-slate-400">To reach &apos;Senior&apos; status, prioritize learning Node.js and SQL database normalization patterns.</p>
                  <Button className="w-full bg-primary hover:bg-primary/90 mt-2">Start Learning Path</Button>
               </div>
               <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            </Card>

            <Card className="border-none shadow-sm bg-white p-6">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Recommended Certifications</h3>
               <div className="space-y-3">
                  {[
                     "AWS Certified Cloud Practitioner",
                     "Meta Front-End Developer",
                     "Oracle Java SE Associate",
                  ].map(c => (
                     <div key={c} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer">
                        <span className="text-xs font-semibold text-slate-600 group-hover:text-primary transition-colors">{c}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary" />
                     </div>
                  ))}
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}
