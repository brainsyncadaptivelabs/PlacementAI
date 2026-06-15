"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { TrendingUp, TrendingDown, Clock, CheckCircle2, Mic2, Star, Loader2 } from "lucide-react";
import api from "@/lib/api";

const iconMap: Record<string, any> = {
  Mic2,
  Star,
  Clock,
  CheckCircle2
};

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get("/analytics");
        setAnalyticsData(response.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const stats = analyticsData?.stats || [];
  const chartData = analyticsData?.chartData || [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading text-slate-900">Your Progress Overview</h1>
        <select className="bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm font-medium focus:ring-primary">
            <option>This Month</option>
            <option>Last Month</option>
            <option>Year to Date</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat: any, i: number) => {
             const Icon = iconMap[stat.icon] || Star;
             return (
                <Card key={i} className="border-none shadow-sm overflow-hidden bg-white">
                   <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                         <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                            <Icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
                         </div>
                         <span className={`text-xs font-bold flex items-center gap-1 ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {stat.growth}
                         </span>
                      </div>
                      <div className="space-y-1">
                         <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                         <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                      </div>
                   </CardContent>
                </Card>
             );
          })}
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
         <CardHeader className="p-6 border-b border-slate-50">
            <CardTitle className="text-lg font-bold font-heading">Progress Over Time</CardTitle>
         </CardHeader>
         <CardContent className="p-6">
            <div className="h-[400px] w-full mt-4">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                     <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                        dy={10}
                     />
                     <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                        dx={-10}
                        domain={[0, 100]}
                     />
                     <Tooltip 
                        contentStyle={{ 
                           borderRadius: '16px', 
                           border: 'none', 
                           boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                        }} 
                     />
                     <Area
                        type="monotone"
                        dataKey="score"
                        stroke="var(--primary)"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorScore)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--primary)' }}
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-8 pt-6">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Score</span>
               </div>
            </div>
         </CardContent>
      </Card>
    </div>
  );
}
