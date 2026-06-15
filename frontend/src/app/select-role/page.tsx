"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GraduationCap, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SelectRolePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mx-auto mb-12 space-y-4"
      >
        <div className="inline-flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">A</div>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 font-heading tracking-tight">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">AI Placement Copilot</span>
        </h1>
        <p className="text-lg text-slate-500 font-medium">
          We&apos;re excited to have you here. Whether you&apos;re building your career or building your team, AI Placement Copilot is designed to help you succeed faster.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-br from-primary to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-100 transition duration-500" />
          <div className="relative h-full bg-white rounded-3xl p-8 flex flex-col items-center text-center space-y-6 shadow-xl border border-slate-100">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm border border-blue-100">
              <GraduationCap className="w-10 h-10" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black font-heading text-slate-900">Student</h2>
              <ul className="text-slate-500 text-sm space-y-2 font-medium text-left inline-block">
                <li className="flex items-center gap-2">✓ Build ATS-friendly resumes</li>
                <li className="flex items-center gap-2">✓ Get AI career guidance</li>
                <li className="flex items-center gap-2">✓ Prepare for interviews</li>
                <li className="flex items-center gap-2">✓ Discover jobs</li>
              </ul>
            </div>
            <div className="flex-1" />
            <Link href="/welcome/student" className="w-full">
              <Button className="w-full py-6 text-lg font-bold bg-slate-900 hover:bg-primary text-white shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
                Continue as Student <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl blur opacity-25 group-hover:opacity-100 transition duration-500" />
          <div className="relative h-full bg-white rounded-3xl p-8 flex flex-col items-center text-center space-y-6 shadow-xl border border-slate-100">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm border border-emerald-100">
              <Building2 className="w-10 h-10" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black font-heading text-slate-900">Recruiter</h2>
              <ul className="text-slate-500 text-sm space-y-2 font-medium text-left inline-block">
                <li className="flex items-center gap-2">✓ Post jobs and discover talent</li>
                <li className="flex items-center gap-2">✓ Filter resumes with AI</li>
                <li className="flex items-center gap-2">✓ Manage hiring pipeline</li>
                <li className="flex items-center gap-2">✓ Hire faster</li>
              </ul>
            </div>
            <div className="flex-1" />
            <Link href="/welcome/recruiter" className="w-full">
              <Button className="w-full py-6 text-lg font-bold bg-slate-900 hover:bg-emerald-600 text-white shadow-lg group-hover:shadow-emerald-600/30 transition-all duration-300">
                Continue as Recruiter <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
