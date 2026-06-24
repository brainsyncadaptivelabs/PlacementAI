"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, X } from "lucide-react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const router = useRouter();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("SEND OTP BUTTON CLICKED");
    console.log("EMAIL:", email);
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/forgot-password", { email });
      console.log("OTP API RESPONSE:", res.data);
      setSuccess("OTP sent to your email!");
      setStep(2);
      setTimer(300);
      setResendTimer(60);
      setCanResend(false);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to send OTP"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/verify-otp", { email, otp });
      setSuccess("OTP verified successfully!");
      setStep(3);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Invalid or expired OTP"));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/reset-password", { email, newPassword });
      setSuccess("Password updated successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/auth");
      }, 3000);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to reset password"));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess("OTP resent successfully!");
      setResendTimer(60);
      setCanResend(false);
      setTimer(300);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to resend OTP"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {(error || success) && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-fit min-w-[300px] max-w-[90vw] px-4"
          >
            <div className="bg-slate-900 text-white py-3 px-5 rounded-lg shadow-2xl flex items-center justify-between gap-4 backdrop-blur-md bg-opacity-90">
              <div className="flex items-center gap-3">
                {error ? (
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold">!</div>
                ) : (
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-[10px] font-bold">✓</div>
                )}
                <span className="text-sm font-medium tracking-tight truncate max-w-[200px]">
                  {error || success}
                </span>
              </div>
              <button onClick={() => { setError(""); setSuccess(""); }} className="text-muted-foreground/70 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 relative z-10">
        <Link className="inline-flex items-center gap-2" href="/">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">A</div>
          <span className="font-heading font-bold text-2xl tracking-tight">AI Placement <span className="text-primary">Copilot</span></span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <Card className="border-none shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => step > 1 ? setStep(step - 1) : router.push("/auth")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">Step {step} of 3</span>
            </div>
            <CardTitle className="text-2xl font-bold font-heading">
              {step === 1 && "Forgot Password?"}
              {step === 2 && "Verify OTP"}
              {step === 3 && "Reset Password"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Enter your email to receive a 6-digit verification code."}
              {step === 2 && `Enter the code sent to ${email}`}
              {step === 3 && "Create a strong new password for your account."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase text-muted-foreground ml-1 tracking-wider">Email Address</Label>
                  <Input id="email" type="email" placeholder="name@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
                </div>
                <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send OTP"}
                </Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between px-1">
                    <Label htmlFor="otp" className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Verification Code</Label>
                    <span className={`text-xs font-bold ${timer < 60 ? "text-red-500" : "text-muted-foreground/70"}`}>
                      Expires in {formatTime(timer)}
                    </span>
                  </div>
                  <Input id="otp" type="text" placeholder="123456" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} className="h-14 text-center text-2xl tracking-[0.5em] font-black" />
                </div>
                <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20" disabled={loading || timer === 0}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify OTP"}
                </Button>
                <div className="text-center">
                  <button type="button" onClick={handleResendOtp} disabled={!canResend || loading} className={`text-xs font-bold uppercase tracking-widest ${canResend ? "text-primary hover:underline" : "text-muted-foreground/50 cursor-not-allowed"}`}>
                    Resend OTP {!canResend && `(${resendTimer}s)`}
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-password" title="New Password" />
                  <Input id="new-password" type="password" placeholder="New Password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-11" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password" title="Confirm Password" />
                  <Input id="confirm-password" type="password" placeholder="Confirm Password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-11" />
                </div>
                <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                </Button>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="justify-center border-t bg-muted/50 py-4 rounded-b-xl">
            <p className="text-xs text-muted-foreground">
              Remembered your password? <Link href="/auth" className="text-primary hover:underline font-bold">Sign In</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
