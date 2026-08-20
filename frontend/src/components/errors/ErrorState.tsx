"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileQuestion,
  AlertTriangle,
  ShieldAlert,
  Lock,
  WifiOff,
  Wrench,
  HelpCircle,
  ArrowLeft,
  Home,
  LayoutDashboard,
  RefreshCw,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PlacementAILogo from "@/components/branding/PlacementAILogo";

export type ErrorVariant =
  | "not-found"
  | "server"
  | "forbidden"
  | "unauthorized"
  | "connection"
  | "maintenance"
  | "generic";

export interface ErrorStateProps {
  type?: ErrorVariant;
  code?: string | number;
  title?: string;
  description?: string;
  onRetry?: () => void;
  primaryActionText?: string;
  primaryActionHref?: string;
  secondaryActionText?: string;
  secondaryActionHref?: string;
  showHomeButton?: boolean;
  showDashboardButton?: boolean;
  className?: string;
}

const VARIANT_CONFIGS: Record<
  ErrorVariant,
  {
    code: string;
    defaultTitle: string;
    defaultDescription: string;
    icon: React.ElementType;
    iconColor: string;
    glowColor: string;
    badgeText: string;
  }
> = {
  "not-found": {
    code: "404",
    defaultTitle: "Page Not Found",
    defaultDescription:
      "The page you're looking for doesn't exist or may have been moved.",
    icon: FileQuestion,
    iconColor: "text-indigo-400",
    glowColor: "rgba(99, 102, 241, 0.15)",
    badgeText: "404 Error",
  },
  server: {
    code: "500",
    defaultTitle: "Server Error",
    defaultDescription:
      "Something went wrong on our side. Please try again in a moment.",
    icon: AlertTriangle,
    iconColor: "text-rose-400",
    glowColor: "rgba(244, 63, 94, 0.15)",
    badgeText: "500 Internal Error",
  },
  forbidden: {
    code: "403",
    defaultTitle: "Access Restricted",
    defaultDescription:
      "You don't have permission to access this resource or feature.",
    icon: ShieldAlert,
    iconColor: "text-amber-400",
    glowColor: "rgba(245, 158, 11, 0.15)",
    badgeText: "403 Forbidden",
  },
  unauthorized: {
    code: "401",
    defaultTitle: "Authentication Required",
    defaultDescription:
      "You need to sign in to your PlacementAI account to access this page.",
    icon: Lock,
    iconColor: "text-purple-400",
    glowColor: "rgba(168, 85, 247, 0.15)",
    badgeText: "401 Unauthorized",
  },
  connection: {
    code: "OFFLINE",
    defaultTitle: "Connection Problem",
    defaultDescription:
      "We're having trouble communicating with the PlacementAI servers.",
    icon: WifiOff,
    iconColor: "text-sky-400",
    glowColor: "rgba(56, 189, 248, 0.15)",
    badgeText: "Network Offline",
  },
  maintenance: {
    code: "503",
    defaultTitle: "PlacementAI is temporarily unavailable",
    defaultDescription:
      "We're making improvements to the platform. Please check back shortly.",
    icon: Wrench,
    iconColor: "text-emerald-400",
    glowColor: "rgba(52, 211, 153, 0.15)",
    badgeText: "Scheduled Maintenance",
  },
  generic: {
    code: "ERROR",
    defaultTitle: "Something Went Wrong",
    defaultDescription:
      "An unexpected error occurred while loading this section.",
    icon: HelpCircle,
    iconColor: "text-indigo-400",
    glowColor: "rgba(99, 102, 241, 0.15)",
    badgeText: "Application Alert",
  },
};

export default function ErrorState({
  type = "generic",
  code,
  title,
  description,
  onRetry,
  primaryActionText,
  primaryActionHref,
  secondaryActionText,
  secondaryActionHref,
  showHomeButton = true,
  showDashboardButton = true,
  className = "",
}: ErrorStateProps) {
  const router = useRouter();
  const config = VARIANT_CONFIGS[type] || VARIANT_CONFIGS.generic;

  const displayCode = code ?? config.code;
  const displayTitle = title ?? config.defaultTitle;
  const displayDescription = description ?? config.defaultDescription;
  const IconComponent = config.icon;

  // Determine user dashboard destination safely from cookies/localStorage
  const [dashboardPath, setDashboardPath] = React.useState("/dashboard");
  const [isAuth, setIsAuth] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setIsAuth(Boolean(token));

      const match = document.cookie.match(new RegExp("(^| )placementai_role=([^;]+)"));
      const role = match ? match[2] : null;

      if (role === "RECRUITER") setDashboardPath("/recruiter");
      else if (role === "PLACEMENT_OFFICER") setDashboardPath("/placement-officer");
      else if (role === "ADMIN" || role === "SUPER_ADMIN") setDashboardPath("/admin");
      else setDashboardPath("/dashboard");
    }
  }, []);

  return (
    <div
      className={`min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-center select-none ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-lg mx-auto flex flex-col items-center"
      >
        {/* Branding Logo Header */}
        <div className="mb-6 flex items-center gap-3">
          <PlacementAILogo size={36} />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            PlacementAI
          </span>
        </div>

        {/* Outer Card with Glassmorphism */}
        <div className="w-full relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-8 sm:p-10 shadow-2xl">
          {/* Background Ambient Glow */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-colors duration-500"
            style={{ background: config.glowColor }}
          />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-slate-300 mb-6 backdrop-blur-md">
            <span className={`w-2 h-2 rounded-full ${config.iconColor.replace("text-", "bg-")}`} />
            {config.badgeText}
          </div>

          {/* Icon Section */}
          <div className="relative mb-6 flex justify-center">
            <div
              className="w-20 h-20 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center shadow-inner"
              style={{ boxShadow: `0 0 40px ${config.glowColor}` }}
            >
              <IconComponent className={`w-10 h-10 ${config.iconColor}`} />
            </div>
            {/* Display large numeric code watermark if applicable */}
            {displayCode && displayCode !== "ERROR" && displayCode !== "OFFLINE" && (
              <span className="absolute -top-4 -right-2 text-6xl font-extrabold text-white/[0.04] pointer-events-none font-mono">
                {displayCode}
              </span>
            )}
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
            {displayTitle}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8 max-w-md mx-auto">
            {displayDescription}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
            {/* Retry Button if callback provided */}
            {onRetry && (
              <Button
                onClick={onRetry}
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {primaryActionText || "Try Again"}
              </Button>
            )}

            {/* Unauthorized primary sign in */}
            {type === "unauthorized" && !onRetry && (
              <Button
                asChild
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Link href={primaryActionHref || "/auth"}>
                  <LogIn className="w-4 h-4" />
                  {primaryActionText || "Sign In"}
                </Link>
              </Button>
            )}

            {/* Custom Primary Action if not covered */}
            {primaryActionHref && type !== "unauthorized" && !onRetry && (
              <Button
                asChild
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Link href={primaryActionHref}>
                  {primaryActionText || "Continue"}
                </Link>
              </Button>
            )}

            {/* Dashboard Button */}
            {showDashboardButton && type !== "unauthorized" && !onRetry && !primaryActionHref && (
              <Button
                asChild
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Link href={isAuth ? dashboardPath : "/auth"}>
                  <LayoutDashboard className="w-4 h-4" />
                  {isAuth ? "Go to Dashboard" : "Sign In"}
                </Link>
              </Button>
            )}

            {/* Secondary Action / Home Button / Back Button */}
            {secondaryActionHref ? (
              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto h-11 px-6 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 font-medium transition-all flex items-center justify-center gap-2"
              >
                <Link href={secondaryActionHref}>
                  {secondaryActionText || "Go Back"}
                </Link>
              </Button>
            ) : showHomeButton ? (
              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto h-11 px-6 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 font-medium transition-all flex items-center justify-center gap-2"
              >
                <Link href={isAuth ? dashboardPath : "/"}>
                  {isAuth ? <ArrowLeft className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                  {secondaryActionText || (isAuth ? "Dashboard" : "Go Home")}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
