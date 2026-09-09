"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAtsAnalysisStore } from "@/store/useAtsAnalysisStore";
import { AtsScoreReport } from "@/components/ats/AtsScoreReport";
import { FeatureUsageBar } from "@/components/dashboard/feature-usage-bar";
import api from "@/lib/api";
import { atsApi } from "@/lib/ats/atsApi";
import { toast } from "sonner";
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
  FileUp,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface ResumeItem {
  id: number;
  fileName: string;
  filePath: string;
  createdAt: string;
}

export default function ResumeATSPage() {
  const router = useRouter();
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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // JD mode state
  const [jdText, setJdText] = useState("");
  const [jdFileUrl, setJdFileUrl] = useState("");
  const [targetRole, setTargetRole] = useState("");

  // Load user resumes on mount
  const loadResumes = async (preferredResumeId?: number) => {
    setResumesLoading(true);
    try {
      const res = await api.get("/resume/all");
      if (Array.isArray(res.data) && res.data.length > 0) {
        setResumes(res.data);
        const targetId = preferredResumeId || res.data[0].id;
        setSelectedResumeId(targetId);
        fetchHistory(targetId);
      } else {
        setResumes([]);
        setSelectedResumeId(null);
      }
    } catch {
      console.warn("No user resumes found or error fetching resumes");
      setResumes([]);
      setSelectedResumeId(null);
    } finally {
      setResumesLoading(false);
    }
  };

  useEffect(() => {
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

  // Upload resume handler (PDF, DOCX)
  const handleUploadResumeFile = async (file: File) => {
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith(".pdf") && !lowerName.endsWith(".docx")) {
      toast.error("Please upload a valid PDF or DOCX resume document.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit. Please upload a smaller resume file.");
      return;
    }

    setIsUploadingResume(true);
    clearError();

    const formData = new FormData();
    formData.append("file", file);

    try {
      toast.loading("Uploading and extracting resume text...", { id: "resume-upload" });
      const response = await api.post("/resume/upload", formData);

      // Save for full analysis dashboard fallback
      if (response.data) {
        try {
          sessionStorage.setItem("ats-analysis", JSON.stringify(response.data));
          localStorage.setItem("latest_ats_analysis", JSON.stringify(response.data));
        } catch {
          // ignore storage quota errors
        }
      }

      toast.success("Resume uploaded successfully! Generating ATS analysis...", { id: "resume-upload" });

      // Re-fetch all resumes and automatically select the newly uploaded resume
      const allResumesRes = await api.get("/resume/all");
      if (Array.isArray(allResumesRes.data) && allResumesRes.data.length > 0) {
        setResumes(allResumesRes.data);
        const newResumeId = allResumesRes.data[0].id;
        setSelectedResumeId(newResumeId);
        // Automatically trigger general scan on the uploaded resume
        runGeneralScan(newResumeId);
      }
    } catch (err: any) {
      console.error("Failed to upload resume:", err);
      const msg = err.response?.data?.message || err.message || "Failed to upload and parse resume.";
      toast.error(msg, { id: "resume-upload" });
    } finally {
      setIsUploadingResume(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadResumeFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUploadResumeFile(file);
    }
  };

  // Mutually exclusive inputs: disable one if the other is filled
  const isJdTextFilled = jdText.trim().length > 0;
  const isJdFileFilled = jdFileUrl.trim().length > 0;

  const canRunScan =
    selectedResumeId !== null &&
    !isLoading &&
    !isUploadingResume &&
    (scanMode === "general" || isJdTextFilled || isJdFileFilled);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 min-h-screen">
      {/* Hidden file input for resume uploading */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".pdf,.docx"
        className="hidden"
      />

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

        <div className="flex items-center gap-3">
          {/* Quick Upload Button in Header */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingResume}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-all shadow-sm"
          >
            {isUploadingResume ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            {isUploadingResume ? "Uploading..." : "Upload New Resume"}
          </button>

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
                  <option key={item.analysisId} value={item.analysisId}>
                    Score {item.atsScore}/100 - {new Date(item.createdAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Feature Usage Bar */}
      <FeatureUsageBar featureKey="ATS_ANALYSIS" featureTitle="ATS Analysis" />

      {/* Control Panel: Resume Selection & Mode Toggles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Resume & Mode Config */}
        <div className="lg:col-span-1 space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Active Resume Selection & Direct File Upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500" /> Active Resume
              </label>
              {resumes.length > 0 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <FileUp className="w-3 h-3" /> Upload New
                </button>
              )}
            </div>

            {uploadError && (
              <div className="mb-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Resume upload failed</p>
                  <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5">{uploadError}</p>
                </div>
              </div>
            )}

            {resumesLoading ? (
              <div className="h-14 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-xs text-slate-400">
                Uploading & parsing resume...
              </div>
            ) : resumes.length > 0 ? (
              <div className="space-y-2">
                <select
                  value={selectedResumeId || ""}
                  onChange={(e) => handleResumeChange(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      📄 {r.fileName} ({new Date(r.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active resume ready for ATS scan
                </p>
              </div>
            ) : (
              /* Inline Upload Box when no resumes exist */
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`p-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30"
                    : "border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50 dark:bg-slate-800/50"
                }`}
              >
                <Upload className="w-6 h-6 text-indigo-500 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isUploadingResume ? "Uploading Resume..." : "Upload Your Resume"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">PDF or DOCX (Max 10MB)</p>
              </div>
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
            ) : isUploadingResume ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Uploading Resume...
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
                  {isJdFileFilled && (
                    <span className="text-[10px] text-amber-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Disabled (URL active)
                    </span>
                  )}
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
                  {isJdTextFilled && (
                    <span className="text-[10px] text-amber-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Disabled (Text active)
                    </span>
                  )}
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
      {isLoading || isUploadingResume ? (
        <div className="space-y-4 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {isUploadingResume ? "Uploading & extracting resume text..." : "Analyzing resume with ATS Copilot..."}
            </span>
          </div>
          <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      ) : currentScan ? (
        <div className="space-y-6">
          <AtsScoreReport scan={currentScan} />

          {/* Direct link to deep ATS analytics page */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (currentScan.analysisId) {
                  router.push(`/dashboard/ats/analysis/${currentScan.analysisId}`);
                } else {
                  router.push("/dashboard/ats/analysis");
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-md hover:translate-x-0.5"
            >
              View In-Depth ATS Analytics Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Interactive Drag-and-Drop Upload Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-10 md:p-14 text-center border-2 border-dashed rounded-3xl cursor-pointer transition-all ${
            isDragging
              ? "border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 scale-[1.01]"
              : "border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-900/50"
          } space-y-4`}
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-200">
              Upload Your Resume for Instant ATS Scanning
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
              Drag and drop your <strong>PDF</strong> or <strong>DOCX</strong> resume here, or click to browse. We will test it against 40+ recruitment filters and role benchmarks.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all inline-flex items-center gap-2"
            >
              <FileUp className="w-4 h-4" /> Browse Resume File
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Experience-Tier Aware
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Instant Keyword Match
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> JD Fit & Role Benchmarks
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
