import React, { useState, useEffect, useMemo, Component, ErrorInfo, ReactNode, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, CheckCircle2, Circle, Clock, Link2, ChevronDown, ChevronUp,
  TrendingUp, Building2, CheckSquare, Square, AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// --- WIDGET ANALYTICS LAYER ---
export const logWidgetAnalytics = (event: {
  widgetType: string;
  action: string;
  metadata?: Record<string, any>;
}) => {
  console.log(`[Widget Analytics] Type: ${event.widgetType} | Action: ${event.action}`, event.metadata || {});
};

// --- ERROR BOUNDARY ---
interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackType: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class WidgetErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logWidgetAnalytics({
      widgetType: this.props.fallbackType,
      action: "error",
      metadata: { error: error.message, stack: errorInfo.componentStack }
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400 space-y-2 my-2 text-sm font-sans">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>Interactive Widget Error</span>
          </div>
          <p className="text-xs text-muted-foreground">Could not render {this.props.fallbackType}. Displaying raw content fallback below.</p>
          <pre className="text-[11px] bg-black/40 p-3 rounded-lg overflow-x-auto text-zinc-400 font-mono mt-1 max-h-40">
            {this.state.error?.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- SKELETON LOADER ---
export const WidgetSkeleton = () => (
  <div className="w-full p-6 rounded-2xl border border-border bg-card animate-pulse space-y-4 my-4">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-muted" />
      <div className="space-y-1.5 flex-1">
        <div className="h-4 bg-muted rounded-full w-1/3" />
        <div className="h-3 bg-muted rounded-full w-2/3" />
      </div>
    </div>
    <div className="space-y-2 pt-2">
      <div className="h-8 bg-muted rounded-xl w-full" />
      <div className="h-8 bg-muted rounded-xl w-full" />
      <div className="h-8 bg-muted rounded-xl w-full" />
    </div>
  </div>
);

// --- INTERACTIVE WIDGET COMPONENTS WITH PERSISTENT STATE ---

// 1. AIRoadmap
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
        const nextStatus = node.status === "completed" ? "in_progress" : "completed";
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
    <Card className="w-full my-4 overflow-hidden border border-border/80 shadow-md">
      <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">{data.title || "Interactive Roadmap"}</CardTitle>
              <CardDescription className="text-xs">Visualize, track, and complete placement topics</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {completedCount}/{nodes.length} Done
          </Badge>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Progress value={progressPercent} className="h-2 flex-1" />
          <span className="text-xs font-black text-indigo-500">{progressPercent}%</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
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
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
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
      </CardContent>
    </Card>
  );
});
AIRoadmap.displayName = "AIRoadmap";

// 2. CompanyComparison
export interface CompanyData {
  name: string;
  package: string;
  process: string;
  difficulty: "Easy" | "Medium" | "Hard";
  eligibility: string;
  topics: string[];
}

export const CompanyComparison = memo(({ data }: { data: { companies: CompanyData[] } }) => {
  const [sortField, setSortField] = useState<"name" | "package" | "difficulty">("name");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    logWidgetAnalytics({ widgetType: "comparison", action: "rendered" });
  }, []);

  const handleSort = (field: "name" | "package" | "difficulty") => {
    const isAsc = sortField === field ? !sortAsc : true;
    setSortField(field);
    setSortAsc(isAsc);
    logWidgetAnalytics({
      widgetType: "comparison",
      action: "sort",
      metadata: { field, direction: isAsc ? "asc" : "desc" }
    });
  };

  const sortedCompanies = useMemo(() => {
    return [...data.companies].sort((a, b) => {
      let valA: string | number = a[sortField];
      let valB: string | number = b[sortField];

      if (sortField === "package") {
        const parsePkg = (str: string) => parseFloat(str.replace(/[^0-9.]/g, "")) || 0;
        valA = parsePkg(a.package);
        valB = parsePkg(b.package);
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [data.companies, sortField, sortAsc]);

  return (
    <Card className="w-full my-4 overflow-hidden border border-border shadow-md">
      <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">Company Comparison</CardTitle>
            <CardDescription className="text-xs">Compare recruiting metrics and criteria side-by-side</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/20 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <th onClick={() => handleSort("name")} className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                Company {sortField === "name" && (sortAsc ? "▲" : "▼")}
              </th>
              <th onClick={() => handleSort("package")} className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                Package (CTC) {sortField === "package" && (sortAsc ? "▲" : "▼")}
              </th>
              <th onClick={() => handleSort("difficulty")} className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                Difficulty {sortField === "difficulty" && (sortAsc ? "▲" : "▼")}
              </th>
              <th className="p-3">Eligibility</th>
              <th className="p-3">Core Topics</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-sm">
            {sortedCompanies.map((comp, idx) => {
              const diffBadgeColor = 
                comp.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                comp.difficulty === "Medium" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                "bg-rose-500/10 text-rose-500 border-rose-500/20";

              return (
                <tr key={idx} className="hover:bg-muted/10 transition-colors">
                  <td className="p-3 font-bold text-foreground">{comp.name}</td>
                  <td className="p-3 text-indigo-500 font-semibold">{comp.package}</td>
                  <td className="p-3">
                    <Badge variant="outline" className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${diffBadgeColor}`}>
                      {comp.difficulty}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">{comp.eligibility}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {comp.topics.slice(0, 3).map((topic, tIdx) => (
                        <Badge key={tIdx} variant="secondary" className="text-[9px] px-1.5 py-0">
                          {topic}
                        </Badge>
                      ))}
                      {comp.topics.length > 3 && (
                        <span className="text-[9px] text-muted-foreground/60 font-semibold ml-0.5">+{comp.topics.length - 3}</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
});
CompanyComparison.displayName = "CompanyComparison";

// 3. Timeline
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
    <Card className="w-full my-4 overflow-hidden border border-border shadow-md">
      <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">{data.title || "Preparation Timeline"}</CardTitle>
            <CardDescription className="text-xs">Weekly breakdown and study path schedule</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
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
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-3 pt-3 border-t border-border/40"
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
      </CardContent>
    </Card>
  );
});
Timeline.displayName = "Timeline";

// 4. ProgressCard
export interface ProgressCategory {
  name: string;
  score: number;
}

export const ProgressCard = memo(({ data }: { data: { overall: number; categories: ProgressCategory[] } }) => {
  useEffect(() => {
    logWidgetAnalytics({ widgetType: "progress", action: "rendered" });
  }, []);

  return (
    <Card className="w-full my-4 overflow-hidden border border-border shadow-md">
      <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">Placement Readiness Index</CardTitle>
            <CardDescription className="text-xs">Detailed evaluation across core domains</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground/80">Overall Readiness</span>
            <h3 className="text-2xl font-black text-indigo-500 mt-0.5">{data.overall}%</h3>
          </div>
          <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-1 px-3">
            {data.overall >= 80 ? "Superb Fit" : data.overall >= 60 ? "Ready to Apply" : "Needs Practice"}
          </Badge>
        </div>

        <div className="space-y-3.5">
          {data.categories.map((cat, idx) => {
            const barColor = 
              cat.score >= 80 ? "bg-emerald-500" :
              cat.score >= 60 ? "bg-indigo-500" :
              "bg-rose-500";
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-foreground">{cat.name}</span>
                  <span className="text-muted-foreground">{cat.score}%</span>
                </div>
                <Progress value={cat.score} className="h-1.5" indicatorClassName={barColor} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});
ProgressCard.displayName = "ProgressCard";

// 5. Checklist
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export const Checklist = memo(({ data }: { data: { title?: string; items: ChecklistItem[] } }) => {
  const storageKey = `checklist_items_${data.title || "default"}`;

  const [items, setItems] = useState<ChecklistItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return data.items || [];
  });

  useEffect(() => {
    logWidgetAnalytics({ widgetType: "checklist", action: "rendered" });
  }, []);

  const toggleItem = (id: string) => {
    const updated = items.map(item => {
      if (item.id === id) {
        const nextState = !item.completed;
        logWidgetAnalytics({
          widgetType: "checklist",
          action: "toggle_item",
          metadata: { itemId: id, completed: nextState }
        });
        return { ...item, completed: nextState };
      }
      return item;
    });
    setItems(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const completedCount = items.filter(i => i.completed).length;

  return (
    <Card className="w-full my-4 overflow-hidden border border-border shadow-md">
      <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">{data.title || "Preparation Checklist"}</CardTitle>
              <CardDescription className="text-xs">Important actionable tasks</CardDescription>
            </div>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {completedCount}/{items.length} Completed
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        {items.map((item) => (
          <div 
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className="flex items-center gap-2.5 p-2 rounded-lg border border-transparent hover:bg-muted/30 cursor-pointer select-none transition-all"
          >
            <button className="text-indigo-500 focus:outline-none shrink-0">
              {item.completed ? (
                <CheckSquare className="w-4.5 h-4.5 fill-indigo-500 text-white" />
              ) : (
                <Square className="w-4.5 h-4.5 text-muted-foreground/60" />
              )}
            </button>
            <span className={`text-xs font-semibold ${item.completed ? "line-through text-muted-foreground/60" : "text-foreground"}`}>
              {item.text}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});
Checklist.displayName = "Checklist";

// 6. SkillTree
export interface SkillNode {
  id: string;
  name: string;
  status: "completed" | "in_progress" | "locked";
  hours: number;
  difficulty: string;
  prereqs: string[];
  resources: Array<{ type: string; title: string; url: string }>;
  notes?: string;
  problems?: Array<{ name: string; url: string }>;
  projects?: Array<{ name: string; desc: string }>;
}

export const SkillTree = memo(({ data }: { data: { title?: string; skills: SkillNode[] } }) => {
  const storageKey = `skilltree_skills_${data.title || "default"}`;
  const expandedKey = `skilltree_expanded_${data.title || "default"}`;

  const [skills, setSkills] = useState<SkillNode[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return data.skills || [];
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSkills, setExpandedSkills] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(expandedKey);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return {};
  });

  useEffect(() => {
    logWidgetAnalytics({ widgetType: "skilltree", action: "rendered" });
  }, []);

  const toggleSkillExpand = (id: string) => {
    const isExpanding = !expandedSkills[id];
    const updated = { ...expandedSkills, [id]: isExpanding };
    setExpandedSkills(updated);
    localStorage.setItem(expandedKey, JSON.stringify(updated));
    logWidgetAnalytics({
      widgetType: "skilltree",
      action: isExpanding ? "expand_skill" : "collapse_skill",
      metadata: { skillId: id }
    });
  };

  const handleExpandAll = () => {
    const newExpanded: Record<string, boolean> = {};
    skills.forEach(s => { newExpanded[s.id] = true; });
    setExpandedSkills(newExpanded);
    localStorage.setItem(expandedKey, JSON.stringify(newExpanded));
    logWidgetAnalytics({ widgetType: "skilltree", action: "expand_all" });
  };

  const handleCollapseAll = () => {
    setExpandedSkills({});
    localStorage.removeItem(expandedKey);
    logWidgetAnalytics({ widgetType: "skilltree", action: "collapse_all" });
  };

  const toggleSkillStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = skills.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === "completed" ? "in_progress" : s.status === "in_progress" ? "locked" : "completed";
        logWidgetAnalytics({
          widgetType: "skilltree",
          action: "toggle_status",
          metadata: { skillId: id, status: nextStatus }
        });
        return { ...s, status: nextStatus };
      }
      return s;
    });
    setSkills(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const filteredSkills = skills.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedCount = skills.filter(s => s.status === "completed").length;
  const progressPercent = skills.length > 0 ? Math.round((completedCount / skills.length) * 100) : 0;
  const totalHours = skills.reduce((sum, s) => sum + s.hours, 0);

  return (
    <Card className="w-full my-4 overflow-hidden border border-border shadow-md">
      <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">{data.title || "Interactive Skill Tree"}</CardTitle>
                <CardDescription className="text-xs">Explore requirements, prerequisites, and resource nodes</CardDescription>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button 
                onClick={handleExpandAll}
                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                Expand All
              </button>
              <button 
                onClick={handleCollapseAll}
                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                Collapse All
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground bg-card p-3 border rounded-xl">
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-[11px]">
                <span>Progress</span>
                <span>{progressPercent}% ({completedCount}/{skills.length})</span>
              </div>
              <Progress value={progressPercent} className="h-1.5" indicatorClassName="bg-indigo-500" />
            </div>
            <div className="border-l border-border pl-4">
              <span className="text-[10px] text-muted-foreground/60 uppercase block font-bold">Total Est. Time</span>
              <span className="text-sm font-bold text-indigo-500">{totalHours} Hours</span>
            </div>
          </div>

          <div className="relative">
            <input 
              type="text" 
              placeholder="Search skill..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        <div className="space-y-3.5">
          {filteredSkills.map((skill) => {
            const isExpanded = !!expandedSkills[skill.id];
            const statusColor = 
              skill.status === "completed" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
              skill.status === "in_progress" ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 animate-pulse" :
              "bg-muted/50 text-muted-foreground/60 border-border/80";

            return (
              <div key={skill.id} className="border border-border/70 rounded-xl overflow-hidden bg-card/40 hover:bg-card/70 transition-all">
                <div 
                  onClick={() => toggleSkillExpand(skill.id)}
                  className="p-3 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button 
                      onClick={(e) => toggleSkillStatus(skill.id, e)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-transform hover:scale-110 ${statusColor}`}
                    >
                      {skill.status === "completed" ? (
                        <CheckCircle2 className="w-4.5 h-4.5" />
                      ) : skill.status === "in_progress" ? (
                        <Circle className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
                      ) : (
                        <Circle className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate">{skill.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground font-semibold">{skill.hours} hrs</span>
                        <Badge variant="outline" className="text-[9px] uppercase font-black px-1.5 py-0">
                          {skill.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {skill.prereqs && skill.prereqs.length > 0 && (
                      <span className="text-[9px] font-bold bg-muted border text-muted-foreground/80 px-1.5 py-0.5 rounded uppercase">
                        Prereq
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground/75" /> : <ChevronDown className="w-4 h-4 text-muted-foreground/50" />}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border/50 p-3 bg-muted/20 space-y-3 text-xs"
                    >
                      {skill.prereqs && skill.prereqs.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Prerequisites:</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {skill.prereqs.map((pr, pIdx) => (
                              <Badge key={pIdx} variant="outline" className="text-[9px]">
                                {pr}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {skill.notes && (
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Study Notes:</span>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed bg-card p-2 rounded-lg border border-border/40">{skill.notes}</p>
                        </div>
                      )}

                      {skill.resources && skill.resources.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Study Materials:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                            {skill.resources.map((res, rIdx) => (
                              <a 
                                key={rIdx} 
                                href={res.url} 
                                target="_blank" 
                                rel="noreferrer"
                                onClick={() => logWidgetAnalytics({
                                  widgetType: "skilltree",
                                  action: "resource_click",
                                  metadata: { skillId: skill.id, resource: res.title }
                                })}
                                className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/40 hover:bg-muted transition-colors"
                              >
                                <Link2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                <span className="truncate text-foreground font-semibold text-[11px]">{res.title}</span>
                                <Badge variant="secondary" className="text-[8px] uppercase font-bold py-0 ml-auto shrink-0">{res.type}</Badge>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});
SkillTree.displayName = "SkillTree";

// 7. RecommendationCard
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

// 8. InsightCard
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

// 9. ExpandableSection
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
    <Card className="w-full my-4 overflow-hidden border border-border shadow-md">
      <CardHeader className="bg-muted/30 border-b border-border/50 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold">{data.title || "Detailed Sections"}</CardTitle>
          <div className="flex gap-1.5">
            <button onClick={handleExpandAll} className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border border-border bg-card text-muted-foreground hover:text-foreground">
              Expand All
            </button>
            <button onClick={handleCollapseAll} className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border border-border bg-card text-muted-foreground hover:text-foreground">
              Collapse All
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
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
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="p-3 text-xs text-muted-foreground leading-relaxed border-t border-border/40 bg-card whitespace-pre-wrap">{sect.content}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
});
ExpandableSection.displayName = "ExpandableSection";

// 10. RadarChart
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

  return (
    <Card className="w-full my-4 border border-border shadow-md overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
        <CardTitle className="text-base font-bold">{data.title || "Readiness Radar Analysis"}</CardTitle>
        <CardDescription className="text-xs">Interactive visual map of skill levels across core axes</CardDescription>
      </CardHeader>
      <CardContent className="p-4 flex flex-col items-center justify-center">
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
      </CardContent>
    </Card>
  );
});
RadarChart.displayName = "RadarChart";

// 11. ResumeHeatmap
export interface HeatmapSection {
  name: string;
  rating: "Excellent" | "Good" | "Needs Improvement" | "Missing";
  keywords: string[];
  details: string;
}

export const ResumeHeatmap = memo(({ data }: { data: { title?: string; sections: HeatmapSection[] } }) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  return (
    <Card className="w-full my-4 border border-border shadow-md overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
        <CardTitle className="text-base font-bold">{data.title || "Resume Heatmap Analysis"}</CardTitle>
        <CardDescription className="text-xs">Interactive visual heat-rating of resume structures</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
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
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
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
      </CardContent>
    </Card>
  );
});
ResumeHeatmap.displayName = "ResumeHeatmap";

// 12. InterviewPipeline
export interface PipelineStage {
  name: string;
  status: "completed" | "active" | "pending";
  date?: string;
}

export const InterviewPipeline = memo(({ data }: { data: { title?: string; stages: PipelineStage[] } }) => {
  return (
    <Card className="w-full my-4 border border-border shadow-md overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
        <CardTitle className="text-base font-bold">{data.title || "Interview Stage Tracker"}</CardTitle>
        <CardDescription className="text-xs">Hiring rounds progress funnel map</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
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
      </CardContent>
    </Card>
  );
});
InterviewPipeline.displayName = "InterviewPipeline";

// 13. CareerJourney
export interface JourneyStep {
  name: string;
  status: "done" | "current" | "next";
  description?: string;
}

export const CareerJourney = memo(({ data }: { data: { title?: string; steps: JourneyStep[] } }) => {
  return (
    <Card className="w-full my-4 border border-border shadow-md overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
        <CardTitle className="text-base font-bold">{data.title || "Career Placement Journey"}</CardTitle>
        <CardDescription className="text-xs">Interactive track mapping milestones to final placement offer</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
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
      </CardContent>
    </Card>
  );
});
CareerJourney.displayName = "CareerJourney";

// 14. MindMap
export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
}

export const MindMap = memo(({ data }: { data: { title?: string; root: MindMapNode } }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNode = (node: MindMapNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = !!expanded[node.id];

    return (
      <div key={node.id} className="pl-4 border-l border-border/60 mt-2 space-y-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleExpand(node.id)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
              depth === 0 ? 'bg-indigo-500 text-white border-indigo-600' :
              hasChildren ? 'bg-card text-foreground border-border hover:bg-muted' : 'bg-muted/30 text-muted-foreground border-transparent'
            }`}
          >
            {node.label}
            {hasChildren && <span className="ml-1 text-[9px]">{isExpanded ? '[-]' : '[+]'}</span>}
          </button>
        </div>
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full my-4 border border-border shadow-md overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
        <CardTitle className="text-base font-bold">{data.title || "Interactive Concept Mindmap"}</CardTitle>
        <CardDescription className="text-xs">Expandable knowledge trees for placement topics</CardDescription>
      </CardHeader>
      <CardContent className="p-4 overflow-x-auto">
        {renderNode(data.root)}
      </CardContent>
    </Card>
  );
});
MindMap.displayName = "MindMap";

// 15. FlowDiagram
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
  return (
    <Card className="w-full my-4 border border-border shadow-md overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
        <CardTitle className="text-base font-bold">{data.title || "API & System Architecture Flow"}</CardTitle>
        <CardDescription className="text-xs">Visual diagram mapping sequential connections</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
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
      </CardContent>
    </Card>
  );
});
FlowDiagram.displayName = "FlowDiagram";

// 16. MermaidDiagram (Dynamic Lazy Loader)
export const MermaidDiagram = memo(({ chart }: { chart: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let active = true;
    const renderChart = async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
        });
        const id = `mermaid-${Math.floor(Math.random() * 100000)}`;
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        if (active) {
          setSvg(renderedSvg);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || "Failed to render diagram");
        }
      }
    };
    renderChart();
    return () => {
      active = false;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="p-3 border border-red-500/20 bg-red-500/5 text-red-500 rounded-xl text-xs font-mono my-3">
        Failed to render Mermaid diagram. Raw code:
        <pre className="mt-2 p-2 bg-black/40 rounded overflow-x-auto text-[10px]">{chart}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="p-4 border rounded-xl animate-pulse bg-muted/20 flex items-center justify-center text-xs text-muted-foreground my-3">
        Generating diagram layout...
      </div>
    );
  }

  return (
    <div 
      className="p-4 border rounded-xl bg-muted/10 overflow-x-auto shadow-sm flex justify-center my-3"
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
});
MermaidDiagram.displayName = "MermaidDiagram";

// --- WIDGET REGISTRY ---
const widgetRegistry: Record<string, React.ComponentType<any>> = {
  roadmap: AIRoadmap,
  comparison: CompanyComparison,
  timeline: Timeline,
  progress: ProgressCard,
  checklist: Checklist,
  skilltree: SkillTree,
  recommendations: RecommendationCard,
  insight: InsightCard,
  expandable: ExpandableSection,
  radar: RadarChart,
  heatmap: ResumeHeatmap,
  pipeline: InterviewPipeline,
  careerjourney: CareerJourney,
  mindmap: MindMap,
  flow: FlowDiagram
};

const reservedWidgets = new Set([
  "whiteboard", "resume", "careerpath", "dashboard", "kanban", "calendar", "chart"
]);

// --- UNIFIED WIDGET RENDERER ---
export const WidgetRenderer = memo(({ rawJson, isStreaming }: { rawJson: string; isStreaming: boolean }) => {
  const cleanJsonStr = rawJson.trim();
  const isFinished = !isStreaming && cleanJsonStr.endsWith("}");

  const parsedData = useMemo(() => {
    if (!isFinished) return null;
    try {
      const parsed = JSON.parse(cleanJsonStr);
      if (parsed && (parsed.schema === "placementai-widget" || parsed.schema === "placementai-widget-container")) {
        return parsed;
      }
      return { error: "Missing schema validation header" };
    } catch (e: any) {
      return { error: `JSON Parse error: ${e.message}` };
    }
  }, [cleanJsonStr, isFinished]);

  if (isStreaming || !isFinished) {
    return <WidgetSkeleton />;
  }

  if (parsedData && parsedData.error) {
    return (
      <div className="relative my-4 w-full">
        <pre className="bg-zinc-950 text-zinc-50 p-5 rounded-xl overflow-x-auto text-[13px] font-mono leading-relaxed shadow-md border border-white/5 w-full">
          <code>{cleanJsonStr}</code>
        </pre>
        <span className="text-[10px] text-rose-500 font-bold block mt-1.5">✕ Fallback (Invalid JSON Widget Format: {parsedData.error})</span>
      </div>
    );
  }

  if (parsedData.schema === "placementai-widget-container") {
    const widgetsList = parsedData.widgets || [];
    return (
      <div className="w-full flex flex-col gap-4 my-4">
        {widgetsList.map((w: any, index: number) => {
          const WidgetComponent = widgetRegistry[w.type];
          if (!WidgetComponent) {
            if (reservedWidgets.has(w.type)) {
              return (
                <div key={index} className="p-4 my-2 border border-dashed rounded-xl bg-muted/20 text-muted-foreground text-xs flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider">⚡ {w.title || w.type} Widget (V3 Integration Ready)</span>
                  <Badge variant="outline" className="text-[9px] uppercase">Coming Soon</Badge>
                </div>
              );
            }
            return (
              <div key={index} className="relative w-full">
                <span className="text-[10px] text-amber-500 font-bold block mb-1">⚠ Fallback (Widget type &apos;{w.type}&apos; not registered)</span>
                <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-xl overflow-x-auto text-xs font-mono border border-white/5 w-full">
                  <code>{JSON.stringify(w, null, 2)}</code>
                </pre>
              </div>
            );
          }
          return (
            <WidgetErrorBoundary key={index} fallbackType={w.type}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <WidgetComponent data={w.data} />
              </motion.div>
            </WidgetErrorBoundary>
          );
        })}
      </div>
    );
  }

  const WidgetComponent = widgetRegistry[parsedData.type];

  if (!WidgetComponent) {
    return (
      <div className="relative my-4 w-full">
        <pre className="bg-zinc-950 text-zinc-50 p-5 rounded-xl overflow-x-auto text-[13px] font-mono leading-relaxed border border-white/5 w-full">
          <code>{JSON.stringify(parsedData, null, 2)}</code>
        </pre>
        <span className="text-[10px] text-amber-500 font-bold block mt-1.5">⚠ Fallback (Widget type &apos;{parsedData.type}&apos; not registered)</span>
      </div>
    );
  }

  return (
    <WidgetErrorBoundary fallbackType={parsedData.type}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <WidgetComponent data={parsedData.data} />
      </motion.div>
    </WidgetErrorBoundary>
  );
});
WidgetRenderer.displayName = "WidgetRenderer";
