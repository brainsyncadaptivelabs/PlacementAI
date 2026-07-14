"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import PlacementAILogo from "@/components/branding/PlacementAILogo";

export function PublicHeader() {
  return (
    <header className="px-4 lg:px-8 h-20 flex items-center border-b border-border sticky top-0 bg-card/90 backdrop-blur-md z-50">
      <Link className="flex items-center justify-center gap-2" href="/">
        <PlacementAILogo size={40} />
        <span className="font-heading font-bold text-2xl tracking-tight hidden sm:inline-block">
          AI Placement <span className="text-primary font-black italic">Copilot</span>
        </span>
      </Link>
      <nav className="ml-auto hidden md:flex gap-8 items-center">
        <Link className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest" href="/#features">
          Features
        </Link>
        <Link className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest" href="/#how-it-works">
          How It Works
        </Link>
        <Link className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest" href="/about">
          About Us
        </Link>
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
  );
}
