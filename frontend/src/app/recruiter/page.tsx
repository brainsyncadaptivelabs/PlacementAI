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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/recruiter/dashboard/stats");
        setStats(response.data);
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
    </div>
  );
}
