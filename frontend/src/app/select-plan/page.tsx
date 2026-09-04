"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Loader2, Sparkles, Star, Crown, ShieldCheck, Zap, ArrowRight, ShoppingCart, Plus, Minus, Layers, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import api from "@/lib/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

interface PlanItem {
  id: "FREE" | "BASIC" | "PREMIUM";
  name: string;
  price: number;
  badge?: string;
  isPopular?: boolean;
  isBestValue?: boolean;
  description: string;
  features: string[];
  ctaText: string;
  icon: React.ReactNode;
}

const PLANS: PlanItem[] = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    description: "Ideal for trying out PlacementAI's core capabilities.",
    icon: <Zap className="w-5 h-5 text-emerald-400" />,
    features: [
      "4 ATS Analyses / month",
      "Basic Profile Analytics",
      "Standard Resume Upload",
      "Community Support",
      "Ad-Supported Experience"
    ],
    ctaText: "Choose Free"
  },
  {
    id: "BASIC",
    name: "Basic",
    price: 149,
    badge: "MOST POPULAR",
    isPopular: true,
    description: "Everything you need to systematically target placement offers.",
    icon: <Star className="w-5 h-5 text-amber-400 fill-amber-400/20" />,
    features: [
      "50 ATS Analyses / month",
      "15 JD Matches / month",
      "5 Skill Gap Analyses / month",
      "5 Resume Compares / month",
      "300 AI Chatbot interactions / month",
      "30 mins English Practice / month",
      "20 mins AI Mock Interview / month",
      "Ad-Supported Experience"
    ],
    ctaText: "Choose Basic — ₹149/month"
  },
  {
    id: "PREMIUM",
    name: "Premium",
    price: 249,
    badge: "BEST VALUE",
    isBestValue: true,
    description: "Maximum limits & zero ads for serious job seekers.",
    icon: <Crown className="w-5 h-5 text-purple-400" />,
    features: [
      "150 ATS Analyses / month",
      "50 JD Matches / month",
      "20 Skill Gap Analyses / month",
      "20 Resume Compares / month",
      "1000 AI Chatbot interactions / month",
      "120 mins English Practice / month",
      "90 mins AI Mock Interview / month",
      "100% Ad-Free Experience",
      "Priority Customer Support"
    ],
    ctaText: "Choose Premium — ₹249/month"
  }
];

interface CustomFeature {
  key: string;
  name: string;
  description: string;
  priceInInr: number;
  credits: number;
  unit: string;
}

const CUSTOM_FEATURES: CustomFeature[] = [
  { key: "ATS_ANALYSIS", name: "ATS Analysis", description: "Optimize your resume for ATS systems.", priceInInr: 19, credits: 10, unit: "analyses" },
  { key: "JD_MATCH", name: "JD Match", description: "See how well your resume matches a job description.", priceInInr: 29, credits: 10, unit: "matches" },
  { key: "SKILL_GAP", name: "Skill Gap Analysis", description: "Identify missing skills and learning roadmap.", priceInInr: 39, credits: 5, unit: "analyses" },
  { key: "RESUME_COMPARE", name: "Resume Compare", description: "Side-by-side AI analysis of two resume versions.", priceInInr: 29, credits: 10, unit: "comparisons" },
  { key: "AI_CHAT", name: "AI Career Chat", description: "Interactive 24/7 AI mentor chat.", priceInInr: 29, credits: 100, unit: "messages" },
  { key: "ENGLISH_PRACTICE", name: "English Practice", description: "AI fluency and verbal confidence coaching.", priceInInr: 49, credits: 60, unit: "minutes" },
  { key: "AI_MOCK_INTERVIEW", name: "AI Mock Interview", description: "Practice realistic technical AI interviews.", priceInInr: 79, credits: 30, unit: "minutes" },
  { key: "CODING_AI_REVIEW", name: "Coding AI Review", description: "AI code review and complexity analysis.", priceInInr: 39, credits: 20, unit: "reviews" },
  { key: "RESUME_TAILORING", name: "Resume Tailoring", description: "Tailor resume bullets specifically to job target.", priceInInr: 29, credits: 5, unit: "tailorings" },
];

const COMPARISON_ROWS = [
  { feature: "ATS Analyses", free: "4 / month", basic: "50 / month", premium: "150 / month" },
  { feature: "JD Match", free: "—", basic: "15 / month", premium: "50 / month" },
  { feature: "Skill Gap Analysis", free: "—", basic: "5 / month", premium: "20 / month" },
  { feature: "Resume Compare", free: "—", basic: "5 / month", premium: "20 / month" },
  { feature: "AI Chatbot", free: "—", basic: "300 / month", premium: "1000 / month" },
  { feature: "English Practice", free: "—", basic: "30 mins / month", premium: "120 mins / month" },
  { feature: "AI Mock Interview", free: "—", basic: "20 mins / month", premium: "90 mins / month" },
  { feature: "Ad-Free Experience", free: "No (Ads)", basic: "No (Ads)", premium: "Yes (No Ads)" },
];

export default function SelectPlanPage() {
  const router = useRouter();
  const { user, mutate } = useUser();
  const [activeTab, setActiveTab] = useState<"SUBSCRIPTION" | "CUSTOM">("SUBSCRIPTION");
  const [selectedCustomKeys, setSelectedCustomKeys] = useState<string[]>([]);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if ((window as any).Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSelectPlan = async (plan: PlanItem) => {
    setLoadingPlan(plan.id);
    setError("");

    try {
      if (plan.price === 0) {
        await api.post("/payment/select-plan", { plan: "FREE" });
        document.cookie = "placementai_plan_selected=true; path=/; max-age=2592000; SameSite=Lax; Secure";
        document.cookie = "placementai_payment_completed=true; path=/; max-age=2592000; SameSite=Lax; Secure";
        await mutate();
        toast.success("Free plan activated successfully!");
        router.push("/dashboard");
        return;
      }

      const planParam = `STUDENT_${plan.id}_MONTHLY`;
      const res = await api.post("/payment/create-order", { plan: planParam });
      const { orderId, amount, currency, keyId, mock } = res.data;

      if (mock) {
        await api.post("/payment/verify-payment", {
          razorpay_order_id: orderId,
          razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
          razorpay_signature: "mock_signature",
          plan: planParam,
        });

        document.cookie = "placementai_plan_selected=true; path=/; max-age=2592000; SameSite=Lax; Secure";
        document.cookie = "placementai_payment_completed=true; path=/; max-age=2592000; SameSite=Lax; Secure";
        await mutate();
        toast.success(`${plan.name} plan activated successfully!`);
        router.push("/dashboard");
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        await api.post("/payment/verify-payment", {
          razorpay_order_id: orderId,
          razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
          razorpay_signature: "mock_signature",
          plan: planParam,
        });
        document.cookie = "placementai_plan_selected=true; path=/; max-age=2592000; SameSite=Lax; Secure";
        document.cookie = "placementai_payment_completed=true; path=/; max-age=2592000; SameSite=Lax; Secure";
        await mutate();
        toast.success(`${plan.name} plan activated successfully!`);
        router.push("/dashboard");
        return;
      }

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "PlacementAI",
        description: `${plan.name} Subscription`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            await api.post("/payment/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planParam,
            });
            document.cookie = "placementai_plan_selected=true; path=/; max-age=2592000; SameSite=Lax; Secure";
            document.cookie = "placementai_payment_completed=true; path=/; max-age=2592000; SameSite=Lax; Secure";
            await mutate();
            toast.success(`Payment verified! ${plan.name} plan activated.`);
            router.push("/dashboard");
          } catch (err: unknown) {
            setError(getErrorMessage(err, "Payment verification failed"));
          }
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.email || "",
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to initialize plan activation"));
    } finally {
      setLoadingPlan(null);
    }
  };

  const toggleCustomFeature = (key: string) => {
    setSelectedCustomKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const customTotalInr = selectedCustomKeys.reduce((sum, key) => {
    const feat = CUSTOM_FEATURES.find((f) => f.key === key);
    return sum + (feat ? feat.priceInInr : 0);
  }, 0);

  const handleCheckoutCustom = async () => {
    if (selectedCustomKeys.length === 0) {
      toast.error("Please select at least one feature pack.");
      return;
    }

    setLoadingPlan("CUSTOM");
    setError("");

    try {
      const res = await api.post("/custom-plans/create-order", {
        featureKeys: selectedCustomKeys,
      });

      const { orderId, amount, currency, keyId, mock } = res.data;

      if (mock) {
        await api.post("/custom-plans/verify-payment", {
          razorpay_order_id: orderId,
          razorpay_payment_id: "pay_mock_custom_" + Math.random().toString(36).substring(7),
          razorpay_signature: "mock_signature",
          featureKeys: selectedCustomKeys,
        });

        document.cookie = "placementai_plan_selected=true; path=/; max-age=2592000; SameSite=Lax; Secure";
        document.cookie = "placementai_payment_completed=true; path=/; max-age=2592000; SameSite=Lax; Secure";
        await mutate();
        toast.success("Custom Feature Pack credits activated successfully!");
        router.push("/dashboard/wallet");
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        await api.post("/custom-plans/verify-payment", {
          razorpay_order_id: orderId,
          razorpay_payment_id: "pay_mock_custom_" + Math.random().toString(36).substring(7),
          razorpay_signature: "mock_signature",
          featureKeys: selectedCustomKeys,
        });
        document.cookie = "placementai_plan_selected=true; path=/; max-age=2592000; SameSite=Lax; Secure";
        document.cookie = "placementai_payment_completed=true; path=/; max-age=2592000; SameSite=Lax; Secure";
        await mutate();
        toast.success("Custom Feature Pack credits activated!");
        router.push("/dashboard/wallet");
        return;
      }

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "PlacementAI",
        description: `Custom Feature Pack Purchase (${selectedCustomKeys.length} items)`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            await api.post("/custom-plans/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              featureKeys: selectedCustomKeys,
            });
            document.cookie = "placementai_plan_selected=true; path=/; max-age=2592000; SameSite=Lax; Secure";
            document.cookie = "placementai_payment_completed=true; path=/; max-age=2592000; SameSite=Lax; Secure";
            await mutate();
            toast.success("Payment verified! Custom credits added to your account.");
            router.push("/dashboard/wallet");
          } catch (err: unknown) {
            setError(getErrorMessage(err, "Custom payment verification failed"));
          }
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.email || "",
        },
        theme: {
          color: "#059669",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to checkout Custom Feature Pack"));
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden select-none">
      {/* Ambient background glowing gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/10 to-transparent blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-emerald-600/10 blur-[100px] -z-10 pointer-events-none" />

      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-4 pt-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> PlacementAI Pricing Options
        </motion.div>
        
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl sm:text-5xl font-black font-heading tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Choose Your PlacementAI Experience
        </motion.h1>
        
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-medium">
          Select a monthly subscription plan or build a custom pay-per-feature credit pack tailored strictly to your needs.
        </motion.p>

        {/* Tab Switcher */}
        <div className="flex justify-center pt-2">
          <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl flex items-center gap-2 backdrop-blur-md shadow-xl">
            <button
              onClick={() => setActiveTab("SUBSCRIPTION")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "SUBSCRIPTION"
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4" /> Monthly Subscriptions
            </button>
            <button
              onClick={() => setActiveTab("CUSTOM")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "CUSTOM"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ShoppingCart className="w-4 h-4" /> Build Your Own (Custom)
            </button>
          </div>
        </div>
      </div>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-6 right-6 z-50 bg-red-950/90 border border-red-800/80 text-red-200 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
            <span className="text-sm font-semibold">{error}</span>
            <button onClick={() => setError("")} className="text-red-400 hover:text-white"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab 1: Subscriptions */}
      {activeTab === "SUBSCRIPTION" && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 my-10 w-full items-stretch">
            {PLANS.map((plan, idx) => {
              const isLoading = loadingPlan === plan.id;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex flex-col h-full"
                >
                  <Card
                    className={`relative flex flex-col justify-between h-full border transition-all duration-300 ${
                      plan.isPopular
                        ? "bg-gradient-to-b from-indigo-950/80 via-slate-900/90 to-slate-950/90 border-indigo-500/60 shadow-2xl shadow-indigo-950/50 scale-[1.02] z-10"
                        : plan.isBestValue
                        ? "bg-gradient-to-b from-purple-950/70 via-slate-900/90 to-slate-950/90 border-purple-500/50 shadow-xl shadow-purple-950/30"
                        : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                    } backdrop-blur-xl rounded-2xl overflow-hidden`}
                  >
                    {plan.badge && (
                      <div className="absolute top-0 inset-x-0">
                        <div
                          className={`text-[10px] font-bold tracking-widest uppercase py-1.5 text-center text-white ${
                            plan.isPopular
                              ? "bg-gradient-to-r from-indigo-600 to-indigo-500"
                              : "bg-gradient-to-r from-purple-600 to-pink-600"
                          }`}
                        >
                          {plan.badge}
                        </div>
                      </div>
                    )}

                    <CardHeader className={`${plan.badge ? "pt-9" : "pt-6"} pb-4 px-6`}>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold font-heading text-white flex items-center gap-2">
                          {plan.icon} {plan.name}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-slate-900 text-xs mt-1.5 h-9 font-extrabold">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="px-6 py-4 flex-grow space-y-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl sm:text-5xl font-black font-heading tracking-tight text-slate-900">
                          ₹{plan.price}
                        </span>
                        <span className="text-slate-400 text-xs font-semibold">/month</span>
                      </div>

                      <div className="space-y-3 pt-2">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Features Included:</p>
                        <ul className="space-y-2.5">
                          {plan.features.map((feat) => (
                            <li key={feat} className="flex items-start gap-2.5 text-xs text-slate-900 font-extrabold">
                              <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.isPopular ? "text-indigo-400" : plan.isBestValue ? "text-purple-400" : "text-emerald-400"}`} />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>

                    <CardFooter className="px-6 pb-6 pt-4">
                      <Button
                        disabled={loadingPlan !== null}
                        onClick={() => handleSelectPlan(plan)}
                        className={`w-full h-12 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                          plan.isPopular
                            ? "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-600/30"
                            : plan.isBestValue
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-600/30"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700"
                        }`}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            {plan.ctaText}
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Feature Comparison Section */}
          <div className="max-w-5xl mx-auto w-full my-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold font-heading text-white">Compare Plan Features</h2>
              <p className="text-xs text-slate-400 mt-1">Detailed quota breakdown across all subscription tiers.</p>
            </div>

            <div className="border border-slate-300 bg-white rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-200 text-slate-900">
                      <th className="py-4 px-6 font-extrabold uppercase tracking-wider text-slate-900">Feature</th>
                      <th className="py-4 px-6 font-extrabold text-center text-emerald-700">Free (₹0)</th>
                      <th className="py-4 px-6 font-extrabold text-center text-amber-700">Basic (₹149/mo)</th>
                      <th className="py-4 px-6 font-extrabold text-center text-purple-700">Premium (₹249/mo)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {COMPARISON_ROWS.map((row, i) => (
                      <tr key={row.feature} className={i % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                        <td className="py-3.5 px-6 font-extrabold text-slate-900">{row.feature}</td>
                        <td className="py-3.5 px-6 text-center font-extrabold text-slate-900">{row.free}</td>
                        <td className="py-3.5 px-6 text-center font-extrabold text-slate-900 bg-indigo-500/10">{row.basic}</td>
                        <td className="py-3.5 px-6 text-center font-extrabold text-slate-900 bg-purple-500/10">{row.premium}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 2: Custom Feature Pack Builder */}
      {activeTab === "CUSTOM" && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className="max-w-6xl mx-auto w-full my-10 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold font-heading text-white">Build Your Own PlacementAI</h2>
            <p className="text-xs text-slate-400">Only pay for the exact features you need. Feature credits remain active for 30 days.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Feature selector list (2 cols on lg) */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CUSTOM_FEATURES.map((feat) => {
                const isSelected = selectedCustomKeys.includes(feat.key);
                return (
                  <div
                    key={feat.key}
                    onClick={() => toggleCustomFeature(feat.key)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-gradient-to-b from-emerald-950/60 to-slate-900/90 border-emerald-500/70 shadow-lg shadow-emerald-950/40"
                        : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-white text-sm font-heading">{feat.name}</h4>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 transition-all ${isSelected ? "bg-emerald-500 text-slate-950 font-bold" : "border border-slate-700 text-slate-500"}`}>
                          {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3 h-3" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-medium">{feat.description}</p>
                    </div>

                    <div className="flex items-baseline justify-between mt-4 pt-3 border-t border-slate-800/60">
                      <span className="text-xs font-semibold text-emerald-400">{feat.credits} {feat.unit}</span>
                      <span className="text-lg font-black text-white font-heading">₹{feat.priceInInr}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Order Summary / Cart */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl sticky top-8 shadow-2xl rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-extrabold font-heading text-slate-900 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-emerald-600" /> Build Your Plan
                  </CardTitle>
                  <CardDescription className="text-xs font-bold text-slate-900">
                    Selected feature credits summary
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {selectedCustomKeys.length === 0 ? (
                    <div className="text-center py-8 text-slate-900 text-xs font-extrabold space-y-2 border border-dashed border-slate-400 rounded-xl">
                      <p>No features selected yet.</p>
                      <p className="text-[11px] font-bold text-slate-700">Click on feature cards to add them to your custom pack.</p>
                    </div>
                  ) : (
                    <ul className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {selectedCustomKeys.map((key) => {
                        const item = CUSTOM_FEATURES.find((f) => f.key === key);
                        if (!item) return null;
                        return (
                          <li key={key} className="flex items-center justify-between text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                            <div>
                              <p className="font-extrabold text-slate-900">{item.name}</p>
                              <p className="text-[10px] text-emerald-700 font-bold">{item.credits} {item.unit}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900">₹{item.priceInInr}</span>
                              <button onClick={(e) => { e.stopPropagation(); toggleCustomFeature(key); }} className="text-slate-600 hover:text-red-500 p-0.5">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <div className="pt-4 border-t border-slate-300 space-y-2">
                    <div className="flex justify-between items-baseline text-sm">
                      <span className="text-slate-900 font-extrabold">Subtotal</span>
                      <span className="text-2xl font-black text-slate-900 font-heading">₹{customTotalInr}</span>
                    </div>
                    <p className="text-[10px] text-slate-800 font-bold">Includes 30 days validity per feature pack.</p>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 pb-6">
                  <Button
                    disabled={selectedCustomKeys.length === 0 || loadingPlan !== null}
                    onClick={handleCheckoutCustom}
                    className="w-full h-12 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    {loadingPlan === "CUSTOM" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Checkout Custom Pack (₹{customTotalInr})
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </motion.div>
      )}

      {/* Footer info */}
      <div className="max-w-2xl mx-auto text-center text-slate-500 text-xs space-y-2 pb-4">
        <p className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure 256-bit Razorpay Test SSL Sandbox Payment Protection
        </p>
        <p>Questions? Contact PlacementAI support anytime or view billing details from your dashboard settings.</p>
      </div>
    </div>
  );
}
