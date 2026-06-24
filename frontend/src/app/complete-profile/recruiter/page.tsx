"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, X } from "lucide-react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";

export default function CompleteRecruiterProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    companyName: "",
    companyWebsite: "",
    companySize: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/profile/recruiter", formData);
      localStorage.setItem("role", "RECRUITER");
      router.push("/success/recruiter");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to complete profile"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -z-10" />

      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-fit min-w-[300px] max-w-[90vw] px-4"
          >
            <div className="bg-slate-900 text-white py-3 px-5 rounded-lg shadow-2xl flex items-center justify-between gap-4 backdrop-blur-md bg-opacity-90">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold">!</div>
                <span className="text-sm font-medium tracking-tight truncate max-w-[200px]">{error}</span>
              </div>
              <button type="button" onClick={() => setError("")} className="text-muted-foreground/70 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <h2 className="text-3xl font-black text-foreground font-heading">Complete Company Profile</h2>
        <p className="mt-2 text-sm text-muted-foreground font-medium">Let&apos;s set up your recruitment workspace.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-8 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <Label htmlFor="companyName" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Company Name *</Label>
                <Input id="companyName" required className="h-12 bg-muted" value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="companyWebsite" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Company Website (Optional)</Label>
                <Input id="companyWebsite" type="url" className="h-12 bg-muted" value={formData.companyWebsite} onChange={(e) => setFormData({...formData, companyWebsite: e.target.value})} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="companySize" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Company Size (Optional)</Label>
                <Input id="companySize" placeholder="e.g. 1-50, 50-200" className="h-12 bg-muted" value={formData.companySize} onChange={(e) => setFormData({...formData, companySize: e.target.value})} />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg mt-4 text-white">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save & Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
