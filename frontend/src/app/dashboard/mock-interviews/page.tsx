"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mic, MicOff, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, BarChart2, Mic2, Clock, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";

export default function MockInterviewPage() {
  const [view, setView] = useState<"setup" | "session" | "feedback">("setup");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setMessages] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [role, setRole] = useState("Java Developer");

  const startInterview = async (selectedRole: string) => {
    setRole(selectedRole);
    setIsLoading(true);
    try {
      const response = await api.post("/interview/mock", {
        role: selectedRole,
        experienceLevel: "Fresher"
      });
      setMessages(response.data.questions);
      setCurrentQuestionIndex(0);
      setView("session");
    } catch (error) {
      console.error("Failed to generate interview:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (view === "setup") {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Mic2 className="w-10 h-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-heading">AI Mock Interview</h1>
          <p className="text-muted-foreground max-w-md mx-auto">Practice with our AI and get real-time feedback on your technical and communication skills.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
          <Card 
            className={`p-6 cursor-pointer hover:border-primary transition-colors border-2 text-left ${role === "Java Developer" ? "border-primary bg-primary/5" : "border-transparent"}`}
            onClick={() => setRole("Java Developer")}
          >
            <h3 className="font-bold mb-1">Technical Interview</h3>
            <p className="text-xs text-muted-foreground">Java Developer Role • 10 Questions</p>
          </Card>
          <Card 
            className={`p-6 cursor-pointer hover:border-primary transition-colors border-2 text-left ${role === "HR Behavioral" ? "border-primary bg-primary/5" : "border-transparent"}`}
            onClick={() => setRole("HR Behavioral")}
          >
            <h3 className="font-bold mb-1">HR Interview</h3>
            <p className="text-xs text-muted-foreground">Behavioral Questions • 5 Questions</p>
          </Card>
        </div>
        <Button onClick={() => startInterview(role)} size="lg" className="px-12 py-6 text-lg" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          {isLoading ? "Generating..." : "Start Interview"}
        </Button>
      </div>
    );
  }

  if (view === "session") {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setView("setup")}>
                 <ChevronLeft className="w-4 h-4 mr-1" /> Back to Interviews
              </Button>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex flex-col">
                 <span className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider">Technical Interview</span>
                 <span className="text-sm font-semibold">{role}</span>
              </div>
           </div>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-muted-foreground bg-muted px-3 py-1 rounded-full text-sm font-medium">
                 <Clock className="w-4 h-4" /> 00:12:45
              </div>
              <Button variant="destructive" size="sm" onClick={() => setView("feedback")} className="bg-red-500 hover:bg-red-600">
                 End Interview
              </Button>
           </div>
        </div>

        <Card className="border-none shadow-xl bg-card overflow-hidden min-h-[400px] flex flex-col">
           <div className="p-6 border-b border-border bg-muted/30">
              <span className="text-xs font-bold text-primary mb-2 block">Question {currentQuestionIndex + 1} / {questions.length}</span>
              <h2 className="text-xl font-bold text-foreground leading-relaxed">
                {questions[currentQuestionIndex]}
              </h2>
           </div>
           <CardContent className="flex-1 p-8 flex flex-col">
              <div className="flex-1 flex flex-col space-y-4">
                 <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-muted-foreground">Your Answer</label>
                    {isRecording && (
                       <span className="flex items-center gap-2 text-red-500 text-xs font-bold animate-pulse">
                          <div className="w-2 h-2 rounded-full bg-red-500" /> LISTENING...
                       </span>
                    )}
                 </div>
                 <Textarea 
                    placeholder="Start typing or speak your answer..." 
                    className="flex-1 min-h-[200px] border-none bg-muted/50 p-6 text-lg focus-visible:ring-primary/20 resize-none shadow-inner"
                 />
              </div>
              <div className="pt-8 flex items-center justify-between">
                 <Button 
                   variant="ghost" 
                   onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                   disabled={currentQuestionIndex === 0}
                 >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                 </Button>
                 <Button 
                   onClick={() => setIsRecording(!isRecording)}
                   className={`w-16 h-16 rounded-full shadow-lg transition-all ${isRecording ? 'bg-red-500 hover:bg-red-600 scale-110' : 'bg-primary hover:bg-primary/90'}`}
                 >
                    {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                 </Button>
                 <Button 
                   className="bg-slate-900 hover:bg-slate-800 px-8"
                   onClick={() => {
                     if (currentQuestionIndex < questions.length - 1) {
                       setCurrentQuestionIndex(prev => prev + 1);
                     } else {
                       setView("feedback");
                     }
                   }}
                 >
                    {currentQuestionIndex < questions.length - 1 ? "Next" : "Finish"} <ChevronRight className="w-4 h-4 ml-2" />
                 </Button>
              </div>
           </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
       <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setView("setup")}>
             <ChevronLeft className="w-4 h-4 mr-1" /> Back to Interviews
          </Button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Feedback Card */}
          <Card className="md:col-span-2 border-none shadow-sm overflow-hidden">
             <div className="bg-primary/5 p-8 flex flex-col items-center text-center space-y-4">
                <div className="relative w-32 h-32">
                   <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="2.5"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="2.5"
                        strokeDasharray="76, 100"
                        strokeLinecap="round"
                      />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-primary">76</span>
                      <span className="text-[10px] font-bold text-muted-foreground/70">/100</span>
                   </div>
                </div>
                <div className="space-y-1">
                   <h2 className="text-xl font-bold font-heading">Good Effort!</h2>
                   <p className="text-sm text-muted-foreground">You&apos;ve shown strong technical knowledge.</p>
                </div>
                <div className="flex gap-2 pt-2">
                   <Button size="sm" className="bg-primary px-6">Feedback</Button>
                   <Button size="sm" variant="ghost" className="text-muted-foreground">Suggested Answer</Button>
                </div>
             </div>
             <CardContent className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <h3 className="font-bold text-sm text-green-600 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> What you did well
                   </h3>
                   <ul className="space-y-3">
                      <li className="text-sm text-muted-foreground flex gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                         Good explanation of core concepts
                      </li>
                      <li className="text-sm text-muted-foreground flex gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                         Clear and structured answer flow
                      </li>
                   </ul>
                </div>
                <div className="space-y-4">
                   <h3 className="font-bold text-sm text-amber-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> What you can improve
                   </h3>
                   <ul className="space-y-3">
                      <li className="text-sm text-muted-foreground flex gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                         Add more real-world examples
                      </li>
                      <li className="text-sm text-muted-foreground flex gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                         Improve depth in technical details
                      </li>
                      <li className="text-sm text-muted-foreground flex gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                         Work on communication & clarity
                      </li>
                   </ul>
                </div>
             </CardContent>
          </Card>

          {/* Metrics Sidebar */}
          <Card className="border-none shadow-sm h-fit">
             <CardHeader>
                <CardTitle className="text-lg font-bold font-heading flex items-center gap-2">
                   <BarChart2 className="w-5 h-5 text-primary" /> Metrics
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
                {[
                  { label: "Content", score: 78 },
                  { label: "Communication", score: 72 },
                  { label: "Technical Depth", score: 75 },
                  { label: "Problem Solving", score: 78 },
                ].map((m) => (
                  <div key={m.label} className="space-y-2">
                     <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <span>{m.label}</span>
                        <span>{m.score}/100</span>
                     </div>
                     <Progress value={m.score} className="h-2" />
                  </div>
                ))}
                <div className="pt-4">
                   <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/5">
                      Review Questions
                   </Button>
                </div>
             </CardContent>
          </Card>
       </div>
    </div>
  );
}

