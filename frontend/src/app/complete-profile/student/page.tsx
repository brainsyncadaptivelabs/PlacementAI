"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { YearDropdown } from "@/components/ui/year-dropdown";
import { Label } from "@/components/ui/label";
import { Loader2, X } from "lucide-react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";

export default function CompleteStudentProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    collegeName: "",
    branch: "",
    graduationYear: new Date().getFullYear(),
    linkedinUrl: "",
    githubUrl: "",
    skills: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const gradYearStr = String(formData.graduationYear || "").trim();
    if (!/^\d{4}$/.test(gradYearStr)) {
      setError("Graduation year must be exactly 4 digits.");
      return;
    }
    const gradYear = parseInt(gradYearStr, 10);
    const maxYear = new Date().getFullYear() + 4;
    if (gradYear < 2000 || gradYear > maxYear) {
      setError(`Graduation year must be between 2000 and ${maxYear}.`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/profile/student", formData);
      localStorage.setItem("role", "STUDENT");
      router.push("/success/student");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to complete profile"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10" />

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
        <h2 className="text-3xl font-black text-foreground font-heading">Complete Your Student Profile</h2>
        <p className="mt-2 text-sm text-muted-foreground font-medium">Just a few more details to personalize your experience.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-8 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <Label htmlFor="collegeName" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">College Name *</Label>
                <Input id="collegeName" required className="h-12 bg-muted" value={formData.collegeName} onChange={(e) => setFormData({...formData, collegeName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="branch" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Branch *</Label>
                  <Input id="branch" required className="h-12 bg-muted" value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="graduationYear" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Grad. Year *</Label>
                  <YearDropdown 
                    value={formData.graduationYear} 
                    onChange={(year) => setFormData({...formData, graduationYear: year as any})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="linkedinUrl" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">LinkedIn URL (Optional)</Label>
                <Input id="linkedinUrl" type="url" className="h-12 bg-muted" value={formData.linkedinUrl} onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="skills" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Skills (Comma separated) *</Label>
                <Input id="skills" required className="h-12 bg-muted" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} placeholder="e.g. React, Java, Spring Boot" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="githubUrl" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">GitHub URL (Optional)</Label>
                <Input id="githubUrl" type="url" className="h-12 bg-muted" value={formData.githubUrl} onChange={(e) => setFormData({...formData, githubUrl: e.target.value})} />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg mt-4">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save & Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
