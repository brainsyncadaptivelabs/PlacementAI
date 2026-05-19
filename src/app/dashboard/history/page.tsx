"use client";

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
import { History, Eye, Download, Trash2, ArrowUpRight, CheckCircle2, FileText } from "lucide-react";
import Link from "next/link";

const resumeHistory = [
  { id: 1, name: "Software_Eng_Resume_v1.pdf", score: 62, role: "Full Stack Developer", date: "10 May 2026" },
  { id: 2, name: "Java_Developer_Resume.pdf", score: 78, role: "Backend Engineer", date: "12 May 2026" },
  { id: 3, name: "Data_Science_Resume_Final.pdf", score: 55, role: "Data Scientist", date: "14 May 2026" },
  { id: 4, name: "Product_Manager_Draft.pdf", score: 71, role: "Product Manager", date: "15 May 2026" },
];

export default function ResumeHistoryPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold font-heading text-slate-900">Resume Analysis History</h1>
          <p className="text-slate-500">Track your improvement across all resume versions.</p>
        </div>
        <Link href="/dashboard/ats">
           <Button className="bg-primary hover:bg-primary/90">Analyze New Resume</Button>
        </Link>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
         <Table>
            <TableHeader className="bg-slate-50">
               <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-slate-700">Resume Name</TableHead>
                  <TableHead className="font-bold text-slate-700 text-center">ATS Score</TableHead>
                  <TableHead className="font-bold text-slate-700">Best Role Suggestion</TableHead>
                  <TableHead className="font-bold text-slate-700">Upload Date</TableHead>
                  <TableHead className="font-bold text-slate-700 text-right">Actions</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {resumeHistory.map((resume) => (
                  <TableRow key={resume.id} className="hover:bg-slate-50/50 transition-colors">
                     <TableCell className="font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                           <FileText className="w-4 h-4 text-primary" />
                           {resume.name}
                        </div>
                     </TableCell>
                     <TableCell className="text-center">
                        <Badge className={`${resume.score > 70 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} hover:bg-opacity-100 border-none px-3 py-1 font-bold`}>
                           {resume.score}%
                        </Badge>
                     </TableCell>
                     <TableCell>
                        <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                           {resume.role}
                        </span>
                     </TableCell>
                     <TableCell className="text-slate-500 text-sm">{resume.date}</TableCell>
                     <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary hover:bg-primary/5">
                              <Eye className="w-4 h-4" />
                           </Button>
                           <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-500 hover:bg-blue-50">
                              <Download className="w-4 h-4" />
                           </Button>
                           <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                           </Button>
                        </div>
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="border-none shadow-sm bg-gradient-to-br from-primary to-secondary text-white p-6 relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
               <div className="flex justify-between items-start">
                  <div className="p-2 bg-white/20 rounded-lg">
                     <History className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity" />
               </div>
               <div>
                  <h3 className="text-3xl font-black">4</h3>
                  <p className="text-white/80 font-semibold uppercase text-[10px] tracking-widest">Total Analyses</p>
               </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
         </Card>

         <Card className="border-none shadow-sm bg-white p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Average ATS Score</h3>
            <div className="flex items-baseline gap-2">
               <span className="text-4xl font-black text-slate-900 tracking-tight">67.5</span>
               <span className="text-slate-400 font-bold">%</span>
            </div>
            <Progress value={67.5} className="h-2 bg-slate-100" />
         </Card>

         <Card className="border-none shadow-sm bg-white p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Highest ATS Score</h3>
            <div className="flex items-baseline gap-2 text-green-600">
               <span className="text-4xl font-black tracking-tight">78</span>
               <span className="font-bold">%</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
               <CheckCircle2 className="w-4 h-4 text-green-500" />
               Achieved on 12 May 2026
            </div>
         </Card>
      </div>
    </div>
  );
}
