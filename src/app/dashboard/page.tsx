"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Calendar, ArrowUpRight } from "lucide-react";

export default function DashboardOverview() {
  return (
    <div className="p-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold font-heading">Welcome back, Shreya 👋</h1>
        <p className="text-slate-500">You&apos;re doing great! Keep up the consistency.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Overall Readiness</p>
              <p className="text-3xl font-bold text-slate-900">72%</p>
              <p className="text-xs text-green-600 font-medium">Good Progress</p>
            </div>
            <div className="relative w-16 h-16">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3"
                  strokeDasharray="72, 100"
                />
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">ATS Score</p>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-bold text-slate-900">78</p>
                <p className="text-sm font-medium text-slate-400">/100</p>
              </div>
              <p className="text-xs text-primary font-medium underline underline-offset-2">Improve to 90+</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Interviews Taken</p>
              <p className="text-3xl font-bold text-slate-900">12</p>
              <p className="text-xs text-slate-400 font-medium">Keep Practicing</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
              <Mic2 className="w-6 h-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Roadmap Progress</p>
              <p className="text-3xl font-bold text-slate-900">60%</p>
              <p className="text-xs text-green-600 font-medium">On Track</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <Map className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Roadmap Progress Details */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold font-heading">Your Roadmap Progress</CardTitle>
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-medium">Full Stack Developer</Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { label: "DSA", value: 75, color: "bg-primary" },
              { label: "OS", value: 50, color: "bg-blue-500" },
              { label: "DBMS", value: 60, color: "bg-purple-500" },
              { label: "System Design", value: 40, color: "bg-orange-500" },
              { label: "HR Preparation", value: 70, color: "bg-green-500" },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="text-slate-500">{item.value}%</span>
                </div>
                <Progress value={item.value} className="h-2 bg-slate-100" indicatorClassName={item.color} />
              </div>
            ))}
            <div className="pt-4 flex justify-center">
               <button className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                  View Full Roadmap <ArrowUpRight className="w-4 h-4" />
               </button>
            </div>
          </CardContent>
        </Card>

        {/* Tasks & Activity */}
        <div className="space-y-8">
           <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                 <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-bold font-heading">Upcoming Tasks</CardTitle>
                    <button className="text-xs font-semibold text-primary hover:underline">View All</button>
                 </div>
              </CardHeader>
              <CardContent className="space-y-4">
                 {[
                   { title: "Arrays & Strings Practice", date: "Today", icon: CheckCircle2, iconColor: "text-primary" },
                   { title: "Operating System Concepts", date: "Tomorrow", icon: Clock, iconColor: "text-blue-500" },
                   { title: "AI Mock Interview (Technical)", date: "25 May", icon: Mic2, iconColor: "text-purple-500" },
                   { title: "SQL Practice", date: "26 May", icon: CheckCircle2, iconColor: "text-green-500" },
                 ].map((task, i) => (
                   <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <task.icon className={`w-5 h-5 ${task.iconColor}`} />
                      <div className="flex-1 min-w-0">
                         <p className="text-sm font-semibold text-slate-900 truncate">{task.title}</p>
                         <p className="text-xs text-slate-500">{task.date}</p>
                      </div>
                   </div>
                 ))}
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                 <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-bold font-heading">Recent Activity</CardTitle>
                    <button className="text-xs font-semibold text-primary hover:underline">View All</button>
                 </div>
              </CardHeader>
              <CardContent className="space-y-4">
                 {[
                   { title: "Completed AI Interview", desc: "Score: 76/100", time: "2h ago" },
                   { title: "Resume Analyzed", desc: "ATS Score: 78", time: "1d ago" },
                   { title: "Added new note", desc: "Data Structures", time: "2d ago" },
                 ].map((activity, i) => (
                   <div key={i} className="flex flex-col gap-1 pl-4 border-l-2 border-slate-100 relative">
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-primary"></div>
                      <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                      <p className="text-xs text-slate-500">{activity.desc}</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">{activity.time}</p>
                   </div>
                 ))}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

// Add these to types or define them here for now
import { LucideIcon } from "lucide-react";
import { Mic2 } from "lucide-react";
