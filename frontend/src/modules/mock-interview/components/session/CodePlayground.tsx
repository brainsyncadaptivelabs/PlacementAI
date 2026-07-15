"use client";

import React from "react";
import { useInterviewStateContext, CallStatus } from "./InterviewContexts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Play } from "lucide-react";
import api from "@/lib/api";

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

  const runCode = async () => {
    setIsExecuting(true);
    setTerminalOutput("Compiling and running code...\n");

    const currentConfig: Record<string, { language: string; filename: string }> = {
      javascript: { language: "javascript", filename: "main.js" },
      python: { language: "python", filename: "main.py" },
      java: { language: "java", filename: "Main.java" },
      "c++": { language: "c++", filename: "main.cpp" },
    };
    
    const config = currentConfig[activeLang] || { language: "javascript", filename: "main.js" };

    try {
      const response = await api.post("/coding/execute", {
        language: config.language,
        version: "*",
        files: [{ name: config.filename, content: code }],
        stdin: ""
      });

      const data = response.data;
      let outputStr = "";

      if (data.compile && data.compile.stderr) {
        outputStr += data.compile.stderr;
        outputStr += `\n[Compilation failed with code ${data.compile.code ?? 1}]`;
      } else if (data.run) {
        if (data.run.stdout) {
          outputStr += data.run.stdout;
        }
        if (data.run.stderr) {
          outputStr += data.run.stderr;
        }
        const exitCode = data.run.code !== undefined && data.run.code !== null ? data.run.code : 0;
        outputStr += `\n[Process exited with code ${exitCode}]`;
      } else {
        outputStr += "Execution finished with no output.";
      }

      setTerminalOutput(outputStr);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Execution failed";
      setTerminalOutput(`\n[Error: ${errorMsg}]`);
    } finally {
      setIsExecuting(false);
    }
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
