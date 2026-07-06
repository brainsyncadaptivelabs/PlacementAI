"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface ResumeBuilderBlueprint {
  targetRole: string;
  experienceLevel: string;
  topSkills: string[];
  atsKeywordsCount: number;
  currentMatch: number;
  estimatedMatch: number;
  actionVerbs: string[];
  responsibilities: string[];
  missingKeywords: string[];
  aiSuggestions: Record<string, string>;
  recommendedTemplate: string;
  recommendedTemplateReason: string;
}

export interface ResumeBuilderSession {
  resumeType: "general" | "company" | null;
  jobDescription: string;
  blueprint: ResumeBuilderBlueprint | null;
  selectedTemplate: string | null;
  acceptedSuggestions: string[];
}

interface ResumeBuilderSessionContextType {
  session: ResumeBuilderSession;
  setSession: React.Dispatch<React.SetStateAction<ResumeBuilderSession>>;
  resetSession: () => void;
}

const defaultSession: ResumeBuilderSession = {
  resumeType: null,
  jobDescription: "",
  blueprint: null,
  selectedTemplate: null,
  acceptedSuggestions: [],
};

const ResumeBuilderSessionContext = createContext<ResumeBuilderSessionContextType | undefined>(undefined);

export function ResumeBuilderSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ResumeBuilderSession>(defaultSession);

  const resetSession = () => {
    setSession(defaultSession);
  };

  return (
    <ResumeBuilderSessionContext.Provider value={{ session, setSession, resetSession }}>
      {children}
    </ResumeBuilderSessionContext.Provider>
  );
}

export function useResumeBuilderSession() {
  const context = useContext(ResumeBuilderSessionContext);
  if (!context) {
    throw new Error("useResumeBuilderSession must be used within a ResumeBuilderSessionProvider");
  }
  return context;
}
