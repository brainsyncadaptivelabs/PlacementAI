import React, { useEffect, memo } from "react";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { WidgetCard } from "../shared/WidgetCard";
import { WidgetHeader } from "../shared/WidgetHeader";
import { WidgetSection } from "../shared/WidgetSection";
import { WidgetToolbar } from "../shared/WidgetToolbar";
import { logWidgetAnalytics } from "@/components/chat/Widgets";

export interface ProgressCategory {
  name: string;
  score: number;
}

export const ProgressCard = memo(({ data }: { data: any }) => {
  useEffect(() => {
    logWidgetAnalytics({ widgetType: "progress", action: "rendered" });
  }, []);

  const overall = typeof data?.overall === "number" 
    ? data.overall 
    : (typeof data?.score === "number" ? data.score : 0);

  const categories: ProgressCategory[] = Array.isArray(data?.categories)
    ? data.categories
    : (data?.label ? [{ name: data.label, score: overall }] : []);

  const badgeText = overall >= 80 ? "Superb Fit" : overall >= 60 ? "Ready to Apply" : "Needs Practice";

  return (
    <WidgetCard>
      <WidgetHeader 
        title="Placement Readiness Index" 
        description="Detailed evaluation across core domains"
        icon={<TrendingUp className="w-4 h-4" />}
      />
      <WidgetSection className="space-y-4">
        <div className="flex items-center justify-between bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground/80">Overall Readiness</span>
            <h3 className="text-2xl font-black text-indigo-500 mt-0.5">{overall}%</h3>
          </div>
          <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-1 px-3">
            {badgeText}
          </Badge>
        </div>

        {categories.length > 0 && (
          <div className="space-y-3.5">
            {categories.map((cat, idx) => {
              const barColor = 
                cat.score >= 80 ? "bg-emerald-500" :
                cat.score >= 60 ? "bg-indigo-500" :
                "bg-rose-500";
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-foreground">{cat.name}</span>
                    <span className="text-muted-foreground">{cat.score}%</span>
                  </div>
                  <Progress value={cat.score} className="h-1.5" indicatorClassName={barColor} />
                </div>
              );
            })}
          </div>
        )}
      </WidgetSection>
      <WidgetToolbar widgetId="progress" widgetType="progress" copyContent={JSON.stringify(data, null, 2)} />
    </WidgetCard>
  );
});
ProgressCard.displayName = "ProgressCard";
export default ProgressCard;
