import React from "react";
import { Folder, Code, Compass } from "lucide-react";

export function ProjectMentor() {
  return (
    <div className="p-5 bg-slate-900 border border-border/80 rounded-2xl text-left select-none space-y-4">
      <div className="flex items-center gap-2 mb-2 border-b border-border/20 pb-3">
        <Compass className="w-5 h-5 text-indigo-400" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-white">AI Project Mentor</h2>
      </div>

      <div className="space-y-3">
        <div>
          <span className="text-[9px] uppercase font-bold text-indigo-400">Target Project</span>
          <h3 className="text-xs font-bold text-slate-100">Java Spring Boot Multimodal File Routing Engine</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-950/40 border border-border/10 rounded-xl space-y-1.5">
            <span className="text-[9px] uppercase font-bold text-muted-foreground">Folder Structure Blueprint</span>
            <pre className="text-[10px] font-mono text-indigo-400 bg-transparent p-0 m-0">
{`src/main/java/com/aiplacement/
  ├── ai/
  │    ├── multimodal/
  │    │    ├── ResumeAnalyzer.java
  │    │    └── MultimodalRouter.java
  │    └── cache/
  │         └── AnalysisCacheService.java`}
            </pre>
          </div>

          <div className="p-3 bg-slate-950/40 border border-border/10 rounded-xl space-y-1.5">
            <span className="text-[9px] uppercase font-bold text-muted-foreground">Resume Bullet Suggestion</span>
            <p className="text-[11px] text-slate-350 italic">
              "Designed a thread-safe ConcurrentHashMap analysis caching system in Java Spring Boot, reducing redundant LLM parsing calls by 45% and ensuring O(1) response retrievals."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
