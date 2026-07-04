import React, { useState, useEffect } from "react";
import { Download, FileText, ArrowRight, Folder } from "lucide-react";

export type SavedArtifact = {
  id: string;
  title: string;
  type: string;
  createdAt: number;
  tags?: string[];
};

export function SavedArtifacts() {
  const [artifacts, setArtifacts] = useState<SavedArtifact[]>([]);

  useEffect(() => {
    const list = [
      { id: "art-1", title: "Amazon Java SDE Tailored Roadmap", type: "Roadmap", createdAt: Date.now() - 3600000, tags: ["Java", "Amazon"] },
      { id: "art-2", title: "Standard ATS Resume Feedback Report", type: "ATS Review", createdAt: Date.now() - 86400000, tags: ["ATS", "Resume"] },
      { id: "art-3", title: "SOLID Patterns Refactoring Review", type: "Code Review", createdAt: Date.now() - 259200000, tags: ["SOLID", "Refactor"] }
    ];
    setArtifacts(list);
  }, []);

  const handleExport = (art: SavedArtifact, format: string) => {
    const blob = new Blob([JSON.stringify(art, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${art.title.toLowerCase().replace(/\s+/g, "_")}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto bg-[#0d1117] text-left select-none max-w-[1200px] mx-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Saved Artifacts</h2>
          <p className="text-xs text-muted-foreground font-medium mt-1">Access all saved roadmaps, ATS reviews, and code evaluations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {artifacts.length === 0 ? (
          <div className="col-span-3 text-center py-8 text-xs text-muted-foreground">No artifacts saved yet. Close the loop by clicking bookmark/save on response widgets!</div>
        ) : (
          artifacts.map((art) => (
            <div key={art.id} className="p-4 bg-slate-900 border border-border/80 rounded-2xl flex flex-col justify-between hover:border-indigo-500/40 transition-all group">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">{art.type}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">{art.title}</h3>
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {art.tags?.map((t) => (
                    <span key={t} className="text-[9px] font-semibold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-border/20 pt-3 mt-4">
                <span className="text-[9px] text-muted-foreground">Saved {new Date(art.createdAt).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleExport(art, "json")}
                    className="p-1 rounded bg-slate-800 text-muted-foreground hover:text-white transition-colors cursor-pointer text-[10px] font-bold"
                  >
                    Export JSON
                  </button>
                  <button 
                    onClick={() => handleExport(art, "txt")}
                    className="p-1 rounded bg-slate-800 text-muted-foreground hover:text-white transition-colors cursor-pointer text-[10px] font-bold"
                  >
                    Export TXT
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
