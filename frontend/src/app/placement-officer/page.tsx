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

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get("/ppo/dashboard/stats");
      setData(response.data);
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
    </div>
  );
}
