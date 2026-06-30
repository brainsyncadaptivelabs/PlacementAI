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
  onGenerated: (data: { 
    role: string; 
    experienceLevel: string; 
    questions: string[]; 
    company?: string; 
    difficulty?: string; 
    interviewType?: string; 
    topic?: string; 
    isAdaptive?: boolean;
    adaptiveInterviewId?: number;
    conversationalStyle?: string;
  }) => void;
}

export const InterviewSetup = ({ onGenerated }: InterviewSetupProps) => {
  const [role, setRole] = useState("Java Full Stack");
  const [experienceLevel, setExperienceLevel] = useState("Entry Level");
  const [company, setCompany] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [interviewType, setInterviewType] = useState("Technical Coding");
  const [conversationalStyle, setConversationalStyle] = useState("Professional");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [focusAreas, setFocusAreas] = useState("");
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
        resumeText: resumeText || undefined,
        topic: focusAreas || undefined,
        conversationalStyle
      };
      const response = await interviewService.generateInterview(request);
      onGenerated({
        role: response.role,
        experienceLevel,
        questions: response.questions,
        company,
        difficulty,
        interviewType,
        topic: focusAreas,
        conversationalStyle
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
            <Input
              placeholder="Or type custom role..."
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-2 text-xs h-8"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Interview Type / Module</Label>
            <select 
              className={selectClassName}
              value={interviewType} 
              onChange={(e) => setInterviewType(e.target.value)}
            >
              <option value="Technical Coding">Technical Coding</option>
              <option value="System Design">System Design</option>
              <option value="Behavioral / HR">Behavioral / HR</option>
              <option value="Aptitude & Reasoning">Aptitude & Reasoning</option>
              <option value="Technical HR">Technical HR</option>
              <option value="Embedded Systems">Embedded Systems</option>
              <option value="VLSI Design">VLSI Design</option>
              <option value="Architecture">Architecture</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="focusAreas">Focus Areas / Tech Stack</Label>
          <Input
            id="focusAreas"
            placeholder="e.g. React, Spring Boot, OOP, Algorithms"
            value={focusAreas}
            onChange={(e) => setFocusAreas(e.target.value)}
          />
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
              <option value="Oracle">Oracle</option>
              <option value="NVIDIA">NVIDIA</option>
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

        <div className="grid grid-cols-2 gap-4">
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
            <Label htmlFor="style">Interviewer Style / Tone</Label>
            <select 
              className={selectClassName}
              value={conversationalStyle} 
              onChange={(e) => setConversationalStyle(e.target.value)}
            >
              <option value="Professional">Professional (Recruiter)</option>
              <option value="Friendly">Friendly (Warm & Positive)</option>
              <option value="Strict">Strict (Challenging & Rigorous)</option>
              <option value="Senior Engineer">Senior Engineer (Deep Technical)</option>
            </select>
          </div>
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
      <CardFooter className="flex flex-col gap-3">
        <Button className="w-full font-bold" onClick={handleGenerate} disabled={!role || loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Dynamic Questions...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Standard Interview (5 Questions)
            </>
          )}
        </Button>
        <Button 
          variant="outline" 
          className="w-full font-bold border-primary text-primary hover:bg-primary/10" 
          onClick={async () => {
            if (!role) return;
            setLoading(true);
            try {
              const request = {
                role, experienceLevel, company: company || undefined, difficulty, interviewType,
                jobDescription: jobDescription || undefined, resumeText: resumeText || undefined, topic: focusAreas || undefined,
                conversationalStyle
              };
              const response = await interviewService.startAdaptiveInterview(request);
              onGenerated({
                role, experienceLevel, company, difficulty, interviewType, topic: focusAreas,
                questions: [response.firstQuestion], // Seed with first question
                isAdaptive: true,
                adaptiveInterviewId: response.interviewId,
                conversationalStyle
              });
            } catch (error) {
              console.error(error);
              alert("Failed to start adaptive interview.");
            } finally {
              setLoading(false);
            }
          }}
          disabled={!role || loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Start Adaptive AI Interview (Dynamic)
        </Button>
      </CardFooter>
    </Card>
  );
};
