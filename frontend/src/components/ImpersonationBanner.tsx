"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function ImpersonationBanner() {
  const router = useRouter();
  const [isActive, setIsActive] = useState<boolean>(false);
  const [targetName, setTargetName] = useState<string>("");
  const [targetEmail, setTargetEmail] = useState<string>("");
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1800);

  useEffect(() => {
    const checkImpersonationState = () => {
      const active = localStorage.getItem("impersonation_active") === "true";
      if (active) {
        setIsActive(true);
        setTargetName(localStorage.getItem("impersonation_target_name") || "Candidate");
        setTargetEmail(localStorage.getItem("impersonation_target_email") || "user@example.com");
        
        const startTime = parseInt(localStorage.getItem("impersonation_start_time") || "0", 10);
        if (startTime > 0) {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          const rem = Math.max(0, 1800 - elapsed);
          setSecondsRemaining(rem);
        }
      } else {
        setIsActive(false);
      }
    };

    checkImpersonationState();
    const interval = setInterval(() => {
      checkImpersonationState();
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          handleAutoExit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleAutoExit = async () => {
    alert("30-minute impersonation session has expired. Restoring admin access.");
    await exitImpersonation();
  };

  const exitImpersonation = async () => {
    try {
      await api.post("/admin/impersonate/end");
    } catch (err) {
      console.warn("Failed to call end impersonation endpoint cleanly", err);
    } finally {
      const adminToken = localStorage.getItem("admin_backup_token");
      if (adminToken) {
        localStorage.setItem("token", adminToken);
      }
      localStorage.removeItem("admin_backup_token");
      localStorage.removeItem("impersonation_active");
      localStorage.removeItem("impersonation_target_name");
      localStorage.removeItem("impersonation_target_email");
      localStorage.removeItem("impersonation_start_time");
      setIsActive(false);
      router.push("/admin");
    }
  };

  const [publicBanner, setPublicBanner] = useState<any>(null);

  useEffect(() => {
    const fetchPublicBanner = async () => {
      try {
        const res = await api.get("/announcements/active-banner");
        setPublicBanner(res.data);
      } catch (err) {
        // Silent catch for guest routes
      }
    };
    fetchPublicBanner();
  }, []);

  if (!isActive) {
    if (publicBanner?.maintenanceActive) {
      return (
        <div className="bg-gradient-to-r from-rose-700 via-rose-800 to-amber-900 text-white py-2.5 px-4 sticky top-0 z-[100] shadow-xl border-b border-rose-500/40 flex items-center justify-between flex-wrap gap-2 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="animate-pulse">⚠️</span>
            <span className="font-extrabold tracking-wide">
              SYSTEM MAINTENANCE MODE: {publicBanner.maintenanceMessage || "Scheduled platform maintenance in progress."}
            </span>
          </div>
        </div>
      );
    }
    if (publicBanner?.announcementActive) {
      return (
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-900 text-white py-2.5 px-4 sticky top-0 z-[100] shadow-xl border-b border-indigo-500/40 flex items-center justify-between flex-wrap gap-2 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span>📢</span>
            <span className="font-bold">
              <strong className="underline decoration-indigo-300">{publicBanner.announcementTitle}:</strong> {publicBanner.announcementContent}
            </span>
          </div>
        </div>
      );
    }
    return null;
  }

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-indigo-900 text-white py-2.5 px-4 sticky top-0 z-[100] shadow-xl border-b border-amber-500/40 flex items-center justify-between flex-wrap gap-2 text-xs font-semibold">
      <div className="flex items-center gap-2">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300"></span>
        </span>
        <span className="font-bold tracking-wide">
          👁️ ADMIN IMPERSONATION MODE — Viewing as <strong className="text-white underline decoration-amber-300 underline-offset-2">{targetName}</strong> ({targetEmail})
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="bg-black/30 border border-white/20 px-3 py-1 rounded-full font-mono text-[11px] font-bold text-amber-200 tracking-wider">
          Expires in {formattedTime}
        </span>
        <button
          onClick={exitImpersonation}
          className="bg-white text-slate-900 hover:bg-amber-100 font-extrabold px-3.5 py-1 rounded-full transition-all text-xs shadow-sm hover:shadow"
        >
          Exit Session
        </button>
      </div>
    </div>
  );
}
