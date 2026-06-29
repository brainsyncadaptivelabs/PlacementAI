"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { YearDropdown } from "@/components/ui/year-dropdown";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, X, GraduationCap, Briefcase, ChevronLeft, Mail, Lock, Eye, EyeOff, FileText, Shield, User, Map, Book, Phone, CheckCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";

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
  const { setTheme } = useTheme();
  
  useEffect(() => {
    setTheme('light');
  }, [setTheme]);
  
  const { signInWithProvider } = useAuth();
  const supabase = createClient();

  const PREDEFINED_ROLES = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Scientist",
    "Product Manager",
    "UI/UX Designer",
    "DevOps Engineer",
    "Mobile App Developer",
    "QA Engineer"
  ];

  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "RECRUITER">("STUDENT");
  const [skillsSearch, setSkillsSearch] = useState("");
  const [skillsDropdownOpen, setSkillsDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    phone: "",
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

  const handleRequestOtp = async () => {
    if (!signupData.email) {
      setError("Please enter your email first");
      return;
    }
    setSendingOtp(true);
    setError("");
    setSuccess("");
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
      const response = await fetch(`${API_URL}/auth/request-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupData.email })
      });
      if (!response.ok) {
        const errObj = await response.json().catch(() => ({}));
        throw new Error(errObj.message || "Failed to send OTP");
      }
      setShowOtpInput(true);
      setSuccess("OTP sent to your email!");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }
    setVerifyingOtp(true);
    setError("");
    setSuccess("");
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
      const response = await fetch(`${API_URL}/auth/verify-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupData.email, otp })
      });
      if (!response.ok) {
        const errObj = await response.json().catch(() => ({}));
        throw new Error(errObj.message || "Invalid OTP");
      }
      setIsEmailVerified(true);
      setShowOtpInput(false);
      setSuccess("Email successfully verified!");
    } catch (err: any) {
      setError(err.message || "Failed to verify OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEmailVerified) {
      setError("Please verify your email before signing up");
      return;
    }

    if (selectedRole === "STUDENT" && !signupData.collegeName.trim()) {
      setError("College name is required");
      return;
    }
    if (selectedRole === "STUDENT" && !signupData.branch.trim()) {
      setError("Branch is required");
      return;
    }
    if (selectedRole === "RECRUITER" && !signupData.companyName.trim()) {
      setError("Company name is required");
      return;
    }
    if (!signupData.phone.trim()) {
      setError("Phone number is required");
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
      const signupBody = {
        fullName: signupData.fullName,
        email: signupData.email,
        password: signupData.password,
        confirmPassword: signupData.confirmPassword,
        phone: signupData.phone,
        role: selectedRole,
        collegeName: selectedRole === "STUDENT" ? signupData.collegeName : null,
        branch: selectedRole === "STUDENT" ? signupData.branch : null,
        graduationYear: selectedRole === "STUDENT" ? signupData.graduationYear : null,
        semester: selectedRole === "STUDENT" ? signupData.currentSemester : null,
        skills: selectedRole === "STUDENT" ? signupData.skills.join(",") : "",
        preferredRole: selectedRole === "STUDENT" ? signupData.preferredRole : "",
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

      // Now create Supabase user
      const { data: sbData, error: sbError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: backendData.fullName || signupData.fullName,
            role: backendData.role || selectedRole
          }
        }
      });

      if (sbError) {
        console.warn("Supabase signup failed:", sbError.message);
      }

      localStorage.setItem("token", backendData.accessToken);
      localStorage.setItem("role", backendData.role);

      setSuccess("Account created successfully! Redirecting...");
      
      setTimeout(() => {
        if (!backendData.planSelected) {
          router.push("/plans");
        } else {
          router.push("/dashboard");
        }
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
        const errMsg = errObj.message || "Backend authentication failed";
        throw new Error(errMsg);
      }

      const backendData = await response.json();
      
      // Now login to Supabase to keep client session in sync
      const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (sbError) {
        console.warn("Supabase login failed, attempting auto-registration:", sbError.message);
        const { error: signUpError } = await supabase.auth.signUp({
          email: loginData.email,
          password: loginData.password,
          options: {
            data: {
              full_name: backendData.fullName || "User",
              role: backendData.role
            }
          }
        });
        if (signUpError) {
          console.error("Supabase auto-registration failed:", signUpError.message);
        }
      }
      
      localStorage.setItem("token", backendData.accessToken);
      localStorage.setItem("role", backendData.role);

      if (!backendData.planSelected) {
        router.push("/plans");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
      if (err.message === "Please verify your email first.") {
        setTimeout(() => {
          router.push(`/auth/verify-email?email=${encodeURIComponent(loginData.email)}`);
        }, 1500);
      }
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
      if (errLower.includes("name") && !errLower.includes("college") && !errLower.includes("company")) return error;
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
          background: #f9fafb;
          font-family: inherit;
          position: relative;
        }

        .auth-main-container {
          width: 100%;
          display: flex;
          flex-direction: row;
          height: 100vh;
        }

        /* Left Branding Panel */
        .auth-left-panel {
          width: 45%;
          height: 100vh;
          background: linear-gradient(145deg, #1e1b4b, #312e81, #4338ca);
          padding: 32px 48px;
          display: flex;
          flex-direction: column;
          color: white;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
        }

        /* Subtle background effects for left panel */
        .auth-left-panel::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.15) 0%, transparent 40%),
                      radial-gradient(circle at bottom left, rgba(79, 70, 229, 0.15) 0%, transparent 40%);
          pointer-events: none;
        }

        .left-panel-logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
          z-index: 10;
        }

        .left-panel-headline {
          font-size: 32px;
          font-weight: 700;
          line-height: 1.25;
          margin-bottom: 16px;
          z-index: 10;
        }
        
        .left-panel-headline span {
          color: #a5b4fc;
        }

        .left-panel-description {
          font-size: 15px;
          color: #cbd5e1;
          line-height: 1.5;
          margin-bottom: 24px;
          max-width: 420px;
          z-index: 10;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          z-index: 10;
        }

        .feature-item-new {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .feature-icon-container {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(99, 102, 241, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #a5b4fc;
        }

        .feature-text-new h3 {
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: white;
        }

        .feature-text-new p {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
          line-height: 1.4;
        }

        .testimonial-box {
          margin-top: auto;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          z-index: 10;
        }

        .testimonial-text {
          font-size: 14px;
          color: #cbd5e1;
          line-height: 1.5;
          margin-bottom: 16px;
          font-style: italic;
          position: relative;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .author-info h4 {
          font-size: 13px;
          font-weight: 600;
          margin: 0;
          color: white;
        }

        .author-info p {
          font-size: 11px;
          color: #94a3b8;
          margin: 0;
        }

        .auth-right-panel {
          width: 55%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          padding: 40px;
          box-sizing: border-box;
          overflow-y: auto;
        }

        .auth-top-nav {
          margin-top: 16px;
          text-align: center;
          font-size: 14px;
          color: #64748b;
        }

        .auth-top-nav button {
          color: #4f46e5;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
        }

        .auth-card {
          width: 100%;
          max-width: 480px;
          background: white;
          border-radius: 24px;
          padding: 24px 32px;
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08);
          border: 1px solid #f1f5f9;
          box-sizing: border-box;
          margin: auto;
        }

        .auth-card-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .auth-card-title {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .auth-card-subtitle {
          font-size: 14px;
          color: #64748b;
        }

        /* Form Controls */
        .input-group {
          margin-bottom: 14px;
          width: 100%;
        }

        .input-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .input-label-row label {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
        }

        .forgot-password-link {
          font-size: 12px;
          font-weight: 600;
          color: #4f46e5;
          text-decoration: none;
        }

        .input-wrapper {
          position: relative;
          width: 100%;
        }

        .input-wrapper svg {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          width: 18px;
          height: 18px;
        }
        
        .input-wrapper .password-toggle {
          left: auto;
          right: 16px;
          cursor: pointer;
          background: none;
          border: none;
          display: flex;
          align-items: center;
          padding: 0;
        }

        input.auth-input-new {
          width: 100%;
          height: 42px;
          padding: 0 44px;
          border: 1px solid #e2e8f0 !important;
          border-radius: 12px !important;
          font-size: 14px;
          color: #0f172a !important;
          background-color: #ffffff !important;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .dark input.auth-input-new {
          border: 1px solid #334155 !important;
          color: #f8fafc !important;
          background-color: #1e293b !important;
        }

        input.auth-input-new::placeholder {
          color: #64748b !important;
          opacity: 1 !important;
        }

        .dark input.auth-input-new::placeholder {
          color: #94a3b8 !important;
        }

        input.auth-input-new:-webkit-autofill,
        input.auth-input-new:-webkit-autofill:hover, 
        input.auth-input-new:-webkit-autofill:focus, 
        input.auth-input-new:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px white inset !important;
          -webkit-text-fill-color: #0f172a !important;
        }

        .dark input.auth-input-new:-webkit-autofill,
        .dark input.auth-input-new:-webkit-autofill:hover, 
        .dark input.auth-input-new:-webkit-autofill:focus, 
        .dark input.auth-input-new:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #1e293b inset !important;
          -webkit-text-fill-color: #f8fafc !important;
        }

        .auth-input-new:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .remember-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .remember-checkbox {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1px solid #4f46e5;
          background: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .remember-checkbox svg {
          color: white;
          width: 12px;
          height: 12px;
        }
        
        .remember-checkbox.unchecked {
          background: white;
          border-color: #cbd5e1;
        }

        .remember-text {
          font-size: 13px;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          user-select: none;
        }

        .auth-btn-primary {
          width: 100%;
          height: 42px;
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
        }

        .auth-btn-primary:hover {
          background: #4f46e5;
        }

        .divider-container {
          display: flex;
          align-items: center;
          margin: 16px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }

        .divider-text {
          font-size: 12px;
          color: #94a3b8;
          padding: 0 16px;
        }

        .social-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .social-btn {
          width: 100%;
          height: 38px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .social-btn:hover {
          background: #f8fafc;
        }

        .card-footer {
          margin-top: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 12px;
          color: #94a3b8;
        }

        /* Footer Global */
        .global-footer {
          margin-top: 16px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          font-size: 12px;
          color: #94a3b8;
        }

        .footer-links {
          display: flex;
          gap: 24px;
        }
        
        .footer-links a {
          color: #64748b;
          text-decoration: none;
        }
        
        /* Validation */
        .error-message {
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
        }
        
        /* Alerts */
        .auth-alert-container {
          position: absolute;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 50;
          width: 90%;
          max-width: 480px;
        }

        .auth-alert-message {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          box-sizing: border-box;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .auth-alert-error {
          background-color: white;
          border-left: 4px solid #ef4444;
          color: #1e293b;
        }

        .auth-alert-success {
          background-color: white;
          border-left: 4px solid #10b981;
          color: #1e293b;
        }
        
        /* Signup Specific */
        .signup-card {
          max-width: 800px;
        }
        
        .signup-form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        
        .col-span-2 {
          grid-column: span 2;
        }
        
        .auth-role-btn {
          flex: 1;
          padding: 12px;
          border: 1px solid #e2e8f0 !important;
          border-radius: 12px;
          background: white !important;
          color: var(--foreground, #0f172a) !important;
          font-weight: 700 !important;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        
        .auth-role-btn.active {
          border-color: var(--primary, #4f46e5) !important;
          background: rgba(99, 102, 241, 0.1) !important;
          color: var(--primary, #4f46e5) !important;
        }
      `}</style>

      {/* Alerts */}
      {error && (
        <div className="auth-alert-container">
          <div className="auth-alert-message auth-alert-error">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 outline-none bg-transparent border-none cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {success && (
        <div className="auth-alert-container">
          <div className="auth-alert-message auth-alert-success">
            <span>{success}</span>
            <button type="button" onClick={() => setSuccess("")} className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 outline-none bg-transparent border-none cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="auth-main-container">
        
        {/* Left Branding Panel */}
        <div className="auth-left-panel">
          <div className="left-panel-logo-container">
            <div className="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center">
              <Briefcase className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-wide">PlacementAI</span>
          </div>

          <div className="flex items-center gap-2 bg-white/10 w-fit px-3 py-1.5 rounded-full mb-6 border border-white/10">
            <span className="text-xs font-semibold text-white">✨ AI-Powered Career Success</span>
          </div>

          <h1 className="left-panel-headline">
            Your AI-Powered<br />
            Placement <span>Partner</span>
          </h1>

          <p className="left-panel-description">
            Get AI-driven insights, practice interviews, build your resume, and land your dream job.
          </p>

          <div className="features-list">
            <div className="feature-item-new">
              <div className="feature-icon-container">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </div>
              <div className="feature-text-new">
                <h3>AI Mock Interviews</h3>
                <p>Practice with AI and improve your confidence</p>
              </div>
            </div>

            <div className="feature-item-new">
              <div className="feature-icon-container">
                <FileText className="w-5 h-5" />
              </div>
              <div className="feature-text-new">
                <h3>Resume Builder</h3>
                <p>Create ATS-friendly resumes in minutes</p>
              </div>
            </div>

            <div className="feature-item-new">
              <div className="feature-icon-container">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <div className="feature-text-new">
                <h3>AI Career Assistant</h3>
                <p>Get answers to your career questions</p>
              </div>
            </div>

            <div className="feature-item-new">
              <div className="feature-icon-container">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="18" y="3" width="4" height="18"></rect><rect x="10" y="8" width="4" height="13"></rect><rect x="2" y="13" width="4" height="8"></rect></svg>
              </div>
              <div className="feature-text-new">
                <h3>Smart Job Matching</h3>
                <p>Find jobs that match your skills</p>
              </div>
            </div>
          </div>

          <div className="mt-auto relative" style={{ height: '250px' }}>
             {/* Robot Image Placeholder */}
             <div className="absolute bottom-0 right-0 left-0 flex justify-center translate-y-8">
               <div className="w-64 h-64 bg-indigo-800/30 rounded-full flex items-center justify-center border border-indigo-400/20 backdrop-blur-sm relative overflow-hidden">
                 <div className="text-indigo-200/50 flex flex-col items-center">
                   <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Right Auth Panel */}
        <div className="auth-right-panel relative">
          
          {activeTab === 'login' ? (
            <div className="auth-card">
              <div className="auth-card-header">
                <h2 className="auth-card-title">Welcome Back</h2>
                <p className="auth-card-subtitle">Login to continue your placement journey</p>
              </div>

              <form onSubmit={handleLogin}>
                <div className="input-group">
                  <div className="input-label-row">
                    <label htmlFor="email">Email</label>
                  </div>
                  <div className="input-wrapper">
                    <Mail />
                    <input 
                      id="email"
                      type="email" 
                      className="auth-input-new" 
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <div className="input-label-row">
                    <label htmlFor="password">Password</label>
                    <Link href="/auth/forgot-password" className="forgot-password-link">Forgot password?</Link>
                  </div>
                  <div className="input-wrapper">
                    <Lock />
                    <input 
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="auth-input-new" 
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <div className="remember-row">
                  <div 
                    className={`remember-checkbox ${!rememberMe ? 'unchecked' : ''}`}
                    onClick={() => setRememberMe(!rememberMe)}
                  >
                    {rememberMe && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                  </div>
                  <span className="remember-text" onClick={() => setRememberMe(!rememberMe)}>Remember me</span>
                </div>

                <button type="submit" className="auth-btn-primary" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login"}
                </button>

                <div className="divider-container">
                  <div className="divider-line"></div>
                  <span className="divider-text">or continue with</span>
                  <div className="divider-line"></div>
                </div>

                <div className="social-buttons">
                  <button type="button" className="social-btn" onClick={() => handleOAuth('google')} disabled={loading}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>
                  <button type="button" className="social-btn" onClick={() => handleOAuth('github')} disabled={loading}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    Continue with GitHub
                  </button>
                </div>

                <div className="card-footer">
                  <Shield width="14" height="14" />
                  Your data is secure with us
                </div>
              </form>
              
              <div className="auth-top-nav">
                Don't have an account? <button onClick={() => { setActiveTab('signup'); setError(''); }}>Sign up</button>
              </div>
              <div className="global-footer">
                <div>© 2026 PlacementAI. All rights reserved.</div>
                <div className="footer-links">
                  <Link href="#">Privacy Policy</Link>
                  <Link href="#">Terms of Service</Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-card signup-card relative">
              <div className="text-center mb-8 relative">
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                  <span className="text-slate-400">✦</span>
                  Create your <span className="text-indigo-600">account</span>
                  <span className="text-indigo-400">✦</span>
                </h2>
                <p className="text-slate-500 font-medium">Join <span className="text-indigo-600 font-bold">PlacementAI</span> and start your success journey</p>
              </div>
              <form onSubmit={handleSignup}>
                <div className="flex gap-4 mb-8">
                  <button
                    type="button"
                    onClick={() => { setSelectedRole("STUDENT"); setError(""); }}
                    className={`auth-role-btn flex-1 py-3 px-6 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all ${selectedRole === "STUDENT" ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Book className="w-4 h-4" />
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedRole("RECRUITER"); setError(""); }}
                    className={`auth-role-btn flex-1 py-3 px-6 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all ${selectedRole === "RECRUITER" ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Recruiter</span>
                  </button>
                </div>

                <div className="signup-form-grid">
                  <div className="input-group">
                    <div className="input-label-row"><label>Full Name</label></div>
                    <div className="input-wrapper">
                      <User />
                      <input className="auth-input-new" placeholder="John Doe" value={signupData.fullName} onChange={(e) => setSignupData({...signupData, fullName: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className="input-group">
                    <div className="input-label-row"><label>Email</label></div>
                    <div className="input-wrapper" style={{ paddingRight: '8px' }}>
                      <Mail />
                      <input type="email" className="auth-input-new flex-1" placeholder="name@example.com" value={signupData.email} onChange={(e) => setSignupData({...signupData, email: e.target.value})} disabled={isEmailVerified || showOtpInput} />
                      {!isEmailVerified && (
                        <button type="button" onClick={handleRequestOtp} disabled={sendingOtp || showOtpInput} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 shrink-0">
                          {sendingOtp ? 'Sending...' : (showOtpInput ? 'Sent' : 'Verify')}
                        </button>
                      )}
                      {isEmailVerified && (
                        <span className="text-sm font-semibold text-green-600 shrink-0 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {showOtpInput && !isEmailVerified && (
                    <div className="input-group col-span-2 mt-[-8px]">
                      <div className="input-wrapper" style={{ paddingRight: '8px', background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
                        <Lock className="text-indigo-500" />
                        <input type="text" className="auth-input-new flex-1 tracking-[0.2em] font-mono text-lg bg-transparent" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0,6))} />
                        <button type="button" onClick={handleVerifyOtp} disabled={verifyingOtp || otp.length !== 6} className="text-sm font-semibold text-white disabled:opacity-50 bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-lg shrink-0 transition-colors">
                          {verifyingOtp ? 'Verifying...' : 'Submit'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="input-group">
                    <div className="input-label-row"><label>Password</label></div>
                    <div className="input-wrapper">
                      <Lock />
                      <input type={showPassword ? "text" : "password"} className="auth-input-new" placeholder="••••••••" value={signupData.password} onChange={(e) => setSignupData({...signupData, password: e.target.value})} />
                      <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </div>

                  <div className="input-group">
                    <div className="input-label-row"><label>Confirm Password</label></div>
                    <div className="input-wrapper">
                      <Lock />
                      <input type={showConfirmPassword ? "text" : "password"} className="auth-input-new" placeholder="••••••••" value={signupData.confirmPassword} onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})} />
                      <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </div>

                  <div className="input-group col-span-2">
                    <div className="input-label-row"><label>Phone Number *</label></div>
                    <div className="input-wrapper">
                      <Phone />
                      <input type="tel" className="auth-input-new" placeholder="+1234567890" value={signupData.phone} onChange={(e) => setSignupData({...signupData, phone: e.target.value})} />
                    </div>
                  </div>

                  {selectedRole === "STUDENT" ? (
                    <>
                      <div className="input-group">
                          <div className="input-label-row"><label>Grad. Year *</label></div>
                          <div className="input-wrapper">
                            <Book />
                            <input 
                              type="text"
                              list="authGradYears"
                              className="auth-input-new bg-transparent" 
                              value={signupData.graduationYear || ""} 
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, "");
                                if (val.length > 4) val = val.slice(0, 4);
                                setSignupData({...signupData, graduationYear: val ? parseInt(val) : ("" as any)});
                              }}
                              placeholder="e.g. 2026"
                              style={{ outline: 'none', boxShadow: 'none' }}
                            />
                            <datalist id="authGradYears">
                              {Array.from({ length: new Date().getFullYear() + 4 - 2000 + 1 }, (_, index) => 2000 + index).map(year => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </datalist>
                          </div>
                      </div>
                      <div className="input-group">
                        <div className="input-label-row"><label>College *</label></div>
                        <div className="input-wrapper">
                          <GraduationCap />
                          <input className="auth-input-new" placeholder="Stanford University" value={signupData.collegeName} onChange={(e) => setSignupData({...signupData, collegeName: e.target.value})} />
                        </div>
                      </div>

                      <div className="input-group">
                        <div className="input-label-row"><label>Branch *</label></div>
                        <div className="input-wrapper">
                          <Book />
                          <input className="auth-input-new" placeholder="Computer Science" value={signupData.branch} onChange={(e) => setSignupData({...signupData, branch: e.target.value})} />
                        </div>
                      </div>

                      <div className="input-group">
                        <div className="input-label-row"><label>Current Semester</label></div>
                        <div className="input-wrapper">
                          <Book />
                          <input type="number" min="1" max="8" className="auth-input-new" placeholder="1" value={signupData.currentSemester} onChange={(e) => setSignupData({...signupData, currentSemester: parseInt(e.target.value) || 1})} />
                        </div>
                      </div>

                      <div className="input-group">
                        <div className="input-label-row"><label>Preferred Role *</label></div>
                        <div className="input-wrapper">
                          <Briefcase />
                          <input className="auth-input-new" placeholder="Software Engineer" value={signupData.preferredRole} onChange={(e) => setSignupData({...signupData, preferredRole: e.target.value})} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="input-group">
                        <div className="input-label-row"><label>Company *</label></div>
                        <div className="input-wrapper">
                          <Briefcase />
                          <input className="auth-input-new" placeholder="e.g. Stripe" value={signupData.companyName} onChange={(e) => setSignupData({...signupData, companyName: e.target.value})} />
                        </div>
                      </div>
                      <div className="input-group">
                        <div className="input-label-row"><label>Designation</label></div>
                        <div className="input-wrapper">
                          <Briefcase />
                          <input className="auth-input-new" placeholder="e.g. Talent Lead" value={signupData.designation} onChange={(e) => setSignupData({...signupData, designation: e.target.value})} />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button type="submit" className="auth-btn-primary mt-8 mb-6 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 shadow-md flex items-center justify-center gap-2" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
              
              <div className="auth-top-nav text-center mb-8">
                <span className="text-slate-500 font-medium">Already have an account? </span>
                <button onClick={() => { setActiveTab('login'); setError(''); }} className="text-indigo-600 font-semibold hover:text-indigo-700">Sign in</button>
              </div>
              
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center"><Shield className="w-4 h-4 text-emerald-600"/></div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">100% Secure</div>
                    <div className="text-[10px] text-slate-500">Your data is safe</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">AI-Powered</div>
                    <div className="text-[10px] text-slate-500">Smarter guidance</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg></div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Career Growth</div>
                    <div className="text-[10px] text-slate-500">Better opportunities</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
