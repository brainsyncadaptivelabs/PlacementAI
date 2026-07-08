"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ChevronRight, Loader2, FileText } from "lucide-react";
import api from "@/lib/api";

type RoadmapItem = {
  careerGoal: string;
  recommendedSkills: string[];
  projectSuggestions: string[];
  certifications: string[];
  learningPath: string[];
};

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<RoadmapItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [careerGoal, setCareerGoal] = useState("Full Stack Developer");

  const fetchRoadmap = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Get latest resume text
      const resumeRes = await api.get("/resume/latest");
      const resumeText = resumeRes.data;

      if (!resumeText || typeof resumeText !== 'string' || resumeText.trim() === '') {
        setError("No resume found. Please upload your resume in the ATS section first.");
        setLoading(false);
        return;
      }

      // 2. Generate roadmap
      console.log(`[Roadmap] Generating roadmap for goal: ${careerGoal}`);
      const response = await api.post("/roadmap/generate", {
        resumeText: resumeText,
        careerGoal: careerGoal
      });
      setRoadmap(response.data as RoadmapItem);
      
      // Save to localStorage so that the dashboard widget can render it dynamically
      localStorage.setItem("user_roadmap", JSON.stringify(response.data));
    } catch (err) {
      console.error("Failed to fetch roadmap", err);
      setError("Failed to generate roadmap. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Attempt to pre-fill from localStorage if it exists
    const saved = localStorage.getItem("user_roadmap");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRoadmap(parsed);
        if (parsed.careerGoal) setCareerGoal(parsed.careerGoal);
      } catch (e) {
        console.error(e);
      }
    } else {
      fetchRoadmap();
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium italic">Our AI is crafting your personalized career path...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
          <FileText className="w-10 h-10 text-red-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Oops! {error}</h1>
          <p className="text-muted-foreground">We need your resume to understand your background and provide the best guidance.</p>
        </div>
        <Button onClick={() => window.location.href='/dashboard/ats'} size="lg">Go to Resume Upload</Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Title Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold font-heading text-foreground">Your Personalized Roadmap</h1>
        <p className="text-sm text-muted-foreground font-medium">
          Input your target job role/career goal to generate an AI-customized learning journey.
        </p>
      </div>

      {/* Target Requirements Input Card */}
      <div className="flex flex-col sm:flex-row gap-4 items-end bg-card p-6 rounded-2xl border border-border shadow-sm w-full">
        <div className="flex-1 space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-muted-foreground/70">Target Career Goal / Job Role</label>
          <input 
            type="text" 
            value={careerGoal} 
            onChange={(e) => setCareerGoal(e.target.value)} 
            className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold text-foreground"
            placeholder="e.g. Frontend Engineer, Android Developer, Data Scientist"
          />
        </div>
        <Button onClick={fetchRoadmap} disabled={loading || !careerGoal.trim()} className="h-12 px-6 bg-primary font-bold shadow-lg shadow-primary/20">
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Generate Roadmap
        </Button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm bg-card overflow-hidden">
             <div className="p-6 border-b border-border bg-muted/50 font-bold text-foreground">Recommended Skills</div>
             <CardContent className="p-6">
                <div className="flex flex-wrap gap-2">
                   {roadmap?.recommendedSkills.map(skill => (
                     <Badge key={skill} className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 px-3 py-1">{skill}</Badge>
                   ))}
                </div>
             </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm bg-card overflow-hidden">
             <div className="p-6 border-b border-border bg-muted/50 font-bold text-foreground">Project Suggestions</div>
             <CardContent className="p-6">
                <ul className="space-y-3">
                   {roadmap?.projectSuggestions.map((project, i) => (
                     <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        {project}
                     </li>
                   ))}
                </ul>
             </CardContent>
          </Card>
        </div>

        <div className="relative pt-4 pl-4">
           {/* Vertical Line */}
           <div className="absolute left-10 top-8 bottom-8 w-0.5 bg-muted" />

           <div className="space-y-12 relative">
              {roadmap?.learningPath.map((item, index) => (
                <div key={index} className="flex items-start gap-8 group">
                   <div className="relative z-10">
                      <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground/70 flex items-center justify-center font-bold text-lg border-4 border-white shadow-sm transition-all group-hover:scale-110">
                         {index + 1}
                      </div>
                   </div>
                   <Card className="flex-1 border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                         <div className="space-y-3 flex-1">
                            <h3 className="font-bold text-lg text-foreground">{item}</h3>
                            <p className="text-xs text-muted-foreground">Step {index + 1} of your personalized growth plan.</p>
                         </div>
                         <Button variant="ghost" size="icon" className="text-muted-foreground/50 group-hover:text-primary group-hover:bg-primary/5">
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
