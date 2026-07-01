"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Users, Briefcase, Award, Clock, Target, Code2, BarChart3 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface Analytics {
  hiringFunnel: Record<string, number>;
  avgAtsScore: number;
  avgReadinessScore: number;
  avgCodingScore: number;
  avgInterviewScore: number;
  avgTimeToHireDays: number;
  topColleges: Record<string, number>;
  topSkills: Record<string, number>;
  offerRatio: number;
  acceptanceRate: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalOffers: number;
  totalJoined: number;
  scheduledInterviews: number;
  jobPerformance: {
    jobId: number;
    jobTitle: string;
    applicants: number;
    shortlisted: number;
    interviewed: number;
    offers: number;
    joined: number;
  }[];
}

const STAGE_LABELS: Record<string, string> = {
  APPLIED: "Applied", SHORTLISTED: "Shortlisted", ATS_PASSED: "ATS Passed",
  JD_MATCHED: "JD Matched", CODING: "Coding", TECHNICAL: "Technical",
  MANAGER: "Manager", HR: "HR", OFFER: "Offer", JOINED: "Joined", REJECTED: "Rejected",
};

const FUNNEL_COLORS = [
  "#6366f1","#8b5cf6","#3b82f6","#06b6d4","#10b981",
  "#f59e0b","#f97316","#ef4444","#ec4899","#14b8a6","#84cc16"
];

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${max > 0 ? (value/max)*100 : 0}%`, backgroundColor: color }} />
    </div>
  );
}

export default function RecruiterAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/recruiter/analytics")
      .then(r => setData(r.data))
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const kpis = [
    { label: "Total Jobs", value: data.totalJobs, sub: `${data.activeJobs} active`, icon: Briefcase, color: "text-primary" },
    { label: "Applications", value: data.totalApplications, icon: Users, color: "text-blue-500" },
    { label: "Offers Extended", value: data.totalOffers, icon: Award, color: "text-emerald-500" },
    { label: "Candidates Joined", value: data.totalJoined, icon: TrendingUp, color: "text-violet-500" },
    { label: "Interviews", value: data.scheduledInterviews, sub: "upcoming", icon: Clock, color: "text-amber-500" },
    { label: "Offer Ratio", value: `${data.offerRatio?.toFixed(1)}%`, icon: Target, color: "text-teal-500" },
    { label: "Acceptance Rate", value: `${data.acceptanceRate?.toFixed(1)}%`, icon: BarChart3, color: "text-pink-500" },
    { label: "Avg ATS Score", value: data.avgAtsScore?.toFixed(0), icon: Code2, color: "text-orange-500" },
  ];

  const funnelEntries = Object.entries(data.hiringFunnel || {});
  const maxFunnel = Math.max(...funnelEntries.map(([,v]) => v), 1);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight font-heading">Recruiter Analytics</h1>
        <p className="text-muted-foreground font-medium mt-1">Real-time hiring intelligence from your pipeline.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <Card key={kpi.label} className="border-border bg-card">
            <CardContent className="p-5 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-muted ${kpi.color}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-black text-foreground">{kpi.value}</div>
                <div className="text-xs text-muted-foreground">{kpi.label}</div>
                {kpi.sub && <div className="text-[10px] text-muted-foreground/70">{kpi.sub}</div>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hiring Funnel */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Hiring Funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {funnelEntries.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No applications yet.</p>
            ) : (
              funnelEntries.map(([stage, count], i) => (
                <div key={stage} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground w-28 shrink-0">
                    {STAGE_LABELS[stage] || stage}
                  </span>
                  <MiniBar value={count} max={maxFunnel} color={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
                  <span className="text-sm font-bold text-foreground w-8 text-right">{count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Score Averages */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base font-bold">Score Averages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "PlacementAI Readiness", value: data.avgReadinessScore, color: "#6366f1" },
              { label: "ATS Score", value: data.avgAtsScore, color: "#10b981" },
              { label: "Coding Score", value: data.avgCodingScore, color: "#f59e0b" },
              { label: "Interview Score", value: data.avgInterviewScore, color: "#3b82f6" },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-bold text-foreground">{s.value?.toFixed(0) || 0}</span>
                </div>
                <div className="bg-muted rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.value || 0}%`, backgroundColor: s.color }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Colleges */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base font-bold">Top Colleges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {Object.entries(data.topColleges || {}).length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">No data yet.</p>
            ) : (
              Object.entries(data.topColleges || {}).map(([college, count], i) => {
                const maxC = Math.max(...Object.values(data.topColleges || {}), 1);
                return (
                  <div key={college} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-5">{i+1}</span>
                    <span className="text-sm text-foreground flex-1 truncate">{college}</span>
                    <MiniBar value={count} max={maxC} color="#6366f1" />
                    <span className="text-sm font-bold text-foreground w-6 text-right">{count}</span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Top Skills */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base font-bold">Top Skills in Pool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {Object.entries(data.topSkills || {}).length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">No data yet.</p>
            ) : (
              Object.entries(data.topSkills || {}).map(([skill, count], i) => {
                const maxS = Math.max(...Object.values(data.topSkills || {}), 1);
                return (
                  <div key={skill} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-5">{i+1}</span>
                    <span className="text-sm text-foreground flex-1 truncate">{skill}</span>
                    <MiniBar value={count} max={maxS} color="#10b981" />
                    <span className="text-sm font-bold text-foreground w-6 text-right">{count}</span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Job Performance Table */}
      {data.jobPerformance?.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base font-bold">Job Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Job</th>
                    <th className="px-5 py-3 font-semibold text-right">Applicants</th>
                    <th className="px-5 py-3 font-semibold text-right">Shortlisted</th>
                    <th className="px-5 py-3 font-semibold text-right">Interviewed</th>
                    <th className="px-5 py-3 font-semibold text-right">Offers</th>
                    <th className="px-5 py-3 font-semibold text-right">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {data.jobPerformance.map(j => (
                    <tr key={j.jobId} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 font-medium text-foreground">{j.jobTitle}</td>
                      <td className="px-5 py-3 text-right text-muted-foreground">{j.applicants}</td>
                      <td className="px-5 py-3 text-right text-muted-foreground">{j.shortlisted}</td>
                      <td className="px-5 py-3 text-right text-muted-foreground">{j.interviewed}</td>
                      <td className="px-5 py-3 text-right text-muted-foreground">{j.offers}</td>
                      <td className="px-5 py-3 text-right font-bold text-emerald-500">{j.joined}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
