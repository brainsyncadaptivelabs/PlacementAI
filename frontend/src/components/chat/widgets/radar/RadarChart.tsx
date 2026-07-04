import React, { useEffect, memo } from "react";
import { Badge } from "@/components/ui/badge";
import { WidgetCard } from "../shared/WidgetCard";
import { WidgetHeader } from "../shared/WidgetHeader";
import { WidgetSection } from "../shared/WidgetSection";
import { WidgetToolbar } from "../shared/WidgetToolbar";
import { logWidgetAnalytics } from "@/components/chat/Widgets";

export const RadarChart = memo(({ data }: { data: { title?: string; scores: Record<string, number> } }) => {
  const keys = ["ats", "coding", "dsa", "projects", "resume", "communication", "aptitude", "interview"];
  const labels = ["ATS", "Coding", "DSA", "Projects", "Resume", "Comm.", "Aptitude", "Interview"];
  const cx = 120;
  const cy = 120;
  const maxR = 80;

  const points = keys.map((key, i) => {
    const score = data.scores[key] || 50;
    const angle = (i * 2 * Math.PI) / 8 - Math.PI / 2;
    const r = (score / 100) * maxR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(" ");

  const gridRings = [20, 40, 60, 80];

  useEffect(() => {
    logWidgetAnalytics({ widgetType: "radar", action: "rendered" });
  }, []);

  return (
    <WidgetCard>
      <WidgetHeader 
        title={data.title || "Readiness Radar Analysis"} 
        description="Interactive visual map of skill levels across core axes"
      />
      <WidgetSection className="p-4 flex flex-col items-center justify-center">
        <svg width="240" height="240" className="overflow-visible select-none">
          {gridRings.map((r, idx) => (
            <circle key={idx} cx={cx} cy={cy} r={r} fill="none" className="stroke-muted-foreground/20" strokeWidth="1" strokeDasharray="2" />
          ))}
          {keys.map((_, i) => {
            const angle = (i * 2 * Math.PI) / 8 - Math.PI / 2;
            const x2 = cx + maxR * Math.cos(angle);
            const y2 = cy + maxR * Math.sin(angle);
            return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} className="stroke-muted-foreground/30" strokeWidth="1" />;
          })}
          {labels.map((lbl, i) => {
            const angle = (i * 2 * Math.PI) / 8 - Math.PI / 2;
            const x = cx + (maxR + 18) * Math.cos(angle);
            const y = cy + (maxR + 8) * Math.sin(angle);
            return (
              <text key={i} x={x} y={y} textAnchor="middle" className="fill-muted-foreground font-black text-[9px] uppercase tracking-wider">
                {lbl}
              </text>
            );
          })}
          <polygon points={points} className="fill-indigo-500/20 stroke-indigo-500" strokeWidth="2" />
        </svg>
      </WidgetSection>
      <WidgetToolbar widgetId="radar" widgetType="radar" copyContent={JSON.stringify(data.scores, null, 2)} />
    </WidgetCard>
  );
});
RadarChart.displayName = "RadarChart";
export default RadarChart;
