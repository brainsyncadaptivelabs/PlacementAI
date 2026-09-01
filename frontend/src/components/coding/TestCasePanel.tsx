"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Send, Plus, CheckCircle, XCircle, Clock, Terminal, AlertCircle } from "lucide-react";

interface TestCase {
  id?: number;
  input: string;
  expectedOutput: string;
  description?: string;
  ordinal?: number;
}

interface TestResult {
  ordinal: number;
  passed: boolean;
  verdict: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  errorMessage?: string;
  runtimeMs?: number;
}

interface TestCasePanelProps {
  publicTestCases: TestCase[];
  onRunCode: (customCases: { input: string; expectedOutput: string }[]) => void;
  onSubmitCode: () => void;
  isExecuting: boolean;
  executionResults?: {
    status: string;
    passedCount?: number;
    totalCount?: number;
    executionTimeMs?: number;
    memoryUsedMb?: number;
    compileOutput?: string;
    testResults?: TestResult[];
  } | null;
}

export default function TestCasePanel({
  publicTestCases,
  onRunCode,
  onSubmitCode,
  isExecuting,
  executionResults
}: TestCasePanelProps) {
  const [activeTab, setActiveTab] = useState<"testcases" | "custom" | "result">("testcases");
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [customExpected, setCustomExpected] = useState("");

  const handleRun = () => {
    setActiveTab("result");
    const custom = customInput.trim() ? [{ input: customInput, expectedOutput: customExpected }] : [];
    onRunCode(custom);
  };

  const handleSubmit = () => {
    setActiveTab("result");
    onSubmitCode();
  };

  return (
    <div className="flex flex-col h-full bg-background border-t border-border/50">
      {/* Header & Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-card/40 border-b border-border/50 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("testcases")}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              activeTab === "testcases" ? "bg-secondary text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Test Cases ({publicTestCases.length})
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              activeTab === "custom" ? "bg-secondary text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Custom Input
          </button>
          {executionResults && (
            <button
              onClick={() => setActiveTab("result")}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                activeTab === "result" ? "bg-secondary text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Execution Output
              {executionResults.status === "ACCEPTED" ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              )}
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRun}
            disabled={isExecuting}
            className="h-8 text-xs font-semibold bg-background hover:bg-muted border-border/60"
          >
            <Play className="w-3.5 h-3.5 mr-1.5 text-emerald-400 fill-emerald-400/20" />
            {isExecuting ? "Executing..." : "Run"}
          </Button>

          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isExecuting}
            className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/20"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Submit
          </Button>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-xs">
        {activeTab === "testcases" && (
          <div className="space-y-4">
            <div className="flex gap-2 border-b border-border/40 pb-2">
              {publicTestCases.map((tc, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCaseIdx(idx)}
                  className={`px-3 py-1 rounded-md text-xs font-sans transition ${
                    selectedCaseIdx === idx
                      ? "bg-primary/20 text-primary border border-primary/40 font-medium"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Case {idx + 1}
                </button>
              ))}
            </div>

            {publicTestCases[selectedCaseIdx] && (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-[11px] font-sans font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                    Input:
                  </label>
                  <pre className="p-3 bg-muted/30 border border-border/40 rounded-lg whitespace-pre-wrap font-mono text-foreground">
                    {publicTestCases[selectedCaseIdx].input}
                  </pre>
                </div>

                <div>
                  <label className="text-[11px] font-sans font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                    Expected Output:
                  </label>
                  <pre className="p-3 bg-muted/30 border border-border/40 rounded-lg whitespace-pre-wrap font-mono text-emerald-400">
                    {publicTestCases[selectedCaseIdx].expectedOutput}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "custom" && (
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-sans font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                Custom Stdin / Input:
              </label>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter custom input lines..."
                className="w-full h-24 p-3 bg-background border border-border/60 rounded-lg text-xs font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-[11px] font-sans font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                Expected Output (Optional):
              </label>
              <textarea
                value={customExpected}
                onChange={(e) => setCustomExpected(e.target.value)}
                placeholder="Enter expected output to compare..."
                className="w-full h-20 p-3 bg-background border border-border/60 rounded-lg text-xs font-mono focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {activeTab === "result" && (
          <div>
            {!executionResults ? (
              <div className="py-8 text-center text-muted-foreground font-sans text-xs">
                Click "Run" or "Submit" to see execution telemetry.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Status Bar */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/50">
                  <div className="flex items-center gap-2">
                    {executionResults.status === "ACCEPTED" ? (
                      <span className="text-base font-bold text-emerald-400 flex items-center gap-1.5 font-sans">
                        <CheckCircle className="w-5 h-5" /> Accepted
                      </span>
                    ) : (
                      <span className="text-base font-bold text-rose-400 flex items-center gap-1.5 font-sans">
                        <XCircle className="w-5 h-5" /> {executionResults.status}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                    {executionResults.passedCount !== undefined && (
                      <span>Tests: {executionResults.passedCount}/{executionResults.totalCount} passed</span>
                    )}
                    {executionResults.executionTimeMs !== undefined && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary" /> {executionResults.executionTimeMs} ms
                      </span>
                    )}
                  </div>
                </div>

                {/* Compiler output if error */}
                {executionResults.compileOutput && (
                  <div>
                    <label className="text-[11px] font-sans font-medium text-rose-400 uppercase tracking-wider block mb-1">
                      Compiler / Execution Output:
                    </label>
                    <pre className="p-3 bg-rose-950/20 border border-rose-900/40 text-rose-300 rounded-lg font-mono text-xs whitespace-pre-wrap overflow-x-auto">
                      {executionResults.compileOutput}
                    </pre>
                  </div>
                )}

                {/* Test case breakdown */}
                {executionResults.testResults && executionResults.testResults.length > 0 && (
                  <div className="space-y-3 font-mono">
                    {executionResults.testResults.map((tr, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border text-xs ${
                          tr.passed
                            ? "bg-emerald-950/10 border-emerald-900/30 text-emerald-300"
                            : "bg-rose-950/10 border-rose-900/30 text-rose-300"
                        }`}
                      >
                        <div className="flex justify-between font-sans font-medium mb-1.5">
                          <span>Test Case #{tr.ordinal}</span>
                          <span>{tr.passed ? "✓ Passed" : `✗ ${tr.verdict}`}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-muted-foreground">Input:</span>
                            <div className="bg-background/60 p-1.5 rounded border border-border/40 mt-0.5">{tr.input}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Actual Output:</span>
                            <div className="bg-background/60 p-1.5 rounded border border-border/40 mt-0.5">{tr.actualOutput || tr.errorMessage || "N/A"}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
