"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  
  const { signInWithProvider } = useAuth();
  const supabase = createClient();

  const [signupStep, setSignupStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "RECRUITER" | null>(null);

  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    collegeName: "",
    degree: "",
    branch: "",
    graduationYear: new Date().getFullYear(),
    currentSemester: 1,
    skills: [] as string[],
    preferredRole: "",
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
      const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (sbError) throw sbError;
      
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

  const getFieldError = (fieldName: string) => {
    if (!error) return "";
    const errLower = error.toLowerCase();
    
    if (fieldName === "email") {
      if (errLower.includes("email")) return error;
      if (errLower.includes("all fields") && !loginData.email.trim() && activeTab === "login") {
        return "Email address is required";
      }
      if (errLower.includes("all fields") && !signupData.email.trim() && activeTab === "signup") {
        return "Email address is required";
      }
    }
    if (fieldName === "password") {
      if (errLower.includes("password")) return error;
      if (errLower.includes("all fields") && !loginData.password && activeTab === "login") {
        return "Password is required";
      }
      if (errLower.includes("all fields") && !signupData.password && activeTab === "signup") {
        return "Password is required";
      }
    }
    if (fieldName === "fullName") {
      if (errLower.includes("name")) return error;
      if (errLower.includes("all fields") && !signupData.fullName.trim() && activeTab === "signup") {
        return "Full name is required";
      }
    }
    if (fieldName === "collegeName") {
      if (errLower.includes("college")) return error;
    }
    if (fieldName === "companyName") {
      if (errLower.includes("company")) return error;
    }
    return "";
  };

  const getInputClass = (fieldName: string, baseClass = "auth-input-field") => {
    const fieldErr = getFieldError(fieldName);
    return fieldErr ? `${baseClass} has-error` : baseClass;
  };

  return (
    <div className="auth-root-container selection:bg-primary/10">
      <style>{`
        /* Reset and Root CSS */
        .auth-root-container {
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, #090F1F 0%, #111827 100%) !important;
          padding: 16px;
          overflow: hidden;
          box-sizing: border-box;
          font-family: inherit;
        }

        .auth-main-container {
          width: 100%;
          max-width: 1480px;
          height: 88vh;
          display: flex;
          gap: 64px;
          align-items: center;
          justify-content: center;
          margin: auto;
          box-sizing: border-box;
        }

        /* Left Branding Panel */
        .auth-left-panel {
          width: 48%;
          height: 100%;
          background: #111827 !important;
          border-radius: 32px !important;
          padding: 56px !important;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-start;
          box-sizing: border-box;
          border: 1px solid rgba(255, 255, 255, 0.02) !important;
        }

        .left-panel-logo-container {
          width: 100%;
        }

        .left-panel-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          gap: 32px;
          margin-top: -32px;
        }

        .left-panel-headline {
          font-size: 40px !important;
          font-weight: 700 !important;
          line-height: 1.2 !important;
          letter-spacing: -0.02em !important;
          color: #F8FAFC !important;
        }

        .left-panel-features {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 16px !important;
          font-weight: 400 !important;
          color: #94A3B8 !important;
        }

        .feature-bullet {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #4F46E5 !important;
          flex-shrink: 0;
        }

        .left-panel-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .feature-chip {
          padding: 8px 16px !important;
          background-color: rgba(255, 255, 255, 0.04) !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          border-radius: 9999px !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          color: #F8FAFC !important;
          letter-spacing: 0.02em !important;
        }

        /* Right Auth Panel & Card */
        .auth-right-panel {
          width: 52%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          box-sizing: border-box;
        }

        .auth-right-card {
          width: 560px !important;
          height: fit-content !important;
          max-height: 100% !important;
          background: #0F172A !important;
          border-radius: 28px !important;
          padding: 44px !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.30) !important;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Tabs list styling */
        .auth-tabs-list {
          background-color: #111827 !important;
          height: 48px !important;
          border-radius: 999px !important;
          padding: 4px !important;
          border: none !important;
          display: flex;
          width: 100%;
          box-sizing: border-box;
        }

        .auth-tab-trigger {
          flex: 1;
          border-radius: 999px !important;
          color: #94A3B8 !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          background-color: transparent !important;
          border: none !important;
          transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1) !important;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          cursor: pointer;
        }

        .auth-tab-trigger[data-state=active] {
          background-color: #4F46E5 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25) !important;
        }

        /* Forms Layout & Inputs */
        .auth-header {
          margin-top: 18px;
          margin-bottom: 18px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .auth-header-title {
          font-size: 40px !important;
          font-weight: 700 !important;
          line-height: 1.1 !important;
          letter-spacing: -0.03em !important;
          color: #F8FAFC !important;
        }

        .auth-header-subtitle {
          font-size: 14px !important;
          font-weight: 400 !important;
          color: #94A3B8 !important;
          line-height: 1.4 !important;
        }

        .auth-form-group {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .auth-input-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .auth-input-label {
          font-size: 12px !important;
          font-weight: 600 !important;
          color: #94A3B8 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }

        .auth-input-field {
          height: 54px !important;
          border-radius: 16px !important;
          background-color: #172033 !important;
          border: 1px solid transparent !important;
          padding: 0 16px !important;
          color: #F8FAFC !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          box-sizing: border-box !important;
          transition: border-color 150ms ease, box-shadow 150ms ease !important;
          width: 100%;
          outline: none !important;
        }

        .auth-input-field:focus {
          border-color: #4F46E5 !important;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15) !important;
          outline: none !important;
        }

        .auth-input-field.has-error {
          border-color: #EF4444 !important;
          background-color: rgba(239, 68, 68, 0.05) !important;
        }

        .auth-input-field::placeholder {
          color: #64748B !important;
        }

        /* Validation Spacing */
        .validation-space {
          height: 20px;
          margin-top: 2px;
          font-size: 12px;
          font-weight: 500;
          color: #EF4444;
          display: flex;
          align-items: center;
          box-sizing: border-box;
        }

        .validation-error-text {
          animation: fadeIn 150ms ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-2px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Remember Me Row */
        .remember-forgot-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          font-size: 13px !important;
          font-weight: 500 !important;
          margin-top: -4px;
        }

        .remember-me-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #94A3B8 !important;
          cursor: pointer;
          user-select: none;
        }

        .remember-me-checkbox {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background-color: #172033;
          cursor: pointer;
          accent-color: #4F46E5;
        }

        .forgot-password-link {
          color: #818CF8 !important;
          transition: color 150ms ease !important;
        }

        .forgot-password-link:hover {
          color: #A5B4FC !important;
        }

        /* Buttons & Socials */
        .auth-primary-btn {
          height: 54px !important;
          border-radius: 16px !important;
          background-color: #4F46E5 !important;
          color: #ffffff !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          border: none !important;
          width: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          transition: filter 150ms ease !important;
        }

        .auth-primary-btn:hover {
          filter: brightness(1.1) !important;
        }

        .auth-primary-btn:active {
          filter: brightness(0.95) !important;
        }

        .auth-primary-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-social-divider {
          display: flex;
          align-items: center;
          text-align: center;
          color: #64748B !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          letter-spacing: 0.05em !important;
          text-transform: uppercase;
          margin: 4px 0;
          width: 100%;
        }

        .auth-social-divider::before,
        .auth-social-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .auth-social-divider:not(:empty)::before {
          margin-right: 12px;
        }

        .auth-social-divider:not(:empty)::after {
          margin-left: 12px;
        }

        .social-buttons-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          width: 100%;
        }

        .auth-social-btn {
          height: 52px !important;
          border-radius: 16px !important;
          background-color: #172033 !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          color: #F8FAFC !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          cursor: pointer !important;
          transition: background-color 150ms ease, border-color 150ms ease !important;
        }

        .auth-social-btn:hover {
          background-color: #1E293B !important;
          border-color: rgba(255, 255, 255, 0.08) !important;
        }

        /* Signup Specific Elements */
        .auth-role-btn {
          background-color: #172033 !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          border-radius: 16px !important;
          padding: 24px !important;
          text-align: center !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          gap: 12px !important;
          transition: all 150ms ease !important;
          cursor: pointer !important;
          flex: 1;
        }

        .auth-role-btn:hover {
          background-color: #1E293B !important;
          border-color: rgba(255, 255, 255, 0.08) !important;
        }

        .auth-role-btn.active {
          background-color: rgba(99, 102, 241, 0.1) !important;
          border-color: #4F46E5 !important;
        }

        .role-icon-container {
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

        .role-label {
          font-weight: 700 !important;
          font-size: 14px !important;
          color: #CBD5E1 !important;
        }

        .auth-role-btn.active .role-label {
          color: #F8FAFC !important;
        }

        .auth-skill-btn {
          padding: 8px 14px !important;
          border-radius: 12px !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          background-color: #172033 !important;
          color: #94A3B8 !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          transition: all 150ms ease !important;
          cursor: pointer;
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

        .signup-step3-scroll-area {
          max-height: 44vh;
          overflow-y: auto;
          padding-right: 6px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .signup-step3-scroll-area::-webkit-scrollbar {
          width: 6px;
        }

        .signup-step3-scroll-area::-webkit-scrollbar-track {
          background: transparent;
        }

        .signup-step3-scroll-area::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 99px;
        }

        .signup-step3-scroll-area::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        /* Fixed alert message at top of card */
        .auth-alert-message {
          padding: 8px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          box-sizing: border-box;
          height: 36px;
        }

        .auth-alert-error {
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
        }

        .auth-alert-success {
          background-color: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #34d399;
        }

        /* Responsive Layout Rules */
        @media (max-width: 1023px) {
          .auth-main-container {
            height: auto;
            flex-direction: column;
            gap: 32px;
            padding: 32px 16px;
            overflow-y: auto;
          }
          .auth-root-container {
            overflow-y: auto;
            height: auto;
            min-height: 100vh;
          }
          .auth-left-panel {
            width: 100%;
            height: auto;
            padding: 40px !important;
          }
          .auth-right-panel {
            width: 100%;
            height: auto;
          }
          .left-panel-content {
            margin-top: 0;
            gap: 24px;
          }
          .left-panel-headline {
            font-size: 32px !important;
          }
        }

        @media (max-width: 640px) {
          .auth-left-panel {
            display: none;
          }
          .auth-main-container {
            padding: 16px 0;
          }
          .auth-right-card {
            width: 100% !important;
            padding: 28px 20px !important;
            border-radius: 20px !important;
          }
          .auth-header-title {
            font-size: 32px !important;
          }
          .signup-step3-scroll-area {
            max-height: 55vh;
          }
        }
      `}</style>

      <div className="auth-main-container">
        {/* Left Panel: Brand & Features */}
        <div className="auth-left-panel">
          <div className="left-panel-logo-container">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-xl bg-[#4F46E5]">A</div>
              <span className="font-heading font-bold text-2xl tracking-tighter text-white">PlacementAI</span>
            </Link>
          </div>

          <div className="left-panel-content">
            <h2 className="left-panel-headline">
              Your AI Placement<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-300">Copilot</span>
            </h2>
            
            <div className="left-panel-features">
              <div className="feature-item">
                <span className="feature-bullet" />
                <span>Prepare smarter for your dream career.</span>
              </div>
              <div className="feature-item">
                <span className="feature-bullet" />
                <span>Build professional, ATS-optimized resumes.</span>
              </div>
              <div className="feature-item">
                <span className="feature-bullet" />
                <span>Practice realistic, role-specific mock interviews.</span>
              </div>
              <div className="feature-item">
                <span className="feature-bullet" />
                <span>Get placed at top companies globally.</span>
              </div>
            </div>

            <div className="left-panel-chips">
              <span className="feature-chip">Resume Builder</span>
              <span className="feature-chip">ATS Optimization</span>
              <span className="feature-chip">Mock Interview</span>
              <span className="feature-chip">Career Roadmaps</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Auth Card */}
        <div className="auth-right-panel">
          <Card className="auth-right-card">
            {/* Top alert block to keep alignment consistent */}
            <div className="h-9 mb-3 flex items-center box-border shrink-0">
              {error ? (
                <div className="auth-alert-message auth-alert-error">
                  <span>{error}</span>
                  <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 transition-colors p-0.5 outline-none bg-transparent border-none cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : success ? (
                <div className="auth-alert-message auth-alert-success">
                  <span>{success}</span>
                  <button onClick={() => setSuccess("")} className="text-emerald-400 hover:text-emerald-600 transition-colors p-0.5 outline-none bg-transparent border-none cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : null}
            </div>

            <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setError(""); }} className="w-full flex-1 flex flex-col overflow-hidden">
              <div className="mb-4">
                <TabsList className="auth-tabs-list">
                  <TabsTrigger value="login" className="auth-tab-trigger">Login</TabsTrigger>
                  <TabsTrigger value="signup" className="auth-tab-trigger">Sign Up</TabsTrigger>
                </TabsList>
              </div>

              {/* Login View */}
              <TabsContent value="login" className="m-0 focus-visible:outline-none focus-visible:ring-0 flex-1 flex flex-col overflow-hidden">
                <form onSubmit={handleLogin} className="flex-1 flex flex-col overflow-hidden auth-form-group">
                  <div className="auth-header">
                    <h1 className="auth-header-title">Welcome Back</h1>
                    <p className="auth-header-subtitle">Enter your credentials to access your dashboard.</p>
                  </div>

                  <div className="auth-form-group flex-1 overflow-y-auto">
                    {/* Email Input */}
                    <div className="auth-input-container">
                      <Label htmlFor="login-email" className="auth-input-label">Email Address</Label>
                      <Input 
                        id="login-email" 
                        type="email" 
                        className={getInputClass("email")}
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        placeholder="name@example.com"
                      />
                      <div className="validation-space">
                        {getFieldError("email") && (
                          <span className="validation-error-text">{getFieldError("email")}</span>
                        )}
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="auth-input-container">
                      <Label htmlFor="login-password" className="auth-input-label">Password</Label>
                      <Input 
                        id="login-password" 
                        type="password" 
                        className={getInputClass("password")}
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        placeholder="••••••••"
                      />
                      <div className="validation-space">
                        {getFieldError("password") && (
                          <span className="validation-error-text">{getFieldError("password")}</span>
                        )}
                      </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="remember-forgot-row">
                      <label className="remember-me-label">
                        <input 
                          type="checkbox" 
                          checked={rememberMe} 
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="remember-me-checkbox"
                        />
                        <span>Remember Me</span>
                      </label>
                      <Link href="/auth/forgot-password" className="forgot-password-link">
                        Forgot Password?
                      </Link>
                    </div>
                  </div>

                  {/* CTAs & Social Sign-In */}
                  <div className="mt-4 flex flex-col gap-4">
                    <Button type="submit" className="auth-primary-btn" disabled={loading}>
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                    </Button>
                    
                    <div className="auth-social-divider">Continue with</div>
                    
                    <div className="social-buttons-container">
                      <Button 
                        type="button" 
                        className="auth-social-btn"
                        onClick={() => handleOAuth('google')}
                        disabled={loading}
                      >
                        <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                          <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"></path>
                          <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"></path>
                          <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"></path>
                          <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853"></path>
                        </svg>
                        Google
                      </Button>
                      <Button 
                        type="button" 
                        className="auth-social-btn"
                        onClick={() => handleOAuth('github')}
                        disabled={loading}
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                        </svg>
                        GitHub
                      </Button>
                    </div>
                  </div>
                </form>
              </TabsContent>

              {/* Sign Up View */}
              <TabsContent value="signup" className="m-0 focus-visible:outline-none focus-visible:ring-0 flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 flex flex-col overflow-hidden auth-form-group">
                  
                  {/* Step 1: Role Selection */}
                  {signupStep === 1 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="flex-1 flex flex-col overflow-hidden auth-form-group"
                    >
                      <div className="auth-header">
                        <h1 className="auth-header-title">Create Account</h1>
                        <p className="auth-header-subtitle">Join PlacementAI to supercharge your career.</p>
                      </div>

                      <div className="flex-1 overflow-y-auto">
                        <Label className="auth-input-label block mb-3">I am a:</Label>
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => { setSelectedRole("STUDENT"); setError(""); }}
                            className={`auth-role-btn ${selectedRole === "STUDENT" ? "active" : ""}`}
                          >
                            <div className="role-icon-container">
                              <GraduationCap className="w-6 h-6" />
                            </div>
                            <span className="role-label">Student</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => { setSelectedRole("RECRUITER"); setError(""); }}
                            className={`auth-role-btn ${selectedRole === "RECRUITER" ? "active" : ""}`}
                          >
                            <div className="role-icon-container">
                              <Briefcase className="w-6 h-6" />
                            </div>
                            <span className="role-label">Recruiter</span>
                          </button>
                        </div>
                        <div className="validation-space">
                          {!selectedRole && error.toLowerCase().includes("role") && (
                            <span className="validation-error-text">Please select a role to continue</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <Button 
                          onClick={() => {
                            if (!selectedRole) {
                              setError("Role is required");
                            } else {
                              setError("");
                              setSignupStep(2);
                            }
                          }}
                          className="auth-primary-btn"
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
                      className="flex-1 flex flex-col overflow-hidden auth-form-group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <button 
                          onClick={() => setSignupStep(1)}
                          className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Step 2 of 3: Account Info</span>
                      </div>

                      <div className="auth-form-group flex-1 overflow-y-auto">
                        {/* Name */}
                        <div className="auth-input-container">
                          <Label htmlFor="signup-name" className="auth-input-label">Full Name</Label>
                          <Input 
                            id="signup-name" 
                            className={getInputClass("fullName")}
                            value={signupData.fullName}
                            onChange={(e) => setSignupData({...signupData, fullName: e.target.value})}
                            placeholder="John Doe"
                          />
                          <div className="validation-space">
                            {getFieldError("fullName") && (
                              <span className="validation-error-text">{getFieldError("fullName")}</span>
                            )}
                          </div>
                        </div>

                        {/* Email */}
                        <div className="auth-input-container">
                          <Label htmlFor="signup-email" className="auth-input-label">Email Address</Label>
                          <Input 
                            id="signup-email" 
                            type="email" 
                            className={getInputClass("email")}
                            value={signupData.email}
                            onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                            placeholder="name@example.com"
                          />
                          <div className="validation-space">
                            {getFieldError("email") && (
                              <span className="validation-error-text">{getFieldError("email")}</span>
                            )}
                          </div>
                        </div>

                        {/* Password & Confirm Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="auth-input-container">
                            <Label htmlFor="signup-password" className="auth-input-label">Password</Label>
                            <Input 
                              id="signup-password" 
                              type="password" 
                              className={getInputClass("password")}
                              value={signupData.password}
                              onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                              placeholder="••••••••"
                            />
                          </div>

                          <div className="auth-input-container">
                            <Label htmlFor="signup-confirm" className="auth-input-label">Confirm Password</Label>
                            <Input 
                              id="signup-confirm" 
                              type="password" 
                              className={getInputClass("password")}
                              value={signupData.confirmPassword}
                              onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                              placeholder="••••••••"
                            />
                          </div>
                        </div>
                        <div className="validation-space text-xs">
                          {getFieldError("password") && (
                            <span className="validation-error-text">{getFieldError("password")}</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
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
                          className="auth-primary-btn"
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
                      className="flex-1 flex flex-col overflow-hidden auth-form-group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <button 
                          onClick={() => setSignupStep(2)}
                          className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          Step 3 of 3: {selectedRole === "STUDENT" ? "Student Profile" : "Company Profile"}
                        </span>
                      </div>

                      <form onSubmit={handleSignup} className="flex-1 flex flex-col overflow-hidden auth-form-group">
                        <div className="signup-step3-scroll-area flex-1">
                          {/* Student Fields */}
                          {selectedRole === "STUDENT" && (
                            <>
                              <div className="auth-input-container">
                                <Label htmlFor="student-college" className="auth-input-label">College *</Label>
                                <Input 
                                  id="student-college" 
                                  className={getInputClass("college")}
                                  value={signupData.collegeName}
                                  onChange={(e) => setSignupData({...signupData, collegeName: e.target.value})}
                                  placeholder="e.g. Stanford University"
                                />
                                <div className="validation-space">
                                  {getFieldError("collegeName") && (
                                    <span className="validation-error-text">{getFieldError("collegeName")}</span>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="auth-input-container">
                                  <Label htmlFor="student-degree" className="auth-input-label">Degree</Label>
                                  <Input 
                                    id="student-degree" 
                                    className={getInputClass("degree")}
                                    value={signupData.degree}
                                    onChange={(e) => setSignupData({...signupData, degree: e.target.value})}
                                    placeholder="e.g. B.Tech"
                                  />
                                </div>

                                <div className="auth-input-container">
                                  <Label htmlFor="student-branch" className="auth-input-label">Branch</Label>
                                  <Input 
                                    id="student-branch" 
                                    className={getInputClass("branch")}
                                    value={signupData.branch}
                                    onChange={(e) => setSignupData({...signupData, branch: e.target.value})}
                                    placeholder="e.g. Computer Science"
                                  />
                                </div>
                              </div>
                              <div className="validation-space" />

                              <div className="grid grid-cols-2 gap-4">
                                <div className="auth-input-container">
                                  <Label htmlFor="student-grad" className="auth-input-label">Graduation Year</Label>
                                  <Input 
                                    id="student-grad" 
                                    type="number" 
                                    className={getInputClass("graduation")}
                                    value={signupData.graduationYear}
                                    onChange={(e) => setSignupData({...signupData, graduationYear: parseInt(e.target.value) || 2026})}
                                  />
                                </div>

                                <div className="auth-input-container">
                                  <Label htmlFor="student-sem" className="auth-input-label">Current Semester</Label>
                                  <Input 
                                    id="student-sem" 
                                    type="number" 
                                    className={getInputClass("semester")}
                                    value={signupData.currentSemester}
                                    onChange={(e) => setSignupData({...signupData, currentSemester: parseInt(e.target.value) || 1})}
                                  />
                                </div>
                              </div>
                              <div className="validation-space" />

                              <div className="auth-input-container">
                                <Label className="auth-input-label block mb-1">Skills</Label>
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {PREDEFINED_SKILLS.map((skill) => {
                                    const isSelected = signupData.skills.includes(skill);
                                    return (
                                      <button
                                        key={skill}
                                        type="button"
                                        onClick={() => {
                                          if (isSelected) {
                                            setSignupData({...signupData, skills: signupData.skills.filter(s => s !== skill)});
                                          } else {
                                            setSignupData({...signupData, skills: [...signupData.skills, skill]});
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
                              <div className="validation-space" />

                              <div className="auth-input-container">
                                <Label htmlFor="student-role" className="auth-input-label">Preferred Role</Label>
                                <Input 
                                  id="student-role" 
                                  className={getInputClass("role")}
                                  value={signupData.preferredRole}
                                  onChange={(e) => setSignupData({...signupData, preferredRole: e.target.value})}
                                  placeholder="e.g. Software Engineer"
                                />
                              </div>
                              <div className="validation-space" />
                            </>
                          )}

                          {/* Recruiter Fields */}
                          {selectedRole === "RECRUITER" && (
                            <>
                              <div className="auth-input-container">
                                <Label htmlFor="recruiter-company" className="auth-input-label">Company Name *</Label>
                                <Input 
                                  id="recruiter-company" 
                                  className={getInputClass("company")}
                                  value={signupData.companyName}
                                  onChange={(e) => setSignupData({...signupData, companyName: e.target.value})}
                                  placeholder="e.g. Stripe"
                                />
                                <div className="validation-space">
                                  {getFieldError("companyName") && (
                                    <span className="validation-error-text">{getFieldError("companyName")}</span>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="auth-input-container">
                                  <Label htmlFor="recruiter-designation" className="auth-input-label">Designation</Label>
                                  <Input 
                                    id="recruiter-designation" 
                                    className={getInputClass("designation")}
                                    value={signupData.designation}
                                    onChange={(e) => setSignupData({...signupData, designation: e.target.value})}
                                    placeholder="e.g. Talent Lead"
                                  />
                                </div>

                                <div className="auth-input-container">
                                  <Label htmlFor="recruiter-size" className="auth-input-label">Company Size</Label>
                                  <Input 
                                    id="recruiter-size" 
                                    className={getInputClass("size")}
                                    value={signupData.companySize}
                                    onChange={(e) => setSignupData({...signupData, companySize: e.target.value})}
                                    placeholder="e.g. 50-100"
                                  />
                                </div>
                              </div>
                              <div className="validation-space" />

                              <div className="auth-input-container">
                                <Label htmlFor="recruiter-roles" className="auth-input-label">Hiring Roles</Label>
                                <Input 
                                  id="recruiter-roles" 
                                  className={getInputClass("roles")}
                                  value={signupData.hiringRoles}
                                  onChange={(e) => setSignupData({...signupData, hiringRoles: e.target.value})}
                                  placeholder="e.g. Frontend Devs"
                                />
                              </div>
                              <div className="validation-space" />

                              <div className="grid grid-cols-2 gap-4">
                                <div className="auth-input-container">
                                  <Label htmlFor="recruiter-workemail" className="auth-input-label">Work Email</Label>
                                  <Input 
                                    id="recruiter-workemail" 
                                    type="email" 
                                    className={getInputClass("workemail")}
                                    value={signupData.workEmail}
                                    onChange={(e) => setSignupData({...signupData, workEmail: e.target.value})}
                                    placeholder="recruiter@company.com"
                                  />
                                </div>

                                <div className="auth-input-container">
                                  <Label htmlFor="recruiter-website" className="auth-input-label">Company Website</Label>
                                  <Input 
                                    id="recruiter-website" 
                                    type="url" 
                                    className={getInputClass("website")}
                                    value={signupData.companyWebsite}
                                    onChange={(e) => setSignupData({...signupData, companyWebsite: e.target.value})}
                                    placeholder="https://company.com"
                                  />
                                </div>
                              </div>
                              <div className="validation-space" />
                            </>
                          )}
                        </div>

                        <div className="mt-4">
                          <Button type="submit" className="auth-primary-btn" disabled={loading}>
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
