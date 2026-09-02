"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Loader2, RefreshCw, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  authProvider: 'LOCAL' | 'GOOGLE' | 'GITHUB';
  onDeleteSuccess: () => void;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  authProvider,
  onDeleteSuccess
}: DeleteAccountModalProps) {
  const [step, setStep] = useState(1); // 1: Confirm, 3: OTP
  const [otp, setOtp] = useState<string[]>(Array(4).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Timer states
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [resendDisabledTime, setResendDisabledTime] = useState(60); // 60 seconds resend lock

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
  const API_BASE_URL = `${API_URL}/account`;

  // Reset modal state on close or open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setOtp(Array(4).fill(""));
      setError(null);
      setSuccess(null);
      setLoading(false);
      setResending(false);
    }
  }, [isOpen]);

  // Focus the first input box when step becomes 3 (OTP verification)
  useEffect(() => {
    if (step === 3) {
      setCountdown(300);
      setResendDisabledTime(60);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Expiry Countdown
  useEffect(() => {
    if (step !== 3 || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Resend cooldown timer
  useEffect(() => {
    if (step !== 3 || resendDisabledTime <= 0) return;
    const timer = setInterval(() => {
      setResendDisabledTime((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, resendDisabledTime]);

  const getEmailFromAuth = () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          return payload.sub || "";
        } catch (e) {
          return "";
        }
      }
    }
    return "";
  };

  const email = getEmailFromAuth();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper helper to parse response error
  const parseResponseError = async (response: Response) => {
    try {
      const data = await response.json();
      return data.message || "Something went wrong.";
    } catch {
      try {
        const txt = await response.text();
        return txt || "Something went wrong.";
      } catch {
        return "Something went wrong.";
      }
    }
  };

  // Cancel deletion request - Deletes pending verification
  const handleCancelDelete = async () => {
    if (step === 3) {
      try {
        const token = localStorage.getItem("token");
        await fetch(`${API_BASE_URL}/cancel-delete`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (e) {
        console.error("Failed to cancel deletion request", e);
      }
    }
    onClose();
  };

  // Step 1: Click "Continue" -> trigger OTP request for all users directly
  const handleStep1Continue = async () => {
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/request-delete`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const errorMsg = await parseResponseError(response);
      if (!response.ok) {
        throw new Error(errorMsg || "Failed to send deletion verification code");
      }
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: OTP inputs behavior
  const handleOtpChange = (val: string, index: number) => {
    if (val && !/^\d+$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    if (val && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteText = e.clipboardData.getData("text").trim();
    if (!/^\d{4}$/.test(pasteText)) return;

    setOtp(pasteText.split(""));
    inputRefs.current[3]?.focus();
  };

  // Confirm Deletion
  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length < 4) {
      setError("Please enter the complete 4-digit code.");
      return;
    }

    if (countdown <= 0) {
      setError("Verification code expired.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/verify-delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ otp: fullOtp })
      });

      const errorMsg = await parseResponseError(response);
      if (!response.ok) {
        throw new Error(errorMsg || "Deletion verification failed.");
      }

      setSuccess("Account deleted successfully.");
      setTimeout(() => {
        onDeleteSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Deletion failed.");
      if (err.message.includes("attempts exceeded") || err.message.includes("start over")) {
        setOtp(Array(4).fill(""));
        setStep(1); // Force return to step 1
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend code
  const handleResendOtp = async () => {
    if (resendDisabledTime > 0) return;
    setResending(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/resend-delete-otp`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const errorMsg = await parseResponseError(response);
      if (!response.ok) {
        throw new Error(errorMsg || "Failed to resend code.");
      }

      setSuccess("New code sent to your email!");
      setCountdown(300);
      setResendDisabledTime(60);
      setOtp(Array(4).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <style>{`
            .otp-box-delete {
              width: 56px;
              height: 60px;
              background: rgba(30, 41, 59, 0.6);
              border: 1.5px solid rgba(255, 255, 255, 0.08);
              border-radius: 12px;
              text-align: center;
              font-size: 24px;
              font-weight: 700;
              color: white;
              outline: none;
              transition: all 0.2s ease;
            }

            .otp-box-delete:focus {
              border-color: #7C3AED;
              box-shadow: 0 0 0 3px rgba(124, 92, 255, 0.25);
              background: rgba(30, 41, 59, 0.9);
            }
            
            .otp-box-delete:hover:not(:focus) {
              border-color: #6366F1;
            }
          `}</style>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={!loading ? handleCancelDelete : undefined}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative w-full max-w-md bg-[#0F172A] border border-white/10 rounded-2xl p-8 shadow-[0_25px_80px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
          >
            {/* Success Overlays */}
            {success === "Account deleted successfully." && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-[#0F172A] z-50 flex flex-col items-center justify-center gap-4 text-center p-6"
              >
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20"
                >
                  <CheckCircle2 size={36} className="stroke-[2.5]" />
                </motion.div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold text-white">Account Deleted</h3>
                  <p className="text-sm text-slate-400">Your account has been deleted successfully.</p>
                </div>
              </motion.div>
            )}

            {/* Header */}
            <div className="flex items-center gap-4 text-rose-500 mb-6">
              <div className="p-3 bg-rose-500/10 rounded-xl">
                <AlertTriangle size={24} className="stroke-[2.5]" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Delete Account</h2>
            </div>
            
            <button 
              onClick={handleCancelDelete}
              disabled={loading}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>

            {/* Step 1: Confirmation screen */}
            {step === 1 && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <h3 className="text-[17px] font-semibold text-slate-200">Delete your account?</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    This action is permanent. All resumes, ATS reports, interview history, roadmaps, analytics, notes and account data will be permanently removed. This action cannot be undone.
                  </p>
                </div>
                
                {error && (
                  <div className="text-sm font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-center gap-2">
                    <ShieldAlert size={16} /> <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="ghost"
                    onClick={handleCancelDelete}
                    disabled={loading}
                    className="flex-1 border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 h-12 rounded-xl text-sm font-medium"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleStep1Continue}
                    disabled={loading}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold h-12 rounded-xl text-sm flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue"}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: OTP Verification screen */}
            {step === 3 && (
              <form onSubmit={handleConfirmDelete} className="flex flex-col gap-6">
                <div className="flex flex-col gap-1 text-center">
                  <h3 className="text-lg font-bold text-white tracking-tight">Verify Account Deletion</h3>
                  <p className="text-[13px] text-slate-400">
                    Enter the 4-digit verification code sent to<br />
                    <span className="text-slate-200 font-semibold">{email || "your email"}</span>
                  </p>
                </div>

                {error && (
                  <div className="text-sm font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-center">
                    {error}
                  </div>
                )}
                {success && success !== "Account deleted successfully." && (
                  <div className="text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center">
                    {success}
                  </div>
                )}

                <div className="flex justify-center gap-4 py-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      maxLength={1}
                      className="otp-box-delete"
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      onPaste={idx === 0 ? handleOtpPaste : undefined}
                      disabled={loading || countdown <= 0}
                      inputMode="numeric"
                    />
                  ))}
                </div>

                <div className="text-center text-sm text-slate-400">
                  {countdown > 0 ? (
                    <>Code expires in: <span className="text-rose-400 font-semibold">{formatTime(countdown)}</span></>
                  ) : (
                    <span className="text-rose-400 font-semibold">Code expired. Please click Resend.</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || countdown <= 0 || otp.some(d => !d)}
                  className="w-full h-12 rounded-xl text-sm font-bold text-white cursor-pointer transition-all duration-200 flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(90deg, #7C3AED 0%, #6366F1 100%)',
                    boxShadow: '0 4px 12px rgba(124, 92, 255, 0.25)'
                  }}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Delete"}
                </button>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending || resendDisabledTime > 0}
                    className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {resending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw size={14} />}
                    {resendDisabledTime > 0 ? `Resend Code (${resendDisabledTime}s)` : "Resend Code"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelDelete}
                    disabled={loading}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
