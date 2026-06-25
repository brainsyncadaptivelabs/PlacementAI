"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, X, GraduationCap, Briefcase, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";

const PREDEFINED_SKILLS = [
  "Java",
  "Python",
  "C++",
  "JavaScript",
  "React",
  "Next.js",
  "Spring Boot",
  "SQL",
  "HTML/CSS",
  "Git",
  "DevOps"
];

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  
  const { signInWithProvider } = useAuth();
  const supabase = createClient();

  // Multi-step signup state
  // 1: Role Selection, 2: Account Details (email/password), 3: Profile Details
  const [signupStep, setSignupStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "RECRUITER" | null>(null);

  // Form states
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Student details
    collegeName: "",
    degree: "",
    branch: "",
    graduationYear: new Date().getFullYear(),
    currentSemester: 1,
    skills: [] as string[],
    preferredRole: "",
    // Recruiter details
    companyName: "",
    designation: "",
    companySize: "",
    hiringRoles: "",
    workEmail: "",
    companyWebsite: ""
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      setLoading(true);
      setError("");
      await signInWithProvider(provider);
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`);
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final step submission check
    if (selectedRole === "STUDENT" && !signupData.collegeName.trim()) {
      setError("College name is required");
      return;
    }
    if (selectedRole === "RECRUITER" && !signupData.companyName.trim()) {
      setError("Company name is required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      // 1. Sign up user via Supabase Auth
      const { data: sbData, error: sbError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.fullName,
            role: selectedRole
          }
        }
      });

      if (sbError) throw sbError;

      // 2. Persist user and role on the Spring Boot backend
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
      const signupBody = {
        fullName: signupData.fullName,
        email: signupData.email,
        password: signupData.password,
        role: selectedRole,
        collegeName: selectedRole === "STUDENT" ? signupData.collegeName : null,
        branch: selectedRole === "STUDENT" ? signupData.branch : null,
        graduationYear: selectedRole === "STUDENT" ? signupData.graduationYear : null,
        companyName: selectedRole === "RECRUITER" ? signupData.companyName : null
      };

      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupBody)
      });

      if (!response.ok) {
        const errObj = await response.json().catch(() => ({}));
        throw new Error(errObj.message || "Backend registration failed");
      }

      const backendData = await response.json();
      
      // Store tokens and role in localStorage
      localStorage.setItem("token", backendData.accessToken);
      localStorage.setItem("role", backendData.role);

      setSuccess("Account Created Successfully! Redirecting...");
      
      setTimeout(() => {
        router.push("/plans");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // 1. Sign in via Supabase Auth
      const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (sbError) throw sbError;
      
      // 2. Call backend login endpoint to synchronize and obtain backend JWT
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password
        })
      });

      if (!response.ok) {
        const errObj = await response.json().catch(() => ({}));
        throw new Error(errObj.message || "Backend authentication failed");
      }

      const backendData = await response.json();
      
      // Store token and role in localStorage
      localStorage.setItem("token", backendData.accessToken);
      localStorage.setItem("role", backendData.role);

      if (!backendData.planSelected) {
        router.push("/plans");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (fieldName: string, baseClass = "rounded-2xl h-12 bg-muted border border-transparent px-4 text-sm") => {
    if (!error) return baseClass;
    const errLower = error.toLowerCase();
    const hasErr = errLower.includes(fieldName) || errLower.includes("all fields") || (fieldName === "password" && errLower.includes("passwords"));
    return hasErr ? `${baseClass} has-error` : baseClass;
  };

  return (
    <div className="auth-root-container selection:bg-primary/10">
      <style>{`
        .auth-root-container {
          width: 100%;
          min-height: 100vh !important;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, #090F1F 0%, #111827 100%) !important;
          padding: 16px;
        }
        .auth-main-container {
          width: 100%;
          max-width: 100%;
          height: auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px !important;
        }
        .auth-left-panel {
          background: linear-gradient(135deg, #0F172A, #1E1B4B) !important;
          border-radius: 32px !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.35) !important;
          opacity: 1 !important;
          filter: none !important;
          position: relative;
          overflow: hidden;
        }
        .auth-left-panel p {
          color: #94A3B8 !important;
        }
        .auth-right-card {
          width: 100% !important;
          max-width: 560px !important;
          padding: 48px !important;
          border-radius: 32px !important;
          background-color: #0F172A !important;
          background: #0F172A !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          border: 1px solid rgba(255,255,255,0.04) !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.35) !important;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          height: auto;
          gap: 18px !important;
        }
        .form-body {
          overflow-y: auto;
          padding-right: 8px;
          scrollbar-width: none;
          -ms-overflow-style: none;
          display: flex;
          flex-direction: column;
          gap: 18px !important;
        }
        .form-body::-webkit-scrollbar {
          display: none;
        }

        /* Global Reset and Input Polish System */
        .auth-root-container input,
        .auth-root-container select,
        .auth-root-container textarea,
        .auth-root-container button {
          outline: none !important;
          box-shadow: none !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          appearance: none !important;
        }

        .auth-root-container input,
        .auth-root-container select,
        .auth-root-container textarea {
          background-color: #172033 !important;
          border: 1px solid transparent !important;
          border-radius: 16px !important;
          height: 56px !important;
          padding: 0 18px !important;
          color: #F8FAFC !important;
          font-weight: 500 !important;
          font-size: 14px !important;
          transition: background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease !important;
          box-sizing: border-box !important;
        }

        .auth-root-container input:hover,
        .auth-root-container select:hover,
        .auth-root-container textarea:hover {
          background-color: #1E293B !important;
          border-color: transparent !important;
        }

        .auth-root-container input:focus,
        .auth-root-container select:focus,
        .auth-root-container textarea:focus {
          background-color: #1E293B !important;
          border-color: transparent !important;
          box-shadow: 0 0 0 2px rgba(99,102,241,0.15) !important;
        }

        .auth-root-container input.has-error {
          border-color: #ef4444 !important;
          background-color: rgba(239, 68, 68, 0.1) !important;
        }

        .auth-root-container label {
          color: #CBD5E1 !important;
          font-weight: 500 !important;
        }

        .auth-root-container input::placeholder,
        .auth-root-container select::placeholder,
        .auth-root-container textarea::placeholder {
          color: #64748B !important;
          opacity: 1 !important;
        }

        .auth-root-container h1,
        .auth-root-container h2 {
          color: #F8FAFC !important;
          font-weight: 700 !important;
        }

        .auth-root-container p,
        .auth-root-container .subtext {
          color: #94A3B8 !important;
        }

        /* Action Buttons Hover & Click Physics */
        .auth-root-container button.action-btn {
          background-color: #4F46E5 !important;
          color: #ffffff !important;
          height: 56px !important;
          border-radius: 16px !important;
          border: none !important;
          transition: filter 150ms ease !important;
          transform: none !important;
          box-shadow: none !important;
          font-weight: 700 !important;
        }

        .auth-root-container button.action-btn:hover {
          filter: brightness(1.06) !important;
        }

        .auth-root-container button.action-btn:active {
          filter: brightness(0.98) !important;
        }

        /* Google / Github buttons override */
        .auth-right-card button.oauth-btn {
          background-color: #172033 !important;
          color: #F8FAFC !important;
          border: 1px solid rgba(255, 255, 255, 0.06) !important;
          height: 56px !important;
          border-radius: 16px !important;
          transition: background-color 150ms ease, border-color 150ms ease !important;
          font-weight: 700 !important;
          box-shadow: none !important;
        }
        .auth-right-card button.oauth-btn:hover {
          background-color: #1E293B !important;
          border-color: rgba(255, 255, 255, 0.08) !important;
        }

        /* Top Tabs styling */
        .auth-right-card [role=tablist],
        .auth-right-card [data-slot=tabs-list] {
          background-color: #111827 !important;
          height: 52px !important;
          border-radius: 999px !important;
          padding: 4px !important;
          border: none !important;
        }
        .auth-right-card [role=tab],
        .auth-right-card [data-slot=tabs-trigger] {
          border-radius: 999px !important;
          color: #94A3B8 !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          background-color: transparent !important;
          border: none !important;
          transition: all 150ms ease !important;
        }
        .auth-right-card [role=tab][data-state=active],
        .auth-right-card [data-slot=tabs-trigger][data-state=active] {
          background-color: #1E293B !important;
          color: #ffffff !important;
          border: none !important;
        }

        /* Role & Skill Selection buttons styling in dark card */
        .auth-role-btn {
          background-color: #172033 !important;
          border: 1px solid rgba(255, 255, 255, 0.06) !important;
          border-radius: 16px !important;
          padding: 24px !important;
          text-align: center !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          gap: 12px !important;
          transition: all 150ms ease !important;
          cursor: pointer !important;
        }
        .auth-role-btn:hover {
          background-color: #1E293B !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        .auth-role-btn.active {
          background-color: rgba(99, 102, 241, 0.15) !important;
          border-color: #4F46E5 !important;
          color: #818CF8 !important;
        }
        .auth-role-btn .role-icon-container {
          width: 48px !important;
          height: 48px !important;
          border-radius: 12px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background-color: #111827 !important;
          color: #94A3B8 !important;
          transition: all 150ms ease !important;
        }
        .auth-role-btn.active .role-icon-container {
          background-color: rgba(99, 102, 241, 0.2) !important;
          color: #F8FAFC !important;
        }
        .auth-role-btn .role-label {
          font-weight: 700 !important;
          font-size: 14px !important;
          color: #CBD5E1 !important;
        }
        .auth-role-btn.active .role-label {
          color: #F8FAFC !important;
        }

        .auth-skill-btn {
          padding: 8px 12px !important;
          border-radius: 12px !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          background-color: #172033 !important;
          color: #94A3B8 !important;
          border: 1px solid rgba(255, 255, 255, 0.06) !important;
          transition: all 150ms ease !important;
        }
        .auth-skill-btn:hover {
          background-color: #1E293B !important;
          color: #F8FAFC !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        .auth-skill-btn.active {
          background-color: rgba(99, 102, 241, 0.15) !important;
          color: #818CF8 !important;
          border-color: #4F46E5 !important;
        }

        .auth-divider {
          text-align: center !important;
          color: #64748B !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          letter-spacing: 0.05em !important;
          margin: 6px 0 !important;
          user-select: none !important;
        }

        .auth-alert-error {
          width: 100% !important;
          padding: 8px 12px !important;
          border-radius: 12px !important;
          background-color: rgba(239, 68, 68, 0.1) !important;
          border: 1px solid rgba(239, 68, 68, 0.2) !important;
          color: #f87171 !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
        }
        .auth-alert-success {
          width: 100% !important;
          padding: 8px 12px !important;
          border-radius: 12px !important;
          background-color: rgba(16, 185, 129, 0.1) !important;
          border: 1px solid rgba(16, 185, 129, 0.2) !important;
          color: #34d399 !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
        }

        @media (min-width: 1024px) {
          .auth-root-container {
            height: 100vh;
            max-height: 100vh;
            overflow: hidden;
            min-height: auto;
            padding: 32px;
          }
          .auth-main-container {
            width: min(1500px, 95vw) !important;
            height: min(90vh, 900px) !important;
            grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
            overflow: hidden;
            gap: 40px !important;
          }
          .auth-left-panel {
            height: 82vh !important;
            padding: 48px !important;
          }
          .auth-right-card {
            max-height: 82vh !important;
          }
        }
      `}</style>

      <div className="auth-main-container">
        
        {/* Left Panel: Brand Area (45% column span) */}
        <div className="lg:col-span-5 hidden lg:flex flex-col p-12 text-white auth-left-panel">
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-xl" style={{ backgroundColor: "#4F46E5" }}>A</div>
              <span className="font-heading font-bold text-2xl tracking-tighter">PlacementAI</span>
            </Link>
          </div>

          <div className="relative z-10 my-auto">
            <h2 className="text-[44px] font-bold font-heading leading-tight tracking-tight text-white mb-4">
              Your AI Placement<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-300">Copilot</span>
            </h2>
            
            <div className="text-slate-300 text-[18px] font-medium space-y-2 leading-[1.8] mb-4">
              <p className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#4F46E5" }} />
                Prepare smarter for your dream career.
              </p>
              <p className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#4F46E5" }} />
                Build professional, ATS-optimized resumes.
              </p>
              <p className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#4F46E5" }} />
                Practice realistic, role-specific mock interviews.
              </p>
              <p className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#4F46E5" }} />
                Get placed at top companies globally.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <span className="px-4 py-2 bg-white/10 border border-white/5 rounded-full text-xs font-bold text-white tracking-wide">Resume Builder</span>
              <span className="px-4 py-2 bg-white/10 border border-white/5 rounded-full text-xs font-bold text-white tracking-wide">ATS Optimization</span>
              <span className="px-4 py-2 bg-white/10 border border-white/5 rounded-full text-xs font-bold text-white tracking-wide">Mock Interview</span>
              <span className="px-4 py-2 bg-white/10 border border-white/5 rounded-full text-xs font-bold text-white tracking-wide">Career Roadmaps</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Auth Card (55% column span) */}
        <div className="lg:col-span-7 flex flex-col justify-center items-center p-2">
          
          <Card className="w-full relative flex flex-col auth-right-card overflow-hidden">
            {/* Fixed height h-9 inline alert area to prevent layout shifts */}
            <div className="h-9 flex items-center px-1 mb-1 shrink-0">
              {error ? (
                <div className="auth-alert-error">
                  <span>{error}</span>
                  <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 transition-colors p-0.5 outline-none">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : success ? (
                <div className="auth-alert-success">
                  <span>{success}</span>
                  <button onClick={() => setSuccess("")} className="text-emerald-400 hover:text-emerald-600 transition-colors p-0.5 outline-none">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : null}
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col overflow-hidden">
              
              <div className="mb-3">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger 
                    value="signup" 
                    className="text-sm font-bold transition-all h-full"
                  >
                    Sign Up
                  </TabsTrigger>
                  <TabsTrigger 
                    value="login" 
                    className="text-sm font-bold transition-all h-full"
                  >
                    Login
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Login Tab Content */}
              <TabsContent value="login" className="m-0 focus-visible:outline-none focus-visible:ring-0 flex-1 flex flex-col overflow-hidden">
                <form onSubmit={handleLogin} className="flex-1 flex flex-col overflow-hidden gap-[18px]">
                  <div className="space-y-1 mb-3">
                    <h2 className="text-3xl font-bold font-heading tracking-tight leading-tight text-slate-100">Welcome Back</h2>
                    <p className="text-base text-slate-400 leading-normal">Enter your credentials to access your dashboard.</p>
                  </div>

                  <div className="form-body flex-1 overflow-y-auto pr-[8px] scrollbar-none gap-[18px]">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Email Address</Label>
                      <Input 
                        id="login-email" 
                        type="email" 
                        required 
                        className={getInputClass("email")}
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Password</Label>
                      <Input 
                        id="login-password" 
                        type="password" 
                        required 
                        className={getInputClass("password")}
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="sticky bottom-0 pt-[14px] z-10 flex flex-col gap-[18px]" style={{ backgroundColor: "#0F172A" }}>
                    <Button type="submit" className="w-full h-12 rounded-2xl bg-slate-900 text-white font-bold transition-all shadow-md flex items-center justify-center text-sm action-btn" disabled={loading}>
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                    </Button>
                    
                    <div className="auth-divider">
                      ──── Continue with ────
                    </div>
                    
                    <div className="grid grid-cols-2 gap-[14px]">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="oauth-btn"
                        onClick={() => handleOAuth('google')}
                        disabled={loading}
                      >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2 inline" aria-hidden="true"><path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"></path><path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"></path><path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"></path><path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853"></path></svg>
                        Google
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="oauth-btn"
                        onClick={() => handleOAuth('github')}
                        disabled={loading}
                      >
                        <svg className="w-5 h-5 mr-2 inline" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" /></svg>
                        GitHub
                      </Button>
                    </div>
                  </div>
                </form>
              </TabsContent>

              {/* Signup Tab Content */}
              <TabsContent value="signup" className="m-0 focus-visible:outline-none focus-visible:ring-0 flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 flex flex-col overflow-hidden gap-[18px]">
                  
                  {/* Step 1: Role Selection */}
                  {signupStep === 1 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="flex-1 flex flex-col overflow-hidden gap-[18px]"
                    >
                      <div className="space-y-1 mb-3">
                        <h2 className="text-3xl font-bold font-heading tracking-tight leading-tight text-slate-100">Create Account</h2>
                        <p className="text-base text-slate-400 leading-normal">Join PlacementAI to supercharge your career.</p>
                      </div>

                      <div className="form-body flex-1 overflow-y-auto pr-[8px] scrollbar-none gap-[18px]">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">I am:</Label>
                        <div className="grid grid-cols-2 gap-[14px]">
                          <button
                            type="button"
                            onClick={() => setSelectedRole("STUDENT")}
                            className={`auth-role-btn ${selectedRole === "STUDENT" ? "active" : ""}`}
                          >
                            <div className="role-icon-container">
                              <GraduationCap className="w-6 h-6" />
                            </div>
                            <span className="role-label">Student</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedRole("RECRUITER")}
                            className={`auth-role-btn ${selectedRole === "RECRUITER" ? "active" : ""}`}
                          >
                            <div className="role-icon-container">
                              <Briefcase className="w-6 h-6" />
                            </div>
                            <span className="role-label">Recruiter</span>
                          </button>
                        </div>
                      </div>

                      <div className="sticky bottom-0 pt-[14px] z-10" style={{ backgroundColor: "#0F172A" }}>
                        <Button 
                          onClick={() => selectedRole && setSignupStep(2)}
                          disabled={!selectedRole}
                          className="w-full h-12 rounded-2xl bg-slate-900 text-white font-bold transition-all shadow-md flex items-center justify-center text-sm action-btn"
                        >
                          Continue
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Account Details */}
                  {signupStep === 2 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="flex-1 flex flex-col overflow-hidden gap-[18px]"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <button 
                          onClick={() => setSignupStep(1)}
                          className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Step 2 of 3: Account Info</span>
                      </div>

                      <div className="form-body flex-1 overflow-y-auto pr-[8px] scrollbar-none gap-[18px]">
                        <div className="space-y-2">
                          <Label htmlFor="signup-name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Full Name</Label>
                          <Input 
                            id="signup-name" 
                            required 
                            className={getInputClass("name")}
                            value={signupData.fullName}
                            onChange={(e) => setSignupData({...signupData, fullName: e.target.value})}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Email Address</Label>
                          <Input 
                            id="signup-email" 
                            type="email" 
                            required 
                            className={getInputClass("email")}
                            value={signupData.email}
                            onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-[14px]">
                          <div className="space-y-2">
                            <Label htmlFor="signup-password" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Password</Label>
                            <Input 
                              id="signup-password" 
                              type="password" 
                              required 
                              className={getInputClass("password")}
                              value={signupData.password}
                              onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="signup-confirm" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Confirm</Label>
                            <Input 
                              id="signup-confirm" 
                              type="password" 
                              required 
                              className={getInputClass("password")}
                              value={signupData.confirmPassword}
                              onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="sticky bottom-0 pt-[14px] z-10" style={{ backgroundColor: "#0F172A" }}>
                        <Button 
                          onClick={() => {
                            if (!signupData.fullName.trim() || !signupData.email.trim() || !signupData.password || !signupData.confirmPassword) {
                              setError("All fields are required");
                              return;
                            }
                            if (signupData.password !== signupData.confirmPassword) {
                              setError("Passwords do not match");
                              return;
                            }
                            if (signupData.password.length < 6) {
                              setError("Password must be at least 6 characters");
                              return;
                            }
                            setError("");
                            setSignupStep(3);
                          }}
                          className="w-full h-12 rounded-2xl bg-slate-900 text-white font-bold transition-all shadow-md flex items-center justify-center text-sm action-btn"
                        >
                          Continue
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Dynamic Profile Details */}
                  {signupStep === 3 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="flex-1 flex flex-col overflow-hidden gap-[18px]"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <button 
                          onClick={() => setSignupStep(2)}
                          className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          Step 3 of 3: {selectedRole === "STUDENT" ? "Student Details" : "Company Details"}
                        </span>
                      </div>

                      <form onSubmit={handleSignup} className="flex-1 flex flex-col overflow-hidden gap-[18px]">
                        
                        <div className="form-body flex-1 overflow-y-auto pr-[8px] scrollbar-none gap-[18px]">
                          {/* Student Fields */}
                          {selectedRole === "STUDENT" && (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="student-college" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">College *</Label>
                                <Input 
                                  id="student-college" 
                                  required 
                                  className={getInputClass("college")}
                                  value={signupData.collegeName}
                                  onChange={(e) => setSignupData({...signupData, collegeName: e.target.value})}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-[14px]">
                                <div className="space-y-2">
                                  <Label htmlFor="student-degree" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Degree</Label>
                                  <Input 
                                    id="student-degree" 
                                    className={getInputClass("degree")}
                                    value={signupData.degree}
                                    onChange={(e) => setSignupData({...signupData, degree: e.target.value})}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="student-branch" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Branch</Label>
                                  <Input 
                                    id="student-branch" 
                                    className={getInputClass("branch")}
                                    value={signupData.branch}
                                    onChange={(e) => setSignupData({...signupData, branch: e.target.value})}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-[14px]">
                                <div className="space-y-2">
                                  <Label htmlFor="student-grad" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Graduation Year</Label>
                                  <Input 
                                    id="student-grad" 
                                    type="number" 
                                    className={getInputClass("graduation")}
                                    value={signupData.graduationYear}
                                    onChange={(e) => setSignupData({...signupData, graduationYear: parseInt(e.target.value) || 2026})}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="student-sem" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Current Semester</Label>
                                  <Input 
                                    id="student-sem" 
                                    type="number" 
                                    className={getInputClass("semester")}
                                    value={signupData.currentSemester}
                                    onChange={(e) => setSignupData({...signupData, currentSemester: parseInt(e.target.value) || 1})}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Skills</Label>
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {PREDEFINED_SKILLS.map((skill) => {
                                    const isSelected = signupData.skills.includes(skill);
                                    return (
                                      <button
                                        key={skill}
                                        type="button"
                                        onClick={() => {
                                          if (isSelected) {
                                            setSignupData({
                                              ...signupData,
                                              skills: signupData.skills.filter(s => s !== skill)
                                            });
                                          } else {
                                            setSignupData({
                                              ...signupData,
                                              skills: [...signupData.skills, skill]
                                            });
                                          }
                                        }}
                                        className={`auth-skill-btn ${isSelected ? "active" : ""}`}
                                      >
                                        {skill}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="student-role" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Preferred Role</Label>
                                <Input 
                                  id="student-role" 
                                  className={getInputClass("role")}
                                  value={signupData.preferredRole}
                                  onChange={(e) => setSignupData({...signupData, preferredRole: e.target.value})}
                                />
                              </div>
                            </>
                          )}

                          {/* Recruiter Fields */}
                          {selectedRole === "RECRUITER" && (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="recruiter-company" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Company Name *</Label>
                                <Input 
                                  id="recruiter-company" 
                                  required 
                                  className={getInputClass("company")}
                                  value={signupData.companyName}
                                  onChange={(e) => setSignupData({...signupData, companyName: e.target.value})}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-[14px]">
                                <div className="space-y-2">
                                  <Label htmlFor="recruiter-designation" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Designation</Label>
                                  <Input 
                                    id="recruiter-designation" 
                                    className={getInputClass("designation")}
                                    value={signupData.designation}
                                    onChange={(e) => setSignupData({...signupData, designation: e.target.value})}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="recruiter-size" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Company Size</Label>
                                  <Input 
                                    id="recruiter-size" 
                                    className={getInputClass("size")}
                                    value={signupData.companySize}
                                    onChange={(e) => setSignupData({...signupData, companySize: e.target.value})}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="recruiter-roles" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Hiring Roles</Label>
                                <Input 
                                  id="recruiter-roles" 
                                  className={getInputClass("roles")}
                                  value={signupData.hiringRoles}
                                  onChange={(e) => setSignupData({...signupData, hiringRoles: e.target.value})}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-[14px]">
                                <div className="space-y-2">
                                  <Label htmlFor="recruiter-workemail" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Work Email</Label>
                                  <Input 
                                    id="recruiter-workemail" 
                                    type="email" 
                                    className={getInputClass("workemail")}
                                    value={signupData.workEmail}
                                    onChange={(e) => setSignupData({...signupData, workEmail: e.target.value})}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="recruiter-website" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Company Website</Label>
                                  <Input 
                                    id="recruiter-website" 
                                    type="url" 
                                    className={getInputClass("website")}
                                    value={signupData.companyWebsite}
                                    onChange={(e) => setSignupData({...signupData, companyWebsite: e.target.value})}
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="sticky bottom-0 pt-[14px] z-10" style={{ backgroundColor: "#0F172A" }}>
                          <Button type="submit" className="w-full h-12 rounded-2xl bg-slate-900 text-white font-bold transition-all shadow-md flex items-center justify-center text-sm action-btn" disabled={loading}>
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
                          </Button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                </div>
              </TabsContent>

            </Tabs>
          </Card>
        </div>

      </div>
    </div>
  );
}
