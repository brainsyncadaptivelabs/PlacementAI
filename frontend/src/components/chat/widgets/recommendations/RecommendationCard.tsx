import React, { useState, useEffect, memo } from "react";
import { Clock, CheckSquare, Square } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { logWidgetAnalytics } from "@/components/chat/Widgets";

export interface RecommendationItem {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  difficulty: string;
  time: string;
  readinessImpact: number;
  ctaText: string;
  completed: boolean;
}

export const RecommendationCard = memo(({ data }: { data: { title?: string; recommendations: RecommendationItem[] } }) => {
  const storageKey = `recommendations_${data.title || "default"}`;

  const [recs, setRecs] = useState<RecommendationItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return data.recommendations || [];
  });

  useEffect(() => {
    logWidgetAnalytics({ widgetType: "recommendation", action: "rendered" });
  }, []);

  const toggleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recs.map(r => {
      if (r.id === id) {
        const nextState = !r.completed;
        logWidgetAnalytics({
          widgetType: "recommendation",
          action: "toggle_complete",
          metadata: { recId: id, completed: nextState }
        });
        return { ...r, completed: nextState };
      }
      return r;
    });
    setRecs(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  return (
    <div className="w-full my-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {recs.map((rec) => {
        const priorityColor = 
          rec.priority === "High" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
          rec.priority === "Medium" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
          "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";

        return (
          <Card key={rec.id} className="relative overflow-hidden border border-border shadow-sm flex flex-col justify-between hover:scale-[1.01] transition-transform">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className={`px-2 py-0.5 rounded text-[9px] uppercase font-black ${priorityColor}`}>
                  {rec.priority} Priority
                </Badge>
                <span className="text-[10px] text-emerald-500 font-extrabold flex items-center gap-0.5">
                  +{rec.readinessImpact} Readiness
                </span>
              </div>
              <CardTitle className="text-sm font-bold text-foreground mt-2 leading-tight flex items-start gap-2">
                <button 
                  onClick={(e) => toggleComplete(rec.id, e)}
                  className="mt-0.5 text-indigo-500 focus:outline-none shrink-0"
                >
                  {rec.completed ? (
                    <CheckSquare className="w-4 h-4 fill-indigo-500 text-white" />
                  ) : (
                    <Square className="w-4.5 h-4.5 text-muted-foreground/60" />
                  )}
                </button>
                <span className={rec.completed ? "line-through text-muted-foreground/60" : ""}>{rec.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3.5">
              <div className="flex items-center gap-3 text-[10px] font-semibold text-muted-foreground/80 mt-1">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {rec.time}</span>
                <span>•</span>
                <span>Diff: {rec.difficulty}</span>
              </div>
              <button 
                onClick={() => logWidgetAnalytics({
                  widgetType: "recommendation",
                  action: "cta_click",
                  metadata: { recId: rec.id, title: rec.title }
                })}
                className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-colors mt-2"
              >
                {rec.ctaText}
              </button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});
RecommendationCard.displayName = "RecommendationCard";
export default RecommendationCard;
