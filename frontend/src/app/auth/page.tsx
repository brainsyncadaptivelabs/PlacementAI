"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, X, GraduationCap, Briefcase, ChevronLeft, Mail, Lock, Eye, EyeOff, FileText, Shield, User, Map, Book, Phone } from "lucide-react";
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
          height: 100vh !important;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(circle at 20% 20%, rgba(91,91,255,.18), transparent 35%),
            radial-gradient(circle at 80% 80%, rgba(124,58,237,.12), transparent 40%),
            #080d1b !important;
          padding: 24px !important;
          box-sizing: border-box;
          font-family: inherit;
          position: relative;
          overflow: hidden !important;
        }

        .auth-main-container {
          width: min(1600px, 100%) !important;
          max-width: 1600px !important;
          height: calc(100vh - 48px) !important;
          display: grid !important;
          grid-template-columns: 0.8fr 1.2fr !important;
          gap: 48px !important;
          align-items: stretch !important;
          justify-content: center;
          margin: auto;
          box-sizing: border-box;
          padding: 0 !important;
          overflow: hidden !important;
          transition: grid-template-columns 300ms ease-in-out, gap 300ms ease-in-out, all 300ms ease-in-out !important;
        }

        .auth-main-container.is-signup-active {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          width: 100% !important;
          max-width: 1000px !important;
          gap: 0 !important;
        }

        .auth-main-container.is-signup-active .auth-right-panel {
          width: 100% !important;
          max-width: 1000px !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
        }

        .auth-main-container.is-signup-active .auth-right-card {
          width: 980px !important;
          max-width: 1000px !important;
          max-height: 86vh !important;
          padding: 32px !important;
          border-radius: 28px !important;
          background: #0F172A !important;
          box-shadow: 0 24px 60px rgba(0,0,0,.45) !important;
          overflow: hidden !important;
          height: auto !important;
        }

        /* Left Branding Panel */
        .auth-left-panel {
          width: 100% !important;
          max-width: none !important;
          height: 100% !important;
          background: #111827 !important;
          border-radius: 30px !important;
          padding: 48px !important;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-start;
          box-sizing: border-box;
          border: 1px solid #2A3652 !important;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45) !important;
          position: relative !important;
          transition: none !important;
          cursor: default !important;
          align-self: stretch !important;
        }

        .left-panel-logo-container {
          width: 100%;
          margin-bottom: 48px !important;
        }

        .left-panel-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          gap: 0px !important;
          margin-top: 0px;
        }

        .left-panel-headline {
          font-size: 52px !important;
          font-weight: 700 !important;
          line-height: 1.15 !important;
          letter-spacing: -0.02em !important;
          color: #F8FAFC !important;
          margin-bottom: 20px !important;
          transition: font-size 250ms ease-in-out !important;
        }

        .left-panel-description {
          font-size: 18px !important;
          font-weight: 400 !important;
          color: #94A3B8 !important;
          line-height: 1.6 !important;
          margin-bottom: 28px !important;
          max-width: 520px;
        }

        .left-panel-features {
          display: flex;
          flex-direction: column;
          gap: 12px !important;
          margin-bottom: 32px !important;
        }

         .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 16px !important;
          font-weight: 400 !important;
          color: #94A3B8 !important;
          line-height: 1.8 !important;
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
          flex-wrap: nowrap !important;
          gap: 8px;
          margin-top: 0px !important;
        }

        .feature-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px !important;
          height: 36px !important;
          box-sizing: border-box;
          background-color: rgba(255, 255, 255, 0.04) !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          border-radius: 999px !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          color: #F8FAFC !important;
          letter-spacing: 0.02em !important;
          transition: all 0.25s ease !important;
        }

        .feature-chip:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.25) !important;
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
          width: 100% !important;
          max-width: 720px !important;
          height: 100% !important;
          background: #111827 !important;
          border-radius: 28px !important;
          padding: 28px 32px !important;
          border: 1px solid #2A3652 !important;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45) !important;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: flex-start !important;
          align-items: stretch !important;
          overflow: hidden !important;
          position: relative;
          transition: all 300ms ease-in-out !important;
          cursor: default !important;
          align-self: stretch !important;
        }

        .auth-right-card.is-signup {
          height: 100% !important;
          max-height: none !important;
        }

        .auth-main-container.is-signup-active .auth-left-panel,
        .auth-main-container.is-signup-active .auth-right-card {
          height: 100% !important;
          min-height: 0 !important;
          max-height: none !important;
        }

        .auth-form {
          overflow: hidden !important;
        }

        .auth-scroll-container {
          overflow: visible !important;
          height: auto !important;
        }

        /* Tabs list styling */
        .auth-tabs-list {
          background-color: #172033 !important;
          height: 48px !important;
          border-radius: 16px !important;
          padding: 4px !important;
          border: none !important;
          display: flex;
          width: 100%;
          box-sizing: border-box;
        }

        .auth-tab-trigger {
          flex: 1;
          border-radius: 12px !important;
          color: #94A3B8 !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          background-color: transparent !important;
          border: none !important;
          transition: background-color 150ms ease, color 150ms ease !important;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          cursor: pointer;
        }

        .auth-tab-trigger:hover {
          color: #F8FAFC !important;
          background-color: rgba(255, 255, 255, 0.02) !important;
        }

        .auth-tab-trigger[data-state=active] {
          background-color: #6366F1 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35) !important;
        }

        /* Forms Layout & Inputs */
        .auth-header {
          margin-top: 8px !important;
          margin-bottom: 12px !important;
          display: flex;
          flex-direction: column;
          gap: 4px !important;
          text-align: center;
        }

        .auth-header-title {
          font-size: 44px !important;
          font-weight: 700 !important;
          line-height: 1.05 !important;
          letter-spacing: -0.04em !important;
          color: #F8FAFC !important;
        }

        .auth-header-subtitle {
          font-size: 14px !important;
          font-weight: 400 !important;
          color: #94A3B8 !important;
          line-height: 1.4 !important;
          white-space: nowrap !important;
          text-overflow: ellipsis !important;
          overflow: hidden !important;
          margin-bottom: 12px !important;
        }

        .auth-form-group {
          display: flex;
          flex-direction: column;
          gap: 10px !important;
        }

        .signup-form-grid {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 16px !important;
          width: 100% !important;
        }

        .signup-form-full-width {
          grid-column: span 3 !important;
        }

        .col-span-1 {
          grid-column: span 1 !important;
        }
        .col-span-2 {
          grid-column: span 2 !important;
        }
        .col-span-3 {
          grid-column: span 3 !important;
        }

        .auth-input-container {
          display: flex;
          flex-direction: column;
          gap: 6px !important;
          position: relative !important;
          padding-bottom: 14px !important;
        }

        .auth-root-container .auth-input-label {
          font-size: 13px !important;
          font-weight: 600 !important;
          color: #d4d9e5 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.04em !important;
          margin-bottom: 6px !important;
          display: block;
        }

        .auth-root-container .auth-input-field {
          height: 48px !important;
          border-radius: 14px !important;
          background-color: #1A2235 !important;
          border: 1px solid #2A3652 !important;
          padding: 0 16px !important;
          color: #F8FAFC !important;
          font-size: 15px !important;
          font-weight: 500 !important;
          box-sizing: border-box !important;
          transition: background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease !important;
          width: 100%;
          outline: none !important;
        }


        .auth-root-container .auth-input-field.pl-11 {
          padding-left: 44px !important;
        }

        .auth-root-container .auth-input-field.pr-11 {
          padding-right: 44px !important;
        }

        .auth-root-container .auth-input-field:hover {
          background-color: #212B44 !important;
        }

        .auth-root-container .auth-input-field:focus {
          background-color: #1A2235 !important;
          border-color: #4F46E5 !important;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2) !important;
          outline: none !important;
        }

        .auth-root-container .auth-input-field.has-error {
          border-color: #EF4444 !important;
          background-color: rgba(239, 68, 68, 0.05) !important;
        }

        .auth-root-container .auth-input-field::placeholder {
          color: #94A3B8 !important;
        }

        /* Autofill override */
        .auth-root-container .auth-input-field:-webkit-autofill,
        .auth-root-container .auth-input-field:-webkit-autofill:hover,
        .auth-root-container .auth-input-field:-webkit-autofill:focus {
          -webkit-text-fill-color: #F8FAFC !important;
          -webkit-box-shadow: 0 0 0px 1000px #172033 inset !important;
          transition: background-color 5000s ease-in-out 0s !important;
        }

        /* Validation Spacing */
        .validation-space {
          position: absolute !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          height: 14px !important;
          font-size: 11px;
          font-weight: 500;
          color: #EF4444;
          display: flex;
          align-items: center;
          box-sizing: border-box;
        }

        /* Fixed alert container at absolute positioning */
        .auth-alert-container {
          position: absolute;
          top: 12px;
          left: 36px;
          right: 36px;
          z-index: 50;
        }

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

        .auth-root-container .forgot-password-link {
          color: #818CF8 !important;
          transition: color 150ms ease !important;
          font-weight: 600 !important;
        }

        .auth-root-container .forgot-password-link:hover {
          color: #A5B4FC !important;
        }

        /* Buttons & Socials */
        .auth-root-container .auth-primary-btn {
          height: 52px !important;
          border-radius: 16px !important;
          background: linear-gradient(90deg, #4F46E5, #7C5CFF) !important;
          color: #ffffff !important;
          font-size: 16px !important;
          font-weight: 700 !important;
          border: none !important;
          width: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          box-shadow: 0 8px 25px rgba(79, 70, 229, 0.35) !important;
          transition: all 0.15s ease !important;
        }

        .auth-root-container .auth-primary-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 20px 45px rgba(79, 70, 229, 0.35) !important;
          filter: brightness(1.08) !important;
        }

        .auth-root-container .auth-primary-btn:active {
          transform: scale(0.99) !important;
          filter: brightness(0.96) !important;
        }

        .auth-root-container .auth-primary-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-root-container .auth-social-divider {
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

        .auth-root-container .auth-social-divider::before,
        .auth-root-container .auth-social-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        }

        .auth-root-container .auth-social-divider:not(:empty)::before {
          margin-right: 12px;
        }

        .auth-root-container .auth-social-divider:not(:empty)::after {
          margin-left: 12px;
        }

        .auth-root-container .social-buttons-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px !important;
          width: 100%;
        }

        .auth-root-container .auth-social-btn {
          height: 48px !important;
          border-radius: 14px !important;
          background-color: #1A2235 !important;
          border: 1px solid #2A3652 !important;
          color: #F8FAFC !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          cursor: pointer !important;
          transition: background-color 150ms ease !important;
        }

        .auth-root-container .auth-social-btn:hover {
          background-color: #1B2740 !important;
        }

        /* Signup Specific Elements */
        .auth-role-btn {
          background-color: #1A2235 !important;
          border: 1px solid #2A3652 !important;
          border-radius: 16px !important;
          padding: 10px 18px !important;
          text-align: left !important;
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 12px !important;
          transition: all 150ms ease !important;
          cursor: pointer !important;
          flex: 1;
          height: 52px !important;
        }

        .auth-role-btn:hover {
          background-color: #212B44 !important;
        }

        .auth-role-btn.active {
          background-color: #4F46E5 !important;
          border-color: #7C5CFF !important;
        }

        .role-icon-container {
          width: 28px !important;
          height: 28px !important;
          border-radius: 8px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background-color: #111827 !important;
          color: #94A3B8 !important;
          transition: all 150ms ease !important;
          flex-shrink: 0;
        }

        .auth-role-btn.active .role-icon-container {
          background-color: rgba(99, 102, 241, 0.2) !important;
          color: #F8FAFC !important;
        }

        .role-label {
          font-weight: 700 !important;
          font-size: 13px !important;
          color: #CBD5E1 !important;
        }

        .auth-role-btn.active .role-label {
          color: #F8FAFC !important;
        }

        .auth-skill-btn {
          height: 32px !important;
          padding: 0 14px !important;
          border-radius: 999px !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          background-color: #172033 !important;
          color: #94A3B8 !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          transition: all 150ms ease !important;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Responsive Layout Rules */
        @media (max-width: 1023px) {
          .auth-main-container {
            height: auto !important;
            flex-direction: column;
            gap: 32px;
            padding: 32px 16px;
            overflow-y: auto !important;
          }
          .auth-root-container {
            overflow-y: auto !important;
            height: auto !important;
            min-height: 100vh;
          }
          .auth-left-panel {
            width: 100%;
            height: auto !important;
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

        /* Under 1280px Grid collapsing rules */
        @media (max-width: 1279px) {
          .signup-form-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .signup-form-full-width {
            grid-column: span 1 !important;
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
        }

        .copilot-glow {
          background: linear-gradient(90deg, #8B5CF6, #A78BFA) !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          color: transparent !important;
          text-shadow: 0 0 20px rgba(124, 92, 255, 0.4) !important;
          display: inline-block;
        }

        @keyframes bulletPulse {
          0%, 100% { transform: scale(0.95); opacity: 0.9; }
          50% { transform: scale(1.15); opacity: 1; }
        }

        .animate-bullet {
          animation: bulletPulse 2s ease-in-out infinite !important;
          display: inline-flex !important;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        .floating-rocket {
          animation: float 4s ease-in-out infinite !important;
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          font-size: 28px !important;
          width: 28px !important;
          height: 28px !important;
        }

        @media (max-width: 1600px) {
          .signup-form-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px 12px !important;
          }
          .signup-form-grid > .col-span-1 {
            grid-column: span 1 !important;
          }
          .signup-form-grid > .col-span-2 {
            grid-column: span 2 !important;
          }
          .signup-form-grid > .col-span-3 {
            grid-column: span 2 !important;
          }
        }
        @media (max-width: 1279px) {
          .signup-form-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
          .signup-form-grid > * {
            grid-column: span 1 !important;
          }
        }
      `}</style>

      {/* Background Star Dots */}
      <div className="absolute top-[10%] left-[15%] w-1 h-1 bg-white rounded-full opacity-40 pointer-events-none animate-pulse"></div>
      <div className="absolute top-[25%] right-[20%] w-1.5 h-1.5 bg-white rounded-full opacity-60 pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[30%] left-[30%] w-1 h-1 bg-white rounded-full opacity-30 pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[15%] right-[10%] w-1 h-1 bg-white rounded-full opacity-50 pointer-events-none animate-pulse"></div>
      <div className="absolute top-[60%] left-[8%] w-1.5 h-1.5 bg-white rounded-full opacity-40 pointer-events-none animate-pulse"></div>
      <div className="absolute top-[75%] right-[35%] w-1 h-1 bg-white rounded-full opacity-50 pointer-events-none animate-pulse"></div>

      <div className={`auth-main-container ${activeTab === "signup" ? "is-signup-active" : ""}`}>
        {/* Left Panel: Brand & Features */}
        {activeTab === "login" && (
          <div className="auth-left-panel">
          <div className="left-panel-logo-container flex justify-between items-center w-full">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-extrabold text-sm bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-[0_4px_12px_rgba(99,102,241,0.4)]">A</div>
              <span className="font-heading font-bold text-xl tracking-tighter text-white">PlacementAI</span>
            </Link>
            <div className="floating-rocket text-2xl select-none">🚀</div>
          </div>

          <div className="left-panel-content">
            <h2 className="left-panel-headline">
              Your AI Placement<br />
              <span className="copilot-glow">Copilot</span>
            </h2>
            
            <p className="left-panel-description">
              Supercharge your career prep with AI-powered resume and mock interview suites.
            </p>
            
            <div className="left-panel-features">
              <div className="feature-item">
                <span className="w-5 h-5 rounded-full flex items-center justify-center bg-[#4F46E5] text-white flex-shrink-0 text-[11px] font-bold animate-bullet">✓</span>
                <span>Prepare smarter for your dream career.</span>
              </div>
              <div className="feature-item">
                <span className="w-5 h-5 rounded-full flex items-center justify-center bg-[#4F46E5] text-white flex-shrink-0 text-[11px] font-bold animate-bullet">✓</span>
                <span>Build professional, ATS-optimized resumes.</span>
              </div>
              <div className="feature-item">
                <span className="w-5 h-5 rounded-full flex items-center justify-center bg-[#4F46E5] text-white flex-shrink-0 text-[11px] font-bold animate-bullet">✓</span>
                <span>Practice realistic, role-specific mock interviews.</span>
              </div>
              <div className="feature-item">
                <span className="w-5 h-5 rounded-full flex items-center justify-center bg-[#4F46E5] text-white flex-shrink-0 text-[11px] font-bold animate-bullet">✓</span>
                <span>Get placed at top companies globally.</span>
              </div>
            </div>

            <div className="left-panel-chips">
              <span className="feature-chip flex items-center gap-2">
                📄 Resume Builder
              </span>
              <span className="feature-chip flex items-center gap-2">
                🛡 ATS
              </span>
              <span className="feature-chip flex items-center gap-2">
                🎤 Mock Interview
              </span>
              <span className="feature-chip flex items-center gap-2">
                🗺 Roadmaps
              </span>
            </div>
          </div>

          {/* Dot grid pattern at bottom left corner matching reference image */}
          <div className="absolute bottom-6 left-6 opacity-20 pointer-events-none">
            <svg width="60" height="40" viewBox="0 0 60 40" fill="none">
              <circle cx="5" cy="5" r="1.5" fill="white" />
              <circle cx="20" cy="5" r="1.5" fill="white" />
              <circle cx="35" cy="5" r="1.5" fill="white" />
              <circle cx="50" cy="5" r="1.5" fill="white" />
              <circle cx="5" cy="20" r="1.5" fill="white" />
              <circle cx="20" cy="20" r="1.5" fill="white" />
              <circle cx="35" cy="20" r="1.5" fill="white" />
              <circle cx="50" cy="20" r="1.5" fill="white" />
              <circle cx="5" cy="35" r="1.5" fill="white" />
              <circle cx="20" cy="35" r="1.5" fill="white" />
              <circle cx="35" cy="35" r="1.5" fill="white" />
              <circle cx="50" cy="35" r="1.5" fill="white" />
            </svg>
          </div>
        </div>
      )}

          <Card className={`auth-right-card ${activeTab === "signup" ? "is-signup" : ""}`}>
            {/* Absolute-positioned alerts to prevent layout shifting */}
            {error && (
              <div className="auth-alert-container">
                <div className="auth-alert-message auth-alert-error">
                  <span>{error}</span>
                  <button type="button" onClick={() => setError("")} className="text-red-400 hover:text-red-600 transition-colors p-0.5 outline-none bg-transparent border-none cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
            {success && (
              <div className="auth-alert-container">
                <div className="auth-alert-message auth-alert-success">
                  <span>{success}</span>
                  <button type="button" onClick={() => setSuccess("")} className="text-emerald-400 hover:text-emerald-600 transition-colors p-0.5 outline-none bg-transparent border-none cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Logo at the top of the auth card matching left panel logo */}
            <div className="flex justify-center mb-[18px]">
              <Link href="/" className="inline-flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-extrabold text-sm bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-[0_4px_12px_rgba(99,102,241,0.4)]">A</div>
                <span className="font-heading font-bold text-xl tracking-tighter text-white">PlacementAI</span>
              </Link>
            </div>

            <Tabs 
              value={activeTab} 
              onValueChange={(val) => { 
                setActiveTab(val); 
                setError(""); 
              }} 
              className="w-full flex-1 flex flex-col overflow-hidden"
            >
              <div className="mb-[24px]">
                <TabsList className="auth-tabs-list">
                  <TabsTrigger value="login" className="auth-tab-trigger">Login</TabsTrigger>
                  <TabsTrigger value="signup" className="auth-tab-trigger">Sign Up</TabsTrigger>
                </TabsList>
              </div>

              <div className="auth-header">
                <h1 className="auth-header-title">
                  {activeTab === "login" ? "Welcome Back" : "Create Account"}
                </h1>
                <p className="auth-header-subtitle">
                  {activeTab === "login" 
                    ? "Enter your credentials to access your dashboard." 
                    : "Join PlacementAI today"}
                </p>
              </div>

              {/* Login View */}
              <TabsContent value="login" className="m-0 focus-visible:outline-none focus-visible:ring-0 flex-1 flex flex-col overflow-hidden">
                <form onSubmit={handleLogin} className="auth-form auth-scroll-container">
                  {/* Email Input */}
                  <div className="auth-input-container">
                    <Label htmlFor="login-email" className="auth-input-label">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        id="login-email" 
                        type="email" 
                        className={getInputClass("email", "auth-input-field pl-11")}
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        placeholder="name@example.com"
                      />
                    </div>
                    <div className="validation-space">
                      {getFieldError("email") && (
                        <span className="validation-error-text">{getFieldError("email")}</span>
                      )}
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="auth-input-container" style={{ marginTop: '12px' }}>
                    <Label htmlFor="login-password" className="auth-input-label">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        id="login-password" 
                        type={showPassword ? "text" : "password"}
                        className={getInputClass("password", "auth-input-field pl-11 pr-11")}
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-0 text-slate-400 hover:text-slate-200 bg-transparent border-none cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="validation-space">
                      {getFieldError("password") && (
                        <span className="validation-error-text">{getFieldError("password")}</span>
                      )}
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="remember-forgot-row" style={{ marginTop: '12px' }}>
                    <div 
                      onClick={() => setRememberMe(!rememberMe)}
                      className="remember-me-label flex items-center gap-2 cursor-pointer select-none"
                    >
                      <div 
                        className={`custom-checkbox rounded flex items-center justify-center transition-all ${
                          rememberMe 
                            ? "bg-[#4F46E5] border-[#4F46E5]" 
                            : "bg-[#172033] border border-white/10 hover:bg-[#1B2740]"
                        }`}
                        style={{
                          width: '16px',
                          height: '16px',
                          borderWidth: '1px',
                          borderColor: rememberMe ? '#4F46E5' : 'rgba(255, 255, 255, 0.08)',
                          boxSizing: 'border-box'
                        }}
                      >
                        {rememberMe && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[#CBD5E1] font-semibold text-sm">Remember Me</span>
                    </div>
                    <Link href="/auth/forgot-password" className="forgot-password-link">
                      Forgot Password?
                    </Link>
                  </div>

                  {/* CTAs & Social Sign-In */}
                  <Button type="submit" className="auth-primary-btn" disabled={loading} style={{ marginTop: '16px' }}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                  </Button>
                  
                  <div className="auth-social-divider" style={{ marginTop: '18px', marginBottom: '0' }}>Or continue with</div>
                  
                  <div className="social-buttons-container" style={{ marginTop: '18px' }}>
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

                  <div className="text-center text-xs text-slate-400" style={{ marginTop: '8px' }}>
                    Don't have an account?{" "}
                    <button 
                      type="button" 
                      onClick={() => { setActiveTab("signup"); setError(""); }} 
                      className="text-[#818CF8] hover:text-[#A5B4FC] font-semibold bg-transparent border-none cursor-pointer p-0"
                    >
                      Sign Up
                    </button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="m-0 focus-visible:outline-none focus-visible:ring-0 flex-1 flex flex-col overflow-hidden">
                <form onSubmit={handleSignup} className="flex-1 flex flex-col justify-between auth-form-group">
                  <div className="flex-1 w-full">
                    {/* Student Form fields */}
                    {selectedRole === "STUDENT" && (
                      <div className="signup-form-grid">
                        {/* Student / Recruiter Selector */}
                        <div className="flex gap-3 mb-1 col-span-3">
                          <button
                            type="button"
                            onClick={() => { setSelectedRole("STUDENT"); setError(""); }}
                            className={`auth-role-btn ${selectedRole === "STUDENT" ? "active" : ""}`}
                          >
                            <span className="text-lg">👨‍🎓</span>
                            <span className="role-label">Student</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => { setSelectedRole("RECRUITER"); setError(""); }}
                            className={`auth-role-btn ${selectedRole === "RECRUITER" ? "active" : ""}`}
                          >
                            <span className="text-lg">💼</span>
                            <span className="role-label">Recruiter</span>
                          </button>
                        </div>

                        {/* Name */}
                        <div className="auth-input-container col-span-1">
                          <Label htmlFor="signup-name" className="auth-input-label">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              id="signup-name" 
                              className={getInputClass("fullName", "auth-input-field pl-11")}
                              value={signupData.fullName}
                              onChange={(e) => setSignupData({...signupData, fullName: e.target.value})}
                              placeholder="John Doe"
                            />
                          </div>
                          <div className="validation-space">
                            {getFieldError("fullName") && (
                              <span className="validation-error-text">{getFieldError("fullName")}</span>
                            )}
                          </div>
                        </div>

                        {/* Email */}
                        <div className="auth-input-container col-span-1">
                          <Label htmlFor="signup-email" className="auth-input-label">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              id="signup-email" 
                              type="email" 
                              className={getInputClass("email", "auth-input-field pl-11")}
                              value={signupData.email}
                              onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                              placeholder="name@example.com"
                            />
                          </div>
                          <div className="validation-space">
                            {getFieldError("email") && (
                              <span className="validation-error-text">{getFieldError("email")}</span>
                            )}
                          </div>
                        </div>

                        {/* Phone */}
                        <div className="auth-input-container col-span-1">
                          <Label htmlFor="signup-phone" className="auth-input-label">Phone</Label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              id="signup-phone" 
                              type="tel"
                              className={getInputClass("phone", "auth-input-field pl-11")}
                              value={signupData.phone}
                              onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                              placeholder="+1 (555) 000-0000"
                            />
                          </div>
                          <div className="validation-space" />
                        </div>

                        {/* Password */}
                        <div className="auth-input-container col-span-1">
                          <Label htmlFor="signup-password" className="auth-input-label">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              id="signup-password" 
                              type={showPassword ? "text" : "password"}
                              className={getInputClass("password", "auth-input-field pl-11 pr-11")}
                              value={signupData.password}
                              onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 p-0 text-slate-400 hover:text-slate-200 bg-transparent border-none cursor-pointer"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <div className="validation-space">
                            {getFieldError("password") && (
                              <span className="validation-error-text">{getFieldError("password")}</span>
                            )}
                          </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="auth-input-container col-span-1">
                          <Label htmlFor="signup-confirm" className="auth-input-label">Confirm Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              id="signup-confirm" 
                              type={showConfirmPassword ? "text" : "password"}
                              className={getInputClass("password", "auth-input-field pl-11 pr-11")}
                              value={signupData.confirmPassword}
                              onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 p-0 text-slate-400 hover:text-slate-200 bg-transparent border-none cursor-pointer"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <div className="validation-space" />
                        </div>

                        {/* College */}
                        <div className="auth-input-container col-span-1">
                          <Label htmlFor="student-college" className="auth-input-label">College *</Label>
                          <div className="relative">
                            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              id="student-college" 
                              className={getInputClass("college", "auth-input-field pl-11")}
                              value={signupData.collegeName}
                              onChange={(e) => setSignupData({...signupData, collegeName: e.target.value})}
                              placeholder="Stanford University"
                            />
                          </div>
                          <div className="validation-space">
                            {getFieldError("collegeName") && (
                              <span className="validation-error-text">{getFieldError("collegeName")}</span>
                            )}
                          </div>
                        </div>

                        {/* Branch */}
                        <div className="auth-input-container col-span-1">
                          <Label htmlFor="student-branch" className="auth-input-label">Branch</Label>
                          <div className="relative">
                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              id="student-branch" 
                              className={getInputClass("branch", "auth-input-field pl-11")}
                              value={signupData.branch}
                              onChange={(e) => setSignupData({...signupData, branch: e.target.value})}
                              placeholder="Computer Science"
                            />
                          </div>
                          <div className="validation-space" />
                        </div>

                        {/* Graduation Year */}
                        <div className="auth-input-container col-span-1">
                          <Label htmlFor="student-grad" className="auth-input-label">Graduation Year</Label>
                          <div className="relative">
                            <Map className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              id="student-grad" 
                              type="number" 
                              className={getInputClass("graduation", "auth-input-field pl-11")}
                              value={signupData.graduationYear}
                              onChange={(e) => setSignupData({...signupData, graduationYear: parseInt(e.target.value) || 2026})}
                            />
                          </div>
                          <div className="validation-space" />
                        </div>

                        {/* Semester */}
                        <div className="auth-input-container col-span-1">
                          <Label htmlFor="student-sem" className="auth-input-label">Current Semester</Label>
                          <div className="relative">
                            <Book className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              id="student-sem" 
                              type="number" 
                              className={getInputClass("semester", "auth-input-field pl-11")}
                              value={signupData.currentSemester}
                              onChange={(e) => setSignupData({...signupData, currentSemester: parseInt(e.target.value) || 1})}
                            />
                          </div>
                          <div className="validation-space" />
                        </div>

                        {/* Preferred Role Searchable Combobox */}
                        <div className="auth-input-container col-span-2 relative">
                          <Label htmlFor="student-role" className="auth-input-label">Preferred Role *</Label>
                          <div className="relative">
                            <Map className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              id="student-role" 
                              className={getInputClass("role", "auth-input-field pl-11")}
                              value={signupData.preferredRole}
                              onChange={(e) => {
                                setSignupData({...signupData, preferredRole: e.target.value});
                                setRoleDropdownOpen(true);
                              }}
                              onFocus={() => setRoleDropdownOpen(true)}
                              onBlur={() => setTimeout(() => setRoleDropdownOpen(false), 200)}
                              placeholder="e.g. Software Engineer"
                            />
                          </div>
                          {roleDropdownOpen && (
                            <div className="absolute left-0 right-0 top-[60px] bg-[#172033] border border-slate-800 rounded-lg shadow-xl z-50 max-h-36 overflow-y-auto">
                              {PREDEFINED_ROLES.filter(r => r.toLowerCase().includes(signupData.preferredRole.toLowerCase())).map((role) => (
                                <button
                                  key={role}
                                  type="button"
                                  onClick={() => {
                                    setSignupData({...signupData, preferredRole: role});
                                    setRoleDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-[#4F46E5] hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                                >
                                  {role}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Portfolio Optional */}
                        <div className="auth-input-container col-span-1">
                          <Label htmlFor="student-portfolio" className="auth-input-label">Portfolio (optional)</Label>
                          <div className="relative">
                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              id="student-portfolio" 
                              className="auth-input-field pl-11"
                              value={signupData.companyWebsite}
                              onChange={(e) => setSignupData({...signupData, companyWebsite: e.target.value})}
                              placeholder="portfolio.com/username"
                            />
                          </div>
                          <div className="validation-space" />
                        </div>

                        {/* Skills Compact Searchable Multi-Select */}
                        <div className="auth-input-container col-span-3 relative">
                          <Label className="auth-input-label">Skills</Label>
                          <div 
                            className="auth-input-field flex items-center justify-between cursor-pointer"
                            onClick={() => setSkillsDropdownOpen(!skillsDropdownOpen)}
                          >
                            <span className="text-sm text-slate-300 truncate">
                              {signupData.skills.length > 0 
                                ? signupData.skills.slice(0, 3).join(' • ') + (signupData.skills.length > 3 ? ` • +${signupData.skills.length - 3}` : '')
                                : "Select skills..."
                              }
                            </span>
                            <span className="text-slate-400 text-xs">▼</span>
                          </div>
                          
                          {skillsDropdownOpen && (
                            <div className="absolute left-0 right-0 top-[46px] bg-[#172033] border border-white/10 rounded-lg shadow-xl z-50 p-2 flex flex-col gap-2 max-h-48 overflow-y-auto">
                              <input 
                                type="text"
                                className="w-full bg-[#111827] border border-white/5 text-white text-sm outline-none px-3 py-1.5 rounded-lg placeholder:text-[#94A3B8]"
                                placeholder="Search skills..."
                                value={skillsSearch}
                                onChange={(e) => setSkillsSearch(e.target.value)}
                                autoFocus
                              />
                              <div className="flex flex-col max-h-36 overflow-y-auto">
                                {PREDEFINED_SKILLS.filter(s => s.toLowerCase().includes(skillsSearch.toLowerCase())).map((skill) => {
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
                                      className={`w-full text-left px-3 py-2 text-sm rounded transition-colors bg-transparent border-none cursor-pointer flex items-center justify-between ${
                                        isSelected ? 'text-indigo-400 font-bold bg-[#1e293b]' : 'text-slate-300 hover:bg-[#1E293B]'
                                      }`}
                                    >
                                      <span>{skill}</span>
                                      {isSelected && <span>✓</span>}
                                    </button>
                                  );
                                })}
                                {PREDEFINED_SKILLS.filter(s => s.toLowerCase().includes(skillsSearch.toLowerCase())).length === 0 && (
                                  <div className="px-3 py-2 text-xs text-[#94A3B8]">No matching skills</div>
                                )}
                              </div>
                            </div>
                          )}
                          <div className="validation-space" />
                        </div>

                        {/* LinkedIn Profile */}
                        <div className="auth-input-container col-span-3">
                          <Label htmlFor="student-linkedin" className="auth-input-label">LinkedIn Profile (optional)</Label>
                          <div className="relative">
                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              id="student-linkedin" 
                              className="auth-input-field pl-11"
                              value={signupData.workEmail}
                              onChange={(e) => setSignupData({...signupData, workEmail: e.target.value})}
                              placeholder="linkedin.com/in/username"
                            />
                          </div>
                          <div className="validation-space" />
                        </div>
                      </div>
                    )}

                    {/* Recruiter Form fields */}
                    {selectedRole === "RECRUITER" && (
                      <div className="signup-form-grid">
                        {/* Student / Recruiter Selector */}
                        <div className="flex gap-3 mb-1 col-span-3">
                          <button
                            type="button"
                            onClick={() => { setSelectedRole("STUDENT"); setError(""); }}
                            className={`auth-role-btn ${selectedRole === "STUDENT" ? "active" : ""}`}
                          >
                            <span className="text-lg">👨‍🎓</span>
                            <span className="role-label">Student</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => { setSelectedRole("RECRUITER"); setError(""); }}
                            className={`auth-role-btn ${selectedRole === "RECRUITER" ? "active" : ""}`}
                          >
                            <span className="text-lg">💼</span>
                            <span className="role-label">Recruiter</span>
                          </button>
                        </div>

                        {/* Name */}
                        <div className="auth-input-container col-span-1">
                          <Label htmlFor="signup-name" className="auth-input-label">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              id="signup-name" 
                              className={getInputClass("fullName", "auth-input-field pl-11")}
                              value={signupData.fullName}
                              onChange={(e) => setSignupData({...signupData, fullName: e.target.value})}
                              placeholder="John Doe"
                            />
                          </div>
                          <div className="validation-space">
                            {getFieldError("fullName") && (
                              <span className="validation-error-text">{getFieldError("fullName")}</span>
                            )}
                          </div>
                        </div>

                        {/* Company Name */}
                        <div className="auth-input-container col-span-1">
                          <Label htmlFor="recruiter-company" className="auth-input-label">Company</Label>
                          <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              id="recruiter-company" 
                              className={getInputClass("company", "auth-input-field pl-11")}
                              value={signupData.companyName}
                              onChange={(e) => setSignupData({...signupData, companyName: e.target.value})}
                              placeholder="e.g. Stripe"
                            />
                          </div>
                          <div className="validation-space">
                            {getFieldError("companyName") && (
                              <span className="validation-error-text">{getFieldError("companyName")}</span>
                            )}
                          </div>
                        </div>

                        {/* Email */}
                        <div className="auth-input-container col-span-1">
                          <Label htmlFor="signup-email" className="auth-input-label">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              id="signup-email" 
                              type="email" 
                              className={getInputClass("email", "auth-input-field pl-11")}
                              value={signupData.email}
                              onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                              placeholder="recruiter@company.com"
                            />
                          </div>
                          <div className="validation-space">
                            {getFieldError("email") && (
                              <span className="validation-error-text">{getFieldError("email")}</span>
                            )}
                          </div>
                        </div>

                        {/* Designation */}
                        <div className="auth-input-container col-span-1">
                          <Label htmlFor="recruiter-designation" className="auth-input-label">Designation</Label>
                          <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              id="recruiter-designation" 
                              className={getInputClass("designation", "auth-input-field pl-11")}
                              value={signupData.designation}
                              onChange={(e) => setSignupData({...signupData, designation: e.target.value})}
                              placeholder="e.g. Talent Lead"
                            />
                          </div>
                          <div className="validation-space" />
                        </div>

                        {/* Password */}
                        <div className="auth-input-container col-span-1">
                          <Label htmlFor="signup-password" className="auth-input-label">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              id="signup-password" 
                              type={showPassword ? "text" : "password"}
                              className={getInputClass("password", "auth-input-field pl-11 pr-11")}
                              value={signupData.password}
                              onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 p-0 text-slate-400 hover:text-slate-200 bg-transparent border-none cursor-pointer"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <div className="validation-space">
                            {getFieldError("password") && (
                              <span className="validation-error-text">{getFieldError("password")}</span>
                            )}
                          </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="auth-input-container col-span-1">
                          <Label htmlFor="signup-confirm" className="auth-input-label">Confirm Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              id="signup-confirm" 
                              type={showConfirmPassword ? "text" : "password"}
                              className={getInputClass("password", "auth-input-field pl-11 pr-11")}
                              value={signupData.confirmPassword}
                              onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 p-0 text-slate-400 hover:text-slate-200 bg-transparent border-none cursor-pointer"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <div className="validation-space" />
                        </div>

                        {/* Company Size */}
                        <div className="auth-input-container col-span-1">
                          <Label htmlFor="recruiter-size" className="auth-input-label">Company Size</Label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              id="recruiter-size" 
                              className={getInputClass("size", "auth-input-field pl-11")}
                              value={signupData.companySize}
                              onChange={(e) => setSignupData({...signupData, companySize: e.target.value})}
                              placeholder="e.g. 50-100"
                            />
                          </div>
                          <div className="validation-space" />
                        </div>

                        {/* Industry */}
                        <div className="auth-input-container col-span-1">
                          <Label htmlFor="recruiter-industry" className="auth-input-label">Industry</Label>
                          <div className="relative">
                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              id="recruiter-industry" 
                              className={getInputClass("industry", "auth-input-field pl-11")}
                              value={signupData.degree}
                              onChange={(e) => setSignupData({...signupData, degree: e.target.value})}
                              placeholder="e.g. FinTech"
                            />
                          </div>
                          <div className="validation-space" />
                        </div>

                        {/* Location */}
                        <div className="auth-input-container col-span-1">
                          <Label htmlFor="recruiter-location" className="auth-input-label">Location</Label>
                          <div className="relative">
                            <Map className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              id="recruiter-location" 
                              className={getInputClass("location", "auth-input-field pl-11")}
                              value={signupData.branch}
                              onChange={(e) => setSignupData({...signupData, branch: e.target.value})}
                              placeholder="e.g. San Francisco, CA"
                            />
                          </div>
                          <div className="validation-space" />
                        </div>

                        {/* Company Website */}
                        <div className="auth-input-container col-span-1">
                          <Label htmlFor="recruiter-website" className="auth-input-label">Company Website</Label>
                          <div className="relative">
                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              id="recruiter-website" 
                              className={getInputClass("website", "auth-input-field pl-11")}
                              value={signupData.companyWebsite}
                              onChange={(e) => setSignupData({...signupData, companyWebsite: e.target.value})}
                              placeholder="e.g. stripe.com"
                            />
                          </div>
                          <div className="validation-space" />
                        </div>

                        {/* Hiring Roles */}
                        <div className="auth-input-container col-span-1">
                          <Label htmlFor="recruiter-hiring" className="auth-input-label">Hiring Roles</Label>
                          <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              id="recruiter-hiring" 
                              className={getInputClass("hiring", "auth-input-field pl-11")}
                              value={signupData.hiringRoles}
                              onChange={(e) => setSignupData({...signupData, hiringRoles: e.target.value})}
                              placeholder="e.g. Software Engineer, Product Manager"
                            />
                          </div>
                          <div className="validation-space" />
                        </div>

                        {/* Phone */}
                        <div className="auth-input-container col-span-1">
                          <Label htmlFor="recruiter-phone" className="auth-input-label">Phone</Label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              id="recruiter-phone" 
                              type="tel"
                              className={getInputClass("phone", "auth-input-field pl-11")}
                              value={signupData.phone}
                              onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                              placeholder="+1 (555) 000-0000"
                            />
                          </div>
                          <div className="validation-space" />
                        </div>

                        {/* LinkedIn Profile */}
                        <div className="auth-input-container col-span-3">
                          <Label htmlFor="recruiter-linkedin" className="auth-input-label">LinkedIn Profile (optional)</Label>
                          <div className="relative">
                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              id="recruiter-linkedin" 
                              className="auth-input-field pl-11"
                              value={signupData.workEmail}
                              onChange={(e) => setSignupData({...signupData, workEmail: e.target.value})}
                              placeholder="linkedin.com/in/username"
                            />
                          </div>
                          <div className="validation-space" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-white/5 my-2 w-full"></div>
                  <div className="mt-0">
                    <Button type="submit" className="auth-primary-btn" disabled={loading}>
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
                    </Button>
                    
                    <div className="text-center mt-[8px] text-xs text-slate-400">
                      Already have an account?{" "}
                      <button 
                        type="button" 
                        onClick={() => { setActiveTab("login"); setError(""); }} 
                        className="text-[#818CF8] hover:text-[#A5B4FC] font-semibold bg-transparent border-none cursor-pointer p-0"
                      >
                        Sign In
                      </button>
                    </div>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
      </div>
    </div>
  );
}
