import React, { useState, useEffect, useMemo, memo } from "react";
import { Building2 } from "lucide-react";
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
                      {comp.topics.slice(0, 3).map((topic, tIdx) => (
                        <Badge key={tIdx} variant="secondary" className="text-[9px] px-1.5 py-0">
                          {topic}
                        </Badge>
                      ))}
                      {comp.topics.length > 3 && (
                        <span className="text-[9px] text-muted-foreground/60 font-semibold ml-0.5 font-sans">+{comp.topics.length - 3}</span>
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
