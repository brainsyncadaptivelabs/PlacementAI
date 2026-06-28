"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User, Mail, Calendar, Building, Book, GraduationCap, Code2, Shield, CheckCircle2, Star, Camera, Save } from "lucide-react";
import api from "@/lib/api";
import { UserProfile } from "@/hooks/use-user";
import { toast } from "@/store/toast-store";

export function EditProfileDialog({
  open,
  onOpenChange,
  user,
  mutate
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
  mutate: () => Promise<void>;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    collegeName: "",
    branch: "",
    graduationYear: "",
    dateOfBirth: "",
    skills: "",
    linkedinUrl: "",
    githubUrl: "",
    leetcodeUrl: ""
  });

  useEffect(() => {
    if (user && open) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        collegeName: user.collegeName || "",
        branch: user.branch || "",
        graduationYear: user.graduationYear?.toString() || "",
        dateOfBirth: user.dateOfBirth || "",
        skills: user.skills || "",
        linkedinUrl: user.linkedinUrl || "",
        githubUrl: user.githubUrl || "",
        leetcodeUrl: user.leetcodeUrl || ""
      });
      setPreviewImage(null);
    }
  }, [user, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (fileInputRef.current?.files?.[0]) {
        const imageFormData = new FormData();
        imageFormData.append("file", fileInputRef.current.files[0]);
        await api.post("/profile/upload-image", imageFormData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      await api.put("/profile/update", {
        fullName: formData.fullName,
        collegeName: formData.collegeName,
        branch: formData.branch,
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : null,
        dateOfBirth: formData.dateOfBirth,
        skills: formData.skills,
        linkedinUrl: formData.linkedinUrl,
        githubUrl: formData.githubUrl,
        leetcodeUrl: formData.leetcodeUrl
      });

      await mutate();
      toast.success("Profile updated successfully!");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl w-[95vw] sm:w-[90vw] max-h-[90vh] overflow-hidden p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        
        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          {/* Left Sidebar */}
          <div className="w-full md:w-[320px] bg-slate-50/50 dark:bg-slate-950/50 border-r border-slate-100 dark:border-slate-800 p-8 flex flex-col gap-8 shrink-0 overflow-y-auto">
            {/* Avatar Section */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#6366f1] to-purple-400 rounded-full blur-md opacity-20"></div>
                <Avatar className="relative w-28 h-28 border-[3px] border-white dark:border-slate-800 shadow-lg bg-white dark:bg-slate-800 p-1">
                   <AvatarImage src={previewImage || user?.profileImage || ""} className="rounded-full object-cover" />
                   <AvatarFallback className="text-3xl bg-[#6366f1] text-white rounded-full">
                     {user?.fullName ? (
                       user.fullName.trim().split(/\s+/).filter(Boolean).length === 1 
                       ? user.fullName.trim().substring(0, 2).toUpperCase()
                       : (user.fullName.trim().split(/\s+/).filter(Boolean)[0][0] + user.fullName.trim().split(/\s+/).filter(Boolean)[1][0]).toUpperCase()
                     ) : 'U'}
                   </AvatarFallback>
                </Avatar>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-600 dark:text-slate-300 rounded-full p-2 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#6366f1] transition-colors z-10"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input 
                   type="file" 
                   accept="image/*" 
                   className="hidden" 
                   ref={fileInputRef} 
                   onChange={handleImageChange}
                 />
              </div>
              <div className="space-y-1.5">
                 <Button 
                   size="sm" 
                   variant="outline" 
                   className="text-[#6366f1] border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-[#6366f1]"
                   onClick={() => fileInputRef.current?.click()}
                 >
                   <Camera className="w-4 h-4 mr-2" /> Change Photo
                 </Button>
                 <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">JPG, PNG or GIF. Max 1MB.</p>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="space-y-2 w-full">
              <div className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-slate-200">
                <span>Profile Completion</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#6366f1] w-[85%] rounded-full"></div>
              </div>
              <div className="text-sm font-bold text-[#6366f1]">85% <span className="text-muted-foreground font-medium">Complete</span></div>
            </div>

            {/* Why Complete Profile */}
            <div className="bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Why complete your profile?
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Get better AI recommendations
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Increase mock interview matches
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Improve placement opportunities
                </div>
              </div>
            </div>

            {/* Decorative SVG Placeholder */}
            <div className="mt-auto pt-4 flex justify-center opacity-80">
               <svg width="160" height="120" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                 {/* A simple abstract geometric representation to stand in for the illustration */}
                 <rect x="40" y="80" width="120" height="40" rx="4" fill="#E0E7FF"/>
                 <rect x="50" y="70" width="100" height="20" rx="2" fill="#C7D2FE"/>
                 <rect x="70" y="30" width="60" height="50" rx="4" fill="#818CF8"/>
                 <circle cx="100" cy="55" r="15" fill="#4F46E5" fillOpacity="0.8"/>
                 <path d="M40 120 L160 120 L150 140 L50 140 Z" fill="#6366F1" fillOpacity="0.7"/>
                 <circle cx="160" cy="40" r="4" fill="#C7D2FE"/>
                 <circle cx="30" cy="60" r="3" fill="#E0E7FF"/>
                 <circle cx="140" cy="20" r="5" fill="#818CF8"/>
               </svg>
            </div>
          </div>

          {/* Right Form Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <DialogHeader className="p-8 pb-4 shrink-0 border-b border-slate-100 dark:border-slate-800">
              <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">Edit Profile</DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">Update your personal and academic details.</DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-8 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                 <div className="space-y-2">
                    <Label htmlFor="full-name" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium text-xs"><User className="w-3.5 h-3.5 text-[#6366f1]" /> Full Name</Label>
                    <Input id="full-name" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 dark:text-slate-200 h-11 focus-visible:ring-[#6366f1]/20 rounded-xl" />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium text-xs"><Mail className="w-3.5 h-3.5 text-[#6366f1]" /> Email Address</Label>
                    <Input id="email" disabled value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 h-11 rounded-xl text-slate-500 dark:text-slate-400" />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="dob" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium text-xs"><Calendar className="w-3.5 h-3.5 text-[#6366f1]" /> Date of Birth</Label>
                    <Input id="dob" type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} className="bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 dark:text-slate-200 h-11 focus-visible:ring-[#6366f1]/20 rounded-xl" />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="college" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium text-xs"><Building className="w-3.5 h-3.5 text-[#6366f1]" /> College</Label>
                    <Input id="college" value={formData.collegeName} onChange={(e) => setFormData({...formData, collegeName: e.target.value})} className="bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 dark:text-slate-200 h-11 focus-visible:ring-[#6366f1]/20 rounded-xl" />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="branch" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium text-xs"><Book className="w-3.5 h-3.5 text-[#6366f1]" /> Branch</Label>
                    <Input id="branch" value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})} className="bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 dark:text-slate-200 h-11 focus-visible:ring-[#6366f1]/20 rounded-xl" />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="grad-year" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium text-xs"><GraduationCap className="w-3.5 h-3.5 text-[#6366f1]" /> Graduation Year</Label>
                    <Input id="grad-year" value={formData.graduationYear} onChange={(e) => setFormData({...formData, graduationYear: e.target.value})} className="bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 dark:text-slate-200 h-11 focus-visible:ring-[#6366f1]/20 rounded-xl" />
                 </div>
                 <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="skills" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium text-xs"><Code2 className="w-3.5 h-3.5 text-[#6366f1]" /> Skills (Comma separated)</Label>
                    <Input id="skills" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} placeholder="e.g. React, Java, Spring Boot" className="bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 dark:text-slate-200 h-11 focus-visible:ring-[#6366f1]/20 rounded-xl" />
                 </div>
                 
                 <div className="space-y-2">
                    <Label htmlFor="linkedin" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium text-xs">
                      <svg className="w-3.5 h-3.5 text-[#0a66c2]" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                      LinkedIn Profile URL
                    </Label>
                    <Input id="linkedin" value={formData.linkedinUrl} onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})} placeholder="https://linkedin.com/in/..." className="bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 dark:text-slate-200 h-11 focus-visible:ring-[#6366f1]/20 rounded-xl" />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="github" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium text-xs">
                      <svg className="w-3.5 h-3.5 text-slate-800" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                      GitHub Profile URL
                    </Label>
                    <Input id="github" value={formData.githubUrl} onChange={(e) => setFormData({...formData, githubUrl: e.target.value})} placeholder="https://github.com/..." className="bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 dark:text-slate-200 h-11 focus-visible:ring-[#6366f1]/20 rounded-xl" />
                 </div>
                 <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="leetcode" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium text-xs"><Code2 className="w-3.5 h-3.5 text-[#ffa116]" /> LeetCode Profile URL</Label>
                    <Input id="leetcode" value={formData.leetcodeUrl} onChange={(e) => setFormData({...formData, leetcodeUrl: e.target.value})} placeholder="https://leetcode.com/..." className="bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 dark:text-slate-200 h-11 focus-visible:ring-[#6366f1]/20 rounded-xl" />
                 </div>

                 {/* Security Banner */}
                 <div className="md:col-span-2 mt-4 bg-[#f8f9ff] dark:bg-indigo-950/10 border border-indigo-100/60 dark:border-indigo-900/20 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden shadow-sm">
                    <div className="bg-[#6366f1] p-2.5 rounded-xl shrink-0 z-10 shadow-md shadow-indigo-500/20">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div className="z-10">
                      <h4 className="text-[13px] font-bold text-[#6366f1] dark:text-indigo-400 mb-0.5">Your information is secure</h4>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">We keep your data safe and never share it with anyone.</p>
                    </div>
                    <Shield className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-500/5 z-0" />
                 </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0 bg-slate-50/30 dark:bg-slate-900/50">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl h-11 px-6 font-semibold">Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl h-11 px-6 shadow-md shadow-indigo-500/20 font-semibold">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
