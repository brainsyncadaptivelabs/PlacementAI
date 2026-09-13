"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Info,
  Trash2,
  Settings,
  Sliders,
  Layers,
  AlertOctagon,
  Megaphone,
  Tag
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
import api, { getPlatformAiUsageSummary, getUserAiUsageConsumption, getUserAiUsageDetail, exportAiUsageCsv } from "@/lib/api";
import AdminAnalyticsTab from "./AdminAnalyticsTab";
import AdminUsersTab from "./AdminUsersTab";
import AdminFeatureFlagsTab from "./AdminFeatureFlagsTab";
import AdminAiUsageTab from "./AdminAiUsageTab";
import AdminAnnouncementsTab from "./AdminAnnouncementsTab";

type TabType =
  | "dashboard"
  | "users"
  | "analytics"
  | "announcements"
  | "feature-flags"
  | "payments"
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
  const [aiPeriod, setAiPeriod] = useState<"day" | "week" | "month">("month");
  const [aiSortBy, setAiSortBy] = useState<"cost" | "tokens">("cost");
  const [aiUserPage, setAiUserPage] = useState<number>(0);
  const [platformSummary, setPlatformSummary] = useState<any>(null);
  const [userConsumptionPage, setUserConsumptionPage] = useState<any>(null);
  const [selectedAiUser, setSelectedAiUser] = useState<any>(null);
  const [aiUserDrawerOpen, setAiUserDrawerOpen] = useState<boolean>(false);
  const [loadingAiUserData, setLoadingAiUserData] = useState<boolean>(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [interviewData, setInterviewData] = useState<any>(null);
  const [systemHealthData, setSystemHealthData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [featureFlags, setFeatureFlags] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [refundTxId, setRefundTxId] = useState<string>("");
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [refundReason, setRefundReason] = useState<string>("");

  // Form states for Announcements, Feature Flags & Coupons
  const [newAnnTitle, setNewAnnTitle] = useState<string>("");
  const [newAnnMessage, setNewAnnMessage] = useState<string>("");
  const [newAnnTarget, setNewAnnTarget] = useState<string>("ALL");
  const [showNewAnnForm, setShowNewAnnForm] = useState<boolean>(false);
  const [maintEnabled, setMaintEnabled] = useState<boolean>(false);
  const [maintMessage, setMaintMessage] = useState<string>("");

  const [newFlagKey, setNewFlagKey] = useState<string>("");
  const [newFlagDesc, setNewFlagDesc] = useState<string>("");
  const [newFlagEnabled, setNewFlagEnabled] = useState<boolean>(true);
  const [newFlagRollout, setNewFlagRollout] = useState<number>(100);
  const [newFlagColleges, setNewFlagColleges] = useState<string>("ALL");
  const [showNewFlagForm, setShowNewFlagForm] = useState<boolean>(false);

  const [newCouponCode, setNewCouponCode] = useState<string>("");
  const [newCouponType, setNewCouponType] = useState<string>("PERCENTAGE");
  const [newCouponValue, setNewCouponValue] = useState<number>(20);
  const [newCouponLimit, setNewCouponLimit] = useState<number>(100);
  const [showNewCouponForm, setShowNewCouponForm] = useState<boolean>(false);

  // Global action error and success toast notification states
  const [actionError, setActionError] = useState<string>("");
  const [actionSuccess, setActionSuccess] = useState<string>("");
  
  const [telemetryLogs, setTelemetryLogs] = useState({
    generationLatency: 82,
    validationLatency: 12,
    catSelectionLatency: 6,
    irtComputationTime: 2,
    submissionLatency: 115,
    dbLatency: 4,
    cacheHitRatio: 94
  });

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
    const token = localStorage.getItem("admin_token");

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
      localStorage.setItem("admin_token", token);
      if (csrfToken) {
        localStorage.setItem("admin_csrf", csrfToken);
      }
      document.cookie = "placementai_role=SUPER_ADMIN; path=/; max-age=2592000; SameSite=Lax";

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
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_csrf");
    document.cookie = "placementai_role=; path=/; max-age=0";
    setIsAuthenticated(false);
    setAdminEmail("");
  };

  // Fetch relevant tab data
  const fetchTabData = async (tab: TabType) => {
    setLoadingData(true);
    setActionError("");
    try {
      if (tab === "dashboard") {
        const res = await api.get("/admin/dashboard");
        setDashboardData(res.data);
      } else if (tab === "users") {
        fetchUsersList(0);
      } else if (tab === "announcements") {
        const res = await api.get("/admin/announcements");
        setAnnouncements(res.data?.content || res.data || []);
      } else if (tab === "feature-flags") {
        const res = await api.get("/admin/feature-flags");
        setFeatureFlags(res.data || []);
      } else if (tab === "payments") {
        const res = await api.get("/admin/coupons");
        setCoupons(res.data || []);
      } else if (tab === "credits") {
        const res = await api.get("/admin/credits");
        setCreditsData(res.data);
      } else if (tab === "ai-usage") {
        await fetchAiUsageData(aiPeriod, aiSortBy, aiUserPage);
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
      } else if (tab === "analytics") {
        const healthRes = await api.get("/admin/system-health");
        setSystemHealthData(healthRes.data);
        setTelemetryLogs({
          generationLatency: healthRes.data.generationLatency || 0,
          validationLatency: healthRes.data.validationLatency || 0,
          catSelectionLatency: healthRes.data.catSelectionLatency || 0,
          irtComputationTime: healthRes.data.irtComputationTime || 0,
          submissionLatency: healthRes.data.submissionLatency || 0,
          dbLatency: healthRes.data.dbLatency || 0,
          cacheHitRatio: healthRes.data.cacheHitRatio || 0
        });
      }
    } catch (err: any) {
      console.error("Failed to load tab data", err);
      setActionError(`Failed to load ${tab} data: ${err.response?.data?.message || err.message || "Unknown error"}`);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchAiUsageData = async (period: string, sortBy: string, page: number) => {
    setLoadingData(true);
    try {
      const summaryRes = await getPlatformAiUsageSummary(period);
      const usersRes = await getUserAiUsageConsumption(period, sortBy, page, 10);
      setPlatformSummary(summaryRes);
      setUserConsumptionPage(usersRes);
    } catch (err: any) {
      console.error("Failed to load AI usage analytics", err);
      setActionError(`Failed to load AI usage data: ${err.response?.data?.message || err.message || "Unknown error"}`);
    } finally {
      setLoadingData(false);
    }
  };

  const handleOpenAiUserDetail = async (userId: number) => {
    setLoadingAiUserData(true);
    setAiUserDrawerOpen(true);
    try {
      const detail = await getUserAiUsageDetail(userId, aiPeriod);
      setSelectedAiUser(detail);
    } catch (err) {
      console.error("Failed to fetch user AI usage detail", err);
    } finally {
      setLoadingAiUserData(false);
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

  const handleDeleteUser = async (userId: number, email: string) => {
    if (!confirm(`Are you sure you want to permanently delete user ${email}? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsersData((prev: any) => ({
        ...prev,
        users: prev.users.filter((u: any) => u.id !== userId),
        totalItems: prev.totalItems - 1
      }));
      alert(`User ${email} successfully deleted!`);
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete user. Please try again.");
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
        return (
          <AdminAnalyticsTab
            mode="dashboard"
            dashboardData={dashboardData}
            fetchTabData={fetchTabData}
          />
        );

      case "users":
        return (
          <AdminUsersTab
            usersData={usersData}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCollege={selectedCollege}
            setSelectedCollege={setSelectedCollege}
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
            currentPage={currentPage}
            fetchUsersList={fetchUsersList}
            handleUserClick={handleUserClick}
            handleDeleteUser={handleDeleteUser}
            userModalOpen={userModalOpen}
            setUserModalOpen={setUserModalOpen}
            selectedUser={selectedUser}
            loadingUserDetail={loadingUserDetail}
            updatingPlan={updatingPlan}
            handleUpdatePlan={handleUpdatePlan}
          />
        );

      case "announcements":
        return (
          <AdminAnnouncementsTab
            announcements={announcements}
            fetchTabData={fetchTabData}
            actionError={actionError}
            setActionError={setActionError}
            actionSuccess={actionSuccess}
            setActionSuccess={setActionSuccess}
          />
        );

      case "feature-flags":
        return (
          <AdminFeatureFlagsTab
            featureFlags={featureFlags}
            fetchTabData={fetchTabData}
            actionError={actionError}
            setActionError={setActionError}
            actionSuccess={actionSuccess}
            setActionSuccess={setActionSuccess}
          />
        );

      case "payments":
        return (
          <div className="space-y-6">
            {actionError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  <span>{actionError}</span>
                </div>
                <button onClick={() => setActionError("")} className="text-rose-500 hover:text-rose-700">✕</button>
              </div>
            )}
            {actionSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{actionSuccess}</span>
                </div>
                <button onClick={() => setActionSuccess("")} className="text-emerald-500 hover:text-emerald-700">✕</button>
              </div>
            )}

            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Payment Monitoring & Coupon Codes</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">Audit Razorpay transactions, trigger refunds, and manage promotional discount coupons.</p>
              </div>
              <Button 
                onClick={() => setShowNewCouponForm(!showNewCouponForm)} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl px-4 h-10"
              >
                {showNewCouponForm ? "Close Form" : "+ Create Coupon Code"}
              </Button>
            </div>

            {showNewCouponForm && (
              <Card className="p-6 bg-slate-50 border border-slate-200 shadow-sm rounded-2xl space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">Create New Promotional Coupon</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input 
                    type="text" 
                    placeholder="Coupon Code (e.g. WELCOME20)" 
                    value={newCouponCode} 
                    onChange={e => setNewCouponCode(e.target.value)} 
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white font-mono uppercase font-bold"
                  />
                  <select 
                    value={newCouponType} 
                    onChange={e => setNewCouponType(e.target.value)} 
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white font-bold"
                  >
                    <option value="PERCENTAGE">Percentage (%) OFF</option>
                    <option value="FLAT">Flat Amount (INR) OFF</option>
                  </select>
                  <input 
                    type="number" 
                    placeholder="Discount Value" 
                    value={newCouponValue} 
                    onChange={e => setNewCouponValue(Number(e.target.value))} 
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white font-bold"
                  />
                  <input 
                    type="number" 
                    placeholder="Usage Limit" 
                    value={newCouponLimit} 
                    onChange={e => setNewCouponLimit(Number(e.target.value))} 
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white font-bold"
                  />
                </div>
                <Button 
                  onClick={async () => {
                    if (!newCouponCode) return alert("Please enter coupon code");
                    try {
                      await api.post("/admin/coupons", {
                        code: newCouponCode,
                        discountType: newCouponType,
                        discountValue: newCouponValue,
                        usageLimit: newCouponLimit
                      });
                      setActionSuccess(`Coupon code '${newCouponCode}' saved successfully!`);
                      setActionError("");
                      setNewCouponCode("");
                      setShowNewCouponForm(false);
                      fetchTabData("payments");
                    } catch (e: any) {
                      setActionError("Failed to create coupon: " + (e.response?.data?.message || e.message));
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 rounded-xl px-6"
                >
                  Save Coupon Code
                </Button>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
                <h4 className="font-bold text-slate-800 text-base">Issue Razorpay Refund</h4>
                <p className="text-xs text-slate-500">Initiate full or partial refund to a candidate transaction with audit logging.</p>
                <div className="space-y-3 pt-2">
                  <input 
                    type="number" 
                    placeholder="Transaction ID (e.g. 101)" 
                    value={refundTxId} 
                    onChange={e => setRefundTxId(e.target.value)} 
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl font-mono"
                  />
                  <input 
                    type="number" 
                    placeholder="Refund Amount in ₹ (leave blank for full refund)" 
                    value={refundAmount} 
                    onChange={e => setRefundAmount(e.target.value)} 
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl font-mono"
                  />
                  <input 
                    type="text" 
                    placeholder="Refund Reason (e.g. Candidate requested cancellation)" 
                    value={refundReason} 
                    onChange={e => setRefundReason(e.target.value)} 
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl"
                  />
                  <Button 
                    onClick={async () => {
                      if (!refundTxId) return alert("Please enter Transaction ID");
                      const displayAmount = refundAmount ? `₹${refundAmount}` : "full amount";
                      if (!confirm(`CONFIRM REFUND: Are you sure you want to process a refund of ${displayAmount} for Transaction ID #${refundTxId}? This will downgrade the user's plan to FREE, reset credits to 100, and issue the refund via Razorpay.`)) return;
                      try {
                        await api.post(`/admin/payments/${refundTxId}/refund`, {
                          refundAmount: refundAmount ? Number(refundAmount) : null,
                          refundReason
                        });
                        setActionSuccess(`Refund of ${displayAmount} for Transaction ID #${refundTxId} processed successfully!`);
                        setActionError("");
                        setRefundTxId("");
                        setRefundAmount("");
                        setRefundReason("");
                      } catch (e: any) {
                        setActionError("Refund failed: " + (e.response?.data?.message || e.message));
                      }
                    }}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-10 rounded-xl"
                  >
                    Process Refund
                  </Button>
                </div>
              </Card>

              <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
                <h4 className="font-bold text-slate-800 text-base">Active Promotional Coupons</h4>
                <div className="divide-y divide-slate-100">
                  {coupons.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">No coupon codes configured.</p>
                  ) : (
                    coupons.map((c: any) => (
                      <div key={c.id} className="py-3 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-mono font-black text-indigo-700 text-sm">{c.code}</span>
                          <span className="ml-2 text-slate-500 font-semibold">({c.discountValue}{c.discountType === "PERCENTAGE" ? "% OFF" : " INR OFF"})</span>
                          <p className="text-[10px] text-slate-400">Used {c.usedCount} / {c.usageLimit || "∞"} times</p>
                        </div>
                        <Button 
                          onClick={async () => {
                            if (!confirm(`Delete coupon code '${c.code}'? (Currently used ${c.usedCount} times)`)) return;
                            try {
                              await api.delete(`/admin/coupons/${c.id}`);
                              setActionSuccess(`Coupon code '${c.code}' deleted.`);
                              setActionError("");
                              fetchTabData("payments");
                            } catch (e: any) {
                              setActionError("Failed to delete coupon: " + (e.response?.data?.message || e.message));
                            }
                          }}
                          variant="ghost" 
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 px-2"
                        >
                          Delete
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        );

      case "credits":
        if (!creditsData) {
          return (
            <Card className="p-12 bg-white border border-slate-200 shadow-sm rounded-2xl text-center space-y-4">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">Credits Data Unavailable</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Unable to load platform credit statistics. Please verify your administrative session or network connection.
              </p>
              <Button onClick={() => fetchTabData("credits")} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl px-5 h-10">
                <RefreshCw className="w-3.5 h-3.5 mr-2" /> Retry Loading
              </Button>
            </Card>
          );
        }
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
        return (
          <AdminAiUsageTab
            platformSummary={platformSummary}
            userConsumptionPage={userConsumptionPage}
            aiPeriod={aiPeriod}
            setAiPeriod={setAiPeriod}
            aiSortBy={aiSortBy}
            setAiSortBy={setAiSortBy}
            aiUserPage={aiUserPage}
            setAiUserPage={setAiUserPage}
            fetchAiUsageData={fetchAiUsageData}
            selectedAiUser={selectedAiUser}
            aiUserDrawerOpen={aiUserDrawerOpen}
            setAiUserDrawerOpen={setAiUserDrawerOpen}
            loadingAiUserData={loadingAiUserData}
            handleOpenAiUserDetail={handleOpenAiUserDetail}
          />
        );

      case "resumes":
        if (!resumeData) {
          return (
            <Card className="p-12 bg-white border border-slate-200 shadow-sm rounded-2xl text-center space-y-4">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">Resumes Data Unavailable</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Unable to load resume analytics. Please verify your administrative session or network connection.
              </p>
              <Button onClick={() => fetchTabData("resumes")} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl px-5 h-10">
                <RefreshCw className="w-3.5 h-3.5 mr-2" /> Retry Loading
              </Button>
            </Card>
          );
        }
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
        if (!interviewData) {
          return (
            <Card className="p-12 bg-white border border-slate-200 shadow-sm rounded-2xl text-center space-y-4">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">Mock Interviews Data Unavailable</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Unable to load mock interview statistics. Please verify your administrative session or network connection.
              </p>
              <Button onClick={() => fetchTabData("interviews")} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl px-5 h-10">
                <RefreshCw className="w-3.5 h-3.5 mr-2" /> Retry Loading
              </Button>
            </Card>
          );
        }
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
        if (!systemHealthData) {
          return (
            <Card className="p-12 bg-white border border-slate-200 shadow-sm rounded-2xl text-center space-y-4">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">System Health Data Unavailable</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Unable to load system health metrics. Please verify your administrative session or network connection.
              </p>
              <Button onClick={() => fetchTabData("system-health")} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl px-5 h-10">
                <RefreshCw className="w-3.5 h-3.5 mr-2" /> Retry Loading
              </Button>
            </Card>
          );
        }
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

      case "settings":
        return (
          <div className="space-y-6">
            {/* Multi-Tenant Settings */}
            <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-indigo-600" />
                  Organization SaaS Tenant Settings Configuration
                </h3>
                <p className="text-xs text-slate-500 mt-1">Configure candidate testing criteria overrides unique to this university/recruiter account.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-800 text-xs font-bold">
                <div className="space-y-2">
                  <label className="text-slate-650 uppercase tracking-wider text-[9px] block">Test Duration Limit (minutes)</label>
                  <input
                    type="number"
                    defaultValue={45}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-slate-650 uppercase tracking-wider text-[9px] block">Negative Marking Value</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold">
                    <option value="none">No Penalty (0.0)</option>
                    <option value="quarter">Standard Penalty (-0.25)</option>
                    <option value="half">Strict Penalty (-0.50)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-slate-650 uppercase tracking-wider text-[9px] block">Calculator Accessibility Policy</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold">
                    <option value="allowed">Allowed On-screen widget</option>
                    <option value="blocked">Prohibited completely</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-slate-650 uppercase tracking-wider text-[9px] block">Passing Criteria Score (%)</label>
                  <input
                    type="number"
                    defaultValue={60}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold h-10 px-6 rounded-xl text-xs">
                  Save Tenant Configuration
                </Button>
              </div>
            </Card>

            {/* Extensibility Framework Modules */}
            <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  SaaS Extensibility Plug-in Modules Console
                </h3>
                <p className="text-xs text-slate-500 mt-1">Activate optional assessment plugins without changing core engines.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Coding Assessment Compiler", desc: "Allows testing programmatic capability in 14+ languages.", active: true },
                  { name: "Behavioral Profile Evaluator", desc: "Integrates corporate psychological profiles evaluation.", active: true },
                  { name: "Situational Judgment Tests", desc: "Case scenarios mapping professional responses.", active: false },
                  { name: "Language Proficiency & Speech", desc: "Speech analysis checking vocabulary fluency.", active: false }
                ].map((plugin, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">{plugin.name}</span>
                      <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block leading-relaxed">{plugin.desc}</span>
                    </div>
                    <Badge className={
                      plugin.active 
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 py-1" 
                      : "bg-slate-200 text-slate-600 border-slate-300 py-1"
                    }>
                      {plugin.active ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

    case "analytics":
      return (
        <AdminAnalyticsTab
          mode="analytics"
          dashboardData={dashboardData}
          telemetryLogs={telemetryLogs}
          fetchTabData={fetchTabData}
        />
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar navigation */}
      <aside className="w-full lg:w-64 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col lg:justify-between flex-shrink-0">
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
              { id: "users", label: "User Management", icon: Users },
              { id: "analytics", label: "System Analytics", icon: TrendingUp },
              { id: "announcements", label: "Announcements", icon: Megaphone },
              { id: "feature-flags", label: "Feature Flags", icon: Sliders },
              { id: "payments", label: "Payment Monitoring", icon: DollarSign },
              { id: "credits", label: "Credits", icon: CreditCard },
              { id: "ai-usage", label: "AI Usage", icon: Cpu },
              { id: "resumes", label: "Resumes", icon: FileText },
              { id: "interviews", label: "Interviews", icon: MessageSquare },
              { id: "system-health", label: "System Health", icon: Activity },
              { id: "audit-logs", label: "Audit Logs", icon: Clock },
              { id: "reports", label: "Reports", icon: FileSpreadsheet },
              { id: "settings", label: "Settings", icon: Settings },
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

        {actionError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError("")} className="text-rose-500 hover:text-rose-700 font-bold ml-4">✕</button>
          </div>
        )}
        {actionSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess("")} className="text-emerald-500 hover:text-emerald-700 font-bold ml-4">✕</button>
          </div>
        )}

        {renderTabContent()}
      </main>
    </div>
  );
}
