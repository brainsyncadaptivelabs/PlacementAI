"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronRight, Bell, Shield, Download, Trash2, Key, Sun, Moon, Monitor, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { PageShell } from "@/components/ui/theme-components";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Switch states
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [profileVisible, setProfileVisible] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAction = (label: string) => {
    setLoadingAction(label);
    setTimeout(() => {
      setLoadingAction(null);
      alert(`${label} action completed successfully.`);
    }, 800);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      setLoadingAction("Delete Account");
      setTimeout(() => {
        setLoadingAction(null);
        alert("Account deletion request submitted.");
      }, 1000);
    }
  };

  return (
    <PageShell className="max-w-4xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold font-heading text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences, security, and data.</p>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the application theme and layout options.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant={mounted && theme === 'light' ? 'default' : 'secondary'}
                className="w-full gap-2 justify-center"
                onClick={() => setTheme('light')}
              >
                <Sun className="w-4 h-4" /> Light
              </Button>
              <Button
                variant={mounted && theme === 'dark' ? 'default' : 'secondary'}
                className="w-full gap-2 justify-center"
                onClick={() => setTheme('dark')}
              >
                <Moon className="w-4 h-4" /> Dark
              </Button>
              <Button
                variant={mounted && theme === 'system' ? 'default' : 'secondary'}
                className="w-full gap-2 justify-center"
                onClick={() => setTheme('system')}
              >
                <Monitor className="w-4 h-4" /> System
              </Button>
            </div>
          </CardContent>
        </Card>

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
              <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
            </div>

            <Separator className="my-2" />

            {/* Push Notifications Switch Row */}
            <div className="flex items-center justify-between py-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-foreground">Push Notifications</span>
                <span className="text-xs text-muted-foreground">Get real-time browser alerts when a recruiter messages you.</span>
              </div>
              <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
            </div>

            <Separator className="my-2" />

            {/* Auto Save Switch Row */}
            <div className="flex items-center justify-between py-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-foreground">Auto-Save Progress</span>
                <span className="text-xs text-muted-foreground">Automatically save changes in the resume builder.</span>
              </div>
              <Switch checked={autoSave} onCheckedChange={setAutoSave} />
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
              <Switch checked={profileVisible} onCheckedChange={setProfileVisible} />
            </div>

            <Separator className="my-2" />

            {/* Two-Factor Authentication Switch Row */}
            <div className="flex items-center justify-between py-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-foreground">Two-Factor Authentication</span>
                <span className="text-xs text-muted-foreground">Secure your account with an authentication app verification code.</span>
              </div>
              <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
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
              { label: "Change Password", icon: Key },
              { label: "Download My Data", icon: Download },
            ].map((item, i) => (
              <Button
                key={i}
                variant="secondary"
                onClick={() => handleAction(item.label)}
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
                variant="destructive"
                onClick={handleDelete}
                disabled={loadingAction !== null}
              >
                {loadingAction === "Delete Account" ? "Processing..." : "Delete Account"}
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
              onClick={() => alert("Support ticket created. We will contact you soon.")}
              className="w-full text-xs"
            >
              Contact Support
            </Button>
          </CardContent>
        </Card>

      </div>
    </PageShell>
  );
}
