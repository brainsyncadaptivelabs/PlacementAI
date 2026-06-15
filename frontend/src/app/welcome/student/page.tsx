"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function StudentWelcomePage() {
  const features = [
    "AI Resume Builder",
    "ATS Score Analysis",
    "Smart Job Recommendations",
    "Interview Preparation",
    "Application Tracking"
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/10 rounded-bl-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-500/10 rounded-tr-full blur-3xl -z-10" />

      <Card className="max-w-4xl w-full border-none shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-primary to-blue-600 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 space-y-6"
            >
              <h1 className="text-4xl md:text-5xl font-black font-heading leading-tight">
                🎓 Welcome to Your Career Launchpad
              </h1>
              <p className="text-blue-100 text-lg font-medium">
                Turn your skills into opportunities with AI-powered guidance.
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
              <p className="text-slate-600 text-lg leading-relaxed">
                Every successful career starts with a single step. Build a professional resume, discover opportunities tailored to your skills, prepare for interviews, and track your placement journey—all in one place.
              </p>
              <p className="text-slate-800 font-bold text-lg">
                Let&apos;s help you land the job you deserve.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 text-slate-700 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/complete-profile/student">
                <Button className="w-full py-6 text-lg font-black bg-primary hover:bg-primary/90 text-white shadow-xl group">
                  Let&apos;s Build My Profile <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </Card>
    </div>
  );
}
