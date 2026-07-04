import React, { useEffect, memo } from "react";
import { WidgetCard } from "../shared/WidgetCard";
import { WidgetHeader } from "../shared/WidgetHeader";
import { WidgetSection } from "../shared/WidgetSection";
import { WidgetToolbar } from "../shared/WidgetToolbar";
import { logWidgetAnalytics } from "@/components/chat/Widgets";

export interface JourneyStep {
  name: string;
  status: "done" | "current" | "next";
  description?: string;
}

export const CareerJourney = memo(({ data }: { data: { title?: string; steps: JourneyStep[] } }) => {
  useEffect(() => {
    logWidgetAnalytics({ widgetType: "careerjourney", action: "rendered" });
  }, []);

  return (
    <WidgetCard>
      <WidgetHeader 
        title={data.title || "Career Placement Journey"} 
        description="Interactive track mapping milestones to final placement offer"
      />
      <WidgetSection className="p-4 space-y-4">
        <div className="relative pl-6 space-y-5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/60">
          {data.steps.map((step, idx) => {
            const isDone = step.status === "done";
            const isCurrent = step.status === "current";
            const color = isDone ? "bg-emerald-500 border-emerald-600 text-white" : isCurrent ? "bg-indigo-500 border-indigo-600 text-white animate-pulse" : "bg-card border-border text-muted-foreground";

            return (
              <div key={idx} className="flex gap-3.5 items-start">
                <div className={`absolute -left-[27px] w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black z-10 ${color}`}>
                  {idx + 1}
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isCurrent ? 'text-indigo-500 font-extrabold' : 'text-foreground'}`}>{step.name}</h4>
                  {step.description && <p className="text-[11px] text-muted-foreground mt-0.5">{step.description}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </WidgetSection>
      <WidgetToolbar widgetId="careerjourney" widgetType="careerjourney" copyContent={JSON.stringify(data, null, 2)} />
    </WidgetCard>
  );
});
CareerJourney.displayName = "CareerJourney";
export default CareerJourney;
