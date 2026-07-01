"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, SlidersHorizontal, Sparkles, Loader2, Star,
  Brain, Code2, Target, ChevronRight, X, GraduationCap,
  Trophy, TrendingUp, AlertCircle, ChevronDown
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";

interface Candidate {
  id: number;
  name: string;
  email: string;
  branch: string;
  collegeName: string;
  graduationYear: number;
  skills: string;
  profileImage: string;
  readinessScore: number;
  atsScore: number;
  codingScore: number;
  jdMatchScore: number;
  hiringProbability: number;
  expectedSalary: string;
  candidateBand: string;
  aiSummary: string;
}

const BAND_STYLES: Record<string, string> = {
  "Platinum":         "bg-gradient-to-r from-slate-300 to-slate-500 text-white",
  "Gold":             "bg-gradient-to-r from-amber-400 to-amber-600 text-white",
  "Silver":           "bg-gradient-to-r from-zinc-300 to-zinc-500 text-white",
  "Needs Improvement":"bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

const SORT_OPTIONS = [
  { value: "READINESS",  label: "Highest Readiness" },
  { value: "ATS",        label: "Highest ATS" },
  { value: "CODING",     label: "Highest Coding" },
  { value: "INTERVIEW",  label: "Highest Hiring Prob." },
];

const SCORE_COLORS = (score: number) =>
  score >= 85 ? "text-emerald-500" :
  score >= 70 ? "text-amber-500" : "text-rose-500";

export default function CandidateExplorer() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("READINESS");
  const [search, setSearch] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchCandidates = useCallback(async (reset = false) => {
    const currentPage = reset ? 0 : page;
    try {
      if (reset) setLoading(true);
      const params = new URLSearchParams({
        sortBy,
        page: String(currentPage),
        size: "20",
        ...(search     && { search }),
        ...(college    && { college }),
        ...(department && { department }),
        ...(gradYear   && { graduationYear: gradYear }),
      });
      const res = await api.get(`/recruiter/candidates?${params}`);
      const data: Candidate[] = res.data;
      if (reset) {
        setCandidates(data);
        setPage(1);
      } else {
        setCandidates(prev => [...prev, ...data]);
        setPage(p => p + 1);
      }
      setHasMore(data.length === 20);
    } catch {
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  }, [search, college, department, gradYear, sortBy, page]);

  useEffect(() => {
    fetchCandidates(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, college, department, gradYear, sortBy]);

  const ScoreBar = ({ label, score, icon: Icon }: { label: string; score: number; icon: any }) => (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            score >= 85 ? "bg-emerald-500" : score >= 70 ? "bg-amber-500" : "bg-rose-500"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-xs font-bold w-7 text-right ${SCORE_COLORS(score)}`}>{score}</span>
    </div>
  );

  const ReadinessRing = ({ score, band }: { score: number; band: string }) => {
    const color = score >= 85 ? "#10b981" : score >= 70 ? "#f59e0b" : "#f43f5e";
    const radius = 20;
    const circ = 2 * Math.PI * radius;
    const dash = (score / 100) * circ;
    return (
      <div className="relative w-14 h-14 shrink-0">
        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/50" />
          <circle cx="24" cy="24" r={radius} fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-black" style={{ color }}>{score}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight font-heading">Candidate Explorer</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Discover top talent using PlacementAI Intelligence. {candidates.length > 0 && `${candidates.length}+ candidates`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2 rounded-xl border-border"
            onClick={() => setFilterOpen(f => !f)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {(college || department || gradYear) && (
              <span className="w-2 h-2 rounded-full bg-primary ml-1" />
            )}
          </Button>
        </div>
      </div>

      {/* Search + Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, skill, college..."
            className="pl-9 bg-card border-border rounded-xl"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                sortBy === opt.value
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Panel */}
      {filterOpen && (
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Advanced Filters</h3>
              <button
                onClick={() => { setCollege(""); setDepartment(""); setGradYear(""); }}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear all
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">College</label>
                <Input
                  placeholder="e.g., IIT, NIT..."
                  value={college}
                  onChange={e => setCollege(e.target.value)}
                  className="bg-background border-border text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Department</label>
                <Input
                  placeholder="e.g., CSE, ECE..."
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="bg-background border-border text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Graduation Year</label>
                <Input
                  type="number"
                  placeholder="e.g., 2025"
                  value={gradYear}
                  onChange={e => setGradYear(e.target.value)}
                  className="bg-background border-border text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Candidate List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground text-sm">Loading candidates...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {candidates.length === 0 ? (
            <div className="text-center py-20 bg-card border border-border rounded-2xl">
              <GraduationCap className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No candidates found matching your filters.</p>
            </div>
          ) : (
            candidates.map(candidate => (
              <Link href={`/recruiter/candidates/${candidate.id}`} key={candidate.id}>
                <Card className="hover:border-primary/40 hover:shadow-md transition-all cursor-pointer bg-card border-border group">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-5">
                      {/* Avatar + Ring */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <ReadinessRing score={candidate.readinessScore} band={candidate.candidateBand} />
                        <span className="text-[9px] text-muted-foreground">Readiness</span>
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-lg text-foreground leading-tight">{candidate.name}</h3>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BAND_STYLES[candidate.candidateBand] || BAND_STYLES["Needs Improvement"]}`}>
                                {candidate.candidateBand}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {candidate.branch || "—"} • {candidate.collegeName || "—"} • Class of {candidate.graduationYear || "—"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">Expected CTC</div>
                              <div className="text-sm font-bold text-foreground">{candidate.expectedSalary || "—"}</div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <ChevronRight className="w-4 h-4 text-primary" />
                            </div>
                          </div>
                        </div>

                        {/* Score bars */}
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-1.5">
                          <ScoreBar label="ATS" score={candidate.atsScore} icon={Target} />
                          <ScoreBar label="Coding" score={candidate.codingScore} icon={Code2} />
                          <ScoreBar label="Hiring Prob." score={candidate.hiringProbability} icon={TrendingUp} />
                        </div>

                        {/* Skills */}
                        {candidate.skills && (
                          <div className="flex gap-1.5 mt-3 flex-wrap">
                            {candidate.skills.split(",").slice(0, 5).map(s => (
                              <Badge key={s} variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20 py-0 px-2">
                                {s.trim()}
                              </Badge>
                            ))}
                            {candidate.skills.split(",").length > 5 && (
                              <span className="text-[10px] text-muted-foreground self-center">+{candidate.skills.split(",").length - 5} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}

          {/* Load More */}
          {hasMore && candidates.length > 0 && (
            <div className="text-center pt-2">
              <Button
                variant="outline"
                onClick={() => fetchCandidates(false)}
                className="border-border gap-2"
              >
                <ChevronDown className="w-4 h-4" /> Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
