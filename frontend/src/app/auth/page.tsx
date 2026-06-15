"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, X } from "lucide-react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleOAuthProvider, type CredentialResponse } from "@react-oauth/google";
import type { AxiosResponse } from "axios";

// Dynamically import GoogleLogin with SSR disabled to prevent multiple initializations during hydration/Strict Mode
const GoogleLogin = dynamic(
  () => import("@react-oauth/google").then((mod) => mod.GoogleLogin),
  { ssr: false }
);

type AuthResponseData = {
  accessToken: string;
  role?: "ADMIN" | "RECRUITER" | "STUDENT";
  profileCompleted?: boolean;
};

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Form states
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    collegeName: "",
    branch: "",
    graduationYear: 2026,
    companyName: "",
    role: "STUDENT"
  });

  const roleRef = useRef(signupData.role);
  useEffect(() => {
    roleRef.current = signupData.role;
  }, [signupData.role]);

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [success, setSuccess] = useState("");

  const handleAuthSuccess = useCallback((response: AxiosResponse<AuthResponseData & { plan?: string }>) => {
    console.log("AUTH SUCCESS RESPONSE:", response.data);
    const { accessToken, role, profileCompleted, plan } = response.data;
    localStorage.setItem("token", accessToken);
    if (role) localStorage.setItem("role", role);

    if (!role || profileCompleted === false) {
      router.push("/select-role");
      return;
    }

    if (role === "ADMIN") {
      window.location.href = "/admin";
    } else if (role === "RECRUITER") {
      window.location.href = "/recruiter";
    } else {
      if (!plan) {
        window.location.href = "/select-plan";
      } else {
        window.location.href = "/dashboard";
      }
    }
  }, [router]);

  const handleGoogleSuccess = useCallback(async (credentialResponse: CredentialResponse) => {
    console.log("GOOGLE CREDENTIAL RECEIVED:", credentialResponse);
    setLoading(true);
    setError("");
    try {
      console.log("SENDING GOOGLE LOGIN REQUEST TO BACKEND...");
      const payload = {
        idToken: credentialResponse.credential,
        role: roleRef.current
      };
      console.log("PAYLOAD:", payload);
      
      const response = await api.post("/auth/google", payload);
      console.log("BACKEND GOOGLE LOGIN RESPONSE:", response.data);
      handleAuthSuccess(response);
    } catch (err: unknown) {
      console.error("GOOGLE LOGIN ERROR:", err);
      setError(getErrorMessage(err, "Google login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [handleAuthSuccess]);

  const handleGoogleError = useCallback(() => {
    console.log("GOOGLE LOGIN FAILED AT BUTTON LEVEL");
    setError("Google Sign-In failed. Please try again.");
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await api.post("/auth/signup", signupData);
      setSuccess("Account Created Successfully! Redirecting...");
      setTimeout(() => {
        handleAuthSuccess(response);
      }, 1500);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Signup failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/login", loginData);
      handleAuthSuccess(response);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-6 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Instagram-style Toast Notification */}
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
              <button 
                type="button"
                onClick={() => { setError(""); setSuccess(""); }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-4 relative z-10">
        <Link className="inline-flex items-center gap-2" href="/">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">A</div>
          <span className="font-heading font-bold text-xl tracking-tight">AI Placement <span className="text-primary">Copilot</span></span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[480px] px-4 relative z-10">
        <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
          <div className="flex justify-center mb-3">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 h-9">
              <TabsTrigger value="signup" className="h-7 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
              <TabsTrigger value="login" className="h-7 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign In</TabsTrigger>
            </TabsList>
          </div>

          <Card className="border-none shadow-xl overflow-hidden">
            <TabsContent value="signup" className="mt-0">
              <form onSubmit={handleSignup}>
                <CardHeader className="py-4 px-6 space-y-0.5">
                  <CardTitle className="text-xl font-bold text-center font-heading">Create Account</CardTitle>
                  <CardDescription className="text-center text-xs">Join our placement community today</CardDescription>
                </CardHeader>
                <CardContent className="px-6 py-0 grid gap-2.5">
                  {/* Modern Segmented Toggle for Role */}
                  <div className="grid gap-1.5">
                    <Label className="text-[11px] font-semibold text-slate-500 uppercase ml-0.5 tracking-wider">Register as</Label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => setSignupData({ ...signupData, role: "STUDENT" })}
                        className={`flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                          signupData.role === "STUDENT"
                            ? "bg-primary text-white shadow-md scale-[1.02]"
                            : "text-slate-600 hover:bg-slate-200/50"
                        }`}
                      >
                        Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignupData({ ...signupData, role: "RECRUITER" })}
                        className={`flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                          signupData.role === "RECRUITER"
                            ? "bg-primary text-white shadow-md scale-[1.02]"
                            : "text-slate-600 hover:bg-slate-200/50"
                        }`}
                      >
                        Recruiter
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor="full-name" className="text-[11px] font-semibold text-slate-500 uppercase ml-0.5">Full Name</Label>
                    <Input id="full-name" placeholder="John Doe" type="text" required className="h-9 text-sm" value={signupData.fullName} onChange={(e) => setSignupData({...signupData, fullName: e.target.value})} />
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor="email" className="text-[11px] font-semibold text-slate-500 uppercase ml-0.5">Email Address</Label>
                    <Input id="email" placeholder="name@example.com" type="email" required className="h-9 text-sm" value={signupData.email} onChange={(e) => setSignupData({...signupData, email: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1">
                      <Label htmlFor="password" className="text-[11px] font-semibold text-slate-500 uppercase ml-0.5">Password</Label>
                      <Input id="password" type="password" required className="h-9 text-sm" value={signupData.password} onChange={(e) => setSignupData({...signupData, password: e.target.value})} />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="confirm-password" className="text-[11px] font-semibold text-slate-500 uppercase ml-0.5">Confirm</Label>
                      <Input id="confirm-password" type="password" required className="h-9 text-sm" value={signupData.confirmPassword} onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})} />
                    </div>
                  </div>

                  {signupData.role === "STUDENT" && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1">
                          <Label htmlFor="collegeName" className="text-[11px] font-semibold text-slate-500 uppercase ml-0.5">College Name</Label>
                          <Input 
                            id="collegeName" 
                            placeholder="College" 
                            type="text" 
                            required 
                            className="h-9 text-sm"
                            value={signupData.collegeName} 
                            onChange={(e) => setSignupData({...signupData, collegeName: e.target.value})} 
                          />
                        </div>
                        <div className="grid gap-1">
                          <Label htmlFor="branch" className="text-[11px] font-semibold text-slate-500 uppercase ml-0.5">Branch</Label>
                          <Input 
                            id="branch" 
                            placeholder="CS, IT, etc." 
                            type="text" 
                            required 
                            className="h-9 text-sm"
                            value={signupData.branch} 
                            onChange={(e) => setSignupData({...signupData, branch: e.target.value})} 
                          />
                        </div>
                      </div>
                      <div className="grid gap-1">
                        <Label htmlFor="graduationYear" className="text-[11px] font-semibold text-slate-500 uppercase ml-0.5">Graduation Year</Label>
                        <Input 
                          id="graduationYear" 
                          type="number" 
                          required 
                          className="h-9 text-sm"
                          value={signupData.graduationYear} 
                          onChange={(e) => setSignupData({...signupData, graduationYear: parseInt(e.target.value)})} 
                        />
                      </div>
                    </>
                  )}

                  {signupData.role === "RECRUITER" && (
                    <div className="grid gap-1">
                      <Label htmlFor="companyName" className="text-[11px] font-semibold text-slate-500 uppercase ml-0.5">Company Name</Label>
                      <Input 
                        id="companyName" 
                        placeholder="Your Company Name" 
                        type="text" 
                        required 
                        className="h-9 text-sm"
                        value={signupData.companyName} 
                        onChange={(e) => setSignupData({...signupData, companyName: e.target.value})} 
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full h-9 bg-primary hover:bg-primary/90 mt-1" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign Up"}
                  </Button>
                </CardContent>
              </form>
              <CardFooter className="py-3 border-t bg-slate-50/50 justify-center">
                <p className="text-xs text-slate-500">
                  Already have an account? <button onClick={() => setActiveTab("login")} className="text-primary hover:underline font-semibold ml-1">Login</button>
                </p>
              </CardFooter>
            </TabsContent>

            <TabsContent value="login" className="mt-0">
              <form onSubmit={handleLogin}>
                <CardHeader className="py-4 px-6 space-y-0.5">
                  <CardTitle className="text-xl font-bold text-center font-heading">Welcome Back!</CardTitle>
                  <CardDescription className="text-center text-xs">Login to your account to continue</CardDescription>
                </CardHeader>
                <CardContent className="px-6 py-0 grid gap-3">
                  <div className="grid gap-1">
                    <Label htmlFor="email-login" className="text-[11px] font-semibold text-slate-500 uppercase ml-0.5">Email Address</Label>
                    <Input id="email-login" placeholder="name@example.com" type="email" required className="h-9 text-sm" value={loginData.email} onChange={(e) => setLoginData({...loginData, email: e.target.value})} />
                  </div>
                  <div className="grid gap-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password-login" className="text-[11px] font-semibold text-slate-500 uppercase ml-0.5">Password</Label>
                      <button 
                        type="button" 
                        onClick={() => {
                          console.log("FORGOT PASSWORD BUTTON CLICKED - REDIRECTING");
                          router.push("/auth/forgot-password");
                        }}
                        className="text-[10px] text-primary hover:underline font-semibold"
                      >
                        Forgot?
                      </button>
                    </div>
                    <Input id="password-login" type="password" required className="h-9 text-sm" value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} />
                  </div>
                  <Button type="submit" className="w-full h-9 bg-primary hover:bg-primary/90 mt-1" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login"}
                  </Button>
                </CardContent>
              </form>
              <CardFooter className="py-4 border-t bg-slate-50/50 justify-center">
                <p className="text-xs text-slate-500">
                  Don&apos;t have an account? <button onClick={() => setActiveTab("signup")} className="text-primary hover:underline font-semibold ml-1">Sign Up</button>
                </p>
              </CardFooter>
            </TabsContent>

            {/* Unified Google Login Section - Rendered Only Once */}
            <div className="px-6 pb-6 pt-2 bg-white border-t border-slate-100">
               <div className="relative flex items-center gap-2 mb-4">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">OR</span>
                  <div className="flex-grow border-t border-slate-200"></div>
               </div>
               <div className="flex justify-center min-h-[40px]">
                  {clientId ? (
                    <GoogleOAuthProvider clientId={clientId}>
                      <GoogleLogin 
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="outline"
                        shape="pill"
                      />
                    </GoogleOAuthProvider>
                  ) : (
                    <div className="h-10 w-48 bg-slate-100 animate-pulse rounded-full" />
                  )}
               </div>
            </div>
          </Card>
        </Tabs>
      </div>
    </div>
  );
}
