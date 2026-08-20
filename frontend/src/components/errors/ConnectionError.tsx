"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { WifiOff, RefreshCw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ConnectionErrorProps {
  title?: string;
  description?: string;
  onRetry?: () => Promise<void> | void;
  compact?: boolean;
  className?: string;
}

export default function ConnectionError({
  title = "Connection Problem",
  description = "We're having trouble communicating with PlacementAI servers.",
  onRetry,
  compact = false,
  className = "",
}: ConnectionErrorProps) {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    setRetrying(true);
    try {
      await onRetry();
    } catch (err) {
      console.error("[ConnectionError] Retry failed:", err);
    } finally {
      setRetrying(false);
    }
  };

  if (compact) {
    return (
      <div
        className={`p-4 rounded-2xl border border-sky-500/20 bg-sky-950/20 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 text-left ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border border-sky-500/30 bg-sky-500/10 flex items-center justify-center flex-shrink-0">
            <WifiOff className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">{title}</h4>
            <p className="text-xs text-slate-300">{description}</p>
          </div>
        </div>
        {onRetry && (
          <Button
            onClick={handleRetry}
            disabled={retrying}
            size="sm"
            className="rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs px-4 h-9 flex items-center gap-1.5 flex-shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retrying ? "animate-spin" : ""}`} />
            {retrying ? "Reconnecting..." : "Retry"}
          </Button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl border border-sky-500/20 bg-slate-900/90 backdrop-blur-xl text-center shadow-2xl ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl border border-sky-500/30 bg-sky-500/10 mx-auto mb-5 flex items-center justify-center shadow-inner shadow-sky-500/20">
        <WifiOff className="w-8 h-8 text-sky-400" />
      </div>

      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-300 mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {onRetry && (
          <Button
            onClick={handleRetry}
            disabled={retrying}
            className="w-full sm:w-auto h-10 px-5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
          >
            <RefreshCw className={`w-4 h-4 ${retrying ? "animate-spin" : ""}`} />
            {retrying ? "Connecting..." : "Try Again"}
          </Button>
        )}

        <Button
          asChild
          variant="outline"
          className="w-full sm:w-auto h-10 px-5 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 font-medium text-sm flex items-center justify-center gap-2"
        >
          <Link href="/dashboard">
            <LayoutDashboard className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
