"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Calendar, 
  MapPin, 
  Globe, 
  Edit2, 
  Camera, 
  Loader2, 
  CheckCircle2, 
  ArrowRight,
  Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/hooks/use-user";
import { EditProfileDialog } from "@/app/dashboard/profile/edit-profile-dialog";
import api from "@/lib/api";
import { toast } from "sonner";

export default function RecruiterProfilePage() {
  const { user, loading, mutate } = useUser();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchRecruiterData = async () => {
      try {
        const [statsRes, companyRes] = await Promise.allSettled([
          api.get("/recruiter/dashboard/stats"),
          api.get("/recruiters/company")
        ]);
        if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
        if (companyRes.status === "fulfilled") setCompany(companyRes.value.data);
      } catch (err) {
        console.error("Failed to load recruiter profile data", err);
      }
    };

    fetchRecruiterData();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/profile/upload-image", formData);
      await mutate();
      toast.success("Profile image updated successfully!");
    } catch (err) {
      console.error("Image upload failed", err);
      toast.error("Failed to upload profile image.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "R";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "R";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const getMemberSince = (dateStr?: string | null) => {
    if (!dateStr) return "Active Member";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
      });
    } catch {
      return "Active Member";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Top Banner Card */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border border-border/40 bg-gradient-to-r from-[#4A154B] via-[#2D1B4E] to-[#1e1b4b] text-white p-6 md:p-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="relative group">
              <Avatar className="w-24 h-24 md:w-28 md:h-28 border-4 border-white/20 shadow-2xl">
                <AvatarImage src={user?.profileImage || ""} />
                <AvatarFallback className="text-3xl font-extrabold bg-white/10 text-white">
                  {getInitials(user?.fullName)}
                </AvatarFallback>
              </Avatar>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                aria-label="Upload profile photo"
                className="absolute bottom-0 right-0 p-2.5 bg-primary text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all border-2 border-white cursor-pointer"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>

              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload} 
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <Badge className="bg-white/15 text-white hover:bg-white/20 border-white/20 text-xs px-2.5 py-0.5">
                  Recruiter Profile
                </Badge>
                {user?.companyName && (
                  <Badge variant="outline" className="border-pink-300/40 text-pink-200 text-xs px-2.5 py-0.5">
                    {user.companyName}
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                {user?.fullName || "Recruiter"}
              </h1>

              <p className="text-sm text-slate-300 font-medium">
                {user?.designation || "Technical Hiring Specialist"} • {user?.companyName || "Organization"}
              </p>

              <p className="text-xs text-slate-400">
                Member since {getMemberSince(user?.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center md:justify-end">
            <Button
              onClick={() => setIsEditOpen(true)}
              className="bg-white hover:bg-slate-100 text-slate-900 font-bold px-5 h-11 rounded-xl shadow-md flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" /> Edit Profile
            </Button>
            <Link href="/recruiter/company">
              <Button
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold px-5 h-11 rounded-xl flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" /> Company Workspace
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border/60 bg-card shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Jobs Posted</p>
              <p className="text-2xl font-black text-foreground mt-0.5">{stats?.totalJobs || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Candidates</p>
              <p className="text-2xl font-black text-foreground mt-0.5">{stats?.totalApplications || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Interviews</p>
              <p className="text-2xl font-black text-foreground mt-0.5">{stats?.interviewsScheduled || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Offers Sent</p>
              <p className="text-2xl font-black text-foreground mt-0.5">{stats?.offersExtended || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Details & Company Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recruiter Details Card */}
        <Card className="border border-border/60 bg-card shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Recruiter Details
            </CardTitle>
            <CardDescription>Your personal hiring specialist account credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3.5 bg-muted/40 rounded-xl border border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase">Full Name</p>
                  <p className="text-sm font-semibold text-foreground">{user?.fullName || "Not provided"}</p>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-muted/40 rounded-xl border border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase">Email Address</p>
                  <p className="text-sm font-semibold text-foreground">{user?.email || "Not provided"}</p>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-muted/40 rounded-xl border border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase">Phone Number</p>
                  <p className="text-sm font-semibold text-foreground">{user?.phone || "Not provided"}</p>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-muted/40 rounded-xl border border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase">Designation</p>
                  <p className="text-sm font-semibold text-foreground">{user?.designation || "Technical Recruiter"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Workspace Info Card */}
        <Card className="border border-border/60 bg-card shadow-sm flex flex-col justify-between">
          <div>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" /> Company Overview
                </CardTitle>
                <Link href="/recruiter/company">
                  <Button variant="ghost" size="sm" className="text-xs text-primary font-bold">
                    Manage <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
              <CardDescription>Organization profile details and brand assets</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="p-3.5 bg-muted/40 rounded-xl border border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase">Company Name</p>
                    <p className="text-sm font-semibold text-foreground">{company?.companyName || user?.companyName || "Organization"}</p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-muted/40 rounded-xl border border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase">Website</p>
                    <p className="text-sm font-semibold text-foreground">{company?.careersWebsite || user?.companyWebsite || "Not set"}</p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-muted/40 rounded-xl border border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase">Location / HQ</p>
                    <p className="text-sm font-semibold text-foreground">{company?.headquarters || "Not set"}</p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-muted/40 rounded-xl border border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase">Team Size / Industry</p>
                    <p className="text-sm font-semibold text-foreground">
                      {company?.companySize ? `${company.companySize} employees` : (user?.companySize || "Not specified")} {company?.industry ? `• ${company.industry}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileDialog 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        user={user} 
        mutate={mutate} 
      />
    </div>
  );
}
