"use client";

import { useState, useEffect } from "react";
import { useAtsAnalysisStore } from "@/store/useAtsAnalysisStore";
import { AtsScoreReport } from "@/components/ats/AtsScoreReport";
import api from "@/lib/api";
import {
  FileText,
  Upload,
  RefreshCw,
  Search,
  Sparkles,
  AlertTriangle,
  History,
  Layers,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface ResumeItem {
  id: number;
  fileName: string;
  filePath: string;
  createdAt: string;
}

export default function ResumeATSPage() {
  const {
    currentScan,
    scanHistory,
    isLoading,
    error,
    scanMode,
    setScanMode,
    runGeneralScan,
    runJdScan,
    fetchHistory,
    selectHistoricalScan,
    clearError,
  } = useAtsAnalysisStore();

  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [resumesLoading, setResumesLoading] = useState(true);

  // JD mode state
  const [jdText, setJdText] = useState("");
  const [jdFileUrl, setJdFileUrl] = useState("");
  const [targetRole, setTargetRole] = useState("");

  // Load user resumes on mount
  useEffect(() => {
    const loadResumes = async () => {
      setResumesLoading(true);
      try {
        const res = await api.get("/resume/all");
        if (Array.isArray(res.data) && res.data.length > 0) {
          setResumes(res.data);
          setSelectedResumeId(res.data[0].id);
          fetchHistory(res.data[0].id);
        }
      } catch {
        // Fallback to single resume endpoint if /resume/all unavailable
        try {
          const single = await api.get("/resume/latest");
          if (single.data?.id) {
            setResumes([single.data]);
            setSelectedResumeId(single.data.id);
            fetchHistory(single.data.id);
          }
        } catch {
          console.warn("No user resumes found");
        }
      } finally {
        setResumesLoading(false);
      }
    };

    loadResumes();
  }, []);

  const handleResumeChange = (id: number) => {
    setSelectedResumeId(id);
    clearError();
    fetchHistory(id);
  };

  const handleRunScan = () => {
    if (!selectedResumeId) return;
    clearError();

    if (scanMode === "general") {
      runGeneralScan(selectedResumeId);
    } else {
      runJdScan(selectedResumeId, {
        jdText: jdText.trim() ? jdText.trim() : undefined,
        jdFileUrl: jdFileUrl.trim() ? jdFileUrl.trim() : undefined,
        targetRole: targetRole.trim() ? targetRole.trim() : undefined,
      });
    }
  };

  // Mutually exclusive inputs: disable one if the other is filled
  const isJdTextFilled = jdText.trim().length > 0;
  const isJdFileFilled = jdFileUrl.trim().length > 0;

  const canRunScan =
    selectedResumeId !== null &&
    !isLoading &&
    (scanMode === "general" || isJdTextFilled || isJdFileFilled);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 min-h-screen">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            ATS Resume Scanner & Copilot
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Analyze your resume with experience-tier awareness or target specific job descriptions.
          </p>
        </div>

        {/* History Selector Dropdown */}
        {scanHistory.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <History className="w-4 h-4 text-indigo-500 shrink-0" />
            <select
              value={currentScan?.analysisId || ""}
              onChange={(e) => selectHistoricalScan(Number(e.target.value))}
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[220px] truncate"
            >
              {scanHistory.map((item) => (
                <option key={item.analysisId} value={item.analysisId} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {item.scanType} Scan — {new Date(item.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Control Panel: Resume Selection & Mode Toggles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Resume & Mode Config */}
        <div className="lg:col-span-1 space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Active Resume Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-500" /> Active Resume
            </label>

            {resumesLoading ? (
              <div className="h-10 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
            ) : resumes.length > 0 ? (
              <select
                value={selectedResumeId || ""}
                onChange={(e) => handleResumeChange(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.fileName} ({new Date(r.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                No uploaded resumes found. Upload a resume first to run an ATS scan.
              </p>
            )}
          </div>

          {/* Mode Switcher Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" /> Scan Mode
            </label>

            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setScanMode("general")}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                  scanMode === "general"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                General Scan
              </button>

              <button
                type="button"
                onClick={() => setScanMode("jd")}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                  scanMode === "jd"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Scan Against JD
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleRunScan}
            disabled={!canRunScan}
            className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
              canRunScan
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 active:scale-[0.99]"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing Resume...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                {scanMode === "general" ? "Run General ATS Scan" : "Scan Against Target JD"}
              </>
            )}
          </button>
        </div>

        {/* Right Column: Mode Inputs & Dynamic Options */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          {scanMode === "general" ? (
            <div className="space-y-4 my-auto py-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Experience-Aware General ATS Scan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Generates a complete breakdown of your resume strengths, level-expected skills, and stretch career milestones without requiring a specific job description.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Job Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Backend Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Mutually Exclusive Inputs Notice */}
              <p className="text-[11px] text-slate-400 font-medium italic">
                Provide either JD Text OR a Document File URL below (inputs are mutually exclusive):
              </p>

              {/* Option A: Paste JD Text */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Option A: Paste Job Description Text</span>
                  {isJdFileFilled && <span className="text-[10px] text-amber-500 flex items-center gap-1"><Lock className="w-3 h-3" /> Disabled (URL active)</span>}
                </label>
                <textarea
                  rows={4}
                  disabled={isJdFileFilled}
                  placeholder="Paste raw Job Description text here..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 ${
                    isJdFileFilled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              {/* Option B: JD File URL */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Option B: Job Description File URL</span>
                  {isJdTextFilled && <span className="text-[10px] text-amber-500 flex items-center gap-1"><Lock className="w-3 h-3" /> Disabled (Text active)</span>}
                </label>
                <input
                  type="text"
                  disabled={isJdTextFilled}
                  placeholder="https://example.com/jd-file.pdf"
                  value={jdFileUrl}
                  onChange={(e) => setJdFileUrl(e.target.value)}
                  className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 ${
                    isJdTextFilled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* HTTP 502 / Error Banner with Retry */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-4 text-amber-900 dark:text-amber-200 text-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={handleRunScan}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
          >
            Retry Scan
          </button>
        </div>
      )}

      {/* Main Analysis Report Section */}
      {isLoading ? (
        <div className="space-y-4 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse">
          <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      ) : currentScan ? (
        <AtsScoreReport scan={currentScan} />
      ) : (
        /* Friendly Empty State */
        <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No ATS Scans Run Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Select a resume and click <strong>Run Scan</strong> above to generate your first experience-aware ATS report.
          </p>
        </div>
      )}
    </div>
  );
}
