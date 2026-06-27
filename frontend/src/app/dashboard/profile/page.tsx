"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Share2, Code2, Activity, FileText, CheckCircle, Award, LayoutGrid, Check, X, Edit2, Plus } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { EditProfileDialog } from "./edit-profile-dialog";
import { ShareProfileDialog } from "./share-profile-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRef } from "react";
import api from "@/lib/api";
import { toast } from "@/store/toast-store";

export default function ProfileDashboard() {
  const { user, loading, mutate } = useUser();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingPlatform, setEditingPlatform] = useState<'linkedin' | 'leetcode' | 'github' | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSavingLink, setIsSavingLink] = useState(false);

  const handleSaveLink = async (platform: 'linkedin' | 'leetcode' | 'github') => {
    setIsSavingLink(true);
    try {
      const updatedData = {
        fullName: user?.fullName || "",
        profileImage: user?.profileImage || "",
        collegeName: user?.collegeName || "",
        branch: user?.branch || "",
        graduationYear: user?.graduationYear || null,
        dateOfBirth: user?.dateOfBirth || null,
        skills: user?.skills || "",
        linkedinUrl: platform === 'linkedin' ? editValue : (user?.linkedinUrl || ""),
        githubUrl: platform === 'github' ? editValue : (user?.githubUrl || ""),
        leetcodeUrl: platform === 'leetcode' ? editValue : (user?.leetcodeUrl || ""),
      };

      await api.put("/user/profile", updatedData);
      await mutate();
      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} link updated!`);
      setEditingPlatform(null);
    } catch (error) {
      console.error("Failed to update link", error);
      toast.error(`Failed to update ${platform} link`);
    } finally {
      setIsSavingLink(false);
    }
  };

  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/v1/profile/dashboard-stats');
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);


  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Resume uploaded successfully!");
      // Optionally mutate user or fetch latest resume
    } catch (error) {
      console.error("Resume upload failed", error);
      toast.error("Failed to upload resume");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const skillsList = user?.skills ? user.skills.split(",").map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Banner */}
      <div className="bg-[#1e4a8c] px-8 py-10 text-white w-full">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-white/20">
                 <AvatarImage src={user?.profileImage || ""} />
                 <AvatarFallback className="text-3xl bg-black/20 text-white">
                   {user?.fullName ? (
                     user.fullName.trim().split(/\s+/).filter(Boolean).length === 1 
                     ? user.fullName.trim().substring(0, 2).toUpperCase()
                     : (user.fullName.trim().split(/\s+/).filter(Boolean)[0][0] + user.fullName.trim().split(/\s+/).filter(Boolean)[1][0]).toUpperCase()
                   ) : 'U'}
                 </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-xs font-bold tracking-widest text-white/70 uppercase">Profile Dashboard</p>
                <h1 className="text-3xl font-bold">{user?.fullName || "Update your name"}</h1>
                <div className="flex items-center gap-3 pt-3">
                  <Button variant="secondary" size="sm" className="bg-white text-[#1e4a8c] hover:bg-white/90" onClick={() => setIsEditOpen(true)}>
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="sm" className="border-white/30 text-white bg-transparent hover:bg-white/10 px-3" onClick={() => setIsShareOpen(true)}>
                    Share <Share2 className="w-3 h-3 ml-1.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Grid for Email, Profiles, Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/10 pt-6">
            <div className="space-y-6">
               <div className="flex flex-col gap-1">
                 <p className="text-xs font-semibold text-white/60 tracking-wider uppercase">Email ID</p>
                 <p className="text-base font-medium">{user?.email}</p>
               </div>
               {user?.collegeName && (
                 <div className="flex flex-col gap-1">
                   <p className="text-xs font-semibold text-white/60 tracking-wider uppercase">College Name</p>
                   <p className="text-base font-medium">{user.collegeName}</p>
                 </div>
               )}
               {user?.branch && (
                 <div className="flex flex-col gap-1">
                   <p className="text-xs font-semibold text-white/60 tracking-wider uppercase">Branch</p>
                   <p className="text-base font-medium">{user.branch}</p>
                 </div>
               )}
            </div>
            
            <div className="space-y-6">
               <div className="flex flex-col gap-2">
                 <p className="text-xs font-semibold text-white/60 tracking-wider uppercase">Profiles</p>
                  <div className="flex items-center flex-wrap gap-4">
                    {/* LinkedIn */}
                    {editingPlatform === 'linkedin' ? (
                      <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg p-1 text-white">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="LinkedIn URL"
                          className="bg-transparent border-none outline-none text-white w-40 text-xs px-2 py-0.5"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveLink('linkedin');
                            if (e.key === 'Escape') setEditingPlatform(null);
                          }}
                        />
                        <button 
                          onClick={() => handleSaveLink('linkedin')} 
                          disabled={isSavingLink}
                          className="hover:text-emerald-400 p-1 transition-colors"
                          title="Save"
                        >
                          {isSavingLink ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button 
                          onClick={() => setEditingPlatform(null)} 
                          className="hover:text-rose-400 p-1 transition-colors"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : user?.linkedinUrl ? (
                      <div className="group flex items-center gap-1.5">
                        <a href={user.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white hover:text-white/80 transition font-medium">
                          <svg className="w-5 h-5 text-[#0a66c2]" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> LinkedIn
                        </a>
                        <button 
                          onClick={() => { setEditingPlatform('linkedin'); setEditValue(user.linkedinUrl || ''); }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition-all duration-200"
                          title="Edit LinkedIn URL"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setEditingPlatform('linkedin'); setEditValue(''); }}
                        className="flex items-center gap-1.5 border border-dashed border-white/25 hover:border-white/50 text-white/60 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 transition-all duration-200"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add LinkedIn
                      </button>
                    )}

                    {/* LeetCode */}
                    {editingPlatform === 'leetcode' ? (
                      <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg p-1 text-white">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="LeetCode URL"
                          className="bg-transparent border-none outline-none text-white w-40 text-xs px-2 py-0.5"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveLink('leetcode');
                            if (e.key === 'Escape') setEditingPlatform(null);
                          }}
                        />
                        <button 
                          onClick={() => handleSaveLink('leetcode')} 
                          disabled={isSavingLink}
                          className="hover:text-emerald-400 p-1 transition-colors"
                          title="Save"
                        >
                          {isSavingLink ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button 
                          onClick={() => setEditingPlatform(null)} 
                          className="hover:text-rose-400 p-1 transition-colors"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : user?.leetcodeUrl ? (
                      <div className="group flex items-center gap-1.5">
                        <a href={user.leetcodeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white hover:text-white/80 transition font-medium">
                          <Code2 className="w-5 h-5 text-[#ffa116]" /> LeetCode
                        </a>
                        <button 
                          onClick={() => { setEditingPlatform('leetcode'); setEditValue(user.leetcodeUrl || ''); }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition-all duration-200"
                          title="Edit LeetCode URL"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setEditingPlatform('leetcode'); setEditValue(''); }}
                        className="flex items-center gap-1.5 border border-dashed border-white/25 hover:border-white/50 text-white/60 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 transition-all duration-200"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add LeetCode
                      </button>
                    )}

                    {/* GitHub */}
                    {editingPlatform === 'github' ? (
                      <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg p-1 text-white">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="GitHub URL"
                          className="bg-transparent border-none outline-none text-white w-40 text-xs px-2 py-0.5"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveLink('github');
                            if (e.key === 'Escape') setEditingPlatform(null);
                          }}
                        />
                        <button 
                          onClick={() => handleSaveLink('github')} 
                          disabled={isSavingLink}
                          className="hover:text-emerald-400 p-1 transition-colors"
                          title="Save"
                        >
                          {isSavingLink ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button 
                          onClick={() => setEditingPlatform(null)} 
                          className="hover:text-rose-400 p-1 transition-colors"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : user?.githubUrl ? (
                      <div className="group flex items-center gap-1.5">
                        <a href={user.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white hover:text-white/80 transition font-medium">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> GitHub
                        </a>
                        <button 
                          onClick={() => { setEditingPlatform('github'); setEditValue(user.githubUrl || ''); }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition-all duration-200"
                          title="Edit GitHub URL"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setEditingPlatform('github'); setEditValue(''); }}
                        className="flex items-center gap-1.5 border border-dashed border-white/25 hover:border-white/50 text-white/60 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 transition-all duration-200"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add GitHub
                      </button>
                    )}
                  </div>
               </div>

               <div className="flex flex-col gap-2">
                 <p className="text-xs font-semibold text-white/60 tracking-wider uppercase">Skills</p>
                 <div className="flex flex-wrap gap-2">
                   {skillsList.length > 0 ? (
                     skillsList.map((skill, i) => (
                       <span key={i} className="bg-white text-[#1e4a8c] px-3 py-1 rounded-full text-xs font-bold">
                         {skill}
                       </span>
                     ))
                   ) : (
                     <span className="text-sm text-white/50 italic">No skills added yet</span>
                   )}
                 </div>
               </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Dashboard */}
      <div className="flex-1 p-8 max-w-6xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           
           {/* Activity Card */}
           <Card className="col-span-1 border-border/50 shadow-sm">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-bold flex items-center text-muted-foreground uppercase tracking-wider">
                 <Activity className="w-4 h-4 mr-2" /> Activity
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="flex items-end gap-2 mb-6">
                 <div className="flex items-end gap-1 text-primary">
                    <div className="w-3 h-8 bg-primary/40 rounded-sm"></div>
                    <div className="w-3 h-12 bg-primary/60 rounded-sm"></div>
                    <div className="w-3 h-10 bg-primary/80 rounded-sm"></div>
                    <div className="w-3 h-16 bg-primary rounded-sm"></div>
                 </div>
                 <div className="ml-4 flex items-baseline gap-2">
                   <span className="text-5xl font-black text-foreground">{loadingStats ? "-" : stats?.activityStreakDays || 0}</span>
                   <span className="text-sm font-semibold text-muted-foreground uppercase">Days</span>
                 </div>
               </div>
               <p className="text-xs text-muted-foreground">
                 BASED ON <br/> Days of over 1.5 hours of activity on the platform.
               </p>
             </CardContent>
           </Card>

           {/* Questions Stats Card */}
           <Card className="col-span-1 md:col-span-1 border-border/50 shadow-sm">
             <CardHeader className="pb-0">
               <div className="flex gap-4 border-b border-border overflow-x-auto">
                 <button className="pb-2 border-b-2 border-primary font-semibold text-sm text-foreground whitespace-nowrap">All</button>
                 <button className="pb-2 text-muted-foreground font-semibold text-sm flex items-center gap-1 whitespace-nowrap">Coding <Badge variant="outline" className="text-[10px] py-0 h-4">Soon</Badge></button>
                 <button className="pb-2 text-muted-foreground font-semibold text-sm flex items-center gap-1 whitespace-nowrap">WebDev <Badge variant="outline" className="text-[10px] py-0 h-4">Soon</Badge></button>
                 <button className="pb-2 text-muted-foreground font-semibold text-sm flex items-center gap-1 whitespace-nowrap">Conceptual <Badge variant="outline" className="text-[10px] py-0 h-4">Soon</Badge></button>
               </div>
             </CardHeader>
             <CardContent className="pt-6 flex items-center justify-between gap-4">
                {/* Mock Circular Progress */}
                <div className="relative w-28 h-28 flex items-center justify-center rounded-full border-4 border-primary/20">
                  <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent transform -rotate-45"></div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total<br/>Questions</p>
                    <p className="text-xl font-black text-foreground">
                      {loadingStats ? "-" : (stats?.questionsEasy || 0) + (stats?.questionsMedium || 0) + (stats?.questionsHard || 0)}
                    </p>
                  </div>
                </div>
                {/* Stats Breakdown */}
                <div className="flex-1 space-y-3">
                   <div>
                     <div className="flex justify-between text-xs mb-1">
                       <span className="font-bold text-green-500">EASY</span>
                       <span className="text-muted-foreground">
                         {loadingStats ? "-" : Math.round(((stats?.questionsEasy || 0) / Math.max(1, (stats?.questionsEasy || 0) + (stats?.questionsMedium || 0) + (stats?.questionsHard || 0))) * 100)}% 
                         <span className="text-border">|</span> {loadingStats ? "-" : stats?.questionsEasy || 0}
                       </span>
                     </div>
                     <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                       <div className="h-full bg-green-500 transition-all" style={{ width: `${loadingStats ? 0 : Math.round(((stats?.questionsEasy || 0) / Math.max(1, (stats?.questionsEasy || 0) + (stats?.questionsMedium || 0) + (stats?.questionsHard || 0))) * 100)}%` }}></div>
                     </div>
                   </div>
                   <div>
                     <div className="flex justify-between text-xs mb-1">
                       <span className="font-bold text-yellow-500">MEDIUM</span>
                       <span className="text-muted-foreground">
                         {loadingStats ? "-" : Math.round(((stats?.questionsMedium || 0) / Math.max(1, (stats?.questionsEasy || 0) + (stats?.questionsMedium || 0) + (stats?.questionsHard || 0))) * 100)}% 
                         <span className="text-border">|</span> {loadingStats ? "-" : stats?.questionsMedium || 0}
                       </span>
                     </div>
                     <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                       <div className="h-full bg-yellow-500 transition-all" style={{ width: `${loadingStats ? 0 : Math.round(((stats?.questionsMedium || 0) / Math.max(1, (stats?.questionsEasy || 0) + (stats?.questionsMedium || 0) + (stats?.questionsHard || 0))) * 100)}%` }}></div>
                     </div>
                   </div>
                   <div>
                     <div className="flex justify-between text-xs mb-1">
                       <span className="font-bold text-red-500">HARD</span>
                       <span className="text-muted-foreground">
                         {loadingStats ? "-" : Math.round(((stats?.questionsHard || 0) / Math.max(1, (stats?.questionsEasy || 0) + (stats?.questionsMedium || 0) + (stats?.questionsHard || 0))) * 100)}% 
                         <span className="text-border">|</span> {loadingStats ? "-" : stats?.questionsHard || 0}
                       </span>
                     </div>
                     <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                       <div className="h-full bg-red-500 transition-all" style={{ width: `${loadingStats ? 0 : Math.round(((stats?.questionsHard || 0) / Math.max(1, (stats?.questionsEasy || 0) + (stats?.questionsMedium || 0) + (stats?.questionsHard || 0))) * 100)}%` }}></div>
                     </div>
                   </div>
                </div>
             </CardContent>
           </Card>

           {/* Resume Card */}
           <Card className="col-span-1 border-border/50 shadow-sm flex flex-col items-center text-center">
             <CardHeader className="w-full flex flex-row items-center justify-between pb-2">
               <CardTitle className="text-sm font-bold text-foreground">Resume</CardTitle>
               {stats?.resumeVerified && (
               <Badge className="bg-green-500 hover:bg-green-600 text-white border-none rounded-full px-3 py-0.5 shadow-none flex items-center gap-1">
                 <CheckCircle className="w-3 h-3" /> Verified
               </Badge>
               )}
             </CardHeader>
             <CardContent className="flex flex-col items-center gap-4 pt-4 w-full">
               <FileText className="w-16 h-16 text-primary/60" />
               <p className="font-semibold text-foreground">Manage Resume</p>
               <input type="file" hidden ref={fileInputRef} onChange={handleResumeUpload} accept=".pdf,.doc,.docx" />
               <Button 
                 className="w-full bg-[#1e4a8c] hover:bg-[#1e4a8c]/90 mt-2" 
                 onClick={() => fileInputRef.current?.click()}
                 disabled={isUploading}
               >
                 {isUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</> : "Upload New Resume"}
               </Button>
             </CardContent>
           </Card>

           {/* Bottom Row */}
           <Card className="col-span-1 md:col-span-1 border-border/50 shadow-sm">
             <CardHeader className="flex flex-row items-center justify-between pb-2">
               <CardTitle className="text-sm font-bold flex items-center text-muted-foreground uppercase tracking-wider">
                 <Award className="w-4 h-4 mr-2" /> Earned Badges
               </CardTitle>
               <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
             </CardHeader>
             <CardContent className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                No badges earned yet.
             </CardContent>
           </Card>

           <Card className="col-span-1 md:col-span-2 border-border/50 shadow-sm">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-bold flex items-center text-muted-foreground uppercase tracking-wider">
                 <LayoutGrid className="w-4 h-4 mr-2" /> Performance Heatmap
               </CardTitle>
             </CardHeader>
             <CardContent className="flex items-center justify-center py-8">
                {/* Mock Heatmap blocks */}
                <div className="flex gap-1 overflow-x-auto pb-2 opacity-90 w-full justify-center">
                   {loadingStats ? (
                     <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                   ) : (
                     [...Array(30)].map((_, col) => (
                       <div key={col} className="flex flex-col gap-1">
                          {[...Array(5)].map((_, row) => {
                             // Dynamic calculation based on actual heatmapData could go here
                             // For now we map some dynamic intensity based on data presence
                             const intensity = stats?.heatmapData?.length > col * 5 + row ? Math.random() : 0.1;
                             return (
                               <div key={row} className={`w-3 h-3 rounded-sm ${intensity > 0.8 ? 'bg-primary' : intensity > 0.6 ? 'bg-primary/60' : intensity > 0.4 ? 'bg-primary/30' : 'bg-border/40'}`}></div>
                             );
                          })}
                       </div>
                     ))
                   )}
                </div>
             </CardContent>
           </Card>

        </div>
      </div>

      <EditProfileDialog open={isEditOpen} onOpenChange={setIsEditOpen} user={user} mutate={mutate} />
      <ShareProfileDialog open={isShareOpen} onOpenChange={setIsShareOpen} user={user} />
    </div>
  );
}
