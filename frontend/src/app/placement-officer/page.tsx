"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  TrendingUp, 
  Award, 
  BookOpen, 
  UserCheck, 
  Loader2,
  CheckCircle,
  AlertTriangle,
  GraduationCap
} from "lucide-react";
import api from "@/lib/api";
import { AnalyticsCard } from "@/components/shared/AnalyticsCard";
import { toast } from "sonner";

export default function PlacementOfficerDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [officerIntel, setOfficerIntel] = useState<any>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [statsRes, intelRes] = await Promise.allSettled([
        api.get("/ppo/dashboard/stats"),
        api.get("/placement-officer/dashboard"),
      ]);
      if (statsRes.status === "fulfilled") setData(statsRes.value.data);
      if (intelRes.status === "fulfilled") setOfficerIntel(intelRes.value.data);
    } catch (err) {
      toast.error("Failed to fetch dashboard stats.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
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
            <GraduationCap className="h-8 w-8 text-primary" /> Placement Officer Analytics
          </h1>
          <p className="text-muted-foreground font-medium">Institution-level readiness leaderboards and category breakdown insights.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnalyticsCard title="Total Students" value={data?.totalStudents || 0} />
        <AnalyticsCard title="Eligible Students" value={data?.eligibleStudents || 0} />
        <AnalyticsCard title="Total Applications" value={data?.totalApplications || 0} />
        <AnalyticsCard title="Offers Extended" value={data?.offersExtended || 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Score Averages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-medium mb-1">
                <span>ATS Score</span>
                <span className="font-bold">{data?.averageAtsScore || 0}%</span>
              </div>
              <Progress value={data?.averageAtsScore || 0} className="h-2" indicatorClassName="bg-blue-500" />
            </div>
            <div>
              <div className="flex justify-between text-sm font-medium mb-1">
                <span>Coding Score</span>
                <span className="font-bold">{data?.averageCodingScore || 0}%</span>
              </div>
              <Progress value={data?.averageCodingScore || 0} className="h-2" indicatorClassName="bg-purple-500" />
            </div>
            <div>
              <div className="flex justify-between text-sm font-medium mb-1">
                <span>Interview Score</span>
                <span className="font-bold">{data?.averageInterviewScore || 0}%</span>
              </div>
              <Progress value={data?.averageInterviewScore || 0} className="h-2" indicatorClassName="bg-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Top Skills</CardTitle>
          </CardHeader>
          <CardContent>
            {(!data?.topSkills || Object.keys(data.topSkills).length === 0) ? (
              <p className="text-sm text-muted-foreground">No data available yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                 {Object.entries(data.topSkills).map(([skill, count]) => (
                   <Badge key={skill} variant="secondary">{skill} ({count as number})</Badge>
                 ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Weak Skills</CardTitle>
          </CardHeader>
          <CardContent>
            {(!data?.weakSkills || data.weakSkills.length === 0) ? (
              <p className="text-sm text-muted-foreground">No data available yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                 {data.weakSkills.map((skill: string) => (
                   <Badge key={skill} variant="outline" className="text-red-500 border-red-500/20 bg-red-500/5">{skill}</Badge>
                 ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {officerIntel && (
        <div className="space-y-6 mt-8">
          <h2 className="text-xl font-bold font-heading flex items-center gap-2 text-foreground">
             <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
             AI Placement Officer Intelligence
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <Card className="border-border bg-card">
                <CardHeader>
                   <CardTitle className="text-md font-bold">Branch Performance Leaderboard</CardTitle>
                   <CardDescription>Average readiness index by department.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   {Object.entries(officerIntel.branchAverages || {}).map(([branch, score]) => (
                      <div key={branch} className="space-y-1.5 border-b border-border/40 pb-2">
                         <div className="flex justify-between text-xs font-bold">
                            <span>{branch}</span>
                            <span className="text-primary">{score as number}%</span>
                         </div>
                         <Progress value={score as number} className="h-1.5 indicatorClassName=bg-primary" />
                      </div>
                   ))}
                </CardContent>
             </Card>

             <Card className="border-border bg-card">
                <CardHeader>
                   <CardTitle className="text-md font-bold">Student Readiness Segmentation</CardTitle>
                   <CardDescription>Automatic classification of batch status.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                   {Object.entries(officerIntel.studentDistribution || {}).map(([segment, count]) => (
                      <div key={segment} className="flex justify-between items-center text-xs border-b border-border/30 pb-1.5">
                         <span className="font-semibold text-muted-foreground">{segment}</span>
                         <Badge variant="secondary" className="font-bold">{count as number} Students</Badge>
                      </div>
                   ))}
                </CardContent>
             </Card>

             <Card className="border-border bg-card">
                <CardHeader>
                   <CardTitle className="text-md font-bold">AI Intervention Recommender</CardTitle>
                   <CardDescription>Suggested workshops based on trend blockers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   {officerIntel.interventions?.map((rec: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-1.5">
                         <div className="flex justify-between items-center">
                            <span className="font-black text-xs text-foreground">{rec.title}</span>
                            <Badge variant="outline" className="text-[9px] font-black uppercase text-primary border-primary/20 bg-primary/5">{rec.priority}</Badge>
                         </div>
                         <p className="text-[11px] text-muted-foreground/80 leading-relaxed">{rec.description}</p>
                      </div>
                   ))}
                </CardContent>
             </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <Card className="border-border bg-card">
                <CardHeader>
                   <CardTitle className="text-md font-bold">Batch Placement Forecasts</CardTitle>
                   <CardDescription>Predictive conversion stats.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                   <div className="p-4 rounded-xl border border-border bg-muted/20">
                      <div className="text-[10px] font-black text-muted-foreground/60 uppercase">Expected Placements</div>
                      <div className="text-xl font-black text-foreground mt-1">{officerIntel.forecast?.expectedPlacements} Students</div>
                   </div>
                   <div className="p-4 rounded-xl border border-border bg-muted/20">
                      <div className="text-[10px] font-black text-muted-foreground/60 uppercase">Expected Offers</div>
                      <div className="text-xl font-black text-foreground mt-1">{officerIntel.forecast?.expectedOffers} Offers</div>
                   </div>
                   <div className="p-4 rounded-xl border border-border bg-muted/20">
                      <div className="text-[10px] font-black text-muted-foreground/60 uppercase">Est. Highest Package</div>
                      <div className="text-xl font-black text-foreground mt-1">{officerIntel.forecast?.expectedHighestPackage}</div>
                   </div>
                   <div className="p-4 rounded-xl border border-border bg-muted/20">
                      <div className="text-[10px] font-black text-muted-foreground/60 uppercase">Est. Average Package</div>
                      <div className="text-xl font-black text-foreground mt-1">{officerIntel.forecast?.averagePackage}</div>
                   </div>
                </CardContent>
             </Card>

             <Card className="border-border bg-card">
                <CardHeader>
                   <CardTitle className="text-md font-bold">AI College Insights</CardTitle>
                   <CardDescription>High-level institutional highlights.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                   {officerIntel.aiCollegeInsights?.map((insight: string, idx: number) => (
                      <div key={idx} className="flex gap-2 text-xs font-semibold text-muted-foreground">
                         <span className="text-primary font-bold">•</span>
                         <span>{insight}</span>
                      </div>
                   ))}
                </CardContent>
             </Card>
          </div>
        </div>
      )}
    </div>
  );
}
