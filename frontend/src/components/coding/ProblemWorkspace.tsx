"use client";

import { useState, useEffect } from "react";
import { ProblemDto } from "@/app/dashboard/coding/page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ArrowLeft, Play, Send, Bot, Code2, CheckCircle2, History, RotateCcw, Settings, ChevronDown } from "lucide-react";
import TestCasePanel from "./TestCasePanel";
import AiCopilotPanel from "./AiCopilotPanel";
import api from "@/lib/api";

interface ProblemWorkspaceProps {
  problem: ProblemDto;
  onBack: () => void;
  onAcceptedSubmission?: () => void;
}

const getStarterSnippet = (problem: ProblemDto, language: string): string => {
  const lang = (language || "python").toLowerCase();
  const title = (problem?.title || "").toLowerCase();

  // Two Sum
  if (title.includes("two sum")) {
    switch (lang) {
      case "python":
        return `from typing import List\n\nclass Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass\n`;
      case "javascript":
        return `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    \n}\n`;
      case "java":
        return `import java.util.*;\n\npublic class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}\n`;
      case "c++":
      case "cpp":
        return `#include <vector>\n\nclass Solution {\npublic:\n    std::vector<int> twoSum(std::vector<int>& nums, int target) {\n        \n    }\n};\n`;
      case "c":
        return `#include <stdlib.h>\n\n/**\n * Note: The returned array must be malloced, assume caller calls free().\n */\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    \n}\n`;
    }
  }

  // Longest Substring Without Repeating Characters
  if (title.includes("longest substring")) {
    switch (lang) {
      case "python":
        return `class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        pass\n`;
      case "javascript":
        return `/**\n * @param {string} s\n * @return {number}\n */\nfunction lengthOfLongestSubstring(s) {\n    \n}\n`;
      case "java":
        return `import java.util.*;\n\npublic class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        \n    }\n}\n`;
      case "c++":
      case "cpp":
        return `#include <string>\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(std::string s) {\n        \n    }\n};\n`;
      case "c":
        return `int lengthOfLongestSubstring(char* s) {\n    \n}\n`;
    }
  }

  // Trapping Rain Water
  if (title.includes("trapping rain water") || title.includes("rain water")) {
    switch (lang) {
      case "python":
        return `from typing import List\n\nclass Solution:\n    def trap(self, height: List[int]) -> int:\n        pass\n`;
      case "javascript":
        return `/**\n * @param {number[]} height\n * @return {number}\n */\nfunction trap(height) {\n    \n}\n`;
      case "java":
        return `public class Solution {\n    public int trap(int[] height) {\n        \n    }\n}\n`;
      case "c++":
      case "cpp":
        return `#include <vector>\n\nclass Solution {\npublic:\n    int trap(std::vector<int>& height) {\n        \n    }\n};\n`;
      case "c":
        return `int trap(int* height, int heightSize) {\n    \n}\n`;
    }
  }

  // Generic Starter Snippet
  switch (lang) {
    case "python":
      return `from typing import List, Dict, Optional\n\nclass Solution:\n    def solve(self):\n        pass\n`;
    case "javascript":
      return `function solution() {\n    \n}\n`;
    case "java":
      return `import java.util.*;\n\npublic class Solution {\n    public void solve() {\n        \n    }\n}\n`;
    case "c++":
    case "cpp":
      return `#include <iostream>\n#include <vector>\n\nclass Solution {\npublic:\n    void solve() {\n        \n    }\n};\n`;
    case "c":
      return `#include <stdio.h>\n#include <stdlib.h>\n\nvoid solve() {\n    \n}\n`;
    default:
      return `// Write your ${lang} solution here...\n`;
  }
};

export default function ProblemWorkspace({ problem, onBack, onAcceptedSubmission }: ProblemWorkspaceProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("python");
  const [code, setCode] = useState<string>(() => getStarterSnippet(problem, "python"));
  const [isExecuting, setIsExecuting] = useState(false);
  const [showCopilot, setShowCopilot] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [activeTabLeft, setActiveTabLeft] = useState<"statement" | "submissions">("statement");

  const [executionResults, setExecutionResults] = useState<any>(null);

  useEffect(() => {
    const defaultLang = (problem.targetLanguages && problem.targetLanguages.length > 0)
      ? problem.targetLanguages[0].toLowerCase()
      : selectedLanguage;
    setSelectedLanguage(defaultLang);
    setCode(getStarterSnippet(problem, defaultLang));
    fetchSubmissions();
  }, [problem]);

  const fetchSubmissions = async () => {
    try {
      const res = await api.get(`/coding/problems/${problem.id}/submissions`);
      setSubmissions(res.data || []);
    } catch (e) {
      console.warn("Failed to fetch submissions:", e);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    setCode(getStarterSnippet(problem, lang));
  };

  const handleRunCode = async (customCases: { input: string; expectedOutput: string }[]) => {
    setIsExecuting(true);
    setExecutionResults(null);
    try {
      const res = await api.post(`/coding/problems/${problem.id}/run`, {
        code,
        language: selectedLanguage,
        customTestCases: customCases
      });
      setExecutionResults(res.data);
    } catch (e: any) {
      setExecutionResults({
        status: "RUNTIME_ERROR",
        compileOutput: e?.response?.data?.message || "Execution engine failure"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmitCode = async () => {
    setIsExecuting(true);
    setExecutionResults(null);
    try {
      const res = await api.post(`/coding/problems/${problem.id}/submit`, {
        code,
        language: selectedLanguage
      });
      setExecutionResults(res.data);
      fetchSubmissions();
      if (res.data && (res.data.status === "ACCEPTED" || res.data.status === "Accepted")) {
        onAcceptedSubmission?.();
      }
    } catch (e: any) {
      setExecutionResults({
        status: "RUNTIME_ERROR",
        compileOutput: e?.response?.data?.message || "Submission failed"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] max-w-full overflow-hidden bg-background text-foreground">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between px-4 py-2 bg-card/60 border-b border-border/50 text-xs shrink-0">
        <div className="flex items-center gap-3">
          <Button size="sm" variant="ghost" onClick={onBack} className="h-8 px-2 text-muted-foreground hover:text-foreground font-medium">
            <ArrowLeft className="w-4 h-4 mr-1" /> Problem List
          </Button>
          <span className="text-border/60">|</span>
          <h2 className="font-bold text-foreground text-sm truncate max-w-xs">{problem.title}</h2>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              problem.difficulty.toLowerCase() === "easy"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : problem.difficulty.toLowerCase() === "hard"
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            }`}
          >
            {problem.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative inline-flex items-center">
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="h-8 pl-3 pr-8 text-xs bg-background border border-border/60 rounded-md text-foreground font-mono font-medium focus:outline-none focus:border-primary appearance-none cursor-pointer hover:bg-muted/40 transition-colors shadow-sm"
            >
              {(problem.targetLanguages || ["javascript", "python", "java", "c++", "c"]).map((lang) => (
                <option key={lang} value={lang.toLowerCase()}>
                  {lang}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none text-muted-foreground" />
          </div>

          {/* AI Copilot Toggle */}
          <button
            onClick={() => setShowCopilot(!showCopilot)}
            className={`h-8 px-3.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 shadow-sm ${
              showCopilot
                ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-600 ring-2 ring-purple-400/40 shadow-purple-500/20"
                : "bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200 border-purple-400 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/60"
            }`}
          >
            <Bot className="w-4 h-4 text-current" />
            <span>Copilot</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Split Panels */}
      <div className="flex-1 min-h-0 w-full overflow-hidden">
        <ResizablePanelGroup orientation="horizontal">
          {/* LEFT PANEL: Problem Description / Submissions */}
          <ResizablePanel defaultSize={40} minSize={25}>
            <div className="flex flex-col h-full border-r border-border/50 bg-background/50">
              {/* Left Sub-Header Tabs */}
              <div className="flex items-center px-4 py-2 border-b border-border/50 bg-card/30 text-xs gap-4 shrink-0">
                <button
                  onClick={() => setActiveTabLeft("statement")}
                  className={`font-medium transition pb-1 border-b-2 ${
                    activeTabLeft === "statement"
                      ? "border-primary text-foreground font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTabLeft("submissions")}
                  className={`font-medium transition pb-1 border-b-2 flex items-center gap-1 ${
                    activeTabLeft === "submissions"
                      ? "border-primary text-foreground font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <History className="w-3.5 h-3.5" /> Submissions ({submissions.length})
                </button>
              </div>

              {/* Left Content Area */}
              <div className="flex-1 p-5 overflow-y-auto space-y-5 text-sm leading-relaxed">
                {activeTabLeft === "statement" && (
                  <>
                    <div>
                      <h1 className="text-2xl font-black text-foreground mb-2">{problem.title}</h1>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {problem.tags.map((tag) => (
                          <span key={tag} className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground font-medium rounded border border-border/40">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="dark:prose-invert prose prose-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {problem.problemStatement?.replace(/\\n/g, "\n")}
                      </div>
                    </div>

                    {problem.examples && (
                      <div className="space-y-3 pt-3 border-t border-border/40">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Examples</h4>
                        <pre className="p-3.5 bg-card/60 border border-border/50 rounded-xl font-mono text-xs text-foreground whitespace-pre-wrap break-words">
                          {problem.examples.replace(/\\n/g, "\n")}
                        </pre>
                      </div>
                    )}

                    {problem.constraints && (
                      <div className="space-y-2 pt-3 border-t border-border/40">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Constraints & Complexity Targets</h4>
                        <div className="p-3 bg-card/40 border border-border/40 rounded-xl text-xs space-y-1 font-mono text-muted-foreground">
                          <p>Time Complexity Target: <span className="text-primary font-bold">{problem.timeComplexityTarget}</span></p>
                          <p>Space Complexity Target: <span className="text-primary font-bold">{problem.spaceComplexityTarget}</span></p>
                          <p className="mt-2 text-foreground/90 font-sans whitespace-pre-wrap">{problem.constraints.replace(/\\n/g, "\n")}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTabLeft === "submissions" && (
                  <div className="space-y-3">
                    {submissions.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-8">No previous submissions for this problem yet.</p>
                    ) : (
                      submissions.map((sub, i) => (
                        <div key={i} className="p-3 rounded-lg border border-border/50 bg-card/40 text-xs flex justify-between items-center">
                          <div>
                            <span className={`font-bold ${sub.status === "ACCEPTED" ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
                              {sub.status === "ACCEPTED" ? "✓ Accepted" : `✗ ${sub.status}`}
                            </span>
                            <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                              {sub.language} • {sub.executionTimeMs || 0} ms • {sub.passedTests}/{sub.totalTests} tests
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {new Date(sub.submittedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-border/40 hover:bg-primary transition" />

          {/* CENTER PANEL: Code Editor & Bottom Test Runner */}
          <ResizablePanel defaultSize={showCopilot ? 40 : 60} minSize={30}>
            <ResizablePanelGroup orientation="vertical">
              {/* Code Editor */}
              <ResizablePanel defaultSize={60} minSize={30}>
                <div className="flex flex-col h-full bg-white dark:bg-card text-black dark:text-foreground">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-muted/40 border-b border-border/60 text-xs font-mono text-slate-700 dark:text-muted-foreground select-none">
                    <span className="font-semibold text-slate-900 dark:text-foreground">
                      solution.{selectedLanguage === "javascript" ? "js" : selectedLanguage === "python" ? "py" : selectedLanguage === "java" ? "java" : "cpp"}
                    </span>
                    <button
                      onClick={() => setCode(getStarterSnippet(problem, selectedLanguage))}
                      className="text-slate-500 hover:text-slate-900 dark:text-muted-foreground dark:hover:text-foreground flex items-center gap-1 text-xs transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  </div>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck={false}
                    className="flex-1 w-full p-4 bg-white dark:bg-card text-black dark:text-foreground font-mono text-xs leading-relaxed focus:outline-none resize-none selection:bg-primary/20 placeholder:text-muted-foreground"
                    placeholder={`// Write your ${selectedLanguage} solution here...`}
                  />
                </div>
              </ResizablePanel>

              <ResizableHandle className="h-1 bg-border/40 hover:bg-primary transition" />

              {/* Bottom Execution Panel */}
              <ResizablePanel defaultSize={40} minSize={20}>
                <TestCasePanel
                  publicTestCases={problem.publicTestCases || []}
                  onRunCode={handleRunCode}
                  onSubmitCode={handleSubmitCode}
                  isExecuting={isExecuting}
                  executionResults={executionResults}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          {/* RIGHT PANEL: AI Copilot (Collapsible) */}
          {showCopilot && (
            <>
              <ResizableHandle className="w-1 bg-border/40 hover:bg-primary transition" />
              <ResizablePanel defaultSize={20} minSize={15}>
                <AiCopilotPanel problemId={problem.id} code={code} language={selectedLanguage} />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
