"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  RefreshCw,
  Users,
  Activity,
  FileText,
  MessageSquare,
  CreditCard,
  TrendingUp,
  DollarSign,
  AlertOctagon
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export interface AdminAnalyticsTabProps {
  dashboardData: any;
  telemetryLogs?: {
    generationLatency: number;
    validationLatency: number;
    catSelectionLatency: number;
    irtComputationTime: number;
    submissionLatency: number;
    dbLatency: number;
    cacheHitRatio: number;
  };
  fetchTabData?: (tab: any) => Promise<void>;
  mode?: "dashboard" | "analytics";
}

export default function AdminAnalyticsTab({
  dashboardData,
  telemetryLogs = {
    generationLatency: 82,
    validationLatency: 12,
    catSelectionLatency: 6,
    irtComputationTime: 2,
    submissionLatency: 115,
    dbLatency: 4,
    cacheHitRatio: 94
  },
  fetchTabData,
  mode = "analytics"
}: AdminAnalyticsTabProps) {
  // If rendering in dashboard overview mode
  if (mode === "dashboard") {
    if (!dashboardData) {
      return (
        <Card className="p-12 bg-white border border-slate-200 shadow-sm rounded-2xl text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">Dashboard Data Unavailable</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Unable to load live dashboard statistics. Please verify your administrative credentials or check network connection.
          </p>
          {fetchTabData && (
            <Button onClick={() => fetchTabData("dashboard")} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl px-5 h-10">
              <RefreshCw className="w-3.5 h-3.5 mr-2" /> Retry Loading
            </Button>
          )}
        </Card>
      );
    }
    return (
      <div className="fluid-gap flex flex-col">
        {/* KPI Cards Grid */}
        <div className="fluid-grid">
          {[
            { label: "Total Users", value: dashboardData.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Online Users", value: dashboardData.onlineUsers, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Total Resumes", value: dashboardData.totalResumesUploaded, icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10" },
            { label: "Mock Interviews", value: dashboardData.totalMockInterviews, icon: MessageSquare, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "Total Credits Used", value: dashboardData.totalCreditsUsed, icon: CreditCard, color: "text-rose-500", bg: "bg-rose-500/10" },
            { label: "Average ATS Score", value: `${dashboardData.averageAtsScore}%`, icon: TrendingUp, color: "text-indigo-500", bg: "bg-indigo-500/10" },
            { label: "API Spend Today", value: `$${dashboardData.costToday}`, icon: DollarSign, color: "text-teal-500", bg: "bg-teal-500/10" },
            { label: "Platform Revenue", value: dashboardData.revenuePlaceholder, icon: DollarSign, color: "text-yellow-500", bg: "bg-yellow-500/10" },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <Card key={idx} className="bg-white border border-slate-200 shadow-sm rounded-2xl">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">{card.label}</p>
                    <p className="text-3xl font-black text-slate-900">{card.value}</p>
                  </div>
                  <div className={`p-4 rounded-2xl ${card.color} ${card.bg}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Visual Charts */}
        <div className="fluid-grid">
          <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-800">Weekly User Growth</CardTitle>
              <CardDescription className="text-slate-500">Total registered user statistics</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dashboardData.weeklyUserGrowth || []}
                >
                  <defs>
                    <linearGradient id="colorUserGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", color: "#0f172a" }} />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUserGrowth)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-800">API Spending Trend</CardTitle>
              <CardDescription className="text-slate-500">Aggregated commercial cost mapping</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData.weeklyApiSpend || []}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", color: "#0f172a" }} />
                  <Bar dataKey="cost" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // System Analytics Tab Mode
  const registered = dashboardData?.funnelRegistered || 0;
  const aptitudeCleared = dashboardData?.funnelAptitudeCleared || 0;
  const shortlisted = dashboardData?.funnelShortlisted || 0;
  const placed = dashboardData?.funnelPlaced || 0;

  const funnelSteps = [
    { step: "1. Registered Candidates", val: 100, count: registered },
    { step: "2. Aptitude Cleared", val: registered > 0 ? Math.round((aptitudeCleared / registered) * 100) : 0, count: aptitudeCleared },
    { step: "3. Shortlisted for Interviews", val: registered > 0 ? Math.round((shortlisted / registered) * 100) : 0, count: shortlisted },
    { step: "4. Placed successfully", val: registered > 0 ? Math.round((placed / registered) * 100) : 0, count: placed }
  ];

  return (
    <div className="space-y-6">
      {/* SRE latency telemetry operations */}
      <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              SRE Operations Telemetry & LATENCY Metrics
            </h3>
            <p className="text-xs text-slate-500">Live monitoring of infrastructure response thresholds (SLA &gt; 99.9%)</p>
          </div>
          <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200 py-1 font-bold">
            SLA Health: 100.0%
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold text-slate-800">
          <div className="p-3 bg-slate-50 border rounded-2xl">
            <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Assessment Gen Latency</span>
            <span>{telemetryLogs.generationLatency} ms (Limit: 100ms)</span>
          </div>
          <div className="p-3 bg-slate-50 border rounded-2xl">
            <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Validation Latency</span>
            <span>{telemetryLogs.validationLatency} ms (Limit: 50ms)</span>
          </div>
          <div className="p-3 bg-slate-50 border rounded-2xl">
            <span className="text-slate-500 block text-[9px] uppercase tracking-wider">CAT Selection Latency</span>
            <span>{telemetryLogs.catSelectionLatency} ms (Limit: 50ms)</span>
          </div>
          <div className="p-3 bg-slate-50 border rounded-2xl">
            <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Redis Cache Hit Rate</span>
            <span className="text-emerald-700">{telemetryLogs.cacheHitRatio}%</span>
          </div>
        </div>
      </Card>

      {/* AI Governance Quarantine console */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* QA Quarantine */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 md:col-span-2 space-y-4">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <AlertOctagon className="w-4.5 h-4.5 text-rose-600" />
            Self-Healing QA Quarantine & Drift logs
          </h3>
          <div className="text-xs text-muted-foreground text-center py-8">
            No Data Available
          </div>
        </Card>

        {/* Template health summary */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
            Template Health distribution
          </h3>
          <div className="text-xs text-muted-foreground text-center py-8">
            No Data Available
          </div>
        </Card>
      </div>

      {/* Business Intelligence comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
        {/* Department placement readyness CSE vs ECE */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
            Department Placement Readiness Index
          </h3>
          
          <div className="space-y-4 text-xs font-semibold text-slate-600">
            {dashboardData?.branchReadiness?.map((item: any) => (
              <div key={item.branch} className="space-y-1">
                <div className="flex justify-between">
                  <span>{item.branch}</span>
                  <span className="font-bold text-slate-900">{item.readiness}% readiness</span>
                </div>
                <Progress value={item.readiness} className="h-1 bg-slate-100" />
              </div>
            ))}
            {(!dashboardData?.branchReadiness || dashboardData.branchReadiness.length === 0) && (
              <p className="text-xs text-muted-foreground text-center py-4">No Data Available</p>
            )}
          </div>
        </Card>

        {/* Recruiter hiring funnel */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
            Recruiter Candidate Funnel splits
          </h3>

          <div className="space-y-4 text-xs font-semibold text-slate-600">
            {funnelSteps.map(item => (
              <div key={item.step} className="space-y-1">
                <div className="flex justify-between">
                  <span>{item.step}</span>
                  <span className="font-bold text-slate-900">{item.count} ({item.val}%)</span>
                </div>
                <Progress value={item.val} className="h-1 bg-slate-100" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
