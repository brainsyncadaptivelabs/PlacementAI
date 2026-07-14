import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Brain,
  Compass,
  Activity,
  Award,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-card">
      {/* SECTION 1 — NAVBAR */}
      <header className="px-4 lg:px-8 h-20 flex items-center border-b border-border sticky top-0 bg-card/90 backdrop-blur-md z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">A</div>
          <span className="font-heading font-bold text-2xl tracking-tight hidden sm:inline-block">AI Placement <span className="text-primary font-black italic">Copilot</span></span>
        </Link>
        <nav className="ml-auto hidden md:flex gap-8 items-center">
          <Link className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest" href="#product">Product</Link>
          <Link className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest" href="#how-it-works">How It Works</Link>
          <Link className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest" href="/about">For Colleges</Link>
          <div className="h-6 w-px bg-slate-200 mx-2" />
          <Link href="/auth">
            <Button variant="ghost" className="font-bold text-foreground">Login</Button>
          </Link>
          <Link href="/auth">
            <Button className="bg-primary hover:bg-primary/90 font-bold px-6 shadow-lg shadow-primary/20">Get Started</Button>
          </Link>
        </nav>
        <div className="ml-auto md:hidden">
          <Link href="/auth">
             <Button size="sm" className="font-bold">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* SECTION 2 — HERO */}
        <section className="w-full py-16 md:py-24 lg:py-32 px-4 lg:px-8 overflow-hidden relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex flex-col justify-center space-y-8 lg:w-1/2">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest w-fit">
                    <Sparkles className="w-3 h-3" /> AI Placement Intelligence for Students
                  </div>
                  <h1 className="text-4xl font-black tracking-tight sm:text-5xl xl:text-6xl font-heading text-foreground leading-tight">
                    Know exactly what stands between you and your next offer.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-lg font-medium leading-relaxed">
                    PlacementAI analyzes your resume, skills, interview readiness, and career gaps to build a personalized path toward becoming placement-ready.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/auth">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 py-7 text-lg font-bold shadow-xl shadow-primary/30 group">
                      Analyze My Placement Readiness <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* HERO VISUAL: Sleek Placement Readiness Score Dashboard Panel */}
              <div className="lg:w-1/2 w-full relative">
                <div className="relative aspect-[4/3] rounded-3xl bg-slate-900/5 overflow-hidden border border-border shadow-2xl p-6">
                   <div className="h-full w-full bg-card rounded-2xl border border-border shadow-inner p-6 flex flex-col justify-between relative overflow-hidden">
                      <div className="flex items-center justify-between border-b border-border pb-4">
                         <div className="flex items-center gap-2">
                            <span className="font-heading font-black text-sm text-foreground">PLACEMENT INTELLIGENCE PROFILE</span>
                            <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full">ACTIVE</span>
                         </div>
                         <div className="text-xs text-muted-foreground font-medium">Updated: Just Now</div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 my-4">
                         <div className="bg-primary/5 rounded-2xl border border-primary/10 p-4 flex flex-col items-center justify-center gap-2">
                            <div className="text-3xl font-black text-primary font-heading">85%</div>
                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">ATS Compatibility</div>
                         </div>
                         <div className="bg-secondary/5 rounded-2xl border border-secondary/10 p-4 flex flex-col items-center justify-center gap-2">
                            <div className="text-3xl font-black text-secondary font-heading">92%</div>
                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">Skill Readiness</div>
                         </div>
                      </div>

                      <div className="space-y-3 bg-muted/50 p-4 rounded-xl border border-border">
                         <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-foreground">Next High-Priority Action:</span>
                            <span className="text-primary font-black uppercase text-[10px] tracking-widest">IMMEDIATE</span>
                         </div>
                         <div className="text-xs text-muted-foreground leading-relaxed">
                           "Add evidence-backed project details for AWS & Docker skills to fill JD alignment gap."
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 — STUDENT PROBLEM / VALUE BRIDGE */}
        <section className="w-full py-16 md:py-24 border-t border-b border-border bg-muted/20">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="lg:w-1/2 space-y-4">
                <h2 className="text-3xl md:text-4xl font-black font-heading text-foreground leading-tight">
                  Most students prepare harder.<br />Few know what they should fix first.
                </h2>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  Resumes, coding, aptitude, interviews, and skills are usually prepared separately. PlacementAI connects these signals and identifies the gaps that matter most for your placement journey.
                </p>
              </div>
              <div className="lg:w-1/2 w-full space-y-4">
                <div className="flex gap-4 items-start p-4 bg-card rounded-2xl border border-border shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm shrink-0">!</div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">Resume not getting shortlisted</h4>
                    <p className="text-xs text-muted-foreground">Unclear keyword alignment and structural formatting issues reject candidates instantly.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start p-4 bg-card rounded-2xl border border-border shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm shrink-0">!</div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">Unsure which skills are missing</h4>
                    <p className="text-xs text-muted-foreground">Studying generic courses without auditing exact skills required by target recruiters.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start p-4 bg-card rounded-2xl border border-border shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm shrink-0">!</div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">Preparing without knowing placement readiness</h4>
                    <p className="text-xs text-muted-foreground">Facing real interviews without understanding communication confidence and technical gaps.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4 — CORE PLACEMENT INTELLIGENCE SYSTEM */}
        <section id="product" className="w-full py-24 bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
               <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em]">System Overview</h2>
               <h3 className="text-4xl font-black font-heading text-foreground">One unified placement intelligence copilot</h3>
               <p className="text-muted-foreground font-medium">PlacementAI analyzes all aspects of your career profile to build structural readiness signals.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <PillarCard
                icon={<FileText className="w-6 h-6" />}
                title="Resume Intelligence"
                desc="Audits your resume compatibility with real corporate applicant tracking systems."
                labels={["ATS analysis", "Resume evidence quality", "JD compatibility"]}
              />
              <PillarCard
                icon={<Compass className="w-6 h-6" />}
                title="Skill Intelligence"
                desc="Detects verification credentials and maps priority learning tracks."
                labels={["Skill gap detection", "Evidence-backed skills", "Personalized learning roadmap"]}
              />
              <PillarCard
                icon={<Brain className="w-6 h-6" />}
                title="Interview Intelligence"
                desc="Role-specific mock interviews assessing body language and speaking metrics."
                labels={["AI mock interviews", "Answer analysis", "Communication signals"]}
              />
              <PillarCard
                icon={<Activity className="w-6 h-6" />}
                title="Placement Readiness"
                desc="Consolidates isolated parameters into a verified, actionable scorecard."
                labels={["Readiness score", "Priority gaps", "Next best action"]}
              />
            </div>
          </div>
        </section>

        {/* SECTION 5 — HOW PLACEMENTAI WORKS */}
        <section id="how-it-works" className="w-full py-24 border-t border-b border-border bg-muted/10">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
               <h2 className="text-xs font-black text-secondary uppercase tracking-[0.3em]">The Workflow</h2>
               <h3 className="text-4xl font-black font-heading text-foreground">Exactly 3 Steps to Success</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto relative">
              <StepItem
                number="01"
                title="Build Your Placement Profile"
                desc="Compile your resume, core skills, academics, projects, and target career paths in one dashboard."
                icon={<FileText className="w-5 h-5" />}
              />
              <StepItem
                number="02"
                title="PlacementAI Analyzes Your Evidence"
                desc="Get real-time feedback on ATS score, skill credibility, and communication indicators."
                icon={<Brain className="w-5 h-5" />}
              />
              <StepItem
                number="03"
                title="Follow Your Priority Action Plan"
                desc="Track explainable readiness indicators, resolve priority gaps, and trace progress over time."
                icon={<Award className="w-5 h-5" />}
              />
            </div>
          </div>
        </section>

        {/* SECTION 6 — PLACEMENT READINESS / TRUST OUTCOME */}
        <section className="w-full py-24 bg-card">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="lg:w-1/2 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em]">Measurable Outcome</h2>
                  <h3 className="text-4xl font-black font-heading text-foreground leading-tight">Your placement preparation should be measurable.</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    PlacementAI turns disconnected preparation activity into explainable readiness signals and prioritized actions.
                  </p>
                </div>
                <div className="space-y-4 border-t border-border pt-6">
                   <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-sm font-bold text-foreground">Evidence-based analysis</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <Brain className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-sm font-bold text-foreground">Explainable AI insights</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-sm font-bold text-foreground">Progress tracked over time</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-sm font-bold text-foreground">Built specifically for placement preparation</span>
                   </div>
                </div>
              </div>

              {/* Trust Panel Mock Data Card */}
              <div className="lg:w-1/2 w-full">
                 <Card className="p-6 border border-border shadow-xl bg-card">
                    <CardContent className="space-y-6 p-0">
                       <div className="font-heading font-black text-sm text-foreground border-b border-border pb-3 uppercase">Placement Readiness Metrics (Sample Profile)</div>
                       <div className="space-y-4">
                          <div className="space-y-2">
                             <div className="flex justify-between text-xs font-bold text-muted-foreground">
                                <span>Resume Readiness</span>
                                <span>85/100</span>
                             </div>
                             <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                <div className="bg-primary h-full rounded-full" style={{ width: "85%" }} />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <div className="flex justify-between text-xs font-bold text-muted-foreground">
                                <span>Skill Evidence</span>
                                <span>78/100</span>
                             </div>
                             <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                <div className="bg-primary h-full rounded-full" style={{ width: "78%" }} />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <div className="flex justify-between text-xs font-bold text-muted-foreground">
                                <span>Interview Readiness</span>
                                <span>90/100</span>
                             </div>
                             <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                <div className="bg-primary h-full rounded-full" style={{ width: "90%" }} />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <div className="flex justify-between text-xs font-bold text-muted-foreground">
                                <span>Technical Preparation</span>
                                <span>82/100</span>
                             </div>
                             <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                <div className="bg-primary h-full rounded-full" style={{ width: "82%" }} />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <div className="flex justify-between text-xs font-bold text-muted-foreground">
                                <span>Career Alignment</span>
                                <span>95/100</span>
                             </div>
                             <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                <div className="bg-primary h-full rounded-full" style={{ width: "95%" }} />
                             </div>
                          </div>
                       </div>
                    </CardContent>
                 </Card>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7 — FINAL CTA */}
        <section className="w-full py-24 px-4 bg-muted/30 border-t border-border">
           <div className="max-w-4xl mx-auto rounded-3xl shadow-2xl bg-gradient-to-r from-primary to-secondary text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="p-12 md:p-16 text-center space-y-8 relative z-10">
                 <h2 className="text-3xl md:text-4xl font-black font-heading leading-tight text-white select-text">
                   Stop guessing what to prepare next.
                 </h2>
                 <p className="max-w-2xl mx-auto text-white/80 text-sm md:text-base font-medium select-text">
                   See your placement readiness, identify your highest-priority gaps, and build a clearer path toward your next opportunity.
                 </p>
                 <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                    <Link href="/auth">
                       <Button size="lg" className="bg-white text-primary hover:bg-slate-100 font-bold px-8 py-6 text-base shadow-xl">
                         Analyze My Placement Readiness
                       </Button>
                    </Link>
                    <Link href="#product">
                       <Button variant="outline" size="lg" className="border-2 border-white/40 text-white hover:bg-white/10 font-bold px-8 py-6 text-base backdrop-blur-sm">
                         Explore PlacementAI
                       </Button>
                    </Link>
                 </div>
              </div>
           </div>
        </section>
      </main>

      {/* SECTION 8 — FOOTER */}
      <PublicFooter />
    </div>
  );
}

function PillarCard({ icon, title, desc, labels }: { icon: React.ReactNode, title: string, desc: string, labels: string[] }) {
   return (
      <Card className="border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card p-6">
         <CardContent className="space-y-4 p-0">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
               {icon}
            </div>
            <div className="space-y-2">
               <h3 className="font-black text-xl font-heading text-foreground">{title}</h3>
               <p className="text-muted-foreground text-sm leading-relaxed font-medium">{desc}</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
               {labels.map(l => (
                  <span key={l} className="bg-muted text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{l}</span>
               ))}
            </div>
         </CardContent>
      </Card>
   );
}

function StepItem({ number, title, desc, icon }: { number: string, title: string, desc: string, icon: React.ReactNode }) {
   return (
      <div className="space-y-4 group">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-card border-2 border-border shadow-sm flex items-center justify-center font-black text-foreground group-hover:border-primary group-hover:text-primary transition-all relative z-10">
               {icon}
            </div>
            <span className="text-3xl font-black text-muted-foreground/30 font-heading tracking-tighter group-hover:text-primary/20 transition-colors">{number}</span>
         </div>
         <div className="space-y-2">
            <h4 className="font-black text-lg text-foreground">{title}</h4>
            <p className="text-muted-foreground text-xs font-medium leading-relaxed">{desc}</p>
         </div>
      </div>
   );
}
