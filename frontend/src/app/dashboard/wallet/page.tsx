"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Wallet, Sparkles, Clock, CheckCircle2, AlertCircle, ArrowUpRight, Plus, ShieldCheck, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import api from "@/lib/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

interface Entitlement {
  id: number;
  featureKey: string;
  featureName: string;
  purchasedCredits: number;
  usedCredits: number;
  remainingCredits: number;
  unit: string;
  purchaseDate: string;
  expiryDate: string;
  razorpayPaymentId: string;
  status: "ACTIVE" | "EXPIRED" | "EXHAUSTED";
}

const TOOL_ROUTES: Record<string, string> = {
  ATS_ANALYSIS: "/dashboard/ats",
  JD_MATCH: "/dashboard/jd-match",
  SKILL_GAP: "/dashboard/skill-gap",
  RESUME_COMPARE: "/dashboard/resume/compare",
  AI_CHAT: "/dashboard/chat",
  ENGLISH_PRACTICE: "/dashboard/coach",
  MOCK_INTERVIEW: "/dashboard/interview",
  CODING_AI_REVIEW: "/dashboard/coding",
  RESUME_TAILORING: "/dashboard/resume-builder",
};

export default function FeatureWalletPage() {
  const [loading, setLoading] = useState(true);
  const [activeEntitlements, setActiveEntitlements] = useState<Entitlement[]>([]);
  const [historicalEntitlements, setHistoricalEntitlements] = useState<Entitlement[]>([]);
  const [basePlan, setBasePlan] = useState<string>("FREE");
  const [error, setError] = useState<string>("");

  const fetchWallet = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/custom-plans/wallet");
      setActiveEntitlements(res.data.activeEntitlements || []);
      setHistoricalEntitlements(res.data.historicalEntitlements || []);
      setBasePlan(res.data.basePlan || "FREE");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load Feature Wallet"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Wallet className="w-3.5 h-3.5" /> PlacementAI Feature Wallet
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-foreground">
            My PlacementAI Features
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your custom purchased feature credits and 30-day usage balances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchWallet} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Link href="/select-plan">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-lg shadow-emerald-600/20">
              <Plus className="w-4 h-4" /> Buy More Credits
            </Button>
          </Link>
        </div>
      </div>

      {/* Base Plan & Active Entitlements Overview */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Base Subscription Tier</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black font-heading text-emerald-400">{basePlan} PLAN</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">Active</span>
          </div>
        </div>
        <div className="text-xs text-slate-400 sm:text-right">
          <p className="font-semibold text-slate-200">{activeEntitlements.length} Active Custom Entitlement Packs</p>
          <p>Custom credits coexist alongside base plan allowances.</p>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Active Feature Entitlements Cards Grid */}
      {!loading && !error && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" /> Active Feature Credits
          </h2>

          {activeEntitlements.length === 0 ? (
            <Card className="border-dashed py-12 text-center">
              <CardContent className="space-y-3">
                <Wallet className="w-12 h-12 text-muted-foreground mx-auto" />
                <h3 className="font-bold text-foreground text-base">No active custom credits</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  You haven't purchased any custom feature packs yet. Buy only the features you need.
                </p>
                <Link href="/select-plan">
                  <Button className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                    Build Custom Plan
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeEntitlements.map((ent) => {
                const percentage = Math.round((ent.remainingCredits / ent.purchasedCredits) * 100);
                const toolRoute = TOOL_ROUTES[ent.featureKey] || "/dashboard";

                return (
                  <Card key={ent.id} className="border-border/60 shadow-lg hover:border-emerald-500/40 transition-all flex flex-col justify-between">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-bold font-heading text-foreground">
                          {ent.featureName}
                        </CardTitle>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      </div>
                      <CardDescription className="text-xs font-medium flex items-center gap-1 text-muted-foreground mt-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" /> Expires: {formatDate(ent.expiryDate)}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-foreground">{ent.remainingCredits} / {ent.purchasedCredits} {ent.unit} remaining</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{percentage}%</span>
                        </div>
                        <Progress value={percentage} className="h-2 bg-secondary" />
                      </div>

                      <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1">
                        <span>Purchased: {formatDate(ent.purchaseDate)}</span>
                        <span className="truncate max-w-[120px]" title={ent.razorpayPaymentId}>#{ent.razorpayPaymentId}</span>
                      </div>
                    </CardContent>

                    <div className="p-4 pt-0">
                      <Link href={toolRoute}>
                        <Button className="w-full h-10 text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border flex items-center justify-center gap-1.5">
                          Use {ent.featureName}
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Historical / Exhausted / Expired Section */}
      {!loading && !error && historicalEntitlements.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-border/40">
          <h3 className="text-lg font-bold font-heading text-foreground">Purchase History & Expired Packs</h3>

          <div className="border border-border/60 rounded-xl overflow-hidden shadow-sm bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/50 text-muted-foreground font-semibold">
                    <th className="py-3 px-4">Feature</th>
                    <th className="py-3 px-4">Purchased Credits</th>
                    <th className="py-3 px-4">Remaining</th>
                    <th className="py-3 px-4">Purchase Date</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {historicalEntitlements.map((ent) => (
                    <tr key={ent.id} className="hover:bg-muted/30">
                      <td className="py-3 px-4 font-semibold text-foreground">{ent.featureName}</td>
                      <td className="py-3 px-4 text-muted-foreground">{ent.purchasedCredits} {ent.unit}</td>
                      <td className="py-3 px-4 text-muted-foreground">{ent.remainingCredits} {ent.unit}</td>
                      <td className="py-3 px-4 text-muted-foreground">{formatDate(ent.purchaseDate)}</td>
                      <td className="py-3 px-4 text-muted-foreground">{formatDate(ent.expiryDate)}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ent.status === "EXHAUSTED" ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"}`}>
                          {ent.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
