import React, { useState, useEffect, useMemo, memo } from "react";
import { Building2, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WidgetCard } from "../shared/WidgetCard";
import { WidgetHeader } from "../shared/WidgetHeader";
import { WidgetSection } from "../shared/WidgetSection";
import { WidgetToolbar } from "../shared/WidgetToolbar";
import { logWidgetAnalytics } from "@/components/chat/Widgets";

export interface CompanyData {
  name: string;
  package: string;
  process: string;
  difficulty: "Easy" | "Medium" | "Hard";
  eligibility: string;
  topics: string[];
}

export const CompanyComparison = memo(({ data }: { data: any }) => {
  const [sortField, setSortField] = useState<"name" | "package" | "difficulty">("name");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    logWidgetAnalytics({ widgetType: "comparison", action: "rendered" });
  }, []);

  // Check if this payload is an ATS Resume Strengths/Weaknesses analysis instead of company comparison
  const isResumeAnalysis = Boolean(
    Array.isArray(data?.strengths) ||
    Array.isArray(data?.weaknesses) ||
    Array.isArray(data?.recommendations) ||
    (!Array.isArray(data?.companies) && data?.score !== undefined)
  );

  const companies: CompanyData[] = Array.isArray(data?.companies) ? data.companies : [];

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
    if (!companies.length) return [];
    return [...companies].sort((a, b) => {
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
  }, [companies, sortField, sortAsc]);

  if (isResumeAnalysis) {
    const score = typeof data?.score === "number" ? data.score : 0;
    const strengths: string[] = Array.isArray(data?.strengths) ? data.strengths : [];
    const weaknesses: string[] = Array.isArray(data?.weaknesses) ? data.weaknesses : [];
    const recommendations: string[] = Array.isArray(data?.recommendations) ? data.recommendations : [];

    return (
      <WidgetCard>
        <WidgetHeader 
          title="ATS Resume Improvements" 
          description="Detailed breakdown of profile strengths and target gaps"
          icon={<Building2 className="w-4 h-4" />}
          action={
            <Badge className={score >= 70 ? "bg-emerald-600 text-white" : score > 0 ? "bg-amber-600 text-white" : "bg-rose-600 text-white"}>
              ATS Score: {score}%
            </Badge>
          }
        />
        <WidgetSection className="space-y-4 p-4">
          {strengths.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1.5 uppercase tracking-wide">
                <CheckCircle2 className="w-3.5 h-3.5" /> Strengths Detected
              </span>
              <div className="space-y-1">
                {strengths.map((item, idx) => (
                  <div key={idx} className="text-xs bg-emerald-500/5 border border-emerald-500/15 rounded-lg px-3 py-2 text-foreground">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {weaknesses.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1.5 uppercase tracking-wide">
                <AlertTriangle className="w-3.5 h-3.5" /> Priority Improvements
              </span>
              <div className="space-y-1">
                {weaknesses.map((item, idx) => (
                  <div key={idx} className="text-xs bg-amber-500/5 border border-amber-500/15 rounded-lg px-3 py-2 text-foreground">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-1.5 uppercase tracking-wide">
                <Lightbulb className="w-3.5 h-3.5" /> Recommended Actions
              </span>
              <div className="space-y-1">
                {recommendations.map((item, idx) => (
                  <div key={idx} className="text-xs bg-indigo-500/5 border border-indigo-500/15 rounded-lg px-3 py-2 text-foreground">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </WidgetSection>
        <WidgetToolbar widgetId="comparison" widgetType="comparison" copyContent={JSON.stringify(data, null, 2)} />
      </WidgetCard>
    );
  }

  return (
    <WidgetCard>
      <WidgetHeader 
        title="Company Comparison" 
        description="Compare recruiting metrics and criteria side-by-side"
        icon={<Building2 className="w-4 h-4" />}
      />
      <WidgetSection className="p-0 overflow-x-auto">
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
                      {(comp.topics || []).slice(0, 3).map((topic, tIdx) => (
                        <Badge key={tIdx} variant="secondary" className="text-[9px] px-1.5 py-0">
                          {topic}
                        </Badge>
                      ))}
                      {(comp.topics || []).length > 3 && (
                        <span className="text-[9px] text-muted-foreground/60 font-semibold ml-0.5 font-sans">+{(comp.topics || []).length - 3}</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </WidgetSection>
      <WidgetToolbar widgetId="comparison" widgetType="comparison" copyContent={JSON.stringify(data, null, 2)} />
    </WidgetCard>
  );
});
CompanyComparison.displayName = "CompanyComparison";
export default CompanyComparison;
