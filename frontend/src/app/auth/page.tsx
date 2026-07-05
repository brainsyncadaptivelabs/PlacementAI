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
import { Loader2, X, GraduationCap, Briefcase, ChevronLeft, ChevronRight, Mail, Lock, Eye, EyeOff, FileText, Shield, User, Map, Book, Phone, CheckCircle, ArrowRight, UserSearch, Calendar, Users, BarChart3, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";

import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
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

  const isRecruiterPath = pathname === "/auth/recruiter";
  const isPpoPath = pathname === "/auth/placement-officer";
  const isRoleLocked = isRecruiterPath || isPpoPath;

  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "RECRUITER" | "PLACEMENT_OFFICER">(
    isRecruiterPath ? "RECRUITER" : isPpoPath ? "PLACEMENT_OFFICER" : "STUDENT"
  );

  useEffect(() => {
    if (isRecruiterPath) {
      setSelectedRole("RECRUITER");
    } else if (isPpoPath) {
      setSelectedRole("PLACEMENT_OFFICER");
    }
  }, [isRecruiterPath, isPpoPath]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error") === "wrong_portal") {
        const correct = params.get("correct") || "/auth";
        const role = params.get("role") || "STUDENT";
        const roleName = role.replace('_', ' ').toLowerCase();
        // Assume `setError` is available. (It's defined below, but we can set a timeout to ensure it's set after mount).
        setTimeout(() => {
          setError(`This email belongs to a ${roleName} account. Please login through the correct portal.`);
        }, 100);
      }
    }
  }, []);

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
      await signInWithProvider(provider, selectedRole);
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

      setSuccess("Account created successfully! Redirecting...");
      
      setTimeout(() => {
        const destination = !backendData.planSelected
          ? "/plans"
          : backendData.role === "RECRUITER"
          ? "/recruiter"
          : backendData.role === "PLACEMENT_OFFICER"
          ? "/placement-officer"
          : backendData.role === "ADMIN" || backendData.role === "SUPER_ADMIN"
          ? "/admin"
          : "/dashboard";
        router.push(destination);
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
      
      // Enforce strict portal-based login
      if (backendData.role && backendData.role !== selectedRole) {
        let correctPortal = "/auth";
        if (backendData.role === "RECRUITER") correctPortal = "/auth/recruiter";
        else if (backendData.role === "PLACEMENT_OFFICER") correctPortal = "/auth/placement-officer";
        else if (backendData.role === "ADMIN" || backendData.role === "SUPER_ADMIN") correctPortal = "/admin/login";
        
        const roleName = backendData.role.replace('_', ' ').toLowerCase();
        throw new Error(`This email belongs to a ${roleName} account. Please login through the correct portal.`);
      }

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

      const destination = !backendData.planSelected
        ? "/plans"
        : backendData.role === "RECRUITER"
        ? "/recruiter"
        : backendData.role === "PLACEMENT_OFFICER"
        ? "/placement-officer"
        : backendData.role === "ADMIN" || backendData.role === "SUPER_ADMIN"
        ? "/admin"
        : "/dashboard";
      router.push(destination);
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


  const getThemeVars = () => {
    if (selectedRole === 'RECRUITER') {
      return {
        '--auth-bg-gradient': 'linear-gradient(135deg, #4A154B 0%, #2D1B4E 100%)',
        '--auth-logo-color': '#832838',
        '--auth-headline-span': '#F9A8D4',
        '--auth-feature-bg': 'rgba(131, 40, 56, 0.4)',
        '--auth-icon-bg': 'rgba(131, 40, 56, 0.8)',
        '--auth-btn-color': '#832838',
        '--auth-icon-color': '#832838',
        '--auth-icon-bg-light': '#FDF2F8',
        '--auth-focus-ring': 'rgba(131, 40, 56, 0.2)',
        '--auth-primary-btn': 'linear-gradient(to right, #832838, #9D364A)',
        '--auth-primary-shadow': 'rgba(131, 40, 56, 0.5)',
        '--auth-active-tab-bg': '#FDF2F8',
        '--auth-active-tab-text': '#832838',
        '--auth-active-tab-border': '#832838',
        '--auth-headline-size': '32px',
        '--auth-headline-mb': '8px',
        '--auth-desc-size': '13px',
        '--auth-desc-mb': '12px',
        '--auth-features-gap': '6px',
        '--auth-feature-item-gap': '12px',
        '--auth-feature-item-padding': '8px 12px',
        '--auth-icon-size': '32px',
        '--auth-icon-radius': '8px',
        '--auth-svg-size': '16px',
        '--auth-h3-size': '13px',
        '--auth-h3-mb': '2px',
        '--auth-p-size': '11px',
        '--auth-p-lh': '1.3',
      };
    } else if (selectedRole === 'PLACEMENT_OFFICER') {
      return {
        '--auth-bg-gradient': 'linear-gradient(135deg, #1A1A1A 0%, #121212 100%)',
        '--auth-logo-color': '#C25E2D',
        '--auth-headline-span': '#E06A26',
        '--auth-feature-bg': 'rgba(26, 26, 26, 0.8)',
        '--auth-icon-bg': 'rgba(194, 94, 45, 0.2)',
        '--auth-btn-color': '#C25E2D',
        '--auth-icon-color': '#C25E2D',
        '--auth-icon-bg-light': 'rgba(194, 94, 45, 0.1)',
        '--auth-focus-ring': 'rgba(194, 94, 45, 0.2)',
        '--auth-primary-btn': 'linear-gradient(to right, #C25E2D, #D96A30)',
        '--auth-primary-shadow': 'rgba(194, 94, 45, 0.5)',
        '--auth-active-tab-bg': '#FFF3EB',
        '--auth-active-tab-text': '#C25E2D',
        '--auth-active-tab-border': '#C25E2D',
        '--auth-headline-size': '38px',
        '--auth-headline-mb': '12px',
        '--auth-desc-size': '15px',
        '--auth-desc-mb': '16px',
        '--auth-features-gap': '12px',
        '--auth-feature-item-gap': '16px',
        '--auth-feature-item-padding': '16px',
        '--auth-icon-size': '40px',
        '--auth-icon-radius': '12px',
        '--auth-svg-size': '20px',
        '--auth-h3-size': '15px',
        '--auth-h3-mb': '4px',
        '--auth-p-size': '13px',
        '--auth-p-lh': '1.4',
      };
    } else {
      return {
        '--auth-bg-gradient': 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)',
        '--auth-logo-color': '#4338ca',
        '--auth-headline-span': '#d8b4fe',
        '--auth-feature-bg': 'rgba(49, 46, 129, 0.6)',
        '--auth-icon-bg': 'rgba(99, 102, 241, 0.4)',
        '--auth-btn-color': '#4f46e5',
        '--auth-icon-color': '#7e22ce',
        '--auth-icon-bg-light': '#f3e8ff',
        '--auth-focus-ring': 'rgba(168, 85, 247, 0.2)',
        '--auth-primary-btn': 'linear-gradient(to right, #4F46E5, #9333EA, #EC4899)',
        '--auth-primary-shadow': 'rgba(147, 51, 234, 0.5)',
        '--auth-active-tab-bg': '#faf5ff',
        '--auth-active-tab-text': '#7e22ce',
        '--auth-active-tab-border': '#a855f7',
        '--auth-headline-size': '38px',
        '--auth-headline-mb': '12px',
        '--auth-desc-size': '15px',
        '--auth-desc-mb': '16px',
        '--auth-features-gap': '12px',
        '--auth-feature-item-gap': '16px',
        '--auth-feature-item-padding': '16px',
        '--auth-icon-size': '40px',
        '--auth-icon-radius': '12px',
        '--auth-svg-size': '20px',
        '--auth-h3-size': '15px',
        '--auth-h3-mb': '4px',
        '--auth-p-size': '13px',
        '--auth-p-lh': '1.4',
      };
    }
  };
  const themeVars = getThemeVars();

  return (
    <div className="auth-root-container selection:bg-primary/10" style={themeVars as React.CSSProperties}>
      <style>{`
        .auth-root-container {
          width: 100vw;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          font-family: inherit;
          position: relative;
          overflow: hidden;
        }

        .auth-root-container::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: radial-gradient(#cbd5e1 1.5px, transparent 1.5px);
          background-size: 32px 32px;
          opacity: 0.5;
          pointer-events: none;
        }

        .auth-main-container {
          width: 100%;
          max-width: 1600px;
          height: 100vh;
          display: flex;
          flex-direction: row;
          position: relative;
        }

        .auth-main-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 38%;
          height: 100%;
          background: var(--auth-bg-gradient);
          z-index: 1;
        }

        /* Left Branding Panel */
        .auth-left-panel {
          width: 38%;
          padding: 40px;
          display: flex;
          flex-direction: column;
          color: white;
          position: relative;
          box-sizing: border-box;
          z-index: 10;
          justify-content: flex-start;
        }

        .left-panel-logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          z-index: 10;
        }

        .left-panel-logo-container .logo-box {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: white;
          color: var(--auth-logo-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 18px;
        }

        .left-panel-headline {
          font-size: var(--auth-headline-size);
          font-weight: 700;
          line-height: 1.25;
          margin-bottom: var(--auth-headline-mb);
          z-index: 10;
        }
        
        .left-panel-headline span {
          color: var(--auth-headline-span);
        }

        .left-panel-description {
          font-size: var(--auth-desc-size);
          color: #cbd5e1;
          line-height: var(--auth-p-lh);
          margin-bottom: var(--auth-desc-mb);
          max-width: 420px;
          z-index: 10;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: var(--auth-features-gap);
          z-index: 10;
        }

        .feature-item-new {
          display: flex;
          align-items: center;
          gap: var(--auth-feature-item-gap);
          background: var(--auth-feature-bg);
          border-radius: 12px;
          padding: var(--auth-feature-item-padding);
        }

        .feature-icon-container {
          width: var(--auth-icon-size);
          height: var(--auth-icon-size);
          border-radius: var(--auth-icon-radius);
          background: var(--auth-icon-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: white;
        }
        
        .feature-icon-container svg {
          width: var(--auth-svg-size);
          height: var(--auth-svg-size);
        }

        .feature-text-new h3 {
          font-size: var(--auth-h3-size);
          font-weight: 600;
          margin: 0 0 var(--auth-h3-mb) 0;
          color: white;
        }

        .feature-text-new p {
          font-size: var(--auth-p-size);
          color: #cbd5e1;
          margin: 0;
          line-height: var(--auth-p-lh);
        }



        .auth-right-panel {
          width: 62%;
          height: calc(100vh - 32px);
          margin: 16px 16px 16px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          background: transparent;
          border-radius: 32px;
          padding: 16px 24px;
          box-sizing: border-box;
          overflow-y: auto;
          z-index: 10;
          box-shadow: none;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .auth-right-panel::-webkit-scrollbar {
          display: none;
        }

        .auth-top-nav {
          margin-top: 16px;
          text-align: center;
          font-size: 14px;
          color: #64748b;
        }

        .auth-top-nav button {
          color: var(--auth-btn-color);
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
        }

        .auth-card {
          width: 100%;
          max-width: 540px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 32px 40px;
          box-sizing: border-box;
          margin: 0 auto;
          box-shadow: 0 20px 40px -15px rgba(0,0,0,0.05);
        }

        .auth-card-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: var(--auth-headline-mb);
        }
        
        .auth-header-icon {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: var(--auth-icon-bg-light);
          color: var(--auth-icon-color);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        
        .auth-header-icon svg {
          width: 20px;
          height: 20px;
        }

        .auth-card-title {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 2px;
        }

        .auth-card-subtitle {
          font-size: 15px;
          color: #64748b;
          text-align: center;
        }

        /* Form Controls */
        .input-group {
          margin-bottom: 4px;
          width: 100%;
        }

        .input-label-row label {
          font-size: 13px;
          font-weight: 700;
          color: #334155;
          margin-bottom: 4px;
          display: block;
        }

        .forgot-password-link {
          font-size: 12px;
          color: var(--auth-active-tab-border);
          font-weight: 600;
          text-decoration: none;
        }

        .input-wrapper {
          position: relative;
        }

        .input-wrapper > svg:first-child {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          color: var(--auth-btn-color);
          z-index: 2;
        }

        input.auth-input-new {
          width: 100%;
          height: 36px;
          padding: 0 36px 0 38px;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          font-size: 13px;
          color: #0f172a !important;
          background-color: #ffffff !important;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        
        input.auth-input-new:focus {
          border-color: var(--auth-active-tab-border) !important;
          box-shadow: 0 0 0 3px var(--auth-focus-ring) !important;
          outline: none;
        }
        
        input.auth-input-new:hover {
          border-color: #cbd5e1 !important;
        }


        .remember-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .remember-checkbox-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .remember-checkbox {
          width: var(--auth-svg-size);
          height: var(--auth-svg-size);
          border-radius: 4px;
          border: 1px solid var(--auth-btn-color);
          background: var(--auth-btn-color);
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
          height: 40px;
          border-radius: 8px;
          background: var(--auth-primary-btn);
          color: white;
          font-weight: 700;
          font-size: 14px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--auth-features-gap);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin-top: 4px;
        }
        
        .auth-btn-primary:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 10px 25px -5px var(--auth-primary-shadow);
        }

        .divider-container {
          display: flex;
          align-items: center;
          margin: 24px 0;
        }
        
        .divider-line {
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }
        
        .divider-text {
          padding: 0 16px;
          font-size: 12px;
          color: #94a3b8;
          font-weight: 500;
        }

        .social-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .social-btn {
          width: 100%;
          height: 44px;
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
          border-color: #cbd5e1;
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
          max-width: 100%;
        }
        
        .auth-role-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: var(--auth-headline-mb);
          height: 36px;
        }
        
        .auth-role-btn {
          flex: 1;
          height: 100%;
          padding: 0 12px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: white;
          color: #64748b;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .auth-role-btn:hover {
          background: #f8fafc;
          color: #334155;
        }
        
        .auth-role-btn.active {
          border-color: var(--auth-active-tab-border) !important;
          background: var(--auth-active-tab-bg) !important;
          color: var(--auth-active-tab-text) !important;
        }

        .signup-form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 4px 8px;
        }
        
        .col-span-2 {
          grid-column: span 2;
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
          <img src="/robot-graduation-transparent.png" alt="PlacementAI Robot" className={`absolute w-52 h-auto drop-shadow-2xl transition-all duration-300 hover:-translate-y-6 hover:scale-110 cursor-pointer ${selectedRole === 'PLACEMENT_OFFICER' ? '-top-8' : 'top-4'} ${selectedRole === 'STUDENT' ? '-right-12' : 'right-4'}`} style={{ zIndex: 20 }} />
          
          <div className="left-panel-logo-container w-full" style={{ alignItems: 'flex-start' }}>
            <div className="flex gap-3 relative z-10">
              <div className="logo-box mt-1">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-bold text-xl tracking-wide text-white">
                  PlacementAI
                </span>
                <div className="flex items-center gap-2 bg-indigo-900/40 w-fit px-3 py-1 rounded-full border border-white/10">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-200">✨ AI-Powered Career Success</span>
                </div>
              </div>
            </div>
          </div>

          <h1 className="left-panel-headline">
            Your AI-Powered<br />
            {selectedRole === "RECRUITER" ? <span>Recruitment</span> : selectedRole === "PLACEMENT_OFFICER" ? <span>Placement Office</span> : <span>Placement</span>} 
            {selectedRole === "RECRUITER" ? " Partner" : selectedRole === "PLACEMENT_OFFICER" ? " Partner" : " Partner"}
          </h1>

          <p className="left-panel-description">
            {selectedRole === "RECRUITER" 
              ? "Streamline hiring, find the right talent faster, and build high-performing teams with AI." 
              : selectedRole === "PLACEMENT_OFFICER" 
              ? "Simplify placement operations, analyze outcomes, and drive better results for your institution."
              : "Get AI-driven insights, practice interviews, build your resume, and land your dream job."}
          </p>

          <div className="features-list">
            {selectedRole === "RECRUITER" ? (
              <>
                <div className="feature-item-new">
                  <div className="feature-icon-container">
                    <UserSearch className="w-5 h-5" />
                  </div>
                  <div className="feature-text-new">
                    <h3>AI Candidate Sourcing</h3>
                    <p>Discover and attract top talent from multiple channels using AI-powered recommendations.</p>
                  </div>
                </div>

                <div className="feature-item-new">
                  <div className="feature-icon-container">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="feature-text-new">
                    <h3>Candidate Evaluation & Ranking</h3>
                    <p>Evaluate resumes and rank candidates based on skills, experience, and job fit automatically.</p>
                  </div>
                </div>

                <div className="feature-item-new">
                  <div className="feature-icon-container">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="feature-text-new">
                    <h3>Interview Management</h3>
                    <p>Schedule interviews, share calendars, and track candidate progress in one place.</p>
                  </div>
                </div>

                <div className="feature-item-new">
                  <div className="feature-icon-container">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="feature-text-new">
                    <h3>Talent Pipeline</h3>
                    <p>Build and manage your talent pipeline for future roles with AI insights and engagement tracking.</p>
                  </div>
                </div>

                <div className="feature-item-new">
                  <div className="feature-icon-container">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div className="feature-text-new">
                    <h3>Hiring Analytics</h3>
                    <p>Get real-time insights on sourcing, hiring funnel, and team performance to make data-driven decisions.</p>
                  </div>
                </div>

                <div className="feature-item-new">
                  <div className="feature-icon-container">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="feature-text-new">
                    <h3>Offer & Onboarding</h3>
                    <p>Create offers, send communications, and track onboarding to ensure a smooth candidate experience.</p>
                  </div>
                </div>
              </>
            ) : selectedRole === "PLACEMENT_OFFICER" ? (
              <>
                <div className="feature-item-new">
                  <div className="feature-icon-container">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                  </div>
                  <div className="feature-text-new">
                    <h3>Placement Analytics Dashboard</h3>
                    <p>Get real-time insights on placement statistics, offers, and trends to make data-driven decisions.</p>
                  </div>
                </div>

                <div className="feature-item-new">
                  <div className="feature-icon-container">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="feature-text-new">
                    <h3>Student Placement Tracking</h3>
                    <p>Track student eligibility, progress, and placement status throughout the placement cycle.</p>
                  </div>
                </div>

                <div className="feature-item-new">
                  <div className="feature-icon-container">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
                  </div>
                  <div className="feature-text-new">
                    <h3>Recruiter & Drive Management</h3>
                    <p>Manage recruiter relationships, placement drives, and streamline communication in one place.</p>
                  </div>
                </div>

                <div className="feature-item-new">
                  <div className="feature-icon-container">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="feature-text-new">
                    <h3>Reports & Outcome Analysis</h3>
                    <p>Generate comprehensive reports and analyze placement outcomes to improve future performance.</p>
                  </div>
                </div>

                <div className="feature-item-new">
                  <div className="feature-icon-container">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="feature-text-new">
                    <h3>Notifications & Announcements</h3>
                    <p>Send important updates, drive announcements, and reminders to students and faculty instantly.</p>
                  </div>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
          

        </div>

        {/* Right Auth Panel */}
        <div 
          className="auth-right-panel relative"
          style={{ 
            justifyContent: 'center',
            paddingBottom: activeTab === 'signup' && selectedRole === 'STUDENT' ? 0 : undefined 
          }}
        >
          
          {activeTab === 'login' ? (
            <div className="auth-card">
              <div className="auth-card-header">
                <h2 className="auth-card-title">
                  {selectedRole === "RECRUITER" ? "Recruiter Portal" : selectedRole === "PLACEMENT_OFFICER" ? "Placement Officer Portal" : "Welcome Back"}
                </h2>
                <p className="auth-card-subtitle">
                  {selectedRole === "RECRUITER" ? "Login to access your ATS Dashboard" : selectedRole === "PLACEMENT_OFFICER" ? "Login to access Institution Analytics" : "Login to continue your placement journey"}
                </p>
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
                      placeholder=""
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <div className="input-label-row">
                    <label htmlFor="password">Password</label>
                  </div>
                  <div className="input-wrapper">
                    <Lock />
                    <input 
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="auth-input-new" 
                      placeholder=""
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    />
                    <button 
                      type="button" 
                      className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-colors z-10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                </div>

                <div className="remember-row">
                  <div className="remember-checkbox-group">
                    <div 
                      className={`remember-checkbox ${!rememberMe ? 'unchecked' : ''}`}
                      onClick={() => setRememberMe(!rememberMe)}
                    >
                      {rememberMe && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>
                    <span className="remember-text" onClick={() => setRememberMe(!rememberMe)}>Remember me</span>
                  </div>
                  <Link href="/auth/forgot-password" className="forgot-password-link">Forgot password?</Link>
                </div>

                <button type="submit" className="auth-btn-primary" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login"}
                </button>

                {selectedRole === 'STUDENT' && (
                  <>
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
                  </>
                )}

                <div className="card-footer">
                  <Shield width="14" height="14" />
                  Your data is secure with us
                </div>
              </form>
              
              <div className="auth-top-nav">
                Don&apos;t have an account? <button onClick={() => { setActiveTab('signup'); setError(''); }}>Sign up</button>
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
            <div className="auth-card signup-card relative w-full" style={{ marginTop: selectedRole === 'STUDENT' ? 'auto' : undefined }}>
              <div className="auth-card-header">
                <div className="auth-header-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <h2 className="auth-card-title">Create Your Account</h2>
                <p className="auth-card-subtitle">Join PlacementAI today and take the first step towards your dream career! 🚀</p>
              </div>
              
              <form onSubmit={handleSignup} className="flex flex-col">
                {!isRoleLocked && (
                  <div className="auth-role-tabs">
                    <button
                      type="button"
                      onClick={() => { setSelectedRole("STUDENT"); setError(""); }}
                      className={`auth-role-btn ${selectedRole === "STUDENT" ? "active" : "inactive"}`}
                    >
                      <GraduationCap className="w-5 h-5" />
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSelectedRole("RECRUITER"); setError(""); }}
                      className={`auth-role-btn ${selectedRole === "RECRUITER" ? "active" : "inactive"}`}
                    >
                      <Briefcase className="w-5 h-5" />
                      Recruiter
                    </button>
                  </div>
                )}

                <div className="signup-form-grid">
                  <div className="input-group">
                    <div className="input-label-row"><label>Full Name</label></div>
                    <div className="input-wrapper">
                      <User />
                      <input className="auth-input-new" placeholder="" value={signupData.fullName} onChange={(e) => setSignupData({...signupData, fullName: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className="input-group">
                    <div className="input-label-row"><label>Email</label></div>
                    <div className="input-wrapper">
                      <Mail />
                      <input type="email" className="auth-input-new" placeholder="" value={signupData.email} onChange={(e) => { setSignupData({...signupData, email: e.target.value}); setIsEmailVerified(false); }} disabled={isEmailVerified || sendingOtp} />
                      {!isEmailVerified && signupData.email.length > 5 && (
                        <button type="button" onClick={handleRequestOtp} disabled={sendingOtp} className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 text-white px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all shadow-md">
                          {sendingOtp ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Shield className="w-3 h-3"/> Verify</>}
                        </button>
                      )}
                      {isEmailVerified && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {showOtpInput && !isEmailVerified && (
                    <div className="input-group col-span-2">
                      <div className="input-label-row"><label>Enter OTP</label></div>
                      <div className="flex gap-2 relative input-wrapper">
                        <Lock />
                        <input type="text" className="auth-input-new" placeholder="" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
                        <button type="button" onClick={handleVerifyOtp} disabled={verifyingOtp || otp.length < 6} className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors">
                          {verifyingOtp ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm"}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="input-group">
                    <div className="input-label-row"><label>Password</label></div>
                    <div className="input-wrapper">
                      <Lock />
                      <input type={showPassword ? "text" : "password"} className="auth-input-new" placeholder="" value={signupData.password} onChange={(e) => setSignupData({...signupData, password: e.target.value})} />
                      <button type="button" className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-colors z-10" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}</button>
                    </div>
                  </div>

                  <div className="input-group">
                    <div className="input-label-row"><label>Confirm Password</label></div>
                    <div className="input-wrapper">
                      <Lock />
                      <input type={showConfirmPassword ? "text" : "password"} className="auth-input-new" placeholder="" value={signupData.confirmPassword} onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})} />
                      <button type="button" className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-colors z-10" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}</button>
                    </div>
                  </div>

                  <div className="input-group">
                    <div className="input-label-row"><label>Phone Number</label></div>
                    <div className="input-wrapper">
                      <Phone />
                      <input type="tel" className="auth-input-new" placeholder="" value={signupData.phone} onChange={(e) => setSignupData({...signupData, phone: e.target.value})} />
                    </div>
                  </div>

                  {selectedRole === "STUDENT" ? (
                    <>
                      <div className="input-group">
                          <div className="input-label-row"><label>Graduation Year</label></div>
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
                              placeholder=""
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
                        <div className="input-label-row"><label>College</label></div>
                        <div className="input-wrapper">
                          <GraduationCap />
                          <input className="auth-input-new" placeholder="" value={signupData.collegeName} onChange={(e) => setSignupData({...signupData, collegeName: e.target.value})} />
                        </div>
                      </div>

                      <div className="input-group">
                        <div className="input-label-row"><label>Branch</label></div>
                        <div className="input-wrapper">
                          <Book />
                          <input className="auth-input-new" placeholder="" value={signupData.branch} onChange={(e) => setSignupData({...signupData, branch: e.target.value})} />
                        </div>
                      </div>

                      <div className="input-group">
                        <div className="input-label-row"><label>Current Semester</label></div>
                        <div className="input-wrapper">
                          <Book />
                          <input 
                            type="text"
                            list="authSemesters"
                            className="auth-input-new bg-transparent" 
                            value={signupData.currentSemester || ""} 
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "");
                              if (val.length > 0) {
                                let num = parseInt(val.charAt(0));
                                if (num > 8) num = 8;
                                if (num < 1) num = 1;
                                val = num.toString();
                              }
                              setSignupData({...signupData, currentSemester: val ? parseInt(val) : ("" as any)});
                            }}
                            placeholder=""
                            style={{ outline: 'none', boxShadow: 'none' }}
                          />
                          <datalist id="authSemesters">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                              <option key={sem} value={sem}>{sem}</option>
                            ))}
                          </datalist>
                        </div>
                      </div>

                      <div className="input-group">
                        <div className="input-label-row"><label>Preferred Role</label></div>
                        <div className="input-wrapper">
                          <Briefcase />
                          <input className="auth-input-new" placeholder="" value={signupData.preferredRole} onChange={(e) => setSignupData({...signupData, preferredRole: e.target.value})} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="input-group">
                        <div className="input-label-row"><label>Company</label></div>
                        <div className="input-wrapper">
                          <Briefcase />
                          <input className="auth-input-new" placeholder="" value={signupData.companyName} onChange={(e) => setSignupData({...signupData, companyName: e.target.value})} />
                        </div>
                      </div>
                      <div className="input-group">
                        <div className="input-label-row"><label>Designation</label></div>
                        <div className="input-wrapper">
                          <Briefcase />
                          <input className="auth-input-new" placeholder="" value={signupData.designation} onChange={(e) => setSignupData({...signupData, designation: e.target.value})} />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6">
                  <button type="submit" className="auth-btn-primary" disabled={loading}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-5 h-5 ml-1" /></>}
                  </button>
                  
                  <div className="auth-top-nav font-medium" style={{ marginTop: '12px', marginBottom: '8px' }}>
                    Already have an account? <button onClick={() => { setActiveTab('login'); setError(''); }} className="text-purple-600 hover:text-purple-700">Sign in</button>
                  </div>
                  

                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
