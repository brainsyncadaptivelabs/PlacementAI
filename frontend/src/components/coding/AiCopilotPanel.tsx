"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Bug, Cpu, Lightbulb, ChevronRight, Loader2, Bot } from "lucide-react";
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
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-background border-l border-border text-foreground">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-white dark:bg-card flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-purple-600 text-white shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              PlacementAI Copilot
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600 text-white font-black shadow-xs">
                INTEL
              </span>
            </h4>
          </div>
        </div>
      </div>

      {/* Quick Action Chips */}
      <div className="px-3 py-2.5 border-b border-border bg-slate-100/70 dark:bg-muted/40 flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => handleAction("HINT")}
          disabled={isLoading}
          className="px-2.5 py-1.5 rounded-md bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/80 dark:hover:bg-purple-900 text-purple-900 dark:text-purple-100 border border-purple-400 dark:border-purple-600 font-bold flex items-center gap-1.5 transition shadow-xs active:scale-95 disabled:opacity-50"
        >
          <Lightbulb className="w-3.5 h-3.5 text-purple-700 dark:text-purple-300 stroke-[2.5]" /> Hint #{hintLevel}
        </button>

        <button
          onClick={() => handleAction("EXPLAIN_APPROACH")}
          disabled={isLoading}
          className="px-2.5 py-1.5 rounded-md bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-950/80 dark:hover:bg-indigo-900 text-indigo-900 dark:text-indigo-100 border border-indigo-400 dark:border-indigo-600 font-bold flex items-center gap-1.5 transition shadow-xs active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-300 stroke-[2.5]" /> Approach
        </button>

        <button
          onClick={() => handleAction("DEBUG")}
          disabled={isLoading}
          className="px-2.5 py-1.5 rounded-md bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 text-amber-950 dark:text-amber-100 border border-amber-400 dark:border-amber-600 font-bold flex items-center gap-1.5 transition shadow-xs active:scale-95 disabled:opacity-50"
        >
          <Bug className="w-3.5 h-3.5 text-amber-800 dark:text-amber-300 stroke-[2.5]" /> Debug Code
        </button>

        <button
          onClick={() => handleAction("COMPLEXITY")}
          disabled={isLoading}
          className="px-2.5 py-1.5 rounded-md bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-950 dark:text-emerald-100 border border-emerald-400 dark:border-emerald-600 font-bold flex items-center gap-1.5 transition shadow-xs active:scale-95 disabled:opacity-50"
        >
          <Cpu className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-300 stroke-[2.5]" /> Complexity
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={m.role === "copilot" ? { fontWeight: 700 } : { fontWeight: 400 }}
            className={`p-3.5 rounded-xl max-w-[92%] whitespace-pre-wrap leading-relaxed shadow-sm text-xs ${
              m.role === "user"
                ? "ml-auto bg-purple-600 text-white font-normal border border-purple-500 shadow-purple-500/10"
                : "mr-auto bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-800/80 text-slate-950 dark:text-slate-50 font-bold tracking-normal"
            }`}
          >
            {m.content}
          </div>
        ))}
        {isLoading && (
          <div
            style={{ fontWeight: 700 }}
            className="p-3.5 rounded-xl mr-auto bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-800/80 text-purple-900 dark:text-purple-200 font-bold text-xs flex items-center gap-2 shadow-sm"
          >
            <Loader2 className="w-4 h-4 animate-spin text-purple-600 dark:text-purple-400" />
            <span>Analyzing code structure...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-border bg-white dark:bg-card flex items-center gap-2 shadow-sm">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAction("CUSTOM")}
          placeholder="Ask PlacementAI Copilot a question..."
          className="flex-1 bg-white dark:bg-background border-2 border-slate-300 dark:border-border rounded-lg px-3.5 py-2.5 text-sm font-normal text-slate-900 dark:text-white placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-muted-foreground focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 shadow-xs"
        />
        <Button
          size="sm"
          onClick={() => handleAction("CUSTOM")}
          disabled={isLoading || !inputMessage.trim()}
          style={{ fontWeight: 700 }}
          className="h-10 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
