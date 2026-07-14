"use client";

import React, { useRef } from "react";
import { useInterviewStateContext, CallStatus } from "./InterviewContexts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Play } from "lucide-react";

export const CodePlayground = () => {
  const {
    activeLang,
    setActiveLang,
    code,
    setCode,
    terminalOutput,
    setTerminalOutput,
    isExecuting,
    setIsExecuting,
    callStatus,
  } = useInterviewStateContext();

  const wsRef = useRef<WebSocket | null>(null);

  const runCode = () => {
    setIsExecuting(true);
    setTerminalOutput("Connecting to compile engine...\n");

    const wsHost = window.location.hostname;
    const wsUrl = `ws://${wsHost}:2000/api/v2/connect`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    const currentConfig: Record<string, { language: string; filename: string }> = {
      javascript: { language: "javascript", filename: "main.js" },
      python: { language: "python", filename: "main.py" },
      java: { language: "java", filename: "Main.java" },
      "c++": { language: "c++", filename: "main.cpp" },
    };
    
    const config = currentConfig[activeLang] || { language: "javascript", filename: "main.js" };

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "init",
          language: config.language,
          version: "*",
          files: [{ name: config.filename, content: code }],
        })
      );
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "data") {
        setTerminalOutput((prev: string) => prev + msg.data);
      } else if (msg.type === "exit") {
        setIsExecuting(false);
        setTerminalOutput((prev: string) => prev + `\n[Process exited with code ${msg.code ?? msg.signal}]`);
        ws.close();
      } else if (msg.type === "error") {
        setIsExecuting(false);
        setTerminalOutput((prev: string) => prev + `\n[Error: ${msg.message}]`);
        ws.close();
      }
    };

    ws.onerror = () => {
      setIsExecuting(false);
      setTerminalOutput((prev: string) => prev + "\n[Compiler Connection Error. Ensure Piston is running on port 2000.]");
    };

    ws.onclose = () => {
      setIsExecuting(false);
    };
  };

  return (
    <Card className="flex flex-col h-full border border-zinc-800 bg-black/60 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between py-3 border-b border-zinc-900">
        <CardTitle className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
          Coding Playground
        </CardTitle>
        <div className="flex items-center gap-3">
          <select
            value={activeLang}
            onChange={(e) => setActiveLang(e.target.value)}
            className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python 3</option>
            <option value="java">Java 17</option>
            <option value="c++">C++</option>
          </select>
          <Button
            size="sm"
            onClick={runCode}
            disabled={isExecuting || callStatus !== CallStatus.ACTIVE}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
          >
            {isExecuting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Run Code
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 p-3 overflow-hidden">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 font-mono text-sm bg-zinc-950/80 border border-zinc-800 rounded-lg p-3 text-zinc-100 focus:outline-none focus:border-indigo-600 resize-none"
        />
        <div className="h-[120px] rounded-lg border border-zinc-900 bg-black p-3 font-mono text-xs text-zinc-400 overflow-hidden flex flex-col">
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 mb-1">Terminal Output</span>
          <ScrollArea className="flex-1 pr-2">
            <pre className="whitespace-pre-wrap leading-relaxed">{terminalOutput}</pre>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
