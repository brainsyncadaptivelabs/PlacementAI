import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, Circle, Link2, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { WidgetCard } from "../shared/WidgetCard";
import { WidgetHeader } from "../shared/WidgetHeader";
import { WidgetSection } from "../shared/WidgetSection";
import { WidgetToolbar } from "../shared/WidgetToolbar";
import { widgetExpand } from "../shared/WidgetAnimations";
import { logWidgetAnalytics } from "@/components/chat/Widgets";

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
        const nextStatus: "completed" | "in_progress" | "locked" = s.status === "completed" ? "in_progress" : s.status === "in_progress" ? "locked" : "completed";
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
    <WidgetCard>
      <WidgetHeader 
        title={data.title || "Interactive Skill Tree"} 
        description="Explore requirements, prerequisites, and resource nodes"
        icon={<Sparkles className="w-4 h-4" />}
        action={
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
        }
      />
      <WidgetSection className="pb-0 bg-muted/10 border-b border-border/40">
        <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground bg-card p-3 border rounded-xl mb-3">
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

        <div className="relative mb-3">
          <input 
            type="text" 
            placeholder="Search skill..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
          />
        </div>
      </WidgetSection>

      <WidgetSection className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
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
                    {isExpanded ? <ChevronUp className="w-4.5 h-4.5 text-muted-foreground" /> : <ChevronDown className="w-4.5 h-4.5 text-muted-foreground/60" />}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      {...widgetExpand}
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
      </WidgetSection>
      <WidgetToolbar widgetId="skilltree" widgetType="skilltree" copyContent={JSON.stringify(skills, null, 2)} />
    </WidgetCard>
  );
});
SkillTree.displayName = "SkillTree";
export default SkillTree;
