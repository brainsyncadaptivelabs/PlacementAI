import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Sparkles, Target, Users, Code, Cpu } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog & Sourcing Sizing Insights | PlacementAI",
  description: "Read practical insights on resumes, ATS engines, mock interview strategies, and modern campus hiring pipelines.",
};

const categories = [
  { icon: Target, title: "ATS Systems", desc: "Understanding parser logic, keyword density, and semantic scoring parameters." },
  { icon: BookOpen, title: "Resume Intelligence", desc: "How to draft high-impact projects with clear evidence metrics." },
  { icon: Users, title: "Campus Placements", desc: "Navigating placement drives, department evaluations, and eligibility rounds." },
  { icon: Sparkles, title: "Interview Preparation", desc: "Frameworks for answering behavioral questions and structuring speech." },
  { icon: Code, title: "Career Engineering", desc: "Bridging the academic-industry gap with coding practices." },
  { icon: Cpu, title: "AI in Recruitment", desc: "How recruiters utilize algorithms and filters to screen resumes." }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <PublicHeader />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 bg-gradient-to-b from-primary/5 via-background to-background border-b border-border/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -mr-48 -mt-48" />
          <div className="container mx-auto px-4 max-w-5xl text-center space-y-6 relative z-10">
            <h1 className="text-4xl sm:text-6xl font-black font-heading leading-tight tracking-tight">
              Placement Intelligence, <br />
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Explained</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium">
              Practical insights on resumes, ATS systems, interviews, and modern campus hiring.
            </p>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 px-4 max-w-5xl mx-auto w-full space-y-12">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-black font-heading">Resource Categories</h2>
            <p className="text-muted-foreground font-medium max-w-lg mx-auto">
              Insights and guides prepared by our platform engineers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, idx) => (
              <Card key={idx} className="border-none bg-slate-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <CardContent className="p-8 space-y-6 flex-grow">
                  <div className="flex justify-between items-center">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <cat.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-muted-foreground rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black font-heading leading-tight text-foreground">{cat.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">{cat.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 text-center max-w-xl mx-auto">
            <p className="text-sm text-muted-foreground font-medium">
              We are working on deep-dive articles regarding parser algorithms, mock feedback metrics, and interview tips. Subscribe to notifications in the dashboard to learn when updates are live.
            </p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
