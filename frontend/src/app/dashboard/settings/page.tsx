"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronRight, Bell, Shield, Download, Trash2, Key, Sun, Moon, Monitor, Eye, User, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { PageShell } from "@/components/ui/theme-components";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DeleteAccountModal } from "@/components/ui/delete-account-modal";
import { ReportCardModal } from "@/components/dashboard/ReportCardModal";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "@/store/toast-store";

export default function SettingsPage() {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReportCardModalOpen, setIsReportCardModalOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { signOut } = useAuth();
  const router = useRouter();

  const { user, mutate } = useUser();

  // Switch states
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [profileVisible, setProfileVisible] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  // Change Password state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Support Ticket state
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportError, setSupportError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      setEmailNotifs(user.emailNotifications ?? true);
      setPushNotifs(user.pushNotifications ?? false);
      setAutoSave(user.autoSave ?? true);
      setProfileVisible(user.profileVisible ?? true);
      setTwoFactor(user.twoFactorEnabled ?? false);
    }
  }, [user]);

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  const handlePushNotifToggle = async (val: boolean) => {
    setPushNotifs(val);
    
    if (val) {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        toast.warning('Push notifications are not supported by your browser.');
        setPushNotifs(false);
        return;
      }
      
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast.warning('You must grant notification permission to enable this feature.');
          setPushNotifs(false);
          return;
        }
        
        const registration = await navigator.serviceWorker.register('/sw.js');
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          console.error("VAPID Public Key (NEXT_PUBLIC_VAPID_PUBLIC_KEY) is not defined in frontend environment variables.");
          toast.error('Failed to enable push notifications: Server configuration is missing VAPID public key.');
          setPushNotifs(false);
          return;
        }
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });
        
        const subJson = subscription.toJSON();
        
        await api.post('/push/subscribe', {
          endpoint: subJson.endpoint,
          keys: subJson.keys
        });
        
        await updatePreference("pushNotifications", true);
      } catch (err) {
        console.error("Failed to subscribe to push notifications", err);
        setPushNotifs(false);
        toast.error('Failed to enable push notifications.');
      }
    } else {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          const subJson = subscription.toJSON();
          await api.post('/push/unsubscribe', { endpoint: subJson.endpoint });
          await subscription.unsubscribe();
        }
        await updatePreference("pushNotifications", false);
      } catch (err) {
        console.error("Failed to unsubscribe", err);
      }
    }
  };

  const updatePreference = async (key: string, value: any) => {
    try {
      await api.put("/user/preferences", { [key]: value });
      mutate();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update preference");
    }
  };

  const handleAction = (label: string) => {
    if (label === "Change Password") {
      setIsPasswordModalOpen(true);
      return;
    }
    if (label === "Download My Data") {
      setIsReportCardModalOpen(true);
      return;
    }
    setLoadingAction(label);
    setTimeout(() => {
      setLoadingAction(null);
      toast.success(`${label} action completed successfully.`);
    }, 800);
  };

  const handleDownloadData = async () => {
    if (!user) return;
    setLoadingAction("Download My Data");
    
    try {
      // Create a temporary container for the PDF content
      const element = document.createElement("div");
      element.style.width = "800px";
      element.style.padding = "40px";
      element.style.backgroundColor = "#ffffff";
      element.style.color = "#0f172a";
      element.style.fontFamily = "system-ui, -apple-system, sans-serif";
      
      const formattedDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      element.innerHTML = `
        <div style="border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #1e1b4b; letter-spacing: -0.5px;">PlacementAI</h1>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #64748b; font-weight: 500;">Official User Data & Profile Report</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 500;">Generated on</p>
            <p style="margin: 2px 0 0 0; font-size: 13px; color: #0f172a; font-weight: 600;">${formattedDate}</p>
          </div>
        </div>

        <div style="margin-bottom: 35px;">
          <h2 style="font-size: 16px; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 15px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">1. Personal Information</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px 30px;">
            <div>
              <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Full Name</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #0f172a; font-weight: 500;">${user.fullName || "N/A"}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #0f172a; font-weight: 500;">${user.email || "N/A"}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Account Role</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #0f172a; font-weight: 500; text-transform: capitalize;">${user.role || "N/A"}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Auth Provider</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #0f172a; font-weight: 500;">${user.authProvider || "LOCAL"}</p>
            </div>
            ${user.dateOfBirth ? `
            <div>
              <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Date of Birth</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #0f172a; font-weight: 500;">${user.dateOfBirth}</p>
            </div>
            ` : ""}
            <div>
              <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Member Since</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #0f172a; font-weight: 500;">${user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "N/A"}</p>
            </div>
          </div>
        </div>

        ${(user.role === "student" || user.collegeName) ? `
        <div style="margin-bottom: 35px;">
          <h2 style="font-size: 16px; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 15px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">2. Academic Details</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px 30px;">
            <div style="grid-column: span 2;">
              <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">College / University</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #0f172a; font-weight: 500;">${user.collegeName || "N/A"}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Degree Branch</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #0f172a; font-weight: 500;">${user.branch || "N/A"}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Graduation Year</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #0f172a; font-weight: 500;">${user.graduationYear || "N/A"}</p>
            </div>
          </div>
        </div>
        ` : ""}

        ${user.skills ? `
        <div style="margin-bottom: 35px;">
          <h2 style="font-size: 16px; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 15px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">3. Professional Skills</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${user.skills.split(',').map((skill: string) => `
              <span style="background-color: #f1f5f9; color: #334155; font-size: 12px; font-weight: 500; padding: 5px 10px; border-radius: 6px; border: 1px solid #e2e8f0; display: inline-block;">
                ${skill.trim()}
              </span>
            `).join('')}
          </div>
        </div>
        ` : ""}

        <div style="margin-bottom: 35px;">
          <h2 style="font-size: 16px; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 15px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">4. Connected Social Profiles</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px 30px;">
            <div>
              <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">LinkedIn</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #4f46e5; font-weight: 500; word-break: break-all;">${user.linkedinUrl || "Not Connected"}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">GitHub</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #4f46e5; font-weight: 500; word-break: break-all;">${user.githubUrl || "Not Connected"}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">LeetCode</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #4f46e5; font-weight: 500; word-break: break-all;">${user.leetcodeUrl || "Not Connected"}</p>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 40px;">
          <h2 style="font-size: 16px; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 15px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">5. Account Preferences</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px 30px;">
            <div>
              <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Email Notifications</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #0f172a; font-weight: 500;">${user.emailNotifications !== false ? "Enabled" : "Disabled"}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Push Notifications</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #0f172a; font-weight: 500;">${user.pushNotifications ? "Enabled" : "Disabled"}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Profile Visibility</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #0f172a; font-weight: 500;">${user.profileVisible !== false ? "Public (Visible to Recruiters)" : "Private"}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Two-Factor Authentication</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #0f172a; font-weight: 500;">${user.twoFactorEnabled ? "Enabled" : "Disabled"}</p>
            </div>
          </div>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 11px; color: #94a3b8; font-weight: 500;">
          This document contains personal account details generated from PlacementAI. Keep this document secure.
        </div>
      `;

      // Mount offscreen
      document.body.appendChild(element);

      // Render to canvas
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: "#ffffff"
      });

      // Remove from body
      document.body.removeChild(element);

      const imgData = canvas.toDataURL("image/png");
      
      // jsPDF setup (A4 paper size: 210mm x 297mm)
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("placementai_user_data.pdf");
      toast.success("Data downloaded successfully as PDF!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download PDF data.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setLoadingAction("Change Password API");
    try {
      await api.put("/user/change-password", {
        oldPassword,
        newPassword
      });
      setIsPasswordModalOpen(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully.");
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 400) {
        setPasswordError(err.response.data || "Incorrect current password.");
      } else {
        setPasswordError("Failed to change password. Please try again.");
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSubmitSupportTicket = async () => {
    setSupportError("");
    if (!supportSubject.trim() || !supportMessage.trim()) {
      setSupportError("Subject and Message are required.");
      return;
    }
    setLoadingAction("Submit Support Ticket API");
    try {
      await api.post("/support/ticket", {
        subject: supportSubject,
        message: supportMessage
      });
      setIsSupportModalOpen(false);
      setSupportSubject("");
      setSupportMessage("");
      toast.success("Support ticket submitted successfully.");
    } catch (err: any) {
      console.error(err);
      setSupportError(err.response?.data || "Failed to submit ticket. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteSuccess = async () => {
    setIsDeleteModalOpen(false);
    await signOut();
    toast.success("Your account has been deleted successfully.");
    router.push("/");
  };

  return (
    <PageShell className="max-w-4xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold font-heading text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences, security, and data.</p>
      </div>

      <div className="flex flex-col gap-6">
        

        {/* Notifications & Prefs */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Control your communication and automation settings.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col">
            
            {/* Email Notifications Switch Row */}
            <div className="flex items-center justify-between py-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-foreground">Email Notifications</span>
                <span className="text-xs text-muted-foreground">Receive weekly job matches and application updates.</span>
              </div>
              <Switch checked={emailNotifs} onCheckedChange={(val: boolean) => { setEmailNotifs(val); updatePreference("emailNotifications", val); }} />
            </div>

            <Separator className="my-2" />

            {/* Push Notifications Switch Row */}
            <div className="flex items-center justify-between py-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-foreground">Push Notifications</span>
                <span className="text-xs text-muted-foreground">Get real-time browser alerts when a recruiter messages you.</span>
              </div>
              <Switch checked={pushNotifs} onCheckedChange={handlePushNotifToggle} />
            </div>

            <Separator className="my-2" />

            {/* Auto Save Switch Row */}
            <div className="flex items-center justify-between py-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-foreground">Auto-Save Progress</span>
                <span className="text-xs text-muted-foreground">Automatically save changes in the resume builder.</span>
              </div>
              <Switch checked={autoSave} onCheckedChange={(val: boolean) => { setAutoSave(val); updatePreference("autoSave", val); }} />
            </div>

          </CardContent>
        </Card>

        {/* Security & Access */}
        <Card>
          <CardHeader>
            <CardTitle>Security & Privacy</CardTitle>
            <CardDescription>Manage your account credentials and visible settings.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col">
            
            {/* Profile Visibility Switch Row */}
            <div className="flex items-center justify-between py-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-foreground">Public Profile Visibility</span>
                <span className="text-xs text-muted-foreground">Allow verified recruiters to search and view your academic profile.</span>
              </div>
              <Switch checked={profileVisible} onCheckedChange={(val: boolean) => { setProfileVisible(val); updatePreference("profileVisible", val); }} />
            </div>

            <Separator className="my-2" />

            {/* Two-Factor Authentication Switch Row */}
            <div className="flex items-center justify-between py-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-foreground">Two-Factor Authentication</span>
                <span className="text-xs text-muted-foreground">Secure your account with an authentication app verification code.</span>
              </div>
              <Switch checked={twoFactor} onCheckedChange={(val: boolean) => { setTwoFactor(val); updatePreference("twoFactorEnabled", val); }} />
            </div>

          </CardContent>
        </Card>

        {/* Account Settings Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Account Operations</CardTitle>
            <CardDescription>Perform administrative actions on your user account.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {[
              { label: "My Profile", icon: User, url: "/dashboard/profile" },
              { label: "Plans and Billing", icon: CreditCard, url: "/dashboard/billing" },
              { label: "Change Password", icon: Key },
              { label: "Download My Data", icon: Download },
            ].map((item, i) => (
              <Button
                key={i}
                variant="secondary"
                onClick={() => {
                  if (item.url) {
                    router.push(item.url);
                  } else {
                    handleAction(item.label);
                  }
                }}
                disabled={loadingAction !== null}
                className="w-full flex items-center justify-between py-6 px-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  {loadingAction === item.label ? (
                     <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                     <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-red-500">Delete Account</h3>
                <p className="text-xs text-muted-foreground">Permanently remove your account and all associated data. This action is irreversible.</p>
              </div>
              <Button 
                variant="outline"
                className="border-red-500/50 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={loadingAction !== null}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h4 className="font-bold text-sm text-foreground">Need help?</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Check our documentation or contact our support team for any assistance with your account.</p>
            </div>
            <Button 
              variant="secondary" 
              onClick={() => setIsSupportModalOpen(true)}
              className="w-full text-xs"
            >
              Contact Support
            </Button>
          </CardContent>
        </Card>

      </div>

      {/* Change Password Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new secure password to update your credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="oldPassword">Current Password</Label>
              <Input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e: any) => setOldPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e: any) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e: any) => setConfirmPassword(e.target.value)}
              />
            </div>
            {passwordError && (
              <p className="text-sm font-semibold text-red-500">{passwordError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleChangePassword} 
              disabled={loadingAction === "Change Password API"}
            >
              {loadingAction === "Change Password API" ? "Saving..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Support Modal */}
      <Dialog open={isSupportModalOpen} onOpenChange={setIsSupportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Support</DialogTitle>
            <DialogDescription>
              Describe your issue below and our support team will get back to you.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="supportSubject">Subject</Label>
              <Input
                id="supportSubject"
                type="text"
                value={supportSubject}
                onChange={(e: any) => setSupportSubject(e.target.value)}
                placeholder="What do you need help with?"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="supportMessage">Message</Label>
              <Textarea
                id="supportMessage"
                value={supportMessage}
                onChange={(e: any) => setSupportMessage(e.target.value)}
                placeholder="Provide detailed information about the issue..."
                className="min-h-[120px]"
              />
            </div>
            {supportError && (
              <p className="text-sm font-semibold text-red-500">{supportError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsSupportModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitSupportTicket} 
              disabled={loadingAction === "Submit Support Ticket API"}
            >
              {loadingAction === "Submit Support Ticket API" ? "Submitting..." : "Submit Ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        authProvider={user?.authProvider || "LOCAL"}
        onDeleteSuccess={handleDeleteSuccess}
      />

      <ReportCardModal
        isOpen={isReportCardModalOpen}
        onClose={() => setIsReportCardModalOpen(false)}
      />
    </PageShell>
  );
}
