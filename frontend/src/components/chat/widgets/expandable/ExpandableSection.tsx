import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { WidgetCard } from "../shared/WidgetCard";
import { WidgetHeader } from "../shared/WidgetHeader";
import { WidgetSection } from "../shared/WidgetSection";
import { WidgetToolbar } from "../shared/WidgetToolbar";
import { widgetExpand } from "../shared/WidgetAnimations";
import { logWidgetAnalytics } from "@/components/chat/Widgets";

export interface SectionItem {
  title: string;
  content: string;
}

export const ExpandableSection = memo(({ data }: { data: { title?: string; sections: SectionItem[] } }) => {
  const expandedKey = `expandable_expanded_${data.title || "default"}`;

  const [expanded, setExpanded] = useState<Record<number, boolean>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(expandedKey);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return { 0: true };
  });

  useEffect(() => {
    logWidgetAnalytics({ widgetType: "expandable", action: "rendered" });
  }, []);

  const toggleSection = (idx: number) => {
    const isExpanding = !expanded[idx];
    const updated = { ...expanded, [idx]: isExpanding };
    setExpanded(updated);
    localStorage.setItem(expandedKey, JSON.stringify(updated));
    logWidgetAnalytics({
      widgetType: "expandable",
      action: isExpanding ? "expand" : "collapse",
      metadata: { index: idx }
    });
  };

  const handleExpandAll = () => {
    const newExpanded: Record<number, boolean> = {};
    data.sections.forEach((_, idx) => { newExpanded[idx] = true; });
    setExpanded(newExpanded);
    localStorage.setItem(expandedKey, JSON.stringify(newExpanded));
  };

  const handleCollapseAll = () => {
    setExpanded({});
    localStorage.removeItem(expandedKey);
  };

  return (
    <WidgetCard>
      <WidgetHeader 
        title={data.title || "Detailed Sections"} 
        action={
          <div className="flex gap-1.5">
            <button onClick={handleExpandAll} className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border border-border bg-card text-muted-foreground hover:text-foreground">
              Expand All
            </button>
            <button onClick={handleCollapseAll} className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border border-border bg-card text-muted-foreground hover:text-foreground">
              Collapse All
            </button>
          </div>
        }
      />
      <WidgetSection className="p-3 space-y-2">
        {data.sections.map((sect, idx) => {
          const isExpanded = !!expanded[idx];
          return (
            <div key={idx} className="border border-border/50 rounded-lg overflow-hidden bg-card/30">
              <div 
                onClick={() => toggleSection(idx)}
                className="p-3 flex items-center justify-between cursor-pointer bg-muted/10 hover:bg-muted/20 transition-all select-none"
              >
                <span className="text-xs font-bold text-foreground">{sect.title}</span>
                {isExpanded ? <ChevronUp className="w-4.5 h-4.5 text-muted-foreground" /> : <ChevronDown className="w-4.5 h-4.5 text-muted-foreground" />}
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    {...widgetExpand}
                    className="overflow-hidden"
                  >
                    <p className="p-3 text-xs text-muted-foreground leading-relaxed border-t border-border/40 bg-card whitespace-pre-wrap">{sect.content}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </WidgetSection>
      <WidgetToolbar widgetId="expandable" widgetType="expandable" copyContent={JSON.stringify(data, null, 2)} />
    </WidgetCard>
  );
});
ExpandableSection.displayName = "ExpandableSection";
export default ExpandableSection;
