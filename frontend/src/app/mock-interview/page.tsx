"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, History, BarChart2, PlayCircle } from "lucide-react";
import Link from "next/link";

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
      icon: <History className="h-10 w-10 text-blue-500" />,
      link: "/mock-interview/history",
      buttonText: "View History"
    },
    {
      title: "Analytics",
      description: "Analyze your performance trends and identify areas of improvement.",
      icon: <BarChart2 className="h-10 w-10 text-green-500" />,
      link: "/mock-interview/analytics",
      buttonText: "View Analytics"
    }
  ];

  return (
    <div className="container py-12">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Master Your Interviews
        </h1>
        <p className="text-xl text-muted-foreground">
          Practice with our advanced AI interviewer, get real-time voice interaction, and receive comprehensive performance analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {features.map((feature, index) => (
          <Card key={index} className="flex flex-col hover:shadow-lg transition-shadow border-2">
            <CardHeader className="items-center text-center pb-2">
              <div className="mb-4 p-3 rounded-2xl bg-muted">
                {feature.icon}
              </div>
              <CardTitle className="text-2xl">{feature.title}</CardTitle>
              <CardDescription className="text-base mt-2">
                {feature.description}
              </CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto pt-6">
              <Link href={feature.link} className="w-full">
                <Button className="w-full py-6 text-lg" variant={index === 0 ? "default" : "outline"}>
                  {feature.buttonText}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-900 text-white overflow-hidden">
        <div className="grid md:grid-cols-2 items-center">
          <div className="p-10 space-y-6">
            <h2 className="text-3xl font-bold">Why AI Mock Interviews?</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary mt-1">✓</div>
                <div><span className="font-bold">Real-time Voice:</span> Natural conversation with state-of-the-art voice AI.</div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary mt-1">✓</div>
                <div><span className="font-bold">Role-Specific:</span> Questions tailored to your specific job role and experience level.</div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary mt-1">✓</div>
                <div><span className="font-bold">Detailed Feedback:</span> Comprehensive scoring on communication, technical depth, and more.</div>
              </li>
            </ul>
          </div>
          <div className="hidden md:block relative h-full min-h-[300px] bg-primary/10 flex items-center justify-center">
            <Mic className="h-32 w-32 text-primary opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="h-48 w-48 rounded-full border-4 border-primary/30 animate-ping" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
