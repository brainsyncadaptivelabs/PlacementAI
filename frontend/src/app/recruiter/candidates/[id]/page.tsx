"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2, ArrowLeft, Star, Download, Calendar, MessageSquare,
  Target, Code2, Brain, TrendingUp, Shield, Sparkles, FileText,
  Activity, BookOpen, Building2, BarChart3, Award, Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { toast } from "sonner";

const TABS = [
  { id: "overview",       label: "Overview",        icon: BarChart3 },
  { id: "ats",            label: "ATS",             icon: Target },
  { id: "coding",         label: "Coding",          icon: Code2 },
  { id: "interview",      label: "Interview",       icon: Brain },
  { id: "company",        label: "Company Fit",     icon: Building2 },
  { id: "risk",           label: "Risk Analysis",   icon: Shield },
  { id: "ai",             label: "AI Summary",      icon: Sparkles },
  { id: "notes",          label: "Notes",           icon: MessageSquare },
];

const BAND_GRADIENT: Record<string, string> = {
  "Platinum":          "from-slate-400 to-slate-600",
  "Gold":              "from-amber-400 to-amber-600",
  "Silver":            "from-zinc-300 to-zinc-500",
  "Needs Improvement": "from-rose-400 to-rose-600",
};

function ScoreGauge({ score, label, color }: { score: number; label: string; color: string }) {
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const dash = (Math.min(score, 100) / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 84 84">
          <circle cx="42" cy="42" r={radius} fill="none" strokeWidth="7" className="stroke-muted/50" />
          <circle cx="42" cy="42" r={radius} fill="none" strokeWidth="7"
            stroke={color} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black" style={{ color }}>{score}</span>
          <span className="text-[9px] text-muted-foreground font-medium">/ 100</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-muted-foreground text-center">{label}</span>
    </div>
  );
}

function NotePanel({ studentId }: { studentId: string }) {
  const [notes, setNotes] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const TAG_SUGGESTIONS = [
    "Excellent Java", "Strong Spring", "Weak DSA", "Leadership",
    "Good Communication", "Strong Frontend", "System Design", "Fast Learner"
  ];

  useEffect(() => {
    api.get(`/recruiter/candidates/${studentId}/notes`)
      .then(r => setNotes(r.data))
      .catch(() => {});
  }, [studentId]);

  const saveNote = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await api.post(`/recruiter/notes/students/${studentId}`, {
        content, rating, tags, isPrivate: true,
      });
      setNotes(prev => [res.data, ...prev]);
      setContent(""); setRating(0); setTags([]);
      toast.success("Note saved");
    } catch {
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (t: string) =>
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-foreground">Add Note</h3>
      {/* Star Rating */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n}
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(n)}
          >
            <Star className={`w-6 h-6 transition-colors ${
              n <= (hoverRating || rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground"
            }`} />
          </button>
        ))}
      </div>
      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {TAG_SUGGESTIONS.map(t => (
          <button key={t}
            onClick={() => toggleTag(t)}
            className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all border ${
              tags.includes(t)
                ? "bg-primary text-white border-primary"
                : "bg-muted text-muted-foreground border-border hover:border-primary/50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {/* Textarea */}
      <textarea
        className="w-full border border-border rounded-xl bg-card text-foreground text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-primary h-24"
        placeholder="Write your private note about this candidate..."
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <Button onClick={saveNote} disabled={saving || !content.trim()} className="bg-primary text-white w-full">
        {saving ? "Saving..." : "Save Note"}
      </Button>

      {/* Past notes */}
      {notes.length > 0 && (
        <div className="space-y-3 mt-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Previous Notes</h4>
          {notes.map(n => (
            <div key={n.id} className="bg-muted/40 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-3 h-3 ${s <= (n.rating||0) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              {n.tags?.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {n.tags.map((t: string) => (
                    <span key={t} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">{t}</span>
                  ))}
                </div>
              )}
              <p className="text-sm text-foreground">{n.content}</p>
              <p className="text-[10px] text-muted-foreground">{n.createdAt ? new Date(n.createdAt).toLocaleString("en-IN") : ""}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CandidateProfilePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [candidate, setCandidate] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/recruiter/candidates/${id}/intelligence`),
      api.get(`/recruiter/candidates/${id}/profile`),
    ]).then(([intelRes, profileRes]) => {
      setData(intelRes.data);
      setCandidate(profileRes.data);
    }).catch(() => {
      toast.error("Failed to load candidate profile.");
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Loading intelligence profile...</p>
        </div>
      </div>
    );
  }

  if (!data || !candidate) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Candidate not found.</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const band = candidate.candidateBand || "Silver";
  const gradient = BAND_GRADIENT[band] || BAND_GRADIENT["Silver"];

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      {/* Back */}
      <Button variant="ghost" onClick={() => router.back()} className="-ml-2 text-muted-foreground hover:text-foreground gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Candidates
      </Button>

      {/* Hero Card */}
      <Card className={`border-0 overflow-hidden bg-gradient-to-br ${gradient} text-white shadow-xl`}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black backdrop-blur-sm">
                {candidate.name?.charAt(0) || "?"}
              </div>
              <div>
                <h1 className="text-2xl font-black leading-tight">{candidate.name}</h1>
                <p className="text-white/80 text-sm mt-0.5">
                  {candidate.branch} • {candidate.collegeName} • Class of {candidate.graduationYear}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-white/90 text-sm font-semibold bg-white/20 px-2.5 py-0.5 rounded-full">{band}</span>
                  <span className="text-white/70 text-sm">{candidate.expectedSalary || "—"} expected</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/20 gap-2 bg-transparent">
                <Calendar className="w-4 h-4" /> Schedule Interview
              </Button>
              <Button className="bg-white text-gray-900 hover:bg-white/90 font-bold gap-2">
                <Briefcase className="w-4 h-4" /> Shortlist
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scores Row */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-around flex-wrap gap-6">
            <ScoreGauge score={data.overallPlacementReadiness} label="PlacementAI Readiness" color="#6366f1" />
            <ScoreGauge score={data.atsScore} label="ATS Score" color="#10b981" />
            <ScoreGauge score={data.codingScore} label="Coding" color="#f59e0b" />
            <ScoreGauge score={data.jdMatch} label="JD Match" color="#3b82f6" />
            <ScoreGauge score={data.hiringProbability} label="Hiring Probability" color="#8b5cf6" />
          </div>
        </CardContent>
      </Card>

      {/* Tab Nav + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tab Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-border bg-card sticky top-6">
            <CardContent className="p-2">
              <nav className="space-y-0.5">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                      activeTab === tab.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="w-4 h-4 shrink-0" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3 space-y-4">
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-emerald-200 dark:border-emerald-900/50 bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {(data.candidateStrengths || []).map((s: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span className="text-foreground">{s}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card className="border-amber-200 dark:border-amber-900/50 bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-amber-600 dark:text-amber-400 flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Areas to Improve
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {(data.weaknesses || []).map((w: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span className="text-foreground">{w}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
              {/* Improvement Plan */}
              {data.improvementPlan && (
                <Card className="border-border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" /> Improvement Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed">{data.improvementPlan}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "ats" && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-emerald-500" /> ATS Intelligence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-black text-emerald-500">{data.atsScore}</div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">ATS Score</div>
                    <div className="text-xs text-muted-foreground">Resume keyword optimization rating</div>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Score Breakdown</h4>
                  {[
                    ["Keyword Match", Math.min(100, data.atsScore + 5)],
                    ["Format Quality", Math.min(100, data.atsScore - 3)],
                    ["Section Completeness", Math.min(100, data.atsScore + 2)],
                    ["Action Verbs", Math.min(100, data.atsScore - 7)],
                  ].map(([label, val]) => (
                    <div key={String(label)} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-40 shrink-0">{label}</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${val}%` }} />
                      </div>
                      <span className="text-sm font-bold text-foreground w-8 text-right">{val}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "coding" && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Code2 className="w-5 h-5 text-amber-500" /> Coding Intelligence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-black text-amber-500">{data.codingScore}</div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">Coding Score</div>
                    <div className="text-xs text-muted-foreground">Based on LeetCode performance and DSA skills</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Easy", val: Math.min(50, Math.floor(data.codingScore / 2)), color: "text-emerald-500" },
                    { label: "Medium", val: Math.min(30, Math.floor(data.codingScore / 3)), color: "text-amber-500" },
                    { label: "Hard", val: Math.min(10, Math.floor(data.codingScore / 10)), color: "text-rose-500" },
                  ].map(item => (
                    <div key={item.label} className="bg-muted/50 rounded-xl p-4 text-center">
                      <div className={`text-2xl font-black ${item.color}`}>{item.val}</div>
                      <div className="text-xs text-muted-foreground mt-1">{item.label} Solved</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "interview" && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5 text-blue-500" /> Mock Interview Intelligence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-black text-blue-500">{data.communicationScore}</div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">Communication Score</div>
                    <div className="text-xs text-muted-foreground">Based on mock interview sessions</div>
                  </div>
                </div>
                {data.hiringRecommendation && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">{data.hiringRecommendation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "company" && (
            <div className="space-y-3">
              {Object.entries(data.companyReadiness || {}).map(([company, score]) => (
                <Card key={company} className="border-border bg-card">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-sm font-bold text-foreground">
                      {company.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{company}</div>
                      <div className="flex-1 bg-muted rounded-full h-2 mt-1.5">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${score}%` }} />
                      </div>
                    </div>
                    <div className={`text-lg font-black ${Number(score) >= 80 ? "text-emerald-500" : Number(score) >= 65 ? "text-amber-500" : "text-rose-500"}`}>
                      {String(score)}%
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "risk" && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-rose-500" /> Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(data.riskAnalysis || []).length === 0 ? (
                  <p className="text-muted-foreground text-sm">No significant risk factors identified.</p>
                ) : (
                  (data.riskAnalysis || []).map((risk: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-3">
                      <Shield className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-rose-700 dark:text-rose-300">{risk}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "ai" && (
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> AI Intelligence Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-foreground">{data.aiSummary}</p>
                {data.hiringRecommendation && (
                  <div className="bg-background border border-border rounded-xl p-4">
                    <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Hiring Recommendation</div>
                    <p className="text-sm font-medium text-foreground">{data.hiringRecommendation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "notes" && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" /> Recruiter Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <NotePanel studentId={id} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
