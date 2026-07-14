import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle, FileText, Target, Award, Code, Brain, 
  ArrowRight, Users, GraduationCap, Briefcase, Zap, Heart 
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | PlacementAI",
  description: "Learn how PlacementAI is building the campus placement intelligence layer to help students prepare, practice, and land dream offers.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <PublicHeader />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32 bg-gradient-to-b from-primary/5 via-background to-background border-b border-border/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -mr-48 -mt-48" />
          <div className="container mx-auto px-4 max-w-5xl text-center space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5" /> Built by students for students
            </div>
            <h1 className="text-4xl sm:text-6xl font-black font-heading leading-tight tracking-tight">
              Building Placement Intelligence <br />
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">for Every Student</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-medium">
              PlacementAI helps candidates assess placement readiness, strengthen resume evidence, prepare for mock interviews, and track skills dynamically. We are more than a scanner—we are your placement intelligence layer.
            </p>
            <div className="pt-4">
              <Link href="/auth">
                <Button size="lg" className="bg-primary hover:bg-primary/90 font-black px-10 py-7 text-lg rounded-2xl shadow-xl shadow-primary/20 group">
                  Get Started Now <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* The Problem */}
        <section className="py-20 px-4 max-w-5xl mx-auto w-full">
          <div className="space-y-4 mb-12 text-center">
            <h2 className="text-3xl font-black font-heading">The Sourcing & Sizing Problem</h2>
            <p className="text-muted-foreground font-medium max-w-xl mx-auto">Traditional preparation is broken and highly fragmented.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none bg-slate-500/5 hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-bold">01</div>
                <h3 className="text-lg font-black font-heading">Preparation is Blind</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  Students study without knowing where they actually stand relative to actual industry requirements and ATS screening parameters.
                </p>
              </CardContent>
            </Card>
            <Card className="border-none bg-slate-500/5 hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">02</div>
                <h3 className="text-lg font-black font-heading">Generic Resume Sourcing</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  Resume templates and standard advice lead to candidate homogenization. Sourcing tools penalize unique projects that lack exact keywords.
                </p>
              </CardContent>
            </Card>
            <Card className="border-none bg-slate-500/5 hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">03</div>
                <h3 className="text-lg font-black font-heading">Fragmented Ecosystems</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  Students juggle separate sites for coding challenges, aptitude prep, mock interview videos, and resume optimization, losing cohesive tracking.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Ecosystem Features */}
        <section className="py-20 bg-muted/40 border-y border-border/40">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="space-y-4 mb-16 text-center">
              <h2 className="text-3xl font-black font-heading">The Placement Intelligence Ecosystem</h2>
              <p className="text-muted-foreground font-medium max-w-lg mx-auto">A unified framework covering every stage of career readiness.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {[
                { icon: FileText, title: "Resume Intelligence", desc: "Deeper semantic checks to elevate academic projects and evidence." },
                { icon: Target, title: "ATS Intelligence", desc: "Evaluations mapping keyword density and syntax flow." },
                { icon: Award, title: "JD Compatibility", desc: "Percentage alignment algorithms measuring role match parameters." },
                { icon: Code, title: "Coding Preparation", desc: "Integrated sandbox testing data structures and algorithms." },
                { icon: Brain, title: "Aptitude Preparation", desc: "Psychometric testing covering analytical, quantitative, and logical reasoning." },
                { icon: Users, title: "AI Mock Interviews", desc: "Simulated speech-to-text behavioral grading." },
                { icon: Zap, title: "Placement Readiness", desc: "Metric scoring to help student users see readiness signals." },
                { icon: GraduationCap, title: "Placement Officer Intel", desc: "Bulk student analytics and readiness drives for colleges." },
                { icon: Briefcase, title: "Recruiter Pipelines", desc: "Advanced filtering helping recruiter partners screen quality candidates." }
              ].map((feat, idx) => (
                <div key={idx} className="flex gap-4 p-4 hover:bg-slate-500/5 rounded-2xl transition-colors duration-200">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <feat.icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-base leading-tight text-foreground">{feat.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Target Audience */}
        <section className="py-20 px-4 max-w-5xl mx-auto w-full">
          <div className="space-y-4 mb-16 text-center">
            <h2 className="text-3xl font-black font-heading">Built For the Campus Sourcing Network</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 text-center">
              <GraduationCap className="w-10 h-10 text-primary mx-auto" />
              <h3 className="text-lg font-black font-heading">Students</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Bridge the preparation gap and qualify for opportunities with measurable skill evidence.
              </p>
            </div>
            <div className="space-y-3 text-center">
              <Users className="w-10 h-10 text-primary mx-auto" />
              <h3 className="text-lg font-black font-heading">Colleges &amp; Placement Teams</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Track readiness metrics at scale, optimize campus drives, and identify students needing support.
              </p>
            </div>
            <div className="space-y-3 text-center">
              <Briefcase className="w-10 h-10 text-primary mx-auto" />
              <h3 className="text-lg font-black font-heading">Recruiters</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Access verified candidate profiles with deeper semantic evaluations than keyword filters.
              </p>
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className="py-20 bg-muted/40 border-t border-border/40">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="space-y-4 mb-16 text-center">
              <h2 className="text-3xl font-black font-heading">Our Product Philosophy</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-1" />
                <div className="space-y-2">
                  <h4 className="font-black text-lg font-heading">Evidence Over Assertions</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    We believe in proving skills through clean projects, coding challenges, and mock interview transcripts, rather than simple resume claims.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-1" />
                <div className="space-y-2">
                  <h4 className="font-black text-lg font-heading">Measurable Career Readiness</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    Career readiness shouldn&apos;t be a mystery. We provide continuous metrics to remove the guesswork from campus recruiting.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-1" />
                <div className="space-y-2">
                  <h4 className="font-black text-lg font-heading">Personalized preparation</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    Every candidate possesses different strengths. Our AI models analyze individual profiles to generate targeted mock interview paths.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-1" />
                <div className="space-y-2">
                  <h4 className="font-black text-lg font-heading">AI as an Intelligence Layer</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    We deploy AI to assist in feedback, grading, and recommendations—not as a marketing gimmick. Humans remain the final decision-makers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 bg-background">
          <Card className="max-w-5xl mx-auto border-none shadow-2xl bg-gradient-to-r from-primary to-purple-600 text-white overflow-hidden relative rounded-3xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-card/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <CardContent className="p-12 md:p-20 text-center space-y-8 relative z-10">
              <h2 className="text-4xl md:text-5xl font-black font-heading leading-tight">Start Your Placement Journey</h2>
              <p className="text-lg opacity-90 max-w-xl mx-auto font-medium">
                Bridge the preparation gap and unlock targeted feedback to stand out in recruiter evaluations.
              </p>
              <div className="flex justify-center pt-4">
                <Link href="/auth">
                  <Button size="lg" className="bg-white text-primary hover:bg-slate-100 font-black px-12 py-8 text-xl shadow-xl rounded-2xl">
                    Get Started Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
