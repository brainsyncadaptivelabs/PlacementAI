"use client";

import React, { useState, useEffect, useMemo, memo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Zap, 
  Mic2, 
  FileText, 
  TrendingUp, 
  ChevronRight,
  Sparkles,
  BookOpen,
  Code2,
  Brain,
  Loader2,
  Map as MapIcon,
  Trophy,
  Star,
  X,
  AlertCircle
} from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { usePerformanceProfile } from "@/hooks/usePerformanceProfile";
import { getProfileCompletionRouteForRole } from "@/lib/auth-routes";

// Lazy load non-critical components to reduce first paint
const CareerMentorWidget = dynamic(() => import("@/components/dashboard/CareerMentorWidget"), { 
  loading: () => <div className="h-48 animate-pulse bg-muted rounded-3xl" /> 
});

const UpcomingEvents = dynamic(() => import("@/components/dashboard/UpcomingEvents"), {
  loading: () => <div className="h-64 animate-pulse bg-muted rounded-3xl" />
});

type DashboardStats = {
  fullName: string;
  readinessScore: number;
  highestAtsScore: number;
  mockInterviewsCount: number;
  roadmapsCount: number;
  upcomingEvents?: Array<{
    company: string;
    type: string;
    date: string;
    time: string;
    color: string;
  }>;
};

const RadialProgress = memo(({ score, animate }: { score: number, animate: boolean }) => (
  <div className="relative z-10 flex flex-col items-center gap-4 bg-card/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-transparent shadow-md lg:w-72">
    <div className="relative w-40 h-40">
       <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="282.7" strokeDashoffset={282.7 * (1 - (score / 100))} className={`text-primary ${animate ? 'transition-all duration-1000 ease-out' : ''}`} strokeLinecap="round" />
       </svg>
       <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black tracking-tighter">{score}%</span>
          <span className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest">Ready</span>
       </div>
    </div>
    <div className="text-center">
       <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-1">Placement Readiness</p>
       <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
          <TrendingUp className="w-3 h-3" /> Updated just now
       </div>
    </div>
  </div>
));

RadialProgress.displayName = "RadialProgress";

export default function PerfectStudentPortal() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [placementIntel, setPlacementIntel] = useState<any | null>(null);
  const [mentorData, setMentorData] = useState<any | null>(null);
  const [timelineData, setTimelineData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [activeRoadmap, setActiveRoadmap] = useState<any | null>(null);
  const router = useRouter();
  const perfProfile = usePerformanceProfile();

  useEffect(() => {
    const saved = localStorage.getItem("user_roadmap");
    if (saved) {
      try {
        setActiveRoadmap(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved roadmap", e);
      }
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setStatsError(null);
      const response = await api.get("/dashboard/stats");
      setStats(response.data);
      
      // Additive fetching for Placement Intelligence
      try {
        const [intelRes, mentorRes, timelineRes] = await Promise.all([
          api.get("/placement-intelligence/dashboard"),
          api.get("/placement-intelligence/mentor"),
          api.get("/placement-intelligence/timeline"),
        ]);
        setPlacementIntel(intelRes.data);
        setMentorData(mentorRes.data);
        setTimelineData(timelineRes.data);
      } catch (err) {
        console.error("Failed to fetch placement intelligence dashboard stats", err);
      }
    } catch (err: unknown) {
      console.error("Failed to fetch stats", err);
      setStatsError("Unable to load dashboard statistics.");
      setStats({
        fullName: "Test Student",
        readinessScore: 0,
        highestAtsScore: 0,
        mockInterviewsCount: 0,
        roadmapsCount: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const profileRes = await api.get("/user/profile");
        const { profileCompleted, planSelected, role } = profileRes.data;

        if (profileCompleted === false) {
          router.push(getProfileCompletionRouteForRole(role));
          return;
        }

        fetchStats();
      } catch (err) {
        console.error("Auth check failed", err);
        setStatsError("Unable to load dashboard data. Please refresh or contact support.");
        setLoading(false);
      }
    };

    checkProfile();
  }, [router, fetchStats]);

  const userStats = useMemo(() => ({
    fullName: stats?.fullName || "Student",
    readinessScore: stats?.readinessScore || 0,
    highestAtsScore: stats?.highestAtsScore || 0,
    mockInterviewsCount: stats?.mockInterviewsCount || 0,
    roadmapsCount: stats?.roadmapsCount || 0,
  }), [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className={`p-8 space-y-8 font-sans ${perfProfile === 'low' ? 'no-animations' : ''}`}>
      {statsError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-bold shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{statsError}</span>
          </div>
          <button onClick={() => setStatsError(null)} className="opacity-70 hover:opacity-100 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Welcome Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-slate-900 rounded-[2rem] p-8 lg:p-12 text-white relative overflow-hidden shadow-md">
         <div className="relative z-10 space-y-6 lg:max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card/10 border border-transparent text-primary text-[10px] font-black uppercase tracking-widest">
               <Sparkles className="w-3 h-3" /> Ready for the next leap?
            </div>
            <h1 className="text-4xl lg:text-5xl font-black font-heading leading-tight">
               Good morning, <span className="text-primary italic">{userStats.fullName}</span> 👋
            </h1>
            <p className="text-muted-foreground/70 text-lg font-medium leading-relaxed">
               Welcome to your AI Placement Copilot. Your readiness score is <span className="text-white font-bold">{userStats.readinessScore}%</span>. Keep up the good work!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
               <Button className="bg-primary hover:bg-primary/90 text-white font-black px-8 h-14 rounded-2xl shadow-sm text-md group" onClick={() => router.push('/mock-interview')}>
                  Start AI Interview <Mic2 className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" />
               </Button>
               <Button variant="outline" className="border-transparent bg-card/10 hover:bg-card/20 text-white font-black px-8 h-14 rounded-2xl backdrop-blur-sm text-md" onClick={() => router.push('/dashboard/profile')}>
                  Update Profile
               </Button>
            </div>
         </div>

         <RadialProgress score={userStats.readinessScore} animate={perfProfile !== 'low'} />

         {/* Abstract background blobs */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="flex flex-col justify-between h-full">
                  <div className="flex-1 flex flex-col justify-between">
                     <div className="flex justify-between items-center mb-6">
                        <div className="icon-wrapper">
                           <Target className="w-6 h-6 text-primary" />
                        </div>
                        <Badge variant="secondary" className="font-bold">Resumes</Badge>
                     </div>
                     <div>
                        <h3 className="text-lg font-bold font-heading mb-2">Resume ATS Stats</h3>
                        <div className="space-y-2">
                           <div className="flex justify-between text-xs font-bold text-muted-foreground/70">
                              <span>Highest Score</span>
                              <span className="text-foreground">{userStats.highestAtsScore}</span>
                           </div>
                           <Progress value={userStats.highestAtsScore} className="h-1.5" />
                        </div>
                     </div>
                  </div>
                  <div className="pt-6">
                     <Button variant="ghost" className="w-full justify-between text-primary font-bold px-4" onClick={() => router.push('/dashboard/ats')}>
                        Upload New Resume <ChevronRight className="w-4 h-4" />
                     </Button>
                  </div>
               </Card>

               <Card className="flex flex-col justify-between h-full">
                  <div className="flex-1 flex flex-col justify-between">
                     <div className="flex justify-between items-center mb-6">
                        <div className="icon-wrapper">
                           <Zap className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex items-center gap-1 text-primary text-xs font-bold">
                           <Trophy className="w-3 h-3" /> Interviews: {userStats.mockInterviewsCount}
                        </div>
                     </div>
                     <div>
                        <h3 className="text-lg font-bold font-heading mb-2">Active Roadmaps</h3>
                        <div className="space-y-4">
                           <div>
                              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground/70 mb-2">
                                 <span>Progress</span>
                                 <span>{userStats.roadmapsCount > 0 ? "Active" : "None"}</span>
                              </div>
                              <Progress value={userStats.roadmapsCount > 0 ? 50 : 0} className="h-1.5" />
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="pt-6">
                     <Button variant="ghost" className="w-full justify-between text-primary font-bold px-4" onClick={() => router.push('/dashboard/roadmap')}>
                        View Career Roadmap <ChevronRight className="w-4 h-4" />
                     </Button>
                  </div>
               </Card>
            </div>

            {activeRoadmap ? (
               <Card className="bg-card overflow-hidden">
                  <CardHeader className="px-8 py-6 flex flex-row items-center justify-between">
                     <div>
                        <CardTitle className="text-xl font-bold font-heading">Personalized Roadmap</CardTitle>
                        <CardDescription>Target: {activeRoadmap.careerGoal}</CardDescription>
                     </div>
                     <Badge variant="outline" className="rounded-lg py-1.5 px-3 font-bold border-border">In Progress</Badge>
                  </CardHeader>
                  <CardContent className="p-8">
                     <div className="relative space-y-12">
                        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-transparent" />
                        {activeRoadmap.learningPath?.slice(0, 4).map((step: string, i: number) => {
                           const stepSkills = activeRoadmap.recommendedSkills?.slice(i * 2, i * 2 + 2) || [];
                           const status = (i === 0 ? "In Progress" : "Upcoming") as "Completed" | "In Progress" | "Upcoming";
                           const Icon = i === 0 ? Brain : i === 1 ? Code2 : i === 2 ? BookOpen : Star;
                           return (
                              <div key={i} className="relative pl-12 group">
                                 <div className={`absolute left-0 w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-all duration-300 z-10 ${status === 'Completed' ? 'bg-primary text-white' : status === 'In Progress' ? 'bg-card text-primary border border-border' : 'bg-muted text-muted-foreground/70'}`}>
                                    <Icon className="w-3.5 h-3.5" />
                                 </div>
                                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                       <h4 className="font-black text-foreground">{step}</h4>
                                       <div className="flex flex-wrap gap-2 mt-2">
                                          {stepSkills.map((item: string) => (
                                             <span key={item} className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest bg-muted border border-transparent px-2 py-0.5 rounded">{item}</span>
                                          ))}
                                       </div>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${status === 'Completed' ? 'text-emerald-500' : status === 'In Progress' ? 'text-primary' : 'text-muted-foreground/50'}`}>{status}</span>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </CardContent>
               </Card>
            ) : (
               <Card className="bg-card overflow-hidden p-8 text-center space-y-4">
                  <h3 className="text-lg font-bold font-heading text-foreground">No Career Roadmap Generated Yet</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                     Create a fully personalized AI roadmap based on your profile and target job role.
                  </p>
                  <Button onClick={() => router.push('/dashboard/roadmap')} className="bg-primary hover:bg-primary/90 text-white font-bold px-6 rounded-xl">
                     Generate Career Roadmap
                  </Button>
               </Card>
            )}

            {placementIntel && (
               <Card className="bg-card overflow-hidden mt-8 border-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                  <CardHeader className="px-8 py-6 flex flex-row items-center justify-between bg-primary/5">
                     <div>
                        <CardTitle className="text-xl font-bold font-heading flex items-center gap-2">
                           <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                           Placement Intelligence
                        </CardTitle>
                        <CardDescription>Context-aware career assessment & target profiles</CardDescription>
                     </div>
                     <div className="flex gap-2">
                        <Badge variant="outline" className="font-bold text-xs uppercase tracking-wider py-1 px-2.5 bg-primary/10 text-primary border-primary/20">
                           AI Confidence: {placementIntel.placementScore >= 75 ? "90%" : "70%"}
                        </Badge>
                        <Badge variant="secondary" className="font-bold text-xs uppercase tracking-wider py-1 px-2.5">
                           {placementIntel.readinessLevel || "Developing"}
                        </Badge>
                        <Badge variant="outline" className={`rounded-lg py-1.5 px-3 font-bold border-transparent ${placementIntel.placementReady ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                           {placementIntel.placementReady ? "Placement Ready" : "Enhancement Recommended"}
                        </Badge>
                     </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                     <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-6 border-b border-border">
                        <div className="flex items-center gap-6">
                           <div className="relative w-24 h-24">
                              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                 <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                                 <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - (placementIntel.placementScore / 100))} className="text-primary transition-all duration-1000 ease-out" strokeLinecap="round" />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                 <span className="text-2xl font-black">{placementIntel.placementScore}</span>
                                 <span className="text-[8px] uppercase tracking-wider font-semibold text-muted-foreground">Score</span>
                              </div>
                           </div>
                           <div>
                              <h4 className="font-bold text-lg">Overall Placement Score</h4>
                              <div className="text-xs text-primary font-black uppercase tracking-wider mt-0.5">
                                 Est. Package: <span className="underline">{placementIntel.estimatedPackageRange || "4 - 8 LPA"}</span>
                              </div>
                              <p className="text-xs text-muted-foreground/80 mt-1.5 max-w-xs">
                                 Calculated dynamically using coding analytics, ATS metrics, communication fluency and mock interviews.
                              </p>
                           </div>
                        </div>
                        
                        <div className="w-full md:w-64 flex flex-col gap-2">
                           <div className="text-xs font-bold text-muted-foreground/70 uppercase tracking-widest mb-1">Top Target Rankings</div>
                           <div className="space-y-1.5">
                              {placementIntel.companyRanking?.slice(0, 3).map((item: string, index: number) => (
                                 <div key={index} className="flex justify-between text-xs font-medium border-b border-border/40 pb-1">
                                    <span className="text-foreground">{item.split(" - ")[0]}</span>
                                    <span className="text-primary font-bold">{item.split(" - ")[1]}</span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <div className="text-xs font-black uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              Weak Areas
                           </div>
                           <div className="flex flex-wrap gap-2">
                              {placementIntel.weakAreas?.map((area: string) => (
                                  <span key={area} className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg">
                                    {area}
                                 </span>
                              ))}
                           </div>
                        </div>

                        <div className="space-y-3">
                           <div className="text-xs font-black uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Strong Areas
                           </div>
                           <div className="flex flex-wrap gap-2">
                              {placementIntel.strongAreas?.map((area: string) => (
                                 <span key={area} className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                                    {area}
                                 </span>
                              ))}
                           </div>
                        </div>
                     </div>

                     <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 space-y-3">
                        <div className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                           <Sparkles className="w-4 h-4" /> AI Placement Insights
                        </div>
                        <ul className="space-y-1.5">
                           {placementIntel.insights?.map((insight: string, idx: number) => (
                              <li key={idx} className="text-xs font-medium text-muted-foreground flex items-start gap-2">
                                 <span className="text-primary mt-1">•</span>
                                 <span>{insight}</span>
                              </li>
                           ))}
                        </ul>
                     </div>

                     {/* Week-by-Week detailed roadmap */}
                     <div className="border-t border-border pt-6 space-y-4">
                        <div className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Personalized Learning Roadmap</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           {placementIntel.detailedRoadmap?.map((item: string, idx: number) => (
                              <div key={idx} className="bg-muted/40 border border-border/60 rounded-xl p-4 space-y-2">
                                 <div className="text-[10px] font-black text-primary uppercase tracking-widest">Week {idx + 1}</div>
                                 <p className="text-xs font-semibold text-foreground/90">{item.replace(/^Week \d+:\s*/, "")}</p>
                              </div>
                           ))}
                        </div>
                     </div>
                  </CardContent>
               </Card>
            )}
         </div>

         <div className="space-y-8">
             {mentorData && (
                <Card className="border-primary/20 bg-card overflow-hidden shadow-sm">
                   <CardHeader className="bg-primary/5 pb-4">
                      <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                         <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                         AI Placement Mentor
                      </CardTitle>
                      <CardDescription className="text-xs font-semibold text-foreground/80 mt-1">
                         {mentorData.mentorGuidance}
                      </CardDescription>
                   </CardHeader>
                   <CardContent className="p-5 space-y-4">
                      {mentorData.dailyMission && (
                         <div className="space-y-2">
                            <div className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-wider">Today's Placement Mission</div>
                            <div className="p-3 bg-muted/40 rounded-xl border border-border/60 space-y-2">
                               <div className="text-xs font-black text-foreground">{mentorData.dailyMission.missionTitle}</div>
                               <div className="space-y-1.5 text-xs text-muted-foreground">
                                  <div className="flex gap-2"><span className="text-primary font-bold">•</span><span><strong>Resume:</strong> {mentorData.dailyMission.resumeTask}</span></div>
                                  <div className="flex gap-2"><span className="text-primary font-bold">•</span><span><strong>Coding:</strong> {mentorData.dailyMission.codingTask}</span></div>
                                  <div className="flex gap-2"><span className="text-primary font-bold">•</span><span><strong>Interview:</strong> {mentorData.dailyMission.interviewTask}</span></div>
                               </div>
                               <div className="flex justify-between items-center text-[10px] font-bold text-primary border-t border-border/40 pt-2 mt-2">
                                  <span>Time: {mentorData.dailyMission.estimatedTime}</span>
                                  <span>{mentorData.dailyMission.expectedProgress}</span>
                               </div>
                            </div>
                         </div>
                      )}

                      {mentorData.unlockedOpportunities && mentorData.unlockedOpportunities.length > 0 && (
                         <div className="space-y-2">
                            <div className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-wider">Opportunity Alerts</div>
                            <div className="space-y-1.5">
                               {mentorData.unlockedOpportunities.map((op: string, idx: number) => (
                                  <div key={idx} className="p-2.5 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 rounded-xl text-[11px] font-semibold flex gap-2">
                                     <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                     <span>{op}</span>
                                  </div>
                               ))}
                            </div>
                         </div>
                      )}
                   </CardContent>
                </Card>
             )}

             {timelineData && (
                <Card className="border-border bg-card shadow-sm">
                   <CardHeader>
                      <CardTitle className="text-sm font-bold">Your Placement Timeline</CardTitle>
                   </CardHeader>
                   <CardContent className="p-5 space-y-4">
                      <div className="relative border-l border-border/60 pl-4 ml-1 space-y-5">
                         {timelineData.map((ev: any, idx: number) => (
                            <div key={idx} className="relative">
                               <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-background ${ev.status === 'COMPLETED' ? 'bg-emerald-500' : ev.status === 'IN_PROGRESS' ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                               <div className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-wider">{ev.month}</div>
                               <div className="text-xs font-bold text-foreground">{ev.milestone}</div>
                               <p className="text-[10px] text-muted-foreground mt-0.5">{ev.details}</p>
                            </div>
                         ))}
                      </div>
                   </CardContent>
                </Card>
             )}

            <UpcomingEvents events={stats?.upcomingEvents} />
            <CareerMentorWidget onOpenChat={() => router.push('/dashboard/chat')} />

            <div className="grid grid-cols-2 gap-4">
               <Button variant="outline" className="h-24 flex-col gap-2 rounded-2xl bg-card border-border hover:bg-muted hover:text-primary transition-all group shadow-sm font-black text-xs uppercase tracking-widest" onClick={() => router.push('/dashboard/ats')}>
                  <FileText className="w-6 h-6 text-muted-foreground/70 group-hover:text-primary group-hover:scale-110 transition-all" />
                  ATS Scan
               </Button>
               <Button variant="outline" className="h-24 flex-col gap-2 rounded-2xl bg-card border-border hover:bg-muted hover:text-primary transition-all group shadow-sm font-black text-xs uppercase tracking-widest" onClick={() => router.push('/dashboard/roadmap')}>
                  <MapIcon className="w-6 h-6 text-muted-foreground/70 group-hover:text-primary group-hover:scale-110 transition-all" />
                  Roadmap
               </Button>
            </div>
         </div>
      </div>
    </div>
  );
}
