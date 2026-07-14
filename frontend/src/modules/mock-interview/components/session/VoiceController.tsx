"use client";

import React from "react";
import { useInterviewStateContext, useInterviewAudioContext, CallStatus } from "./InterviewContexts";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Mic, MicOff, PhoneOff, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

export const VoiceController = () => {
  const { callStatus } = useInterviewStateContext();
  const { vadState, micVolume } = useInterviewAudioContext();

  const getStatusColor = () => {
    switch (vadState) {
      case "SPEAKING":
        return "bg-green-500/20 border-green-500/40 text-green-400";
      case "AI_SPEAKING":
        return "bg-indigo-500/20 border-indigo-500/40 text-indigo-400";
      case "PROCESSING":
        return "bg-yellow-500/20 border-yellow-500/40 text-yellow-400 animate-pulse";
      case "INTERRUPTED":
        return "bg-red-500/20 border-red-500/40 text-red-400";
      default:
        return "bg-zinc-900 border-zinc-800 text-zinc-400";
    }
  };

  return (
    <Card className="border border-zinc-800 bg-black/60 backdrop-blur-md">
      <CardContent className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-400">Stream Volume</span>
          <div className="flex items-center gap-1.5">
            <div className={cn("h-2.5 w-2.5 rounded-full", callStatus === CallStatus.ACTIVE ? "bg-green-500 animate-ping" : "bg-zinc-700")} />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">{callStatus}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", getStatusColor())}>
            {vadState === "SPEAKING" ? (
              <Mic className="h-5 w-5 animate-bounce" />
            ) : vadState === "AI_SPEAKING" ? (
              <Cpu className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1">
            <Progress value={micVolume * 100} className="h-2 bg-zinc-900" />
            <span className="mt-1 block text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
              VAD State: {vadState}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
