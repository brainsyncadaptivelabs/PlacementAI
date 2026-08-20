import React from "react";
import PlacementAILogo from "@/components/branding/PlacementAILogo";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center select-none bg-[#090F1F]">
      <div className="relative mb-6 flex items-center justify-center">
        {/* Pulsing Glow Background */}
        <div className="absolute w-24 h-24 rounded-full bg-indigo-600/20 blur-xl animate-pulse" />
        
        {/* Animated Brand Logo */}
        <div className="relative z-10 animate-bounce duration-1000">
          <PlacementAILogo size={56} />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl font-bold tracking-tight text-white font-heading">
          PlacementAI
        </span>
      </div>

      {/* Progress Bar Loader */}
      <div className="w-48 h-1.5 rounded-full bg-white/10 overflow-hidden relative">
        <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-400 rounded-full animate-[progress_1.5s_ease-in-out_infinite]" />
      </div>

      <p className="text-xs text-slate-400 mt-4 tracking-wide">
        Loading PlacementAI Copilot...
      </p>
    </div>
  );
}
