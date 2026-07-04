import React, { useEffect, memo } from "react";
import { Badge } from "@/components/ui/badge";
import { WidgetCard } from "../shared/WidgetCard";
import { WidgetHeader } from "../shared/WidgetHeader";
import { WidgetSection } from "../shared/WidgetSection";
import { WidgetToolbar } from "../shared/WidgetToolbar";
import { logWidgetAnalytics } from "@/components/chat/Widgets";

export interface FlowNode {
  id: string;
  label: string;
  type?: string;
}

export interface FlowLink {
  source: string;
  target: string;
  label?: string;
}

export const FlowDiagram = memo(({ data }: { data: { title?: string; nodes: FlowNode[]; links: FlowLink[] } }) => {
  useEffect(() => {
    logWidgetAnalytics({ widgetType: "flow", action: "rendered" });
  }, []);

  return (
    <WidgetCard>
      <WidgetHeader 
        title={data.title || "API & System Architecture Flow"} 
        description="Visual diagram mapping sequential connections"
      />
      <WidgetSection className="p-4 space-y-4">
        <div className="flex flex-col gap-3 bg-muted/10 p-4 border rounded-xl">
          <div className="flex flex-wrap gap-2 justify-center">
            {data.nodes.map((node) => (
              <div key={node.id} className="p-2.5 rounded-lg border bg-card text-xs font-bold shadow-sm flex flex-col items-center min-w-[100px]">
                <span className="text-[10px] text-muted-foreground/60 uppercase block font-bold mb-0.5">{node.type || "Node"}</span>
                <span className="text-foreground">{node.label}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border/50 pt-3 text-xs space-y-2">
            <span className="text-[10px] text-muted-foreground/60 font-bold uppercase block">Connections:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.links.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/40 text-[11px]">
                  <span className="font-bold text-indigo-500">{link.source}</span>
                  <span className="text-muted-foreground">➔</span>
                  <span className="font-bold text-emerald-500">{link.target}</span>
                  {link.label && <Badge variant="secondary" className="ml-auto text-[9px]">{link.label}</Badge>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </WidgetSection>
      <WidgetToolbar widgetId="flow" widgetType="flow" copyContent={JSON.stringify(data, null, 2)} />
    </WidgetCard>
  );
});
FlowDiagram.displayName = "FlowDiagram";
export default FlowDiagram;
