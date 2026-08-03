"use client";

import React, { useState } from "react";
import { useAtsAnalysisStore } from "@/store/useAtsAnalysisStore";
import { AtsGeneralScanResponseDto, AtsJdScanResponseDto } from "@/lib/ats/atsApi";
import { toast } from "sonner";
import {
  Award,
  ChevronDown,
  ChevronUp,
  Edit3,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Briefcase,
  Target,
  Layers,
  FileText,
} from "lucide-react";

interface AtsScoreReportProps {
  scan: AtsGeneralScanResponseDto | AtsJdScanResponseDto;
}

const SENIORITY_TIERS = ["FRESHER", "JUNIOR", "MID", "SENIOR", "LEAD"];

export const AtsScoreReport: React.FC<AtsScoreReportProps> = ({ scan }) => {
  const { overrideLevel, isLoading } = useAtsAnalysisStore();
  const [isEditingTier, setIsEditingTier] = useState(false);
  const [isReasoningOpen, setIsReasoningOpen] = useState(false);

  const isJdScan = scan.scanType === "JD_BASED";
  const jdScan = isJdScan ? (scan as AtsJdScanResponseDto) : null;

  const handleLevelOverride = async (newLevel: string) => {
    if (newLevel === scan.effectiveExperienceLevel) {
      setIsEditingTier(false);
      return;
    }
    try {
      await overrideLevel(scan.analysisId, newLevel);
      toast.success(`Experience level updated to ${newLevel}`);
      setIsEditingTier(false);
    } catch {
      toast.error("Failed to update experience level");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800";
    if (score >= 60) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800";
    return "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                {scan.scanType === "JD_BASED" ? "Targeted JD Scan" : "General ATS Scan"}
              </span>

              {/* Scored Role & Level Badge */}
              <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-full text-xs font-medium border border-slate-700">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                <span>Scored as: <strong>{scan.inferredRole || "Software Engineer"}</strong> — </span>

                {!isEditingTier ? (
                  <button
                    onClick={() => setIsEditingTier(true)}
                    className="flex items-center gap-1 text-indigo-300 hover:text-indigo-200 underline font-semibold transition-colors"
                    title="Click to override experience tier"
                  >
                    <span>{scan.effectiveExperienceLevel} tier</span>
                    <Edit3 className="w-3 h-3 ml-0.5" />
                  </button>
                ) : (
                  <select
                    disabled={isLoading}
                    value={scan.effectiveExperienceLevel}
                    onChange={(e) => handleLevelOverride(e.target.value)}
                    onBlur={() => setIsEditingTier(false)}
                    autoFocus
                    className="bg-slate-900 text-white text-xs rounded px-2 py-0.5 border border-indigo-500 focus:outline-none"
                  >
                    {SENIORITY_TIERS.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              ATS Analysis Report
            </h2>

            {/* Candidate Override Notice */}
            {scan.candidateOverrideLevel && scan.candidateOverrideLevel !== scan.inferredExperienceLevel && (
              <p className="mt-2 text-xs text-amber-300/90 bg-amber-950/40 border border-amber-700/50 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  AI inferred: <strong>{scan.inferredExperienceLevel}</strong> · You corrected to: <strong>{scan.candidateOverrideLevel}</strong>
                </span>
              </p>
            )}
          </div>

          {/* Primary ATS Score Badge */}
          <div className="flex items-center gap-4 bg-slate-800/60 backdrop-blur-md p-4 rounded-xl border border-slate-700/60 shrink-0">
            <div className="text-center">
              <span className="block text-3xl font-extrabold text-indigo-400">{scan.atsScore}%</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Overall ATS Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion: Why this score? */}
      {scan.inferenceReasoning && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
          <button
            onClick={() => setIsReasoningOpen(!isReasoningOpen)}
            className="w-full px-5 py-3.5 text-left flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm"
          >
            <span className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
              Why this score? (AI Reasoning)
            </span>
            {isReasoningOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {isReasoningOpen && (
            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-950/30">
              {scan.inferenceReasoning}
            </div>
          )}
        </div>
      )}

      {/* Mode-Specific Metrics Display */}
      {isJdScan && jdScan ? (
        /* JD Scan Metrics: Core Fit vs Full Match */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Core Fit Score
                </span>
                <p className="text-xs text-slate-500">Tier-matched expectations fit</p>
              </div>
              <div className={`px-4 py-2 rounded-xl text-2xl font-extrabold border ${getScoreColor(jdScan.coreFitScore || 0)}`}>
                {jdScan.coreFitScore || 0}%
              </div>
            </div>

            <div className="p-5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Full JD Match Score
                </span>
                <p className="text-xs text-slate-500">Raw match against all requirements</p>
              </div>
              <div className={`px-4 py-2 rounded-xl text-2xl font-extrabold border ${getScoreColor(jdScan.fullJdMatchScore || 0)}`}>
                {jdScan.fullJdMatchScore || 0}%
              </div>
            </div>
          </div>

          {/* Level Gap Detection Banner (Informative Neutral/Amber Tone) */}
          {jdScan.levelGapDetected && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-sm flex items-start gap-3">
              <Target className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Experience Level Alignment Callout</strong>
                <span>
                  The job description targets a <strong>{jdScan.jdInferredLevel || "Senior"}</strong> level candidate, while your profile is currently set to <strong>{scan.effectiveExperienceLevel}</strong>. Focus on the roadmap items below to bridge the experience expectations.
                </span>
              </div>
            </div>
          )}

          {/* Growth Areas Roadmap */}
          {scan.growthAreas && scan.growthAreas.length > 0 && (
            <div className="p-5 rounded-xl border border-indigo-100 dark:border-indigo-950 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Targeted Skill Growth Roadmap
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {scan.growthAreas.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* General Scan Breakdown */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths List */}
            <div className="p-5 rounded-xl border border-emerald-100 dark:border-emerald-950 bg-emerald-50/30 dark:bg-emerald-950/10 shadow-sm">
              <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Key Profile Strengths
              </h3>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                {scan.strengths && scan.strengths.length > 0 ? (
                  scan.strengths.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 text-xs italic">No specific strengths highlighted</li>
                )}
              </ul>
            </div>

            {/* Missing but expected at this level (Constructive Amber/Neutral Tones) */}
            {scan.missingKeywords && scan.missingKeywords.length > 0 && (
              <div className="p-5 rounded-xl border border-amber-100 dark:border-amber-950 bg-amber-50/30 dark:bg-amber-950/10 shadow-sm">
                <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Expected at {scan.effectiveExperienceLevel} Tier
                </h3>
                <div className="flex flex-wrap gap-2">
                  {scan.missingKeywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 text-xs font-medium rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stretch Skills for Next Level */}
          {scan.growthAreas && scan.growthAreas.length > 0 && (
            <div className="p-5 rounded-xl border border-indigo-100 dark:border-indigo-900 bg-gradient-to-r from-indigo-50/50 via-slate-50 to-white dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 shadow-sm">
              <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Stretch Skills for Next Level Advancement
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {scan.growthAreas.map((skill, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Snapshot metadata */}
      {isJdScan && jdScan?.jdTextSnapshot && (
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" /> Target Job Description Snapshot
          </span>
          <p className="line-clamp-3 font-mono text-[11px] leading-relaxed opacity-80">{jdScan.jdTextSnapshot}</p>
        </div>
      )}
    </div>
  );
};
