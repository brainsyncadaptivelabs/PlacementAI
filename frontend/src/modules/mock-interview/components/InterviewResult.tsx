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
    return <div>No feedback available for this interview.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div className="flex justify-end print:hidden">
        <Button onClick={() => window.print()} className="gap-2">
          <Download className="h-4 w-4" /> Download PDF Report
        </Button>
      </div>
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Score Card */}
        <Card className="w-full md:w-1/3 text-center p-6 border-2 border-primary/20">
          <CardHeader>
            <CardTitle>Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative inline-flex items-center justify-center">
              <span className="text-5xl font-bold text-primary">{feedback.totalScore}%</span>
            </div>
            <Progress value={feedback.totalScore} className="mt-4" />
            <div className="mt-4 text-sm text-muted-foreground">
              {role} - {experienceLevel}
            </div>
          </CardContent>
        </Card>

        {/* Final Assessment */}
        <Card className="w-full md:w-2/3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Final Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">{feedback.finalAssessment}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Target className="h-5 w-5" />
              Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card className="border-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <TrendingUp className="h-5 w-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.areasForImprovement.map((area, index) => (
                <li key={index} className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
