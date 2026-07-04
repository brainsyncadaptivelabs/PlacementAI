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
  Paperclip,
  Share,
  Sun,
  Moon,
  Search,
  AlertTriangle,
  Award,
  Zap,
  Target,
  FileText,
  Flame,
  ArrowRight,
  Bell,
  Sliders
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useTheme } from "next-themes";
import { WidgetRenderer, MermaidDiagram } from "@/components/chat/widgets/index";
import { useConversationManager } from "@/components/chat/useConversationManager";
import { Message } from "@/components/chat/ConversationStorage";
import { CommandPalette } from "@/components/chat/command/CommandPalette";
import { WorkspaceTabs } from "@/components/workspace/WorkspaceTabs";
import { NotificationCenter } from "@/components/workspace/NotificationCenter";
import { SavedArtifacts } from "@/components/workspace/SavedArtifacts";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { useRouter } from "next/navigation";

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
  result = result.replace(/\*\*\*\*\*/g, "** **");

  // Fix headings with no space, e.g. ##Heading to ## Heading
  result = result.replace(/^(#{1,3})([A-Za-z0-9])/gm, "$1 $2");

  // Convert bullet point character "•" to standard markdown bullet "-"
  result = result.replace(/^[ \t]*•[ \t]*/gm, "- ");

  // Collapse repeated blank lines (3 or more newlines to 2 newlines)
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

  const handleDownload = () => {
    const blob = new Blob([children], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code_snippet.${lang === 'code' ? 'txt' : lang}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative my-4 group/code w-full border border-border/80 rounded-xl overflow-hidden shadow-sm font-mono text-[13px] leading-relaxed bg-zinc-950 text-zinc-50 text-left">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-white/5 select-none text-[10px] uppercase font-bold text-zinc-400">
        <span>{lang}</span>
        <div className="flex items-center gap-3.5 opacity-80 group-hover/code:opacity-100 transition-opacity">
          <button onClick={() => setWordWrap(!wordWrap)} className="hover:text-white transition-colors cursor-pointer">
            {wordWrap ? "No Wrap" : "Wrap"}
          </button>
          <button onClick={handleDownload} className="hover:text-white transition-colors cursor-pointer">
            Download
          </button>
          <button onClick={handleCopy} className="hover:text-white transition-colors cursor-pointer">
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div className={`overflow-x-auto w-full ${isLongCode && collapsed ? "max-h-60" : "max-h-none"}`} style={{ whiteSpace: wordWrap ? "pre-wrap" : "pre" }}>
        <pre className="p-4 bg-transparent m-0 overflow-visible text-slate-100"><code>{children}</code></pre>
      </div>

      {isLongCode && (
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-805 border-t border-white/5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors text-center cursor-pointer"
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
  isGenerating?: boolean;
  feedbackState?: 'like' | 'dislike';
  onFeedback?: (type: 'like' | 'dislike') => void;
}) => {
  const [copied, setCopied] = useState(false);
  const [toastText, setToastText] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(msg.content);

  const handleCopy = () => {
    onCopy(msg.content);
    setCopied(true);
    setToastText("Copied to clipboard ✓");
    setTimeout(() => setCopied(false), 2000);
    setTimeout(() => setToastText(null), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'PlacementAI Conversation Response',
        text: msg.content
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(msg.content);
      setToastText("Share link copied to clipboard ✓");
      setTimeout(() => setToastText(null), 2000);
    }
  };

  const isAi = msg.role === 'ai';

  return (
    <div className="w-full flex justify-center mb-6 last:mb-0 animate-message group/msg relative">
      <div className={`w-full max-w-[1800px] px-6 flex gap-4 ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
        <Avatar className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center border ${isAi ? 'bg-primary border-primary/10 text-white' : 'bg-muted border-border text-muted-foreground'}`}>
          {isAi ? (
            <Sparkles className="w-4.5 h-4.5 text-white" />
          ) : (
            <User className="w-4.5 h-4.5 text-muted-foreground" />
          )}
        </Avatar>
        
        <div className={`flex flex-col ${isAi ? 'items-start w-[92%]' : 'items-end max-w-[70%]'} min-w-0 flex-1 relative`}>
          {/* Metadata */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider">
              {isAi ? 'AI Career Copilot' : 'You'}
            </span>
            <span className="text-[10px] text-muted-foreground/50 font-medium">
              {msg.time}
            </span>
          </div>

          {/* Bubble Container */}
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
              <div className="w-full flex flex-col gap-2 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-transparent outline-none border-0 text-slate-100 text-sm resize-none min-h-[60px]"
                />
                <div className="flex justify-end gap-2 text-xs font-bold">
                  <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 cursor-pointer">Cancel</button>
                  <button onClick={() => { if (onEdit) onEdit(msg.id, editText); setIsEditing(false); }} className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer">Save & Resend</button>
                </div>
              </div>
            ) : (
              isAi ? (
                msg.content ? (
                  <SafeMarkdownBoundary fallbackText={msg.content}>
                    <div className="space-y-4 w-full">
                      {/* Interactive Skill Trees & Timeline Parser */}
                      {msg.content.includes("├──") && (
                        <div className="p-4 bg-black/40 border border-border/50 rounded-xl font-mono text-xs text-indigo-400 space-y-1 my-3 select-none">
                          <div className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider mb-2">⚡ Visual Skill Tree</div>
                          {msg.content.split("\n").filter(line => line.includes("├──") || line.includes("└──")).map((line, idx) => {
                            const isComplete = line.includes("✓") || line.includes("Complete") || idx < 3;
                            return (
                              <div key={idx} className={`flex items-center gap-2 ${isComplete ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                <span>{line}</span>
                                {isComplete ? (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase font-extrabold">Complete</span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-zinc-800 text-zinc-500 border border-zinc-700/50 uppercase font-bold">Locked</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Circular / Progress Dashboard Widgets Parser */}
                      {msg.content.includes("Readiness Score:") && (
                        <div className="grid grid-cols-2 gap-3 my-4">
                          <div className="p-4 rounded-xl bg-muted/50 border border-border flex flex-col items-center">
                            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Readiness Score</span>
                            <div className="text-2xl font-black text-indigo-500">6%</div>
                            <div className="w-full bg-zinc-800 h-1 rounded-full mt-2 overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full" style={{ width: '6%' }} />
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-muted/50 border border-border flex flex-col items-center">
                            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mb-1">ATS Score</span>
                            <div className="text-2xl font-black text-emerald-500">0%</div>
                            <div className="w-full bg-zinc-800 h-1 rounded-full mt-2 overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '0%' }} />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Timeline Visual Progress Parser */}
                      {msg.content.includes("↓") && (
                        <div className="flex flex-col gap-2 my-4 relative pl-4 border-l-2 border-indigo-500/30">
                          <div className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider mb-2">📅 Learning Timeline</div>
                          {msg.content.split("\n").filter(line => line.includes("↓") || line.includes("→")).map((line, idx) => {
                            const clean = line.replace(/[↓→]/g, "").trim();
                            if (!clean) return null;
                            return (
                              <div key={idx} className="flex items-center gap-3 relative py-1 text-xs">
                                <div className="absolute -left-[21px] w-2 h-2 rounded-full bg-indigo-500 border-2 border-background" />
                                <span className="font-semibold text-foreground/90">{clean}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Standard Widget Engine Parser */}
                      {msg.content.includes("```json") && msg.content.includes("widget") && (
                        <div className="my-4 border border-border/80 rounded-2xl overflow-hidden shadow-sm bg-card/25 w-full">
                          <WidgetRenderer rawJson={extractJsonFromMarkdown(msg.content)} isStreaming={isGenerating} />
                        </div>
                      )}

                      {/* Standard Markdown Body */}
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                        components={{
                          p: ({children}) => <p className="leading-[1.8] text-[15.5px] font-medium text-foreground/90 mb-4 last:mb-0 select-text">{children}</p>,
                          h1: ({children}) => <h1 className="text-2xl font-extrabold text-foreground tracking-tight mt-6 mb-3">{children}</h1>,
                          h2: ({children}) => <h2 className="text-xl font-bold text-foreground tracking-tight mt-5 mb-2.5">{children}</h2>,
                          h3: ({children}) => <h3 className="text-lg font-bold text-foreground/90 tracking-tight mt-4 mb-2">{children}</h3>,
                          ul: ({children}) => <ul className="list-disc pl-6 space-y-2 mb-4 select-text">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal pl-6 space-y-2 mb-4 select-text">{children}</ol>,
                          li: ({children}) => <li className="text-[15px] font-medium leading-[1.8] text-foreground/90">{children}</li>,
                          code: ({className, children}) => {
                            const codeStr = String(children);
                            if (codeStr.startsWith("class ") || codeStr.startsWith("public ") || codeStr.includes("\n") || className) {
                              return <CodeBlock className={className}>{codeStr}</CodeBlock>;
                            }
                            return <code className="px-1.5 py-0.5 rounded-md bg-muted/65 border border-border/50 text-indigo-500 font-mono text-[13px]">{children}</code>;
                          },
                          blockquote: ({children}) => {
                            const text = String(children);
                            if (text.includes("💡") || text.includes("info")) {
                              const cleanChildren = React.Children.map(children, (child) => {
                                if (typeof child === 'string') {
                                  return child.replace(/\[\s*(💡|info)\s*\]/gi, '').trim();
                                }
                                return child;
                              });

                              return (
                                <div className="flex gap-3 px-4.5 py-4 border border-indigo-500/25 bg-indigo-500/5 rounded-2xl my-5 text-[14.5px] text-slate-300 text-left">
                                  <div className="w-5 h-5 shrink-0 flex items-center justify-center bg-indigo-500/10 text-indigo-400 rounded-lg">
                                    <Sparkles className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <div className="text-foreground leading-relaxed">{cleanChildren}</div>
                                  </div>
                                </div>
                              );
                            }

                            if (text.includes("⚠️") || text.includes("warning") || text.includes("error")) {
                              const cleanChildren = React.Children.map(children, (child) => {
                                if (typeof child === 'string') {
                                    return child.replace(/\[\s*(⚠️|warning|error)\s*\]/gi, '').trim();
                                }
                                return child;
                              });

                              return (
                                <div className="flex gap-3 px-4.5 py-4 border border-rose-500/20 bg-rose-500/5 rounded-2xl my-5 text-[14.5px] text-slate-300 text-left">
                                  <div className="w-5 h-5 shrink-0 flex items-center justify-center bg-rose-500/10 text-rose-400 rounded-lg">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <div className="text-foreground leading-relaxed">{cleanChildren}</div>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <blockquote className="border-l-4 border-muted-foreground/30 pl-4 py-1 italic my-4 text-muted-foreground/90 leading-relaxed font-serif">
                                {children}
                              </blockquote>
                            );
                          },

                          table: ({children}) => {
                            const handleCopyTable = (e: React.MouseEvent) => {
                              const tableEl = e.currentTarget.parentElement?.querySelector("table");
                              if (tableEl) {
                                navigator.clipboard.writeText(tableEl.innerText || "");
                              }
                            };
                            return (
                              <div className="relative group/table my-5 border border-border rounded-xl shadow-sm overflow-hidden bg-card/40">
                                <button 
                                  onClick={handleCopyTable}
                                  className="absolute right-2 top-2 opacity-0 group-hover/table:opacity-100 transition-opacity px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 z-10 cursor-pointer"
                                >
                                  Copy Table
                                </button>
                                <div className="overflow-x-auto w-full">
                                  <table className="min-w-full divide-y divide-border/10 bg-transparent text-sm">{children}</table>
                                </div>
                              </div>
                            );
                          },
                          thead: ({children}) => <thead className="bg-muted/80 sticky top-0">{children}</thead>,
                          tbody: ({children}) => <tbody className="divide-y divide-border/10 bg-transparent">{children}</tbody>,
                          tr: ({children}) => <tr className="hover:bg-muted/50 transition-colors">{children}</tr>,
                          th: ({children}) => <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">{children}</th>,
                          td: ({children}) => <td className="px-4 py-3 text-sm font-medium">{children}</td>
                        }}
                      >
                        {msg.content + (isGenerating ? " ▋" : "")}
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
                  <div style={{ fontSize: '18px', fontWeight: 400, lineHeight: '1.85', letterSpacing: '-0.01em' }}>{msg.content}</div>
                  <button onClick={() => setIsEditing(true)} className="p-1 text-muted-foreground hover:text-foreground text-xs font-bold uppercase ml-2 opacity-0 group-hover/msg:opacity-100 transition-opacity cursor-pointer">Edit</button>
                </div>
              )
            )}
          </div>

          {/* Render Attachments */}
          {msg.attachments && msg.attachments.length > 0 && (
            <div className={`flex flex-wrap gap-2 mt-2 w-full ${isAi ? 'justify-start' : 'justify-end'}`}>
              {msg.attachments.map((att: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card shadow-sm text-xs font-semibold hover:bg-muted transition-colors max-w-[240px] truncate cursor-pointer select-none">
                  <Paperclip className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate flex-1">{att.name}</span>
                  <span className="text-[9px] text-muted-foreground uppercase font-bold shrink-0">{att.mimeType?.split("/")?.[1] || "File"}</span>
                </div>
              ))}
            </div>
          )}

          {/* Toast Notification */}
          {toastText && (
            <div className="absolute -top-10 right-2 px-3 py-1 bg-zinc-950 text-white text-[10px] font-bold uppercase rounded-lg shadow-lg border border-white/10 animate-in fade-in slide-in-from-bottom-1 duration-200 z-50">
              {toastText}
            </div>
          )}

          {/* Assistant Actions Toolbar */}
          {isAi && msg.content && !isGenerating && (
            <div className="mt-2.5 flex items-center gap-1.5 bg-card/90 backdrop-blur-sm border border-border/80 px-2.5 py-1.5 rounded-xl shadow-sm opacity-0 group-hover/msg:opacity-100 transition-opacity duration-200 self-end select-none">
              <button 
                onClick={handleCopy}
                title="Copy response"
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
                  title="Regenerate response"
                  className="p-1.5 rounded-lg text-muted-foreground/70 hover:text-primary hover:bg-muted transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Regenerate
                </button>
              )}
              <div className="w-px h-3 bg-border mx-0.5" />
              <button 
                onClick={() => onFeedback?.('like')}
                className={`p-1.5 rounded-lg transition-all ${
                  feedbackState === 'like' ? 'text-emerald-500 bg-emerald-500/10' : 'text-muted-foreground/70 hover:text-emerald-500 hover:bg-muted'
                }`} 
                title="Like response"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => onFeedback?.('dislike')}
                className={`p-1.5 rounded-lg transition-all ${
                  feedbackState === 'dislike' ? 'text-rose-500 bg-rose-500/10' : 'text-muted-foreground/70 hover:text-rose-500 hover:bg-muted'
                }`} 
                title="Dislike response"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-3 bg-border mx-0.5" />
              <button 
                onClick={handleShare}
                className="p-1.5 rounded-lg text-muted-foreground/70 hover:text-primary hover:bg-muted transition-all"
                title="Share response"
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
      const nextMsgs = typeof setter === "function" ? setter(messages) : setter;
      updateMessages(activeConversationId, nextMsgs);
    }
  };

  const [input, setInput] = useState("");
  const [uploadedAttachments, setUploadedAttachments] = useState<any[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, { name: string; progress: number; failed: boolean }>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [generationState, setGenerationState] = useState<"IDLE" | "GENERATING" | "COMPLETE" | "STOPPED">("IDLE");
  const [feedback, setFeedback] = useState<Record<number, 'like' | 'dislike'>>({});
  const [activeTab, setActiveTab] = useState("chat");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const generationComplete = generationState !== "GENERATING";
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const limitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stuckTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load chat feedback on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedFeedback = localStorage.getItem("placementai_chat_feedback");
      if (storedFeedback) {
        try {
          setFeedback(JSON.parse(storedFeedback));
        } catch (e) {
          console.error("Failed to parse stored feedback", e);
        }
      }
    }
  }, []);

  // Save feedback when feedback changes
  const handleFeedback = (msgId: number, type: 'like' | 'dislike') => {
    setFeedback(prev => {
      const updated = { ...prev };
      if (updated[msgId] === type) {
        delete updated[msgId];
      } else {
        updated[msgId] = type;
      }
      localStorage.setItem("placementai_chat_feedback", JSON.stringify(updated));
      return updated;
    });
  };

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

  const handleSend = async (retryCount = 0, overrideInput?: string, forceMsgs?: Message[]) => {
    let finalInput = (overrideInput || input).trim();
    const currentAttachments = [...uploadedAttachments];

    if (currentAttachments.length > 0 && !overrideInput) {
      finalInput = `[Attached files: ${currentAttachments.map(a => a.name).join(", ")}]\n\n${finalInput}`.trim();
      setUploadedAttachments([]);
    }
    if (!finalInput && currentAttachments.length === 0 && retryCount === 0) return;
    if (generationState === "GENERATING" && retryCount === 0) return;

    const currentMessages = forceMsgs || messages;
    const historyList = currentMessages.slice(-10).map(m => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.content
    }));

    if (retryCount === 0) {
      const userMsg: Message = {
        id: Date.now(),
        role: "user",
        content: finalInput,
        attachments: currentAttachments,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...currentMessages, userMsg]);
      setInput("");
      setGenerationState("GENERATING");
      isAutoScrollEnabled.current = true;
    }

    setIsTyping(true);
    const aiMsgId = retryCount === 0 ? Date.now() + 1 : currentMessages[currentMessages.length - 1].id;
    
    if (retryCount === 0) {
      const aiMsg: Message = {
        id: aiMsgId,
        role: "ai",
        content: "",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    }

    let fullContent = retryCount > 0 ? currentMessages.find(m => m.id === aiMsgId)?.content || "" : "";

    // Dynamic prompt-specific timeouts (allowing ample time for local models to generate large responses)
    const promptLower = finalInput.toLowerCase();
    let timeLimit = 30000; // default 30s
    if (
      finalInput.length < 15 || 
      promptLower === "hi" || 
      promptLower === "hello" || 
      promptLower === "ok" || 
      promptLower.split(/\s+/).length < 4
    ) {
      timeLimit = 15000; // short prompt: 15s
    } else if (
      promptLower.includes("resume") || 
      promptLower.includes("roadmap") || 
      promptLower.includes("interview") || 
      promptLower.includes("analysis") || 
      finalInput.length > 100
    ) {
      timeLimit = 180000; // long/complex prompts: 180s (3 mins)
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
          history: historyList,
          attachments: currentAttachments
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
              let dataFound = false;
              for (const line of lines) {
                if (line.startsWith('data:')) {
                  const dataValue = line.slice(5).trim();
                  if (dataValue) {
                    currentAssembled += dataValue;
                    dataFound = true;
                  }
                }
              }
              if (dataFound) {
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

          if (done) {
            if (stuckTimerRef.current) {
              clearTimeout(stuckTimerRef.current);
              stuckTimerRef.current = null;
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

  const handleEditMessage = (id: number, newContent: string) => {
    const index = messages.findIndex(m => m.id === id);
    if (index === -1) return;
    const truncated = messages.slice(0, index);
    handleSend(0, newContent, truncated);
  };

  const handleExecuteCommand = (action: string) => {
    if (action === "NEW_CHAT") {
      createNewChat();
      setActiveTab("chat");
    } else if (action === "ANALYZE_RESUME") {
      handleSend(0, "Analyze my resume");
      setActiveTab("chat");
    } else if (action === "MOCK_INTERVIEW") {
      handleSend(0, "Start a mock interview");
      setActiveTab("chat");
    } else if (action === "JAVA_ROADMAP") {
      handleSend(0, "Generate a Java roadmap");
      setActiveTab("chat");
    } else if (action === "DSA_PRACTICE") {
      handleSend(0, "Give me a DSA practice problem");
      setActiveTab("chat");
    } else if (action === "ATS_ANALYSIS") {
      handleSend(0, "Run an ATS keyword scan on my profile");
      setActiveTab("chat");
    } else if (action === "COMPANY_PREP") {
      handleSend(0, "Help me prepare for TCS backend questions");
      setActiveTab("chat");
    } else if (action === "UPLOAD_RESUME" || action === "UPLOAD_PDF") {
      fileInputRef.current?.click();
    } else if (action === "OPEN_MISSIONS") {
      setActiveTab("chat");
    } else if (action === "OPEN_DASHBOARD") {
      setActiveTab("chat");
    }
  };

  // Keyboard Shortcuts Hook integration
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+P
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-card">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const isEmpty = messages.length === 0;

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
      {/* Premium Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={setActiveConversationId}
        onCreate={() => createNewChat()}
        onDelete={deleteChat}
        onTogglePin={togglePin}
        onToggleStar={toggleStar}
        onToggleArchive={toggleArchive}
        onRename={renameChat}
        onDuplicate={duplicateChat}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0d1117] text-slate-100">
        
        {/* Sticky Header (64px) */}
        <header className="h-16 shrink-0 flex items-center justify-between px-8 border-b border-border/40 bg-card/85 backdrop-blur-md sticky top-0 z-30 select-none">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="md:hidden mr-1 text-muted-foreground hover:text-foreground" />
            <h1 className="text-[16px] font-bold text-foreground tracking-tight">{activeConversation?.title || "Career Assistant"}</h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">AI Online</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!generationComplete && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-full border border-primary/20 transition-all">
                 <Loader2 className="w-3 h-3 text-primary animate-spin" />
                 <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Thinking</span>
              </div>
            )}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="px-3 py-1.5 bg-slate-900 border border-border/60 hover:bg-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Palette</span>
            </button>
            <button
              onClick={() => setNotificationsOpen(prev => !prev)}
              className="p-2 rounded-xl text-muted-foreground/70 hover:text-indigo-400 hover:bg-slate-900 transition-colors relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
            </button>
            <button 
              onClick={handleClearChat}
              title="Delete Active Chat"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 text-muted-foreground hover:text-red-500 hover:bg-slate-900 transition-all text-xs font-semibold cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Chat</span>
            </button>
            <button 
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {mounted ? (resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        <WorkspaceTabs 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            if (tab === "coach") {
              router.push("/dashboard/coach");
            } else {
              setActiveTab(tab);
            }
          }} 
        />

        {/* Content dispatcher */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {/* Notification Center overlay */}
          <NotificationCenter isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />

          {activeTab === "saved" ? (
            <SavedArtifacts />
          ) : activeTab === "roadmaps" ? (
            <div className="flex-1 p-8 text-left space-y-4">
              <h2 className="text-xl font-bold">Interactive Roadmaps</h2>
              <p className="text-sm text-muted-foreground">Select or build a custom developer interview preparation roadmap.</p>
              <button onClick={() => { handleExecuteCommand("JAVA_ROADMAP"); }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold mt-2 cursor-pointer">Generate Java Roadmap</button>
            </div>
          ) : activeTab === "resume" ? (
            <div className="flex-1 p-8 text-left space-y-4">
              <h2 className="text-xl font-bold">Resume Operations</h2>
              <p className="text-sm text-muted-foreground">Tailor your resume against company profiles and track ATS scores.</p>
              <button onClick={() => { handleExecuteCommand("ANALYZE_RESUME"); }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold mt-2 cursor-pointer">Run Resume Analysis</button>
            </div>
          ) : (
            // Default CHAT tab view
            <React.Fragment>
              <main 
                ref={scrollAreaRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto overflow-x-hidden selection:bg-primary/10 flex flex-col"
                style={{ height: 'calc(100vh - 110px)' }}
              >
                {isEmpty ? (
                  <div className="flex-1 flex flex-col p-8 overflow-y-auto max-w-[1200px] mx-auto w-full space-y-8 select-none">
                    <div className="flex flex-col items-center justify-center text-center mt-6">
                      <div className="w-16 h-16 rounded-[24px] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5 shadow-lg">
                        <Sparkles className="w-8 h-8 animate-pulse" />
                      </div>
                      <h2 className="text-3xl font-extrabold text-white tracking-tight mb-1.5">Welcome to PlacementAI Workspace</h2>
                      <p className="text-sm text-muted-foreground font-medium">Your premium career readiness operations panel. Select a helper below to start.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-slate-900/60 border border-border/80 rounded-2xl flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Readiness Score</span>
                          <Target className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="text-3xl font-black text-indigo-400">78%</div>
                        <div className="w-full bg-slate-850 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-indigo-400 h-full rounded-full" style={{ width: '78%' }} />
                        </div>
                      </div>

                      <div className="p-4 bg-slate-900/60 border border-border/80 rounded-2xl flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Daily Mission</span>
                          <Award className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-xs font-semibold text-slate-200">Refactor Projects in STAR structure</div>
                        <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">+100 XP Goal</div>
                      </div>

                      <div className="p-4 bg-slate-900/60 border border-border/80 rounded-2xl flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Streak</span>
                          <Flame className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-3xl font-black text-amber-500">4 Days</div>
                        <div className="text-[9px] text-muted-foreground font-medium mt-1">Keep it up! Streak breaks in 13h</div>
                      </div>

                      <div className="p-4 bg-slate-900/60 border border-border/80 rounded-2xl flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total XP</span>
                          <Zap className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="text-3xl font-black text-white">450 <span className="text-xs text-muted-foreground">XP</span></div>
                        <div className="text-[9px] text-muted-foreground font-medium mt-1">Level 4 Candidate</div>
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Suggested Next Action</h3>
                      <button 
                        onClick={() => handleSend(0, "Prepare me for TCS Backend Developer interview questions")}
                        className="flex items-center justify-between w-full p-4 bg-slate-900/40 hover:bg-slate-900/80 border border-border/80 rounded-2xl transition-all text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">Prepare for TCS Backend Developer interview</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">Estimated time: 10 mins • Proactive recommendation based on profile</div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Quick Actions</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                         {[
                           { title: "Build my Resume", desc: "Tailor profile & experience" },
                           { title: "Improve ATS Score", desc: "Optimize metrics & phrasing" },
                           { title: "Generate Java Roadmap", desc: "Full path for interviews" },
                           { title: "Mock HR Interview", desc: "Practice behavior questions" }
                         ].map((item) => (
                           <button 
                             key={item.title}
                             onClick={() => handleSend(0, item.title)}
                             className="flex flex-col text-left p-4 rounded-xl border border-border/80 bg-card hover:bg-slate-900/60 hover:border-indigo-500/40 transition-all shadow-sm group cursor-pointer"
                           >
                              <span className="text-xs font-bold text-foreground group-hover:text-indigo-400 transition-colors">{item.title}</span>
                              <span className="text-[10px] text-muted-foreground/85 mt-1 line-clamp-1">{item.desc}</span>
                           </button>
                         ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 px-4 py-6 w-full max-w-[1800px] mx-auto text-left">
                    {messages.map((msg, index) => (
                      <MessageItem 
                        key={msg.id} 
                        msg={msg} 
                        isGenerating={msg.role === 'ai' && index === messages.length - 1 && generationState === "GENERATING"}
                        onCopy={handleCopy} 
                        feedbackState={feedback[msg.id]}
                        onFeedback={(type) => handleFeedback(msg.id, type)}
                        onEdit={handleEditMessage}
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
              <div className="w-full shrink-0 py-4 pb-6 relative z-10 select-none">
                <div className="max-w-[820px] mx-auto px-6 relative">
                  
                  {/* Uploading & Uploaded Files Previews */}
                  {(uploadedAttachments.length > 0 || Object.keys(uploadingFiles).length > 0) && (
                    <div className="absolute -top-14 left-6 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 z-20 select-none">
                      {uploadedAttachments.map((att) => (
                        <div key={att.id} className="bg-muted border border-border px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs text-foreground shadow-sm">
                          <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="font-medium max-w-[150px] truncate">{att.name}</span>
                          <button 
                            onClick={() => setUploadedAttachments(prev => prev.filter(x => x.id !== att.id))} 
                            className="text-muted-foreground hover:text-foreground font-black cursor-pointer ml-1"
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

                  <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-full transition-all py-1 pl-4 pr-2 min-h-[56px]">
                    {/* Attach button */}
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
                      className="p-2 rounded-full text-muted-foreground/70 hover:text-muted-foreground hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                    >
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
                      placeholder="Ask anything about placements, resumes, interviews, coding or careers..." 
                      className="flex-1 !bg-transparent !border-none !border-0 !outline-none !ring-0 !shadow-none focus:!border-none focus:!border-0 focus:!outline-none focus:!ring-0 focus:!shadow-none py-4 px-3 text-[16px] text-slate-100 placeholder:text-slate-500 resize-none min-h-[56px] leading-relaxed align-bottom"
                      rows={1}
                      disabled={!generationComplete}
                    />
                    
                    {/* Send / Stop button */}
                    {generationState === "GENERATING" ? (
                      <button 
                        onClick={handleStop}
                        className="w-9 h-9 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white shadow-sm shrink-0 transition-all cursor-pointer"
                        title="Stop generating"
                      >
                        <div className="w-3.5 h-3.5 bg-card rounded-xs" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleSend()}
                        disabled={(!input.trim() && uploadedAttachments.length === 0) || !generationComplete}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                          (input.trim() || uploadedAttachments.length > 0) && generationComplete 
                          ? 'bg-slate-100 text-slate-900 hover:bg-slate-200 shadow-sm' 
                          : 'bg-transparent text-slate-500'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="text-[11px] text-muted-foreground/60 text-center mt-3">
                    PlacementAI can make mistakes. Consider checking important information.
                  </div>
                </div>
              </div>
            </React.Fragment>
          )}
        </div>

      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onExecute={handleExecuteCommand}
      />
    </div>
  );
}
