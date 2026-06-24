"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useRef, useState } from "react";

export default function ProfilePage() {
  const { user, loading } = useUser();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate an API call to the backend
    setTimeout(() => {
      setIsSaving(false);
      alert("Profile updated successfully!");
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold font-heading text-foreground">Profile Information</h1>
        <p className="text-muted-foreground">Manage your personal account details.</p>
      </div>

      <Card className="border-none shadow-sm bg-card">
         <CardHeader className="p-8 border-b border-border/40">
            <CardTitle className="text-lg font-bold font-heading text-foreground">Personal Details</CardTitle>
         </CardHeader>
         <CardContent className="p-8 space-y-8">
            <div className="flex items-center gap-6">
               <Avatar className="w-24 h-24 border-4 border-primary/10">
                  <AvatarImage src={previewImage || user?.profileImage || ""} />
                  <AvatarFallback className="text-2xl bg-muted text-foreground">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <Label htmlFor="full-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                  <Input id="full-name" defaultValue={user?.fullName || ""} className="bg-background border-input focus-visible:ring-primary/20" />
               </div>
               <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                  <Input id="email" defaultValue={user?.email || ""} className="bg-background border-input focus-visible:ring-primary/20" />
               </div>
               <div className="space-y-2">
                  <Label htmlFor="college" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">College</Label>
                  <Input id="college" defaultValue={user?.collegeName || ""} className="bg-background border-input focus-visible:ring-primary/20" />
               </div>
               <div className="space-y-2">
                  <Label htmlFor="branch" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Branch</Label>
                  <Input id="branch" defaultValue={user?.branch || ""} className="bg-background border-input focus-visible:ring-primary/20" />
               </div>
               <div className="space-y-2">
                  <Label htmlFor="grad-year" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Graduation Year</Label>
                  <Input id="grad-year" defaultValue={user?.graduationYear?.toString() || ""} className="bg-background border-input focus-visible:ring-primary/20" />
               </div>
            </div>

            <div className="pt-4 flex justify-end">
               <Button 
                 onClick={handleSave}
                 disabled={isSaving}
                 className="bg-primary hover:bg-primary/90 px-10 py-6 text-base shadow-lg shadow-primary/20 text-primary-foreground min-w-[160px]"
               >
                 {isSaving ? (
                   <>
                     <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                     Saving...
                   </>
                 ) : (
                   "Save Changes"
                 )}
               </Button>
            </div>
         </CardContent>
      </Card>
    </div>
  );
}
