"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Loader2, Sparkles, CreditCard, ShieldCheck, HelpCircle, Star, User, Building, Landmark, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import api from "@/lib/api";
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
    ctaText: "Get Started"
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
    ctaText: "Upgrade to Pro"
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
    ctaText: "Go Premium"
  }
];

const RECRUITER_PLANS: Plan[] = [
  {
    id: "RECRUITER_STARTER",
    name: "Starter",
    priceMonthly: 999,
    priceYearly: 9590,
    description: "Ideal for small teams launching their first job postings.",
    features: [
      "5 Job Posts",
      "Resume Search",
      "AI Resume Ranking",
      "Interview Scheduling",
      "Basic Analytics"
    ],
    ctaText: "Start Hiring"
  },
  {
    id: "RECRUITER_PROFESSIONAL",
    name: "Professional",
    priceMonthly: 2999,
    priceYearly: 28790,
    badge: "Recommended",
    isPopular: true,
    description: "Full recruiting automation for scale-ups and enterprises.",
    features: [
      "Unlimited Job Posts",
      "Unlimited Resume Search",
      "AI Candidate Matching",
      "AI Skill Matching",
      "Advanced Analytics",
      "Email Automation",
      "Company Branding",
      "Bulk Candidate Import"
    ],
    ctaText: "Upgrade"
  },
  {
    id: "RECRUITER_ENTERPRISE",
    name: "Enterprise",
    priceMonthly: -1,
    priceYearly: -1,
    description: "White labeled portals and high-scale API integration.",
    features: [
      "Everything Unlimited",
      "White Label Portal",
      "API Access",
      "Dedicated Account Manager",
      "Custom Integrations",
      "Multi-company Support",
      "Enterprise Security",
      "SLA Support"
    ],
    ctaText: "Contact Sales"
  }
];

const OFFICER_PLANS: Plan[] = [
  {
    id: "OFFICER_BASIC",
    name: "Basic",
    priceMonthly: 2999,
    priceYearly: 28790,
    description: "Perfect for single college departments and cells.",
    features: [
      "Student Management",
      "Resume Approval",
      "Placement Drives",
      "Company Management",
      "Basic Analytics"
    ],
    ctaText: "Choose Plan"
  },
  {
    id: "OFFICER_PROFESSIONAL",
    name: "Professional",
    priceMonthly: 6999,
    priceYearly: 67190,
    badge: "Best Value",
    isPopular: true,
    description: "Complete student intelligence scorecard for universities.",
    features: [
      "Unlimited Students",
      "AI Placement Analytics",
      "AI Student Insights",
      "Department Reports",
      "Recruiter Portal",
      "Excel/PDF Export",
      "Placement Dashboard"
    ],
    ctaText: "Upgrade"
  },
  {
    id: "OFFICER_UNIVERSITY",
    name: "University",
    priceMonthly: -1,
    priceYearly: -1,
    description: "Enterprise scale multi-campus intelligence dashboard.",
    features: [
      "Multi-campus Support",
      "White Label Portal",
      "AI Predictive Analytics",
      "API Access",
      "Dedicated Manager",
      "Enterprise Security",
      "Unlimited Everything"
    ],
    ctaText: "Contact Sales"
  }
];

interface ComparisonRow {
  feature: string;
  values: string[];
}

const STUDENT_COMPARISON: ComparisonRow[] = [
  { feature: "Resume Upload", values: ["2 / month", "Unlimited", "Unlimited"] },
  { feature: "ATS Analysis", values: ["Basic", "Advanced", "Deep Optimization"] },
  { feature: "AI Resume Builder", values: ["✘", "✔", "✔ + Coding Assistant"] },
  { feature: "Mock Interviews", values: ["3 / month", "Unlimited (Text/Chat)", "Unlimited (Voice AI)"] },
  { feature: "Mentor Chats", values: ["5 / day", "Unlimited", "Priority + Custom Roadmap"] },
  { feature: "Eligibility Checker", values: ["✘", "✔", "✔"] },
  { feature: "Placement Prediction", values: ["✘", "✔", "Advanced AI Matrix"] },
];

const RECRUITER_COMPARISON: ComparisonRow[] = [
  { feature: "Job Posts Limit", values: ["5 Posts", "Unlimited", "Unlimited"] },
  { feature: "Resume Database Search", values: ["✔", "Unlimited", "Unlimited + Custom APIs"] },
  { feature: "Candidate Matching", values: ["Basic Search", "AI Matching Engine", "Deep Vector Integration"] },
  { feature: "Bulk Import", values: ["✘", "✔", "✔ + ATS Sync"] },
  { feature: "Company Branding", values: ["✘", "✔", "White-labeled portal"] },
  { feature: "Support SLA", values: ["Standard Email", "Priority Support", "Dedicated Manager + 99.9% SLA"] },
];

const OFFICER_COMPARISON: ComparisonRow[] = [
  { feature: "Student Profiles Managed", values: ["Up to 500", "Unlimited", "Unlimited"] },
  { feature: "Drives & Company Portal", values: ["Basic drives", "Full Recruiter Portal", "White-label University Portal"] },
  { feature: "AI Insights", values: ["✘", "Placement Predictive Models", "Custom AI Models"] },
  { feature: "Report Exports", values: ["Basic CSV", "Excel / PDF / Custom Reports", "Automatic Reports to Deans"] },
  { feature: "Campus Isolation", values: ["Single Campus", "Single Campus", "Multi-Campus Administration"] },
];

export default function SubscriptionBillingPage() {
  const { user, mutate } = useUser();
  const [activeTab, setActiveTab] = useState<"student" | "recruiter" | "officer">("student");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockOrderId, setMockOrderId] = useState("");

  const userPlan = user?.plan || "FREE";

  const getActivePlans = () => {
    switch (activeTab) {
      case "recruiter": return RECRUITER_PLANS;
      case "officer": return OFFICER_PLANS;
      default: return STUDENT_PLANS;
    }
  };

  const getActiveComparison = () => {
    switch (activeTab) {
      case "recruiter": return RECRUITER_COMPARISON;
      case "officer": return OFFICER_COMPARISON;
      default: return STUDENT_COMPARISON;
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (planId: string, price: number) => {
    if (price === 0) {
      toast.info("This is a Free tier, no checkout required.");
      return;
    }
    if (price === -1) {
      toast.success("Sales query received! Dedicated account manager will reach out shortly.");
      return;
    }

    setLoading(true);
    setSelectedPlanId(planId);
    
    // Map the plan request name, e.g. STUDENT_PRO_MONTHLY
    const planParam = `${planId}_${billingPeriod}`.toUpperCase();

    try {
      const res = await api.post("/payment/create-order", { plan: planParam });
      const { orderId, amount, currency, keyId, mock } = res.data;

      if (mock) {
        setMockOrderId(orderId);
        setShowMockModal(true);
        setLoading(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load Razorpay SDK. Please check your internet connection.");
        setLoading(false);
        return;
      }

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "PlacementAI",
        description: `Upgrade to ${planId}`,
        image: "/favicon.ico",
        order_id: orderId,
        handler: async function (response: any) {
          setLoading(true);
          try {
            await api.post("/payment/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planParam,
            });
            toast.success("Purchase successful! Subscribed to " + planId.split("_")[1]);
            await mutate();
          } catch (err) {
            toast.error("Transaction verification failed.");
          } finally {
            setLoading(false);
            setSelectedPlanId(null);
          }
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.email || "",
        },
        theme: {
          color: "#3b82f6",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setSelectedPlanId(null);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("Checkout launch error. Please try again.");
      setLoading(false);
      setSelectedPlanId(null);
    }
  };

  const handleSimulateMockSuccess = async () => {
    if (!selectedPlanId) return;
    setLoading(true);
    setShowMockModal(false);
    
    const planParam = `${selectedPlanId}_${billingPeriod}`.toUpperCase();
    
    try {
      await api.post("/payment/verify-payment", {
        razorpay_order_id: mockOrderId,
        razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
        razorpay_signature: "mock_signature",
        plan: planParam,
      });
      toast.success("Mock transaction completed successfully!");
      await mutate();
    } catch (err) {
      toast.error("Mock verification failed.");
    } finally {
      setLoading(false);
      setSelectedPlanId(null);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-16 max-w-6xl mx-auto select-none">
      
      {/* HEADER SECTION */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} /> Pricing Plans & Subscription
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-heading text-foreground tracking-tight leading-none">
          Find the perfect plan for your <span className="text-primary italic">career launch</span>
        </h1>
        <p className="text-muted-foreground text-md md:text-lg font-medium leading-relaxed">
          Upgrade your placement preparation, hiring productivity, or college monitoring modules. Cancel or modify plans at any time.
        </p>
      </div>

      {/* BILLING TOGGLE CONTAINER */}
      <div className="flex flex-col items-center justify-center gap-6">

        {/* Monthly/Yearly billing switcher */}
        <div className="flex items-center gap-3 bg-card p-2 rounded-xl border border-border shadow-inner">
          <span className={`text-xs font-bold ${billingPeriod === "monthly" ? "text-primary" : "text-muted-foreground"}`}>Monthly</span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
            className="w-12 h-6 bg-muted border border-border rounded-full p-0.5 relative transition-colors duration-300"
          >
            <div
              className={`w-5 h-5 bg-primary rounded-full shadow-md transition-all duration-300 ${
                billingPeriod === "yearly" ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <span className={`text-xs font-bold ${billingPeriod === "yearly" ? "text-primary" : "text-muted-foreground"}`}>Yearly (Save 20%)</span>
        </div>
      </div>

      {/* PLANS GRID */}
      <div className="grid md:grid-cols-3 gap-8">
        <AnimatePresence mode="wait">
          {getActivePlans().map((plan) => {
            const isCurrentPlan = userPlan === plan.id.split("_")[1];
            const isPopular = plan.isPopular;
            const price = billingPeriod === "monthly" ? plan.priceMonthly : plan.priceYearly;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <Card
                  className={`flex flex-col relative h-full overflow-hidden transition-all duration-300 border ${
                    isPopular
                      ? "border-primary/40 shadow-[0_8px_30px_rgb(59,130,246,0.08)] scale-105"
                      : "border-border hover:shadow-lg"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" /> {plan.badge}
                    </div>
                  )}

                  <CardHeader className="space-y-1 pt-8">
                    <CardTitle className="text-2xl font-bold font-heading">{plan.name}</CardTitle>
                    <CardDescription className="min-h-[40px] text-xs font-medium text-muted-foreground leading-relaxed">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-black tracking-tight text-foreground font-heading">
                        {price === 0 ? "₹0" : price === -1 ? "Custom" : `₹${price}`}
                      </span>
                      {price > 0 && (
                        <span className="text-muted-foreground ml-1.5 text-xs font-bold uppercase tracking-wider">
                          / {billingPeriod === "monthly" ? "month" : "year"}
                        </span>
                      )}
                    </div>

                    <ul className="space-y-3">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5 text-xs font-semibold text-foreground/90">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="pt-6">
                    <Button
                      onClick={() => handleUpgrade(plan.id, price)}
                      disabled={loading || isCurrentPlan || price === 0}
                      className={`w-full h-12 font-bold rounded-xl text-white ${
                        isCurrentPlan
                          ? "bg-emerald-500 hover:bg-emerald-500 cursor-default"
                          : price === 0
                          ? "bg-muted text-muted-foreground cursor-default border-none"
                          : "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                      }`}
                    >
                      {loading && selectedPlanId === plan.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : isCurrentPlan ? (
                        <span className="flex items-center justify-center gap-2">
                          <ShieldCheck className="w-5 h-5" /> Active Plan
                        </span>
                      ) : (
                        plan.ctaText
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* SANDBOX MOCK MODAL */}
      {showMockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-card border border-border p-6 rounded-3xl shadow-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-foreground">Sandbox Mode Detected</h3>
                <p className="text-[10px] text-muted-foreground font-bold">LOCAL TEST ENVIRONMENT</p>
              </div>
            </div>
            <div className="space-y-3 text-xs leading-relaxed text-muted-foreground font-medium">
              <p>
                No active Razorpay API Keys were found in the environment. We have safely initialized a sandbox order ID:
              </p>
              <code className="block bg-muted p-2.5 rounded-lg text-foreground font-mono select-all overflow-x-auto text-[10px]">
                {mockOrderId}
              </code>
              <p>
                Click below to simulate a successful payment process and complete your upgrade verification for the <strong className="text-foreground">{selectedPlanId?.split("_")[1]}</strong> plan.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => { setShowMockModal(false); setSelectedPlanId(null); }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl"
                onClick={handleSimulateMockSuccess}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simulate Success"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
