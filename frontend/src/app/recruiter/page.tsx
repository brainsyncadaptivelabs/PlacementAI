"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Briefcase, 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Mail, 
  FileSearch, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  Zap,
  Star,
  TrendingUp,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function PerfectRecruiterPortal() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const response = await api.get("/user/profile");
        if (response.data.profileCompleted === false) {
          router.push("/complete-profile/recruiter");
          return;
        }
        setLoading(false);
      } catch (err) {
        console.error("Auth check failed", err);
        router.push("/auth");
      }
    };
    checkProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-heading">Talent Acquisition</h1>
          <p className="text-slate-500 font-medium">Empowering your hiring process with AI-driven insights.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="pl-10 pr-4 py-2.5 w-64 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Search candidates..." />
          </div>
          <Button variant="outline" className="border-slate-200 bg-white rounded-xl font-bold h-11">
             <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
          <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl font-bold h-11 px-6">
             <Plus className="w-4 h-4 mr-2" /> Post a Job
          </Button>
        </div>
      </div>

      {/* Main Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="border-none shadow-sm bg-primary text-white overflow-hidden relative group cursor-pointer">
            <CardContent className="p-6 relative z-10">
               <div className="flex justify-between items-center mb-6">
                  <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
                     <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-white/50" />
               </div>
               <p className="text-4xl font-black mb-1">12</p>
               <p className="text-xs font-bold text-white/70 uppercase tracking-widest">Active Openings</p>
               <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider bg-white/10 w-fit px-2 py-1 rounded">
                  <Plus className="w-3 h-3" /> 2 New Today
               </div>
            </CardContent>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-700" />
         </Card>

         <Card className="border-none shadow-sm bg-white overflow-hidden group cursor-pointer">
            <CardContent className="p-6">
               <div className="flex justify-between items-center mb-6">
                  <div className="p-2.5 bg-blue-50 rounded-xl group-hover:bg-blue-600 transition-colors">
                     <Users className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-none font-bold">45 New</Badge>
               </div>
               <p className="text-4xl font-black text-slate-900 mb-1">284</p>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Applicants</p>
               <div className="mt-4 flex items-center justify-between">
                  <div className="flex -space-x-2">
                     {[1,2,3,4].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100" />)}
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider underline">Review Now</span>
               </div>
            </CardContent>
         </Card>

         <Card className="border-none shadow-sm bg-white overflow-hidden group cursor-pointer">
            <CardContent className="p-6">
               <div className="flex justify-between items-center mb-6">
                  <div className="p-2.5 bg-green-50 rounded-xl group-hover:bg-green-600 transition-colors">
                     <CheckCircle2 className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
                     <TrendingUp className="w-3 h-3" /> +5%
                  </div>
               </div>
               <p className="text-4xl font-black text-slate-900 mb-1">18%</p>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hiring Velocity</p>
               <div className="mt-4">
                  <Progress value={78} className="h-1.5" indicatorClassName="bg-green-500" />
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Candidate Pipeline Table */}
         <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-8 py-6">
               <div>
                  <CardTitle className="text-lg font-bold font-heading">AI Match Pipeline</CardTitle>
                  <CardDescription>Top tier candidates automatically matched by AI</CardDescription>
               </div>
               <Button variant="ghost" size="sm" className="text-primary font-bold text-xs uppercase tracking-widest h-10">Export CSV</Button>
            </CardHeader>
            <div className="p-0">
               <div className="divide-y divide-slate-50">
                  {[
                     { name: "Shreya Singh", role: "Full Stack Intern", score: 96, status: "Interviewing", date: "2h ago" },
                     { name: "Rahul Verma", role: "Backend Developer", score: 92, status: "Screened", date: "5h ago" },
                     { name: "Ananya Iyer", role: "Data Scientist", score: 88, status: "New", date: "1d ago" },
                     { name: "Arjun Mehta", role: "SDE-1", score: 85, status: "Applied", date: "2d ago" },
                  ].map((app, i) => (
                     <div key={i} className="flex items-center justify-between p-8 hover:bg-slate-50/50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                              {app.name.split(' ').map(n => n[0]).join('')}
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                 <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{app.name}</p>
                                 <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              </div>
                              <p className="text-xs text-slate-500 font-medium">{app.role}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-12">
                           <div className="text-center">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">AI Score</p>
                              <Badge className="bg-primary/10 text-primary border-none font-black text-xs px-3">{app.score}%</Badge>
                           </div>
                           <div className="hidden sm:block w-32">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                              <div className="flex items-center gap-1.5">
                                 <div className={`w-1.5 h-1.5 rounded-full ${app.status === 'Interviewing' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                                 <span className="text-xs font-bold text-slate-700">{app.status}</span>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              <Button size="icon" variant="ghost" className="rounded-xl text-slate-400 hover:bg-white hover:shadow-md hover:text-primary transition-all">
                                 <Mail className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="rounded-xl text-slate-400 hover:bg-white hover:shadow-md hover:text-primary transition-all">
                                 <FileSearch className="w-4 h-4" />
                              </Button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </Card>

         <div className="space-y-6">
            {/* Interview Calendar */}
            <Card className="border-none shadow-sm bg-white p-6">
               <div className="flex items-center justify-between mb-8">
                  <div>
                     <CardTitle className="text-md font-bold font-heading">Interviews</CardTitle>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upcoming Today</p>
                  </div>
                  <CalendarIcon className="w-5 h-5 text-slate-300" />
               </div>
               <div className="space-y-4">
                  {[1,2,3].map(i => (
                     <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group cursor-pointer hover:border-primary/30 hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                        <div className="flex flex-col items-center justify-center px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm shrink-0 group-hover:bg-primary group-hover:border-primary transition-colors">
                           <span className="text-[10px] font-black text-primary uppercase group-hover:text-white">May</span>
                           <span className="text-xl font-black text-slate-900 leading-none group-hover:text-white">2{i}</span>
                        </div>
                        <div className="flex-1 min-w-0 py-1">
                           <p className="text-xs font-bold text-slate-900 truncate group-hover:text-primary transition-colors">Technical Round - Candidate {i}</p>
                           <div className="flex items-center gap-2 mt-2">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">10:30 AM - 11:30 AM</span>
                           </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                     </div>
                  ))}
               </div>
               <Button variant="outline" className="w-full mt-8 rounded-xl text-xs font-black uppercase tracking-[0.2em] h-12 border-slate-100 hover:bg-slate-50">
                  View Full Calendar
               </Button>
            </Card>

            {/* Smart Sourcing AI */}
            <Card className="border-none shadow-sm bg-slate-900 p-8 text-white relative overflow-hidden rounded-3xl">
               <div className="relative z-10 space-y-6">
                  <div className="p-3 bg-white/10 rounded-2xl w-fit">
                     <Zap className="w-6 h-6 text-primary fill-primary" />
                  </div>
                  <div>
                     <h4 className="text-xl font-bold font-heading leading-tight mb-2">Smart Sourcing AI</h4>
                     <p className="text-xs text-white/60 leading-relaxed font-medium">Find students matching your tech stack requirements instantly using our LLM-powered search.</p>
                  </div>
                  <div className="relative">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                     <input className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm placeholder:text-white/20 focus:ring-2 focus:ring-primary/40 focus:bg-white/10 transition-all outline-none" placeholder="e.g. React, Go, AWS, Docker" />
                  </div>
               </div>
               <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
            </Card>
         </div>
      </div>
    </div>
  );
}
