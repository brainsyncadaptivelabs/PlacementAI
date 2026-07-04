import React, { useEffect, memo } from "react";
import { WidgetCard } from "../shared/WidgetCard";
import { WidgetHeader } from "../shared/WidgetHeader";
import { WidgetSection } from "../shared/WidgetSection";
import { WidgetToolbar } from "../shared/WidgetToolbar";
import { logWidgetAnalytics } from "@/components/chat/Widgets";

export interface PipelineStage {
  name: string;
  status: "completed" | "active" | "pending";
  date?: string;
}

export const InterviewPipeline = memo(({ data }: { data: { title?: string; stages: PipelineStage[] } }) => {
  useEffect(() => {
    logWidgetAnalytics({ widgetType: "pipeline", action: "rendered" });
  }, []);

  return (
    <WidgetCard>
      <WidgetHeader 
        title={data.title || "Interview Stage Tracker"} 
        description="Hiring rounds progress funnel map"
      />
      <WidgetSection className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 relative before:absolute before:left-3 sm:before:left-4 sm:before:right-4 before:top-4 sm:before:top-1/2 before:w-[2px] sm:before:w-auto before:h-full sm:before:h-[2px] before:bg-border/60 -z-0">
          {data.stages.map((stage, idx) => {
            const isCompleted = stage.status === "completed";
            const isActive = stage.status === "active";
            const colors = 
              isCompleted ? "bg-emerald-500 border-emerald-600 text-white" :
              isActive ? "bg-indigo-500 border-indigo-600 text-white animate-pulse" :
              "bg-card border-border text-muted-foreground";

            return (
              <div key={idx} className="flex sm:flex-col items-center gap-3 relative z-10 w-full sm:w-auto">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black shadow-sm ${colors}`}>
                  {idx + 1}
                </div>
                <div className="text-left sm:text-center min-w-0">
                  <h4 className={`text-xs font-bold leading-none ${isActive ? 'text-indigo-500 font-extrabold' : 'text-foreground'}`}>{stage.name}</h4>
                  {stage.date && <span className="text-[9px] text-muted-foreground block mt-0.5">{stage.date}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </WidgetSection>
      <WidgetToolbar widgetId="pipeline" widgetType="pipeline" copyContent={JSON.stringify(data, null, 2)} />
    </WidgetCard>
  );
});
InterviewPipeline.displayName = "InterviewPipeline";
export default InterviewPipeline;
