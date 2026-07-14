"use client";

import Link from "next/link";
import { ShieldCheck, Globe } from "lucide-react";
import PlacementAILogo from "@/components/branding/PlacementAILogo";

export function PublicFooter() {
  return (
    <footer className="bg-muted py-20 px-4 lg:px-8 border-t border-border">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-1 space-y-6">
            <Link className="flex items-center gap-2" href="/">
              <PlacementAILogo size={32} />
              <span className="font-heading font-black text-xl tracking-tight">AI Placement</span>
            </Link>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              The only AI-powered companion designed specifically to help students bridge the skill gap and land their dream offers.
            </p>
            <div className="flex gap-4">
              <a
                href="https://brainsyncadaptivelabs.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit BrainSync Adaptive Labs website"
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-primary/20 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/brainsyncadaptivelabs?igsh=enoybGM2eW96M2hr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow BrainSync Adaptive Labs on Instagram"
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-primary/20 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/brainsyncadaptive-labs/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit BrainSync Adaptive Labs on LinkedIn"
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-primary/20 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-foreground">Product</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/dashboard/ats" className="text-sm text-muted-foreground hover:text-primary transition-colors font-semibold">
                  ATS Analysis
                </Link>
              </li>
              <li>
                <Link href="/mock-interview" className="text-sm text-muted-foreground hover:text-primary transition-colors font-semibold">
                  AI Mock Interviews
                </Link>
              </li>
              <li>
                <Link href="/dashboard/roadmap" className="text-sm text-muted-foreground hover:text-primary transition-colors font-semibold">
                  Personalized Roadmaps
                </Link>
              </li>
              <li>
                <Link href="/dashboard/chat" className="text-sm text-muted-foreground hover:text-primary transition-colors font-semibold">
                  Career Chatbot
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-foreground">Company</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors font-semibold">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/mission" className="text-sm text-muted-foreground hover:text-primary transition-colors font-semibold">
                  Our Mission
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="text-sm text-muted-foreground hover:text-primary transition-colors font-semibold">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors font-semibold">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-foreground">Legal</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors font-semibold">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors font-semibold">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors font-semibold">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-20 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">
            © 2026 PlacementAI. Built with ❤️ for students by{" "}
            <a
              href="https://brainsyncadaptivelabs.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors underline decoration-dotted"
            >
              BrainSync Adaptive Labs
            </a>
            .
          </p>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-green-500" /> Privacy & Security
          </div>
        </div>
      </div>
    </footer>
  );
}
