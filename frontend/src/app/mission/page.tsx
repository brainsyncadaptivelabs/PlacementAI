import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Compass, Shield, BookOpen, Star, HelpCircle, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Mission | PlacementAI",
  description: "Read about our mission to make high-quality placement preparation and career intelligence accessible to every student, regardless of privilege.",
};

export default function MissionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <PublicHeader />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 bg-gradient-to-b from-primary/5 via-background to-background border-b border-border/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -mr-48 -mt-48" />
          <div className="container mx-auto px-4 max-w-5xl text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" /> Our Vision
            </div>
            <h1 className="text-4xl sm:text-6xl font-black font-heading leading-tight tracking-tight">
              Placement Readiness Should <br />
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Not Depend on Privilege</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-medium">
              We make high-quality placement intelligence accessible to students, particularly those who lack continuous access to premium mentors, career networks, or expensive placement consultants.
            </p>
          </div>
        </section>

        {/* Why We Exist */}
        <section className="py-20 px-4 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black font-heading">Why We Exist</h2>
            <p className="text-muted-foreground leading-relaxed font-medium">
              Campus placement is one of the most critical transitions in a student&apos;s life. Yet, preparation resources are heavily concentrated. Students at premier universities enjoy dedicated alumni networks, personalized coding coaching, and premium preparation tools.
            </p>
            <p className="text-muted-foreground leading-relaxed font-medium">
              We started PlacementAI to level this playing field. We believe that clean technical skills, clear logical reasoning, and polished communication should be enough to qualify for excellent roles, irrespective of personal networks or background.
            </p>
          </div>
          <div className="bg-muted p-8 rounded-3xl border border-border space-y-6">
            <h3 className="text-xl font-black font-heading">The Placement Information Gap</h3>
            <div className="space-y-4 text-sm text-muted-foreground font-medium">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">1</div>
                <p>Lack of clear, structured feedback on why resumes fail applicant screening pipelines.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">2</div>
                <p>High cost of mock interviews, personal feedback panels, and live career coaching.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">3</div>
                <p>Inefficient tracking of readiness, leading to preparation fatigue across coding, aptitude, and English communication.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Principles */}
        <section className="py-20 bg-muted/40 border-y border-border/40">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="space-y-4 mb-16 text-center">
              <h2 className="text-3xl font-black font-heading">Our Core Principles</h2>
              <p className="text-muted-foreground font-medium max-w-md mx-auto">The beliefs guiding how we build PlacementAI every day.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: User, title: "Student First", desc: "Every feature we design must add immediate educational value to the student&apos;s preparation journey." },
                { icon: BookOpen, title: "Evidence Driven", desc: "We favor objective skill validation (coding submissions, mock grading) over generic claims." },
                { icon: HelpCircle, title: "Explainable Intelligence", desc: "We explain ATS scoring gaps and provide actionable recommendations rather than showing arbitrary numbers." },
                { icon: Compass, title: "Continuous Improvement", desc: "We focus on candidate progression. Success is defined by closing skill gaps, not high static scores." },
                { icon: Star, title: "Career Accessibility", desc: "Our core platform features must remain accessible to students regardless of background." },
                { icon: Shield, title: "Responsible AI", desc: "We design AI as a supportive mentor. It evaluates prep readiness, but does not make final screening decisions." }
              ].map((princ, idx) => (
                <div key={idx} className="space-y-3 p-4 bg-background rounded-2xl border border-border/40 hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <princ.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-lg font-heading">{princ.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">{princ.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What Success Looks Like */}
        <section className="py-20 px-4 max-w-5xl mx-auto w-full space-y-12">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-black font-heading">What Success Looks Like</h2>
            <p className="text-muted-foreground font-medium max-w-xl mx-auto">We measure our success by the progress made by early users.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none bg-slate-500/5">
              <CardContent className="p-8 space-y-4">
                <h3 className="text-xl font-black font-heading">Leveling Sourcing Pipelines</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  Success means helping a student from a Tier-3 college optimize their resume, build coding proficiency, and pass recruitment screening for roles that they previously couldn&apos;t access due to institutional barriers.
                </p>
              </CardContent>
            </Card>
            <Card className="border-none bg-slate-500/5">
              <CardContent className="p-8 space-y-4">
                <h3 className="text-xl font-black font-heading">Transparency in Readiness</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  Success means replacing preparation anxiety with a clear checklist. Students see exact keyword gaps and know exactly what to improve before applying to jobs.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center pt-8">
            <Link href="/auth">
              <Button size="lg" className="bg-primary hover:bg-primary/90 font-black px-10 py-7 rounded-2xl shadow-xl shadow-primary/20">
                Join Our Mission <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
