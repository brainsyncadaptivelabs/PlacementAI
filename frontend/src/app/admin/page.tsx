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
  Loader2,
  Users,
  Activity,
  CreditCard,
  Cpu,
  FileText,
  MessageSquare,
  DollarSign,
  Download,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Compass,
  FileSpreadsheet,
  AlertTriangle,
  HardDrive,
  Mail,
  Zap,
  Info
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import api from "@/lib/api";

type TabType =
  | "dashboard"
  | "users"
  | "analytics"
  | "credits"
  | "ai-usage"
  | "resumes"
  | "interviews"
  | "system-health"
  | "audit-logs"
  | "reports"
  | "settings"
  | "future-modules";

export default function SuperAdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");

  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [loadingData, setLoadingData] = useState<boolean>(false);

  // Data states
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [usersData, setUsersData] = useState<any>({ users: [], totalItems: 0, distinctColleges: [], distinctBranches: [] });
  const [creditsData, setCreditsData] = useState<any>(null);
  const [aiUsageData, setAiUsageData] = useState<any>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const [interviewData, setInterviewData] = useState<any>(null);
  const [systemHealthData, setSystemHealthData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // User detail states
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userModalOpen, setUserModalOpen] = useState<boolean>(false);
  const [loadingUserDetail, setLoadingUserDetail] = useState<boolean>(false);
  const [updatingPlan, setUpdatingPlan] = useState<boolean>(false);

  // Filtering states for User Table
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCollege, setSelectedCollege] = useState<string>("ALL");
  const [selectedBranch, setSelectedBranch] = useState<string>("ALL");
  const [selectedPlan, setSelectedPlan] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Check auth session on load
  const checkSession = async () => {
    setAuthLoading(true);
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const res = await api.get("/admin/auth/session");
        setIsAuthenticated(true);
        setAdminEmail(res.data.email);
        fetchTabData("dashboard");
      } catch (err) {
        logOut();
      }
    } else {
      setIsAuthenticated(false);
    }
    setAuthLoading(false);
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await api.post("/admin/auth/login", {
        email: loginEmail,
        password: loginPassword
      });

      const { token, email, csrfToken } = res.data;
      // Store token for both generic and admin endpoints
      localStorage.setItem("token", token);
      localStorage.setItem("admin_token", token);
      localStorage.setItem("admin_csrf", csrfToken);

      setIsAuthenticated(true);
      setAdminEmail(email);
      fetchTabData("dashboard");
    } catch (err: any) {
      setLoginError(err.response?.data?.message || "Invalid credentials, or too many login attempts.");
    } finally {
      setLoginLoading(false);
    }
  };

  const logOut = async () => {
    try {
      await api.post("/admin/auth/logout");
    } catch (_) {}
    localStorage.removeItem("token");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_csrf");
    setIsAuthenticated(false);
    setAdminEmail("");
  };

  // Fetch relevant tab data
  const fetchTabData = async (tab: TabType) => {
    setLoadingData(true);
    try {
      if (tab === "dashboard") {
        const res = await api.get("/admin/dashboard");
        setDashboardData(res.data);
      } else if (tab === "users") {
        fetchUsersList(0);
      } else if (tab === "credits") {
        const res = await api.get("/admin/credits");
        setCreditsData(res.data);
      } else if (tab === "ai-usage") {
        const res = await api.get("/admin/api-usage");
        setAiUsageData(res.data);
      } else if (tab === "resumes") {
        const res = await api.get("/admin/resumes");
        setResumeData(res.data);
      } else if (tab === "interviews") {
        const res = await api.get("/admin/interviews");
        setInterviewData(res.data);
      } else if (tab === "system-health") {
        const res = await api.get("/admin/system-health");
        setSystemHealthData(res.data);
      } else if (tab === "audit-logs") {
        const res = await api.get("/admin/audit-logs");
        setAuditLogs(res.data.content || []);
      }
    } catch (err) {
      console.error("Failed to load tab data", err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchUsersList = async (page: number) => {
    setLoadingData(true);
    try {
      const url = `/admin/users?page=${page}&size=10&search=${searchTerm}&college=${selectedCollege === "ALL" ? "" : selectedCollege}&branch=${selectedBranch === "ALL" ? "" : selectedBranch}&plan=${selectedPlan === "ALL" ? "" : selectedPlan}&status=${selectedStatus === "ALL" ? "" : selectedStatus}`;
      const res = await api.get(url);
      setUsersData(res.data);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to load users list", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleUserClick = async (userId: number) => {
    setLoadingUserDetail(true);
    setUserModalOpen(true);
    try {
      const res = await api.get(`/admin/users/${userId}`);
      setSelectedUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user details", err);
    } finally {
      setLoadingUserDetail(false);
    }
  };

  const handleUpdatePlan = async (userId: number, newPlan: string) => {
    if (!confirm(`Are you sure you want to change this user's plan to ${newPlan}?`)) return;
    setUpdatingPlan(true);
    try {
      const res = await api.put(`/admin/users/${userId}/plan?plan=${newPlan}`);
      // Update selectedUser state
      setSelectedUser((prev: any) => ({
        ...prev,
        plan: newPlan,
        creditsRemaining: res.data.creditsRemaining
      }));
      // Also update user in usersData list
      setUsersData((prev: any) => ({
        ...prev,
        users: prev.users.map((u: any) => u.id === userId ? { ...u, plan: newPlan } : u)
      }));
      alert(`User plan successfully updated to ${newPlan}!`);
    } catch (err) {
      console.error("Failed to update user plan:", err);
      alert("Failed to update user plan. Please try again.");
    } finally {
      setUpdatingPlan(false);
    }
  };

  const downloadReport = (type: string) => {
    const token = localStorage.getItem("token");
    const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"}/admin/reports?type=${type}`;
    
    // Perform download via browser mechanism
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", `${type.toLowerCase()}_report.csv`);
    
    // Inject auth token dynamically by setting cookies or headers in browser, 
    // or trigger open window with authorization if session exists.
    // In standard secure architectures, we fetch it with headers, convert to blob, and trigger download
    fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    .then(res => res.blob())
    .then(blob => {
      const fileUrl = window.URL.createObjectURL(blob);
      a.href = fileUrl;
      a.click();
      window.URL.revokeObjectURL(fileUrl);
    })
    .catch(err => console.error("Report download failed", err));
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    fetchTabData(tab);
  };

  // Auth Loading View
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-800">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">Initializing Admin Environment...</p>
        </div>
      </div>
    );
  }

  // Not authenticated view (Login Form)
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 p-6">
        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-indigo-500/10 text-indigo-450 rounded-2xl border border-indigo-500/20 mb-2">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-white font-heading tracking-tight">Super Control Panel</h1>
            <p className="text-sm text-slate-400 font-medium">Authorized Personnel Only. Verification Required.</p>
          </div>

          {loginError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-red-400">{loginError}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400">Admin Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="founders.brainsynclabs@gmail.com"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-white placeholder-slate-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400">Security Key</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-white placeholder-slate-600"
              />
            </div>

            <Button
              type="submit"
              disabled={loginLoading}
              className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all rounded-xl border-none"
            >
              {loginLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
              Verify Credentials
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Helper for rendering tabs content
  const renderTabContent = () => {
    if (loadingData) {
      return (
        <div className="flex flex-col gap-6 py-6 animate-pulse">
          <div className="h-40 bg-slate-900 rounded-2xl w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-60 bg-slate-900 rounded-2xl" />
            <div className="h-60 bg-slate-900 rounded-2xl" />
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        if (!dashboardData) return null;
        return (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

      case "users":
        return (
          <div className="space-y-6">
            {/* Filter controls */}
            <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Search</label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Name, email, college..."
                      className="w-full bg-white border border-slate-250 text-slate-900 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-500 tracking-wider">College</label>
                  <select
                    value={selectedCollege}
                    onChange={(e) => setSelectedCollege(e.target.value)}
                    className="w-full bg-white border border-slate-250 text-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                  >
                    <option value="ALL">All Colleges</option>
                    {usersData.distinctColleges?.map((c: string) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Branch</label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full bg-white border border-slate-250 text-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                  >
                    <option value="ALL">All Branches</option>
                    {usersData.distinctBranches?.map((b: string) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Plan</label>
                  <select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="w-full bg-white border border-slate-250 text-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                  >
                    <option value="ALL">All Plans</option>
                    <option value="FREE">Free</option>
                    <option value="BASIC">Basic</option>
                    <option value="PREMIUM">Premium</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => fetchUsersList(0)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11 rounded-xl text-xs">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </Card>

            {/* Table */}
            <Card className="overflow-hidden bg-white border border-slate-200 shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">College</th>
                    <th className="px-6 py-4">Plan</th>
                    <th className="px-6 py-4">Resumes</th>
                    <th className="px-6 py-4">Interviews</th>
                    <th className="px-6 py-4">ATS Avg</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {usersData.users?.map((user: any) => (
                    <tr key={user.id} className="hover:bg-slate-950/20 text-slate-800">
                      <td className="px-6 py-4 font-semibold">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{user.fullName}</p>
                          <p className="text-xs text-slate-500 font-semibold">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold">{user.collegeName}</td>
                      <td className="px-6 py-4">
                        <Badge className={
                          user.plan === "PREMIUM" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                          user.plan === "BASIC" ? "bg-indigo-50 text-indigo-700 border border-indigo-150" :
                          "bg-slate-500/10 text-slate-500 border-slate-500/20"
                        }>
                          {user.plan}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold">{user.totalResumes}</td>
                      <td className="px-6 py-4 text-xs font-bold">{user.totalInterviews}</td>
                      <td className="px-6 py-4 text-xs font-bold text-emerald-700">{user.avgAtsScore}%</td>
                      <td className="px-6 py-4 text-right">
                        <Button onClick={() => handleUserClick(user.id)} size="sm" variant="outline" className="border-slate-250 text-slate-700 font-bold hover:bg-slate-50 text-xs">
                          <Eye className="w-3.5 h-3.5 mr-1" /> View Profile
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination footer */}
              <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-bold">
                <p>Showing page {currentPage + 1} of {usersData.totalPages || 1}</p>
                <div className="flex gap-2">
                  <Button disabled={currentPage === 0} onClick={() => fetchUsersList(currentPage - 1)} variant="outline" className="border-slate-250 text-slate-700 hover:bg-slate-50 h-9 px-4 text-xs">
                    Previous
                  </Button>
                  <Button disabled={currentPage + 1 >= usersData.totalPages} onClick={() => fetchUsersList(currentPage + 1)} variant="outline" className="border-slate-250 text-slate-700 hover:bg-slate-50 h-9 px-4 text-xs">
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        );

      case "credits":
        if (!creditsData) return null;
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-800">Daily Credit Consumption</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={creditsData.weeklyTrend}>
                      <defs>
                        <linearGradient id="colorCreditUsage" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="day" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", color: "#0f172a" }} />
                      <Area type="monotone" dataKey="used" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorCreditUsage)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top consumers */}
              <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-slate-850 font-extrabold">Top Credit Consumers</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-left">
                    <thead className="bg-slate-950/20 text-[10px] uppercase font-black text-slate-500">
                      <tr>
                        <th className="px-4 py-3">User</th>
                        <th className="px-4 py-3">Credits Burned</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {creditsData.topConsumers?.map((tc: any, i: number) => (
                        <tr key={i} className="text-slate-800 text-sm">
                          <td className="px-4 py-3 font-semibold">{tc.fullName} ({tc.email})</td>
                          <td className="px-4 py-3 font-bold text-pink-500">{tc.creditsUsed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-slate-850 font-extrabold">Credit Pool Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm font-bold text-slate-800">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <p>Total Remaining Pool</p>
                    <p className="text-emerald-700">{creditsData.totalRemaining}</p>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <p>Total Credits Used</p>
                    <p className="text-pink-500">{creditsData.totalUsed}</p>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <p>Daily Burn Rate</p>
                    <p className="text-blue-500">{creditsData.burnRatePerDay} credits/day</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Average / User</p>
                    <p className="text-purple-400">{creditsData.averageCreditsPerUser}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "ai-usage":
        if (!aiUsageData) return null;
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-slate-850 font-extrabold">Feature Split</CardTitle>
                </CardHeader>
                <CardContent className="h-[250px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.keys(aiUsageData.features).map(k => ({ name: k, value: aiUsageData.features[k] }))}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {Object.keys(aiUsageData.features).map((entry, idx) => (
                          <Cell key={idx} fill={["#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#f59e0b"][idx % 5]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-slate-850 font-extrabold">General Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 font-bold text-slate-800">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <p>Total API Calls</p>
                    <p className="text-slate-800">{aiUsageData.totalCalls}</p>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <p>Successful Pings</p>
                    <p className="text-emerald-700">{aiUsageData.successfulCalls}</p>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <p>Failed Pings</p>
                    <p className="text-red-500">{aiUsageData.failedCalls}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Average Latency</p>
                    <p className="text-yellow-500">{aiUsageData.avgLatencyMs} ms</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "resumes":
        if (!resumeData) return null;
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-slate-850 font-extrabold">Score Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: "Below 50", count: resumeData.scoreDistribution.below50 },
                      { name: "50 - 70", count: resumeData.scoreDistribution["50to70"] },
                      { name: "70 - 85", count: resumeData.scoreDistribution["70to85"] },
                      { name: "Above 85", count: resumeData.scoreDistribution.above85 }
                    ]}>
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-slate-850 font-extrabold">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 font-bold text-slate-800">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <p>Total Uploaded</p>
                    <p className="text-slate-800">{resumeData.totalUploaded}</p>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <p>Average Score</p>
                    <p className="text-purple-400">{resumeData.averageScore}%</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Highest Score</p>
                    <p className="text-emerald-700">{resumeData.highestScore}%</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "interviews":
        if (!interviewData) return null;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-slate-850 font-extrabold">Interviews Split</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 font-bold text-slate-800">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <p>Total Interviews</p>
                  <p className="text-slate-800">{interviewData.totalInterviews}</p>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <p>Completed Interviews</p>
                  <p className="text-emerald-700">{interviewData.completedInterviews}</p>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <p>Average Feedback Score</p>
                  <p className="text-purple-400">{interviewData.averageScore}%</p>
                </div>
                <div className="flex justify-between">
                  <p>Pass Rate</p>
                  <p className="text-blue-500">{interviewData.passRate}%</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-slate-850 font-extrabold">Top Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(interviewData.topics).map(k => (
                    <Badge key={k} className="bg-slate-800 text-slate-800 border-slate-700 py-1.5 px-3">
                      {k}: {interviewData.topics[k]}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "system-health":
        if (!systemHealthData) return null;
        return (
          <div className="space-y-8">
            {/* Status grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">CPU Load</h3>
                    <p className="text-xs text-slate-500">Total system utilization</p>
                  </div>
                  <Cpu className="w-5 h-5 text-blue-500" />
                </div>
                <div className="mt-6 flex items-baseline gap-2">
                  <p className="text-4xl font-black text-slate-900">{systemHealthData.cpuUsage}%</p>
                  <p className="text-xs font-bold text-slate-500">load</p>
                </div>
              </Card>

              <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">RAM Usage</h3>
                    <p className="text-xs text-slate-500">Allocated memory</p>
                  </div>
                  <Server className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="mt-6 flex items-baseline gap-2">
                  <p className="text-4xl font-black text-slate-900">{systemHealthData.ramUsage}%</p>
                  <p className="text-xs font-bold text-slate-500">used</p>
                </div>
              </Card>

              <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Disk Space</h3>
                    <p className="text-xs text-slate-500">File storage capacity</p>
                  </div>
                  <HardDrive className="w-5 h-5 text-purple-500" />
                </div>
                <div className="mt-6 flex items-baseline gap-2">
                  <p className="text-4xl font-black text-slate-900">{systemHealthData.diskUsage}%</p>
                  <p className="text-xs font-bold text-slate-500">full</p>
                </div>
              </Card>
            </div>

            {/* Pings */}
            <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-slate-850 font-extrabold">Services Infrastructure</CardTitle>
                <CardDescription className="text-slate-500">Health checks of core cloud subsystems</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { name: "Database Service", status: systemHealthData.databaseStatus, icon: Database },
                  { name: "Redis Cache Store", status: systemHealthData.redisStatus, icon: Zap },
                  { name: "Cloud Object Storage", status: systemHealthData.storageStatus, icon: HardDrive },
                  { name: "SMTP Email Service", status: systemHealthData.emailServiceStatus, icon: Mail },
                ].map((s, idx) => {
                  const Icon = s.icon;
                  const isUp = s.status === "OPERATIONAL";
                  return (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between items-center text-center gap-4">
                      <div className={`p-3 rounded-xl ${isUp ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800">{s.name}</p>
                        <span className={`text-[9px] font-black uppercase tracking-wider ${isUp ? "text-emerald-700" : "text-red-400"}`}>
                          {s.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        );

      case "audit-logs":
        return (
          <Card className="overflow-hidden bg-white border border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-850 font-extrabold">Security Audits</CardTitle>
              <CardDescription className="text-slate-500">Chronological history of admin actions</CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">IP Address</th>
                    <th className="px-6 py-4">Admin Email</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">OS/Browser</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {auditLogs.map((log: any) => (
                    <tr key={log.id} className="text-xs font-semibold text-slate-800">
                      <td className="px-6 py-4 text-slate-500">{log.timestamp}</td>
                      <td className="px-6 py-4">{log.ipAddress}</td>
                      <td className="px-6 py-4">{log.adminEmail || "SYSTEM"}</td>
                      <td className="px-6 py-4">
                        <Badge className="bg-slate-800 border-slate-700 text-slate-800 font-bold">{log.action}</Badge>
                      </td>
                      <td className="px-6 py-4 text-[10px] text-slate-500">{log.os} / {log.browser}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={log.status === "SUCCESS" ? "text-emerald-700 font-bold" : "text-red-400 font-bold"}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );

      case "reports":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col justify-between gap-6">
              <div>
                <FileSpreadsheet className="w-8 h-8 text-blue-500 mb-4" />
                <h3 className="text-lg font-bold text-slate-800">Registered Users CSV</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">Export full directory of user details, colleges, planning status, and registration dates.</p>
              </div>
              <Button onClick={() => downloadReport("USERS")} className="bg-blue-600 hover:bg-blue-500 font-bold w-full rounded-xl">
                <Download className="w-4 h-4 mr-2" /> Download CSV
              </Button>
            </Card>

            <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col justify-between gap-6">
              <div>
                <FileSpreadsheet className="w-8 h-8 text-emerald-500 mb-4" />
                <h3 className="text-lg font-bold text-slate-800">API Usage & Cost CSV</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">Export comprehensive API logs containing token tracking, feature latency, and cost calculations.</p>
              </div>
              <Button onClick={() => downloadReport("AI_USAGE")} className="bg-emerald-600 hover:bg-emerald-500 font-bold w-full rounded-xl">
                <Download className="w-4 h-4 mr-2" /> Download CSV
              </Button>
            </Card>
          </div>
        );

      case "future-modules":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Revenue Forecasts", desc: "ML analytics to forecast platform subscriber growth.", status: "PLANNED" },
              { title: "Coupons & Discounts", desc: "Create, distribute, and track usage of active promocodes.", status: "IN DEVELOPMENT" },
              { title: "Support Ticket Desk", desc: "Direct customer interaction portal for resolving queries.", status: "IN DEVELOPMENT" },
              { title: "AI Cost Optimizer", desc: "Heuristic caching algorithms to optimize local / cloud model cost balances.", status: "PLANNED" },
            ].map((mod, idx) => (
              <Card key={idx} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col justify-between gap-4">
                <div>
                  <Badge className="bg-slate-100 text-slate-600 border-slate-200 font-bold text-[9px] mb-2">{mod.status}</Badge>
                  <h3 className="text-base font-bold text-slate-800">{mod.title}</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">{mod.desc}</p>
                </div>
                <Button disabled className="w-full border-slate-200 bg-slate-50 text-slate-400 font-bold text-xs rounded-xl">
                  Unlock Module
                </Button>
              </Card>
            ))}
          </div>
        );

      default:
        return (
          <div className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center justify-center text-slate-500 font-bold text-sm">
            Module under active development.
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-6 mb-6">
            <div className="p-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white tracking-widest uppercase">SUPER PORTAL</p>
              <p className="text-[10px] text-slate-400 font-bold tracking-tight truncate max-w-[130px]">{adminEmail}</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {[
              { id: "dashboard", label: "Dashboard", icon: Server },
              { id: "users", label: "Users", icon: Users },
              { id: "credits", label: "Credits", icon: CreditCard },
              { id: "ai-usage", label: "AI Usage", icon: Cpu },
              { id: "resumes", label: "Resumes", icon: FileText },
              { id: "interviews", label: "Interviews", icon: MessageSquare },
              { id: "system-health", label: "System Health", icon: Activity },
              { id: "audit-logs", label: "Audit Logs", icon: Clock },
              { id: "reports", label: "Reports", icon: FileSpreadsheet },
              { id: "future-modules", label: "Future Modules", icon: Compass }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id as TabType)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          <Button onClick={logOut} variant="outline" className="w-full border-slate-700 bg-slate-900/40 text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 font-bold h-11 text-xs rounded-xl">
            Exit Control Room
          </Button>
        </div>
      </aside>

      {/* Main page content area */}
      <main className="flex-1 p-8 space-y-8 overflow-y-auto max-h-screen">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 font-heading tracking-tight capitalize">
              {activeTab.replace("-", " ")}
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-1">Super Administrative operations environment.</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-slate-900 border-slate-800 text-slate-500 font-bold text-[9px] py-1 px-2.5">
              SECURE SESSION EXPIRES IN 24H
            </Badge>
            <Button size="sm" variant="outline" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs" onClick={() => fetchTabData(activeTab)}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reload Page
            </Button>
          </div>
        </header>

        {renderTabContent()}
      </main>

      {/* User details Modal popup */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
          <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <header className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Full User Profile View</h2>
                <p className="text-xs text-slate-500">Comprehensive placement preparation tracker</p>
              </div>
              <Button onClick={() => setUserModalOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-250 font-bold px-4 h-10 rounded-xl text-xs">
                Close Profile
              </Button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingUserDetail ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-xs text-slate-500 font-bold">Downloading user records...</p>
                </div>
              ) : selectedUser ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Left Column Profile info */}
                  <div className="md:col-span-1 space-y-6">
                    <Card className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center text-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center font-black text-2xl text-slate-600 uppercase">
                        {selectedUser.fullName[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{selectedUser.fullName}</h3>
                        <p className="text-xs text-slate-500 font-semibold">{selectedUser.email}</p>
                      </div>
                      <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-150 py-1 px-2.5 font-bold">
                        {selectedUser.plan} Member
                      </Badge>
                      <div className="w-full pt-2 flex flex-col gap-2">
                        {selectedUser.plan !== "PREMIUM" ? (
                          <Button 
                            onClick={() => handleUpdatePlan(selectedUser.id, "PREMIUM")}
                            className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold h-10 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-amber-500/10"
                            disabled={updatingPlan}
                          >
                            {updatingPlan ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>⭐ Make Premium User</>
                            )}
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleUpdatePlan(selectedUser.id, "FREE")}
                            variant="outline"
                            className="w-full border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold h-10 rounded-xl text-xs flex items-center justify-center gap-1.5"
                            disabled={updatingPlan}
                          >
                            {updatingPlan ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>❌ Revoke Premium</>
                            )}
                          </Button>
                        )}
                      </div>
                    </Card>

                    <Card className="p-6 space-y-3 text-xs font-bold bg-slate-50 border border-slate-200 rounded-2xl">
                      <div className="flex justify-between">
                        <p>College Name</p>
                        <p className="text-slate-900 font-extrabold text-right max-w-[120px] truncate">{selectedUser.collegeName}</p>
                      </div>
                      <div className="flex justify-between">
                        <p>Branch / Department</p>
                        <p className="text-slate-900 font-extrabold">{selectedUser.branch}</p>
                      </div>
                      <div className="flex justify-between">
                        <p>Graduation Year</p>
                        <p className="text-slate-900 font-extrabold">{selectedUser.graduationYear}</p>
                      </div>
                      <div className="flex justify-between">
                        <p>Phone Number</p>
                        <p className="text-slate-900 font-extrabold">{selectedUser.phone || "N/A"}</p>
                      </div>
                    </Card>
                  </div>

                  {/* Middle Column Logs & Uploaded Resumes */}
                  <div className="md:col-span-2 space-y-6">
                    {/* Scores and History */}
                    <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl">
                      <h4 className="font-bold text-slate-800 mb-4">ATS Resumes Analysis</h4>
                      <table className="w-full text-left">
                        <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-2">Filename</th>
                            <th className="px-4 py-2">Role</th>
                            <th className="px-4 py-2 text-right">ATS Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-xs">
                          {selectedUser.resumes?.map((res: any) => (
                            <tr key={res.id} className="text-slate-900 font-medium">
                              <td className="px-4 py-2 truncate max-w-[180px]">{res.fileName}</td>
                              <td className="px-4 py-2">{res.analyzedRole || "N/A"}</td>
                              <td className="px-4 py-2 text-right font-black text-emerald-700">{res.atsScore}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Card>

                    {/* Timeline logs */}
                    <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl">
                      <h4 className="font-bold text-slate-800 mb-4">Preparation Timeline</h4>
                      <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2">
                        {selectedUser.timeline?.map((evt: any, i: number) => (
                          <div key={i} className="flex gap-4 items-start text-xs">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-slate-900 font-bold">{evt.event}</p>
                              <p className="text-[10px] text-slate-500 uppercase font-medium">{evt.timestamp}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
