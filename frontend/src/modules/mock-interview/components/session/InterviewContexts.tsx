"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

export interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

export interface InterviewData {
  role: string;
  questions: string[];
  experienceLevel: string;
  company?: string;
  difficulty?: string;
  interviewType?: string;
  topic?: string;
  isAdaptive?: boolean;
  adaptiveInterviewId?: number;
}

interface InterviewStateContextType {
  userName: string;
  interviewData: InterviewData;
  callStatus: CallStatus;
  setCallStatus: React.Dispatch<React.SetStateAction<CallStatus>>;
  messages: SavedMessage[];
  setMessages: React.Dispatch<React.SetStateAction<SavedMessage[]>>;
  lastMessage: string;
  setLastMessage: React.Dispatch<React.SetStateAction<string>>;
  isGenerating: boolean;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  isTimerPaused: boolean;
  setIsTimerPaused: React.Dispatch<React.SetStateAction<boolean>>;
  isFallbackMode: boolean;
  setIsFallbackMode: React.Dispatch<React.SetStateAction<boolean>>;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  typedAnswer: string;
  setTypedAnswer: React.Dispatch<React.SetStateAction<string>>;
  answers: Record<number, string>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  activeLang: string;
  setActiveLang: React.Dispatch<React.SetStateAction<string>>;
  code: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  terminalOutput: string;
  setTerminalOutput: React.Dispatch<React.SetStateAction<string>>;
  isExecuting: boolean;
  setIsExecuting: React.Dispatch<React.SetStateAction<boolean>>;
  isSpeechActive: boolean;
  setIsSpeechActive: React.Dispatch<React.SetStateAction<boolean>>;
}

interface InterviewAudioContextType {
  vadState: "INACTIVE" | "AI_SPEAKING" | "LISTENING" | "SPEAKING" | "PROCESSING" | "INTERRUPTED";
  setVadState: (state: "INACTIVE" | "AI_SPEAKING" | "LISTENING" | "SPEAKING" | "PROCESSING" | "INTERRUPTED") => void;
  micVolume: number;
  setMicVolume: (vol: number) => void;
  isRecording: boolean;
  setIsRecording: (rec: boolean) => void;
}

const StateContext = createContext<InterviewStateContextType | undefined>(undefined);
const AudioContext = createContext<InterviewAudioContextType | undefined>(undefined);

export const InterviewStateProvider = ({
  children,
  userName,
  interviewData,
}: {
  children: ReactNode;
  userName: string;
  interviewData: InterviewData;
}) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [activeLang, setActiveLang] = useState("javascript");
  const [code, setCode] = useState(`// Write your code solution here\n\nfunction solution() {\n  console.log("Hello placement environment!");\n}\nsolution();`);
  const [terminalOutput, setTerminalOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSpeechActive, setIsSpeechActive] = useState(false);

  return (
    <StateContext.Provider
      value={{
        userName,
        interviewData,
        callStatus,
        setCallStatus,
        messages,
        setMessages,
        lastMessage,
        setLastMessage,
        isGenerating,
        setIsGenerating,
        timeLeft,
        setTimeLeft,
        isTimerPaused,
        setIsTimerPaused,
        isFallbackMode,
        setIsFallbackMode,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        typedAnswer,
        setTypedAnswer,
        answers,
        setAnswers,
        activeLang,
        setActiveLang,
        code,
        setCode,
        terminalOutput,
        setTerminalOutput,
        isExecuting,
        setIsExecuting,
        isSpeechActive,
        setIsSpeechActive,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const InterviewAudioProvider = ({ children }: { children: ReactNode }) => {
  const [vadState, setVadState] = useState<"INACTIVE" | "AI_SPEAKING" | "LISTENING" | "SPEAKING" | "PROCESSING" | "INTERRUPTED">("INACTIVE");
  const [micVolume, setMicVolume] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  return (
    <AudioContext.Provider
      value={{
        vadState,
        setVadState,
        micVolume,
        setMicVolume,
        isRecording,
        setIsRecording,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useInterviewStateContext = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useInterviewStateContext must be used within an InterviewStateProvider");
  }
  return context;
};

export const useInterviewAudioContext = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useInterviewAudioContext must be used within an InterviewAudioProvider");
  }
  return context;
};
