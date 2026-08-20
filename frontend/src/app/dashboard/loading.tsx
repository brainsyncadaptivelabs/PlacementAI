import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-xl bg-white/10" />
          <Skeleton className="h-4 w-72 rounded-lg bg-white/5" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl bg-white/10" />
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl border border-white/10 bg-slate-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded bg-white/10" />
              <Skeleton className="h-9 w-9 rounded-xl bg-white/10" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg bg-white/10" />
            <Skeleton className="h-3 w-32 rounded bg-white/5" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-3xl border border-white/10 bg-slate-900/60 space-y-4 min-h-[300px]">
          <Skeleton className="h-6 w-36 rounded bg-white/10" />
          <Skeleton className="h-48 w-full rounded-2xl bg-white/5" />
        </div>
        <div className="p-6 rounded-3xl border border-white/10 bg-slate-900/60 space-y-4 min-h-[300px]">
          <Skeleton className="h-6 w-32 rounded bg-white/10" />
          <Skeleton className="h-12 w-full rounded-xl bg-white/5" />
          <Skeleton className="h-12 w-full rounded-xl bg-white/5" />
          <Skeleton className="h-12 w-full rounded-xl bg-white/5" />
        </div>
      </div>
    </div>
  );
}
