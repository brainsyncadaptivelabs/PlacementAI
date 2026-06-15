"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Loader2, Compass, Rocket, ShieldCheck, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useUser } from "@/hooks/use-user";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const plans = [
  {
    name: "FREE",
    price: "₹0",
    description: "Ideal for exploring the core features",
    features: [
      "Basic ATS Analysis",
      "Limited Mock Interviews",
      "Standard Career Roadmap",
      "Access to Learning Resources"
    ],
    buttonText: "Continue with Free",
    popular: false,
    icon: Compass,
    color: "bg-slate-100 text-slate-600"
  },
  {
    name: "BASIC",
    price: "₹99",
    description: "Designed for focused placement prep",
    features: [
      "Advanced ATS Analysis",
      "10 Mock Interviews / month",
      "Detailed Career Roadmap",
      "Priority Support",
      "Skill Gap Analysis"
    ],
    buttonText: "Activate Basic",
    popular: true,
    icon: Rocket,
    color: "bg-primary/10 text-primary"
  },
  {
    name: "PREMIUM",
    price: "₹199",
    description: "The complete suite for career success",
    features: [
      "Unlimited ATS Analysis",
      "Unlimited Mock Interviews",
      "Customized Career Roadmap",
      "24/7 Priority Support",
      "JD Matching & Analytics",
      "Full Practice Suite Access"
    ],
    buttonText: "Activate Premium",
    popular: false,
    icon: ShieldCheck,
    color: "bg-purple-100 text-purple-600"
  }
];

export default function SelectPlanPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'error' | 'success' } | null>(null);
  const [demoPayment, setDemoPayment] = useState<{ orderId: string, planName: string, amount: number } | null>(null);
  const router = useRouter();
  const { user } = useUser();
  const hasActiveSubscription = !!(user?.plan && user.plan !== "FREE");

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePlanSelection = async (planName: string) => {
    if (hasActiveSubscription) {
      setNotification({ 
        message: `You already have an active ${user.plan} plan. You cannot purchase a new plan until the month period ends.`, 
        type: 'error' 
      });
      return;
    }
    setLoading(planName);
    console.log(`[PlanSelection] Initiating ${planName} plan...`);
    try {
      if (planName === "FREE") {
        try {
          await api.post("/payment/free");
        } catch (err) {
          console.error("[PlanSelection] Error setting free plan:", err);
        }
        console.log("[PlanSelection] Free plan activated, redirecting...");
        window.location.href = "/dashboard";
        return;
      } else {
        const response = await api.post("/payment/create-order", { plan: planName });
        const { orderId, amount, currency, keyId } = response.data;
        console.log("[PlanSelection] Order created:", orderId);

        // Check for Demo Mode (Order ID starts with order_demo_)
        if (orderId && orderId.startsWith("order_demo_")) {
          console.log("[PlanSelection] Demo mode detected, opening simulator...");
          setDemoPayment({ orderId, planName, amount });
          setLoading(null);
          return;
        }

        if (!window.Razorpay) {
          setNotification({ message: "Razorpay SDK failed to load. Please refresh the page.", type: 'error' });
          return;
        }

        const options = {
          key: keyId,
          amount: amount,
          currency: currency,
          name: "AI Placement Copilot",
          description: `${planName} Plan Subscription`,
          order_id: orderId,
          handler: async (response: any) => {
            console.log("[PlanSelection] Payment successful, verifying signature...");
            try {
              setLoading(planName);
              await api.post("/payment/verify", {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                plan: planName
              });
              console.log("[PlanSelection] Verification successful, redirecting...");
              setNotification({ message: "Payment verified! Your subscription is active.", type: 'success' });
              setTimeout(() => {
                window.location.href = "/success";
              }, 1500);
            } catch (err) {
              console.error("[PlanSelection] Verification failed:", err);
              setNotification({ message: "Payment verification failed. Please contact support.", type: 'error' });
            } finally {
              setLoading(null);
            }
          },
          modal: {
            ondismiss: function() {
              console.log("[PlanSelection] Razorpay modal closed by user");
              setLoading(null);
            }
          },
          theme: {
            color: "#6366f1",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error: any) {
      console.error("[PlanSelection] CRITICAL ERROR:", error);
      const status = error.response?.status;
      const backendMessage = error.response?.data?.message;
      const errorMessage = backendMessage || error.message;
      
      if (status === 401) {
        setNotification({ message: "Session expired. Redirecting to login...", type: 'error' });
        setTimeout(() => {
          window.location.href = "/auth";
        }, 2000);
      } else {
        setNotification({ message: `Activation failed: ${errorMessage}`, type: 'error' });
      }
    } finally {
      if (planName === "FREE") setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 relative overflow-hidden">
      {/* Back to Dashboard Navigation */}
      <button
        onClick={() => router.push("/dashboard")}
        className="fixed top-6 left-6 z-[100] flex items-center gap-2 h-[44px] px-[18px] rounded-[14px] bg-white/75 backdrop-blur-[16px] shadow-[0_8px_24px_rgba(0,0,0,0.05)] border-none hover:-translate-x-0.5 transition-all duration-[250ms] group outline-none"
      >
        <ArrowLeft className="w-4 h-4 text-slate-700" />
        <span className="text-sm font-bold text-slate-700 hidden md:inline">Dashboard</span>
      </button>

      {/* Professional Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-fit min-w-[320px] max-w-[90vw]"
          >
            <div className={`
              ${notification.type === 'error' ? 'bg-slate-900' : 'bg-primary'} 
              text-white py-4 px-6 rounded-2xl shadow-2xl flex items-center justify-between gap-4 backdrop-blur-md bg-opacity-95 border border-white/10
            `}>
              <div className="flex items-center gap-3">
                {notification.type === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                )}
                <span className="text-sm font-bold tracking-tight">
                  {notification.message}
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setNotification(null)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo Mode Payment Simulator Modal */}
      <AnimatePresence>
        {demoPayment && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold font-heading text-slate-900">Razorpay Demo Mode</h3>
                <p className="text-sm text-slate-500">
                  No real Razorpay credentials are configured. You can simulate a successful checkout for testing.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs text-slate-600 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-400">Plan:</span>
                  <span className="font-bold text-slate-900">{demoPayment.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount:</span>
                  <span className="font-bold text-slate-900">₹{demoPayment.amount / 100}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Order ID:</span>
                  <span className="font-mono text-slate-900">{demoPayment.orderId}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  className="w-full py-6 font-bold bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20"
                  onClick={async () => {
                    const planName = demoPayment.planName;
                    const orderId = demoPayment.orderId;
                    setDemoPayment(null);
                    setLoading(planName);
                    try {
                      console.log("[DemoPayment] Verifying mock payment signature...");
                      await api.post("/payment/verify", {
                        razorpayPaymentId: "pay_demo_" + Math.random().toString(36).substring(2, 9),
                        razorpayOrderId: orderId,
                        razorpaySignature: "sig_demo_" + Math.random().toString(36).substring(2, 9),
                        plan: planName
                      });
                      console.log("[DemoPayment] Verification successful, redirecting...");
                      setNotification({ message: "Mock payment verified! Your subscription is active.", type: 'success' });
                      setTimeout(() => {
                        window.location.href = "/success";
                      }, 1500);
                    } catch (err) {
                      console.error("[DemoPayment] Verification failed:", err);
                      setNotification({ message: "Mock payment verification failed.", type: 'error' });
                    } finally {
                      setLoading(null);
                    }
                  }}
                >
                  Simulate Payment Success
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full py-6 font-bold rounded-xl border-slate-200"
                  onClick={() => {
                    setDemoPayment(null);
                    setLoading(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-slate-900 font-heading tracking-tight">Choose Your Success Plan</h1>
          <p className="text-slate-500 max-w-2xl mx-auto font-medium">
            Select the plan that fits your career goals. Unlock powerful AI tools to accelerate your placement journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative border-2 transition-all duration-300 hover:shadow-2xl flex flex-col ${
                plan.popular ? "border-primary scale-105 shadow-xl z-10 bg-white" : "border-transparent hover:border-slate-200 bg-white"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md z-20">
                  Most Popular
                </div>
              )}
              
              <CardHeader className="text-center pb-2 pt-10">
                <div className={`w-12 h-12 rounded-2xl ${plan.color} flex items-center justify-center mx-auto mb-4`}>
                  <plan.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl font-bold font-heading">{plan.name}</CardTitle>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                  <span className="text-slate-400 font-bold text-sm">/month</span>
                </div>
                <CardDescription className="pt-2 font-medium">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-4 pt-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm font-semibold text-slate-600">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-8">
                <Button 
                  className={`w-full py-6 text-md font-bold rounded-xl shadow-lg transition-all ${
                    plan.popular ? "bg-primary hover:bg-primary/90 shadow-primary/20" : "bg-slate-900 hover:bg-slate-800 shadow-slate-200"
                  }`}
                  onClick={() => handlePlanSelection(plan.name)}
                  disabled={loading !== null || user?.plan === plan.name || hasActiveSubscription}
                >
                  {loading === plan.name ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : user?.plan === plan.name ? (
                    "Active Plan"
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center pt-8">
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Secure Payment via Razorpay
           </p>
        </div>
      </div>
    </div>
  );
}
