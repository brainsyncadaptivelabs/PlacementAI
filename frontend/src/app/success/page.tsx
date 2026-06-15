"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl -z-10" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="max-w-md w-full text-center space-y-8 p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-100"
      >
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
          <ShieldCheck className="w-12 h-12" />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-black font-heading text-slate-900">Your subscription has been activated</h1>
        </div>
        <Button 
          onClick={() => router.push("/dashboard")} 
          className="w-full py-6 text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-xl"
        >
          Go To Dashboard
        </Button>
      </motion.div>
    </div>
  );
}
