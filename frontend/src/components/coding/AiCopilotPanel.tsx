"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, HelpCircle, Bug, Cpu, Zap, Lightbulb, ChevronRight, Loader2, Bot } from "lucide-react";
import api from "@/lib/api";

interface AiCopilotPanelProps {
  problemId: number;
  code: string;
  language: string;
}

interface Message {
  role: "user" | "copilot";
  content: string;
  hintLevel?: number;
}

export default function AiCopilotPanel({ problemId, code, language }: AiCopilotPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "copilot",
      content: "👋 Hi! I'm PlacementAI Copilot. Ask me for progressive hints, approach explanations, code debugging, or time complexity analysis without spoiling the solution!"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [hintLevel, setHintLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: string, overrideMsg?: string) => {
    setIsLoading(true);
    const userText = overrideMsg || inputMessage || action;

    const newMsgs: Message[] = [...messages, { role: "user", content: userText }];
    setMessages(newMsgs);
    setInputMessage("");

    try {
      const res = await api.post(`/coding/problems/${problemId}/copilot`, {
        action,
        code,
        language,
        userMessage: userText,
        hintLevel
      });

      if (res.data && res.data.reply) {
        setMessages([
          ...newMsgs,
          { role: "copilot", content: res.data.reply, hintLevel: res.data.nextHintLevel }
        ]);
        if (res.data.nextHintLevel) {
          setHintLevel(res.data.nextHintLevel);
        }
      }
    } catch (e) {
      setMessages([
        ...newMsgs,
        { role: "copilot", content: "⚠️ AI service temporarily unavailable. Think about data structures that give O(1) or O(log N) lookup capability!" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border-l border-border/50 text-foreground">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 bg-card/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              PlacementAI Copilot
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                INTEL
              </span>
            </h4>
          </div>
        </div>
      </div>

      {/* Quick Action Chips */}
      <div className="px-3 py-2 border-b border-border/40 bg-muted/20 flex flex-wrap gap-1.5 text-xs">
        <button
          onClick={() => handleAction("HINT")}
          disabled={isLoading}
          className="px-2.5 py-1 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 flex items-center gap-1 transition"
        >
          <Lightbulb className="w-3 h-3" /> Hint #{hintLevel}
        </button>

        <button
          onClick={() => handleAction("EXPLAIN_APPROACH")}
          disabled={isLoading}
          className="px-2.5 py-1 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 flex items-center gap-1 transition"
        >
          <Sparkles className="w-3 h-3" /> Approach
        </button>

        <button
          onClick={() => handleAction("DEBUG")}
          disabled={isLoading}
          className="px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 flex items-center gap-1 transition"
        >
          <Bug className="w-3 h-3" /> Debug Code
        </button>

        <button
          onClick={() => handleAction("COMPLEXITY")}
          disabled={isLoading}
          className="px-2.5 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 flex items-center gap-1 transition"
        >
          <Cpu className="w-3 h-3" /> Complexity
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl max-w-[90%] whitespace-pre-wrap leading-relaxed ${
              m.role === "user"
                ? "ml-auto bg-primary text-primary-foreground font-sans"
                : "mr-auto bg-card border border-border/50 text-foreground font-mono text-[11px]"
            }`}
          >
            {m.content}
          </div>
        ))}
        {isLoading && (
          <div className="p-3 rounded-xl mr-auto bg-card border border-border/50 text-muted-foreground flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
            Analyzing code structure...
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-border/50 bg-card/40 flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAction("CUSTOM")}
          placeholder="Ask PlacementAI Copilot a question..."
          className="flex-1 bg-background border border-border/60 rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
        />
        <Button
          size="sm"
          onClick={() => handleAction("CUSTOM")}
          disabled={isLoading || !inputMessage.trim()}
          className="h-8 px-3 bg-purple-600 hover:bg-purple-500 text-white"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
