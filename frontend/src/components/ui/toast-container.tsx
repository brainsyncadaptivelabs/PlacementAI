"use client";

import { useToastStore, Toast } from "@/store/toast-store";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 4000;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (elapsed >= duration) {
        clearInterval(interval);
      }
    }, 10);

    return () => clearInterval(interval);
  }, [duration]);

  const typeConfig = {
    success: {
      bg: "bg-emerald-950/85 border-emerald-500/30 text-emerald-100",
      progressBg: "bg-emerald-500",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
      shadow: "shadow-[0_4px_20px_rgba(16,185,129,0.2)]",
    },
    error: {
      bg: "bg-rose-950/85 border-rose-500/30 text-rose-100",
      progressBg: "bg-rose-500",
      icon: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
      shadow: "shadow-[0_4px_20px_rgba(244,63,94,0.2)]",
    },
    warning: {
      bg: "bg-amber-950/85 border-amber-500/30 text-amber-100",
      progressBg: "bg-amber-500",
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
      shadow: "shadow-[0_4px_20px_rgba(245,158,11,0.2)]",
    },
    info: {
      bg: "bg-blue-950/85 border-blue-500/30 text-blue-100",
      progressBg: "bg-blue-500",
      icon: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
      shadow: "shadow-[0_4px_20px_rgba(59,130,246,0.2)]",
    },
  };

  const currentType = typeConfig[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } }}
      className={`pointer-events-auto relative overflow-hidden rounded-xl border backdrop-blur-md p-4 flex gap-3 items-start justify-between ${currentType.bg} ${currentType.shadow} transition-all duration-300 hover:scale-[1.02]`}
    >
      <div className="flex gap-3 items-start w-full">
        <motion.div 
          initial={{ scale: 0.5, rotate: -30 }} 
          animate={{ scale: 1, rotate: 0 }} 
          className="mt-0.5"
        >
          {currentType.icon}
        </motion.div>
        <div className="flex-1 text-sm font-semibold pr-4 leading-relaxed">
          {toast.message}
        </div>
      </div>

      <button
        onClick={() => onClose(toast.id)}
        className="text-slate-400 hover:text-white transition-colors p-1 -m-1 rounded-lg hover:bg-white/5 opacity-80 hover:opacity-100 duration-200 pointer-events-auto"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10">
        <div
          className={`h-full ${currentType.progressBg} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
}
