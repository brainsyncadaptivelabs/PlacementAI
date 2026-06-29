"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, History, BarChart2, PlayCircle, Check, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/ui/theme-components";
import { interviewTypes, companies } from "@/modules/mock-interview/constants/interview-modules";
import { interviewService } from "@/modules/mock-interview/services/interviewService";
import { useInterviewStore } from "@/modules/mock-interview/hooks/useInterviewStore";
import { MockInterviewRequest } from "@/modules/mock-interview/types/interview.types";

export default function MockInterviewLandingPage() {
  const router = useRouter();
  const setInterviewData = useInterviewStore((state) => state.setInterviewData);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const startModuleInterview = async (moduleId: string, moduleName: string, level: string, focusAreas: string[]) => {
    setLoadingId(moduleId);
    try {
      const request: MockInterviewRequest = {
        role: moduleName,
        experienceLevel: level,
        company: moduleName, // maps to interview type/module
        topic: focusAreas.join(", "),
      };
      const response = await interviewService.generateInterview(request);
      setInterviewData({
        role: response.role,
        experienceLevel: level,
        questions: response.questions,
        company: moduleName,
        topic: focusAreas.join(", "),
      });
      router.push("/mock-interview/session");
    } catch (error) {
      console.error("Failed to start module interview:", error);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  const startCompanyInterview = async (companyId: string, companyName: string, level: string, type: string, focusAreas: string[]) => {
    setLoadingId(companyId);
    try {
      const request: MockInterviewRequest = {
        role: `${companyName} Engineer`,
        experienceLevel: level,
        company: type, // maps to interview type
        topic: focusAreas.join(", "),
      };
      const response = await interviewService.generateInterview(request);
      setInterviewData({
        role: response.role,
        experienceLevel: level,
        questions: response.questions,
        company: type,
        topic: focusAreas.join(", "),
      });
      router.push("/mock-interview/session");
    } catch (error) {
      console.error("Failed to start company interview:", error);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <PageShell>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6 border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            InterviewGenie <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Get interview-ready with AI-powered practice sessions, real-time voice, and instant detailed reports.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/mock-interview/history">
            <Button variant="outline" className="flex items-center gap-2">
              <History className="h-4 w-4" /> History
            </Button>
          </Link>
          <Link href="/mock-interview/analytics">
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" /> Analytics
            </Button>
          </Link>
          <Link href="/mock-interview/start">
            <Button className="flex items-center gap-2 font-semibold">
              <PlayCircle className="h-4 w-4" /> Custom Interview
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Start Modules */}
      <div className="space-y-6 mb-12">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Quick Start Modules</h2>
          <p className="text-sm text-muted-foreground mt-1">Select a focused track to practice specific core competencies.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {interviewTypes.map((module) => {
            const isLoading = loadingId === module.id;
            return (
              <Card key={module.id} className="flex flex-col justify-between hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <span className="text-3xl">{module.icon}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                      {module.level}
                    </span>
                  </div>
                  <CardTitle className="text-lg mt-4">{module.name}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">{module.description}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-2">
                  <Button 
                    className="w-full" 
                    variant="secondary"
                    disabled={loadingId !== null}
                    onClick={() => startModuleInterview(module.id, module.name, module.level, module.focusAreas)}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      "Start Practice"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Company-Specific Prep */}
      <div className="space-y-6 mb-12">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Company-Specific Prep</h2>
          <p className="text-sm text-muted-foreground mt-1">Practice interview formats tailored for top tech and consulting firms.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {companies.map((company) => {
            const isLoading = loadingId === company.id;
            return (
              <Card key={company.id} className="flex flex-col justify-between hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                      {company.logo}
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                      {company.level}
                    </span>
                  </div>
                  <CardTitle className="text-lg mt-4">{company.name}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">{company.description}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-2">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    disabled={loadingId !== null}
                    onClick={() => startCompanyInterview(company.id, company.name, company.level, company.interviewTypes[0], company.focusAreas)}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      `Practice for ${company.name}`
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Info Card */}
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-2 items-center">
          <div className="p-10 space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Why AI Mock Interviews?</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 mt-1 shrink-0" />
                <div><span className="font-bold">Real-time Voice:</span> Natural conversation with state-of-the-art voice AI.</div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 mt-1 shrink-0" />
                <div><span className="font-bold">Role-Specific:</span> Questions tailored to your specific job role and experience level.</div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 mt-1 shrink-0" />
                <div><span className="font-bold">Detailed Feedback:</span> Comprehensive scoring on communication, technical depth, and more.</div>
              </li>
            </ul>
          </div>
          <div className="hidden md:flex relative h-full min-h-[300px] items-center justify-center bg-muted/30">
            <Mic className="h-32 w-32 text-primary opacity-30 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="h-48 w-48 rounded-full border-4 border-primary/20 animate-ping" />
            </div>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}
