"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function RecruiterWelcomePage() {
  const features = [
    "AI Candidate Screening",
    "Smart Resume Matching",
    "Talent Discovery",
    "Job Management",
    "Hiring Analytics"
  ];

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-emerald-500/10 rounded-br-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-teal-500/10 rounded-tl-full blur-3xl -z-10" />

      <Card className="max-w-4xl w-full border-none shadow-2xl bg-card/80 backdrop-blur-sm overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-emerald-600 to-teal-800 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 space-y-6"
            >
              <h1 className="text-4xl md:text-5xl font-black font-heading leading-tight">
                🏢 Welcome to the Future of Hiring
              </h1>
              <p className="text-emerald-100 text-lg font-medium">
                Find exceptional talent faster with AI-powered recruitment.
              </p>
            </motion.div>
          </div>

          <div className="p-8 md:p-12 flex flex-col justify-center space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <p className="text-muted-foreground text-lg leading-relaxed">
                Hiring great talent shouldn&apos;t be complicated. AI Placement Copilot helps you discover qualified candidates, screen resumes intelligently, and streamline your recruitment process so you can focus on building winning teams.
              </p>
              <p className="text-foreground font-bold text-lg">
                Let&apos;s find your next great hire.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 text-foreground font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>{feature}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/complete-profile/recruiter">
                <Button className="w-full py-6 text-lg font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl group">
                  Set Up My Company Profile <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </Card>
    </div>
  );
}
