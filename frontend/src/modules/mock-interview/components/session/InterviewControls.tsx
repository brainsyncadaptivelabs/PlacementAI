"use client";

import React, { useState } from "react";
import { useInterviewStateContext, CallStatus } from "./InterviewContexts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, PhoneOff, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InterviewControlsProps {
  onToggleMic: () => void;
  onSubmitTextAnswer: (answer: string) => void;
  onEndSession: () => void;
  isMicLoading: boolean;
}

export const InterviewControls = ({
  onToggleMic,
  onSubmitTextAnswer,
  onEndSession,
  isMicLoading,
}: InterviewControlsProps) => {
  const { callStatus, typedAnswer, setTypedAnswer, isGenerating } = useInterviewStateContext();
  const [localAnswer, setLocalAnswer] = useState("");

  const handleSend = () => {
    if (!localAnswer.trim()) return;
    onSubmitTextAnswer(localAnswer);
    setLocalAnswer("");
  };

  return (
    <div className="flex flex-col gap-4 p-4 border border-zinc-800 bg-black/80 rounded-xl backdrop-blur-md">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Type your response here..."
          value={localAnswer}
          onChange={(e) => setLocalAnswer(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-650 focus-visible:ring-indigo-650"
          disabled={isGenerating}
        />
        <Button
          onClick={handleSend}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          disabled={isGenerating || !localAnswer.trim()}
        >
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-900 pt-3">
        <Button
          variant="outline"
          onClick={onToggleMic}
          disabled={isMicLoading}
          className={cn(
            "flex items-center gap-2 border-zinc-800 text-zinc-300 hover:bg-zinc-900",
            callStatus === CallStatus.ACTIVE && "bg-green-600/10 border-green-500/20 text-green-400 hover:bg-green-600/20"
          )}
        >
          {isMicLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : callStatus === CallStatus.ACTIVE ? (
            <>
              <Mic className="h-4 w-4" />
              <span>Voice Connected</span>
            </>
          ) : (
            <>
              <MicOff className="h-4 w-4" />
              <span>Connect Voice</span>
            </>
          )}
        </Button>

        <Button
          variant="destructive"
          onClick={onEndSession}
          className="flex items-center gap-2 bg-red-650 hover:bg-red-750 text-white"
        >
          <PhoneOff className="h-4 w-4" />
          <span>End Session</span>
        </Button>
      </div>
    </div>
  );
};
