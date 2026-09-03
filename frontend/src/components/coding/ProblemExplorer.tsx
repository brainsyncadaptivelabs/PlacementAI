"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, CheckCircle2, Circle, Sparkles, Building2, Clock, Zap } from "lucide-react";

export interface ProblemItem {
  id: number;
  title: string;
  difficulty: string; // Easy, Medium, Hard
  acceptanceRate: number;
  tags: string[];
  solved?: boolean;
  attempted?: boolean;
  companyTags?: string[];
  xp?: number;
  estimatedTimeMinutes?: number;
}

interface ProblemExplorerProps {
  problems: ProblemItem[];
  isLoading: boolean;
  onSelectProblem: (problemId: number) => void;
  selectedTopicFilter?: string;
}

export default function ProblemExplorer({
  problems,
  isLoading,
  onSelectProblem,
  selectedTopicFilter = ""
}: ProblemExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [selectedCompany, setSelectedCompany] = useState<string>("ALL");
  const [selectedTopic, setSelectedTopic] = useState<string>(selectedTopicFilter);

  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDiff =
      selectedDifficulty === "ALL" || p.difficulty.toUpperCase() === selectedDifficulty.toUpperCase();

    const matchesTopic =
      !selectedTopic || p.tags.some((t) => t.toLowerCase() === selectedTopic.toLowerCase());

    const matchesCompany =
      selectedCompany === "ALL" || (p.companyTags && p.companyTags.includes(selectedCompany));

    return matchesSearch && matchesDiff && matchesTopic && matchesCompany;
  });

  return (
    <div className="space-y-6">
      {/* Search Bar & Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-card/40 backdrop-blur p-4 rounded-xl border border-border/50">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search problem title, topic, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50 border-border/60"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Difficulty Filter */}
          <div className="flex bg-background/60 p-1 rounded-lg border border-border/60 text-xs font-medium">
            {["ALL", "EASY", "MEDIUM", "HARD"].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1.5 rounded-md transition ${
                  selectedDifficulty === diff
                    ? "bg-primary text-primary-foreground font-semibold shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Company Filter */}
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="h-9 px-3 text-xs bg-background/60 border border-border/60 rounded-lg text-foreground font-medium focus:outline-none"
          >
            <option value="ALL">All Companies</option>
            <option value="Amazon">Amazon</option>
            <option value="Google">Google</option>
            <option value="Microsoft">Microsoft</option>
            <option value="TCS">TCS</option>
            <option value="Infosys">Infosys</option>
          </select>
        </div>
      </div>

      {/* Problems Table */}
      <Card className="bg-card/40 backdrop-blur border-border/50 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">Status</th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4">Acceptance</th>
                  <th className="py-3.5 px-4">Topics</th>
                  <th className="py-3.5 px-4">Companies</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      Loading problem bank...
                    </td>
                  </tr>
                ) : filteredProblems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      No problems matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProblems.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => onSelectProblem(p.id)}
                      className="hover:bg-muted/40 transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 text-center">
                        {p.solved ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-foreground group-hover:text-primary transition-colors">
                        {p.title}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                            p.difficulty.toLowerCase() === "easy"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : p.difficulty.toLowerCase() === "hard"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {p.difficulty}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground font-mono text-xs">
                        {p.acceptanceRate}%
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {p.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-2 py-0.5 bg-secondary/60 text-secondary-foreground rounded border border-border/40"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(p.companyTags || ["Amazon", "Google"]).slice(0, 2).map((comp) => (
                            <span
                              key={comp}
                              className="text-[10px] px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded border border-purple-500/20 flex items-center gap-1"
                            >
                              <Building2 className="w-2.5 h-2.5" /> {comp}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                        >
                          Solve
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
