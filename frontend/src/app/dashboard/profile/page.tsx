"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useRef, useState } from "react";
import { PageShell } from "@/components/ui/theme-components";

export default function ProfilePage() {
  const { user, loading } = useUser();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [personalOpen, setPersonalOpen] = useState(true);
  const [academicOpen, setAcademicOpen] = useState(true);

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
    <PageShell className="max-w-4xl">
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-2xl font-bold font-heading text-foreground">Profile Information</h1>
        <p className="text-muted-foreground text-sm">Manage your personal account details.</p>
      </div>

      <div className="space-y-4">
        {/* Accordion Group container */}
        <div className="border border-white/5 rounded-3xl bg-[#0F172A] overflow-hidden shadow-lg">
          {/* Header 1 */}
          <div 
            onClick={() => setPersonalOpen(!personalOpen)}
            className="p-6 border-b border-white/5 flex flex-row items-center justify-between cursor-pointer select-none bg-black/10 hover:bg-black/20 transition-colors"
          >
             <h3 className="text-lg font-bold text-foreground">Personal Details</h3>
             {personalOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </div>
          {personalOpen && (
            <div className="p-6 space-y-6 border-b border-white/5">
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

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <Label htmlFor="full-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                     <Input id="full-name" defaultValue={user?.fullName || ""} />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                     <Input id="email" defaultValue={user?.email || ""} />
                  </div>
               </div>
            </div>
          )}

          {/* Header 2 */}
          <div 
            onClick={() => setAcademicOpen(!academicOpen)}
            className="p-6 flex flex-row items-center justify-between cursor-pointer select-none bg-black/10 hover:bg-black/20 transition-colors"
          >
             <h3 className="text-lg font-bold text-foreground">Academic Details</h3>
             {academicOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </div>
          {academicOpen && (
            <div className="p-6 space-y-6 border-t border-white/5">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <Label htmlFor="college" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">College</Label>
                     <Input id="college" defaultValue={user?.collegeName || ""} />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="branch" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Branch</Label>
                     <Input id="branch" defaultValue={user?.branch || ""} />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="grad-year" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Graduation Year</Label>
                     <Input id="grad-year" defaultValue={user?.graduationYear?.toString() || ""} />
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 flex justify-end">
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
    </PageShell>
  );
}
