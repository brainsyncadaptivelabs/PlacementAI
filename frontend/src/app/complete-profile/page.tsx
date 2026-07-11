"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, X } from "lucide-react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useUser } from "@/hooks/use-user";
import { getDashboardRouteForRole } from "@/lib/auth-routes";

export default function CompleteProfilePage() {
  const { user, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    collegeName: "",
    branch: "",
    graduationYear: 2026,
    companyName: "",
  });


  const role = user?.role;
  if (userLoading) return null;
  if (!user) {
    router.push("/auth");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await api.post("/profile/complete", formData);
      setSuccess("Profile completed successfully! Redirecting...");
      
      setTimeout(() => {
        router.push(getDashboardRouteForRole(role));
      }, 2000);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to complete profile"));
      setLoading(false);
    }
  };

  if (!role) return null;

  return (
    <div className="min-h-screen bg-muted flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Toast Notification */}
      <AnimatePresence mode="wait">
        {(error || success) && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-fit min-w-[300px] max-w-[90vw] px-4"
          >
            <div className="bg-slate-900 text-white py-3 px-5 rounded-lg shadow-2xl flex items-center justify-between gap-4 backdrop-blur-md bg-opacity-90">
              <div className="flex items-center gap-3">
                {error ? (
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold">!</div>
                ) : (
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-[10px] font-bold">✓</div>
                )}
                <span className="text-sm font-medium tracking-tight truncate max-w-[200px]">
                  {error || success}
                </span>
              </div>
              <button 
                type="button"
                onClick={() => { setError(""); setSuccess(""); }}
                className="text-muted-foreground/70 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 relative z-10">
        <div className="inline-flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">A</div>
          <span className="font-heading font-bold text-2xl tracking-tight">AI Placement <span className="text-primary">Copilot</span></span>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <Card className="border-none shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center font-heading">Complete Your Profile</CardTitle>
            <CardDescription className="text-center">Just a few more details to get you started</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-4">
              {role === "STUDENT" ? (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="collegeName">College Name</Label>
                    <Input 
                      id="collegeName" 
                      placeholder="Your College Name" 
                      type="text" 
                      required 
                      value={formData.collegeName} 
                      onChange={(e) => setFormData({...formData, collegeName: e.target.value})} 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Input 
                      id="branch" 
                      placeholder="Computer Science, etc." 
                      type="text" 
                      required 
                      value={formData.branch} 
                      onChange={(e) => setFormData({...formData, branch: e.target.value})} 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="graduationYear">Graduation Year</Label>
                    <Input 
                      id="graduationYear" 
                      type="number" 
                      required 
                      value={formData.graduationYear} 
                      onChange={(e) => setFormData({...formData, graduationYear: parseInt(e.target.value)})} 
                    />
                  </div>
                </>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input 
                    id="companyName" 
                    placeholder="Your Company Name" 
                    type="text" 
                    required 
                    value={formData.companyName} 
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})} 
                  />
                </div>
              )}

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Finish Setup"}
              </Button>
            </CardContent>
          </form>
          <CardFooter className="justify-center">
            <p className="text-xs text-muted-foreground">
              Need help? <Link href="/contact" className="text-primary hover:underline font-medium">Contact Support</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
