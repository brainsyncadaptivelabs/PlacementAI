"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your personal and academic details.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-primary/10">
               <AvatarImage src={previewImage || user?.profileImage || ""} />
               <AvatarFallback className="text-2xl bg-[#172033] text-foreground">
                 {user?.fullName ? (
                   user.fullName.trim().split(/\s+/).filter(Boolean).length === 1 
                   ? user.fullName.trim().substring(0, 2).toUpperCase()
                   : (user.fullName.trim().split(/\s+/).filter(Boolean)[0][0] + user.fullName.trim().split(/\s+/).filter(Boolean)[1][0]).toUpperCase()
                 ) : 'U'}
               </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
               <input 
                 type="file" 
                 accept="image/*" 
                 className="hidden" 
                 ref={fileInputRef} 
                 onChange={handleImageChange}
               />
               <Button 
                 size="sm" 
                 variant="outline" 
                 className="border-primary text-primary hover:bg-primary/5"
                 onClick={() => fileInputRef.current?.click()}
               >
                 Change Photo
               </Button>
               <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">JPG, PNG or GIF. Max 1MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input id="full-name" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
             </div>
             <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" disabled value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
             </div>
             <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} />
             </div>
             <div className="space-y-2">
                <Label htmlFor="college">College</Label>
                <Input id="college" value={formData.collegeName} onChange={(e) => setFormData({...formData, collegeName: e.target.value})} />
             </div>
             <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Input id="branch" value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})} />
             </div>
             <div className="space-y-2">
                <Label htmlFor="grad-year">Graduation Year</Label>
                <Input id="grad-year" value={formData.graduationYear} onChange={(e) => setFormData({...formData, graduationYear: e.target.value})} />
             </div>
             <div className="space-y-2 md:col-span-2">
                <Label htmlFor="skills">Skills (Comma separated)</Label>
                <Input id="skills" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} placeholder="e.g. React, Java, Spring Boot" />
             </div>
             <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                <Input id="linkedin" value={formData.linkedinUrl} onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})} placeholder="https://linkedin.com/in/..." />
             </div>
             <div className="space-y-2">
                <Label htmlFor="github">GitHub Profile URL</Label>
                <Input id="github" value={formData.githubUrl} onChange={(e) => setFormData({...formData, githubUrl: e.target.value})} placeholder="https://github.com/..." />
             </div>
             <div className="space-y-2 md:col-span-2">
                <Label htmlFor="leetcode">LeetCode Profile URL</Label>
                <Input id="leetcode" value={formData.leetcodeUrl} onChange={(e) => setFormData({...formData, leetcodeUrl: e.target.value})} placeholder="https://leetcode.com/..." />
             </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
