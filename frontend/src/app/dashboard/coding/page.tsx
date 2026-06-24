"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Code2, Play, Terminal, Square } from "lucide-react";

const languageSnippets: Record<string, { language: string, filename: string, code: string }> = {
  javascript: {
    language: "javascript",
    filename: "main.js",
    code: `const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('What is your name? ', (name) => {
  console.log(\`Hello, \${name}!\`);
  rl.close();
});`
  },
  python: {
    language: "python",
    filename: "main.py",
    code: `import sys

print('What is your name? ', end='', flush=True)
name = sys.stdin.readline().strip()
print(f'Hello, {name}!')`
  },
  java: {
    language: "java",
    filename: "Main.java",
    code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter your name: ");
        if (scanner.hasNextLine()) {
            String name = scanner.nextLine();
            System.out.println("Hello, " + name + "!");
        }
        scanner.close();
    }
}`
  },
  c: {
    language: "c",
    filename: "main.c",
    code: `#include <stdio.h>

int main() {
    char name[100];
    printf("Enter your name: ");
    fflush(stdout);
    if (scanf("%99s", name) == 1) {
        printf("Hello, %s!\\n", name);
    }
    return 0;
}`
  },
  "c++": {
    language: "c++",
    filename: "main.cpp",
    code: `#include <iostream>
#include <string>

using namespace std;

int main() {
    string name;
    cout << "Enter your name: ";
    if (cin >> name) {
        cout << "Hello, " << name << "!" << endl;
    }
    return 0;
}`
  }
};

type TerminalLine = {
  text: string;
  type: 'out' | 'err' | 'in' | 'sys';
};

export default function CodingPracticePage() {
  const [activeLang, setActiveLang] = useState<string>("javascript");
  const [code, setCode] = useState(languageSnippets["javascript"].code);
  const [terminalOutput, setTerminalOutput] = useState<TerminalLine[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (isExecuting) {
      inputRef.current?.focus();
    }
  }, [terminalOutput, isExecuting]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    setActiveLang(lang);
    setCode(languageSnippets[lang].code);
    setTerminalOutput([]);
    if (isExecuting) stopExecution();
  };

  const stopExecution = () => {
    if (wsRef.current && isExecuting) {
      wsRef.current.send(JSON.stringify({ type: "signal", signal: "SIGKILL" }));
    }
  };

  const executeCode = () => {
    setIsExecuting(true);
    setTerminalOutput([{ text: "Starting execution environment...\n", type: "sys" }]);

    const currentConfig = languageSnippets[activeLang];
    
    const wsHost = window.location.hostname;
    const wsUrl = `ws://${wsHost}:2000/api/v2/connect`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

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
        setTerminalOutput(prev => [...prev, { text: msg.data, type: msg.stream === "stderr" ? "err" : "out" }]);
      } else if (msg.type === "exit") {
        setIsExecuting(false);
        setTerminalOutput(prev => [...prev, { text: `\n[Process exited with code ${msg.code ?? msg.signal}]`, type: "sys" }]);
        ws.close();
      } else if (msg.type === "error") {
        setIsExecuting(false);
        setTerminalOutput(prev => [...prev, { text: `\n[Error: ${msg.message}]`, type: "err" }]);
        ws.close();
      }
    };

    ws.onerror = () => {
      setIsExecuting(false);
      setTerminalOutput(prev => [...prev, { text: "\n[WebSocket connection failed. Ensure Piston is running on port 2000.]", type: "err" }]);
    };

    ws.onclose = () => {
      setIsExecuting(false);
    };
  };

  const handleTerminalInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && wsRef.current && isExecuting) {
      const val = inputVal + '\n';
      wsRef.current.send(JSON.stringify({
        type: "data",
        stream: "stdin",
        data: val
      }));
      setTerminalOutput(prev => [...prev, { text: val, type: "in" }]);
      setInputVal("");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
            <Code2 className="w-6 h-6 text-primary" /> Interactive Coding
          </h1>
          <p className="text-muted-foreground">Write code and interact with it in real-time.</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={activeLang} 
            onChange={handleLanguageChange}
            className="h-10 px-3 rounded-md border border-border bg-card text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            disabled={isExecuting}
          >
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="python">Python 3</option>
            <option value="java">Java</option>
            <option value="c">C (GCC)</option>
            <option value="c++">C++ (GCC)</option>
          </select>
          {isExecuting ? (
            <Button onClick={stopExecution} variant="destructive" className="bg-red-500 hover:bg-red-600">
              <Square className="w-4 h-4 mr-2" /> Stop
            </Button>
          ) : (
            <Button onClick={executeCode} className="bg-primary hover:bg-primary/90">
              <Play className="w-4 h-4 mr-2" /> Run Code
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
        {/* Editor Area */}
        <Card className="border-none shadow-sm flex flex-col overflow-hidden">
          <CardHeader className="p-4 border-b border-border bg-muted">
            <CardTitle className="text-sm font-bold flex justify-between items-center">
              <span>{languageSnippets[activeLang].filename}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 relative">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full p-4 font-mono text-sm resize-none border-none focus-visible:ring-0 rounded-none bg-slate-900 text-slate-100"
              spellCheck={false}
              disabled={isExecuting}
            />
          </CardContent>
        </Card>

        {/* Interactive Terminal Area */}
        <Card className="border-none shadow-sm flex flex-col overflow-hidden bg-[#1E1E1E]">
          <CardHeader className="p-4 border-b border-[#2D2D2D] bg-[#252526] flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
               <Terminal className="w-4 h-4" /> Terminal
            </CardTitle>
            {isExecuting && (
               <span className="flex items-center gap-2 text-emerald-400 text-xs font-bold animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" /> RUNNING
               </span>
            )}
          </CardHeader>
          <CardContent 
            className="p-4 flex-1 overflow-y-auto font-mono text-sm flex flex-col cursor-text"
            onClick={() => {
              if (isExecuting) {
                inputRef.current?.focus();
              }
            }}
          >
            <div className="flex-1">
               {terminalOutput.length === 0 && !isExecuting && (
                  <div className="text-muted-foreground h-full flex items-center justify-center italic">
                     Run your code to interact with the terminal.
                  </div>
               )}
               {terminalOutput.map((line, i) => (
                  <span key={i} className={
                     line.type === 'err' ? 'text-red-400' :
                     line.type === 'in' ? 'text-emerald-400' :
                     line.type === 'sys' ? 'text-muted-foreground italic' :
                     'text-muted-foreground/50'
                  } style={{ whiteSpace: 'pre-wrap' }}>
                     {line.text}
                  </span>
               ))}
               <div ref={terminalEndRef} />
            </div>
            {isExecuting && (
               <div className="mt-2 flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">{">"}</span>
                  <Input 
                     ref={inputRef}
                     value={inputVal}
                     onChange={(e) => setInputVal(e.target.value)}
                     onKeyDown={handleTerminalInput}
                     className="flex-1 h-8 bg-transparent border-none text-emerald-400 focus-visible:ring-0 p-0 rounded-none shadow-none font-mono text-sm caret-emerald-400"
                     placeholder="Type input and press Enter..."
                     autoFocus
                  />
               </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
