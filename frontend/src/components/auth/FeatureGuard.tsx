"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Sparkles, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

interface FeatureGuardProps {
  featureKey: string;
  featureTitle: string;
  children: React.ReactNode;
}

export function FeatureGuard({ featureKey, featureTitle, children }: FeatureGuardProps) {
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkEntitlement = async () => {
      try {
        const res = await api.get("/payment/subscription-status");
        if (!isMounted) return;
        const plan = res.data?.plan || "FREE";
        const features = res.data?.features || {};
        const feat = features[featureKey];

        if (plan === "FREE" && (!feat || !feat.included)) {
          setIsLocked(true);
        } else {
          setIsLocked(false);
        }
      } catch (err) {
        console.warn("Failed to check subscription status for feature guard", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkEntitlement();
    return () => {
      isMounted = false;
    };
  }, [featureKey]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 md:p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-6 shadow-2xl text-slate-100">
        <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-4">
          <div className="pb-2">
            <span className="inline-block px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
              Feature Unavailable on Free Plan
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {featureTitle} is Locked
          </h2>
          <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
            This feature isn't included in your current Free Plan. Upgrade your plan or buy a custom credit pack to unlock it.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/select-plan">
            <Button className="w-full sm:w-auto px-6 h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> Upgrade Plan <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/select-plan?tab=custom">
            <Button variant="outline" className="w-full sm:w-auto px-6 h-11 bg-white hover:bg-slate-100 text-slate-900 border-none font-bold rounded-xl flex items-center justify-center gap-2">
              <ShoppingBag className="w-4 h-4 text-purple-600" /> Build Your Own
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
