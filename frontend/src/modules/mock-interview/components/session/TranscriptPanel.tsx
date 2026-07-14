"use client";

import React, { useRef, useEffect } from "react";
import { useInterviewStateContext } from "./InterviewContexts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export const TranscriptPanel = () => {
  const { messages } = useInterviewStateContext();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <Card className="flex flex-col h-[320px] border border-zinc-800 bg-black/60 backdrop-blur-md">
      <CardHeader className="py-3 border-b border-zinc-900">
        <CardTitle className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
          Running Transcript
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-3 overflow-hidden">
        <ScrollArea className="h-full pr-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-xs text-zinc-600 italic">
              Conversation transcript is empty.
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex flex-col max-w-[85%] rounded-lg p-3 text-sm",
                    msg.role === "user"
                      ? "ml-auto bg-indigo-650 text-indigo-50 border border-indigo-600/30"
                      : "mr-auto bg-zinc-900 text-zinc-200 border border-zinc-800"
                  )}
                >
                  <span className="mb-1 text-[10px] uppercase font-bold tracking-wider opacity-60">
                    {msg.role === "user" ? "You" : "Interviewer"}
                  </span>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
