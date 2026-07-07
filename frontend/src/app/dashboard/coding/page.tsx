"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Code2, Play, Terminal, Square } from "lucide-react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

const languageSnippets: Record<string, { language: string, filename: string, code: string }> = {
  javascript: {
    language: "javascript",
    filename: "main.js",
    code: ""
  },
  python: {
    language: "python",
    filename: "main.py",
    code: ""
  },
  java: {
    language: "java",
    filename: "Main.java",
    code: ""
  },
  c: {
    language: "c",
    filename: "main.c",
    code: ""
  },
  "c++": {
    language: "c++",
    filename: "main.cpp",
    code: ""
  }
};

const PythonLogo = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.23 2c-3.14 0-4.8 1.73-4.8 4.7v1.54h4.94v.85H5.16C3.33 9.09 2 10.4 2 13.06v3.25c0 2.66 1.78 4.54 4.6 4.54h1.53v-2.45c0-2.34 1.94-4.28 4.28-4.28h4.74c2.34 0 4.28-1.94 4.28-4.28V6.7c0-2.97-2.37-4.7-5.5-4.7zm-2.02 2c.5 0 .91.4.91.9a.91.91 0 0 1-.9.91.91.91 0 0 1-.91-.9c0-.5.4-.91.9-.91z" fill="#3776AB" />
    <path d="M11.77 22c3.14 0 4.8-1.73 4.8-4.7v-1.54h-4.94v-.85h7.21c1.83 0 3.16-1.31 3.16-3.97V9.69c0-2.66-1.78-4.54-4.6-4.54h-1.53v2.45c0 2.34-1.94 4.28-4.28 4.28H7.35c-2.34 0-4.28 1.94-4.28 4.28v3.13c0 2.97 2.37 4.7 5.5 4.7zM13.8 18c-.5 0-.91-.4-.91-.9a.91.91 0 0 1 .9-.91.91.91 0 0 1 .91.9c0 .5-.4.91-.9.91z" fill="#FFD343" />
  </svg>
);

const CLogo = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="11" fill="#00599C" />
    <path d="M16 8.5C15 7.5 13.5 7 12 7c-2.8 0-5 2.2-5 5s2.2 5 5 5c1.5 0 3-.5 4-1.5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const CppLogo = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="11" fill="#004482" />
    <path d="M12 9C11.3 8.1 10.2 7.6 9 7.6c-2.4 0-4.4 2-4.4 4.4s2 4.4 4.4 4.4c1.2 0 2.3-.5 3-1.4" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
    <path d="M13.5 12h2.5M14.7 10.8v2.4" stroke="#659AD2" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M17.5 12h2.5M18.7 10.8v2.4" stroke="#659AD2" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const JavaLogo = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 11c0-1.8 1.8-2.5 4.5-2.5s4.5.7 4.5 2.5v3.5c0 2.5-1.8 4-4.5 4s-4.5-1.5-4.5-4V11z" fill="#5382A1" />
    <path d="M15 11.5c1.2 0 2 .8 2 2s-.8 2-2 2" stroke="#5382A1" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M8 5.5c.3-.8.7-.8 1 0s.7.8 1 0M10.5 5.5c.3-.8.7-.8 1 0s.7.8 1 0" stroke="#E76F00" strokeWidth="2" strokeLinecap="round"/>
    <path d="M4.5 18.5c2.5 1.2 8.5 1.2 11 0" stroke="#E76F00" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const JSLogo = () => (
  <svg className="w-6 h-6 rounded-md" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#F7DF1E" />
    <text x="21" y="20" fill="black" fontSize="12" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="end">JS</text>
  </svg>
);

const languages = [
  { id: "python", name: "Python 3", logo: <PythonLogo /> },
  { id: "c", name: "C", logo: <CLogo /> },
  { id: "c++", name: "C++", logo: <CppLogo /> },
  { id: "java", name: "Java", logo: <JavaLogo /> },
  { id: "javascript", name: "JavaScript", logo: <JSLogo /> }
];

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const textareaRefCallback = (node: HTMLTextAreaElement | null) => {
    if (node) {
      node.style.setProperty('border-radius', '0px', 'important');
      node.style.setProperty('background-color', 'transparent', 'important');
      node.style.setProperty('border', 'none', 'important');
      node.style.setProperty('box-shadow', 'none', 'important');
      node.style.setProperty('outline', 'none', 'important');
      node.style.setProperty('height', '100%', 'important');
      node.style.setProperty('width', '100%', 'important');
      (textareaRef as any).current = node;
    }
  };

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
        run_timeout: 60000,
        files: [{ name: currentConfig.filename, content: code }]
      }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "data") {
        setTerminalOutput(prev => [...prev, { text: msg.data, type: msg.stream === "stderr" ? "err" : "out" }]);
      } else if (msg.type === "exit") {
        if (msg.stage === "compile" && msg.code !== 0) {
          setIsExecuting(false);
          setTerminalOutput(prev => [...prev, { text: `\n[Compilation failed with code ${msg.code ?? msg.signal}]`, type: "sys" }]);
          ws.close();
        } else if (msg.stage === "run" || !msg.stage) {
          setIsExecuting(false);
          setTerminalOutput(prev => [...prev, { text: `\n[Process exited with code ${msg.code ?? msg.signal}]`, type: "sys" }]);
          ws.close();
        }
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
      if (wsRef.current.readyState !== WebSocket.OPEN) return;
      
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
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col bg-background border-t border-border">
      <div className="flex items-center justify-between gap-4 px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary" /> Interactive Coding
          </h1>
        </div>
      </div>

      <div className="bg-background flex flex-1 min-h-0">
        {/* 1. Language Sidebar */}
        <div className="w-16 bg-card border-r border-border/60 flex flex-col items-center py-6 gap-4 shrink-0">
          {languages.map((lang) => {
            const isActive = activeLang === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => {
                  setActiveLang(lang.id);
                  setCode(languageSnippets[lang.id].code);
                  setTerminalOutput([]);
                  if (isExecuting) stopExecution();
                }}
                disabled={isExecuting}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isActive 
                    ? "bg-accent border border-border scale-105 shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(255,255,255,0.05)] ring-2 ring-primary ring-offset-2 ring-offset-background" 
                    : "opacity-60 dark:opacity-50 hover:opacity-100 hover:scale-102"
                }`}
                title={lang.name}
              >
                {lang.logo}
              </button>
            );
          })}
        </div>

        {/* 2. Main Workspace */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* 2a. Top Header Bar */}
          <div className="h-14 bg-card border-b border-border/60 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2 h-full">
              {/* Active Tab */}
              <div className="h-full border-r border-border/60 px-4 flex items-center bg-background text-foreground border-t-2 border-t-primary text-sm font-semibold">
                {languageSnippets[activeLang].filename}
              </div>
            </div>
            
            {/* Editor Controls */}
            <div className="flex items-center gap-3">
              {isExecuting ? (
                <Button 
                  onClick={stopExecution} 
                  variant="destructive" 
                  size="sm" 
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md px-4 py-1.5"
                >
                  <Square className="w-4 h-4 mr-1.5 fill-current" /> Stop
                </Button>
              ) : (
                <Button 
                  onClick={executeCode} 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md px-5 py-1.5"
                >
                  <Play className="w-4 h-4 mr-1.5 fill-current" /> Run
                </Button>
              )}
            </div>
          </div>

          {/* 2b. Split Pane Content */}
          <ResizablePanelGroup orientation="horizontal" className="flex-1 min-h-0 bg-background">
            
            {/* Column 1: Editor */}
            <ResizablePanel defaultSize={60} minSize={30} className="flex flex-col h-full min-h-0">
              <div className="h-full w-full relative bg-background">
                <textarea
                  ref={textareaRefCallback}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                  }}
                  className="absolute inset-0 w-full h-full p-4 font-mono text-sm leading-6 resize-none text-foreground bg-transparent"
                  spellCheck={false}
                  disabled={isExecuting}
                  placeholder="// Write your code here..."
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle className="bg-border w-1.5 hover:bg-primary/50 transition-colors" />

            {/* Column 2: Terminal/Output */}
            <ResizablePanel defaultSize={40} minSize={20} className="flex flex-col bg-muted/30 min-h-0">
              
              {/* Terminal Header */}
              <div className="h-10 bg-muted/60 border-b border-border/50 flex items-center justify-between px-4 shrink-0">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Output</span>
                <div className="flex items-center gap-3">
                  {isExecuting && (
                    <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> RUNNING
                    </span>
                  )}
                  <Button
                    onClick={() => setTerminalOutput([])}
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground px-2 py-0.5 h-7"
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Terminal Content */}
              <div 
                className="flex-1 p-4 overflow-y-auto font-mono text-sm flex flex-col cursor-text bg-muted/10"
                onClick={() => {
                  if (isExecuting) {
                    inputRef.current?.focus();
                  }
                }}
              >
                <div className="flex-1">
                  {terminalOutput.length === 0 && !isExecuting && (
                    <div className="text-muted-foreground/60 h-full flex items-center justify-center italic text-xs">
                      Run your code to interact with the terminal.
                    </div>
                  )}
                  {terminalOutput.map((line, i) => (
                    <span key={i} className={
                      line.type === 'err' ? 'text-red-500 dark:text-red-400' :
                      line.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' :
                      line.type === 'sys' ? 'text-muted-foreground italic' :
                      'text-foreground'
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
              </div>

            </ResizablePanel>

          </ResizablePanelGroup>

        </div>
      </div>
    </div>
  );
}
