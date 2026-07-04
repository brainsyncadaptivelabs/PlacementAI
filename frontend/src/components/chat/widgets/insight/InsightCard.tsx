import React, { useEffect, memo } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { logWidgetAnalytics } from "@/components/chat/Widgets";

export interface InsightItem {
  type: "success" | "warning" | "error" | "info";
  title: string;
  value: string;
  confidence: number;
  explanation: string;
  whySuggested: string;
  expectedImpact: string;
}

export const InsightCard = memo(({ data }: { data: { insights: InsightItem[] } }) => {
  useEffect(() => {
    logWidgetAnalytics({ widgetType: "insight", action: "rendered" });
  }, []);

  return (
    <div className="w-full my-4 space-y-3">
      {data.insights.map((insight, idx) => {
        const colors = 
          insight.type === "success" ? { border: "border-emerald-500/20", bg: "bg-emerald-500/5", icon: "text-emerald-500" } :
          insight.type === "warning" ? { border: "border-amber-500/20", bg: "bg-amber-500/5", icon: "text-amber-500" } :
          insight.type === "error" ? { border: "border-rose-500/20", bg: "bg-rose-500/5", icon: "text-rose-500" } :
          { border: "border-indigo-500/20", bg: "bg-indigo-500/5", icon: "text-indigo-500" };

        return (
          <Card key={idx} className={`border ${colors.border} ${colors.bg} overflow-hidden shadow-sm`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg bg-card border flex items-center justify-center ${colors.icon}`}>
                    {insight.type === "success" ? <CheckCircle2 className="w-4.5 h-4.5" /> : <AlertTriangle className="w-4.5 h-4.5" />}
                  </div>
                  <div>
                    <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">{insight.title}</CardTitle>
                    <span className="text-sm font-bold text-foreground block mt-0.5">{insight.value}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono font-bold">
                  {insight.confidence}% Confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-muted-foreground font-semibold">
              <p className="text-foreground font-medium">{insight.explanation}</p>
              <div className="bg-card/40 p-2.5 rounded-lg border border-border/50 text-[11px] space-y-1">
                <div><span className="text-[10px] text-muted-foreground/60 uppercase block font-bold">Why PlacementAI suggested this:</span> {insight.whySuggested}</div>
                <div className="mt-1.5"><span className="text-[10px] text-emerald-500/80 uppercase block font-bold">Expected Impact:</span> {insight.expectedImpact}</div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});
InsightCard.displayName = "InsightCard";
export default InsightCard;
