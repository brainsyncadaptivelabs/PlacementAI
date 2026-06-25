"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, History, BarChart2, PlayCircle, Check } from "lucide-react";
import Link from "next/link";
import { PageShell } from "@/components/ui/theme-components";

export default function MockInterviewLandingPage() {
  const features = [
    {
      title: "Start Practice",
      description: "Generate a new mock interview session with AI tailored to your role.",
      icon: <PlayCircle className="h-10 w-10 text-primary" />,
      link: "/mock-interview/start",
      buttonText: "Start Now"
    },
    {
      title: "Interview History",
      description: "Review your past interview transcripts and feedback reports.",
      icon: <History className="h-10 w-10 text-primary" />,
      link: "/mock-interview/history",
      buttonText: "View History"
    },
    {
      title: "Analytics",
      description: "Analyze your performance trends and identify areas of improvement.",
      icon: <BarChart2 className="h-10 w-10 text-primary" />,
      link: "/mock-interview/analytics",
      buttonText: "View Analytics"
    }
  ];

  return (
    <PageShell>
      <div className="text-center max-w-3xl mx-auto mb-8 space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl text-foreground">
          Master Your Interviews
        </h1>
        <p className="text-xl text-muted-foreground">
          Practice with our advanced AI interviewer, get real-time voice interaction, and receive comprehensive performance analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card key={index} className="flex flex-col justify-between h-full">
            <CardHeader className="items-center text-center pb-2">
              <div className="mb-4">
                {feature.icon}
              </div>
              <CardTitle className="text-2xl">{feature.title}</CardTitle>
              <CardDescription className="text-base mt-2">
                {feature.description}
              </CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto pt-6">
              <Link href={feature.link} className="w-full">
                <Button className="w-full py-6 text-lg" variant={index === 0 ? "default" : "secondary"}>
                  {feature.buttonText}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden mt-8">
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
          <div className="hidden md:flex relative h-full min-h-[300px] items-center justify-center">
            <Mic className="h-32 w-32 text-primary opacity-30" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="h-48 w-48 rounded-full border-4 border-primary/20 animate-ping" />
            </div>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}
