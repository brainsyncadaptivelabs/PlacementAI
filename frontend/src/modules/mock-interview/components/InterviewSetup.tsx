"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { interviewService } from "../services/interviewService";
import { MockInterviewRequest } from "../types/interview.types";
import { Loader2, Sparkles } from "lucide-react";

interface InterviewSetupProps {
  onGenerated: (data: { role: string; experienceLevel: string; questions: string[] }) => void;
}

export const InterviewSetup = ({ onGenerated }: InterviewSetupProps) => {
  const [role, setRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Entry Level");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!role) return;
    setLoading(true);
    try {
      const request: MockInterviewRequest = { role, experienceLevel };
      const response = await interviewService.generateInterview(request);
      onGenerated({
        role: response.role,
        experienceLevel,
        questions: response.questions,
      });
    } catch (error) {
      console.error("Failed to generate interview:", error);
      alert("Failed to generate interview questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectClassName = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Mock Interview Setup</CardTitle>
        <CardDescription>
          Configure your interview session to get started.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="role">Job Role</Label>
          <select 
            className={selectClassName}
            value={role} 
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">Select or type role</option>
            <option value="Java Full Stack">Java Full Stack</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Data Analyst">Data Analyst</option>
            <option value="Frontend Developer">Frontend Developer</option>
          </select>
          <Input
            placeholder="Or type custom role..."
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-2"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Target Company (Optional)</Label>
          <select 
            className={selectClassName}
            onChange={(e) => setRole(prev => `${prev} at ${e.target.value}`)}
          >
            <option value="">Suggested Companies</option>
            <option value="TCS">TCS</option>
            <option value="Infosys">Infosys</option>
            <option value="Accenture">Accenture</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="experience">Experience Level</Label>
          <select 
            className={selectClassName}
            value={experienceLevel} 
            onChange={(e) => setExperienceLevel(e.target.value)}
          >
            <option value="Entry Level">Entry Level</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Senior">Senior</option>
            <option value="Lead">Lead</option>
          </select>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleGenerate} disabled={!role || loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Questions...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Interview
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
