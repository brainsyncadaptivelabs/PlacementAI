"use client";

import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import ChatMarkdown from "@/components/chat/ChatMarkdown";
import { Avatar } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Send, 
  Sparkles, 
  User, 
  Copy, 
  Check, 
  RotateCcw, 
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
  Award,
  Target,
  FileText,
  ChevronDown,
  ChevronUp,
  Download,
  Info,
  Database,
  Code,
  FileSpreadsheet
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useTheme } from "next-themes";
import { WidgetRenderer } from "@/components/chat/widgets/index";
import { useConversationManager } from "@/components/chat/useConversationManager";
import { Message } from "@/components/chat/ConversationStorage";
import { CommandPalette } from "@/components/chat/command/CommandPalette";
import { NotificationCenter } from "@/components/workspace/NotificationCenter";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/store/toast-store";
import { AnimatePresence, motion } from "framer-motion";
import { 
  exportToMarkdown, 
  exportToDocx, 
  copyRichText, 
  exportToPdf 
} from "@/lib/chat/ExportUtils";

// --- REASONING STATUS CHIPS COMPONENT ---
const ReasoningStatus = ({ loadingPhase }: { loadingPhase: number }) => {
  if (loadingPhase <= 0) return null;

  return (
    <div className="flex flex-wrap gap-2.5 my-3 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold shadow-sm text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100"
      >
        <Loader2 className="w-3 h-3 animate-spin" />
        <Sparkles className="w-3.5 h-3.5" />
        <span>Thinking...</span>
      </motion.div>
    </div>
  );
};

// --- FILE UPLOAD PREVIEW CARD ---
const FileUploadPreview = ({ 
  file, 
  onRemove,
  progress = 100
}: { 
  file: { name: string; size: number; id: string }; 
  onRemove: () => void;
  progress?: number;
}) => {
  const isLoaded = progress >= 100;
  
  return (
    <div className="bg-card border border-border/80 p-3.5 rounded-2xl flex items-center justify-between gap-4 w-72 shadow-sm animate-in slide-in-from-bottom-2 select-none">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100/40">
          <FileText className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-foreground truncate">{file.name}</h4>
          <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
            {isLoaded ? `${(file.size / 1024).toFixed(1)} KB • Uploaded` : `Uploading ${progress}%`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isLoaded ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500"
          >
            <Check className="w-3 h-3" />
          </motion.div>
        ) : (
          <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
        )}
        <button 
          onClick={onRemove}
          className="p-1 rounded-lg text-muted-foreground/60 hover:text-red-500 hover:bg-rose-500/5 transition-colors cursor-pointer"
          title="Remove File"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// --- INTERACTIVE VISUAL COMPONENTS ---
const ATSScoreRing = ({ score }: { score: number }) => {
  const radius = 24;
  const stroke = 5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-3 bg-indigo-500/5 border border-indigo-500/10 p-4.5 rounded-2xl w-fit my-3 select-none">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="#e2e8f0"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <motion.circle
            stroke="#6366f1"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <span className="absolute text-[11px] font-black text-indigo-600">{score}%</span>
      </div>
      <div>
        <h4 className="text-xs font-black text-indigo-950 dark:text-indigo-200 uppercase tracking-wider leading-none">ATS Alignment Score</h4>
        <p className="text-[10px] text-indigo-600/70 font-semibold mt-1">Excellent keyword density matches target role</p>
      </div>
    </div>
  );
};

const ReadinessGauge = ({ score }: { score: number }) => {
  const radius = 45;
  const stroke = 6;
  const circ = radius * Math.PI;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="flex flex-col items-center bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl w-fit my-3 select-none">
      <div className="relative flex items-center justify-center h-[50px] overflow-hidden">
        <svg height={radius * 2} width={radius * 2} className="absolute top-0">
          <path
            d="M 5 45 A 40 40 0 0 1 85 45"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          <motion.path
            d="M 5 45 A 40 40 0 0 1 85 45"
            fill="none"
            stroke="#10b981"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <span className="absolute bottom-0 text-[16px] font-black text-emerald-600">{score}%</span>
      </div>
      <div className="text-center mt-2.5">
        <h4 className="text-xs font-black text-emerald-950 dark:text-emerald-250 uppercase tracking-wider leading-none">Interview Readiness</h4>
        <p className="text-[9px] text-emerald-600/70 font-semibold mt-1">Ready for general screening process</p>
      </div>
    </div>
  );
};

const DifficultyMeter = ({ difficulty }: { difficulty: "Easy" | "Medium" | "Hard" }) => {
  const colors = {
    Easy: "bg-emerald-500 text-white border-emerald-600",
    Medium: "bg-amber-500 text-white border-amber-600",
    Hard: "bg-rose-500 text-white border-rose-600"
  };

  return (
    <div className="flex items-center gap-2.5 my-3 px-3 py-2 rounded-xl bg-muted/65 border border-border w-fit select-none text-xs">
      <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Topic Difficulty:</span>
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${colors[difficulty]}`}>
        {difficulty}
      </span>
    </div>
  );
};

// --- FLOATING ACTIVE CONTEXT MEMORY BAR ---
const AIContextDrawer = ({ 
  context, 
  onClear 
}: { 
  context: {
    resumeName?: string;
    targetJd?: string;
    preferredCompany?: string;
    preferredRole?: string;
    techStack?: string;
    careerGoal?: string;
  };
  onClear: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasContext = Object.values(context).some(v => !!v);
  if (!hasContext) return null;

  return (
    <div className="absolute top-18 right-8 z-30 select-none">
      <div className="border border-border/80 rounded-2xl bg-card/90 backdrop-blur-md shadow-md overflow-hidden max-w-sm w-80 transition-all duration-300">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold hover:bg-muted/40 text-indigo-600 dark:text-indigo-400 cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            <span>AI Copilot Active Memory</span>
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isOpen && (
          <div className="p-4 border-t border-border/50 space-y-3 bg-card text-xs">
            {context.resumeName && (
              <div className="flex justify-between items-center bg-secondary/30 p-2 rounded-xl">
                <span className="font-bold text-muted-foreground">📄 Resume</span>
                <span className="font-semibold text-foreground truncate max-w-[150px]">{context.resumeName}</span>
              </div>
            )}
            {context.preferredCompany && (
              <div className="flex justify-between items-center bg-secondary/30 p-2 rounded-xl">
                <span className="font-bold text-muted-foreground">🏢 Target Company</span>
                <span className="font-semibold text-foreground truncate max-w-[150px]">{context.preferredCompany}</span>
              </div>
            )}
            {context.preferredRole && (
              <div className="flex justify-between items-center bg-secondary/30 p-2 rounded-xl">
                <span className="font-bold text-muted-foreground">🎯 Preferred Role</span>
                <span className="font-semibold text-foreground truncate max-w-[150px]">{context.preferredRole}</span>
              </div>
            )}
            {context.techStack && (
              <div className="flex justify-between items-center bg-secondary/30 p-2 rounded-xl">
                <span className="font-bold text-muted-foreground">💻 Tech Stack</span>
                <span className="font-semibold text-foreground truncate max-w-[150px]">{context.techStack}</span>
              </div>
            )}
            {context.careerGoal && (
              <div className="flex flex-col bg-secondary/30 p-2 rounded-xl gap-1">
                <span className="font-bold text-muted-foreground">🚀 Career Goal</span>
                <span className="font-semibold text-foreground leading-relaxed">{context.careerGoal}</span>
              </div>
            )}
            <button 
              onClick={onClear}
              className="w-full text-center py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              Clear Memory Context
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- SMART CLICKABLE SUGGESTIONS BAR ---
const SmartSuggestions = ({ 
  suggestions, 
  onClick 
}: { 
  suggestions: string[]; 
  onClick: (query: string) => void;
}) => {
  return (
    <div className="flex flex-wrap gap-2.5 mt-4 select-none animate-in fade-in duration-300">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          onClick={() => onClick(suggestion)}
          className="px-3.5 py-2 rounded-full border border-indigo-500/25 hover:border-indigo-500/50 bg-indigo-500/5 hover:bg-indigo-500/10 text-xs font-bold text-indigo-600 dark:text-indigo-400 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

// --- PREMIUM WIDGET / REPORT CONTAINER ---
const AIMessageCard = ({ 
  title, 
  description, 
  icon: Icon, 
  children,
  onCopy,
  onExportPdf,
  onExportMarkdown,
  onExportDocx
}: {
  title: string;
  description: string;
  icon: any;
  children: React.ReactNode;
  onCopy: () => void;
  onExportPdf: () => void;
  onExportMarkdown: () => void;
  onExportDocx: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="border border-border/70 rounded-3xl overflow-hidden shadow-sm bg-card transition-all duration-300 w-full my-4">
      {/* Card Header */}
      <div className="bg-secondary/40 px-6 py-4 flex items-center justify-between border-b border-border select-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
            <Icon className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-extrabold text-[14.5px] text-foreground tracking-tight leading-tight">{title}</h3>
            <p className="text-[11px] font-bold text-muted-foreground/80 mt-0.5">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Action buttons */}
          <button 
            onClick={onCopy} 
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Copy Report"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          
          {/* Export Menu Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)} 
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Export Report"
            >
              <Share className="w-3.5 h-3.5" />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-lg z-50 p-1.5 animate-in fade-in duration-200">
                <button 
                  onClick={() => { onExportPdf(); setShowExportMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold hover:bg-muted flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-red-500" />
                  Export as PDF / Print
                </button>
                <button 
                  onClick={() => { onExportMarkdown(); setShowExportMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold hover:bg-muted flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  Export as Markdown
                </button>
                <button 
                  onClick={() => { onExportDocx(); setShowExportMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold hover:bg-muted flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                  Export as Word (DOC)
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Card Content with collapse transition */}
      {isExpanded && (
        <div className="p-6 text-[15px] leading-relaxed text-foreground select-text border-t-0 animate-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
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

// JSON parsing and text content extractor helper (ChatGPT style: hides JSON completely)
const parseMessageContent = (content: string): { text: string; rawJson: string | null } => {
  if (!content) return { text: "", rawJson: null };
  let finalResult: { text: string; rawJson: string | null } = { text: content, rawJson: null };

  const jsonBlockRegex = /```(?:json|placementai)\s*([\s\S]*?)(?:```|$)/;
  const match = content.match(jsonBlockRegex);
  if (match) {
    const rawJson = match[1].trim();
    const text = content.replace(/```(?:json|placementai)\s*[\s\S]*?(?:```|$)/g, "").trim();
    finalResult = { text, rawJson };
  } else {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      const rawJsonCandidate = content.substring(start, end + 1).trim();
      try {
        const parsed = JSON.parse(rawJsonCandidate);
        if (parsed && (parsed.widgets || parsed.widget || parsed.schema)) {
          const text = (content.substring(0, start) + content.substring(end + 1)).trim();
          finalResult = { text, rawJson: rawJsonCandidate };
        }
      } catch (e) {
        // Fallback
      }
    }
  }

  // Sanitize internal JSON/Widget explanations that may leak
  if (finalResult.text) {
    // Remove "JSON Block Explanation" headings and the standard widget paragraphs explaining the JSON
    finalResult.text = finalResult.text
      .replace(/###?\s*JSON Block Explanation[\s\S]*?$/i, "")
      .replace(/The JSON block provided earlier is a widget[\s\S]*?$/i, "")
      .replace(/This JSON block defines[\s\S]*?$/i, "")
      .trim();
  }

  return finalResult;
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

// Redesigned Message Item Component with Premium Bubbles (ChatGPT layout style)
const MessageItem = memo(({ 
  msg, 
  onCopy, 
  onRegenerate,
  onEdit,
  isGenerating = false,
  isLoading = false,
  feedbackState,
  onFeedback
}: { 
  msg: Message; 
  onCopy: (content: string) => void;
  onRegenerate?: (content: string) => void;
  onEdit?: (id: number, content: string) => void;
  isGenerating?: boolean;
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

  // Extract rawJson and cleanText (so users never see JSON text blocks)
  const { text: cleanText, rawJson } = parseMessageContent(msg.content);

  // Classify report details to see if we render a Premium Card
  const getReportDetails = (content: string) => {
    const lower = content.toLowerCase();
    if (lower.startsWith("# resume analysis") || lower.includes("resume analysis")) {
      return { title: "Resume Analysis Report", description: "AI feedback on resume structure and metrics", icon: FileText, isReport: true };
    }
    if (lower.startsWith("# skill match") || lower.includes("skill match")) {
      return { title: "Skill Match Report", description: "Comparison of profile skills vs target description", icon: Award, isReport: true };
    }
    if (lower.startsWith("# missing skills") || lower.includes("missing skills")) {
      return { title: "Skill Gap Analysis", description: "Identified competency gaps and requirements", icon: Zap, isReport: true };
    }
    if (lower.startsWith("# career advice") || lower.includes("career advice")) {
      return { title: "Career Advice Panel", description: "Strategic professional advice for candidate path", icon: Sparkles, isReport: true };
    }
    if (lower.startsWith("# coding solution") || lower.includes("coding solution")) {
      return { title: "Coding Solution Guide", description: "Algorithmic walkthrough and code implementation", icon: Code, isReport: true };
    }
    if (lower.startsWith("# roadmap") || lower.includes("roadmap")) {
      return { title: "Career Learning Path", description: "Step-by-step topic milestones", icon: Sliders, isReport: true };
    }
    return { title: "", description: "", icon: Info, isReport: false };
  };

  const report = getReportDetails(cleanText);

  // Render markdown parser
  const renderMarkdown = (textStr: string) => (
    <SafeMarkdownBoundary fallbackText={textStr}>
      <ChatMarkdown content={textStr + (isLoading ? " ▋" : "")} />
    </SafeMarkdownBoundary>
  );

  return (
    <div className={`w-full flex ${isAi ? 'justify-start' : 'justify-end'} mb-6 last:mb-0 animate-message group/msg relative`}>
      <div className={`w-full max-w-[96%] flex gap-4 ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Sparkles Avatar outside on the left (AI only) */}
        {isAi ? (
          <div className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center bg-indigo-600 border border-indigo-500 shadow-sm text-white mt-1.5 select-none">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
        ) : null}

        <div className={`flex flex-col ${isAi ? 'items-start flex-1 min-w-0' : 'items-end max-w-[85%]'}`}>
          {isAi ? (
            /* Assistant Bubble Card */
            /* Assistant Clean Response Area (No document card feel) */
            <div className="bg-transparent border-none shadow-none rounded-none w-full text-left relative flex flex-col gap-3">
              
              {/* If structured widget data is detected, render WidgetRenderer */}
              {rawJson && (rawJson.includes("widget") || rawJson.includes("schema")) && (
                <div className="my-1 border border-border/60 rounded-2xl overflow-hidden shadow-inner bg-muted/10 w-full">
                  <WidgetRenderer rawJson={rawJson} isStreaming={isLoading} />
                </div>
              )}

              {/* Custom Interactive Indicators parsed inline */}
              {cleanText.includes("ATS Score:") && (
                <ATSScoreRing score={parseInt(cleanText.match(/ATS Score:\s*(\d+)/)?.[1] || "75")} />
              )}
              {cleanText.includes("Readiness Score:") && (
                <ReadinessGauge score={parseInt(cleanText.match(/Readiness Score:\s*(\d+)/)?.[1] || "60")} />
              )}
              {cleanText.includes("Difficulty:") && (
                <DifficultyMeter difficulty={(cleanText.match(/Difficulty:\s*(Easy|Medium|Hard)/)?.[1] || "Medium") as any} />
              )}

              {/* Conversational Text Bubble or Themed Report Card */}
              {cleanText ? (
                report.isReport ? (
                  <AIMessageCard
                    title={report.title}
                    description={report.description}
                    icon={report.icon}
                    onCopy={handleCopy}
                    onExportPdf={() => exportToPdf(report.title, cleanText)}
                    onExportMarkdown={() => exportToMarkdown(report.title, cleanText)}
                    onExportDocx={() => exportToDocx(report.title, cleanText)}
                  >
                    {renderMarkdown(cleanText)}
                  </AIMessageCard>
                ) : (
                  renderMarkdown(cleanText)
                )
              ) : (
                isLoading ? (
                  <div className="flex gap-1.5 items-center py-2">
                    <div className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce" />
                  </div>
                ) : (
                  <p className="text-[15px] font-medium text-foreground/80 italic leading-relaxed">
                    Interactive visualization loaded below:
                  </p>
                )
              )}

              {/* Smart Follow-Up Suggestions for the last message */}
              {isAi && !isLoading && !isGenerating && (
                cleanText.includes("resume") ? (
                  <SmartSuggestions 
                    suggestions={["Improve Resume", "Generate Cover Letter", "Run ATS Scan"]} 
                    onClick={onRegenerate || (() => {})} 
                  />
                ) : cleanText.includes("interview") ? (
                  <SmartSuggestions 
                    suggestions={["Start Mock Interview", "Prepare HR Questions", "Generate Learning Plan"]} 
                    onClick={onRegenerate || (() => {})} 
                  />
                ) : null
              )}

              {/* Compact Inline Message Actions at the bottom */}
              {isAi && msg.content && !isLoading && (
                <div className="flex items-center gap-3 text-muted-foreground/60 text-[10px] mt-1 select-none font-bold">
                  <span>{msg.time}</span>
                  <span>•</span>
                  <button 
                    onClick={handleCopy}
                    className={`hover:text-primary transition-colors flex items-center gap-1 cursor-pointer`}
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                  {onRegenerate && (
                    <>
                      <span>•</span>
                      <button 
                        onClick={() => onRegenerate(msg.content)}
                        className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        Regenerate
                      </button>
                    </>
                  )}
                  <span>•</span>
                  <button 
                    onClick={handleShare}
                    className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Share
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* User Bubble Card */
            <div className="bg-indigo-50/95 dark:bg-indigo-950/20 border border-indigo-150/50 dark:border-indigo-900/30 rounded-3xl px-5 py-4 w-full text-left relative flex flex-col gap-1.5 shadow-sm min-w-[220px]">
              {isEditing ? (
                <div className="w-full flex flex-col gap-2 bg-secondary border border-border p-3 rounded-2xl">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-transparent outline-none border-0 text-foreground text-sm resize-none min-h-[60px]"
                  />
                  <div className="flex justify-end gap-2 text-xs font-bold">
                    <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 rounded-lg border border-border hover:bg-secondary cursor-pointer">Cancel</button>
                    <button onClick={() => { if (onEdit) onEdit(msg.id, editText); setIsEditing(false); }} className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer">Save & Resend</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between w-full gap-4">
                  <div className="text-[15px] font-medium text-indigo-950 dark:text-indigo-200 leading-relaxed select-text">{msg.content}</div>
                  <button onClick={() => setIsEditing(true)} className="p-1 text-indigo-600 hover:text-indigo-800 text-[10px] font-bold uppercase shrink-0 opacity-0 group-hover/msg:opacity-100 transition-opacity cursor-pointer select-none">Edit</button>
                </div>
              )}
              {/* User Timestamp bottom-right */}
              <div className="text-[10px] font-bold text-indigo-600/40 dark:text-indigo-400/40 text-right mt-1 select-none">
                {msg.time}
              </div>
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
    // Load contextual memory from localStorage initially
    const savedMemory = localStorage.getItem("ai_copilot_memory");
    if (savedMemory) {
      try {
        setMemoryContext(JSON.parse(savedMemory));
      } catch(e) {}
    }
  }, []);

  const {
    conversations,
    activeConversationId,
    activeMessages,
    loadingHistory,
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

  const messages = activeMessages;
  const setMessages = (setter: Message[] | ((prev: Message[]) => Message[])) => {
    if (activeConversationId) {
      updateMessages(activeConversationId, setter);
    }
  };

  const [input, setInput] = useState("");
  const [uploadedAttachments, setUploadedAttachments] = useState<any[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, { name: string; size: number; progress: number; failed: boolean }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [feedback, setFeedback] = useState<Record<number, 'like' | 'dislike'>>({});
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Active Memory State
  const [memoryContext, setMemoryContext] = useState<{
    resumeName?: string;
    targetJd?: string;
    preferredCompany?: string;
    preferredRole?: string;
    techStack?: string;
    careerGoal?: string;
  }>({});

  const handleFeedback = useCallback((id: number, type: 'like' | 'dislike') => {
    setFeedback(prev => ({ ...prev, [id]: type }));
  }, []);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const limitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic pulsing loading states (cycles Reasoning status chips every 1.5s)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingPhase(1);
      interval = setInterval(() => {
        setLoadingPhase(prev => {
          if (prev >= 7) return 7; // Finalizing Response
          return prev + 1;
        });
      }, 1500);
    } else {
      setLoadingPhase(0);
    }
    return () => clearInterval(interval);
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
      textareaRef.current.style.height = '28px';
      if (input) {
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
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

  // Rule-based memory extraction from query/response
  const updateMemoryFromQuery = (text: string) => {
    const lowerText = text.toLowerCase();
    const nextMemory = { ...memoryContext };
    let changed = false;

    // Check target companies
    const companies = ["google", "amazon", "microsoft", "tcs", "infosys", "wipro", "cognizant", "meta", "netflix"];
    for (const c of companies) {
      if (lowerText.includes(c)) {
        nextMemory.preferredCompany = c.charAt(0).toUpperCase() + c.slice(1);
        changed = true;
        break;
      }
    }

    // Check roles
    if (lowerText.includes("software engineer") || lowerText.includes("sde")) {
      nextMemory.preferredRole = "Software Development Engineer (SDE)";
      changed = true;
    } else if (lowerText.includes("frontend") || lowerText.includes("front-end")) {
      nextMemory.preferredRole = "Frontend Engineer";
      changed = true;
    } else if (lowerText.includes("backend") || lowerText.includes("back-end")) {
      nextMemory.preferredRole = "Backend Engineer";
      changed = true;
    }

    // Check stack
    const stacks = ["java", "python", "javascript", "react", "spring boot", "node", "c++", "rust"];
    for (const s of stacks) {
      if (lowerText.includes(s)) {
        nextMemory.techStack = s.toUpperCase();
        changed = true;
        break;
      }
    }

    if (lowerText.includes("my goal is") || lowerText.includes("aim to")) {
      nextMemory.careerGoal = text.slice(0, 100);
      changed = true;
    }

    if (changed) {
      setMemoryContext(nextMemory);
      localStorage.setItem("ai_copilot_memory", JSON.stringify(nextMemory));
    }
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    for (const file of fileList) {
      const tempId = Math.random().toString(36).substring(7);
      setUploadingFiles(prev => ({
        ...prev,
        [tempId]: { name: file.name, size: file.size, progress: 30, failed: false }
      }));
      try {
        const formData = new FormData();
        formData.append("file", file);
        const token = localStorage.getItem("token");
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";
        
        // Simulating upload progress steps
        setTimeout(() => {
          setUploadingFiles(prev => {
            if (!prev[tempId]) return prev;
            return { ...prev, [tempId]: { ...prev[tempId], progress: 75 } };
          });
        }, 300);

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
        
        // Save uploaded resume details to context memory
        if (file.name.toLowerCase().includes("resume")) {
          const nextMemory = { ...memoryContext, resumeName: file.name };
          setMemoryContext(nextMemory);
          localStorage.setItem("ai_copilot_memory", JSON.stringify(nextMemory));
        }

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

  // Paste handler for files (PDFs/Images)
  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      handleFileUpload(e.clipboardData.files);
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

    // Save contextual memory items from query
    updateMemoryFromQuery(finalInput);

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
          conversationId: activeConversationId ? parseInt(activeConversationId) : null,
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
                  const dataValue = line.substring(5);
                  console.log("[AI Log] Chunk received by frontend: '" + dataValue + "'");

                  if (dataValue.startsWith('[CONVERSATION_ID:')) {
                    const newId = dataValue.replace('[CONVERSATION_ID:', '').replace(']', '').trim();
                    setActiveConversationId(newId);
                    continue;
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
    } else if (action === "ANALYZE_RESUME") {
      handleStop();
      handleSend("Analyze my resume");
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
      <SidebarTrigger className="hidden" />
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
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background text-foreground relative">
        
        {/* Active Context Memory bar */}
        <AIContextDrawer 
          context={memoryContext} 
          onClear={() => {
            setMemoryContext({});
            localStorage.removeItem("ai_copilot_memory");
            toast.info("AI placement memory context cleared");
          }} 
        />

        {/* Premium Simplified Header (removed tabs and online status) */}
        <header className="h-16 shrink-0 flex items-center justify-between px-8 border-b border-border/40 bg-card/85 backdrop-blur-md sticky top-0 z-30 select-none">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="md:hidden mr-1 text-muted-foreground hover:text-foreground" />
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

        <div className="flex-1 overflow-hidden relative flex flex-col">
          <NotificationCenter isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />

          <React.Fragment>
            <main 
              ref={scrollAreaRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto overflow-x-hidden selection:bg-primary/10 flex flex-col bg-background"
            >
              {isEmpty ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto max-w-[96%] mx-auto w-full space-y-8 select-none">
                  <div className="flex flex-col items-center justify-center text-center mt-12 space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
                      <Sparkles className="w-6 h-6 animate-pulse text-indigo-600" />
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
                <div className="flex-1 px-4 py-6 w-full max-w-[96%] mx-auto text-left">
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

                  {/* Pulsing loading reasoning status chips */}
                  {isLoading && (
                    <div className="w-full flex justify-center mb-6">
                      <div className="w-full max-w-[96%] px-6">
                        <ReasoningStatus loadingPhase={loadingPhase} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </main>

            {/* ChatGPT-Style Centered Input Area */}
            <div className="w-full shrink-0 py-3 pb-4 relative z-10 select-none bg-background">
              <div className="max-w-[96%] mx-auto px-6 relative">
                
                {/* Upload attachment pre-views */}
                {(uploadedAttachments.length > 0 || Object.keys(uploadingFiles).length > 0) && (
                  <div className="absolute -top-20 left-6 flex flex-wrap gap-3.5 animate-in fade-in slide-in-from-bottom-2 z-20">
                    {uploadedAttachments.map((att) => (
                      <FileUploadPreview 
                        key={att.id} 
                        file={att} 
                        onRemove={() => setUploadedAttachments(prev => prev.filter(x => x.id !== att.id))} 
                      />
                    ))}
                    {Object.entries(uploadingFiles).map(([id, file]) => (
                      <FileUploadPreview 
                        key={id} 
                        file={{ name: file.name, size: file.size, id }} 
                        progress={file.progress} 
                        onRemove={() => {}} 
                      />
                    ))}
                  </div>
                )}

                <div className="relative flex items-center bg-secondary/60 border border-border rounded-xl px-4 py-2 min-h-[52px] max-h-[160px] shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:border-indigo-500/50 gap-3">
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
                    className="p-1.5 rounded-xl text-muted-foreground/70 hover:text-indigo-600 hover:bg-indigo-50 transition-all shrink-0 cursor-pointer"
                    title="Attach files"
                  >
                    <Paperclip className="w-4.5 h-4.5" />
                  </button>

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
                    onPaste={handlePaste}
                    placeholder="Ask anything about placements, resumes, interviews, coding or careers..." 
                    className="flex-1 bg-transparent border-0 outline-none ring-0 focus:ring-0 focus:outline-none p-1 text-sm text-foreground placeholder:text-slate-500 resize-none min-h-[28px] max-h-[140px] leading-relaxed"
                    rows={1}
                    maxLength={2000}
                    disabled={isLoading}
                  />

                  {/* Character Counter */}
                  <span className="text-[10px] text-muted-foreground/50 font-bold shrink-0 select-none">
                    {input.length}/2000
                  </span>

                  {isLoading ? (
                    <button 
                      onClick={handleStop}
                      className="h-8 px-3.5 rounded-lg flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white shadow-sm shrink-0 transition-all cursor-pointer font-bold text-xs"
                    >
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Stop
                    </button>
                  ) : (
                    <motion.button 
                      onClick={() => handleSend()}
                      disabled={(!input.trim() && uploadedAttachments.length === 0) || isLoading}
                      whileHover={input.trim() ? { scale: 1.05 } : {}}
                      whileTap={input.trim() ? { scale: 0.95 } : {}}
                      className={`h-8 px-3.5 rounded-lg flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer font-bold text-xs ${
                        (input.trim() || uploadedAttachments.length > 0) && !isLoading 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm' 
                        : 'bg-transparent text-slate-400'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send
                    </motion.button>
                  )}
                </div>
                
                <div className="text-[10px] text-muted-foreground/60 text-center mt-1.5">
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
