"use client";

import { useState, useEffect } from "react";
import { ProblemDto } from "@/app/dashboard/coding/page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ArrowLeft, Play, Send, Bot, Code2, CheckCircle2, History, RotateCcw, Settings } from "lucide-react";
import TestCasePanel from "./TestCasePanel";
import AiCopilotPanel from "./AiCopilotPanel";
import api from "@/lib/api";

interface ProblemWorkspaceProps {
  problem: ProblemDto;
  onBack: () => void;
}

const languageSnippets: Record<string, string> = {
  javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) {\n            return [map.get(diff), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}`,
  python: `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        seen = {}\n        for i, num in enumerate(nums):\n            diff = target - num\n            if diff in seen:\n                return [seen[diff], i]\n            seen[num] = i\n        return []`,
  java: `import java.util.*;\n\npublic class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (map.containsKey(diff)) {\n                return new int[] { map.get(diff), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}`,
  "c++": `#include <vector>\n#include <unordered_map>\n\nclass Solution {\npublic:\n    std::vector<int> twoSum(std::vector<int>& nums, int target) {\n        std::unordered_map<int, int> map;\n        for (int i = 0; i < nums.size(); i++) {\n            int diff = target - nums[i];\n            if (map.find(diff) != map.end()) {\n                return {map[diff], i};\n            }\n            map[i] = i;\n        }\n        return {};\n    }\n};`,
  c: `#include <stdlib.h>\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    *returnSize = 2;\n    int* res = (int*)malloc(2 * sizeof(int));\n    for(int i=0; i<numsSize; i++) {\n        for(int j=i+1; j<numsSize; j++) {\n            if(nums[i] + nums[j] == target) {\n                res[0] = i; res[1] = j;\n                return res;\n            }\n        }\n    }\n    return res;\n}`
};

export default function ProblemWorkspace({ problem, onBack }: ProblemWorkspaceProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("javascript");
  const [code, setCode] = useState<string>(languageSnippets["javascript"]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showCopilot, setShowCopilot] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [activeTabLeft, setActiveTabLeft] = useState<"statement" | "submissions">("statement");

  const [executionResults, setExecutionResults] = useState<any>(null);

  useEffect(() => {
    if (problem.targetLanguages && problem.targetLanguages.length > 0) {
      const defaultLang = problem.targetLanguages[0].toLowerCase();
      setSelectedLanguage(defaultLang);
      setCode(languageSnippets[defaultLang] || `// Write your ${defaultLang} solution here...`);
    }
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
    setCode(languageSnippets[lang] || `// Write solution in ${lang}...`);
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
          <Button size="sm" variant="ghost" onClick={onBack} className="h-8 px-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" /> Problem List
          </Button>
          <span className="text-border/60">|</span>
          <h2 className="font-semibold text-white truncate max-w-xs">{problem.title}</h2>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              problem.difficulty.toLowerCase() === "easy"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : problem.difficulty.toLowerCase() === "hard"
                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}
          >
            {problem.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="h-8 px-2.5 text-xs bg-background border border-border/60 rounded-md text-foreground font-mono font-medium focus:outline-none"
          >
            {(problem.targetLanguages || ["javascript", "python", "java", "c++", "c"]).map((lang) => (
              <option key={lang} value={lang.toLowerCase()}>
                {lang}
              </option>
            ))}
          </select>

          {/* AI Copilot Toggle */}
          <Button
            size="sm"
            variant={showCopilot ? "default" : "outline"}
            onClick={() => setShowCopilot(!showCopilot)}
            className={`h-8 text-xs font-medium border-purple-500/30 ${
              showCopilot ? "bg-purple-600 hover:bg-purple-500 text-white" : "text-purple-400 hover:bg-purple-500/10"
            }`}
          >
            <Bot className="w-3.5 h-3.5 mr-1.5" /> Copilot
          </Button>
        </div>
      </div>

      {/* Main Workspace Split Panels */}
      <div className="flex-1 min-h-0 w-full overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* LEFT PANEL: Problem Description / Submissions */}
          <ResizablePanel defaultSize={40} minSize={25}>
            <div className="flex flex-col h-full border-r border-border/50 bg-background/50">
              {/* Left Sub-Header Tabs */}
              <div className="flex items-center px-4 py-2 border-b border-border/50 bg-card/30 text-xs gap-4 shrink-0">
                <button
                  onClick={() => setActiveTabLeft("statement")}
                  className={`font-medium transition pb-1 border-b-2 ${
                    activeTabLeft === "statement"
                      ? "border-primary text-foreground font-semibold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTabLeft("submissions")}
                  className={`font-medium transition pb-1 border-b-2 flex items-center gap-1 ${
                    activeTabLeft === "submissions"
                      ? "border-primary text-foreground font-semibold"
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
                      <h1 className="text-xl font-bold text-white mb-2">{problem.title}</h1>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {problem.tags.map((tag) => (
                          <span key={tag} className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded border border-border/40">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="prose prose-invert prose-sm text-foreground/90 whitespace-pre-wrap">
                        {problem.problemStatement}
                      </div>
                    </div>

                    {problem.examples && (
                      <div className="space-y-3 pt-3 border-t border-border/40">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Examples</h4>
                        <pre className="p-3.5 bg-card/60 border border-border/50 rounded-xl font-mono text-xs text-foreground whitespace-pre-wrap">
                          {problem.examples}
                        </pre>
                      </div>
                    )}

                    {problem.constraints && (
                      <div className="space-y-2 pt-3 border-t border-border/40">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Constraints & Complexity Targets</h4>
                        <div className="p-3 bg-card/40 border border-border/40 rounded-xl text-xs space-y-1 font-mono text-muted-foreground">
                          <p>Time Complexity Target: <span className="text-primary font-semibold">{problem.timeComplexityTarget}</span></p>
                          <p>Space Complexity Target: <span className="text-primary font-semibold">{problem.spaceComplexityTarget}</span></p>
                          <p className="mt-2 text-foreground/80 font-sans">{problem.constraints}</p>
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
                            <span className={`font-bold ${sub.status === "ACCEPTED" ? "text-emerald-400" : "text-rose-400"}`}>
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
            <ResizablePanelGroup direction="vertical">
              {/* Code Editor */}
              <ResizablePanel defaultSize={60} minSize={30}>
                <div className="flex flex-col h-full bg-[#0d1117] text-foreground">
                  <div className="flex items-center justify-between px-4 py-1.5 bg-[#161b22] border-b border-border/40 text-xs font-mono text-muted-foreground">
                    <span>solution.{selectedLanguage === "javascript" ? "js" : selectedLanguage === "python" ? "py" : selectedLanguage === "java" ? "java" : "cpp"}</span>
                    <button onClick={() => setCode(languageSnippets[selectedLanguage] || "")} className="hover:text-foreground flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  </div>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck={false}
                    className="flex-1 w-full p-4 bg-[#0d1117] text-slate-100 font-mono text-xs leading-relaxed focus:outline-none resize-none"
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
