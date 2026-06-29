"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useConversation } from "@elevenlabs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Mic, MicOff, PhoneOff, Play, Pause, ChevronLeft, ChevronRight, PlayCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { interviewService } from "../services/interviewService";
import { MockInterview, InterviewQuestion } from "../types/interview.types";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface InterviewSessionProps {
  userName: string;
  interviewData: {
    role: string;
    questions: string[];
    experienceLevel: string;
    company?: string;
    difficulty?: string;
    interviewType?: string;
  };
}

export const InterviewSession = ({
  userName,
  interviewData,
}: InterviewSessionProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesRef = useRef<SavedMessage[]>([]);

  // Timer States
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  // Fallback / Text Mode States
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Code Playground States
  const [activeLang, setActiveLang] = useState<string>("javascript");
  const [code, setCode] = useState(`// Write your code solution here\n\nfunction solution() {\n  console.log("Hello placement environment!");\n}\nsolution();`);
  const [terminalOutput, setTerminalOutput] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const isCodingRound = interviewData.interviewType === "DSA Coding" || 
                        (interviewData.role && interviewData.role.toLowerCase().indexOf("coding") !== -1) ||
                        (interviewData.role && interviewData.role.toLowerCase().indexOf("dsa") !== -1);

  const conversation = useConversation({
    onConnect: () => {
      setCallStatus(CallStatus.ACTIVE);
    },
    onDisconnect: () => {
      setCallStatus(CallStatus.FINISHED);
    },
    onMessage: (message) => {
      const role = message.source === "user" ? "user" : "assistant";
      const newMessage: SavedMessage = { role, content: message.message };
      setMessages((prev) => [...prev, newMessage]);
      if (role === "assistant") {
        setLastMessage(message.message);
      }
    },
    onError: (error) => {
      console.error("ElevenLabs Error:", error);
      startLocalFallback();
    },
  });

  const { isSpeaking, startSession, endSession } = conversation;

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, []);

  const speakLocal = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const startLocalFallback = () => {
    setIsFallbackMode(true);
    setCallStatus(CallStatus.ACTIVE);
    setCurrentQuestionIndex(0);
    setTypedAnswer("");
    
    if (interviewData.questions.length > 0) {
      const firstQuestion = interviewData.questions[0];
      const firstMsg: SavedMessage = { role: "assistant", content: firstQuestion };
      setMessages([firstMsg]);
      setLastMessage(firstQuestion);
      speakLocal(firstQuestion);
    }
  };

  const startLocalRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Web Speech API is not supported in this browser. Please type your answer.");
      return;
    }
    
    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      
      rec.onstart = () => {
        setIsRecording(true);
      };
      
      rec.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        const currentText = finalTranscript || interimTranscript;
        setTypedAnswer(currentText);
      };
      
      rec.onerror = (err: any) => {
        console.error("Speech recognition error:", err);
        setIsRecording(false);
      };
      
      rec.onend = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
    }
  };

  const stopLocalRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Skip, Previous, Next Navigation handlers
  const handleNext = () => {
    if (isRecording) stopLocalRecording();

    // Cache the typed/composed answer
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: typedAnswer.trim()
    }));

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < interviewData.questions.length) {
      setCurrentQuestionIndex(nextIndex);
      const nextQuestion = interviewData.questions[nextIndex];
      setLastMessage(nextQuestion);
      setTypedAnswer(answers[nextIndex] || "");
      speakLocal(nextQuestion);
    } else {
      setCallStatus(CallStatus.FINISHED);
      speakLocal("Mock interview completed successfully. Please generate your feedback report.");
    }
  };

  const handlePrev = () => {
    if (isRecording) stopLocalRecording();

    // Cache current before going back
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: typedAnswer.trim()
    }));

    const prevIndex = currentQuestionIndex - 1;
    if (prevIndex >= 0) {
      setCurrentQuestionIndex(prevIndex);
      const prevQuestion = interviewData.questions[prevIndex];
      setLastMessage(prevQuestion);
      setTypedAnswer(answers[prevIndex] || "");
      speakLocal(prevQuestion);
    }
  };

  const handleSkip = () => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: "[Skipped]"
    }));
    handleNext();
  };

  // Compile Code via Piston ws connection
  const runCode = () => {
    setIsExecuting(true);
    setTerminalOutput("Connecting to compile engine...\n");
    
    const wsHost = window.location.hostname;
    const wsUrl = `ws://${wsHost}:2000/api/v2/connect`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    const currentConfig = {
      javascript: { language: "javascript", filename: "main.js" },
      python: { language: "python", filename: "main.py" },
      java: { language: "java", filename: "Main.java" },
      "c++": { language: "c++", filename: "main.cpp" },
    }[activeLang] || { language: "javascript", filename: "main.js" };

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: "init",
        language: currentConfig.language,
        version: "*",
        files: [{ name: currentConfig.filename, content: code }]
      }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "data") {
        setTerminalOutput((prev) => prev + msg.data);
      } else if (msg.type === "exit") {
        setIsExecuting(false);
        setTerminalOutput((prev) => prev + `\n[Process exited with code ${msg.code ?? msg.signal}]`);
        ws.close();
      } else if (msg.type === "error") {
        setIsExecuting(false);
        setTerminalOutput((prev) => prev + `\n[Error: ${msg.message}]`);
        ws.close();
      }
    };

    ws.onerror = () => {
      setIsExecuting(false);
      setTerminalOutput((prev) => prev + "\n[Compiler Connection Error. Ensure Piston is running on port 2000.]");
    };

    ws.onclose = () => {
      setIsExecuting(false);
    };
  };

  const handleGenerateFeedback = useCallback(async () => {
    setIsGenerating(true);
    
    // Construct structured transcript matching all questions
    const transcript = interviewData.questions.map((q, i) => {
      const ansVal = answers[i] || "[No answer submitted]";
      return `Interviewer: ${q}\nCandidate: ${ansVal}`;
    }).join("\n\n");

    const questions: InterviewQuestion[] = interviewData.questions.map((q, i) => ({
      questionText: q,
      answerText: answers[i] || "",
      score: 0,
    }));

    const result: MockInterview = {
      role: interviewData.role,
      experienceLevel: interviewData.experienceLevel,
      company: interviewData.company,
      topic: interviewData.interviewType,
      transcript,
      questions,
    };

    try {
      const savedResult = await interviewService.saveResults(result);
      if (savedResult.id) {
        router.push(`/mock-interview/result/${savedResult.id}`);
      }
    } catch (error) {
      console.error("Failed to save interview results:", error);
      alert("Failed to generate feedback. Please try again.");
      setIsGenerating(false);
    }
  }, [interviewData, answers, router]);

  // Timer Effect
  useEffect(() => {
    if (callStatus !== CallStatus.ACTIVE || isTimerPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("Time limit reached. Auto-submitting mock interview results.");
          handleGenerateFeedback();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [callStatus, isTimerPaused, handleGenerateFeedback]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      if (!agentId) {
        throw new Error("ElevenLabs Agent ID not configured");
      }

      const formattedQuestions = interviewData.questions
        .map((q, i) => `${i + 1}. ${q}`)
        .join("\n");

      await startSession({
        agentId,
        dynamicVariables: {
          questions: formattedQuestions,
          user_name: userName,
          role: interviewData.role,
        },
      });
    } catch (error) {
      console.error("Starting text mode fallback due to voice config missing:", error);
      startLocalFallback();
    }
  };

  const handleDisconnect = async () => {
    if (isFallbackMode) {
      if (isRecording) stopLocalRecording();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setCallStatus(CallStatus.FINISHED);
    } else {
      await endSession();
      setCallStatus(CallStatus.FINISHED);
    }
  };

  return (
    <div className={cn("grid gap-6 max-w-7xl mx-auto p-4 items-start", isCodingRound ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
      
      {/* LEFT COLUMN: INTERVIEW PANEL */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Badge variant="outline" className="border-primary/30 text-primary">
              {interviewData.difficulty || "Medium"} Difficulty
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsTimerPaused(!isTimerPaused)}
              disabled={callStatus !== CallStatus.ACTIVE}
            >
              {isTimerPaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
              {isTimerPaused ? "Resume" : "Pause"}
            </Button>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 font-bold px-3 py-1 text-sm border-none">
              ⏱️ {formatTime(timeLeft)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Interviewer */}
          <Card className="flex flex-col items-center p-4 border border-border bg-muted/20">
            <div className="relative">
              <Avatar className="h-24 w-24 border-2 border-primary/20">
                <AvatarFallback className="text-3xl">🤖</AvatarFallback>
              </Avatar>
              {(isSpeaking || (isFallbackMode && callStatus === CallStatus.ACTIVE && !isRecording)) && (
                <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-75" />
              )}
            </div>
            <div className="text-center mt-3">
              <h3 className="font-bold text-sm">AI Interviewer</h3>
              <Badge className="mt-1.5 text-[8px] border-none font-bold" variant="secondary">
                {isFallbackMode ? "TEXT FALLBACK MODE" : callStatus}
              </Badge>
            </div>
          </Card>

          {/* Candidate */}
          <Card className="flex flex-col items-center p-4 border border-border bg-muted/20">
            <div className="relative">
              <Avatar className="h-24 w-24 border-2 border-secondary/20">
                <AvatarFallback className="text-3xl">👤</AvatarFallback>
              </Avatar>
              {isRecording && (
                <span className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-75" />
              )}
            </div>
            <div className="text-center mt-3">
              <h3 className="font-bold text-sm">{userName}</h3>
              <span className="text-[10px] text-muted-foreground block mt-1">Candidate</span>
            </div>
          </Card>
        </div>

        {/* Live Question Transcript */}
        <Card className="min-h-[150px] flex flex-col border border-border">
          <CardHeader className="py-3 px-4 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
            <span className="text-xs font-bold text-primary">Question Console</span>
            {isFallbackMode && (
              <span className="text-xs font-bold text-muted-foreground">
                Progress: {currentQuestionIndex + 1} / {interviewData.questions.length}
              </span>
            )}
          </CardHeader>
          <CardContent className="p-4 flex-1">
            {lastMessage ? (
              <p className="text-md font-medium leading-relaxed text-foreground">
                {lastMessage}
              </p>
            ) : (
              <p className="text-muted-foreground italic text-sm">
                {callStatus === CallStatus.ACTIVE
                  ? "Waiting for the AI to present the question..."
                  : "Click 'Start Interview' below to begin your session."}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Answer Composition (Local Fallback panel) */}
        {isFallbackMode && callStatus === CallStatus.ACTIVE && (
          <Card className="border border-primary/20 bg-card p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase">Response Entry</span>
                {isRecording && (
                  <span className="text-red-500 text-[10px] font-black uppercase animate-pulse flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Speak Now...
                  </span>
                )}
              </div>
              <textarea
                className="w-full min-h-[120px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm resize-none"
                placeholder="Type your response here or click 'Start Voice Mic' to dictate..."
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
              />
              <div className="flex gap-2 justify-between">
                <Button
                  size="sm"
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={isRecording ? stopLocalRecording : startLocalRecording}
                >
                  {isRecording ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                  {isRecording ? "Stop Voice" : "Start Voice Mic"}
                </Button>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={handleSkip}>
                    Skip
                  </Button>
                  <Button size="sm" variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
                    Previous
                  </Button>
                  <Button size="sm" onClick={handleNext}>
                    {currentQuestionIndex < interviewData.questions.length - 1 ? "Next Question" : "Submit Interview"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Session Action Control Buttons */}
        <div className="flex justify-center gap-3 pt-2">
          {callStatus === CallStatus.INACTIVE && (
            <Button size="lg" onClick={handleCall} className="rounded-full px-8 font-bold">
              <PlayCircle className="mr-2 h-5 w-5" /> Start Interview Session
            </Button>
          )}
          {callStatus === CallStatus.CONNECTING && (
            <Button size="lg" disabled className="rounded-full px-8 font-bold">
              <Mic className="mr-2 h-5 w-5 animate-pulse" /> Connecting...
            </Button>
          )}
          {callStatus === CallStatus.ACTIVE && (
            <Button size="lg" variant="destructive" onClick={handleDisconnect} className="rounded-full px-8 font-bold">
              <PhoneOff className="mr-2 h-5 w-5" /> End Interview
            </Button>
          )}
          {callStatus === CallStatus.FINISHED && (
            <Button size="lg" onClick={handleGenerateFeedback} disabled={isGenerating} className="rounded-full px-8 font-bold bg-primary text-white">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Evaluating Transcript...
                </>
              ) : (
                "Compile AI Performance Feedback"
              )}
            </Button>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: CODING PLAYGROUND CARD (Rendered for coding rounds) */}
      {isCodingRound && (
        <Card className="border border-border flex flex-col min-h-[500px]">
          <CardHeader className="py-3 px-4 border-b border-border bg-slate-900 text-white flex flex-row items-center justify-between rounded-t-lg">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/20 text-primary border-none">Coding Task Editor</Badge>
            </div>
            <select
              className="bg-slate-800 text-white border border-slate-700 rounded px-2.5 py-1 text-xs outline-none"
              value={activeLang}
              onChange={(e) => setActiveLang(e.target.value)}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python 3</option>
              <option value="java">Java</option>
              <option value="c++">C++</option>
            </select>
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col bg-slate-950">
            {/* Editor textarea */}
            <textarea
              className="flex-1 min-h-[300px] w-full p-4 bg-slate-950 text-emerald-400 font-mono text-xs focus:outline-none resize-none border-b border-slate-900 leading-relaxed"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            
            {/* Terminal console logger */}
            <div className="h-44 bg-slate-900 border-t border-slate-800 p-3 font-mono text-[10px] text-slate-300 overflow-y-auto">
              <div className="flex justify-between items-center text-slate-500 border-b border-slate-800 pb-1.5 mb-1.5">
                <span>Terminal Output</span>
                <Button 
                  size="sm" 
                  onClick={runCode} 
                  disabled={isExecuting || callStatus !== CallStatus.ACTIVE}
                  className="bg-primary hover:bg-primary/95 text-white font-bold h-6 py-0 px-3 text-[10px]"
                >
                  {isExecuting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : "Run Code"}
                </Button>
              </div>
              <pre className="whitespace-pre-wrap">{terminalOutput || "Console output logs will print here after execution..."}</pre>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};
