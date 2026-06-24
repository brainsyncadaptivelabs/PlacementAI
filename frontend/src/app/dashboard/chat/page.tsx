"use client";

import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { Avatar } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Send, 
  Sparkles, 
  User, 
  Copy, 
  Check, 
  RotateCcw, 
  ThumbsUp, 
  ThumbsDown, 
  Loader2, 
  MoreHorizontal,
  Trash2,
  Paperclip
} from "lucide-react";
import { useUser } from "@/hooks/use-user";

type Message = {
  id: number;
  role: "user" | "ai";
  content: string;
  time: string;
};

// Safe Markdown Error Boundary with plain text fallback
class SafeMarkdownBoundary extends React.Component<
  { children: React.ReactNode; fallbackText: string },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ReactMarkdown rendering crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Safe Plain Text Renderer (cleans markdown artifacts)
      const cleanText = this.props.fallbackText
        .replace(/[#*`~_\[\]()\-]/g, "") // strip markdown tokens
        .replace(/\n\s*\n/g, "\n\n");
      return (
        <div 
          className="font-sans text-foreground leading-[1.9] text-[16px]"
          style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
        >
          {cleanText}
        </div>
      );
    }
    return this.props.children;
  }
}

// Markdown Normalizer Helper
const normalizeMarkdown = (text: string): string => {
  if (!text) return "";
  
  // CRLF -> LF
  let result = text.replace(/\r\n/g, "\n");
  
  // Convert escaped literal '\n' to actual line feed
  result = result.replace(/\\n/g, "\n");
  
  // Clean up duplicate bold asterisks (**** or more)
  result = result.replace(/\*{4,}/g, "**");

  // Fix collapsed adjacent bold markers
  result = result.replace(/\*\*\*\*/g, "** **");

  // Fix headings with no space, e.g. ##Heading to ## Heading
  result = result.replace(/^(#{1,3})([A-Za-z0-9])/gm, "$1 $2");

  // Convert bullet point character "•" to standard markdown bullet "-"
  result = result.replace(/^[ \t]*•[ \t]*/gm, "- ");

  // Collapse repeated blank lines (3 or more newlines to 2 newlines)
  result = result.replace(/\n{3,}/g, "\n\n");

  return result;
};

// Redesigned Message Item Component with Premium Bubbles
const MessageItem = memo(({ 
  msg, 
  onCopy, 
  onRegenerate,
  isGenerating = false
}: { 
  msg: Message; 
  onCopy: (content: string) => void;
  onRegenerate?: (content: string) => void;
  isGenerating?: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAi = msg.role === 'ai';

  return (
    <div className="w-full flex justify-center mb-6 last:mb-0 animate-message">
      <div className={`w-full max-w-[1800px] px-6 flex gap-4 ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
        <Avatar className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center border ${isAi ? 'bg-primary border-primary/10 text-white' : 'bg-muted border-border text-muted-foreground'}`}>
          {isAi ? (
            <Sparkles className="w-4.5 h-4.5 text-white" />
          ) : (
            <User className="w-4.5 h-4.5 text-muted-foreground" />
          )}
        </Avatar>
        
        <div className={`flex flex-col ${isAi ? 'items-start w-[92%]' : 'items-end max-w-[70%]'} min-w-0 flex-1`}>
          {/* Metadata */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider">
              {isAi ? 'Career Assistant' : 'You'}
            </span>
            <span className="text-[10px] text-muted-foreground/50 font-medium">
              {msg.time}
            </span>
          </div>

          {/* Bubble Container */}
          <div 
            className={`message-content ${
              isAi 
                ? 'bg-transparent text-foreground border-none shadow-none' 
                : 'bg-slate-900 text-white shadow-sm'
            } w-full`}
            style={{ 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'normal',
              overflowWrap: 'break-word',
              letterSpacing: '-0.01em',
              padding: isAi ? '0' : '16px 24px',
              borderRadius: isAi ? '0' : '24px',
              boxShadow: isAi ? 'none' : undefined,
              border: isAi ? 'none' : undefined,
              display: isAi ? 'flex' : undefined,
              flexDirection: isAi ? 'column' : undefined,
              gap: isAi ? '10px' : undefined,
            }}
          >
            {isAi ? (
              msg.content ? (
                <SafeMarkdownBoundary fallbackText={msg.content}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                    components={{
                      h1: ({children}) => <h1 style={{ fontSize: '34px', fontWeight: 700, lineHeight: '1.1', marginTop: '8px', marginBottom: '14px', color: '#0f172a' }}>{children}</h1>,
                      h2: ({children}) => <h2 style={{ fontSize: '24px', fontWeight: 650, lineHeight: '1.15', marginTop: '18px', marginBottom: '10px', color: '#1e293b' }}>{children}</h2>,
                      h3: ({children}) => <h3 style={{ fontSize: '20px', fontWeight: 600, lineHeight: '1.2', marginTop: '10px', marginBottom: '8px', color: '#334155' }}>{children}</h3>,
                      p: ({children}) => <p style={{ fontSize: '17px', lineHeight: '1.6', fontWeight: 400, marginTop: '0px', marginBottom: '10px', color: '#334155' }}>{children}</p>,
                      ul: ({children}) => <ul style={{ paddingLeft: '18px', marginTop: '6px', marginBottom: '10px', listStyleType: 'disc' }}>{children}</ul>,
                      ol: ({children}) => <ol style={{ paddingLeft: '20px', marginTop: '6px', marginBottom: '10px', listStyleType: 'decimal' }}>{children}</ol>,
                      li: ({children}) => <li style={{ display: 'list-item', marginTop: '0px', marginBottom: '6px', padding: '0px', lineHeight: '1.45', fontSize: '17px', color: '#334155', verticalAlign: 'top' }}>{children}</li>,
                      strong: ({children}) => <strong style={{ fontWeight: 700, color: '#0f172a' }}>{children}</strong>,
                      b: ({children}) => <strong style={{ fontWeight: 700, color: '#0f172a' }}>{children}</strong>,
                      code: ({className, children, ...props}) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match && !String(children).includes('\n');
                        return !isInline ? (
                          <div className="relative my-4 group/code w-full">
                            <div className="absolute right-3 top-3 opacity-0 group-hover/code:opacity-100 transition-opacity">
                              <button 
                                onClick={() => navigator.clipboard.writeText(String(children))}
                                className="p-1.5 rounded-md bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <pre className="bg-zinc-950 text-zinc-50 p-5 rounded-xl overflow-x-auto text-[13px] font-mono leading-relaxed shadow-md border border-white/5">
                              <code className={className}>{children}</code>
                            </pre>
                          </div>
                        ) : (
                          <code className="bg-muted px-2 py-0.5 rounded-md text-primary font-mono text-[0.9em] font-medium" {...props}>{children}</code>
                        );
                      },
                      blockquote: ({children}) => <blockquote style={{ borderLeft: '4px solid #e2e8f0', paddingLeft: '16px', fontStyle: 'italic', margin: '12px 0', color: '#64748b' }}>{children}</blockquote>,
                      table: ({children}) => (
                        <div className="overflow-x-auto my-4 border border-border rounded-lg">
                          <table className="min-w-full divide-y divide-slate-200">{children}</table>
                        </div>
                      ),
                      thead: ({children}) => <thead className="bg-muted">{children}</thead>,
                      tbody: ({children}) => <tbody className="divide-y divide-slate-200 bg-card">{children}</tbody>,
                      tr: ({children}) => <tr>{children}</tr>,
                      th: ({children}) => <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">{children}</th>,
                      td: ({children}) => <td className="px-4 py-2 text-sm text-muted-foreground">{children}</td>
                    }}
                  >
                    {msg.content + (isGenerating ? " ▋" : "")}
                  </ReactMarkdown>
                </SafeMarkdownBoundary>
              ) : (
                <div className="flex gap-1.5 items-center py-2">
                  <div className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce" />
                </div>
              )
            ) : (
              <div style={{ fontSize: '18px', fontWeight: 400, lineHeight: '1.85', letterSpacing: '-0.01em' }}>{msg.content}</div>
            )}
          </div>

          {/* Assistant Actions */}
          {isAi && msg.content && (
            <div className="mt-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button 
                onClick={handleCopy}
                title="Copy response"
                className={`p-1.5 rounded-md transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
                  copied ? 'text-green-600 bg-green-50' : 'text-muted-foreground/70 hover:text-primary hover:bg-muted'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
              {onRegenerate && (
                <button 
                  onClick={() => onRegenerate(msg.content)}
                  title="Regenerate response"
                  className="p-1.5 rounded-md text-muted-foreground/70 hover:text-primary hover:bg-muted transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Regenerate
                </button>
              )}
              <div className="w-px h-3 bg-slate-200 mx-1" />
              <button className="p-1.5 rounded-md text-muted-foreground/70 hover:text-green-600 hover:bg-muted transition-all" title="Like response">
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-md text-muted-foreground/70 hover:text-red-500 hover:bg-muted transition-all" title="Dislike response">
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

MessageItem.displayName = "MessageItem";

export default function ChatPage() {
  const { user, loading: userLoading } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [generationState, setGenerationState] = useState<"IDLE" | "GENERATING" | "COMPLETE" | "STOPPED">("IDLE");
  const generationComplete = generationState !== "GENERATING";
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const limitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stuckTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (limitTimerRef.current) clearTimeout(limitTimerRef.current);
      if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current);
    };
  }, []);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (limitTimerRef.current) {
      clearTimeout(limitTimerRef.current);
      limitTimerRef.current = null;
    }
    if (stuckTimerRef.current) {
      clearTimeout(stuckTimerRef.current);
      stuckTimerRef.current = null;
    }
    setGenerationState("STOPPED");
    setIsTyping(false);
    setTimeout(() => setGenerationState("IDLE"), 100);
  };
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isAutoScrollEnabled = useRef(true);

  const scrollToBottom = useCallback((force = false, smooth = false) => {
    if (scrollAreaRef.current && (isAutoScrollEnabled.current || force)) {
      const scrollContainer = scrollAreaRef.current;
      setTimeout(() => {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: smooth ? "smooth" : "auto"
        });
      }, 50);
    }
  }, []);

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;
      isAutoScrollEnabled.current = isAtBottom;
    }
  };

  useEffect(() => {
    if (generationState === "GENERATING") {
      scrollToBottom(false, false);
    } else if (generationState === "COMPLETE") {
      scrollToBottom(true, true);
    }
  }, [messages, isTyping, generationState, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
    }
  }, [input]);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleSend = async (retryCount = 0, overrideInput?: string) => {
    const finalInput = (overrideInput || input).trim();
    if (!finalInput && retryCount === 0) return;
    if (generationState === "GENERATING" && retryCount === 0) return;

    const historyList = messages.slice(-10).map(m => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.content
    }));

    if (retryCount === 0) {
      const userMsg: Message = {
        id: Date.now(),
        role: "user",
        content: finalInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, userMsg]);
      setInput("");
      setGenerationState("GENERATING");
      isAutoScrollEnabled.current = true;
    }

    setIsTyping(true);
    const aiMsgId = retryCount === 0 ? Date.now() + 1 : messages[messages.length - 1].id;
    
    if (retryCount === 0) {
      const aiMsg: Message = {
        id: aiMsgId,
        role: "ai",
        content: "",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    }

    let fullContent = retryCount > 0 ? messages.find(m => m.id === aiMsgId)?.content || "" : "";

    // Dynamic prompt-specific timeouts
    const promptLower = finalInput.toLowerCase();
    let timeLimit = 12000; // default 12s
    if (
      finalInput.length < 15 || 
      promptLower === "hi" || 
      promptLower === "hello" || 
      promptLower === "ok" || 
      promptLower.split(/\s+/).length < 4
    ) {
      timeLimit = 5000; // short prompt: 5s
    } else if (
      promptLower.includes("resume") || 
      promptLower.includes("roadmap") || 
      promptLower.includes("interview") || 
      promptLower.includes("analysis") || 
      finalInput.length > 100
    ) {
      timeLimit = 20000; // long/complex prompts: 20s
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (limitTimerRef.current) {
      clearTimeout(limitTimerRef.current);
    }
    limitTimerRef.current = setTimeout(() => {
      console.warn("Time limit exceeded, aborting fetch stream.");
      controller.abort();
      if (stuckTimerRef.current) {
        clearTimeout(stuckTimerRef.current);
        stuckTimerRef.current = null;
      }
      setMessages(prev => prev.map(m => {
        if (m.id === aiMsgId) {
          return { ...m, content: normalizeMarkdown(m.content) };
        }
        return m;
      }));
      setGenerationState("COMPLETE");
      setTimeout(() => setGenerationState("IDLE"), 100);
    }, timeLimit);

    try {
      const token = localStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";
      
      const response = await fetch(`${API_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          question: finalInput,
          history: historyList
        }),
        signal: controller.signal
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      
      if (reader) {
        setIsTyping(false);
        let streamBuffer = "";

        const resetStuckTimer = () => {
          if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current);
          stuckTimerRef.current = setTimeout(() => {
            console.warn("Stuck loading (6s without chunk), aborting stream.");
            controller.abort();
            setGenerationState("COMPLETE");
            setTimeout(() => setGenerationState("IDLE"), 100);
          }, 6000);
        };

        resetStuckTimer();
        
        while (true) {
          const { done, value } = await reader.read();
          if (stuckTimerRef.current) {
            clearTimeout(stuckTimerRef.current);
            stuckTimerRef.current = null;
          }
          
          if (value) {
            resetStuckTimer();
            const rawChunk = decoder.decode(value, { stream: true });
            streamBuffer += rawChunk;

            // Split buffer strictly by event boundary (\n\n) per SSE spec
            const parts = streamBuffer.split(/\n\s*\n/);
            streamBuffer = parts.pop() || "";
            
            let contentUpdated = false;
            let currentAssembled = "";
            for (const part of parts) {
              if (!part.trim()) continue;
              const lines = part.split(/\r?\n/);
              const dataLines: string[] = [];
              for (const line of lines) {
                if (line.startsWith(':')) {
                  // Ignore comments
                  continue;
                }
                if (line.startsWith('data:')) {
                  dataLines.push(line.slice(5));
                }
              }
              if (dataLines.length > 0) {
                const chunk = dataLines.join('\n');
                fullContent += chunk;
                currentAssembled += chunk;
                contentUpdated = true;
              }
            }

            if (contentUpdated) {
              console.debug("rawChunk:", rawChunk, "assembledText:", currentAssembled, "renderedText:", fullContent);

              // Token threshold check
              if (fullContent.length > 4000) {
                console.warn("Token threshold exceeded, stopping stream.");
                controller.abort();
                if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current);
                if (limitTimerRef.current) clearTimeout(limitTimerRef.current);
                setGenerationState("COMPLETE");
                setTimeout(() => setGenerationState("IDLE"), 100);
                break;
              }

              // Repetition / Anti-Loop protection
              const checkRepetition = (text: string): boolean => {
                const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
                if (paragraphs.length >= 2) {
                  const lastPara = paragraphs[paragraphs.length - 1];
                  if (lastPara.length > 20) {
                    for (let i = 0; i < paragraphs.length - 1; i++) {
                      if (paragraphs[i] === lastPara) return true;
                    }
                  }
                }
                const sentences = text.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 12);
                if (sentences.length >= 3) {
                  const lastSent = sentences[sentences.length - 1];
                  let occurrences = 0;
                  for (const s of sentences) {
                    if (s === lastSent) occurrences++;
                  }
                  if (occurrences >= 2) return true;
                }
                if (text.length > 50) {
                  const tail = text.slice(-25);
                  const body = text.slice(0, -25);
                  if (body.includes(tail)) return true;
                }
                return false;
              };

              if (checkRepetition(fullContent)) {
                controller.abort();
                if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current);
                if (limitTimerRef.current) clearTimeout(limitTimerRef.current);
                
                // Trim the repetitive content
                let trimmedContent = fullContent;
                const paragraphs = fullContent.split(/\n\s*\n/);
                if (paragraphs.length >= 2) {
                  const lastPara = paragraphs[paragraphs.length - 1].trim();
                  const previousParas = paragraphs.slice(0, -1).map(p => p.trim());
                  if (previousParas.includes(lastPara) && lastPara.length > 20) {
                    trimmedContent = paragraphs.slice(0, -1).join("\n\n");
                  }
                }
                
                const finalNormalized = normalizeMarkdown(trimmedContent);
                console.debug("[SSE Repetition Halt] Final Normalized:", finalNormalized);

                setMessages(prev => prev.map(m => 
                  m.id === aiMsgId ? { ...m, content: finalNormalized } : m
                ));
                setGenerationState("COMPLETE");
                setTimeout(() => setGenerationState("IDLE"), 100);
                break;
              }

              setMessages(prev => prev.map(m => 
                m.id === aiMsgId ? { ...m, content: normalizeMarkdown(fullContent) } : m
              ));
            }
          }

          if (done) {
            if (stuckTimerRef.current) {
              clearTimeout(stuckTimerRef.current);
              stuckTimerRef.current = null;
            }
            if (limitTimerRef.current) {
              clearTimeout(limitTimerRef.current);
              limitTimerRef.current = null;
            }

            streamBuffer += decoder.decode();

            if (streamBuffer) {
              const lines = streamBuffer.split(/\r?\n/);
              const dataLines: string[] = [];
              for (const line of lines) {
                if (line.startsWith(':')) continue;
                if (line.startsWith('data:')) {
                  dataLines.push(line.slice(5));
                }
              }
              if (dataLines.length > 0) {
                fullContent += dataLines.join('\n');
              }
            }

            const finalNormalized = normalizeMarkdown(fullContent);
            console.debug("[SSE Stream Complete] Final Normalized:", finalNormalized);

            setMessages(prev => prev.map(m => 
              m.id === aiMsgId ? { ...m, content: finalNormalized } : m
            ));

            setGenerationState("COMPLETE");
            setTimeout(() => setGenerationState("IDLE"), 100);
            scrollToBottom(true, true);
            break;
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log("Fetch aborted.");
        return;
      }
      console.error("Chat error:", error);
      if (retryCount < 1 && fullContent === "") {
        setTimeout(() => handleSend(retryCount + 1, finalInput), 500);
      } else {
        const finalNormalized = normalizeMarkdown(fullContent || "An error occurred while generating the response. Please try again.");
        setGenerationState("COMPLETE");
        setTimeout(() => setGenerationState("IDLE"), 100);
        setMessages(prev => prev.map(m => 
          m.id === aiMsgId ? { ...m, content: finalNormalized } : m
        ));
      }
    } finally {
      if (limitTimerRef.current) {
        clearTimeout(limitTimerRef.current);
        limitTimerRef.current = null;
      }
      if (stuckTimerRef.current) {
        clearTimeout(stuckTimerRef.current);
        stuckTimerRef.current = null;
      }
      setIsTyping(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-card">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="h-screen min-h-screen flex flex-col bg-[#f8fafc] relative overflow-hidden">
      
      {/* Sticky Header (64px) */}
      <header className="h-16 shrink-0 flex items-center justify-between px-8 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="md:hidden mr-1 text-muted-foreground hover:text-foreground" />
          <h1 className="text-[16px] font-bold text-foreground tracking-tight">Career Assistant</h1>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">AI Online</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!generationComplete && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 rounded-full border border-primary/10 transition-all animate-in fade-in zoom-in duration-300">
               <Loader2 className="w-3 h-3 text-primary animate-spin" />
               <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Thinking</span>
            </div>
          )}
          <button 
            onClick={handleClearChat}
            title="Clear Conversation"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:text-red-500 hover:bg-muted transition-all text-xs font-semibold"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Chat</span>
          </button>
          <button className="p-2 rounded-xl text-muted-foreground/70 hover:text-muted-foreground hover:bg-muted transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main 
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden selection:bg-primary/10 flex flex-col"
        style={{ height: 'calc(100vh - 64px)' }}
      >
        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
             <div className="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-xl shadow-primary/5">
                <Sparkles className="w-8 h-8" />
             </div>
             <h2 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">👋 Welcome to PlacementAI</h2>
             <div className="text-left bg-card border border-border/60 p-6 rounded-2xl shadow-md max-w-sm w-full mt-4 transform transition-all duration-300 hover:scale-[1.02]">
                <p className="font-semibold text-foreground mb-3 text-base">Ask anything about:</p>
                <ul className="space-y-2.5 text-muted-foreground font-medium">
                  <li className="flex items-center gap-2 text-sm">• Resume</li>
                  <li className="flex items-center gap-2 text-sm">• ATS</li>
                  <li className="flex items-center gap-2 text-sm">• Interviews</li>
                  <li className="flex items-center gap-2 text-sm">• DSA</li>
                  <li className="flex items-center gap-2 text-sm">• Career Roadmaps</li>
                </ul>
             </div>
          </div>
        ) : (
          <div className="flex-1 px-4 py-6 w-full max-w-[1800px] mx-auto">
            {messages.map((msg, index) => (
              <MessageItem 
                key={msg.id} 
                msg={msg} 
                isGenerating={msg.role === 'ai' && index === messages.length - 1 && generationState === "GENERATING"}
                onCopy={handleCopy} 
                onRegenerate={msg.role === 'ai' && index === messages.length - 1 ? () => {
                  const lastUserMsg = messages[index-1];
                  if (lastUserMsg) {
                    handleSend(0, lastUserMsg.content);
                  }
                } : undefined}
              />
            ))}
          </div>
        )}
      </main>

      {/* Sticky Bottom Input Area */}
      <div className="w-full shrink-0 border-t border-border bg-card py-4 shadow-lg shadow-slate-100/40">
        <div className="max-w-[820px] mx-auto px-6 relative">
          <div className="relative flex items-end bg-muted border border-border/80 rounded-[24px] focus-within:border-slate-300 focus-within:ring-1 focus-within:ring-slate-200/50 transition-all p-1.5 pl-4 pr-3 min-h-[56px]">
            {/* Attach button */}
            <button className="p-2 rounded-full text-muted-foreground/70 hover:text-muted-foreground hover:bg-slate-200/50 transition-colors shrink-0 mb-0.5">
              <Paperclip className="w-5 h-5" />
            </button>
            
            {/* Textarea */}
            <textarea 
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={messages.length > 0 ? "Ask another question…" : "Message Career Assistant..."} 
              className="flex-1 bg-transparent border-none focus:ring-0 py-2.5 px-3 text-[16px] text-foreground placeholder:text-slate-450 resize-none min-h-[40px] leading-relaxed align-bottom focus:outline-none"
              rows={1}
              disabled={!generationComplete}
            />
            
            {/* Send / Stop button */}
            {generationState === "GENERATING" ? (
              <button 
                onClick={handleStop}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white shadow-sm shrink-0 mb-0.5 transition-all"
                title="Stop generating"
              >
                <div className="w-3.5 h-3.5 bg-card rounded-xs" />
              </button>
            ) : (
              <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || !generationComplete}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 mb-0.5 ${
                  input.trim() && generationComplete 
                  ? 'bg-black text-white hover:bg-zinc-800 shadow-sm' 
                  : 'bg-muted text-muted-foreground/50'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Suggested Prompts */}
          {isEmpty && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center animate-message">
               {[
                 "Resume Feedback",
                 "Java Roadmap",
                 "Mock Interview",
                 "Salary Tips"
               ].map((p) => (
                 <button 
                   key={p}
                   onClick={() => setInput(p)}
                   className="text-xs font-semibold text-muted-foreground bg-card border border-border/80 px-4 py-2 rounded-2xl hover:bg-muted hover:border-slate-300 transition-all shadow-sm"
                 >
                    {p}
                 </button>
               ))}
            </div>
          )}

          <div className="text-[11px] text-muted-foreground/70 text-center mt-2.5">
            PlacementAI can make mistakes. Consider checking important information.
          </div>
        </div>
      </div>

    </div>
  );
}
