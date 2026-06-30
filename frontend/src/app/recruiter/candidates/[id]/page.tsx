"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CandidateIntelligenceProfile } from "@/components/shared/CandidateIntelligenceProfile";
import api from "@/lib/api";
import { toast } from "sonner";

export default function CandidateProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchIntelligence = async () => {
      try {
        const response = await api.get(`/recruiter/candidates/${id}/intelligence`);
        setData(response.data);
      } catch (err) {
        toast.error("Failed to load intelligence profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchIntelligence();
  }, [id]);

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
          <Button variant="ghost" onClick={() => router.back()} className="mb-2 -ml-4 hover:bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Candidates
          </Button>
          <h1 className="text-3xl font-black text-foreground tracking-tight font-heading">
            Placement Intelligence Profile
          </h1>
          <p className="text-muted-foreground font-medium">Detailed readiness evaluation and predictive scores.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Download Report</Button>
          <Button className="bg-primary text-white">Shortlist Candidate</Button>
        </div>
      </div>

      <CandidateIntelligenceProfile data={data} />
    </div>
  );
}
