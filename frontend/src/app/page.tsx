import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Mic, 
  Map, 
  ArrowRight, 
  CheckCircle, 
  Target, 
  Zap, 
  MessageSquare, 
  ShieldCheck,
  Star,
  Sparkles
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-card">
      {/* Header */}
      <header className="px-4 lg:px-8 h-20 flex items-center border-b border-border sticky top-0 bg-card/90 backdrop-blur-md z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">A</div>
          <span className="font-heading font-bold text-2xl tracking-tight hidden sm:inline-block">AI Placement <span className="text-primary font-black italic">Copilot</span></span>
        </Link>
        <nav className="ml-auto hidden md:flex gap-8 items-center">
          <Link className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest" href="#features">Features</Link>
          <Link className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest" href="#how-it-works">How It Works</Link>
          <Link className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest" href="#pricing">Pricing</Link>
          <Link className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest" href="#about">About Us</Link>
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
        {/* Hero Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 xl:py-48 px-4 lg:px-8 overflow-hidden relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex flex-col justify-center space-y-10 lg:w-1/2">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" /> Powered by Next-Gen AI
                  </div>
                  <h1 className="text-5xl font-black tracking-tight sm:text-6xl xl:text-7xl/none font-heading text-foreground leading-tight">
                    Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">AI-Powered</span> <br />
                    Career Co-Pilot
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-lg/relaxed xl:text-xl/relaxed font-medium">
                    AI Mock Interviews, ATS Analysis, Personalized Roadmaps and everything you need to crack top tier placements in 2026.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-6">
                  <Link href="/auth">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 px-10 py-8 text-xl font-bold shadow-xl shadow-primary/30 group">
                      Start for Free <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="px-10 py-8 text-xl font-bold border-2 hover:bg-muted">
                    See How It Works
                  </Button>
                </div>

              </div>
              <div className="lg:w-1/2 w-full relative">
                <div className="relative aspect-[4/3] rounded-3xl bg-slate-900/5 overflow-hidden border border-border shadow-2xl p-4 group">
                   <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="h-full w-full bg-card rounded-2xl border border-border shadow-inner flex items-center justify-center relative overflow-hidden">
                      <div className="absolute top-4 left-4 right-4 h-12 bg-muted rounded-lg border border-border flex items-center px-4 gap-2">
                         <div className="w-2 h-2 rounded-full bg-red-400" />
                         <div className="w-2 h-2 rounded-full bg-amber-400" />
                         <div className="w-2 h-2 rounded-full bg-green-400" />
                      </div>
                      <div className="space-y-6 w-full max-w-sm px-8">
                         <div className="space-y-2">
                            <div className="h-2 w-1/3 bg-muted rounded-full" />
                            <div className="h-8 w-full bg-muted rounded-lg animate-pulse" />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="h-20 bg-primary/5 rounded-xl border border-primary/10 flex flex-col items-center justify-center gap-2">
                               <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-[10px]">78%</div>
                               <div className="h-1.5 w-12 bg-primary/10 rounded-full" />
                            </div>
                            <div className="h-20 bg-muted rounded-xl border border-border" />
                         </div>
                         <div className="h-32 bg-muted rounded-xl border border-border flex flex-col items-center justify-center text-muted-foreground/50 font-bold text-xs uppercase tracking-widest">
                            Resume Dashboard Preview
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-24 md:py-32 bg-muted/50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
               <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em]">Core Features</h2>
               <h3 className="text-4xl font-bold font-heading text-foreground">Everything you need in one platform</h3>
               <p className="text-muted-foreground font-medium">From initial resume drafting to final interview practice, we cover every step of your placement journey.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<FileText className="w-6 h-6" />}
                title="ATS Resume Analysis"
                desc="Upload your resume and get an instant ATS compatibility score. Identify missing keywords and formatting issues that reject 70% of candidates."
                color="blue"
              />
              <FeatureCard 
                icon={<Mic className="w-6 h-6" />}
                title="AI Mock Interviews"
                desc="Practice with our role-specific AI interviewer. Get real-time feedback on your technical depth, body language, and communication clarity."
                color="purple"
              />
              <FeatureCard 
                icon={<Target className="w-6 h-6" />}
                title="JD Matching Engine"
                desc="Paste any job description and see how well your profile matches. Get a tailored list of skills you need to highlight to stand out."
                color="emerald"
              />
              <FeatureCard 
                icon={<Map className="w-6 h-6" />}
                title="Personalized Roadmaps"
                desc="Receive a custom learning path based on your career goals (e.g. SDE-1, Data Analyst). We guide you through what to learn and in what order."
                color="orange"
              />
              <FeatureCard 
                icon={<Zap className="w-6 h-6" />}
                title="Skill Gap Analyzer"
                desc="Visualize your strengths and weaknesses. Our AI detects your career level and recommends certifications to fill critical gaps."
                color="indigo"
              />
              <FeatureCard 
                icon={<MessageSquare className="w-6 h-6" />}
                title="Career AI Chatbot"
                desc="A 24/7 career mentor at your fingertips. Ask questions about salary negotiation, resume tips, or company-specific culture."
                color="rose"
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-24 md:py-32">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
               <h2 className="text-xs font-black text-secondary uppercase tracking-[0.3em]">The Process</h2>
               <h3 className="text-4xl font-bold font-heading text-foreground">4 Steps to Your Dream Job</h3>
            </div>
            
            <div className="relative">
               {/* Desktop Connector Line */}
               <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -translate-y-1/2 hidden lg:block -z-10" />
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                  <StepItem 
                    number="01" 
                    title="Upload Resume" 
                    desc="Our AI scans your resume to understand your current experience and skills." 
                    icon={<FileText className="w-5 h-5" />}
                  />
                  <StepItem 
                    number="02" 
                    title="Identify Gaps" 
                    desc="Receive a detailed report on ATS compatibility and missing keywords for your role." 
                    icon={<Target className="w-5 h-5" />}
                  />
                  <StepItem 
                    number="03" 
                    title="Practice AI Sessions" 
                    desc="Fine-tune your skills with unlimited mock interviews and chatbot guidance." 
                    icon={<Mic className="w-5 h-5" />}
                  />
                  <StepItem 
                    number="04" 
                    title="Land the Offer" 
                    desc="Apply with an optimized resume and the confidence to ace any technical round." 
                    icon={<Star className="w-5 h-5" />}
                  />
               </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-24 md:py-32 bg-slate-900 text-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
               <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em]">Pricing Plans</h2>
               <h3 className="text-4xl font-bold font-heading">Choose the right path for you</h3>
               <p className="text-muted-foreground/70 font-medium">Simple, transparent pricing to help you grow your career.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
               <PricingCard 
                  title="Free"
                  price="₹0"
                  desc="Perfect for getting started"
                  features={["2 Resume Analyses / mo", "Basic Roadmap", "Community Support", "Basic Chatbot Access"]}
                  cta="Start for Free"
               />
               <PricingCard 
                  title="Pro"
                  price="₹100"
                  desc="Everything you need to succeed"
                  features={["Unlimited Resumes", "Advanced AI Mock Interviews", "Personalized Roadmaps", "24/7 Priority Chatbot", "JD Matching Engine"]}
                  cta="Get Pro Now"
                  highlight={true}
               />
               <PricingCard 
                  title="Team"
                  price="Contact Sales"
                  desc="For colleges and bootcamp"
                  features={["Bulk Resume Analysis", "Recruiter Dashboard", "Custom Skill Tracking", "API Access", "Dedicated Manager"]}
                  cta="Contact Sales"
                  showMonthly={false}
               />
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="w-full py-24 md:py-32 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
             <div className="flex flex-col lg:flex-row gap-16 items-center">
                <div className="lg:w-1/2 space-y-8">
                   <div className="space-y-4">
                      <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em]">Our Mission</h2>
                      <h3 className="text-4xl font-bold font-heading text-foreground leading-tight">Democratizing placement prep for every student.</h3>
                      <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                        At AI Placement Copilot, we believe every student deserves a fair shot at their dream career, regardless of their background. 
                        Our team of engineers and students built this platform to bridge the widening gap between traditional education and industry expectations.
                      </p>
                      <p className="text-muted-foreground font-medium leading-relaxed">
                        We leverage cutting-edge Large Language Models and data science to provide the kind of mentorship that was previously only available to a select few.
                      </p>
                   </div>
                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <h4 className="text-3xl font-black text-primary font-heading">98%</h4>
                         <p className="text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">Success Rate</p>
                      </div>
                      <div className="space-y-2">
                         <h4 className="text-3xl font-black text-primary font-heading">50k+</h4>
                         <p className="text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">Resumes Analyzed</p>
                      </div>
                   </div>
                </div>
                <div className="lg:w-1/2 w-full grid grid-cols-2 gap-4">
                   <div className="space-y-4 pt-8">
                      <div className="h-64 bg-muted rounded-3xl overflow-hidden relative group">
                         <Image 
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400" 
                            fill 
                            sizes="(max-width: 768px) 100vw, 400px"
                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                            alt="team" 
                         />
                      </div>
                      <div className="h-48 bg-primary rounded-3xl flex items-center justify-center p-8 text-white font-bold text-center leading-tight">
                         Innovation is at our core.
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="h-48 bg-secondary rounded-3xl flex items-center justify-center p-8 text-white font-bold text-center leading-tight">
                         Built by students for students with love ❤️
                      </div>
                      <div className="h-64 bg-muted rounded-3xl overflow-hidden relative group">
                         <Image 
                            src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=400" 
                            fill 
                            sizes="(max-width: 768px) 100vw, 400px"
                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                            alt="team" 
                         />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full py-24 px-4">
           <Card className="max-w-5xl mx-auto border-none shadow-2xl bg-gradient-to-r from-primary to-secondary text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-card/10 rounded-full blur-3xl -mr-32 -mt-32" />
              <CardContent className="p-12 md:p-20 text-center space-y-10 relative z-10">
                 <h2 className="text-4xl md:text-5xl font-black font-heading leading-tight">Ready to transform your career <br className="hidden md:block" /> with AI?</h2>
                 <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <Link href="/auth">
                       <Button size="lg" className="bg-card text-primary hover:bg-muted font-black px-12 py-8 text-xl shadow-xl">Get Started Now</Button>
                    </Link>
                    <Button variant="outline" size="lg" className="border-2 border-white/40 text-white hover:bg-card/10 font-black px-12 py-8 text-xl backdrop-blur-sm">View Demo</Button>
                 </div>
              </CardContent>
           </Card>
        </section>
      </main>

      <footer className="bg-muted py-20 px-4 lg:px-8 border-t border-border">
        <div className="container mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
              <div className="col-span-1 md:col-span-1 space-y-6">
                 <Link className="flex items-center gap-2" href="/">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">A</div>
                    <span className="font-heading font-black text-xl tracking-tight">AI Placement</span>
                 </Link>
                 <p className="text-sm text-muted-foreground font-medium leading-relaxed">The only AI-powered companion designed specifically to help students bridge the skill gap and land their dream offers.</p>
                 <div className="flex gap-4">
                    {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-200" />)}
                 </div>
              </div>
              <div className="space-y-6">
                 <h4 className="font-black text-xs uppercase tracking-[0.2em] text-foreground">Product</h4>
                 <ul className="space-y-4">
                    {["ATS Analysis", "AI Mock Interviews", "Personalized Roadmaps", "Career Chatbot"].map(i => (
                       <li key={i}><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-semibold">{i}</Link></li>
                    ))}
                 </ul>
              </div>
              <div className="space-y-6">
                 <h4 className="font-black text-xs uppercase tracking-[0.2em] text-foreground">Company</h4>
                 <ul className="space-y-4">
                    {["About Us", "Our Mission", "Success Stories", "Blog"].map(i => (
                       <li key={i}><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-semibold">{i}</Link></li>
                    ))}
                 </ul>
              </div>
              <div className="space-y-6">
                 <h4 className="font-black text-xs uppercase tracking-[0.2em] text-foreground">Legal</h4>
                 <ul className="space-y-4">
                    {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(i => (
                       <li key={i}><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-semibold">{i}</Link></li>
                    ))}
                 </ul>
              </div>
           </div>
           <div className="mt-20 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">© 2026 AI Placement Copilot. Built with ❤️ for students.</p>
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">
                 <ShieldCheck className="w-4 h-4 text-green-500" /> Secure & Encrypted
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
   const colors: Record<string, string> = {
      blue: "bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white",
      purple: "bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-600 group-hover:text-white",
      emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white",
      orange: "bg-orange-50 text-orange-600 border-orange-100 group-hover:bg-orange-600 group-hover:text-white",
      indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white",
      rose: "bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-600 group-hover:text-white",
   };
   
   return (
      <Card className="border-none shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-card group p-4 overflow-hidden relative">
         <CardContent className="pt-8 pb-8 space-y-6 relative z-10">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${colors[color]}`}>
               {icon}
            </div>
            <div className="space-y-3">
               <h3 className="font-black text-xl font-heading text-foreground">{title}</h3>
               <p className="text-muted-foreground text-sm leading-relaxed font-medium">{desc}</p>
            </div>
            <Link href="/auth" className="inline-flex items-center text-sm font-black text-primary uppercase tracking-widest group-hover:underline">
               Learn More <ArrowRight className="w-3 h-3 ml-2" />
            </Link>
         </CardContent>
         <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-muted rounded-full group-hover:scale-[3] transition-transform duration-700 -z-0" />
      </Card>
   );
}

function StepItem({ number, title, desc, icon }: { number: string, title: string, desc: string, icon: React.ReactNode }) {
   return (
      <div className="space-y-6 text-center lg:text-left group relative">
         <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-card border-2 border-border shadow-sm flex items-center justify-center font-black text-foreground group-hover:border-primary group-hover:text-primary transition-all relative z-10">
               {icon}
            </div>
            <span className="text-4xl font-black text-slate-100 font-heading tracking-tighter group-hover:text-primary/10 transition-colors">{number}</span>
         </div>
         <div className="space-y-2">
            <h4 className="font-black text-xl text-foreground">{title}</h4>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">{desc}</p>
         </div>
      </div>
   );
}

function PricingCard({ title, price, desc, features, cta, highlight, showMonthly = true }: { title: string, price: string, desc: string, features: string[], cta: string, highlight?: boolean, showMonthly?: boolean }) {
   return (
      <Card className={`p-8 border-none shadow-xl flex flex-col space-y-8 relative overflow-hidden ${highlight ? 'bg-primary ring-4 ring-primary/20 scale-105 z-10' : 'bg-slate-800'}`}>
         {highlight && <div className="absolute top-4 right-4 bg-card/20 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em]">Popular</div>}
         <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] opacity-60">{title}</h4>
            <div className="flex items-baseline gap-1">
               <span className={`${price.length > 8 ? 'text-3xl' : 'text-5xl'} font-black`}>{price}</span>
               {showMonthly && <span className="text-sm font-bold opacity-60">/month</span>}
            </div>
            <p className="text-sm font-medium opacity-80">{desc}</p>
         </div>
         <div className="flex-1 space-y-4">
            {features.map(f => (
               <div key={f} className="flex gap-3 text-sm font-bold">
                  <CheckCircle className={`w-5 h-5 shrink-0 ${highlight ? 'text-white' : 'text-primary'}`} />
                  <span className="opacity-90">{f}</span>
               </div>
            ))}
         </div>
         <Button className={`w-full py-8 text-lg font-black shadow-lg ${highlight ? 'bg-card text-primary hover:bg-muted' : 'bg-primary hover:bg-primary/90'}`}>
            {cta}
         </Button>
      </Card>
   );
}
