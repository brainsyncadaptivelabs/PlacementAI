"use client";

import { useState } from "react";
import { Check, Loader2, Sparkles, CreditCard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import api from "@/lib/api";
import { toast } from "sonner";

export default function BillingPage() {
  const { user, mutate } = useUser();
  const [loading, setLoading] = useState(false);
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockOrderId, setMockOrderId] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"BASIC" | "PRO" | null>(null);

  const currentPlan = user?.plan || "FREE";
  const isPro = currentPlan === "PRO";
  const isBasic = currentPlan === "BASIC";

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

  const handleUpgrade = async (planName: "BASIC" | "PRO") => {
    setLoading(true);
    setSelectedPlan(planName);
    try {
      const res = await api.post("/payment/create-order", { plan: planName });
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
        description: `AI Placement Copilot ${planName} Upgrade`,
        image: "/favicon.ico",
        order_id: orderId,
        handler: async function (response: any) {
          setLoading(true);
          try {
            await api.post("/payment/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planName,
            });
            toast.success(`Successfully upgraded to ${planName}!`);
            await mutate();
          } catch (err) {
            toast.error("Payment verification failed.");
          } finally {
            setLoading(false);
            setSelectedPlan(null);
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
            setSelectedPlan(null);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("Unable to initialize checkout. Please try again.");
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const handleSimulateMockSuccess = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    setShowMockModal(false);
    try {
      await api.post("/payment/verify-payment", {
        razorpay_order_id: mockOrderId,
        razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
        razorpay_signature: "mock_signature",
        plan: selectedPlan,
      });
      toast.success(`Sandbox Upgrade Successful! You are now subscribed to ${selectedPlan}.`);
      await mutate();
    } catch (err) {
      toast.error("Mock verification failed.");
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-black font-heading text-foreground">Plan & Billing</h1>
        <p className="text-muted-foreground text-sm font-medium">Manage your subscription, billing status, and plan usage.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 pt-4">
        {/* BASIC PLAN */}
        <Card className={`border bg-card flex flex-col relative overflow-hidden h-full ${isBasic ? 'border-primary/20 shadow-[0_8px_30px_rgb(59,130,246,0.04)]' : 'border-border'}`}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold font-heading">Placement Basic</CardTitle>
            <CardDescription>Essential features for placement tracking and setup.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div className="flex items-baseline">
              <span className="text-5xl font-black tracking-tight text-foreground font-heading">₹99</span>
              <span className="text-muted-foreground ml-1 text-sm font-bold uppercase tracking-wider">/ year</span>
            </div>
            <ul className="space-y-3">
              {[
                "10 ATS resume scans total",
                "5 AI mock interview sessions",
                "Basic career roadmap visualization",
                "Standard skill gap checking",
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="pt-6">
            <Button
              onClick={() => handleUpgrade("BASIC")}
              disabled={loading || isBasic || isPro}
              className={`w-full h-12 font-bold rounded-xl ${
                isBasic
                  ? "bg-emerald-500 hover:bg-emerald-500 cursor-default text-white"
                  : isPro
                  ? "bg-muted text-muted-foreground cursor-default border-none"
                  : "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
              }`}
            >
              {loading && selectedPlan === "BASIC" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isBasic ? (
                <span className="flex items-center justify-center gap-2">
                  <ShieldCheck className="w-5 h-5" /> Current Plan
                </span>
              ) : isPro ? (
                "Downgrade Unavailable"
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CreditCard className="w-5 h-5" /> Get Basic
                </span>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* PRO PLAN */}
        <Card className={`border bg-card flex flex-col relative overflow-hidden h-full ${isPro ? 'border-emerald-500/30 shadow-[0_8px_30px_rgb(16,185,129,0.08)]' : 'border-primary/30 shadow-[0_8px_30px_rgb(59,130,246,0.08)]'}`}>
          <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Recommended
          </div>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold font-heading text-primary">Placement Pro</CardTitle>
            <CardDescription>Unlimited access to land your next high-paying job offer.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div className="flex items-baseline">
              <span className="text-5xl font-black tracking-tight text-foreground font-heading">₹299</span>
              <span className="text-muted-foreground ml-1 text-sm font-bold uppercase tracking-wider">/ year</span>
            </div>
            <ul className="space-y-3">
              {[
                "Unlimited ATS resume scans",
                "Unlimited AI mock interviews",
                "Advanced career roadmap updates",
                "Explainable skill gap audits",
                "AI Career Mentor chat access",
                "Priority opportunity matching alerts",
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-2.5 text-sm font-semibold text-foreground/90">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="pt-6">
            <Button
              onClick={() => handleUpgrade("PRO")}
              disabled={loading || isPro}
              className={`w-full h-12 font-bold rounded-xl text-white ${
                isPro
                  ? "bg-emerald-500 hover:bg-emerald-500 cursor-default"
                  : "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              }`}
            >
              {loading && selectedPlan === "PRO" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPro ? (
                <span className="flex items-center justify-center gap-2">
                  <ShieldCheck className="w-5 h-5" /> Current Plan
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CreditCard className="w-5 h-5" /> Upgrade to Pro
                </span>
              )}
            </Button>
          </CardFooter>
        </Card>
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
                Click below to simulate a successful payment process and complete your upgrade verification for the <strong className="text-foreground">{selectedPlan}</strong> plan.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => { setShowMockModal(false); setSelectedPlan(null); }}
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
