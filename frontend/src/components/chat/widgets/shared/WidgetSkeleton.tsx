import React from "react";

export const WidgetSkeleton = () => (
  <div className="w-full p-6 rounded-2xl border border-border bg-card animate-pulse space-y-4 my-4">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-muted" />
      <div className="space-y-1.5 flex-1">
        <div className="h-4 bg-muted rounded-full w-1/3" />
        <div className="h-3 bg-muted rounded-full w-2/3" />
      </div>
    </div>
    <div className="space-y-2 pt-2">
      <div className="h-8 bg-muted rounded-xl w-full" />
      <div className="h-8 bg-muted rounded-xl w-full" />
      <div className="h-8 bg-muted rounded-xl w-full" />
    </div>
  </div>
);
