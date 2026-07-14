"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PublicHeader } from "../layout/PublicHeader";
import { PublicFooter } from "../layout/PublicFooter";
import { AlertCircle, ChevronRight } from "lucide-react";

interface Section {
  id: string;
  title: string;
}

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  introduction: string;
  sections: Section[];
  children: React.ReactNode;
}

export function LegalLayout({ title, lastUpdated, introduction, sections, children }: LegalLayoutProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveId(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <PublicHeader />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Notice Panel */}
        <div className="mb-10 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-start gap-4 shadow-sm">
          <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed">
            <strong>Important notice:</strong> PlacementAI provides AI-assisted career and placement intelligence. AI-generated analysis is informational and does not guarantee employment outcomes, salary packages, or hiring decisions.
          </p>
        </div>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-sm font-bold text-muted-foreground uppercase tracking-wider">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-muted-foreground/60">Legal</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-primary">{title}</span>
        </nav>

        {/* Hero title */}
        <div className="border-b border-border pb-10 mb-12">
          <h1 className="text-4xl sm:text-5xl font-black font-heading tracking-tight mb-4">{title}</h1>
          <p className="text-sm font-bold text-muted-foreground/80 uppercase tracking-widest">Last Updated: {lastUpdated}</p>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium max-w-3xl">
            {introduction}
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sticky Table of Contents (Desktop Only) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28 max-h-[calc(100vh-160px)] overflow-y-auto pr-4 scrollbar-thin border-r border-border/60">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground mb-6">Table of Contents</h2>
              <ul className="space-y-4">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className={`text-sm font-semibold block transition-all duration-200 hover:text-primary leading-tight ${
                        activeId === section.id
                          ? "text-primary border-l-2 border-primary pl-3 -ml-0.5"
                          : "text-muted-foreground/80 pl-0"
                      }`}
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Legal Document Content */}
          <article className="col-span-1 lg:col-span-9 max-w-4xl mx-auto w-full prose prose-slate dark:prose-invert">
            <div className="space-y-16">
              {children}
            </div>
          </article>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
