"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Calendar, Plus, X, Loader2, Video, MapPin, Clock,
  User, Mail, Link as LinkIcon, ChevronRight, CheckCircle, XCircle
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

const ROUNDS = ["Technical Round 1", "Technical Round 2", "Manager Round", "HR Round", "System Design", "Coding Assessment"];
const MODES  = ["Online", "Offline"];
const STATUS_COLORS: Record<string, string> = {
  SCHEDULED:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  COMPLETED:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  CANCELLED:    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  RESCHEDULED:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const EMPTY_FORM = {
  studentId: "", studentName: "",
  round: ROUNDS[0], mode: MODES[0],
  scheduledDate: "", duration: "60",
  meetingLink: "", interviewerName: "", interviewerEmail: "",
  sendEmailReminder: true,
};

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState("");

  useEffect(() => {
    fetchInterviews();
    api.get("/recruiter/candidates?size=100").then(r => setStudents(r.data)).catch(() => {});
  }, []);

  const fetchInterviews = async () => {
    try {
      const res = await api.get("/recruiter/interviews");
      setInterviews(res.data);
    } catch {
      toast.error("Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  const schedule = async () => {
    if (!form.studentId || !form.scheduledDate) {
      toast.error("Student and date/time are required");
      return;
    }
    setSaving(true);
    try {
      await api.post("/recruiter/interviews", {
        studentId: Number(form.studentId),
        round: form.round,
        mode: form.mode,
        scheduledDate: new Date(form.scheduledDate).toISOString(),
        duration: Number(form.duration),
        meetingLink: form.meetingLink,
        interviewerName: form.interviewerName,
        interviewerEmail: form.interviewerEmail,
        sendEmailReminder: form.sendEmailReminder,
      });
      toast.success("Interview scheduled");
      setDrawerOpen(false);
      setForm({ ...EMPTY_FORM });
      fetchInterviews();
    } catch {
      toast.error("Failed to schedule interview");
    } finally {
      setSaving(false);
    }
  };

  const cancelInterview = async (id: number) => {
    try {
      await api.post(`/recruiter/interviews/${id}/cancel`);
      toast.success("Interview cancelled");
      fetchInterviews();
    } catch {
      toast.error("Failed to cancel");
    }
  };

  const completeInterview = async (id: number) => {
    try {
      await api.post(`/recruiter/interviews/${id}/complete`);
      toast.success("Marked as completed");
      fetchInterviews();
    } catch {
      toast.error("Failed to update");
    }
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.collegeName?.toLowerCase().includes(studentSearch.toLowerCase())
  ).slice(0, 8);

  const upcoming = interviews.filter(i => i.status === "SCHEDULED");
  const past = interviews.filter(i => i.status !== "SCHEDULED");

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight font-heading">Interview Scheduler</h1>
          <p className="text-muted-foreground font-medium mt-1">Schedule and manage candidate interviews.</p>
        </div>
        <Button onClick={() => setDrawerOpen(true)} className="bg-primary hover:bg-primary/90 text-white gap-2 rounded-xl">
          <Plus className="w-4 h-4" /> Schedule Interview
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Upcoming", value: upcoming.length, color: "text-blue-500" },
          { label: "Completed", value: past.filter(i => i.status === "COMPLETED").length, color: "text-emerald-500" },
          { label: "Cancelled", value: past.filter(i => i.status === "CANCELLED").length, color: "text-rose-500" },
        ].map(s => (
          <Card key={s.label} className="border-border bg-card">
            <CardContent className="p-5 text-center">
              <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-3">Upcoming Interviews</h2>
              <div className="space-y-3">
                {upcoming.map(iv => (
                  <Card key={iv.id} className="border-border bg-card hover:border-primary/30 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="font-bold text-foreground">{iv.studentName}</div>
                            <div className="text-sm text-muted-foreground">{iv.round}</div>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {iv.scheduledDate ? new Date(iv.scheduledDate).toLocaleString("en-IN", {
                                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                                }) : "—"}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                {iv.mode === "Online" ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                {iv.mode}
                              </span>
                              {iv.duration && <span className="text-xs text-muted-foreground">{iv.duration} min</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {iv.meetingLink && (
                            <a href={iv.meetingLink} target="_blank" rel="noreferrer">
                              <Button variant="outline" size="sm" className="gap-1 text-xs border-border">
                                <LinkIcon className="w-3 h-3" /> Join
                              </Button>
                            </a>
                          )}
                          <Button
                            variant="outline" size="sm"
                            className="gap-1 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400"
                            onClick={() => completeInterview(iv.id)}
                          >
                            <CheckCircle className="w-3 h-3" /> Done
                          </Button>
                          <Button
                            variant="outline" size="sm"
                            className="gap-1 text-xs border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400"
                            onClick={() => cancelInterview(iv.id)}
                          >
                            <XCircle className="w-3 h-3" /> Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-3">Past Interviews</h2>
              <div className="space-y-2">
                {past.map(iv => (
                  <Card key={iv.id} className="border-border bg-card opacity-80">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-foreground text-sm">{iv.studentName}</div>
                        <div className="text-xs text-muted-foreground">{iv.round} • {iv.mode}</div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[iv.status] || ""}`}>
                        {iv.status}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {interviews.length === 0 && (
            <div className="text-center py-20 bg-card border border-border rounded-2xl">
              <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No interviews scheduled yet.</p>
              <Button onClick={() => setDrawerOpen(true)} className="mt-4 bg-primary text-white gap-2">
                <Plus className="w-4 h-4" /> Schedule First Interview
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Schedule Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="w-full max-w-lg bg-background border-l border-border flex flex-col h-full">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold text-foreground font-heading">Schedule Interview</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Set up an interview with a candidate</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Student Search */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Select Candidate *</Label>
                <Input
                  placeholder="Search by name or college..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  className="border-border bg-card"
                />
                {studentSearch && filteredStudents.length > 0 && (
                  <div className="border border-border rounded-xl overflow-hidden bg-card">
                    {filteredStudents.map(s => (
                      <button
                        key={s.id}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center justify-between ${
                          form.studentId === String(s.id) ? "bg-primary/10 text-primary" : "text-foreground"
                        }`}
                        onClick={() => {
                          setForm(f => ({ ...f, studentId: String(s.id), studentName: s.name }));
                          setStudentSearch(s.name);
                        }}
                      >
                        <span className="font-medium">{s.name}</span>
                        <span className="text-xs text-muted-foreground">{s.collegeName}</span>
                      </button>
                    ))}
                  </div>
                )}
                {form.studentId && (
                  <div className="text-xs text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Selected: {form.studentName}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Round</Label>
                  <select value={form.round} onChange={e => setForm(f => ({ ...f, round: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm">
                    {ROUNDS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Mode</Label>
                  <select value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm">
                    {MODES.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Date & Time *</Label>
                  <Input type="datetime-local" value={form.scheduledDate}
                    onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))}
                    className="border-border bg-card" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Duration (min)</Label>
                  <Input type="number" value={form.duration}
                    onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                    className="border-border bg-card" />
                </div>
              </div>

              {form.mode === "Online" && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Meeting Link</Label>
                  <Input placeholder="https://meet.google.com/..." value={form.meetingLink}
                    onChange={e => setForm(f => ({ ...f, meetingLink: e.target.value }))}
                    className="border-border bg-card" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Interviewer Name</Label>
                  <Input placeholder="Full name" value={form.interviewerName}
                    onChange={e => setForm(f => ({ ...f, interviewerName: e.target.value }))}
                    className="border-border bg-card" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Interviewer Email</Label>
                  <Input type="email" placeholder="email@company.com" value={form.interviewerEmail}
                    onChange={e => setForm(f => ({ ...f, interviewerEmail: e.target.value }))}
                    className="border-border bg-card" />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.sendEmailReminder}
                  onChange={e => setForm(f => ({ ...f, sendEmailReminder: e.target.checked }))}
                  className="rounded border-border" />
                <span className="text-sm text-foreground">Send email reminder to candidate</span>
              </label>
            </div>

            <div className="px-6 py-4 border-t border-border flex gap-3 shrink-0 bg-muted/30">
              <Button variant="outline" onClick={() => setDrawerOpen(false)} className="flex-1 border-border">Cancel</Button>
              <Button onClick={schedule} disabled={saving} className="flex-1 bg-primary hover:bg-primary/90 text-white">
                {saving ? "Scheduling..." : "Schedule Interview"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
