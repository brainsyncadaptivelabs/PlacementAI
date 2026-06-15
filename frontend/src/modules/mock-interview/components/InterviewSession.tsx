"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useConversation } from "@elevenlabs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, PhoneOff, Play } from "lucide-react";
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

  // Local fallback states
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

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
    
    const firstQuestion = interviewData.questions[0];
    const firstMsg: SavedMessage = { role: "assistant", content: firstQuestion };
    setMessages([firstMsg]);
    setLastMessage(firstQuestion);
    speakLocal(firstQuestion);
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

  const submitLocalAnswer = () => {
    if (isRecording) {
      stopLocalRecording();
    }
    
    const answerToSubmit = typedAnswer.trim() || "[No response provided]";
    const userMsg: SavedMessage = { role: "user", content: answerToSubmit };
    
    setMessages((prev) => {
      const nextMessages = [...prev, userMsg];
      const nextIndex = currentQuestionIndex + 1;
      
      if (nextIndex < interviewData.questions.length) {
        setCurrentQuestionIndex(nextIndex);
        const nextQuestion = interviewData.questions[nextIndex];
        const nextMsg: SavedMessage = { role: "assistant", content: nextQuestion };
        setLastMessage(nextQuestion);
        speakLocal(nextQuestion);
        return [...nextMessages, nextMsg];
      } else {
        const endMsg = "Thank you, the interview is now complete. Please generate your feedback.";
        const systemMsg: SavedMessage = { role: "assistant", content: endMsg };
        setLastMessage(endMsg);
        speakLocal(endMsg);
        setCallStatus(CallStatus.FINISHED);
        return [...nextMessages, systemMsg];
      }
    });
    
    setTypedAnswer("");
  };

  const handleGenerateFeedback = useCallback(async () => {
    setIsGenerating(true);
    const transcript = messagesRef.current
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const questions: InterviewQuestion[] = interviewData.questions.map((q) => ({
      questionText: q,
      answerText: "",
      score: 0,
    }));

    const result: MockInterview = {
      role: interviewData.role,
      experienceLevel: interviewData.experienceLevel,
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
  }, [interviewData, router]);

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
      console.error("Failed to start conversation:", error);
      startLocalFallback();
    }
  };

  const handleDisconnect = async () => {
    if (isFallbackMode) {
      if (isRecording) {
        stopLocalRecording();
      }
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
    <div className="flex flex-col gap-6 max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center">
        {/* AI Interviewer */}
        <Card className="flex flex-col items-center p-6 border-2 border-primary/20 bg-primary/5">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-primary/30">
              <AvatarImage src="/bot-avatar.png" />
              <AvatarFallback className="text-4xl">🤖</AvatarFallback>
            </Avatar>
            {(isSpeaking || (isFallbackMode && callStatus === CallStatus.ACTIVE && !isRecording)) && (
              <span className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-75" />
            )}
          </div>
          <CardHeader>
            <CardTitle className="text-xl">AI Interviewer</CardTitle>
            <div className="flex justify-center">
              <Badge variant={callStatus === CallStatus.ACTIVE ? "default" : "secondary"}>
                {isFallbackMode ? "FALLBACK ACTIVE" : callStatus}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* User */}
        <Card className="flex flex-col items-center p-6 border-2 border-secondary/20">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-secondary/30">
              <AvatarFallback className="text-4xl text-secondary">👤</AvatarFallback>
            </Avatar>
            {isRecording && (
              <span className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-75" />
            )}
          </div>
          <CardHeader>
            <CardTitle className="text-xl">{userName}</CardTitle>
            <div className="text-muted-foreground">Candidate</div>
          </CardHeader>
        </Card>
      </div>

      {/* Transcript / Last Message Area */}
      <Card className="min-h-[200px] flex flex-col">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Live Transcript</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <ScrollArea className="h-[150px] w-full rounded-md border p-4">
            {lastMessage ? (
              <p className="text-lg animate-in fade-in slide-in-from-bottom-2 duration-500">
                {lastMessage}
              </p>
            ) : (
              <p className="text-muted-foreground italic">
                {callStatus === CallStatus.ACTIVE
                  ? "Waiting for AI to speak..."
                  : "Start the call to begin the interview."}
              </p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Local Text/Voice Fallback Panel */}
      {isFallbackMode && callStatus === CallStatus.ACTIVE && (
        <Card className="p-4 border-2 border-primary/20">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Answer Input (Question {currentQuestionIndex + 1} of {interviewData.questions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-0">
            <textarea
              className="w-full min-h-[100px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white text-foreground"
              placeholder="Your answer will appear here as you speak, or you can type directly..."
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant={isRecording ? "destructive" : "outline"}
                onClick={isRecording ? stopLocalRecording : startLocalRecording}
              >
                {isRecording ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                {isRecording ? "Stop Mic" : "Start Mic"}
              </Button>
              <Button onClick={submitLocalAnswer} disabled={!typedAnswer.trim()}>
                Submit Answer & Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {callStatus === CallStatus.INACTIVE && (
          <Button size="lg" onClick={handleCall} className="rounded-full px-8">
            <Play className="mr-2 h-5 w-5" /> Start Interview
          </Button>
        )}
        {callStatus === CallStatus.CONNECTING && (
          <Button size="lg" disabled className="rounded-full px-8">
            <Mic className="mr-2 h-5 w-5 animate-pulse" /> Connecting...
          </Button>
        )}
        {callStatus === CallStatus.ACTIVE && (
          <Button size="lg" variant="destructive" onClick={handleDisconnect} className="rounded-full px-8">
            <PhoneOff className="mr-2 h-5 w-5" /> End Interview
          </Button>
        )}
        {callStatus === CallStatus.FINISHED && (
          <Button size="lg" onClick={handleGenerateFeedback} disabled={isGenerating} className="rounded-full px-8">
            {isGenerating ? "Processing..." : "Generate Feedback"}
          </Button>
        )}
      </div>
    </div>
  );
};
