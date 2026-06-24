"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RecruiterSuccessPage() {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl -z-10" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="max-w-md w-full text-center space-y-8 p-8 bg-card/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border"
      >
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-600">
          <PartyPopper className="w-12 h-12" />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-black font-heading text-foreground">🎉 Company Profile Created!</h1>
          <p className="text-muted-foreground font-medium text-lg">
            You&apos;re ready to start discovering top talent.
          </p>
        </div>
        <Link href="/recruiter" className="block w-full">
          <Button className="w-full py-6 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl">
            Go To Recruiter Dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
