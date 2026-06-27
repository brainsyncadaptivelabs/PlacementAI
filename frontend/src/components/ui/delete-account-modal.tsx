"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  authProvider: 'EMAIL' | 'GOOGLE';
  onDeleteEmail: (password: string) => Promise<void>;
  onDeleteGoogle: () => Promise<void>;
  loading: boolean;
  error?: string | null;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  authProvider,
  onDeleteEmail,
  onDeleteGoogle,
  loading,
  error
}: DeleteAccountModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const isEmail = authProvider === 'EMAIL';

  const handleEmailDelete = () => {
    if (password && confirmed) {
      onDeleteEmail(password);
    }
  };

  const handleGoogleDelete = () => {
    onDeleteGoogle();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={!loading ? onClose : undefined}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md bg-[#0F172A] border border-white/10 rounded-2xl p-6 shadow-[0_18px_45px_rgba(0,0,0,0.45)] z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-4 text-red-500 mb-4">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <AlertTriangle size={24} />
              </div>
              <h2 className="text-xl font-bold text-white">Delete Account</h2>
            </div>
            
            <button 
              onClick={onClose}
              disabled={loading}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>

            {isEmail ? (
              <div className="flex flex-col gap-5 mt-2">
                <div className="text-sm text-slate-300 leading-relaxed">
                  This action cannot be undone.
                  <br /><br />
                  All your resumes, interview history, ATS reports, analytics, saved jobs, learning progress and profile data will be permanently deleted.
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-slate-300">Confirm your password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="bg-[#111827] border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-red-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 mt-2">
                  <Checkbox 
                    id="confirm" 
                    checked={confirmed}
                    onCheckedChange={(c) => setConfirmed(c as boolean)}
                    className="border-white/20 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 mt-0.5"
                  />
                  <Label htmlFor="confirm" className="text-sm font-normal text-slate-300 leading-tight cursor-pointer">
                    I understand that this action is permanent and my data cannot be recovered.
                  </Label>
                </div>

                {error && (
                  <div className="text-sm text-red-400 font-medium">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 bg-transparent border-white/10 text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleEmailDelete}
                    disabled={!password || !confirmed || loading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Account"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5 mt-2">
                <div className="text-sm text-slate-300 leading-relaxed">
                  Since you signed in with Google, please verify your Google account before deleting your PlacementAI account.
                  <br /><br />
                  <span className="text-red-400 font-semibold">Warning:</span> All your data will be permanently deleted. This action cannot be undone.
                </div>

                {error && (
                  <div className="text-sm text-red-400 font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 bg-transparent border-white/10 text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGoogleDelete}
                    disabled={loading}
                    className="flex-1 bg-white text-black hover:bg-slate-200 font-semibold flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" width="18" height="18">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
