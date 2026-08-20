"use client";

import React, { useEffect } from "react";
import PlacementAILogo from "@/components/branding/PlacementAILogo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[PlacementAI GlobalError Caught]:", error);
    }
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-[#090F1F] text-white font-sans antialiased min-h-screen flex items-center justify-center p-6 text-center select-none">
        <div className="max-w-md w-full rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl flex flex-col items-center">
          <div className="flex items-center gap-3 mb-6">
            <PlacementAILogo size={40} />
            <span className="text-xl font-bold tracking-tight text-white">
              PlacementAI
            </span>
          </div>

          <div className="w-16 h-16 rounded-2xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-center mb-5 text-rose-400 font-extrabold text-xl">
            !
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            Something Went Wrong
          </h1>
          <p className="text-sm text-slate-300 mb-8 leading-relaxed">
            A critical error occurred while loading the application shell.
          </p>

          <button
            onClick={() => reset()}
            className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-500/20"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
