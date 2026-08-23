"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, AlertTriangle, ArrowUpRight, Sparkles, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import api from "@/lib/api";

interface FeatureUsageMeta {
  limit: number;
  used: number;
  remaining: number;
  unit: string;
  included: boolean;
}

interface FeatureUsageBarProps {
  featureKey: string; // e.g. "ATS_ANALYSIS", "JD_MATCH", "SKILL_GAP", etc.
  featureTitle?: string;
  onExhaustedStateChange?: (blocked: boolean) => void;
  className?: string;
}

export function FeatureUsageBar({
  featureKey,
  featureTitle,
  onExhaustedStateChange,
  className = "",
}: FeatureUsageBarProps) {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<string>("FREE");
  const [meta, setMeta] = useState<FeatureUsageMeta | null>(null);
  const [customRemaining, setCustomRemaining] = useState<number>(0);
  const [periodEnd, setPeriodEnd] = useState<string>("");

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const [subRes, walletRes] = await Promise.allSettled([
        api.get("/payment/subscription-status"),
        api.get("/custom-plans/wallet"),
      ]);

      let userPlan = "FREE";
      let featureMeta: FeatureUsageMeta = { limit: 0, used: 0, remaining: 0, unit: "usage", included: false };
      let resetDateStr = "";

      if (subRes.status === "fulfilled" && subRes.value.data) {
        userPlan = subRes.value.data.plan || "FREE";
        resetDateStr = subRes.value.data.periodEnd || "";
        const feats = subRes.value.data.features || {};
        if (feats[featureKey]) {
          featureMeta = feats[featureKey];
        }
      }

      let customRem = 0;
      if (walletRes.status === "fulfilled" && walletRes.value.data?.customCreditTotals) {
        customRem = walletRes.value.data.customCreditTotals[featureKey] || 0;
      }

      setPlan(userPlan);
      setMeta(featureMeta);
      setCustomRemaining(customRem);
      setPeriodEnd(resetDateStr);

      const isBlocked = (!featureMeta.included && customRem <= 0) || (featureMeta.included && (featureMeta.remaining + customRem) <= 0);
      if (onExhaustedStateChange) {
        onExhaustedStateChange(isBlocked);
      }
    } catch {
      // Fallback safe state
    } finally {
      setLoading(false);
    }
  }, [featureKey, onExhaustedStateChange]);

  useEffect(() => {
    fetchStatus();

    // Listen for custom usage update events
    const handleUsageUpdated = () => fetchStatus();
    window.addEventListener("placementai:usage-updated", handleUsageUpdated);
    return () => {
      window.removeEventListener("placementai:usage-updated", handleUsageUpdated);
    };
  }, [fetchStatus]);

  if (loading) {
    return (
      <div className={`p-4 rounded-2xl bg-card border border-border/60 animate-pulse flex items-center justify-between ${className}`}>
        <div className="h-4 w-48 bg-muted rounded" />
        <div className="h-4 w-20 bg-muted rounded" />
      </div>
    );
  }

  if (!meta) return null;

  const totalRemaining = meta.remaining + customRemaining;
  const isIncluded = meta.included || customRemaining > 0;
  const isExhausted = isIncluded && totalRemaining <= 0;
  const isNotIncluded = !isIncluded;
  const isLow = isIncluded && totalRemaining > 0 && totalRemaining <= meta.limit * 0.25;

  const percentage = meta.limit > 0 ? Math.min(100, Math.round((totalRemaining / meta.limit) * 100)) : (customRemaining > 0 ? 100 : 0);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "End of billing cycle";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    } catch {
      return dateStr;
    }
  };

  // State 4: NOT INCLUDED
  if (isNotIncluded) {
    return (
      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className={`p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                {featureTitle || featureKey} <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 uppercase tracking-wider">Locked</span>
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Not included in your {plan} plan. Upgrade your plan or buy a Custom Feature Pack to unlock.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/select-plan">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 shadow-md">
                <Sparkles className="w-3.5 h-3.5" /> Upgrade Plan
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // State 3: EXHAUSTED
  if (isExhausted) {
    return (
      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className={`p-4 sm:p-5 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-500 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                🔴 0 / {meta.limit} {meta.unit} remaining
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Monthly limit reached. Resets on {formatDate(periodEnd)}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/select-plan">
              <Button size="sm" variant="outline" className="text-xs font-bold border-red-500/30 text-red-600 dark:text-red-400">
                Buy Custom Pack
              </Button>
            </Link>
            <Link href="/select-plan">
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-1 shadow-md">
                Upgrade Plan <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // State 1 & 2: HEALTHY / LOW
  return (
    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className={`p-4 sm:p-5 rounded-2xl bg-card/80 border border-border/80 shadow-md backdrop-blur-md space-y-3 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-foreground">
            {isLow ? "🟡" : "🟢"} {customRemaining > 0 ? `Subscription: ${meta.remaining} remaining` : `${totalRemaining} / ${meta.limit} ${meta.unit} remaining`}
          </span>
          {customRemaining > 0 && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
              Custom: +{customRemaining} {meta.unit}
            </span>
          )}
          {isLow && (
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
              Running Low
            </span>
          )}
        </div>

        <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" /> Resets {formatDate(periodEnd)}
        </div>
      </div>

      <div className="space-y-1">
        <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isLow ? "bg-amber-500" : "bg-emerald-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}
