"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Loader2, Star, Target, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";

export default function CandidateExplorer() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await api.get("/recruiter/candidates");
        setCandidates(response.data);
      } catch (err) {
        toast.error("Failed to load candidates.");
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight font-heading">
            Candidate Explorer
          </h1>
          <p className="text-muted-foreground font-medium">Discover and evaluate top talent using PlacementAI Intelligence.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search skills, names, colleges..." className="pl-9 bg-card border-border rounded-xl" />
          </div>
          <Button variant="outline" className="gap-2 rounded-xl border-border"><Filter className="w-4 h-4" /> Filters</Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {candidates.map(candidate => (
          <Link href={`/recruiter/candidates/${candidate.id}`} key={candidate.id}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer bg-card border-border">
              <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center text-xl font-bold text-foreground">
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{candidate.name}</h3>
                    <p className="text-sm text-muted-foreground">{candidate.branch} • {candidate.graduationYear || 'N/A'}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {candidate.skills?.split(",").slice(0, 3).map((skill: string) => (
                        <Badge key={skill} variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    View Complete Intelligence Profile &rarr;
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {candidates.length === 0 && (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <p className="text-muted-foreground">No candidates available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
