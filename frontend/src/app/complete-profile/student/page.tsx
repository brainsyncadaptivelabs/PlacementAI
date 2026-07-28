"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { YearDropdown } from "@/components/ui/year-dropdown";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { useUser } from "@/hooks/use-user";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  badge?: string;
  description: string;
  features: string[];
  ctaText: string;
  isPopular?: boolean;
}

const STUDENT_PLANS: Plan[] = [
  {
    id: "STUDENT_FREE",
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    description: "Essential features to test your placement preparation.",
    features: [
      "Resume Upload (2 per month)",
      "Basic ATS Score",
      "Basic Resume Analysis",
      "3 Mock Interviews per month",
      "Basic Coding Practice",
      "5 AI Career Mentor chats/day",
      "Community Support"
    ],
    ctaText: "Select Free"
  },
  {
    id: "STUDENT_PRO",
    name: "Pro",
    priceMonthly: 199,
    priceYearly: 1910,
    badge: "Most Popular",
    isPopular: true,
    description: "Advanced prep resources to guarantee selection.",
    features: [
      "Unlimited Resume Analysis",
      "Unlimited ATS Score",
      "AI Resume Builder",
      "Unlimited Mock Interviews",
      "Unlimited Coding Practice",
      "AI Career Mentor",
      "Skill Gap Analysis",
      "Company Eligibility Checker",
      "Learning Roadmap",
      "Placement Prediction",
      "Email Support"
    ],
    ctaText: "Activate Pro"
  },
  {
    id: "STUDENT_PREMIUM",
    name: "Premium",
    priceMonthly: 499,
    priceYearly: 4790,
    description: "Premium tools for executive preparation.",
    features: [
      "Everything in Pro",
      "Voice AI Mock Interview",
      "Advanced Resume Optimization",
      "AI Coding Assistant",
      "Personalized Learning Roadmap",
      "Advanced Placement Prediction",
      "Premium Dashboard",
      "Priority Support"
    ],
    ctaText: "Activate Premium"
  }
];

export default function CompleteStudentProfile() {
  const router = useRouter();
  const { mutate } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    collegeName: "",
    branch: "",
    graduationYear: new Date().getFullYear(),
    linkedinUrl: "",
    githubUrl: "",
    skills: ""
  });

  const handleSubmitProfile = async (e: React.FormEvent) => {
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
      await mutate();
      setStep(2); // Move to plan selection
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to complete profile"));
    } finally {
      setLoading(false);
    }
  };

  const handleActivatePlan = async (planId: string, price: number) => {
    setSelectedPlanId(planId);
    setLoading(true);
    
    try {
      if (price === 0) {
        toast.success("Free plan selected.");
        await mutate();
        router.push("/dashboard");
        return;
      }

      const planParam = `${planId}_MONTHLY`.toUpperCase();
      const res = await api.post("/payment/create-order", { plan: planParam });
      const { orderId, mock } = res.data; 

      if (mock) {
        await api.post("/payment/verify-payment", {
          razorpay_order_id: orderId,
          razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
          razorpay_signature: "mock_signature",
          plan: planParam,
        });
      }

      toast.success("Plan activated successfully!");
      await mutate();
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to activate plan"));
    } finally {
      setLoading(false);
      setSelectedPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col justify-center py-[clamp(16px,4vh,48px)] px-[clamp(12px,2vw,32px)] relative overflow-hidden">
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
 
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sm:mx-auto sm:w-full sm:max-w-4xl text-center mb-8">
        <h2 className="text-3xl font-black text-foreground font-heading">
          {step === 1 ? "Complete Your Student Profile" : "Select Your Plan"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground font-medium">
          {step === 1 ? "Just a few more details to personalize your experience." : "Choose a plan to activate your dashboard."}
        </p>
      </motion.div>
 
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="sm:mx-auto sm:w-full sm:max-w-md">
            <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-sm">
              <CardContent className="pt-8 px-8 pb-8">
                <form onSubmit={handleSubmitProfile} className="space-y-6">
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
        )}
 
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sm:mx-auto sm:w-full sm:max-w-5xl">
            <div className="fluid-grid">
              {STUDENT_PLANS.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${plan.isPopular ? 'border-primary shadow-md scale-105 z-10 bg-gradient-to-b from-primary/5 to-transparent' : 'border-border/50 hover:border-primary/50'}`}
                >
                  {plan.isPopular && (
                    <div className="absolute top-0 left-0 w-full">
                      <div className="bg-primary text-white text-xs font-bold py-1.5 text-center flex items-center justify-center gap-1.5 uppercase tracking-wider">
                        <Star className="w-3 h-3 fill-white" /> Most Popular
                      </div>
                    </div>
                  )}
                  <CardHeader className={plan.isPopular ? "pt-10" : ""}>
                    <CardTitle className="text-2xl font-bold font-heading">{plan.name}</CardTitle>
                    <CardDescription className="h-10 mt-2 font-medium">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black font-heading text-foreground">₹{plan.priceMonthly}</span>
                      <span className="text-muted-foreground font-medium">/month</span>
                    </div>
                    <ul className="space-y-3.5">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                          <div className="rounded-full p-0.5 bg-primary/10 text-primary mt-0.5 shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="pb-8 px-6">
                    <Button 
                      disabled={loading}
                      onClick={() => handleActivatePlan(plan.id, plan.priceMonthly)} 
                      className={`w-full h-12 font-bold text-base ${plan.isPopular ? 'bg-primary hover:bg-primary/90 text-white shadow-lg' : 'bg-secondary hover:bg-secondary/80 text-foreground border border-border'}`}
                    >
                      {loading && selectedPlanId === plan.id ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                      {plan.ctaText}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
