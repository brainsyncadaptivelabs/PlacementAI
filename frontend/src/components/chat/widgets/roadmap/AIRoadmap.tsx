import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, Circle, Clock, Link2, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { WidgetCard } from "../shared/WidgetCard";
import { WidgetHeader } from "../shared/WidgetHeader";
import { WidgetSection } from "../shared/WidgetSection";
import { WidgetToolbar } from "../shared/WidgetToolbar";
import { widgetFadeInUp, widgetExpand } from "../shared/WidgetAnimations";
import { logWidgetAnalytics } from "@/components/chat/Widgets";

export interface RoadmapNode {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  status: "completed" | "in_progress" | "locked";
  resources?: Array<{
    type: "video" | "article" | "problem";
    title: string;
    url: string;
    duration?: string;
  }>;
}

export const AIRoadmap = memo(({ data }: { data: { title?: string; nodes: RoadmapNode[] } }) => {
  const storageKey = `roadmap_nodes_${data.title || "default"}`;
  const expandedKey = `roadmap_expanded_${data.title || "default"}`;

  const [nodes, setNodes] = useState<RoadmapNode[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return data.nodes || [];
  });

  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(expandedKey);
    }
    return null;
  });

  useEffect(() => {
    logWidgetAnalytics({ widgetType: "roadmap", action: "rendered" });
  }, []);

  const toggleNodeStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = nodes.map(node => {
      if (node.id === id) {
        const nextStatus: "completed" | "in_progress" | "locked" = node.status === "completed" ? "in_progress" : "completed";
        logWidgetAnalytics({
          widgetType: "roadmap",
          action: "toggle_status",
          metadata: { nodeId: id, status: nextStatus }
        });
        return { ...node, status: nextStatus };
      }
      return node;
    });
    setNodes(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleNodeClick = (id: string) => {
    const nextVal = expandedNodeId === id ? null : id;
    setExpandedNodeId(nextVal);
    if (nextVal) {
      localStorage.setItem(expandedKey, nextVal);
      logWidgetAnalytics({ widgetType: "roadmap", action: "expand_node", metadata: { nodeId: id } });
    } else {
      localStorage.removeItem(expandedKey);
      logWidgetAnalytics({ widgetType: "roadmap", action: "collapse_node", metadata: { nodeId: id } });
    }
  };

  const completedCount = nodes.filter(n => n.status === "completed").length;
  const progressPercent = nodes.length > 0 ? Math.round((completedCount / nodes.length) * 100) : 0;

  return (
    <WidgetCard>
      <WidgetHeader 
        title={data.title || "Interactive Roadmap"} 
        description="Visualize, track, and complete placement topics"
        icon={<Sparkles className="w-4 h-4" />}
        action={
          <Badge variant="secondary" className="font-mono text-xs">
            {completedCount}/{nodes.length} Done
          </Badge>
        }
      />
      <WidgetSection className="pb-0 bg-muted/10 border-b border-border/40">
        <div className="flex items-center gap-3 mb-3">
          <Progress value={progressPercent} className="h-2 flex-1" />
          <span className="text-xs font-black text-indigo-500">{progressPercent}%</span>
        </div>
      </WidgetSection>
      <WidgetSection className="p-4 space-y-3">
        <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/60">
          {nodes.map((node) => {
            const isExpanded = expandedNodeId === node.id;
            const statusColor = 
              node.status === "completed" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" :
              node.status === "in_progress" ? "text-indigo-500 bg-indigo-500/10 border-indigo-500/30 animate-pulse" :
              "text-muted-foreground/60 bg-muted/50 border-border/80";

            return (
              <div key={node.id} className="relative group/node">
                <button 
                  onClick={(e) => toggleNodeStatus(node.id, e)}
                  className={`absolute -left-[27px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all bg-card z-10 hover:scale-110 ${statusColor}`}
                >
                  {node.status === "completed" ? (
                    <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-white" />
                  ) : node.status === "in_progress" ? (
                    <Circle className="w-3 h-3 fill-indigo-500 text-indigo-500" />
                  ) : (
                    <Circle className="w-3 h-3 text-muted-foreground/40" />
                  )}
                </button>

                <div 
                  onClick={() => handleNodeClick(node.id)}
                  className={`p-3 rounded-xl border border-border bg-card/50 transition-all hover:bg-muted/20 cursor-pointer ${
                    isExpanded ? 'border-indigo-500/30 shadow-sm' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-foreground leading-none flex items-center gap-2">
                        {node.title}
                        {node.duration && (
                          <span className="text-[10px] font-normal text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {node.duration}
                          </span>
                        )}
                      </h4>
                      {node.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{node.description}</p>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground/75" /> : <ChevronDown className="w-4 h-4 text-muted-foreground/50" />}
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        {...widgetExpand}
                        className="overflow-hidden mt-3 pt-3 border-t border-border/60 space-y-2.5"
                      >
                        {node.resources && node.resources.length > 0 ? (
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wide">Recommended Resources:</span>
                            {node.resources.map((res, rIdx) => (
                              <a 
                                key={rIdx} 
                                href={res.url} 
                                target="_blank" 
                                rel="noreferrer"
                                onClick={() => logWidgetAnalytics({
                                  widgetType: "roadmap",
                                  action: "resource_click",
                                  metadata: { nodeId: node.id, resourceTitle: res.title }
                                })}
                                className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/40 hover:bg-muted/80 transition-colors"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Link2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                  <span className="text-xs font-semibold text-foreground truncate">{res.title}</span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                  {res.duration && <span className="text-[10px] text-muted-foreground">{res.duration}</span>}
                                  <Badge variant="outline" className="text-[9px] uppercase font-bold py-0.5 px-1.5">
                                    {res.type}
                                  </Badge>
                                </div>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No extra resources available for this node.</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </WidgetSection>
      <WidgetToolbar widgetId={data.title || "roadmap"} widgetType="roadmap" copyContent={JSON.stringify(nodes, null, 2)} />
    </WidgetCard>
  );
});
AIRoadmap.displayName = "AIRoadmap";
export default AIRoadmap;
