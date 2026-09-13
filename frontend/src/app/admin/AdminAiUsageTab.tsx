"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Cpu,
  Download,
  Zap,
  DollarSign,
  Activity,
  Users,
  Eye,
  Loader2,
  AlertTriangle,
  RefreshCw
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
import { exportAiUsageCsv } from "@/lib/api";

export interface AdminAiUsageTabProps {
  platformSummary: any;
  userConsumptionPage: any;
  aiPeriod: "day" | "week" | "month";
  setAiPeriod: (p: "day" | "week" | "month") => void;
  aiSortBy: "cost" | "tokens";
  setAiSortBy: (s: "cost" | "tokens") => void;
  aiUserPage: number;
  setAiUserPage: (p: number) => void;
  fetchAiUsageData: (period: "day" | "week" | "month", sortBy: "cost" | "tokens", page: number) => Promise<void>;
  selectedAiUser: any;
  aiUserDrawerOpen: boolean;
  setAiUserDrawerOpen: (open: boolean) => void;
  loadingAiUserData: boolean;
  handleOpenAiUserDetail: (userId: number) => Promise<void>;
}

export default function AdminAiUsageTab({
  platformSummary,
  userConsumptionPage,
  aiPeriod,
  setAiPeriod,
  aiSortBy,
  setAiSortBy,
  aiUserPage,
  setAiUserPage,
  fetchAiUsageData,
  selectedAiUser,
  aiUserDrawerOpen,
  setAiUserDrawerOpen,
  loadingAiUserData,
  handleOpenAiUserDetail
}: AdminAiUsageTabProps) {
  if (!platformSummary && !userConsumptionPage) {
    return (
      <Card className="p-12 bg-white border border-slate-200 shadow-sm rounded-2xl text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">AI Usage Data Unavailable</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Unable to load AI model and token consumption analytics. Please verify your administrative session or network connection.
        </p>
        <Button onClick={() => fetchAiUsageData(aiPeriod, aiSortBy, aiUserPage)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl px-5 h-10">
          <RefreshCw className="w-3.5 h-3.5 mr-2" /> Retry Loading
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toolbar Header & Period Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            AI Model & Token Analytics
          </h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Full granularity per-user token consumption tracking, daily rollups, and model spend insights.
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            {(["day", "week", "month"] as const).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setAiPeriod(p);
                  fetchAiUsageData(p, aiSortBy, 0);
                  setAiUserPage(0);
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                  aiPeriod === p
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {p === "day" ? "Today" : p === "week" ? "Last 7 Days" : "Last 30 Days"}
              </button>
            ))}
          </div>

          <Button
            onClick={async () => {
              try {
                await exportAiUsageCsv(aiPeriod);
              } catch (e: any) {
                alert("Failed to export CSV: " + (e.message || "Unknown error"));
              }
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 rounded-xl px-4 flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Platform KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Total Tokens</p>
              <p className="text-2xl font-black text-slate-900">
                {platformSummary ? platformSummary.totalTokens?.toLocaleString() : "0"}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold">
                Prompt: {platformSummary ? platformSummary.promptTokens?.toLocaleString() : 0} | Completion: {platformSummary ? platformSummary.completionTokens?.toLocaleString() : 0}
              </p>
            </div>
            <div className="p-3 rounded-2xl text-indigo-600 bg-indigo-50">
              <Zap className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Estimated Cost</p>
              <p className="text-2xl font-black text-emerald-700">
                ₹{platformSummary ? platformSummary.costInr?.toFixed(2) : "0.00"}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold">
                ${platformSummary ? platformSummary.costUsd?.toFixed(4) : "0.0000"} USD
              </p>
            </div>
            <div className="p-3 rounded-2xl text-emerald-600 bg-emerald-50">
              <DollarSign className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Total AI Calls</p>
              <p className="text-2xl font-black text-slate-900">
                {platformSummary ? platformSummary.callCount : 0}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold">
                Success: {platformSummary ? platformSummary.successfulCallCount : 0} | Failed: {platformSummary ? platformSummary.failedCallCount : 0}
              </p>
            </div>
            <div className="p-3 rounded-2xl text-blue-600 bg-blue-50">
              <Activity className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Active Users</p>
              <p className="text-2xl font-black text-slate-900">
                {platformSummary ? platformSummary.activeUserCount : 0}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold">
                Consuming AI APIs in period
              </p>
            </div>
            <div className="p-3 rounded-2xl text-purple-600 bg-purple-50">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Consumption & Spend Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">
              Platform Consumption Trend ({aiPeriod === "day" ? "Today" : aiPeriod === "week" ? "Last 7 Days" : "Last 30 Days"})
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">Daily aggregated token usage and cost</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={platformSummary?.trendSeries || []}>
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "12px", borderColor: "#e2e8f0" }} />
                <Area type="monotone" dataKey="totalTokens" name="Total Tokens" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTokens)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Feature Breakdown Split */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">Feature Breakdown</CardTitle>
            <CardDescription className="text-xs text-slate-500">Distribution across AI services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(platformSummary?.featureBreakdown || []).map((f: any) => (
              <div key={f.feature} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>{f.feature}</span>
                  <span>₹{f.costInr?.toFixed(2)} ({f.totalTokens?.toLocaleString()} tokens)</span>
                </div>
                <Progress value={platformSummary?.totalTokens ? (f.totalTokens / platformSummary.totalTokens) * 100 : 0} className="h-2 bg-slate-100" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Paginated Per-User AI Consumption Table */}
      <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h4 className="font-bold text-slate-800 text-lg">Per-User AI Consumption</h4>
            <p className="text-xs text-slate-500">Ranked list of users consuming AI API resources.</p>
          </div>

          {/* Sort Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Sort by:</span>
            <select
              value={aiSortBy}
              onChange={(e) => {
                const s = e.target.value as "cost" | "tokens";
                setAiSortBy(s);
                fetchAiUsageData(aiPeriod, s, 0);
                setAiUserPage(0);
              }}
              className="bg-slate-50 border border-slate-250 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="cost">Highest Spend (₹)</option>
              <option value="tokens">Highest Tokens</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-[0.15em] border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Total Tokens</th>
                <th className="px-6 py-4">Est. Cost (INR)</th>
                <th className="px-6 py-4">Est. Cost (USD)</th>
                <th className="px-6 py-4 text-center">API Calls</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {(userConsumptionPage?.content || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 italic font-semibold">
                    No user consumption records found for this period.
                  </td>
                </tr>
              ) : (
                (userConsumptionPage?.content || []).map((u: any) => (
                  <tr key={u.userId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{u.userName}</p>
                        <p className="text-slate-500 text-[11px] font-mono">{u.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                      {u.totalTokens?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-700">
                      ₹{u.costInr?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">
                      ${u.costUsd?.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-700">
                      {u.callCount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        onClick={() => handleOpenAiUserDetail(u.userId)}
                        size="sm"
                        variant="outline"
                        className="border-slate-250 text-indigo-600 font-bold hover:bg-indigo-50 text-xs h-8 px-3 rounded-lg"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View Drilldown
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Controls */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-bold">
          <p>Page {aiUserPage + 1} of {userConsumptionPage?.totalPages || 1}</p>
          <div className="flex gap-2">
            <Button
              disabled={aiUserPage === 0}
              onClick={() => {
                const next = aiUserPage - 1;
                setAiUserPage(next);
                fetchAiUsageData(aiPeriod, aiSortBy, next);
              }}
              variant="outline"
              className="border-slate-250 text-slate-700 hover:bg-slate-50 h-9 px-4 text-xs"
            >
              Previous
            </Button>
            <Button
              disabled={aiUserPage + 1 >= (userConsumptionPage?.totalPages || 1)}
              onClick={() => {
                const next = aiUserPage + 1;
                setAiUserPage(next);
                fetchAiUsageData(aiPeriod, aiSortBy, next);
              }}
              variant="outline"
              className="border-slate-250 text-slate-700 hover:bg-slate-50 h-9 px-4 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* User AI Usage Drill-Down Drawer / Modal */}
      {aiUserDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">User AI Consumption Drill-Down</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">{selectedAiUser?.userName} ({selectedAiUser?.userEmail})</p>
                </div>
                <button
                  onClick={() => setAiUserDrawerOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold p-2"
                >
                  ✕
                </button>
              </div>

              {loadingAiUserData ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
              ) : selectedAiUser ? (
                <div className="space-y-6 pt-4">
                  {/* User Summary Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl">
                      <p className="text-[10px] font-black uppercase text-indigo-500">Total Tokens</p>
                      <p className="text-xl font-black text-indigo-900">{selectedAiUser.totalTokens?.toLocaleString()}</p>
                      <p className="text-[10px] text-indigo-600 mt-1">Prompt: {selectedAiUser.promptTokens?.toLocaleString()} | Completion: {selectedAiUser.completionTokens?.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
                      <p className="text-[10px] font-black uppercase text-emerald-500">Total Cost</p>
                      <p className="text-xl font-black text-emerald-900">₹{selectedAiUser.costInr?.toFixed(2)}</p>
                      <p className="text-[10px] text-emerald-600 mt-1">${selectedAiUser.costUsd?.toFixed(4)} USD</p>
                    </div>
                  </div>

                  {/* Feature Split for User */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-800 text-sm">Feature Breakdown</h4>
                    <div className="space-y-2">
                      {(selectedAiUser.featureBreakdown || []).map((f: any) => (
                        <div key={f.feature} className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-slate-800">{f.feature}</p>
                            <p className="text-[10px] text-slate-500">{f.callCount} calls ({f.successCount} success / {f.failureCount} failed)</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-700">₹{f.costInr?.toFixed(2)}</p>
                            <p className="text-[10px] text-slate-500">{f.totalTokens?.toLocaleString()} tokens</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="border-t border-slate-200 pt-4 text-right">
              <Button
                onClick={() => setAiUserDrawerOpen(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 h-9 rounded-xl"
              >
                Close Drawer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
