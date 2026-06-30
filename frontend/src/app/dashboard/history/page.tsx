"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { History, Eye, Trash2, ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

type AtsHistoryItem = {
  id: number;
  bestRole: string;
  atsScore: number;
  createdAt: string;
};

export default function ResumeHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<AtsHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete Modal State
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/history/ats");
        setHistory(response.data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const showToast = (text: string, type: "success" | "error") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleView = (item: AtsHistoryItem) => {
    router.push(`/dashboard/ats/analysis/${item.id}`);
  };

  const promptDelete = (id: number) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = async () => {
    if (deleteTargetId === null) return;
    setIsDeleting(true);
    try {
      await api.delete(`/ats/${deleteTargetId}`);
      setHistory(prev => prev.filter(item => item.id !== deleteTargetId));
      showToast("Analysis record deleted successfully", "success");
    } catch (err) {
      console.error("Failed to delete record", err);
      showToast("Failed to delete history record.", "error");
    } finally {
      setIsDeleting(false);
      setDeleteTargetId(null);
    }
  };

  const averageScore = history.length > 0 
    ? (history.reduce((acc, curr) => acc + curr.atsScore, 0) / history.length).toFixed(1)
    : 0;
  
  const highestScore = history.length > 0
    ? Math.max(...history.map(h => h.atsScore))
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalScaleIn {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold font-heading text-foreground">Resume Analysis History</h1>
          <p className="text-muted-foreground">Track your improvement across all resume versions.</p>
        </div>
        <Link href="/dashboard/ats">
           <Button className="bg-primary hover:bg-primary/90">Analyze New Resume</Button>
        </Link>
      </div>

      <Card className="border-none shadow-sm bg-card overflow-hidden">
         <Table>
            <TableHeader className="bg-muted">
               <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-foreground">Best Role Suggestion</TableHead>
                  <TableHead className="font-bold text-foreground text-center">ATS Score</TableHead>
                  <TableHead className="font-bold text-foreground">Upload Date</TableHead>
                  <TableHead className="font-bold text-foreground text-right">Actions</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {history.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={4} className="text-center py-12 text-muted-foreground font-medium">
                     No analysis history found. Start by uploading a resume!
                   </TableCell>
                 </TableRow>
               ) : (
                 history.map((resume) => (
                    <TableRow key={resume.id} className="hover:bg-muted/50 transition-colors">
                       <TableCell>
                          <span className="text-sm font-semibold text-muted-foreground bg-muted px-2 py-1 rounded">
                             {resume.bestRole}
                          </span>
                       </TableCell>
                       <TableCell className="text-center">
                          <Badge className={`${resume.atsScore > 70 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} hover:bg-opacity-100 border-none px-3 py-1 font-bold`}>
                             {resume.atsScore}%
                          </Badge>
                       </TableCell>
                       <TableCell className="text-muted-foreground text-sm">
                         {new Date(resume.createdAt).toLocaleDateString()}
                       </TableCell>
                       <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                             <Button 
                               variant="ghost" 
                               size="icon" 
                               className="text-muted-foreground/70 hover:text-primary hover:bg-primary/5"
                               onClick={() => handleView(resume)}
                             >
                                <Eye className="w-4 h-4" />
                             </Button>
                             <Button 
                               variant="ghost" 
                               size="icon" 
                               className="text-muted-foreground/70 hover:text-red-500 hover:bg-red-50"
                               onClick={() => promptDelete(resume.id)}
                             >
                                <Trash2 className="w-4 h-4" />
                             </Button>
                          </div>
                       </TableCell>
                    </TableRow>
                 ))
               )}
            </TableBody>
         </Table>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="border-none shadow-sm bg-card p-6 relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
               <div className="flex justify-between items-start">
                  <div className="p-2 bg-primary/10 rounded-lg">
                     <History className="w-6 h-6 text-primary" />
                  </div>
                  <ArrowUpRight className="w-6 h-6 text-muted-foreground opacity-40 group-hover:opacity-100 group-hover:text-primary transition-opacity" />
               </div>
               <div>
                  <h3 className="text-3xl font-black text-foreground">{history.length}</h3>
                  <p className="text-muted-foreground/70 font-bold uppercase text-[10px] tracking-widest">Total Analyses</p>
               </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
         </Card>

         <Card className="border-none shadow-sm bg-card p-6 space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">Average ATS Score</h3>
            <div className="flex items-baseline gap-2">
               <span className="text-4xl font-black text-foreground tracking-tight">{averageScore}</span>
               <span className="text-muted-foreground/70 font-bold">%</span>
            </div>
            <Progress value={Number(averageScore)} className="h-2 bg-muted" />
         </Card>

         <Card className="border-none shadow-sm bg-card p-6 space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">Highest ATS Score</h3>
            <div className="flex items-baseline gap-2 text-green-600">
               <span className="text-4xl font-black tracking-tight">{highestScore}</span>
               <span className="font-bold">%</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
               <CheckCircle2 className="w-4 h-4 text-green-500" />
               Based on all attempts
            </div>
         </Card>
      </div>


      {/* Delete Confirmation Modal */}
      {deleteTargetId !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          style={{ animation: 'modalFadeIn 0.2s ease-out' }}
        >
          <div 
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col"
            style={{ animation: 'modalScaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-border flex justify-between items-center bg-red-50/10">
              <h3 className="text-lg font-bold font-heading text-red-600 flex items-center gap-2">
                Delete Analysis
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setDeleteTargetId(null)} className="text-muted-foreground hover:text-foreground">
                ✕
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-foreground/80 leading-relaxed">
                Are you sure you want to delete this resume analysis record? This action is permanent and cannot be undone.
              </p>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/10">
              <Button 
                variant="outline"
                onClick={() => setDeleteTargetId(null)} 
                disabled={isDeleting}
                className="px-5 border-border hover:bg-muted text-foreground"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white px-5"
              >
                {isDeleting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                  </span>
                ) : (
                  "Delete Record"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Toast Notification */}
      {toastMessage && (
        <div 
          className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl border shadow-2xl backdrop-blur-md"
          style={{ 
            animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            backgroundColor: toastMessage.type === 'success' ? 'rgba(240, 253, 244, 0.95)' : 'rgba(254, 242, 242, 0.95)',
            borderColor: toastMessage.type === 'success' ? '#bbf7d0' : '#fecaca',
            color: toastMessage.type === 'success' ? '#166534' : '#991b1b'
          }}
        >

          <span className="text-sm font-semibold tracking-tight">{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
