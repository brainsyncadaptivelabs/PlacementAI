import React from "react";
import { Folder, Code, Compass } from "lucide-react";

export function ProjectMentor() {
  return (
    <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs text-left select-none space-y-4">
      <div className="flex items-center gap-2 mb-2 border-b border-slate-200/80 pb-3">
        <Compass className="w-5 h-5 text-indigo-600" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">AI Project Mentor</h2>
      </div>

      <div className="space-y-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Target Project</span>
          <h3 className="text-xs font-bold text-slate-900 mt-0.5">Java Spring Boot Multimodal File Routing Engine</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-2 shadow-2xs min-w-0 overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-slate-700 tracking-wider">Folder Structure Blueprint</span>
            <pre className="text-[11px] font-mono text-slate-800 bg-white p-3 rounded-lg border border-slate-200/70 overflow-x-auto max-w-full leading-relaxed">
{`src/main/java/com/aiplacement/
  ├── ai/
  │    ├── multimodal/
  │    │    ├── ResumeAnalyzer.java
  │    │    └── MultimodalRouter.java
  │    └── cache/
  │         └── AnalysisCacheService.java`}
            </pre>
          </div>

          <div className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-2 shadow-2xs min-w-0 overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-slate-700 tracking-wider">Resume Bullet Suggestion</span>
            <p className="text-xs text-slate-800 font-medium italic bg-white p-3 rounded-lg border border-slate-200/70 leading-relaxed break-words">
              "Designed a thread-safe ConcurrentHashMap analysis caching system in Java Spring Boot, reducing redundant LLM parsing calls by 45% and ensuring O(1) response retrievals."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
