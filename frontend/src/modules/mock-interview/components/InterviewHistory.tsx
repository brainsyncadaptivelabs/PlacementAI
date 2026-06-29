"use client";

import React, { useEffect, useState } from "react";
import { interviewService } from "../services/interviewService";
import { MockInterview } from "../types/interview.types";
import { InterviewCard } from "./InterviewCard";
import { Loader2 } from "lucide-react";

export const InterviewHistory = () => {
  const [history, setHistory] = useState<MockInterview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const data = await interviewService.getHistory();
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this mock interview record?")) return;
    try {
      await interviewService.deleteInterview(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error("Failed to delete interview:", error);
      alert("Failed to delete record. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Loading past interview sessions...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed rounded-2xl border-border bg-card">
        <p className="text-muted-foreground font-medium">
          No mock interview sessions found. Start your first session today!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {history.map((item) => (
        <InterviewCard 
          key={item.id} 
          interview={item} 
          onDelete={handleDelete} 
        />
      ))}
    </div>
  );
};
