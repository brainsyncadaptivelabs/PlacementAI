"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download, Building2, Loader2, Check } from "lucide-react";
import { UserProfile } from "@/hooks/use-user";
import { Card } from "@/components/ui/card";
import { toPng } from 'html-to-image';
import { toast } from "@/store/toast-store";

export function ShareProfileDialog({
  open,
  onOpenChange,
  user
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
}) {
  const [selectedOption, setSelectedOption] = useState("complete");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const options = [
    { id: "complete", title: "Complete Profile", desc: "Days of active engagement & Continuous Question Solving" },
    { id: "critical", title: "Critical Statistics", desc: "Activity, Streak and Performance Heatmap" },
    { id: "active", title: "Active Engagement", desc: "Days of over 1.5 hours of activity on the platform" },
    { id: "streak", title: "Streak", desc: "Days of Continuous Question Solving" },
    { id: "question", title: "Question Analysis", desc: "Activity, Streak and Performance Heatmap" },
    { id: "contest", title: "Contest Ranking", desc: "Activity, Streak and Performance Heatmap" },
    { id: "heatmap", title: "Heatmap", desc: "Performance Heatmap" },
  ];

  const handleDownload = async () => {
    if (previewRef.current === null) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${user?.fullName?.replace(/\s+/g, '_') || 'Profile'}_Stats.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Profile image downloaded successfully!");
    } catch (err) {
      console.error('Failed to export image', err);
      toast.error('Failed to download image.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/profile/${user?.id || 'unknown'}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIsCopied(true);
      toast.success("Profile URL copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const skillsList = user?.skills ? user.skills.split(",").map(s => s.trim()).filter(Boolean) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] lg:max-w-6xl max-h-[90vh] p-0 overflow-hidden flex flex-col md:flex-row bg-background rounded-xl">
        <DialogTitle className="sr-only">Share Your Profile</DialogTitle>
        
        {/* Left Sidebar */}
        <div className="w-full md:w-[350px] flex flex-col border-r border-border bg-background h-full max-h-[90vh] overflow-y-auto">
           <div className="p-6 border-b border-border flex items-center gap-2">
              <Share2 className="w-5 h-5 text-foreground" />
              <h2 className="text-xl font-bold text-foreground">Share Your Profile</h2>
           </div>
           
           <div className="flex-1 py-4">
              {options.map((opt) => (
                <div 
                  key={opt.id} 
                  className={`px-6 py-4 flex items-start gap-4 cursor-pointer hover:bg-muted/50 transition-colors ${selectedOption === opt.id ? "bg-muted/30" : ""}`}
                  onClick={() => setSelectedOption(opt.id)}
                >
                  <div className="flex-1">
                     <h3 className="font-bold text-foreground">{opt.title}</h3>
                     <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                  </div>
                  <div className="pt-1">
                     <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedOption === opt.id ? "border-primary" : "border-muted-foreground"}`}>
                        {selectedOption === opt.id && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                     </div>
                  </div>
                </div>
              ))}
           </div>

           <div className="p-4 border-t border-border flex flex-row gap-2">
              <Button variant="outline" size="sm" className="flex-1 border-primary text-primary hover:bg-primary/5" onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />} Download
              </Button>
              <Button size="sm" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleShare}>
                {isCopied ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />} {isCopied ? "Copied!" : "Share"}
              </Button>
           </div>
        </div>

        {/* Right Side Preview Panel */}
        <div className="flex-1 bg-muted/20 p-6 md:p-10 flex items-center justify-center overflow-y-auto h-full min-h-[500px]">
           <div ref={previewRef} className="w-full max-w-[800px] aspect-[16/9] bg-background border border-border dark:bg-[#111827] rounded-xl overflow-hidden relative shadow-lg flex flex-col">
              
              {/* Preview Header */}
              <div className="p-8 flex items-start justify-between z-10">
                 <div>
                    <div className="flex items-center gap-2 mb-8">
                       <Building2 className="w-8 h-8 text-primary" />
                       <span className="text-2xl font-bold text-foreground tracking-tight">PlacementAI</span>
                    </div>
                    <div className="flex gap-16">
                       <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">Name</p>
                          <p className="text-xl font-bold text-foreground">{user?.fullName}</p>
                       </div>
                       <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">Skills</p>
                          <p className="text-sm font-semibold text-foreground max-w-[200px] leading-tight">
                            {skillsList.length > 0 ? skillsList.join(", ") : "No skills added"}
                          </p>
                       </div>
                    </div>
                 </div>

                 {/* Preview Grid Cards */}
                 <div className="grid grid-cols-2 gap-4 w-[400px]">
                    
                    <Card className="p-4 bg-card border-border shadow-sm rounded-xl">
                       <p className="text-xs font-bold text-foreground mb-3">Activity Engagement</p>
                       <div className="flex items-end gap-3">
                          <div className="flex items-end gap-1 text-blue-500">
                             <div className="w-2 h-4 bg-blue-300 dark:bg-blue-500/40 rounded-sm"></div>
                             <div className="w-2 h-6 bg-blue-400 dark:bg-blue-500/60 rounded-sm"></div>
                             <div className="w-2 h-8 bg-blue-500 dark:bg-blue-500/80 rounded-sm"></div>
                             <div className="w-2 h-10 bg-blue-600 dark:bg-blue-500 rounded-sm"></div>
                          </div>
                          <div className="flex items-baseline gap-1">
                             <span className="text-3xl font-black text-foreground">5</span>
                             <span className="text-[10px] text-muted-foreground font-bold uppercase">Days</span>
                          </div>
                       </div>
                    </Card>

                    <Card className="p-4 bg-card border-border shadow-sm rounded-xl">
                       <p className="text-xs font-bold text-foreground mb-3">Streaks</p>
                       <div className="flex items-end gap-3">
                          <div className="flex items-end gap-1 text-red-500">
                             <div className="w-2 h-10 bg-red-500 dark:bg-red-500/80 rounded-sm"></div>
                             <div className="w-2 h-4 bg-red-400 dark:bg-red-500/40 rounded-sm"></div>
                             <div className="w-2 h-6 bg-red-500 dark:bg-red-500/60 rounded-sm"></div>
                             <div className="w-2 h-3 bg-red-300 dark:bg-red-500/30 rounded-sm"></div>
                          </div>
                          <div className="flex items-baseline gap-1">
                             <span className="text-3xl font-black text-foreground">2</span>
                             <span className="text-[10px] text-muted-foreground font-bold uppercase">Days</span>
                          </div>
                       </div>
                    </Card>

                    <Card className="p-4 bg-card border-border shadow-sm rounded-xl col-span-2 flex items-center justify-between">
                       <div className="w-1/3">
                         <p className="text-xs font-bold text-foreground mb-2">Question<br/>Analysis</p>
                         <p className="text-2xl font-black text-foreground leading-none">117</p>
                         <p className="text-[10px] text-muted-foreground">Questions Solved</p>
                       </div>
                       <div className="w-1/3 flex justify-center">
                          <div className="relative w-12 h-12 rounded-full border-4 border-green-400">
                             <div className="absolute inset-0 rounded-full border-4 border-t-yellow-400 border-r-transparent border-b-transparent border-l-transparent transform rotate-45"></div>
                          </div>
                       </div>
                       <div className="w-1/3 space-y-1">
                          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-400 rounded-sm"></div><span className="text-[10px] text-muted-foreground">Easy</span></div>
                          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-400 rounded-sm"></div><span className="text-[10px] text-muted-foreground">Medium</span></div>
                       </div>
                    </Card>

                    <Card className="p-4 bg-card border-border shadow-sm rounded-xl col-span-2">
                       <p className="text-xs font-bold text-foreground mb-3">Contest Ranking</p>
                       <div className="flex justify-between items-center pr-4">
                          <div>
                             <p className="text-2xl font-black text-foreground">NA</p>
                             <p className="text-[10px] text-muted-foreground">Avg. Rank</p>
                          </div>
                          <div>
                             <p className="text-2xl font-black text-foreground">NA</p>
                             <p className="text-[10px] text-muted-foreground">High Score</p>
                          </div>
                          <div>
                             <p className="text-[10px] text-muted-foreground">Latest Rank</p>
                          </div>
                       </div>
                    </Card>

                 </div>
              </div>

              {/* Bottom Mock Heatmap & Illustration */}
              <div className="mt-auto px-8 pb-6 flex items-end justify-between z-10">
                 
                 {/* Illustration placeholder */}
                 <div className="relative w-32 h-32 mb-[-1.5rem]">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
                      {/* Person sitting */}
                      <circle cx="100" cy="60" r="20" fill="#fcd34d" />
                      <rect x="70" y="80" width="60" height="60" rx="10" fill="#3b82f6" />
                      {/* Legs */}
                      <path d="M 60 140 Q 30 140 30 160 Q 30 180 50 180" fill="none" stroke="#8b5cf6" strokeWidth="15" strokeLinecap="round" />
                      <path d="M 140 140 Q 170 140 170 160 Q 170 180 150 180" fill="none" stroke="#8b5cf6" strokeWidth="15" strokeLinecap="round" />
                      {/* Laptop */}
                      <rect x="65" y="100" width="70" height="40" rx="2" fill="#e2e8f0" />
                      {/* Plant */}
                      <rect x="170" y="150" width="20" height="30" fill="#92400e" />
                      <path d="M 180 150 Q 160 110 180 120 Q 200 110 180 150" fill="#22c55e" />
                    </svg>
                 </div>

                 {/* Heatmap */}
                 <Card className="bg-card border-border shadow-sm rounded-xl p-4 w-[400px]">
                    <div className="flex justify-between text-[8px] text-muted-foreground mb-2 uppercase font-bold">
                       <span>December</span><span>January</span><span>February</span><span>March</span><span>April</span><span>May</span><span>June</span>
                    </div>
                    <div className="flex gap-1 overflow-hidden opacity-30">
                       {[...Array(25)].map((_, col) => (
                         <div key={col} className="flex flex-col gap-1">
                            {[...Array(5)].map((_, row) => (
                              <div key={row} className={`w-[6px] h-[6px] rounded-[1px] ${Math.random() > 0.8 ? 'bg-primary' : 'bg-primary/20'}`}></div>
                            ))}
                         </div>
                       ))}
                    </div>
                 </Card>
              </div>

              {/* Background abstract shape */}
              <div className="absolute inset-0 z-0 opacity-10 pointer-events-none overflow-hidden">
                 <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[150%] bg-gradient-to-r from-primary to-transparent transform -skew-x-12"></div>
              </div>

           </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
