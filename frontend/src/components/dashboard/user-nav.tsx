"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  CreditCard, 
  Camera, 
  Loader2,
  ChevronRight
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/hooks/use-user";
import api from "@/lib/api";

export function UserNav() {
  const { user, loading } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/profile/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      window.location.reload();
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
      setIsOpen(false);
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return "U";

    const words = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 0) return "U";

    if (words.length === 1) {
      return words[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return (
      words[0][0] +
      words[1][0]
    ).toUpperCase();
  };

  if (loading) return <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />;

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Area (Name + Avatar) */}
      <div 
        className="flex items-center gap-3 pl-4 cursor-pointer group select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-foreground leading-none group-hover:text-primary transition-colors">
            {user?.fullName || "User"}
          </p>
          <p className="text-[10px] font-bold text-muted-foreground/70 mt-1 uppercase tracking-widest">
            {user?.plan || "Free"} Plan
          </p>
        </div>

        <div className="relative">
          <Avatar className="w-10 h-10 border-2 border-white shadow-sm group-hover:shadow-primary/20 group-hover:border-primary/20 transition-all duration-300">
            <AvatarImage src={user?.profileImage || ""} />
            <AvatarFallback className="bg-primary text-white font-bold text-sm">
              {getInitials(user?.fullName)}
            </AvatarFallback>
          </Avatar>
          {isUploading && (
            <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
          )}
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange}
      />

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute right-0 mt-3 w-auto min-w-[160px] bg-card border border-border rounded-xl shadow-md z-50 overflow-hidden"
          >
            <div className="p-1.5 flex flex-col gap-0.5">
              <Link 
                href="/plans"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between gap-4 p-2.5 rounded-lg hover:bg-muted transition-all group whitespace-nowrap min-w-max"
              >
                <div className="flex items-center gap-3 text-foreground">
                  <CreditCard className="w-4 h-4 text-muted-foreground/70 group-hover:text-primary shrink-0" />
                  <span className="text-sm font-semibold">Plans</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
              </Link>

              <Link 
                href={user?.role === "RECRUITER" ? "/recruiter/settings" : user?.role === "PLACEMENT_OFFICER" ? "/placement-officer/settings" : "/dashboard/profile"}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between gap-4 p-2.5 rounded-lg hover:bg-muted transition-all group whitespace-nowrap min-w-max"
              >
                <div className="flex items-center gap-3 text-foreground">
                  <User className="w-4 h-4 text-muted-foreground/70 group-hover:text-primary shrink-0" />
                  <span className="text-sm font-semibold">Profile</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
              </Link>

              <button 
                onClick={() => {
                  fileInputRef.current?.click();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between gap-4 p-2.5 rounded-lg hover:bg-muted transition-all group whitespace-nowrap min-w-max"
              >
                <div className="flex items-center gap-3 text-foreground">
                  <Camera className="w-4 h-4 text-muted-foreground/70 group-hover:text-primary shrink-0" />
                  <span className="text-sm font-semibold">Change Photo</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
