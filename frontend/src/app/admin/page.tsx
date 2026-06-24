"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldAlert, 
  TrendingUp, 
  Database, 
  Server, 
  Lock,
  ChevronRight,
  RefreshCw,
  Loader2
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import api from "@/lib/api";

const iconMap: Record<string, any> = {
  Server,
  TrendingUp,
  Database,
  ShieldAlert
};

export default function PerfectAdminPortal() {
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/analytics");
      setAdminData(response.data);
    } catch (error) {
      console.error("Failed to fetch admin analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const metrics = adminData?.metrics || [];
  const chartData = adminData?.chartData || [];

  return (
    <div className="p-8 space-y-8 font-sans">
      {/* Top Navbar Simulation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight font-heading">Control Center</h1>
          <p className="text-muted-foreground font-medium">System-wide monitoring and administrative oversight.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {[1,2,3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white bg-primary flex items-center justify-center text-[10px] text-white font-bold">+5</div>
          </div>
          <Button variant="outline" className="border-border bg-card shadow-sm font-bold" onClick={fetchAdminData}>
            <RefreshCw className="w-4 h-4 mr-2" /> Live Updates
          </Button>
          <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold px-6">
            Broadcast <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* High Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m: any, i: number) => {
          const Icon = iconMap[m.icon] || Server;
          return (
            <Card key={i} className="border-none shadow-sm group hover:shadow-md transition-all">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${m.bg} ${m.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <Badge className={m.trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-foreground'}>
                    {m.trend}
                  </Badge>
                </div>
                <p className="text-3xl font-black text-foreground">{m.value}</p>
                <p className="text-xs font-bold text-muted-foreground/70 uppercase tracking-[0.2em] mt-1">{m.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Analytics Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <div>
              <CardTitle className="text-xl font-bold font-heading">Growth Analytics</CardTitle>
              <CardDescription>Daily active users and revenue distribution</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-xs font-bold">Week</Button>
              <Button variant="outline" size="sm" className="text-xs font-bold bg-muted border-none">Month</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Area type="monotone" dataKey="users" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* System Health Panel */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm p-6 bg-slate-900 text-white relative overflow-hidden">
             <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-center">
                   <h3 className="text-lg font-bold font-heading">System Status</h3>
                   <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Operational
                   </div>
                </div>
                <div className="space-y-4">
                   {[
                      { name: "Frontend Server", status: "99.9%", load: "24%" },
                      { name: "AI Inference Engine", status: "98.2%", load: "68%" },
                      { name: "Auth Database", status: "100%", load: "12%" },
                   ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-card/5 border border-white/10">
                         <div>
                            <p className="text-xs font-bold">{s.name}</p>
                            <p className="text-[10px] text-white/50">{s.status} uptime</p>
                         </div>
                         <div className="text-right">
                            <p className="text-xs font-black text-primary">{s.load}</p>
                            <p className="text-[10px] text-white/50 uppercase">load</p>
                         </div>
                      </div>
                   ))}
                </div>
                <Button variant="outline" className="w-full border-white/10 bg-card/5 hover:bg-card/10 text-white font-bold h-12">
                   Open Debugger
                </Button>
             </div>
             <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          </Card>

          <Card className="border-none shadow-sm p-6">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">Security Logs</h3>
                <Lock className="w-4 h-4 text-muted-foreground/50" />
             </div>
             <div className="space-y-4">
                {[
                   { event: "New Admin Added", time: "2m ago", type: "INFO" },
                   { event: "Failed Login Attempt", time: "15m ago", type: "WARN" },
                   { event: "Schema Migration", time: "1h ago", type: "INFO" },
                ].map((l, i) => (
                   <div key={i} className="flex gap-4 items-start">
                      <div className={`w-1 h-8 rounded-full ${l.type === 'WARN' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                      <div>
                         <p className="text-xs font-bold text-foreground">{l.event}</p>
                         <p className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">{l.time}</p>
                      </div>
                   </div>
                ))}
             </div>
          </Card>
        </div>
      </div>

      {/* Recruiter Verification Queue */}
      <Card className="border-none shadow-sm bg-card overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/30">
          <div>
            <CardTitle className="text-lg font-bold font-heading">Verification Queue</CardTitle>
            <CardDescription>Recruiters awaiting platform access approval</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="font-bold text-xs uppercase tracking-widest">Reject All</Button>
            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 font-bold text-xs uppercase tracking-widest">Verify All</Button>
          </div>
        </CardHeader>
        <div className="p-0">
          <table className="w-full text-left">
            <thead className="bg-muted/50 text-[10px] uppercase font-black text-muted-foreground/70 tracking-[0.2em]">
              <tr>
                <th className="px-8 py-4">Company Name</th>
                <th className="px-8 py-4">Point of Contact</th>
                <th className="px-8 py-4">Industry</th>
                <th className="px-8 py-4">Docs</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { name: "Google", contact: "Sundar P.", ind: "Big Tech", doc: "Verified" },
                { name: "Zepto", contact: "Aadit P.", ind: "Quick Commerce", doc: "Pending" },
                { name: "Cred", contact: "Kunal S.", ind: "Fintech", doc: "Uploaded" },
              ].map((r, i) => (
                <tr key={i} className="group hover:bg-muted/80 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-black text-muted-foreground/70">{r.name[0]}</div>
                      <p className="text-sm font-black text-foreground">{r.name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-muted-foreground">{r.contact}</td>
                  <td className="px-8 py-6">
                    <Badge variant="outline" className="bg-card font-bold">{r.ind}</Badge>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${r.doc === 'Verified' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {r.doc}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                       <Button size="sm" variant="ghost" className="text-xs font-bold text-muted-foreground/70 hover:text-red-500">Reject</Button>
                       <Button size="sm" className="bg-primary hover:bg-primary/90 font-bold text-xs">Approve</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
