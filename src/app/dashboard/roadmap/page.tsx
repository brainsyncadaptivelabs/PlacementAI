"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, ChevronRight } from "lucide-react";

const roadmapItems = [
  { id: 1, title: "Data Structures & Algorithms", progress: 75, status: "in-progress" },
  { id: 2, title: "Operating System", progress: 50, status: "in-progress" },
  { id: 3, title: "Database Management System", progress: 60, status: "in-progress" },
  { id: 4, title: "System Design", progress: 40, status: "in-progress" },
  { id: 5, title: "HR & Behavioral Preparation", progress: 70, status: "in-progress" },
];

export default function RoadmapPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold font-heading text-slate-900">Your Personalized Roadmap</h1>
          <div className="flex items-center gap-2">
             <Badge variant="secondary" className="bg-primary/10 text-primary border-none py-1">Full Stack Developer</Badge>
             <span className="text-xs text-slate-400">• Generated on 15 May 2026</span>
          </div>
        </div>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
          <RefreshCw className="w-4 h-4 mr-2" /> Re-Generate Roadmap
        </Button>
      </div>

      <div className="space-y-6">
        <Tabs defaultValue="current" className="w-full">
           <TabsList className="bg-white border border-slate-200 p-1">
              <TabsTrigger value="current" className="data-[state=active]:bg-slate-100 px-8">Current Roadmap</TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-slate-100 px-8">Completed</TabsTrigger>
           </TabsList>
        </Tabs>

        <div className="relative pt-4 pl-4">
           {/* Vertical Line */}
           <div className="absolute left-10 top-8 bottom-8 w-0.5 bg-slate-100" />

           <div className="space-y-12 relative">
              {roadmapItems.map((item) => (
                <div key={item.id} className="flex items-start gap-8 group">
                   <div className="relative z-10">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-4 border-white shadow-sm transition-all group-hover:scale-110 ${item.progress === 100 ? 'bg-green-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                         {item.id}
                      </div>
                   </div>
                   <Card className="flex-1 border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                         <div className="space-y-3 flex-1">
                            <h3 className="font-bold text-lg text-slate-800">{item.title}</h3>
                            <div className="space-y-1">
                               <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-tight">
                                  <span>Progress</span>
                                  <span>{item.progress}%</span>
                               </div>
                               <Progress value={item.progress} className="h-2" />
                            </div>
                         </div>
                         <Button variant="ghost" size="icon" className="text-slate-300 group-hover:text-primary group-hover:bg-primary/5">
                            <ChevronRight className="w-6 h-6" />
                         </Button>
                      </CardContent>
                   </Card>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
