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
  const [role, setRole] = useState("Java Full Stack");
  const [experienceLevel, setExperienceLevel] = useState("Entry Level");
  const [company, setCompany] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [interviewType, setInterviewType] = useState("Technical");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!role) return;
    setLoading(true);
    try {
      const request: MockInterviewRequest = {
        role,
        experienceLevel,
        company: company || undefined,
        difficulty,
        interviewType,
        jobDescription: jobDescription || undefined,
        resumeText: resumeText || undefined
      };
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
    <Card className="max-w-xl mx-auto border-none shadow-xl bg-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold font-heading flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" /> AI Mock Interview Setup
        </CardTitle>
        <CardDescription>
          Configure your targeted interview parameters below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="role">Job Role / Title</Label>
            <select 
              className={selectClassName}
              value={role} 
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Java Full Stack">Java Full Stack</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Interview Type</Label>
            <select 
              className={selectClassName}
              value={interviewType} 
              onChange={(e) => setInterviewType(e.target.value)}
            >
              <option value="Technical">Technical Interview</option>
              <option value="HR">HR Behavioral</option>
              <option value="DSA Coding">DSA Coding Round</option>
              <option value="System Design">System Design</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company">Target Company (Optional)</Label>
            <select 
              className={selectClassName}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            >
              <option value="">General Tech Company</option>
              <option value="Google">Google</option>
              <option value="Microsoft">Microsoft</option>
              <option value="Amazon">Amazon</option>
              <option value="Accenture">Accenture</option>
              <option value="Infosys">Infosys</option>
              <option value="TCS">TCS</option>
              <option value="Capgemini">Capgemini</option>
              <option value="Deloitte">Deloitte</option>
              <option value="JP Morgan">JP Morgan</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <select 
              className={selectClassName}
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Experience Level</Label>
          <select 
            className={selectClassName}
            value={experienceLevel} 
            onChange={(e) => setExperienceLevel(e.target.value)}
          >
            <option value="Entry Level">Entry Level (Fresher)</option>
            <option value="Intermediate">Intermediate (1-4 Years)</option>
            <option value="Senior">Senior (5+ Years)</option>
            <option value="Lead">Lead / Architect</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="jd">Job Description (Optional)</Label>
          <textarea
            id="jd"
            className="w-full min-h-[70px] p-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
            placeholder="Paste target Job Description text to match questions..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="resume">Resume Context / Summary (Optional)</Label>
          <textarea
            id="resume"
            className="w-full min-h-[70px] p-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
            placeholder="Paste resume skills / projects summaries here to match..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full font-bold" onClick={handleGenerate} disabled={!role || loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Dynamic Questions...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Mock Interview
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
