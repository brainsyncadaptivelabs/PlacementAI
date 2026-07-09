"use client";

import React, { useState, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { Copy, Check, Download } from "lucide-react";
import dynamic from "next/dynamic";

const MermaidDiagram = dynamic(() => import("./widgets/mermaid/MermaidDiagram"), { ssr: false });

interface ChatMarkdownProps {
  content: string;
}

const CodeBlock = memo(({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `code-snippet.${language === "javascript" ? "js" : language === "typescript" ? "ts" : language === "python" ? "py" : "txt"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download code", err);
    }
  };

  return (
    <div className="flex flex-col font-mono text-xs w-full bg-slate-950 text-slate-100 select-text">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-slate-900 select-none">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{language}</span>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 hover:text-white text-slate-400 font-bold transition-colors cursor-pointer"
            title="Copy Code"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-green-400" />
                <span className="text-[10px] text-green-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[10px]">Copy</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 hover:text-white text-slate-400 font-bold transition-colors cursor-pointer"
            title="Download Code"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[10px]">Download</span>
          </button>
        </div>
      </div>
      <pre className="p-4 overflow-x-auto leading-relaxed select-text">
        <code>{code}</code>
      </pre>
    </div>
  );
});

CodeBlock.displayName = "CodeBlock";

export const ChatMarkdown = memo(({ content }: ChatMarkdownProps) => {
  return (
    <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed space-y-2 select-text">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          pre({ children }) {
            return <div className="my-3 overflow-hidden rounded-xl border border-border/80 shadow-sm">{children}</div>;
          },
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeVal = String(children).replace(/\n$/, "");
            const language = match ? match[1] : "";

            if (language === "mermaid") {
              return <MermaidDiagram chart={codeVal} />;
            }

            if (match) {
              return <CodeBlock code={codeVal} language={language} />;
            }

            return (
              <code className="bg-muted px-1.5 py-0.5 rounded-md font-mono text-xs text-foreground font-bold" {...props}>
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-3 border rounded-xl border-border bg-card">
                <table className="min-w-full divide-y divide-border text-xs text-left">{children}</table>
              </div>
            );
          },
          th({ children }) {
            return <th className="px-4 py-3 bg-muted font-bold text-foreground">{children}</th>;
          },
          td({ children }) {
            return <td className="px-4 py-3 border-t border-border font-medium text-muted-foreground">{children}</td>;
          },
          blockquote({ children }) {
            return <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-2">{children}</blockquote>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

ChatMarkdown.displayName = "ChatMarkdown";
export default ChatMarkdown;
