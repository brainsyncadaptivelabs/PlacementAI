"use client";

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
import { TrendingUp, TrendingDown, Clock, CheckCircle2, Mic2, Star } from "lucide-react";

const data = [
  { day: "1 May", score: 65 },
  { day: "4 May", score: 68 },
  { day: "8 May", score: 72 },
  { day: "12 May", score: 70 },
  { day: "15 May", score: 78 },
  { day: "19 May", score: 74 },
  { day: "22 May", score: 82 },
  { day: "25 May", score: 79 },
  { day: "29 May", score: 85 },
];

const stats = [
  { label: "Interviews", value: "12", growth: "+20%", positive: true, icon: Mic2, color: "bg-blue-500" },
  { label: "Average Score", value: "74%", growth: "+15%", positive: true, icon: Star, color: "bg-primary" },
  { label: "Study Hours", value: "28", growth: "+10%", positive: true, icon: Clock, color: "bg-purple-500" },
  { label: "Tasks Completed", value: "45", growth: "+25%", positive: true, icon: CheckCircle2, color: "bg-green-500" },
];

export default function AnalyticsPage() {
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
         {stats.map((stat, i) => (
            <Card key={i} className="border-none shadow-sm overflow-hidden bg-white">
               <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                     <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                        <stat.icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
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
         ))}
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
         <CardHeader className="p-6 border-b border-slate-50">
            <CardTitle className="text-lg font-bold font-heading">Progress Over Time</CardTitle>
         </CardHeader>
         <CardContent className="p-6">
            <div className="h-[400px] w-full mt-4">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
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
                        tick={{fontSize: 12, fill: '#94a3b8'}}
                        dy={10}
                     />
                     <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 12, fill: '#94a3b8'}}
                        domain={[0, 100]}
                        dx={-10}
                     />
                     <Tooltip 
                        contentStyle={{
                           borderRadius: '12px',
                           border: 'none',
                           boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                           padding: '12px'
                        }}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="var(--primary)" 
                        strokeWidth={3} 
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
