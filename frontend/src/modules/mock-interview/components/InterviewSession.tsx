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
import { Mic, MicOff, PhoneOff, Play, Pause, ChevronLeft, ChevronRight, PlayCircle, Loader2, Cpu, FileText, Award, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { interviewService } from "../services/interviewService";
import { MockInterview, InterviewQuestion } from "../types/interview.types";
import { useInterviewStore } from "../hooks/useInterviewStore";

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
    topic?: string;
    isAdaptive?: boolean;
    adaptiveInterviewId?: number;
  };
}

const getInterviewPrompt = (interviewModule?: string, focusAreas?: string) => {
  const focusAreasStr = focusAreas || "general topics";

  const baseGuidelines = `
Interview Guidelines:
- Listen actively to responses and acknowledge them before moving forward.
- Ask brief follow-up questions if a response is vague or requires more detail.
- Keep the conversation flowing smoothly while maintaining control.
- Keep responses concise and to the point.
- This is a voice conversation, so keep your responses short, like in a real conversation.
- Focus areas: ${focusAreasStr}.`;

  const modulePrompts: Record<string, string> = {
    "Technical Coding": `You are a professional interviewer conducting a real-time voice interview focused on Technical Coding. Your goal is to assess the candidate's coding skills, algorithmic thinking, and problem-solving abilities.
${baseGuidelines}`,
    "System Design": `You are a professional interviewer conducting a real-time voice interview focused on System Design. Your goal is to assess the candidate's ability to design scalable, reliable systems and make informed architectural trade-offs.
${baseGuidelines}`,
    "Behavioral / HR": `You are a professional interviewer conducting a real-time voice interview focused on Behavioral and HR assessment. Your goal is to assess the candidate's leadership, teamwork, communication skills, and cultural fit.
${baseGuidelines}`,
    "Aptitude & Reasoning": `You are a professional interviewer conducting a real-time voice interview focused on Aptitude and Reasoning. Your goal is to assess the candidate's logical reasoning, quantitative analysis, and critical thinking abilities.
${baseGuidelines}`,
    "Technical HR": `You are a professional interviewer conducting a real-time voice interview focused on Technical HR. Your goal is to assess the candidate's past project experience, technical background, and cultural fit.
${baseGuidelines}`,
    "Embedded Systems": `You are a professional interviewer conducting a real-time voice interview focused on Embedded Systems. Your goal is to assess the candidate's knowledge of microcontrollers, RTOS, hardware interfaces, and IoT systems.
${baseGuidelines}`,
    "VLSI Design": `You are a professional interviewer conducting a real-time voice interview focused on VLSI Design. Your goal is to assess the candidate's knowledge of digital design, Verilog, FPGA, and integrated circuit concepts.
${baseGuidelines}`,
    "Architecture": `You are a professional interviewer conducting a real-time voice interview focused on Architecture. Your goal is to assess the candidate's knowledge of architectural design, AutoCAD, BIM, and sustainable design principles.
${baseGuidelines}`,
  };

  if (interviewModule && modulePrompts[interviewModule]) {
    return modulePrompts[interviewModule];
  }

  return `You are a professional interviewer conducting a real-time voice interview. Your goal is to assess the candidate's technical skills, problem-solving abilities, and fit for the role.
${baseGuidelines}`;
};

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

  // Latency & Metrics Tracking States
  const [questionShownTime, setQuestionShownTime] = useState<number>(Date.now());
  const [firstKeypressTime, setFirstKeypressTime] = useState<number | null>(null);

  useEffect(() => {
    setQuestionShownTime(Date.now());
    setFirstKeypressTime(null);
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (typedAnswer.trim().length > 0 && !firstKeypressTime) {
      setFirstKeypressTime(Date.now());
    }
  }, [typedAnswer, firstKeypressTime]);

  // Code Playground States
  const [activeLang, setActiveLang] = useState<string>("javascript");
  const [code, setCode] = useState(`// Write your code solution here\n\nfunction solution() {\n  console.log("Hello placement environment!");\n}\nsolution();`);
  const [terminalOutput, setTerminalOutput] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Voice VAD and Barge-In States & Refs
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const [vadState, setVadState] = useState<"INACTIVE" | "AI_SPEAKING" | "LISTENING" | "SPEAKING" | "PROCESSING" | "INTERRUPTED">("INACTIVE");
  const [micVolume, setMicVolume] = useState<number>(0);

  const questionFinishedTimeRef = useRef<number>(0);
  const userStartedSpeakingTimeRef = useRef<number>(0);
  const userStoppedSpeakingTimeRef = useRef<number>(0);
  const lastSpeechTimeRef = useRef<number>(0);
  const isSpeechActiveRef = useRef<boolean>(false);
  const isProcessingRef = useRef<boolean>(false);

  const isCodingRound = interviewData.interviewType === "DSA Coding" || 
                        interviewData.interviewType === "Technical Coding" ||
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
      // Release voice resources
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.error(e);
        }
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
        micStreamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(e => console.error(e));
        audioContextRef.current = null;
      }
    };
  }, []);

  const releaseMicResources = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(e => console.error(e));
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setVadState("INACTIVE");
    isSpeechActiveRef.current = false;
    isProcessingRef.current = false;
  };

  const playAudioBlob = (blob: Blob): Promise<void> => {
    console.log(`[TRACE] [PLAYBACK] playAudioBlob initiated. Blob size: ${blob.size} bytes, MimeType: ${blob.type}`);
    return new Promise((resolve) => {
      if (activeAudioRef.current) {
        console.log("[TRACE] [PLAYBACK] Active audio detected. Pausing current track.");
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }

      // Self-healing fallback: If blob is empty or dummy WAV (<= 128 bytes)
      if (blob.size <= 128) {
        console.warn("[TRACE] [PLAYBACK] Audio blob is dummy/invalid (size <= 128 bytes). Falling back to local browser SpeechSynthesis.");
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(lastMessage);
          
          utterance.onend = () => {
            console.log("[TRACE] [PLAYBACK] Local SpeechSynthesis playback ended. Transitioning to LISTENING state.");
            questionFinishedTimeRef.current = Date.now();
            setVadState("LISTENING");
            isSpeechActiveRef.current = false;
            resolve();
          };

          utterance.onerror = (err) => {
            console.error("[TRACE] [PLAYBACK] Local SpeechSynthesis encountered error:", err);
            questionFinishedTimeRef.current = Date.now();
            setVadState("LISTENING");
            isSpeechActiveRef.current = false;
            resolve();
          };

          setVadState("AI_SPEAKING");
          window.speechSynthesis.speak(utterance);
        } else {
          console.warn("[TRACE] [PLAYBACK] Browser does not support SpeechSynthesis. Resolving immediately.");
          questionFinishedTimeRef.current = Date.now();
          setVadState("LISTENING");
          isSpeechActiveRef.current = false;
          resolve();
        }
        return;
      }

      console.log("[TRACE] [PLAYBACK] Playback started via HTML5 Audio element...");
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      activeAudioRef.current = audio;
      setVadState("AI_SPEAKING");

      audio.onended = () => {
        console.log("[TRACE] [PLAYBACK] Audio playback ended naturally. Transitioning to LISTENING state.");
        activeAudioRef.current = null;
        questionFinishedTimeRef.current = Date.now();
        setVadState("LISTENING");
        isSpeechActiveRef.current = false;
        resolve();
      };

      audio.onerror = () => {
        console.error("[TRACE] [PLAYBACK] HTML5 Audio playback error encountered. Error details:", audio.error);
        activeAudioRef.current = null;
        questionFinishedTimeRef.current = Date.now();
        setVadState("LISTENING");
        isSpeechActiveRef.current = false;
        resolve();
      };

      audio.play().catch((e) => {
        console.error("[TRACE] [PLAYBACK] HTML5 Audio play command failed. Error details:", e);
        activeAudioRef.current = null;
        questionFinishedTimeRef.current = Date.now();
        setVadState("LISTENING");
        isSpeechActiveRef.current = false;
        resolve();
      });
    });
  };

  const playBase64Audio = (base64: string): Promise<void> => {
    const binary = atob(base64);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([array], { type: 'audio/wav' });
    return playAudioBlob(blob);
  };

  const startVolumeAnalysis = (stream: MediaStream) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioCtx = new AudioContextClass();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const bufferLength = analyser.fftSize;
      const dataArray = new Float32Array(bufferLength);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getFloatTimeDomainData(dataArray);

        let sumSquares = 0.0;
        for (let i = 0; i < bufferLength; i++) {
          sumSquares += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sumSquares / bufferLength);
        setMicVolume(rms);
        requestAnimationFrame(checkVolume);
      };

      requestAnimationFrame(checkVolume);
    } catch (e) {
      console.error("[VAD] Failed to start volume analysis:", e);
    }
  };

  const startVADVoiceSession = async () => {
    console.log("[TRACE] [VAD_START] startVADVoiceSession initiated");
    setIsFallbackMode(true);
    setCallStatus(CallStatus.ACTIVE);
    setCurrentQuestionIndex(0);
    setTypedAnswer("");
    setVadState("AI_SPEAKING");
    isProcessingRef.current = false;
    isSpeechActiveRef.current = false;

    try {
      console.log("[TRACE] [VAD_START] Requesting mic permission...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      console.log("[TRACE] [VAD_START] Mic permission granted, initializing volume analysis...");
      startVolumeAnalysis(stream);

      if (interviewData.questions.length > 0) {
        const firstQuestion = interviewData.questions[0];
        console.log("[TRACE] [VAD_START] First question text retrieved:", firstQuestion);
        const firstMsg: SavedMessage = { role: "assistant", content: firstQuestion };
        setMessages([firstMsg]);
        setLastMessage(firstQuestion);

        console.log("[TRACE] [VAD_START] Requesting TTS synthesis for first question...");
        const firstQBlob = await interviewService.synthesizeNvidiaTts(firstQuestion);
        console.log(`[TRACE] [VAD_START] Received synthesized response of size: ${firstQBlob.size} bytes`);
        await playAudioBlob(firstQBlob);
      } else {
        console.warn("[TRACE] [VAD_START] No questions found in interviewData!");
      }
    } catch (err) {
      console.error("[TRACE] [VAD_START] Failed to start VAD voice session. Error details:", err);
      startLocalFallback();
    }
  };

  const startVoiceRecording = (isInterruption: boolean) => {
    if (!micStreamRef.current) return;

    userStartedSpeakingTimeRef.current = Date.now();
    audioChunksRef.current = [];

    let options = {};
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      options = { mimeType: 'audio/webm;codecs=opus' };
    } else if (MediaRecorder.isTypeSupported('audio/webm')) {
      options = { mimeType: 'audio/webm' };
    } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
      options = { mimeType: 'audio/ogg' };
    } else if (MediaRecorder.isTypeSupported('audio/wav')) {
      options = { mimeType: 'audio/wav' };
    }

    try {
      const recorder = new MediaRecorder(micStreamRef.current, options);
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      recorder.start(100);
      mediaRecorderRef.current = recorder;
      console.log(`[VAD] Started recording. IsInterruption: ${isInterruption}`);
    } catch (e) {
      console.error("[VAD] Failed to start MediaRecorder:", e);
    }
  };

  const stopVoiceRecordingAndProcess = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") return;

    isProcessingRef.current = true;
    const isInterruption = (vadState === "INTERRUPTED");
    setVadState("PROCESSING");

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      const stoppedTime = Date.now();
      userStoppedSpeakingTimeRef.current = stoppedTime;

      const totalTurnDuration = stoppedTime - questionFinishedTimeRef.current;
      const thinkingTime = userStartedSpeakingTimeRef.current - questionFinishedTimeRef.current;

      try {
        if (isInterruption) {
          console.log("[VAD] Uploading interruption audio...");
          const res = await interviewService.bargeIn(
            interviewData.adaptiveInterviewId!,
            audioBlob,
            true
          );
          
          isProcessingRef.current = false;
          
          if (res.interrupted) {
            console.log("[VAD] Interruption accepted. Action:", res.action);
            
            const userMsg: SavedMessage = { role: "user", content: `[Interruption] ${res.transcription}` };
            const aiMsg: SavedMessage = { role: "assistant", content: res.responseText };
            setMessages((prev) => [...prev, userMsg, aiMsg]);
            setLastMessage(res.responseText);

            if (res.action === "ADVANCE") {
              const nextIndex = currentQuestionIndex + 1;
              setCurrentQuestionIndex(nextIndex);
              
              useInterviewStore.getState().setInterviewData({
                ...interviewData,
                questions: [...interviewData.questions, res.responseText]
              });
            }

            if (res.audioBase64) {
              await playBase64Audio(res.audioBase64);
            } else {
              const ttsBlob = await interviewService.synthesizeNvidiaTts(res.responseText);
              await playAudioBlob(ttsBlob);
            }
          } else {
            console.log("[VAD] Interruption ignored (deemed noise). Resuming...");
            setVadState("LISTENING");
            isSpeechActiveRef.current = false;
          }
        } else {
          console.log("[VAD] Uploading final answer audio...");
          const nextQuestionBlob = await interviewService.transcribeVoiceTurn(
            interviewData.adaptiveInterviewId!,
            audioBlob,
            Math.max(0, thinkingTime),
            Math.max(0, totalTurnDuration)
          );

          isProcessingRef.current = false;

          const updatedInterview = await interviewService.getById(interviewData.adaptiveInterviewId!);
          const interviewQuestions = updatedInterview.questions || [];
          const nextQText = interviewQuestions[interviewQuestions.length - 1]?.questionText || 
                            "Thank you. The interview is complete. We are compiling your performance report now.";

          const userMsg: SavedMessage = { role: "user", content: interviewQuestions[interviewQuestions.length - 2]?.answerText || "Answer submitted." };
          const aiMsg: SavedMessage = { role: "assistant", content: nextQText };
          setMessages((prev) => [...prev, userMsg, aiMsg]);
          setLastMessage(nextQText);

          if (updatedInterview.status === "COMPLETED") {
            setCallStatus(CallStatus.FINISHED);
            await playAudioBlob(nextQuestionBlob);
          } else {
            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);

            useInterviewStore.getState().setInterviewData({
              ...interviewData,
              questions: interviewQuestions.map(q => q.questionText)
            });

            await playAudioBlob(nextQuestionBlob);
          }
        }
      } catch (err) {
        console.error("[VAD] Error processing turn:", err);
        isProcessingRef.current = false;
        setVadState("LISTENING");
        isSpeechActiveRef.current = false;
      }
    };

    try {
      mediaRecorderRef.current.stop();
    } catch (e) {
      console.error("[VAD] Error stopping MediaRecorder:", e);
      isProcessingRef.current = false;
      setVadState("LISTENING");
      isSpeechActiveRef.current = false;
    }
  };

  // VAD Volume monitoring loop
  useEffect(() => {
    if (callStatus !== CallStatus.ACTIVE || !analyserRef.current) return;

    const interval = setInterval(() => {
      if (!analyserRef.current || isProcessingRef.current) return;

      const bufferLength = analyserRef.current.fftSize;
      const dataArray = new Float32Array(bufferLength);
      analyserRef.current.getFloatTimeDomainData(dataArray);

      let sumSquares = 0.0;
      for (let i = 0; i < bufferLength; i++) {
        sumSquares += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sumSquares / bufferLength);

      const now = Date.now();
      const VAD_THRESHOLD = 0.015;
      const SILENCE_THRESHOLD = 2000;

      if (rms > VAD_THRESHOLD) {
        lastSpeechTimeRef.current = now;

        if (!isSpeechActiveRef.current) {
          isSpeechActiveRef.current = true;

          if (vadState === "AI_SPEAKING") {
            setVadState("INTERRUPTED");
            if (activeAudioRef.current) {
              activeAudioRef.current.pause();
              activeAudioRef.current = null;
              console.log("[VAD] AI TTS playback stopped due to user interruption");
            }
            startVoiceRecording(true);
          } else if (vadState === "LISTENING") {
            setVadState("SPEAKING");
            startVoiceRecording(false);
          }
        }
      } else {
        if (isSpeechActiveRef.current) {
          const silenceDuration = now - lastSpeechTimeRef.current;
          if (silenceDuration >= SILENCE_THRESHOLD) {
            isSpeechActiveRef.current = false;
            console.log("[VAD] Silence threshold reached. Finalizing recording...");
            stopVoiceRecordingAndProcess();
          }
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [callStatus, vadState]);

  const renderVoiceVisualizer = () => {
    const barCount = 7;
    return (
      <div className="flex items-center justify-center gap-1.5 h-16 my-4">
        {Array.from({ length: barCount }).map((_, i) => {
          const factor = Math.sin((i / (barCount - 1)) * Math.PI);
          const height = vadState === "SPEAKING" 
            ? Math.max(8, Math.min(64, micVolume * 250 * factor)) 
            : 8;
          const animateClass = vadState === "AI_SPEAKING" ? "animate-pulse" : "";
          return (
            <div
              key={i}
              className={cn(
                "w-1.5 rounded-full transition-all duration-75 bg-primary",
                animateClass
              )}
              style={{ 
                height: `${height}px`,
                backgroundColor: vadState === "SPEAKING" ? "#10b981" : (vadState === "AI_SPEAKING" ? "#5271ff" : "#475569")
              }}
            />
          );
        })}
      </div>
    );
  };

  const speakLocal = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const speakWithElevenLabs = async (text: string) => {
    if (!text) return;
    try {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      const audioBlob = await interviewService.generateSpeech(text);
      if (audioBlob && audioBlob.size > 100) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        await audio.play();
      } else {
        speakLocal(text);
      }
    } catch (e) {
      console.warn("ElevenLabs TTS failed, falling back to browser synthesis", e);
      speakLocal(text);
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
      speakWithElevenLabs(firstQuestion);
    }
  };

  const startLocalRecording = () => {
    if (!firstKeypressTime) {
      setFirstKeypressTime(Date.now());
    }
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
  const handleNext = async () => {
    if (isRecording) stopLocalRecording();

    // Cache the typed/composed answer
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: typedAnswer.trim()
    }));

    const now = Date.now();
    const totalTime = (now - questionShownTime) / 1000;
    const thinkTime = firstKeypressTime ? (firstKeypressTime - questionShownTime) / 1000 : totalTime;

    if (interviewData.isAdaptive && interviewData.adaptiveInterviewId) {
      try {
        const response = await interviewService.answerAdaptiveInterview(
          interviewData.adaptiveInterviewId,
          typedAnswer.trim(),
          isCodingRound ? code : undefined,
          isCodingRound ? activeLang : undefined,
          isCodingRound ? terminalOutput : undefined,
          thinkTime,
          totalTime
        );
        if (response.isFinished) {
          setCallStatus(CallStatus.FINISHED);
          speakWithElevenLabs("Mock interview completed successfully. Please generate your feedback report.");
        } else if (response.nextQuestion) {
          const nextIndex = currentQuestionIndex + 1;
          
          // Add question to global store so handleGenerateFeedback sees it
          useInterviewStore.getState().setInterviewData({
            ...interviewData,
            questions: [...interviewData.questions, response.nextQuestion]
          });
          
          setCurrentQuestionIndex(nextIndex);
          setLastMessage(response.nextQuestion);
          setTypedAnswer("");
          speakWithElevenLabs(response.nextQuestion);
        }
      } catch (err) {
        console.error("Adaptive answer failed:", err);
      }
    } else {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < interviewData.questions.length) {
        setCurrentQuestionIndex(nextIndex);
        const nextQuestion = interviewData.questions[nextIndex];
        setLastMessage(nextQuestion);
        setTypedAnswer(answers[nextIndex] || "");
        speakWithElevenLabs(nextQuestion);
      } else {
        setCallStatus(CallStatus.FINISHED);
        speakWithElevenLabs("Mock interview completed successfully. Please generate your feedback report.");
      }
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
      speakWithElevenLabs(prevQuestion);
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
      topic: interviewData.interviewType + (interviewData.topic ? " - " + interviewData.topic : ""),
      transcript,
      questions,
    };

    if (interviewData.isAdaptive && interviewData.adaptiveInterviewId) {
      console.log(`[TRACE] [FEEDBACK] Redirecting to adaptive mock interview result page: /mock-interview/result/${interviewData.adaptiveInterviewId}`);
      router.push(`/mock-interview/result/${interviewData.adaptiveInterviewId}`);
      return;
    }

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

      if (interviewData.isAdaptive) {
        console.log("Adaptive Mode active. Bypassing ElevenLabs autonomous agent to use managed VAD Voice Session.");
        startVADVoiceSession();
        return;
      }

      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      if (!agentId) {
        console.warn("ElevenLabs Agent ID not configured. Starting local fallback mode.");
        startLocalFallback();
        return;
      }

      const formattedQuestions = interviewData.questions
        .map((q, i) => `${i + 1}. ${q}`)
        .join("\n");

      let agentPrompt = getInterviewPrompt(interviewData.interviewType, interviewData.topic);

      if (formattedQuestions) {
        agentPrompt += `\n\nHere are the specific questions you must ask the candidate during this interview:\n${formattedQuestions}\n\nAsk these questions one by one. Wait for the candidate to answer each question before moving to the next one. You may ask brief follow-up questions based on their answers.`;
      }

      const firstMessage = interviewData.company
        ? `Hello ${userName}! I'll be conducting your ${interviewData.company} interview today. Let's get started. Are you ready?`
        : `Hello ${userName}! I'll be your interviewer today. Let's get started. Are you ready?`;

      await startSession({
        agentId,
        overrides: {
          agent: {
            prompt: {
              prompt: agentPrompt,
            },
            firstMessage: firstMessage,
          },
        },
      });
    } catch (error) {
      console.error("Starting text mode fallback due to voice config missing:", error);
      startLocalFallback();
    }
  };

  const handleDisconnect = async () => {
    console.log("[TRACE] [DISCONNECT] handleDisconnect initiated. Releasing local and server resources.");
    releaseMicResources();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    if (interviewData.isAdaptive && interviewData.adaptiveInterviewId) {
      try {
        console.log(`[TRACE] [DISCONNECT] Calling early termination endpoint for adaptive interview id: ${interviewData.adaptiveInterviewId}`);
        await interviewService.cancelAdaptiveInterview(interviewData.adaptiveInterviewId);
      } catch (e) {
        console.error("[TRACE] [DISCONNECT] Failed to notify early termination to server:", e);
      }
    }
    
    setCallStatus(CallStatus.FINISHED);
  };

  return (
    <div className={cn(
      "grid gap-6 max-w-7xl mx-auto p-4 items-start grid-cols-1",
      isCodingRound ? "lg:grid-cols-12" : "lg:grid-cols-3"
    )}>
      
      {/* LEFT COLUMN: INTERVIEW PANEL */}
      <div className={cn("space-y-6", isCodingRound ? "lg:col-span-6" : "lg:col-span-2")}>
        
        {/* Section Progress & Tracker Bar */}
        {callStatus === CallStatus.ACTIVE && (
          <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-white flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-primary animate-pulse" /> 
                Active Competency: <span className="text-primary font-black uppercase tracking-wider">{
                  interviewData.questions.length === 1 ? "INTRODUCTION" :
                  interviewData.questions.length === 2 ? "RESUME DEEP-DIVE" :
                  interviewData.questions.length === 3 ? "TECHNICAL DEPTH" :
                  interviewData.questions.length === 4 ? "SYSTEM DESIGN / CODE DESIGN" :
                  "BEHAVIORAL STAR"
                }</span>
              </span>
              <span className="text-muted-foreground font-semibold">Question {interviewData.questions.length} of 5</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 rounded-full" 
                style={{ width: `${Math.min((interviewData.questions.length / 5) * 100, 100)}%` }} 
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="text-xs hover:text-white border border-white/5 bg-slate-900/50">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Badge variant="outline" className="border-primary/35 bg-primary/5 text-primary text-xs font-bold">
              {interviewData.difficulty || "Medium"} Difficulty
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsTimerPaused(!isTimerPaused)}
              disabled={callStatus !== CallStatus.ACTIVE}
              className="text-xs border-white/5 bg-slate-900/50 text-white"
            >
              {isTimerPaused ? <Play className="w-3.5 h-3.5 mr-1" /> : <Pause className="w-3.5 h-3.5 mr-1" />}
              {isTimerPaused ? "Resume" : "Pause"}
            </Button>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 font-bold px-3 py-1 text-sm border-none">
              ⏱️ {formatTime(timeLeft)}
            </Badge>
          </div>
        </div>

        <div className="call-view-premium">
          {/* AI Interviewer */}
          <div className="card-interviewer-premium">
            <div className="avatar-premium">
              <span className="text-5xl">🤖</span>
              {(isSpeaking || (isFallbackMode && callStatus === CallStatus.ACTIVE && vadState === "AI_SPEAKING")) && (
                <span className="animate-speak-premium" />
              )}
            </div>
            <h3 className="text-center text-white mt-5 font-bold text-lg">AI Interviewer</h3>
            <Badge className="mt-1 text-[9px] bg-primary/20 text-primary border-none font-bold">
              {isFallbackMode ? `VOICE MODE: ${vadState}` : callStatus}
            </Badge>
          </div>

          {/* Candidate */}
          <div className="card-border-premium">
            <div className="card-content-premium">
              <div className="size-[120px] rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border-2 border-primary/30">
                <span className="text-5xl">👤</span>
              </div>
              <h3 className="text-center text-white mt-5 font-bold text-lg">{userName}</h3>
              <span className="text-[10px] text-muted-foreground block">Candidate</span>
            </div>
          </div>
        </div>

        {/* Live Question Transcript */}
        {lastMessage && (
          <div className="transcript-border-premium">
            <div className="transcript-premium">
              <p className="animate-fadeIn font-bold text-white text-xs">{lastMessage}</p>
            </div>
          </div>
        )}

        {/* Answer Composition (VAD Voice visualizer) */}
        {isFallbackMode && callStatus === CallStatus.ACTIVE && (
          <Card className="border border-primary/20 bg-slate-900/60 backdrop-blur p-6 rounded-2xl shadow-xl">
            <div className="space-y-6 text-center">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Voice Interview Engine
                </span>
                <Badge className={cn(
                  "text-[9px] font-black border-none py-0.5 px-2 uppercase",
                  vadState === "SPEAKING" && "bg-emerald-500/20 text-emerald-400",
                  vadState === "AI_SPEAKING" && "bg-primary/20 text-primary-foreground",
                  vadState === "LISTENING" && "bg-slate-800 text-slate-400",
                  vadState === "PROCESSING" && "bg-amber-500/20 text-amber-400 animate-pulse",
                  vadState === "INTERRUPTED" && "bg-red-500/20 text-red-400"
                )}>
                  {vadState}
                </Badge>
              </div>

              <div className="py-4">
                {renderVoiceVisualizer()}
                <p className="text-sm font-semibold text-white mt-4 transition-all">
                  {vadState === "AI_SPEAKING" && "🤖 AI Interviewer is speaking..."}
                  {vadState === "LISTENING" && "🎙️ Listening... Speak when you are ready"}
                  {vadState === "SPEAKING" && "🔊 Speech detected... Recording answer"}
                  {vadState === "PROCESSING" && "⏳ Thinking... Analyzing speech & updating state"}
                  {vadState === "INTERRUPTED" && "⚡ Interruption detected..."}
                </p>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Microphone is active. Speak hands-free. No manual submit required.
                </p>
              </div>

              {/* Fallback button to manual skip or disconnect if needed */}
              <div className="flex gap-2 justify-center border-t border-white/5 pt-4">
                <Button size="sm" variant="ghost" className="text-xs hover:text-white" onClick={handleSkip}>
                  Skip Question
                </Button>
                <Button size="sm" variant="destructive" className="text-xs" onClick={handleDisconnect}>
                  End Interview
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Session Action Control Buttons */}
        <div className="flex justify-center gap-3 pt-2">
          {callStatus === CallStatus.INACTIVE && (
            <button onClick={handleCall} className="btn-call-premium">
              Start Interview Session
            </button>
          )}
          {callStatus === CallStatus.CONNECTING && (
            <button disabled className="btn-call-premium opacity-80 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Connecting...
            </button>
          )}
          {callStatus === CallStatus.ACTIVE && (
            <button onClick={handleDisconnect} className="btn-disconnect-premium">
              End Interview
            </button>
          )}
          {callStatus === CallStatus.FINISHED && (
            <button onClick={handleGenerateFeedback} disabled={isGenerating} className="btn-call-premium relative">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Evaluating Transcript...
                </>
              ) : (
                "Compile AI Performance Feedback"
              )}
            </button>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: CODING PLAYGROUND CARD (Rendered for coding rounds) */}
      {isCodingRound && (
        <Card className="lg:col-span-6 border border-border flex flex-col min-h-[500px]">
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

      {/* RIGHT COLUMN: RESUME SIDEBAR & PROGRESS STEPS (Rendered when no coding round is active) */}
      {!isCodingRound && (
        <div className="lg:col-span-1 space-y-6 sticky top-4">
          
          {/* Resume Context Card */}
          <Card className="border border-white/5 bg-slate-900/40 backdrop-blur p-4 rounded-xl shadow-lg space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary" /> Practice Resume Context
            </h4>
            <div className="space-y-2.5 text-xs border-t border-white/5 pt-3">
              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase block">Target Role Fit</span>
                <span className="text-white font-bold">{interviewData.role || "Software Engineer"}</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase block">Focus Areas / Tech Stack</span>
                <span className="text-white font-bold">{interviewData.topic || "All Technical Domains"}</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase block">Experience Level</span>
                <span className="text-white font-bold">{interviewData.experienceLevel || "Mid Level"}</span>
              </div>
              {interviewData.company && (
                <div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase block">Target Company Style</span>
                  <span className="text-white font-bold">{interviewData.company}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Stepper Milestones Card */}
          <Card className="border border-white/5 bg-slate-900/40 backdrop-blur p-4 rounded-xl shadow-lg space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-primary" /> Interview Milestones
            </h4>
            <div className="space-y-3 border-t border-white/5 pt-3">
              {[
                { num: 1, title: "Introduction & Greet", desc: "Icebreaker & background verification", activeAt: 1 },
                { num: 2, title: "Resume Deep-Dive", desc: "Tailored review of projects & claims", activeAt: 2 },
                { num: 3, title: "Technical Verification", desc: "Core concepts & languages", activeAt: 3 },
                { num: 4, title: "Architecture & Scalability", desc: "System Design and performance", activeAt: 4 },
                { num: 5, title: "STAR Behavioral Scenario", desc: "Conflict, resolution & leadership", activeAt: 5 }
              ].map((milestone) => {
                const isCompleted = interviewData.questions.length > milestone.activeAt;
                const isActive = interviewData.questions.length === milestone.activeAt;
                return (
                  <div key={milestone.num} className="flex gap-2.5 items-start">
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5",
                      isCompleted && "bg-emerald-500 text-white",
                      isActive && "bg-primary text-white animate-pulse",
                      !isCompleted && !isActive && "bg-slate-800 text-slate-500"
                    )}>
                      {isCompleted ? <Check className="w-3 h-3" /> : milestone.num}
                    </div>
                    <div className="truncate">
                      <p className={cn("text-xs font-bold truncate", isActive ? "text-white" : "text-muted-foreground")}>
                        {milestone.title}
                      </p>
                      <p className="text-[9px] text-slate-500 truncate">{milestone.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

        </div>
      )}

    </div>
  );
};
