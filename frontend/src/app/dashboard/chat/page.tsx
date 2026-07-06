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
  Trash2, 
  Paperclip, 
  Share, 
  Sun, 
  Moon, 
  AlertTriangle, 
  ArrowRight, 
  Bell, 
  Sliders,
  Plus,
  Zap,
  Flame,
  Award,
  Target
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useTheme } from "next-themes";
import { WidgetRenderer } from "@/components/chat/widgets/index";
import { useConversationManager } from "@/components/chat/useConversationManager";
import { Message } from "@/components/chat/ConversationStorage";
import { CommandPalette } from "@/components/chat/command/CommandPalette";
import { WorkspaceTabs } from "@/components/workspace/WorkspaceTabs";
import { NotificationCenter } from "@/components/workspace/NotificationCenter";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/store/toast-store";

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
      const cleanText = this.props.fallbackText
        .replace(/[#*`~_\[\]()\-]/g, "")
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
  let result = text.replace(/\r\n/g, "\n");
  result = result.replace(/\\n/g, "\n");
  result = result.replace(/\*{4,}/g, "**");
  result = result.replace(/\*\*\*\*\*/g, "** **");
  result = result.replace(/^(#{1,3})([A-Za-z0-9])/gm, "$1 $2");
  result = result.replace(/^[ \t]*•[ \t]*/gm, "- ");
  result = result.replace(/\n{3,}/g, "\n\n");
  return result;
};

// JSON extractor helper
const extractJsonFromMarkdown = (content: string): string => {
  if (!content) return "";
  const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = content.match(jsonBlockRegex);
  if (match && match[1]) {
    return match[1].trim();
  }
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return content.substring(start, end + 1).trim();
  }
  return content.trim();
};

// Premium Code Block Component
const CodeBlock = memo(({ className, children }: { className?: string; children: string }) => {
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const [collapsed, setCollapsed] = useState(true);

  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1] : 'code';
  const codeLines = children.trim().split("\n");
  const isLongCode = codeLines.length > 12;

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 group/code w-full border border-border/80 rounded-xl overflow-hidden shadow-sm font-mono text-[13px] leading-relaxed bg-muted text-foreground text-left">
      <div className="flex items-center justify-between px-4 py-2.5 bg-secondary border-b border-border select-none text-[10px] uppercase font-bold text-muted-foreground">
        <span>{lang}</span>
        <div className="flex items-center gap-3.5 opacity-80 group-hover/code:opacity-100 transition-opacity">
          <button onClick={() => setWordWrap(!wordWrap)} className="hover:text-foreground transition-colors cursor-pointer">
            {wordWrap ? "No Wrap" : "Wrap"}
          </button>
          <button onClick={handleCopy} className="hover:text-foreground transition-colors cursor-pointer">
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>
      </div>
      <div className={`overflow-x-auto w-full ${isLongCode && collapsed ? "max-h-60" : "max-h-none"}`} style={{ whiteSpace: wordWrap ? "pre-wrap" : "pre" }}>
        <pre className="p-4 bg-transparent m-0 overflow-visible text-foreground"><code>{children}</code></pre>
      </div>
      {isLongCode && (
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="w-full py-1.5 bg-secondary hover:bg-secondary/80 border-t border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors text-center cursor-pointer"
        >
          {collapsed ? `Expand Snippet (${codeLines.length - 12} more lines)` : "Collapse Snippet"}
        </button>
      )}
    </div>
  );
});
CodeBlock.displayName = "CodeBlock";

// Redesigned Message Item Component with Premium Bubbles
const MessageItem = memo(({ 
  msg, 
  onCopy, 
  onRegenerate,
  onEdit,
  isGenerating = false,
  feedbackState,
  onFeedback
}: { 
  msg: Message; 
  onCopy: (content: string) => void;
  onRegenerate?: (content: string) => void;
  onEdit?: (id: number, content: string) => void;
  isLoading?: boolean;
  feedbackState?: 'like' | 'dislike';
  onFeedback?: (type: 'like' | 'dislike') => void;
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(msg.content);

  const handleCopy = () => {
    onCopy(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(msg.content);
  };

  const isAi = msg.role === 'ai';

  return (
    <div className="w-full flex justify-center mb-6 last:mb-0 animate-message group/msg relative">
      <div className={`w-full max-w-[1200px] px-6 flex gap-4 ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
        <Avatar className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center border ${isAi ? 'bg-indigo-50 border-indigo-100 text-indigo-650' : 'bg-muted border-border text-muted-foreground'}`}>
          {isAi ? (
            <Sparkles className="w-4 h-4 text-indigo-650" />
          ) : (
            <User className="w-4 h-4 text-muted-foreground" />
          )}
        </Avatar>
        
        <div className={`flex flex-col ${isAi ? 'items-start w-[92%]' : 'items-end max-w-[75%]'} min-w-0 flex-1 relative`}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-muted-foreground/75 uppercase tracking-wider">
              {isAi ? 'AI Career Copilot' : 'You'}
            </span>
            <span className="text-[10px] text-muted-foreground/50 font-medium">
              {msg.time}
            </span>
          </div>

          <div 
            className={`message-content bg-transparent text-foreground ${isAi ? 'w-full' : 'w-fit text-right'}`}
            style={{ 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'normal',
              overflowWrap: 'break-word',
              letterSpacing: '-0.01em',
              padding: '8px 0px',
              borderRadius: '0px',
              display: isAi ? 'flex' : undefined,
              flexDirection: isAi ? 'column' : undefined,
              gap: isAi ? '10px' : undefined,
            }}
          >
            {!isAi && isEditing ? (
              <div className="w-full flex flex-col gap-2 bg-secondary border border-border p-3 rounded-2xl">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-transparent outline-none border-0 text-foreground text-sm resize-none min-h-[60px]"
                />
                <div className="flex justify-end gap-2 text-xs font-bold">
                  <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 rounded-lg border border-border hover:bg-secondary cursor-pointer">Cancel</button>
                  <button onClick={() => { if (onEdit) onEdit(msg.id, editText); setIsEditing(false); }} className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-foreground cursor-pointer">Save & Resend</button>
                </div>
              </div>
            ) : (
              isAi ? (
                msg.content ? (
                  <SafeMarkdownBoundary fallbackText={msg.content}>
                    <div className="space-y-4 w-full">
                      {msg.content.includes("├──") && (
                        <div className="p-4 bg-muted/40 border border-border/50 rounded-xl font-mono text-xs text-indigo-400 space-y-1 my-3 select-none">
                          <div className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider mb-2">⚡ Visual Skill Tree</div>
                          {msg.content.split("\n").filter(line => line.includes("├──") || line.includes("└──")).map((line, idx) => {
                            const isComplete = line.includes("✓") || line.includes("Complete") || idx < 3;
                            return (
                              <div key={idx} className={`flex items-center gap-2 ${isComplete ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                <span>{line}</span>
                                {isComplete ? (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase font-extrabold">Complete</span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-secondary text-muted-foreground border border-border/50 uppercase font-bold">Locked</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {msg.content.includes("Readiness Score:") && (
                        <div className="grid grid-cols-2 gap-3 my-4">
                          <div className="p-4 rounded-xl bg-muted/50 border border-border flex flex-col items-center">
                            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Readiness Score</span>
                            <div className="text-2xl font-black text-indigo-500">76%</div>
                            <div className="w-full bg-secondary h-1 rounded-full mt-2 overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full" style={{ width: '76%' }} />
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-muted/50 border border-border flex flex-col items-center">
                            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mb-1">ATS Score</span>
                            <div className="text-2xl font-black text-emerald-500">82%</div>
                            <div className="w-full bg-secondary h-1 rounded-full mt-2 overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '82%' }} />
                            </div>
                          </div>
                        </div>
                      )}

                      {msg.content.includes("```json") && msg.content.includes("widget") && (
                        <div className="my-4 border border-border/80 rounded-2xl overflow-hidden shadow-sm bg-card/25 w-full">
                          <WidgetRenderer rawJson={extractJsonFromMarkdown(msg.content)} isStreaming={isLoading} />
                        </div>
                      )}

                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                        components={{
                          p: ({children}) => <p className="leading-[1.8] text-[15px] font-medium text-foreground/90 mb-4 last:mb-0 select-text">{children}</p>,
                          h1: ({children}) => <h1 className="text-xl font-extrabold text-foreground tracking-tight mt-6 mb-3">{children}</h1>,
                          h2: ({children}) => <h2 className="text-lg font-bold text-foreground tracking-tight mt-5 mb-2">{children}</h2>,
                          ul: ({children}) => <ul className="list-disc pl-6 space-y-2 mb-4 select-text">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal pl-6 space-y-2 mb-4 select-text">{children}</ol>,
                          li: ({children}) => <li className="text-[14.5px] font-medium leading-[1.8] text-foreground/90">{children}</li>,
                          code: ({className, children}) => {
                            const codeStr = String(children);
                            if (codeStr.startsWith("class ") || codeStr.startsWith("public ") || codeStr.includes("\n") || className) {
                              return <CodeBlock className={className}>{codeStr}</CodeBlock>;
                            }
                            return <code className="px-1.5 py-0.5 rounded-md bg-muted/65 border border-border/50 text-indigo-500 font-mono text-[13px]">{children}</code>;
                          },
                          blockquote: ({children}) => (
                            <blockquote className="border-l-4 border-muted-foreground/30 pl-4 py-1 italic my-4 text-muted-foreground/90 leading-relaxed font-serif">
                              {children}
                            </blockquote>
                          )
                        }}
                      >
                        {msg.content + (isLoading ? " ▋" : "")}
                      </ReactMarkdown>
                    </div>
                  </SafeMarkdownBoundary>
                ) : (
                  <div className="flex gap-1.5 items-center py-2">
                    <div className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce" />
                  </div>
                )
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div style={{ fontSize: '16px', fontWeight: 500, lineHeight: '1.85', letterSpacing: '-0.01em' }}>{msg.content}</div>
                  <button onClick={() => setIsEditing(true)} className="p-1 text-muted-foreground hover:text-foreground text-xs font-bold uppercase ml-2 opacity-0 group-hover/msg:opacity-100 transition-opacity cursor-pointer">Edit</button>
                </div>
              )
            )}
          </div>

          {isAi && msg.content && !isLoading && (
            <div className="mt-2.5 flex items-center gap-1.5 bg-card/90 backdrop-blur-sm border border-border/80 px-2.5 py-1.5 rounded-xl shadow-sm opacity-0 group-hover/msg:opacity-100 transition-opacity duration-200 self-end select-none">
              <button 
                onClick={handleCopy}
                className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
                  copied ? 'text-green-500 bg-green-500/10' : 'text-muted-foreground/70 hover:text-primary hover:bg-muted'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy
              </button>
              {onRegenerate && (
                <button 
                  onClick={() => onRegenerate(msg.content)}
                  className="p-1.5 rounded-lg text-muted-foreground/70 hover:text-primary hover:bg-muted transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Regenerate
                </button>
              )}
              <div className="w-px h-3 bg-border mx-0.5" />
              <button 
                onClick={handleShare}
                className="p-1.5 rounded-lg text-muted-foreground/70 hover:text-primary hover:bg-muted transition-all"
                title="Copy link"
              >
                <Share className="w-3.5 h-3.5" />
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
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    createNewChat,
    deleteChat,
    togglePin,
    toggleStar,
    toggleArchive,
    renameChat,
    duplicateChat,
    updateMessages
  } = useConversationManager();

  const messages = activeConversation?.messages || [];
  const setMessages = (setter: Message[] | ((prev: Message[]) => Message[])) => {
    if (activeConversationId) {
      updateMessages(activeConversationId, setter);
    }
  };

  const [input, setInput] = useState("");
  const [uploadedAttachments, setUploadedAttachments] = useState<any[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, { name: string; progress: number; failed: boolean }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [feedback, setFeedback] = useState<Record<number, 'like' | 'dislike'>>({});
  const [activeTab, setActiveTab] = useState("chat");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleFeedback = useCallback((id: number, type: 'like' | 'dislike') => {
    setFeedback(prev => ({ ...prev, [id]: type }));
  }, []);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const limitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic pulsing loading states
  useEffect(() => {
    if (isLoading) {
      setLoadingPhase(1);
      const t1 = setTimeout(() => setLoadingPhase(2), 2000);
      const t2 = setTimeout(() => setLoadingPhase(3), 4500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      setLoadingPhase(0);
    }
  }, [isLoading]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      if (limitTimerRef.current) clearTimeout(limitTimerRef.current);
    };
  }, []);

  const handleStop = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsLoading(false);
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
    if (isLoading) {
      scrollToBottom(false, false);
    } else {
      scrollToBottom(true, true);
    }
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
      if (input) {
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
      }
    }
  }, [input]);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleClearChat = () => {
    if (activeConversationId) {
      deleteChat(activeConversationId);
    }
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    for (const file of fileList) {
      const tempId = Math.random().toString(36).substring(7);
      setUploadingFiles(prev => ({
        ...prev,
        [tempId]: { name: file.name, progress: 30, failed: false }
      }));
      try {
        const formData = new FormData();
        formData.append("file", file);
        const token = localStorage.getItem("token");
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";
        const response = await fetch(`${API_URL.replace("/api/v1", "")}/api/chatbot/upload`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        });
        if (!response.ok) throw new Error("Upload failed");
        const data = await response.json();
        setUploadedAttachments(prev => [...prev, data]);
        setUploadingFiles(prev => {
          const next = { ...prev };
          delete next[tempId];
          return next;
        });
      } catch (err) {
        setUploadingFiles(prev => ({
          ...prev,
          [tempId]: { ...prev[tempId], failed: true }
        }));
      }
    }
  };

  const handleSend = async (overrideInput?: string) => {
    if (isLoading) return;

    let finalInput = (overrideInput !== undefined ? overrideInput : input).trim();
    const currentAttachments = [...uploadedAttachments];

    if (currentAttachments.length > 0 && overrideInput === undefined) {
      finalInput = `[Attached files: ${currentAttachments.map(a => a.name).join(", ")}]\n\n${finalInput}`.trim();
      setUploadedAttachments([]);
    }
    if (!finalInput && currentAttachments.length === 0) return;

    const historyList = messages.slice(-10).map(m => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.content
    }));

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: finalInput,
      attachments: currentAttachments,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, userMsg]);
    setInput("");
    setIsLoading(true);
    isAutoScrollEnabled.current = true;

    const aiMsgId = Date.now() + 1;
    const aiMsg: Message = {
      id: aiMsgId,
      role: "ai",
      content: "",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, aiMsg]);

    // Auto generate useful title based on first query
    if (messages.length === 0 && activeConversationId) {
      const cleanTitle = finalInput.split("\n")[0].slice(0, 30) + (finalInput.length > 30 ? "..." : "");
      renameChat(activeConversationId, cleanTitle);
    }

    let fullContent = "";

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (limitTimerRef.current) clearTimeout(limitTimerRef.current);
    limitTimerRef.current = setTimeout(() => {
      console.warn("Time limit exceeded, aborting stream.");
      controller.abort();
      toast.error("Request timed out after 60 seconds");
    }, 60000);

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
          history: historyList,
          attachments: currentAttachments
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(response.status === 500 ? "Server Error (500)" : response.status === 404 ? "Not Found (404)" : response.status === 401 ? "Unauthorized (401)" : `HTTP Error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      
      if (reader) {
        let streamBuffer = "";

        while (true) {
          const { done, value } = await reader.read();
          
          if (limitTimerRef.current) clearTimeout(limitTimerRef.current);
          limitTimerRef.current = setTimeout(() => {
            console.warn("Time limit exceeded during stream, aborting.");
            controller.abort();
            toast.error("Stream timed out after 60 seconds");
          }, 60000);

          if (done) {
            break;
          }

          if (value) {
            const rawChunk = decoder.decode(value, { stream: true });
            streamBuffer += rawChunk;

            const parts = streamBuffer.split(/\n\s*\n/);
            streamBuffer = parts.pop() || "";
            
            let contentUpdated = false;
            let currentAssembled = "";
            for (const part of parts) {
              if (!part.trim()) continue;
              const lines = part.split(/\r?\n/);
              let dataFound = false;
              let partContent = "";
              for (const line of lines) {
                if (line.startsWith('data:')) {
                  // SSE spec: data value is after "data:" and an optional space.
                  let dataValue = line.substring(5);
                  if (dataValue.startsWith(' ')) {
                    dataValue = dataValue.substring(1);
                  }
                  
                  if (dataFound) {
                      partContent += "\n";
                  }
                  partContent += dataValue;
                  dataFound = true;
                }
              }
              if (dataFound) {
                 currentAssembled += partContent;
                 contentUpdated = true;
              }
            }

            if (contentUpdated) {
              fullContent += currentAssembled;
              setMessages(prev => prev.map(m => 
                m.id === aiMsgId ? { ...m, content: fullContent } : m
              ));
            }
          }
        }
      }
      // Re-focus input after successful completion
      setTimeout(() => {
        if (textareaRef.current) textareaRef.current.focus();
      }, 50);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log("Fetch aborted by user or timeout.");
      } else {
        console.error("Chat error:", error);
        toast.error(`Failed to reach AI: ${error.message || "Network Error"}`);
      }
      
      // If the AI message is completely empty due to immediate failure, remove it
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg?.id === aiMsgId && lastMsg.content === "") {
          return prev.filter(m => m.id !== aiMsgId);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      if (limitTimerRef.current) {
        clearTimeout(limitTimerRef.current);
        limitTimerRef.current = null;
      }
    }
  };

  const handleEditMessage = (id: number, newContent: string) => {
    const index = messages.findIndex(m => m.id === id);
    if (index === -1) return;
    const truncated = messages.slice(0, index);
    setMessages(truncated);
    setTimeout(() => handleSend(newContent), 50);
  };

  const handleExecuteCommand = (action: string) => {
    if (action === "NEW_CHAT") {
      handleStop();
      createNewChat();
      setActiveTab("chat");
    } else if (action === "ANALYZE_RESUME") {
      handleStop();
      handleSend("Analyze my resume");
      setActiveTab("chat");
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
  const firstName = user?.fullName ? user.fullName.split(" ")[0] : "Candidate";

  return (
    <div 
      onDragOver={(e) => e.preventDefault()} 
      onDrop={(e) => { 
        e.preventDefault(); 
        if (e.dataTransfer.files) { 
          handleFileUpload(e.dataTransfer.files); 
        } 
      }} 
      className="h-screen min-h-screen flex bg-transparent relative overflow-hidden"
    >
      <ConversationSidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={setActiveConversationId}
        onCreate={() => { handleStop(); createNewChat(); }}
        onDelete={deleteChat}
        onTogglePin={togglePin}
        onToggleStar={toggleStar}
        onToggleArchive={toggleArchive}
        onRename={renameChat}
        onDuplicate={duplicateChat}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background text-foreground">
        
        {/* Simplified Header */}
        <header className="h-16 shrink-0 flex items-center justify-between px-8 border-b border-border/40 bg-card/85 backdrop-blur-md sticky top-0 z-30 select-none">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="md:hidden mr-1 text-muted-foreground hover:text-foreground" />
            <button
              onClick={() => { handleStop(); createNewChat(); setActiveTab("chat"); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              New Conversation
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wider">● AI Online</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setNotificationsOpen(prev => !prev)}
              className="p-2 rounded-xl text-muted-foreground/70 hover:text-indigo-400 hover:bg-secondary transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
            </button>
            <button 
              onClick={handleClearChat}
              className="p-2 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-secondary transition-colors"
              title="Delete Active Chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
              title="Toggle Theme"
            >
              {mounted ? (resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />) : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        <WorkspaceTabs 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            if (tab === "coach") {
              router.push("/dashboard/coach");
            } else if (tab === "resume") {
              router.push("/dashboard/resume-builder");
            } else {
              setActiveTab(tab);
            }
          }} 
        />

        <div className="flex-1 overflow-hidden relative flex flex-col">
          <NotificationCenter isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />

          <React.Fragment>
            <main 
              ref={scrollAreaRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto overflow-x-hidden selection:bg-primary/10 flex flex-col bg-slate-50/10"
              style={{ height: 'calc(100vh - 110px)' }}
            >
              {isEmpty ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto max-w-[1000px] mx-auto w-full space-y-8 select-none">
                  <div className="flex flex-col items-center justify-center text-center mt-12 space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 flex items-center justify-center shadow-sm">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      Hi {firstName} 👋
                    </h2>
                    <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                      What would you like help with today?
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-xl">
                    {[
                      { label: "📄 Optimize My Resume", query: "Optimize my resume for general software engineer roles" },
                      { label: "⚡ Run ATS Scan", query: "Run an ATS keyword scan on my profile" },
                      { label: "🎯 Start Mock Interview", query: "Start a mock interview session" },
                      { label: "💻 Practice DSA Problems", query: "Give me a DSA practice problem" },
                      { label: "🏢 Prep for Companies", query: "Help me prepare for TCS backend questions" }
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => handleSend(item.query)}
                        className="px-4 py-2.5 rounded-full border border-border/80 bg-card hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-sm hover:scale-105"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 px-4 py-6 w-full max-w-[1200px] mx-auto text-left">
                  {messages.map((msg, index) => {
                    return (
                      <MessageItem 
                        key={msg.id} 
                        msg={msg} 
                        isLoading={msg.role === 'ai' && index === messages.length - 1 && isLoading}
                        onCopy={handleCopy} 
                        feedbackState={feedback[msg.id]}
                        onFeedback={(type) => handleFeedback(msg.id, type)}
                        onEdit={handleEditMessage}
                        onRegenerate={msg.role === 'ai' && index === messages.length - 1 ? () => {
                          const lastUserMsg = messages[index-1];
                          if (lastUserMsg) {
                            handleSend(lastUserMsg.content);
                          }
                        } : undefined}
                      />
                    );
                  })}

                  {/* Pulsing loading steps indicator */}
                  {isLoading && (
                    <div className="w-full flex justify-center mb-6">
                      <div className="w-full max-w-[1200px] px-6">
                        <div className="flex flex-col gap-2.5 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl max-w-sm animate-pulse">
                          <div className="text-xs font-bold text-indigo-650">
                            {loadingPhase === 1 && "Analyzing Profile & Resume..."}
                            {loadingPhase === 2 && "Extracting Key Competencies..."}
                            {loadingPhase >= 3 && "Generating Placement Intelligence..."}
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-indigo-600 h-full rounded-full transition-all duration-1000" 
                              style={{ width: `${loadingPhase === 1 ? 30 : loadingPhase === 2 ? 65 : 95}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </main>

            {/* ChatGPT-Style Centered Input Area */}
            <div className="w-full shrink-0 py-4 pb-6 relative z-10 select-none bg-background">
              <div className="max-w-[860px] mx-auto px-6 relative">
                
                {(uploadedAttachments.length > 0 || Object.keys(uploadingFiles).length > 0) && (
                  <div className="absolute -top-14 left-6 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 z-20">
                    {uploadedAttachments.map((att) => (
                      <div key={att.id} className="bg-muted border border-border px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs text-foreground shadow-sm">
                        <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-medium max-w-[150px] truncate">{att.name}</span>
                        <button 
                          onClick={() => setUploadedAttachments(prev => prev.filter(x => x.id !== att.id))} 
                          className="text-muted-foreground hover:text-foreground font-black ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {Object.entries(uploadingFiles).map(([id, file]) => (
                      <div key={id} className="bg-muted/70 border border-dashed border-border px-3 py-1.5 rounded-full flex items-center gap-2 text-xs text-muted-foreground shadow-sm animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                        <span className="truncate max-w-[120px]">{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="relative flex flex-col bg-secondary/60 border border-border rounded-2xl transition-all p-3 min-h-[80px] shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:border-indigo-500/50">
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
                    placeholder="Ask anything about placements, resumes, interviews, coding or careers..." 
                    className="w-full bg-transparent border-none border-0 outline-none ring-0 shadow-none focus:border-none focus:border-0 focus:outline-none focus:ring-0 focus:shadow-none p-2 text-sm text-foreground placeholder:text-slate-500 resize-none min-h-[50px] leading-relaxed"
                    rows={1}
                    disabled={isLoading}
                  />
                  
                  <div className="flex items-center justify-between border-t border-border/40 pt-2.5 mt-2">
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        multiple
                        onChange={(e) => {
                          if (e.target.files) {
                            handleFileUpload(e.target.files);
                          }
                        }} 
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-xl text-muted-foreground/70 hover:text-indigo-650 hover:bg-indigo-50 transition-all shrink-0 cursor-pointer"
                        title="Attach files"
                      >
                        <Paperclip className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    {isLoading ? (
                      <button 
                        onClick={handleStop}
                        className="h-9 px-4.5 rounded-xl flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white shadow-sm shrink-0 transition-all cursor-pointer font-bold text-xs"
                      >
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Stop
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleSend()}
                        disabled={(!input.trim() && uploadedAttachments.length === 0) || isLoading}
                        className={`h-9 px-4.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer font-bold text-xs ${
                          (input.trim() || uploadedAttachments.length > 0) && !isLoading 
                          ? 'bg-slate-900 text-white hover:bg-indigo-650 shadow-sm' 
                          : 'bg-transparent text-slate-400'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="text-[10px] text-muted-foreground/60 text-center mt-2.5">
                  PlacementAI can make mistakes. Consider checking important information.
                </div>
              </div>
            </div>
          </React.Fragment>
        </div>

      </div>

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onExecute={handleExecuteCommand}
      />
    </div>
  );
}
