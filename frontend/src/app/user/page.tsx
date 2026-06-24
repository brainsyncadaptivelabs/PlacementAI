"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Target, 
  Zap, 
  Map, 
  Mic2, 
  FileText, 
  TrendingUp, 
  Calendar, 
  Clock, 
  ChevronRight,
  Star,
  Sparkles,
  BookOpen,
  Code2,
  Brain,
  MessageSquare
} from "lucide-react";

export default function PerfectUserPortal() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 space-y-8 font-sans">
      {/* Hero Welcome Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-slate-900 rounded-[2rem] p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
         <div className="relative z-10 space-y-6 lg:max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card/10 border border-white/10 text-primary text-[10px] font-black uppercase tracking-widest">
               <Sparkles className="w-3 h-3" /> Ready for the next leap?
            </div>
            <h1 className="text-4xl lg:text-5xl font-black font-heading leading-tight">
               Good morning, <span className="text-primary italic">Shreya Singh</span> 👋
            </h1>
            <p className="text-muted-foreground/70 text-lg font-medium leading-relaxed">
               You are in the top <span className="text-white font-bold">5% of applicants</span> for Full Stack roles this week. Your dream job is just 3 mock interviews away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
               <Button className="bg-primary hover:bg-primary/90 text-white font-black px-8 h-14 rounded-2xl shadow-xl shadow-primary/20 text-md group">
                  Start AI Interview <Mic2 className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" />
               </Button>
               <Button variant="outline" className="border-white/20 bg-card/5 hover:bg-card/10 text-white font-black px-8 h-14 rounded-2xl backdrop-blur-sm text-md">
                  Update Resume
               </Button>
            </div>
         </div>

         {/* Radial Readiness Score */}
         <div className="relative z-10 flex flex-col items-center gap-4 bg-card/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-inner lg:w-72">
            <div className="relative w-40 h-40">
               <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                  <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="282.7" strokeDashoffset={282.7 * (1 - 0.72)} className="text-primary transition-all duration-1000 ease-out" strokeLinecap="round" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black tracking-tighter">72%</span>
                  <span className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest">Ready</span>
               </div>
            </div>
            <div className="text-center">
               <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-1">Placement Readiness</p>
               <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <TrendingUp className="w-3 h-3" /> +12% this week
               </div>
            </div>
         </div>

         {/* Abstract background blobs */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Roadmap & Progress */}
         <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="border-none shadow-sm bg-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex justify-between items-center mb-6">
                     <div className="p-3 bg-blue-50 rounded-2xl">
                        <Target className="w-6 h-6 text-blue-600" />
                     </div>
                     <Badge className="bg-blue-100 text-blue-700 border-none font-bold">Priority</Badge>
                  </div>
                  <h3 className="text-lg font-bold font-heading mb-2">Target Companies</h3>
                  <div className="flex -space-x-3 mb-6">
                     {['G', 'A', 'M', 'A'].map((l, i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-muted flex items-center justify-center font-black text-xs text-muted-foreground/70 shadow-sm">{l}</div>
                     ))}
                     <div className="w-10 h-10 rounded-full border-2 border-white bg-primary flex items-center justify-center text-white text-[10px] font-bold shadow-sm">+8</div>
                  </div>
                  <Button variant="ghost" className="w-full justify-between text-blue-600 font-bold hover:bg-blue-50 hover:text-blue-700 rounded-xl px-4">
                     View Match Report <ChevronRight className="w-4 h-4" />
                  </Button>
               </Card>

               <Card className="border-none shadow-sm bg-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex justify-between items-center mb-6">
                     <div className="p-3 bg-purple-50 rounded-2xl">
                        <Zap className="w-6 h-6 text-purple-600" />
                     </div>
                     <div className="flex items-center gap-1 text-purple-600 text-xs font-bold">
                        <Trophy className="w-3 h-3" /> Streak: 12
                     </div>
                  </div>
                  <h3 className="text-lg font-bold font-heading mb-2">Coding Proficiency</h3>
                  <div className="space-y-4">
                     <div>
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground/70 mb-2">
                           <span>Data Structures</span>
                           <span>85%</span>
                        </div>
                        <Progress value={85} className="h-1.5" indicatorClassName="bg-purple-500" />
                     </div>
                     <div>
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground/70 mb-2">
                           <span>System Design</span>
                           <span>42%</span>
                        </div>
                        <Progress value={42} className="h-1.5" indicatorClassName="bg-slate-200" />
                     </div>
                  </div>
               </Card>
            </div>

            {/* Personalized Roadmap */}
            <Card className="border-none shadow-sm bg-card overflow-hidden">
               <CardHeader className="px-8 py-6 border-b border-border flex flex-row items-center justify-between">
                  <div>
                     <CardTitle className="text-xl font-bold font-heading">Personalized Roadmap</CardTitle>
                     <CardDescription>Generated for Full Stack Developer role</CardDescription>
                  </div>
                  <Badge variant="outline" className="rounded-lg py-1.5 px-3 font-bold border-border">60% Complete</Badge>
               </CardHeader>
               <CardContent className="p-8">
                  <div className="relative space-y-12">
                     <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-muted" />
                     {[
                        { title: "Foundations & DSA", status: "Completed", icon: Code2, items: ["Big O Notation", "Arrays & Strings", "Linked Lists"] },
                        { title: "Core CS Fundamentals", status: "In Progress", icon: Brain, items: ["OS Scheduling", "DBMS Normalization", "Networking"] },
                        { title: "Project Portfolio", status: "Upcoming", icon: BookOpen, items: ["AI SaaS Implementation", "Scalability Testing"] },
                        { title: "Final Interview Prep", status: "Upcoming", icon: Star, items: ["L4/L5 Behavioral", "Live Coding Practice"] },
                     ].map((step, i) => (
                        <div key={i} className="relative pl-12 group">
                           <div className={`absolute left-0 w-8 h-8 rounded-full border-4 border-white shadow-md flex items-center justify-center transition-all duration-300 z-10 ${step.status === 'Completed' ? 'bg-primary text-white' : step.status === 'In Progress' ? 'bg-card text-primary border-primary' : 'bg-muted text-muted-foreground/70'}`}>
                              <step.icon className="w-3.5 h-3.5" />
                           </div>
                           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div>
                                 <h4 className="font-black text-foreground leading-tight">{step.title}</h4>
                                 <div className="flex flex-wrap gap-2 mt-2">
                                    {step.items.map(item => (
                                       <span key={item} className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest bg-muted border border-border px-2 py-0.5 rounded">{item}</span>
                                    ))}
                                 </div>
                              </div>
                              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${step.status === 'Completed' ? 'text-emerald-500' : step.status === 'In Progress' ? 'text-primary' : 'text-muted-foreground/50'}`}>{step.status}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Sidebar widgets */}
         <div className="space-y-8">
            {/* Upcoming Interviews Calendar */}
            <Card className="border-none shadow-sm bg-card p-6">
               <div className="flex items-center justify-between mb-8">
                  <div>
                     <CardTitle className="text-md font-bold font-heading">Upcoming Events</CardTitle>
                     <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">Next 48 Hours</p>
                  </div>
                  <Calendar className="w-5 h-5 text-muted-foreground/50" />
               </div>
               <div className="space-y-4">
                  {[
                     { company: "Amazon", type: "Technical Round", date: "May 20", time: "10:30 AM", color: "bg-orange-500" },
                     { company: "Microsoft", type: "System Design", date: "May 21", time: "2:00 PM", color: "bg-blue-600" },
                  ].map((event, i) => (
                     <div key={i} className="flex gap-4 p-4 rounded-2xl bg-muted border border-border group cursor-pointer hover:border-primary/30 transition-all duration-300">
                        <div className={`w-1 h-12 rounded-full ${event.color}`} />
                        <div className="flex-1 min-w-0">
                           <p className="text-xs font-black text-foreground truncate">{event.company}</p>
                           <p className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">{event.type}</p>
                           <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1">
                                 <Clock className="w-3 h-3 text-muted-foreground/70" />
                                 <span className="text-[10px] font-bold text-muted-foreground">{event.time}</span>
                              </div>
                              <Badge className="bg-card border-border text-muted-foreground text-[9px] font-black">{event.date}</Badge>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
               <Button variant="outline" className="w-full mt-6 rounded-xl text-xs font-black uppercase tracking-[0.2em] h-12 border-border hover:bg-muted">
                  Full Schedule
               </Button>
            </Card>

            {/* AI Career Mentor Widget */}
            <Card className="border-none shadow-sm bg-primary p-8 text-white relative overflow-hidden rounded-[2rem]">
               <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-center">
                     <div className="p-3 bg-card/20 rounded-2xl backdrop-blur-md">
                        <MessageSquare className="w-6 h-6 text-white" />
                     </div>
                     <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div>
                     <h4 className="text-xl font-bold font-heading leading-tight mb-2">Ask your Career Mentor</h4>
                     <p className="text-xs text-white/70 leading-relaxed font-medium">Get instant advice on salary negotiation, resume tips, or company culture.</p>
                  </div>
                  <div className="bg-card/10 border border-white/20 rounded-2xl p-4 cursor-pointer hover:bg-card/20 transition-all group">
                     <p className="text-xs font-bold text-white/50 group-hover:text-white/80 transition-colors italic">&quot;How should I explain my gap year to an Amazon recruiter?&quot;</p>
                  </div>
                  <Button className="w-full bg-card text-primary hover:bg-muted font-black h-12 rounded-xl shadow-lg">
                     Open AI Chat
                  </Button>
               </div>
               <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-card/10 rounded-full blur-3xl" />
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
               <Button variant="outline" className="h-24 flex-col gap-2 rounded-2xl bg-card border-border hover:border-primary/20 hover:text-primary transition-all group shadow-sm font-black text-xs uppercase tracking-widest">
                  <FileText className="w-6 h-6 text-muted-foreground/70 group-hover:text-primary group-hover:scale-110 transition-all" />
                  ATS Scan
               </Button>
               <Button variant="outline" className="h-24 flex-col gap-2 rounded-2xl bg-card border-border hover:border-primary/20 hover:text-primary transition-all group shadow-sm font-black text-xs uppercase tracking-widest">
                  <Map className="w-6 h-6 text-muted-foreground/70 group-hover:text-primary group-hover:scale-110 transition-all" />
                  Roadmap
               </Button>
            </div>
         </div>
      </div>
    </div>
  );
}
