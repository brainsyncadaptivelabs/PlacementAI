import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, TrendingUp, Sparkles, Target, BarChart2, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Success Stories | PlacementAI",
  description: "Read about how PlacementAI tracks and measures student progress, skill gap closure, and interview readiness.",
};

export default function SuccessStoriesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <PublicHeader />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 bg-gradient-to-b from-primary/5 via-background to-background border-b border-border/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -mr-48 -mt-48" />
          <div className="container mx-auto px-4 max-w-5xl text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" /> Progress Signals
            </div>
            <h1 className="text-4xl sm:text-6xl font-black font-heading leading-tight tracking-tight">
              Student Progress Stories <br />
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Are Being Built Right Now</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-medium">
              We do not publish fabricated placement reports or fake testimonials. Instead, we show the real progress signals and improvement frameworks measured inside PlacementAI.
            </p>
          </div>
        </section>

        {/* The Progress Framework */}
        <section className="py-20 px-4 max-w-5xl mx-auto w-full space-y-12">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-black font-heading">How PlacementAI Measures Progress</h2>
            <p className="text-muted-foreground font-medium max-w-xl mx-auto">
              Our dashboard maps improvement vectors across core hiring parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none bg-slate-500/5 hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-8 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                    MEASURED BY PLACEMENTAI
                  </span>
                </div>
                <h3 className="text-xl font-black font-heading">ATS Progress Tracking</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  We track your resume score progression across multiple iterations. When you adjust bullet points to emphasize quantifiable outcomes (e.g. key performance indicators, active action verbs), our parser measures the increase in density and updates your estimated readiness score.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none bg-slate-500/5 hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-8 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-purple-500/10 text-purple-500 rounded-full">
                    PROGRESS SIGNAL
                  </span>
                </div>
                <h3 className="text-xl font-black font-heading">Resume Evidence Improvement</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  Instead of showing general templates, we scan academic projects for technical evidence. We highlight missing frameworks and help candidates prove hands-on skill depth rather than listing generic terms.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none bg-slate-500/5 hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-8 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full">
                    MEASURED BY PLACEMENTAI
                  </span>
                </div>
                <h3 className="text-xl font-black font-heading">Skill Gap Closure</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  Our algorithm compares your career profile with industry role requirements. By practicing targeted coding tasks and aptitude units, the dashboard records and demonstrates the closure of key technical gap parameters.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none bg-slate-500/5 hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-8 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <BarChart2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full">
                    PROGRESS SIGNAL
                  </span>
                </div>
                <h3 className="text-xl font-black font-heading">Interview Readiness Growth</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  Practice rounds build confidence. Our AI mock interviews evaluate structural response quality and voice pacing parameters, helping students track their communication growth across preparation history.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="p-8 rounded-3xl bg-slate-500/5 border border-border/40 text-center max-w-2xl mx-auto space-y-4">
            <ShieldCheck className="w-8 h-8 text-primary mx-auto" />
            <h4 className="text-lg font-black font-heading">Why We Avoid Testimonials</h4>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              We respect your academic journey. The placement market has unique dependencies including market variables and corporate decisions. We focus on what we can measure—your preparation and resume readiness.
            </p>
          </div>

          <div className="text-center pt-8">
            <Link href="/auth">
              <Button size="lg" className="bg-primary hover:bg-primary/90 font-black px-10 py-7 rounded-2xl shadow-xl shadow-primary/20">
                Become an Early PlacementAI User <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
