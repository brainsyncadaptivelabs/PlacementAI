"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Award, Target, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MockInterview } from "../types/interview.types";

interface InterviewResultProps {
  interview: MockInterview;
}

export const InterviewResult = ({ interview }: InterviewResultProps) => {
  const { feedback, role, experienceLevel } = interview;

  if (!feedback) {
    return (
      <div className="container py-10 text-center">
        <p className="text-muted-foreground">No feedback report available for this session.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center print:hidden border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold">{role}</h2>
          <p className="text-sm text-muted-foreground">{experienceLevel} | Targeted Session</p>
        </div>
        <Button onClick={() => window.print()} className="gap-2 font-bold bg-slate-900 hover:bg-slate-800 text-white">
          <Download className="h-4 w-4" /> Download PDF Evaluation
        </Button>
      </div>

      {/* Top Scores & Metrics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Main Overall Score card */}
        <Card className="text-center p-6 border-2 border-primary/20 flex flex-col justify-center items-center bg-primary/5">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">PlacementAI Score™</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col items-center">
            <div className="text-6xl font-black text-primary my-2">{feedback.totalScore}</div>
            <Badge className="bg-primary/20 text-primary border-none font-bold mt-1">
              {feedback.recruiterVerdict || (feedback.totalScore >= 75 ? "Strong Match" : "Needs Review")}
            </Badge>
          </CardContent>
        </Card>

        {/* Detailed Metrics card */}
        <Card className="md:col-span-2 p-6 flex flex-col justify-between">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" /> Core Skill Diagnostics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            {[
              { label: "Technical Accuracy", score: feedback.technicalScore || feedback.totalScore },
              { label: "Communication Flow", score: feedback.communicationScore || feedback.totalScore },
              { label: "Confidence Assessment", score: feedback.confidenceScore || feedback.totalScore }
            ].map((metric) => (
              <div key={metric.label} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase">
                  <span>{metric.label}</span>
                  <span>{metric.score}%</span>
                </div>
                <Progress value={metric.score} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Dynamic Quick Insights Card */}
        <Card className="p-6 flex flex-col justify-between bg-muted/20">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Quick Insights</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-3.5">
            <div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground">Expected Salary</div>
              <div className="text-md font-extrabold text-foreground">{feedback.expectedSalary || "₹6.5 - ₹9.0 LPA"}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground">Hiring Probability</div>
              <div className="text-md font-extrabold text-green-600">{feedback.hiringProbability || (feedback.totalScore - 5)}% Probability</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground">Company Readiness</div>
              <div className="text-md font-extrabold text-primary">{feedback.companyReadiness || (feedback.totalScore - 3)}% Ready</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall assessment verdict */}
      <Card className="border-none shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            💡 Recruiter Verdict & Evaluation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base text-foreground leading-relaxed">
            {feedback.finalAssessment}
          </p>
          {feedback.finalRecommendation && (
            <div className="p-4 bg-muted/40 rounded-lg border-l-4 border-primary">
              <span className="font-extrabold text-xs uppercase text-primary block mb-1">Key Recommendation</span>
              <p className="text-sm text-muted-foreground leading-relaxed">{feedback.finalRecommendation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Strengths and Improvements lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Key Strengths */}
        <Card className="border-green-600/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600 text-base font-bold">
              <CheckCircle className="h-5 w-5" /> Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {feedback.strengths && feedback.strengths.length > 0 ? (
                feedback.strengths.map((str, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span>{str}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs italic text-muted-foreground">No specific strengths mapped.</li>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Key Areas for Improvement */}
        <Card className="border-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive text-base font-bold">
              <TrendingUp className="h-5 w-5" /> Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {feedback.areasForImprovement && feedback.areasForImprovement.length > 0 ? (
                feedback.areasForImprovement.map((area, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <span>{area}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs italic text-muted-foreground">No specific improvements required.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Technical and behavioral gaps breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Missed Topics */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              ⚠️ Missed Topics & Conceptual Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {(feedback.missedTopics && feedback.missedTopics.length > 0) ? (
                feedback.missedTopics.map((topic, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2.5">
                    <span className="text-yellow-500 font-bold">•</span>
                    <span>{topic}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-muted-foreground italic">No missed concepts or gaps detected.</li>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Body Language & Communication Tips */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              🎙️ Body Language & Delivery Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {(feedback.bodyLanguageTips && feedback.bodyLanguageTips.length > 0) ? (
                feedback.bodyLanguageTips.map((tip, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2.5">
                    <span className="text-primary font-bold">»</span>
                    <span>{tip}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-muted-foreground italic">Communication pace and delivery were steady.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Resources and detailed preparation plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Preparation improvement steps */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              📅 Recommended Preparation Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {(feedback.improvementPlan && feedback.improvementPlan.length > 0) ? (
                feedback.improvementPlan.map((step, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2.5">
                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-bold bg-muted/65">{i + 1}</Badge>
                    <span>{step}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-muted-foreground italic">No customized prep steps required.</li>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Recommended Learning resources */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              📚 Recommended Placement Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {(feedback.recommendedResources && feedback.recommendedResources.length > 0) ? (
                feedback.recommendedResources.map((res, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2.5">
                    <span className="text-emerald-500">✔</span>
                    <span>{res}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-muted-foreground italic">No specialized resources recommended.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};
