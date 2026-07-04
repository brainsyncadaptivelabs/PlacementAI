import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";
import { WidgetCard } from "../shared/WidgetCard";
import { WidgetHeader } from "../shared/WidgetHeader";
import { WidgetSection } from "../shared/WidgetSection";
import { WidgetToolbar } from "../shared/WidgetToolbar";
import { widgetExpand } from "../shared/WidgetAnimations";
import { logWidgetAnalytics } from "@/components/chat/Widgets";

export interface Milestone {
  title: string;
  period: string;
  tasks: string[];
}

export const Timeline = memo(({ data }: { data: { title?: string; milestones: Milestone[] } }) => {
  const expandedKey = `timeline_expanded_${data.title || "default"}`;

  const [expandedMilestones, setExpandedMilestones] = useState<Record<number, boolean>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(expandedKey);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return { 0: true };
  });

  useEffect(() => {
    logWidgetAnalytics({ widgetType: "timeline", action: "rendered" });
  }, []);

  const toggleMilestone = (idx: number) => {
    const isExpanding = !expandedMilestones[idx];
    const updated = { ...expandedMilestones, [idx]: isExpanding };
    setExpandedMilestones(updated);
    localStorage.setItem(expandedKey, JSON.stringify(updated));
    logWidgetAnalytics({
      widgetType: "timeline",
      action: isExpanding ? "expand_milestone" : "collapse_milestone",
      metadata: { milestoneIndex: idx }
    });
  };

  return (
    <WidgetCard>
      <WidgetHeader 
        title={data.title || "Preparation Timeline"} 
        description="Weekly breakdown and study path schedule"
        icon={<Clock className="w-4 h-4" />}
      />
      <WidgetSection className="p-4 space-y-4">
        <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/60">
          {data.milestones.map((m, idx) => {
            const isExpanded = !!expandedMilestones[idx];
            return (
              <div key={idx} className="relative">
                <div className={`absolute -left-[27px] top-1 w-6 h-6 rounded-full border-2 border-indigo-500/30 flex items-center justify-center bg-card text-xs font-bold text-indigo-500 z-10`}>
                  {idx + 1}
                </div>

                <div 
                  onClick={() => toggleMilestone(idx)}
                  className={`p-3 rounded-xl border border-border bg-card/40 transition-all hover:bg-muted/10 cursor-pointer ${
                    isExpanded ? "border-indigo-500/25" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{m.title}</h4>
                      <span className="text-[10px] text-muted-foreground font-semibold">{m.period}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground/80" /> : <ChevronDown className="w-4 h-4 text-muted-foreground/50" />}
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        {...widgetExpand}
                        className="overflow-hidden mt-3 pt-3 border-t border-border/44"
                      >
                        <ul className="space-y-1.5">
                          {m.tasks.map((task, tIdx) => (
                            <li key={tIdx} className="flex items-start gap-2 text-xs text-muted-foreground font-medium">
                              <span className="text-indigo-500 mt-1 shrink-0">•</span>
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </WidgetSection>
      <WidgetToolbar widgetId="timeline" widgetType="timeline" copyContent={JSON.stringify(data, null, 2)} />
    </WidgetCard>
  );
});
Timeline.displayName = "Timeline";
export default Timeline;
