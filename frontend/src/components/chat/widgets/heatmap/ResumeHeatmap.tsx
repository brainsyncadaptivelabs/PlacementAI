import React, { useState, useEffect, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { WidgetCard } from "../shared/WidgetCard";
import { WidgetHeader } from "../shared/WidgetHeader";
import { WidgetSection } from "../shared/WidgetSection";
import { WidgetToolbar } from "../shared/WidgetToolbar";
import { widgetExpand } from "../shared/WidgetAnimations";
import { logWidgetAnalytics } from "@/components/chat/Widgets";

export interface HeatmapSection {
  name: string;
  rating: "Excellent" | "Good" | "Needs Improvement" | "Missing";
  keywords: string[];
  details: string;
}

export const ResumeHeatmap = memo(({ data }: { data: { title?: string; sections: HeatmapSection[] } }) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  useEffect(() => {
    logWidgetAnalytics({ widgetType: "heatmap", action: "rendered" });
  }, []);

  return (
    <WidgetCard>
      <WidgetHeader 
        title={data.title || "Resume Heatmap Analysis"} 
        description="Interactive visual heat-rating of resume structures"
      />
      <WidgetSection className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-2.5">
          {data.sections.map((sect, idx) => {
            const colors = 
              sect.rating === "Excellent" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20" :
              sect.rating === "Good" ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/30 hover:bg-indigo-500/20" :
              sect.rating === "Needs Improvement" ? "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20" :
              "bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20";
            return (
              <button
                key={idx}
                onClick={() => setSelectedIdx(selectedIdx === idx ? null : idx)}
                className={`p-3.5 rounded-xl border text-left transition-all hover:scale-[1.01] ${colors} ${
                  selectedIdx === idx ? 'ring-2 ring-indigo-500/40 border-indigo-500/60' : ''
                }`}
              >
                <h4 className="text-xs font-black uppercase tracking-wider">{sect.name}</h4>
                <Badge variant="secondary" className="mt-2 text-[9px] uppercase font-bold py-0.5 px-1.5">{sect.rating}</Badge>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {selectedIdx !== null && (
            <motion.div
              {...widgetExpand}
              className="overflow-hidden p-3.5 rounded-xl bg-muted/30 border border-border/60 text-xs space-y-2"
            >
              <h5 className="font-bold text-foreground text-xs uppercase tracking-wide">
                {data.sections[selectedIdx].name} Details
              </h5>
              <p className="text-muted-foreground">{data.sections[selectedIdx].details}</p>
              {data.sections[selectedIdx].keywords && data.sections[selectedIdx].keywords.length > 0 && (
                <div className="pt-1">
                  <span className="text-[10px] text-muted-foreground/60 font-bold uppercase block mb-1">Detected Keywords:</span>
                  <div className="flex flex-wrap gap-1">
                    {data.sections[selectedIdx].keywords.map((kw, kIdx) => (
                      <Badge key={kIdx} variant="outline" className="text-[9px]">{kw}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </WidgetSection>
      <WidgetToolbar widgetId="heatmap" widgetType="heatmap" copyContent={JSON.stringify(data, null, 2)} />
    </WidgetCard>
  );
});
ResumeHeatmap.displayName = "ResumeHeatmap";
export default ResumeHeatmap;
