"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Star, MoreHorizontal, ChevronDown, Loader2,
  Target, Code2, TrendingUp, Users, Briefcase
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";

const STAGE_META: Record<string, { label: string; color: string; bg: string }> = {
  APPLIED:    { label: "Applied",         color: "text-slate-600",   bg: "bg-slate-100 dark:bg-slate-800/50" },
  SHORTLISTED:{ label: "Shortlisted",     color: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-900/20" },
  ATS_PASSED: { label: "ATS Passed",      color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  JD_MATCHED: { label: "JD Matched",      color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-900/20" },
  CODING:     { label: "Coding Round",    color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-900/20" },
  TECHNICAL:  { label: "Technical",       color: "text-orange-600",  bg: "bg-orange-50 dark:bg-orange-900/20" },
  MANAGER:    { label: "Manager Round",   color: "text-pink-600",    bg: "bg-pink-50 dark:bg-pink-900/20" },
  HR:         { label: "HR Round",        color: "text-indigo-600",  bg: "bg-indigo-50 dark:bg-indigo-900/20" },
  OFFER:      { label: "Offer Extended",  color: "text-teal-600",    bg: "bg-teal-50 dark:bg-teal-900/20" },
  JOINED:     { label: "Joined",          color: "text-green-700",   bg: "bg-green-50 dark:bg-green-900/20" },
  REJECTED:   { label: "Rejected",        color: "text-rose-600",    bg: "bg-rose-50 dark:bg-rose-900/20" },
};

const BAND_PILL: Record<string, string> = {
  "Platinum":          "bg-gradient-to-r from-slate-300 to-slate-500 text-white",
  "Gold":              "bg-gradient-to-r from-amber-400 to-amber-600 text-white",
  "Silver":            "bg-gradient-to-r from-zinc-300 to-zinc-500 text-white",
  "Needs Improvement": "bg-zinc-100 text-zinc-600",
};

interface Job { id: number; title: string; status: string; }
interface Application {
  applicationId: number;
  studentId: number;
  studentName: string;
  collegeName: string;
  branch: string;
  atsScore: number;
  codingScore: number;
  readinessScore: number;
  hiringProbability: number;
  candidateBand: string;
  status: string;
}
interface PipelineData {
  jobId: number;
  jobTitle: string;
  columns: Record<string, Application[]>;
  columnOrder: string[];
}

export default function HiringPipeline() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [pipeline, setPipeline] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(false);
  const [movingId, setMovingId] = useState<number | null>(null);

  useEffect(() => {
    api.get("/recruiter/jobs").then(r => {
      const active = r.data.filter((j: Job) => j.status === "ACTIVE" || j.status === "CLOSED");
      setJobs(r.data);
      if (active.length > 0) loadPipeline(active[0].id);
      else if (r.data.length > 0) loadPipeline(r.data[0].id);
    }).catch(() => toast.error("Failed to load jobs"));
  }, []);

  const loadPipeline = async (jobId: number) => {
    setSelectedJobId(jobId);
    setLoading(true);
    try {
      const res = await api.get(`/recruiter/pipeline/jobs/${jobId}`);
      setPipeline(res.data);
    } catch {
      toast.error("Failed to load pipeline");
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination || !pipeline) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const srcStage = source.droppableId;
    const dstStage = destination.droppableId;
    const appId = Number(draggableId);

    // Optimistic update
    const newCols = { ...pipeline.columns };
    const srcArr = [...(newCols[srcStage] || [])];
    const dstArr = srcStage === dstStage ? srcArr : [...(newCols[dstStage] || [])];
    const [moved] = srcArr.splice(source.index, 1);
    moved.status = dstStage;
    dstArr.splice(destination.index, 0, moved);

    setPipeline(prev => prev ? {
      ...prev,
      columns: { ...prev.columns, [srcStage]: srcArr, [dstStage]: dstArr }
    } : prev);

    // Persist
    try {
      setMovingId(appId);
      await api.put(`/recruiters/pipeline/applications/${appId}/status`, { status: dstStage });
    } catch {
      toast.error("Failed to move candidate — refresh to sync");
      // Rollback
      loadPipeline(selectedJobId!);
    } finally {
      setMovingId(null);
    }
  };

  const columnOrder = pipeline?.columnOrder || Object.keys(STAGE_META);

  return (
    <div className="p-6 h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight font-heading">Hiring Pipeline</h1>
          <p className="text-muted-foreground font-medium text-sm mt-1">Drag candidates across stages. Changes persist automatically.</p>
        </div>
        {/* Job Selector */}
        <div className="flex items-center gap-3">
          <Briefcase className="w-4 h-4 text-muted-foreground" />
          <select
            className="border border-border bg-card text-foreground rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            value={selectedJobId || ""}
            onChange={e => loadPipeline(Number(e.target.value))}
          >
            {jobs.length === 0 && <option value="">No jobs found</option>}
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Pipeline */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="text-muted-foreground text-sm">Loading pipeline...</p>
          </div>
        </div>
      ) : !pipeline ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">Select a job to view the hiring pipeline.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-3 h-full pb-4 min-w-max">
              {columnOrder.map(stage => {
                const meta = STAGE_META[stage] || { label: stage, color: "text-foreground", bg: "bg-muted/30" };
                const apps = pipeline.columns[stage] || [];
                return (
                  <div key={stage} className="w-72 flex-shrink-0 flex flex-col rounded-2xl border border-border overflow-hidden bg-card">
                    {/* Column Header */}
                    <div className={`px-4 py-3 border-b border-border ${meta.bg} flex items-center justify-between`}>
                      <span className={`text-xs font-bold uppercase tracking-wide ${meta.color}`}>{meta.label}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color} border border-current/20`}>
                        {apps.length}
                      </span>
                    </div>

                    {/* Cards */}
                    <Droppable droppableId={stage}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 p-3 overflow-y-auto space-y-2.5 min-h-[120px] transition-colors ${
                            snapshot.isDraggingOver ? "bg-primary/5" : ""
                          }`}
                        >
                          {apps.length === 0 && !snapshot.isDraggingOver && (
                            <div className="text-center py-8 text-muted-foreground/40 text-xs">Drop here</div>
                          )}
                          {apps.map((app, index) => (
                            <Draggable
                              key={String(app.applicationId)}
                              draggableId={String(app.applicationId)}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`rounded-xl border bg-background p-3 cursor-grab active:cursor-grabbing transition-all ${
                                    snapshot.isDragging
                                      ? "shadow-xl border-primary/40 rotate-1 scale-105"
                                      : "border-border hover:border-primary/30 hover:shadow-sm"
                                  } ${movingId === app.applicationId ? "opacity-60" : ""}`}
                                >
                                  {/* Name + Band */}
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <Link
                                      href={`/recruiter/candidates/${app.studentId}`}
                                      className="font-bold text-sm text-foreground hover:text-primary transition-colors leading-tight"
                                      onClick={e => e.stopPropagation()}
                                    >
                                      {app.studentName}
                                    </Link>
                                    <MoreHorizontal className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                  </div>
                                  <div className="text-xs text-muted-foreground mb-2 truncate">
                                    {app.collegeName || "—"} • {app.branch || "—"}
                                  </div>

                                  {/* Band */}
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BAND_PILL[app.candidateBand as keyof typeof BAND_PILL] || BAND_PILL["Needs Improvement"]}`}>
                                    {app.candidateBand}
                                  </span>

                                  {/* Scores */}
                                  <div className="mt-2.5 space-y-1">
                                    <div className="flex items-center gap-1.5">
                                      <Target className="w-3 h-3 text-muted-foreground" />
                                      <div className="flex-1 bg-muted rounded-full h-1">
                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${app.atsScore || 0}%` }} />
                                      </div>
                                      <span className="text-[10px] font-bold text-muted-foreground w-5 text-right">{app.atsScore || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <TrendingUp className="w-3 h-3 text-muted-foreground" />
                                      <div className="flex-1 bg-muted rounded-full h-1">
                                        <div className="h-full bg-primary rounded-full" style={{ width: `${app.readinessScore || 0}%` }} />
                                      </div>
                                      <span className="text-[10px] font-bold text-muted-foreground w-5 text-right">{app.readinessScore || 0}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        </div>
      )}
    </div>
  );
}
