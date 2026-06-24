"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Bell, Shield, Download, Trash2, Key, Sun, Moon, Monitor } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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
    <div className="p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold font-heading text-foreground">Account Settings</h1>
        <p className="text-muted-foreground">Manage your preferences, security, and data.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        
        {/* Appearance Settings */}
        <Card className="border-none shadow-sm bg-card">
          <CardHeader className="p-6 border-b border-border/40">
            <CardTitle className="text-base font-bold font-heading text-foreground">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant={mounted && theme === 'light' ? 'default' : 'outline'}
                className="w-full gap-2 justify-center"
                onClick={() => setTheme('light')}
              >
                <Sun className="w-4 h-4" /> Light
              </Button>
              <Button
                variant={mounted && theme === 'dark' ? 'default' : 'outline'}
                className="w-full gap-2 justify-center"
                onClick={() => setTheme('dark')}
              >
                <Moon className="w-4 h-4" /> Dark
              </Button>
              <Button
                variant={mounted && theme === 'system' ? 'default' : 'outline'}
                className="w-full gap-2 justify-center"
                onClick={() => setTheme('system')}
              >
                <Monitor className="w-4 h-4" /> System
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Existing Settings Overview */}
        <Card className="border-none shadow-sm bg-card">
          <CardHeader className="p-6 border-b border-border/40">
            <CardTitle className="text-base font-bold font-heading text-foreground">Settings Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {[
              { label: "Change Password", icon: Key },
              { label: "Notification Settings", icon: Bell },
              { label: "Privacy Settings", icon: Shield },
              { label: "Download My Data", icon: Download },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => handleAction(item.label)}
                disabled={loadingAction !== null}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-muted transition-colors group text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  {loadingAction === item.label ? (
                     <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                     <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-100 shadow-sm bg-red-50/30 dark:bg-red-950/10 dark:border-red-900/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-heading text-red-600 dark:text-red-400">Delete Account</h3>
                <p className="text-sm text-red-500/80 mt-1">Permanently remove your account and all associated data.</p>
              </div>
              <Button 
                variant="destructive"
                onClick={handleDelete}
                disabled={loadingAction !== null}
                className="bg-red-500 hover:bg-red-600 font-bold"
              >
                {loadingAction === "Delete Account" ? "Processing..." : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 mt-6">
          <h4 className="font-bold text-sm text-primary mb-2">Need help?</h4>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">Check our documentation or contact our support team for any assistance with your account.</p>
          <Button 
            variant="outline" 
            onClick={() => alert("Support ticket created. We will contact you soon.")}
            className="w-full border-primary/20 text-primary hover:bg-primary/5 text-xs h-9"
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
