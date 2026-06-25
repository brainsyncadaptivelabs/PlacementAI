"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, Compass, Rocket, ShieldCheck, X, AlertCircle, CheckCircle2, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useUser } from "@/hooks/use-user";
import { PageShell } from "@/components/ui/theme-components";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const plans = [
  {
    id: "FREE",
    name: "Free",
    price: "₹0",
    description: "Ideal for exploring the core features",
    features: [
      "Basic ATS Analysis",
      "Limited Mock Interviews",
      "Standard Career Roadmap",
      "Access to Learning Resources"
    ],
    icon: Compass,
    color: "bg-[#172033] text-primary"
  },
  {
    id: "BASIC",
    name: "Pro",
    price: "₹99",
    description: "Designed for focused placement prep",
    features: [
      "Advanced ATS Analysis",
      "10 Mock Interviews / month",
      "Detailed Career Roadmap",
      "Priority Support",
      "Skill Gap Analysis"
    ],
    icon: Rocket,
    color: "bg-[#172033] text-primary"
  },
  {
    id: "PREMIUM",
    name: "Premium",
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
    icon: ShieldCheck,
    color: "bg-[#172033] text-primary"
  }
];

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'error' | 'success' } | null>(null);
  const [demoPayment, setDemoPayment] = useState<{ orderId: string, planId: string, amount: number } | null>(null);
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [error, setError] = useState("");

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

  const handleNextRedirect = () => {
    const role = user?.role || localStorage.getItem("role") || "STUDENT";
    if (role === "RECRUITER") {
      router.push("/recruiter");
    } else {
      router.push("/dashboard");
    }
  };

  const handleContinue = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    setError("");

    try {
      if (selectedPlan === "FREE") {
        await api.post("/payment/free");
        setNotification({ message: "Free plan activated!", type: "success" });
        setTimeout(() => {
          handleNextRedirect();
        }, 1500);
      } else {
        const response = await api.post("/payment/create-order", { plan: selectedPlan });
        const { orderId, amount, currency, keyId } = response.data;

        // Check for Demo Mode (Order ID starts with order_demo_)
        if (orderId && orderId.startsWith("order_demo_")) {
          setDemoPayment({ orderId, planId: selectedPlan, amount });
          setLoading(false);
          return;
        }

        if (!window.Razorpay) {
          setNotification({ message: "Razorpay SDK failed to load. Please refresh the page.", type: 'error' });
          setLoading(false);
          return;
        }

        const options = {
          key: keyId,
          amount: amount,
          currency: currency,
          name: "AI Placement Copilot",
          description: `${selectedPlan} Plan Subscription`,
          order_id: orderId,
          handler: async (response: any) => {
            try {
              setLoading(true);
              await api.post("/payment/verify", {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                plan: selectedPlan
              });
              setNotification({ message: "Payment verified! Your subscription is active.", type: 'success' });
              setTimeout(() => {
                handleNextRedirect();
              }, 1500);
            } catch (err) {
              console.error("Verification failed:", err);
              setNotification({ message: "Payment verification failed. Please contact support.", type: 'error' });
            } finally {
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function() {
              setLoading(false);
            }
          },
          theme: {
            color: "#4F46E5",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error: any) {
      console.error("Payment failed:", error);
      const backendMessage = error.response?.data?.message || error.message;
      setNotification({ message: `Activation failed: ${backendMessage}`, type: 'error' });
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <PageShell className="justify-center items-center max-w-6xl">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-fit min-w-[320px] max-w-[90vw]"
          >
            <div className={`
              ${notification.type === 'error' ? 'bg-[#0F172A]' : 'bg-[#4F46E5]'} 
              text-white py-4 px-6 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-white/10
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0F172A] rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/5 space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#172033] text-amber-500 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-heading text-foreground">Razorpay Demo Mode</h3>
                <p className="text-sm text-muted-foreground">
                  No real Razorpay credentials are configured. You can simulate a successful checkout for testing.
                </p>
              </div>

              <div className="bg-[#172033] p-4 rounded-2xl border border-white/5 space-y-2 text-xs text-muted-foreground font-medium">
                <div className="flex justify-between">
                  <span className="text-muted-foreground/70">Plan:</span>
                  <span className="font-bold text-foreground">{demoPayment.planId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground/70">Amount:</span>
                  <span className="font-bold text-foreground">₹{demoPayment.amount / 100}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground/70">Order ID:</span>
                  <span className="font-mono text-foreground">{demoPayment.orderId}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  className="w-full py-6 font-bold bg-[#4F46E5] text-white hover:brightness-[1.04] rounded-xl shadow-lg"
                  onClick={async () => {
                    const planId = demoPayment.planId;
                    const orderId = demoPayment.orderId;
                    setDemoPayment(null);
                    setLoading(true);
                    try {
                      await api.post("/payment/verify", {
                        razorpayPaymentId: "pay_demo_" + Math.random().toString(36).substring(2, 9),
                        razorpayOrderId: orderId,
                        razorpaySignature: "sig_demo_" + Math.random().toString(36).substring(2, 9),
                        plan: planId
                      });
                      setNotification({ message: "Mock payment verified! Your subscription is active.", type: 'success' });
                      setTimeout(() => {
                        handleNextRedirect();
                      }, 1500);
                    } catch (err) {
                      console.error("Verification failed:", err);
                      setNotification({ message: "Mock payment verification failed.", type: 'error' });
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Simulate Payment Success
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full py-6 font-bold rounded-xl border-white/5"
                  onClick={() => {
                    setDemoPayment(null);
                    setLoading(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full space-y-12">
        {user?.planSelected && (
          <div className="flex justify-start -mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="group font-bold text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-xl transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              Dashboard
            </Button>
          </div>
        )}
        <div className="text-center space-y-4">
          <h1 className="text-[34px] font-bold text-foreground font-heading tracking-tight leading-tight">
            Choose Your Plan
          </h1>
          <p className="text-[18px] text-muted-foreground max-w-2xl mx-auto font-medium leading-[1.8]">
            Select a plan to personalize your experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <Card 
                key={plan.id} 
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative border-2 cursor-pointer transition-all duration-300 flex flex-col ${
                  isSelected ? "border-[#4F46E5]" : "border-transparent"
                }`}
              >
                <CardHeader className="text-center pb-2 pt-10">
                  <div className={`w-12 h-12 rounded-2xl ${plan.color} flex items-center justify-center mx-auto mb-4`}>
                    <plan.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-bold font-heading">{plan.name}</CardTitle>
                  <div className="mt-4 flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground/70 font-bold text-sm">/month</span>
                  </div>
                  <CardDescription className="pt-2 font-medium text-muted-foreground">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-4 pt-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm font-semibold text-muted-foreground">
                        <div className="w-5 h-5 rounded-full bg-[#172033] text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-4 pt-4">
          <div className="w-full max-w-xs">
            <Button 
              className="w-full h-14 rounded-2xl bg-[#4F46E5] text-white font-bold hover:brightness-[1.04] transition-all flex items-center justify-center text-sm"
              onClick={handleContinue}
              disabled={loading || !selectedPlan}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue"}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground/70 font-bold uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Secure Payment via Razorpay
          </p>
        </div>
      </div>
    </PageShell>
  );
}
