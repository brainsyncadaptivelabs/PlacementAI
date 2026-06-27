"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ShieldCheck, Mail, ArrowLeft, RefreshCw, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [verified, setVerified] = useState(false);
  
  // Timer states
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const [resendDisabledTime, setResendDisabledTime] = useState(60); // 60 seconds cooldown for resend button

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const supabase = createClient();

  // Focus the first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Countdown timer for OTP expiry (10 minutes)
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Resend button cooldown timer (60 seconds)
  useEffect(() => {
    if (resendDisabledTime <= 0) return;
    const timer = setInterval(() => {
      setResendDisabledTime((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendDisabledTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleInputChange = (value: string, index: number) => {
    // Only accept numeric digits
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    // Take only the last character if multiple are entered somehow
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto advance if digit is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Focus previous input and clear it
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

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pasteData)) return; // Ensure it's exactly 6 digits

    const digits = pasteData.split("");
    setOtp(digits);
    // Focus the last input box
    inputRefs.current[5]?.focus();
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    if (countdown <= 0) {
      setError("Verification code has expired. Please resend the code.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          otp: fullOtp
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Email verification failed.");
      }

      const backendData = await response.json();
      
      // Attempt to register in Supabase now that the verification is successful
      const password = sessionStorage.getItem("signup_password");
      if (password) {
        try {
          const { error: sbError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
              data: {
                full_name: backendData.fullName || "User",
                role: backendData.role
              }
            }
          });
          if (sbError) console.error("Supabase creation failed:", sbError.message);
        } catch (sbEx) {
          console.error("Supabase exception during verification signup:", sbEx);
        }
        sessionStorage.removeItem("signup_password");
      }

      localStorage.setItem("token", backendData.accessToken);
      localStorage.setItem("role", backendData.role);

      setSuccess("Email verified successfully!");
      setVerified(true);

      setTimeout(() => {
        router.push("/plans");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to verify email");
      
      // If code attempts exceeded (which causes record deletion on backend)
      if (err.message.includes("attempts exceeded")) {
        setOtp(Array(6).fill(""));
        sessionStorage.removeItem("signup_password");
        setTimeout(() => {
          router.push("/auth");
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendDisabledTime > 0) return;

    setResending(true);
    setError("");
    setSuccess("");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
      const response = await fetch(`${API_URL}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to resend code.");
      }

      setSuccess("A new verification code has been sent!");
      setCountdown(600); // Reset countdown to 10 minutes
      setResendDisabledTime(60); // Reset resend cooldown to 60 seconds
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
      await fetch(`${API_URL}/auth/cancel-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
    } catch (e) {
      console.error("Cancel signup error:", e);
    }
    
    sessionStorage.removeItem("signup_password");
    router.push("/auth");
  };

  return (
    <div className="verify-root">
      <style>{`
        .verify-root {
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top right, #1e1b4b 0%, #0f172a 100%);
          font-family: ui-sans-serif, system-ui, sans-serif;
          color: #f8fafc;
          padding: 24px;
          box-sizing: border-box;
        }

        .verify-card {
          width: 100%;
          max-width: 480px;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          box-sizing: border-box;
          text-align: center;
        }

        .verify-title {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.025em;
          margin-bottom: 8px;
          background: linear-gradient(to right, #a5b4fc, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .verify-subtitle {
          font-size: 14px;
          color: #94a3b8;
          line-height: 1.5;
          margin-bottom: 32px;
        }

        .email-display {
          color: #e2e8f0;
          font-weight: 600;
        }

        .otp-inputs-container {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 24px;
        }

        .otp-input-box {
          width: 50px;
          height: 56px;
          background: rgba(30, 41, 59, 0.8);
          border: 1.5px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          text-align: center;
          font-size: 24px;
          font-weight: 700;
          color: white;
          outline: none;
          transition: all 0.2s;
        }

        .otp-input-box:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
          background: rgba(30, 41, 59, 1);
        }

        .timer-display {
          font-size: 14px;
          color: #cbd5e1;
          margin-bottom: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .timer-highlight {
          color: #f43f5e;
          font-weight: 600;
        }

        .alert-box {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          text-align: left;
        }

        .alert-error {
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.2);
          color: #fda4af;
        }

        .alert-success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #a7f3d0;
        }

        .btn-verify {
          width: 100%;
          height: 48px;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-verify:hover:not(:disabled) {
          background: #4f46e5;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
        }

        .btn-verify:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-links {
          margin-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }

        .action-link {
          background: none;
          border: none;
          color: #a5b4fc;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .action-link:hover:not(:disabled) {
          color: #818cf8;
          background: rgba(99, 102, 241, 0.1);
        }

        .action-link:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .cancel-btn {
          color: #94a3b8;
        }

        .cancel-btn:hover {
          color: #cbd5e1;
          background: rgba(255, 255, 255, 0.05) !important;
        }

        /* Success Animation styles */
        .success-tick {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.15);
          border: 2px solid #10b981;
          color: #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px auto;
        }
      `}</style>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="verify-card"
      >
        <AnimatePresence mode="wait">
          {!verified ? (
            <motion.div key="verification-form">
              {/* Branding */}
              <div className="flex items-center justify-center gap-2 mb-8">
                <div className="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center">
                  <ShieldCheck className="text-slate-900 w-5 h-5" />
                </div>
                <span className="font-bold text-xl tracking-wide text-indigo-300">PlacementAI</span>
              </div>

              <h2 className="verify-title">Verify Your Email</h2>
              <p className="verify-subtitle">
                We sent a 6-digit verification code to<br />
                <span className="email-display">{email || "your email"}</span>
              </p>

              {/* Alert Message */}
              {error && (
                <div className="alert-box alert-error">
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="alert-box alert-success">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* OTP Form */}
              <form onSubmit={handleVerify}>
                <div className="otp-inputs-container">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      maxLength={1}
                      className="otp-input-box"
                      value={digit}
                      onChange={(e) => handleInputChange(e.target.value, idx)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      onPaste={idx === 0 ? handlePaste : undefined}
                      disabled={loading || countdown <= 0}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>

                <div className="timer-display">
                  {countdown > 0 ? (
                    <>
                      Code expires in: <span className="timer-highlight">{formatTime(countdown)}</span>
                    </>
                  ) : (
                    <span className="text-rose-400 font-medium">Code expired. Please request a new one.</span>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn-verify" 
                  disabled={loading || countdown <= 0 || otp.some(d => !d)}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Verify Email"
                  )}
                </button>
              </form>

              <div className="action-links">
                <button 
                  onClick={handleResend} 
                  disabled={resending || resendDisabledTime > 0} 
                  className="action-link"
                >
                  {resending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {resendDisabledTime > 0 ? `Resend Code (${resendDisabledTime}s)` : "Resend Code"}
                </button>

                <button 
                  onClick={() => {
                    sessionStorage.removeItem("signup_password");
                    router.push("/auth");
                  }} 
                  className="action-link"
                  disabled={loading}
                >
                  Change Email
                </button>
              </div>

              <div className="mt-8 border-t border-slate-800 pt-6">
                <button 
                  onClick={handleCancel} 
                  className="action-link cancel-btn mx-auto"
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4" /> Cancel Signup
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="success-animation"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="py-8"
            >
              <div className="success-tick">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-400 mb-2">Account Verified!</h2>
              <p className="text-slate-400 text-sm mb-6">
                Welcome to PlacementAI. Redirecting you to plans...
              </p>
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
