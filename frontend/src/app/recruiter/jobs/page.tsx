"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Plus, MoreVertical, Edit, Copy, Trash2, Users } from "lucide-react";
import Link from "next/link";

export default function JobsDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    // Mock jobs
    setJobs([
      {
        id: 1,
        title: "Senior Backend Engineer",
        company: "Amazon",
        location: "Bengaluru, India",
        mode: "Hybrid",
        applicants: 124,
        shortlisted: 12,
        status: "Active",
        postedDate: "2 days ago"
      },
      {
        id: 2,
        title: "Frontend Developer (React)",
        company: "Amazon",
        location: "Remote",
        mode: "Remote",
        applicants: 89,
        shortlisted: 5,
        status: "Active",
        postedDate: "5 days ago"
      },
      {
        id: 3,
        title: "Product Manager",
        company: "Amazon",
        location: "Hyderabad, India",
        mode: "On-site",
        applicants: 45,
        shortlisted: 8,
        status: "Closed",
        postedDate: "2 weeks ago"
      }
    ]);
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight font-heading">
            Job Management
          </h1>
          <p className="text-muted-foreground font-medium">Create and manage your organization's active hiring roles.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-primary hover:bg-primary/95 text-white gap-2 rounded-xl px-5 shadow-sm">
            <Plus className="w-4 h-4" /> Post New Job
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Job Title</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Applicants</th>
                  <th className="px-6 py-4 font-medium">Posted</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground text-base">{job.title}</div>
                      <div className="text-muted-foreground text-xs mt-1">{job.company}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {job.location}
                        <Badge variant="secondary" className="text-[10px] py-0">{job.mode}</Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={job.status === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-200 border-none' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-none'}>
                        {job.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{job.applicants}</span>
                        <span className="text-muted-foreground text-xs">({job.shortlisted} shortlisted)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {job.postedDate}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
