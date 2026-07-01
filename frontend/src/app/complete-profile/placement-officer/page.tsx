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

export default function CompletePlacementOfficerProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    collegeName: "",
    department: "",
    designation: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/profile/placement-officer", formData);
      router.push("/placement-officer");
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
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center justify-between"
          >
            <span>{error}</span>
            <button onClick={() => setError("")} className="hover:opacity-80 transition-opacity">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 relative">
        <h2 className="mt-6 text-center text-4xl font-extrabold text-foreground font-heading tracking-tight">
          Complete Your Profile
        </h2>
        <p className="mt-3 text-center text-sm text-muted-foreground font-medium">
          Set up your placement officer account to get started
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 relative">
        <Card className="border-none shadow-2xl shadow-primary/5 bg-background/80 backdrop-blur-xl">
          <CardContent className="py-8 px-4 sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="collegeName">College Name</Label>
                <div className="mt-2">
                  <Input
                    id="collegeName"
                    required
                    value={formData.collegeName}
                    onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                    className="h-12 bg-background border-border"
                    placeholder="E.g., Stanford University"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="department">Department (Optional)</Label>
                <div className="mt-2">
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="h-12 bg-background border-border"
                    placeholder="E.g., Computer Science"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="designation">Designation</Label>
                <div className="mt-2">
                  <Input
                    id="designation"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="h-12 bg-background border-border"
                    placeholder="E.g., Head of Placements"
                  />
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Setup"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
