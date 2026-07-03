"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase, Plus, Edit, Copy, Trash2, Archive, Play, X,
  MapPin, Users, Clock, ChevronRight, MoreHorizontal, Search,
  TrendingUp, CheckCircle, XCircle, Package
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  DRAFT:    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  ACTIVE:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  CLOSED:   "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  ARCHIVED: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const WORK_MODES = ["Remote", "Hybrid", "On-site"];
const DEPARTMENTS = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "MBA", "MCA"];
const EXPERIENCE_LEVELS = ["Fresher", "0-1 years", "1-2 years", "2-4 years", "4+ years"];

interface Job {
  id: number;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  location: string;
  workMode: string;
  status: string;
  applicantCount: number;
  shortlistedCount: number;
  deadline?: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string;
  departments?: string;
  experience?: string;
  description?: string;
  minCgpa?: number;
  createdAt?: string;
}

interface JobFormData {
  title: string;
  description: string;
  location: string;
  workMode: string;
  skills: string;
  departments: string;
  salaryMin: string;
  salaryMax: string;
  minCgpa: string;
  experience: string;
  deadline: string;
}

const EMPTY_FORM: JobFormData = {
  title: "", description: "", location: "", workMode: "On-site",
  skills: "", departments: "", salaryMin: "", salaryMax: "",
  minCgpa: "", experience: "Fresher", deadline: "",
};

export default function JobsDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [form, setForm] = useState<JobFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/recruiters/jobs");
      setJobs(res.data);
    } catch {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingJob(null);
    setForm(EMPTY_FORM);
    setDrawerOpen(true);
  };

  const openEdit = (job: Job) => {
    setEditingJob(job);
    setForm({
      title: job.title || "",
      description: job.description || "",
      location: job.location || "",
      workMode: job.workMode || "On-site",
      skills: job.skills || "",
      departments: job.departments || "",
      salaryMin: job.salaryMin?.toString() || "",
      salaryMax: job.salaryMax?.toString() || "",
      minCgpa: job.minCgpa?.toString() || "",
      experience: job.experience || "Fresher",
      deadline: job.deadline ? job.deadline.slice(0, 10) : "",
    });
    setDrawerOpen(true);
    setOpenMenu(null);
  };

  const saveJob = async () => {
    if (!form.title.trim()) { toast.error("Job title is required"); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        location: form.location,
        workMode: form.workMode,
        skills: form.skills,
        departments: form.departments,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
        minCgpa: form.minCgpa ? Number(form.minCgpa) : null,
        experience: form.experience,
        deadline: form.deadline || null,
      };

      if (editingJob) {
        await api.put(`/recruiters/jobs/${editingJob.id}`, payload);
        toast.success("Job updated");
      } else {
        await api.post("/recruiters/jobs", payload);
        toast.success("Job created as draft");
      }
      setDrawerOpen(false);
      fetchJobs();
    } catch {
      toast.error("Failed to save job");
    } finally {
      setSaving(false);
    }
  };

  const performAction = async (action: string, jobId: number) => {
    setOpenMenu(null);
    try {
      if (action === "delete") {
        if (!confirm("Delete this job? This cannot be undone.")) return;
        await api.delete(`/recruiters/jobs/${jobId}`);
        toast.success("Job deleted");
      } else if (action === "publish") {
        await api.post(`/recruiters/jobs/${jobId}/publish`);
        toast.success("Job published and is now active");
      } else if (action === "close") {
        await api.post(`/recruiters/jobs/${jobId}/close`);
        toast.success("Job closed");
      } else if (action === "archive") {
        await api.post(`/recruiters/jobs/${jobId}/archive`);
        toast.success("Job archived");
      } else if (action === "duplicate") {
        await api.post(`/recruiters/jobs/${jobId}/duplicate`);
        toast.success("Job duplicated as draft");
      }
      fetchJobs();
    } catch {
      toast.error(`Failed to ${action} job`);
    }
  };

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    const matchSearch = !search || j.title.toLowerCase().includes(q)
      || j.companyName?.toLowerCase().includes(q)
      || j.location?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "ALL" || j.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total:  jobs.length,
    active: jobs.filter(j => j.status === "ACTIVE").length,
    draft:  jobs.filter(j => j.status === "DRAFT").length,
    closed: jobs.filter(j => j.status === "CLOSED").length,
    totalApplicants: jobs.reduce((s, j) => s + (j.applicantCount || 0), 0),
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight font-heading">Job Management</h1>
          <p className="text-muted-foreground font-medium mt-1">Create, publish and manage your hiring roles.</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-primary hover:bg-primary/90 text-white gap-2 rounded-xl px-6 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Post New Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Jobs", value: stats.total, icon: Briefcase, color: "text-primary" },
          { label: "Active", value: stats.active, icon: CheckCircle, color: "text-emerald-500" },
          { label: "Drafts", value: stats.draft, icon: Clock, color: "text-amber-500" },
          { label: "Closed", value: stats.closed, icon: XCircle, color: "text-rose-500" },
          { label: "Total Applicants", value: stats.totalApplicants, icon: Users, color: "text-blue-500" },
        ].map(stat => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-2.5 rounded-xl bg-muted ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            className="pl-9 bg-card border-border rounded-xl"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "DRAFT", "ACTIVE", "CLOSED", "ARCHIVED"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterStatus === s
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Table */}
      <Card className="border-border bg-card overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Briefcase className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No jobs found.</p>
              <Button onClick={openCreate} className="mt-4 bg-primary text-white gap-2">
                <Plus className="w-4 h-4" /> Create Your First Job
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Job</th>
                    <th className="px-6 py-4 font-semibold">Location</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Salary</th>
                    <th className="px-6 py-4 font-semibold">Applicants</th>
                    <th className="px-6 py-4 font-semibold">Deadline</th>
                    <th className="px-6 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(job => (
                    <tr key={job.id} className="border-b border-border hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground text-base leading-tight">{job.title}</div>
                        <div className="text-muted-foreground text-xs mt-0.5">{job.companyName}</div>
                        {job.skills && (
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {job.skills.split(",").slice(0, 3).map(s => (
                              <span key={s} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-medium">
                                {s.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="text-sm">{job.location || "—"}</span>
                        </div>
                        <Badge variant="outline" className="mt-1 text-[10px] border-border">
                          {job.workMode}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[job.status] || STATUS_COLORS.DRAFT}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {job.salaryMin && job.salaryMax
                          ? `₹${(job.salaryMin / 100000).toFixed(0)}–${(job.salaryMax / 100000).toFixed(0)} LPA`
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-bold text-foreground">{job.applicantCount || 0}</span>
                          {(job.shortlistedCount || 0) > 0 && (
                            <span className="text-muted-foreground text-xs">({job.shortlistedCount} shortlisted)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-sm whitespace-nowrap">
                        {job.deadline ? new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/recruiter/jobs/${job.id}`}>
                            <Button variant="ghost" size="sm" className="text-xs gap-1 opacity-0 group-hover:opacity-100">
                              View <ChevronRight className="w-3 h-3" />
                            </Button>
                          </Link>
                          <div className="relative" ref={openMenu === job.id ? menuRef : undefined}>
                            <Button
                              variant="ghost" size="icon"
                              className="text-muted-foreground hover:text-foreground"
                              onClick={() => setOpenMenu(openMenu === job.id ? null : job.id)}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                            {openMenu === job.id && (
                              <div className="absolute right-0 top-9 z-50 bg-card border border-border rounded-xl shadow-xl w-44 py-1 text-sm">
                                <button onClick={() => openEdit(job)} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-muted transition-colors">
                                  <Edit className="w-3.5 h-3.5 text-muted-foreground" /> Edit
                                </button>
                                {job.status === "DRAFT" && (
                                  <button onClick={() => performAction("publish", job.id)} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-muted transition-colors text-emerald-600">
                                    <Play className="w-3.5 h-3.5" /> Publish
                                  </button>
                                )}
                                {job.status === "ACTIVE" && (
                                  <button onClick={() => performAction("close", job.id)} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-muted transition-colors text-rose-600">
                                    <XCircle className="w-3.5 h-3.5" /> Close
                                  </button>
                                )}
                                <button onClick={() => performAction("duplicate", job.id)} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-muted transition-colors">
                                  <Copy className="w-3.5 h-3.5 text-muted-foreground" /> Duplicate
                                </button>
                                <button onClick={() => performAction("archive", job.id)} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-muted transition-colors">
                                  <Archive className="w-3.5 h-3.5 text-muted-foreground" /> Archive
                                </button>
                                <div className="my-1 border-t border-border" />
                                <button onClick={() => performAction("delete", job.id)} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors text-rose-600">
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="w-full max-w-lg bg-background border-l border-border shadow-2xl flex flex-col h-full overflow-hidden">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold text-foreground font-heading">
                  {editingJob ? "Edit Job" : "Post New Job"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {editingJob ? "Update job details" : "Fill in the details and publish when ready"}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Job Title *</Label>
                <Input
                  placeholder="e.g., Senior Backend Engineer"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="border-border bg-card"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Description</Label>
                <Textarea
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="border-border bg-card resize-none h-28"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Location</Label>
                  <Input
                    placeholder="e.g., Bengaluru, India"
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    className="border-border bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Work Mode</Label>
                  <select
                    value={form.workMode}
                    onChange={e => setForm(f => ({ ...f, workMode: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm"
                  >
                    {WORK_MODES.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Required Skills (comma-separated)</Label>
                <Input
                  placeholder="e.g., Java, Spring Boot, MySQL, AWS"
                  value={form.skills}
                  onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
                  className="border-border bg-card"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Min Salary (₹ LPA)</Label>
                  <Input
                    type="number" placeholder="e.g., 800000"
                    value={form.salaryMin}
                    onChange={e => setForm(f => ({ ...f, salaryMin: e.target.value }))}
                    className="border-border bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Max Salary (₹ LPA)</Label>
                  <Input
                    type="number" placeholder="e.g., 1500000"
                    value={form.salaryMax}
                    onChange={e => setForm(f => ({ ...f, salaryMax: e.target.value }))}
                    className="border-border bg-card"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Min CGPA</Label>
                  <Input
                    type="number" step="0.1" placeholder="e.g., 7.0"
                    value={form.minCgpa}
                    onChange={e => setForm(f => ({ ...f, minCgpa: e.target.value }))}
                    className="border-border bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Experience</Label>
                  <select
                    value={form.experience}
                    onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm"
                  >
                    {EXPERIENCE_LEVELS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Eligible Departments (comma-separated)</Label>
                <Input
                  placeholder="e.g., CSE, IT, ECE"
                  value={form.departments}
                  onChange={e => setForm(f => ({ ...f, departments: e.target.value }))}
                  className="border-border bg-card"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Application Deadline</Label>
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                  className="border-border bg-card"
                />
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-4 border-t border-border flex gap-3 shrink-0 bg-muted/30">
              <Button variant="outline" onClick={() => setDrawerOpen(false)} className="flex-1 border-border">
                Cancel
              </Button>
              <Button
                onClick={saveJob}
                disabled={saving}
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
              >
                {saving ? "Saving..." : editingJob ? "Update Job" : "Save as Draft"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
