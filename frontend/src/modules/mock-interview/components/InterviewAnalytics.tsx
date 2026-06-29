"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { interviewService } from "../services/interviewService";
import { MockInterview } from "../types/interview.types";

export const InterviewAnalytics = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await interviewService.getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="text-center py-10 text-muted-foreground">Compiling placement analytics...</div>;
  if (!analytics) return <div className="text-center py-10">No analytics data found. Complete an interview first!</div>;

  const chartData = (analytics.scoreTrend || []).map((item: any, idx: number) => ({
    name: item.date ? new Date(item.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : `Session ${idx + 1}`,
    score: item.score,
    role: item.role,
  }));

  return (
    <div className="space-y-6">
      
      {/* Top Aggregated Skill Averages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Overall Score", value: analytics.averageScore, color: "text-primary" },
          { label: "Technical Accuracy", value: analytics.averageTechnical, color: "text-emerald-600" },
          { label: "Communication Flow", value: analytics.averageCommunication, color: "text-blue-600" },
          { label: "Confidence Rating", value: analytics.averageConfidence, color: "text-indigo-600" }
        ].map((item, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardHeader className="py-3.5 px-4 pb-1">
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">{item.label}</span>
            </CardHeader>
            <CardContent className="px-4 pb-3.5">
              <span className={cn("text-3xl font-black", item.color)}>{item.value || 0}%</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Performance Trend Chart */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold">Mock Interview Performance Progression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground italic text-sm">
                Complete multiple interviews to map your trend progression.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total stats card */}
        <Card className="border-none shadow-sm md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Placement Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-xs text-muted-foreground uppercase">Interviews Completed</span>
              <span className="text-xl font-bold">{analytics.totalInterviews || 0}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-xs text-muted-foreground uppercase">Average Score Rating</span>
              <span className="text-xl font-bold text-primary">{analytics.averageScore || 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground uppercase">Hiring Qualification</span>
              <span className="text-xs font-black text-green-600">
                {(analytics.averageScore || 0) >= 75 ? "VERY HIGH" : "PRACTICE REQUIRED"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Weak Topics Analysis */}
        <Card className="border-none shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Identified Areas of Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            {(!analytics.weakTopics || analytics.weakTopics.length === 0) ? (
              <div className="text-muted-foreground text-xs italic">
                No major improvement topics identified. Great job!
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {analytics.weakTopics.map((topic: string, i: number) => (
                  <Badge key={i} variant="secondary" className="px-3.5 py-1.5 font-semibold text-xs border bg-slate-100 hover:bg-slate-100 text-slate-700">
                    ⚠️ {topic}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
};
