"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Briefcase, 
  Search, 
  Filter, 
  Download, 
  TrendingUp, 
  CheckCircle,
  AlertTriangle,
  Loader2
} from "lucide-react";
import api from "@/lib/api";
import { AnalyticsCard } from "@/components/shared/AnalyticsCard";
import { toast } from "sonner";

export default function RecruiterDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  const [analytics, setAnalytics] = useState<any>(null);
  const [recruiterIntel, setRecruiterIntel] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashRes, analyticsRes, intelRes] = await Promise.allSettled([
          api.get("/recruiter/dashboard/stats"),
          api.get("/recruiter/analytics"),
          api.get("/recruiter-intelligence/dashboard"),
        ]);
        if (dashRes.status === "fulfilled") setStats(dashRes.value.data);
        if (analyticsRes.status === "fulfilled") setAnalytics(analyticsRes.value.data);
        if (intelRes.status === "fulfilled") setRecruiterIntel(intelRes.value.data);
      } catch (err: any) {
        toast.error("Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight font-heading flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-primary" /> ATS Dashboard
          </h1>
          <p className="text-muted-foreground font-medium">Manage jobs, candidates, and hiring pipeline.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            className="bg-primary hover:bg-primary/95 text-white font-bold rounded-xl px-5 flex items-center gap-2"
          >
            Post New Job
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnalyticsCard title="Total Students" value={stats?.totalStudents || 0} />
        <AnalyticsCard title="Eligible Students" value={stats?.eligibleStudents || 0} />
        <AnalyticsCard title="Total Applications" value={stats?.totalApplications || 0} />
        <AnalyticsCard title="Offers Extended" value={stats?.offersExtended || 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Hiring Funnel</CardTitle>
            <CardDescription>Overview of your current recruitment pipeline.</CardDescription>
          </CardHeader>
          <CardContent>
            {(!stats?.hiringFunnel || Object.keys(stats.hiringFunnel).length === 0) ? (
              <p className="text-sm text-muted-foreground">No data available yet.</p>
            ) : (
              <div className="space-y-2">
                 {Object.entries(stats.hiringFunnel).map(([stage, count]) => (
                   <div key={stage} className="flex justify-between">
                     <span className="font-medium text-sm">{stage}</span>
                     <span>{count as number}</span>
                   </div>
                 ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Top Skills</CardTitle>
            <CardDescription>Most common skills among applicants.</CardDescription>
          </CardHeader>
          <CardContent>
             {(!stats?.topSkills || Object.keys(stats.topSkills).length === 0) ? (
              <p className="text-sm text-muted-foreground">No data available yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                 {Object.entries(stats.topSkills).map(([skill, count]) => (
                   <Badge key={skill} variant="secondary">{skill} ({count as number})</Badge>
                 ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {recruiterIntel && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-heading flex items-center gap-2 mt-8 text-foreground">
             <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
             AI Recruiter Intelligence
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <Card className="lg:col-span-2 border-border bg-card">
                <CardHeader>
                   <CardTitle className="text-lg font-bold flex items-center gap-2">
                      Top Candidate Rankings
                   </CardTitle>
                   <CardDescription>Dynamic leaderboard ranked by Placement Score, coding progress, and communication quality.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   {recruiterIntel.topCandidates?.map((candidate: any, idx: number) => {
                      const shortlist = recruiterIntel.shortlist?.find((s: any) => s.userId === candidate.userId);
                      const status = shortlist ? shortlist.status : "Recommended";
                      const reason = shortlist ? shortlist.reasoning : candidate.reason;

                      return (
                         <div key={candidate.userId || idx} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 rounded-xl border border-border bg-muted/30">
                            <div>
                               <div className="flex items-center gap-2">
                                  <span className="font-bold text-foreground">{idx + 1}. {candidate.name}</span>
                                  <Badge variant="outline" className={status === 'Recommended' ? 'bg-emerald-500/10 text-emerald-400 border-transparent' : status === 'Maybe' ? 'bg-amber-500/10 text-amber-400 border-transparent' : 'bg-red-500/10 text-red-400 border-transparent'}>
                                     {status}
                                  </Badge>
                               </div>
                               <p className="text-xs text-muted-foreground/80 mt-1">{reason}</p>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                               <div className="text-right">
                                  <div className="text-xs font-bold uppercase text-muted-foreground/70">Placement Score</div>
                                  <div className="text-lg font-black text-primary">{candidate.overallScore}%</div>
                               </div>
                               <div className="text-right">
                                  <div className="text-xs font-bold uppercase text-muted-foreground/70">AI Confidence</div>
                                  <div className="text-xs font-semibold text-foreground/80">{candidate.confidence}%</div>
                               </div>
                            </div>
                         </div>
                      );
                   })}
                </CardContent>
             </Card>

             <Card className="border-border bg-card">
                <CardHeader>
                   <CardTitle className="text-lg font-bold">AI Pipeline Insights</CardTitle>
                   <CardDescription>Sourcing actions and overall statistics.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-border bg-muted/20 text-center">
                         <div className="text-[10px] font-black uppercase text-muted-foreground/60">Avg. Score</div>
                         <div className="text-2xl font-black text-foreground mt-1">{recruiterIntel.averagePlacementScore}%</div>
                      </div>
                      <div className="p-4 rounded-xl border border-border bg-muted/20 text-center">
                         <div className="text-[10px] font-black uppercase text-muted-foreground/60">Offers Ready</div>
                         <div className="text-2xl font-black text-foreground mt-1">{recruiterIntel.highlyReadyCount}</div>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <div className="text-xs font-bold uppercase text-muted-foreground/70 tracking-wider">Strategic Recommendations</div>
                      <ul className="space-y-2">
                         {recruiterIntel.recommendations?.map((rec: string, i: number) => (
                            <li key={i} className="text-xs font-medium text-muted-foreground flex items-start gap-2">
                               <span className="text-primary">•</span>
                               <span>{rec}</span>
                            </li>
                         ))}
                      </ul>
                   </div>
                </CardContent>
             </Card>
          </div>
        </div>
      )}
    </div>
  );
}
