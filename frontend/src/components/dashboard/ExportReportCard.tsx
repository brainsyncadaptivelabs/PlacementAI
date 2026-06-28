"use client";

import React from "react";

export type ReportCardData = {
  fullName: string;
  email: string;
  role: string;
  plan: string;
  memberSince: string;
  userId: string;
  profileImage: string | null;
  highestAtsScore: number | null;
  averageAtsScore: number | null;
  resumeCount: number;
  mockInterviewsCount: number;
  averageMockScore: number | null;
  highestMockScore: number | null;
  codingProblemsSolved: number;
  readinessScore: number;
  profileCompletionPercentage: number;
};

interface ExportReportCardProps {
  data: ReportCardData | null;
  imageError: boolean;
  setImageError: (err: boolean) => void;
  getExportDateStr: () => string;
  getMemberSinceStr: (dateStr: string | null | undefined) => string;
  animate?: boolean;
}

export function ExportReportCard({
  data,
  imageError,
  setImageError,
  getExportDateStr,
  getMemberSinceStr,
  animate = true
}: ExportReportCardProps) {
  
  const getScoreStatus = (score: number | null | undefined) => {
    if (score === null || score === undefined) return { label: "--", color: "#94A3B8" };
    if (score >= 80) return { label: "Good", color: "#34D399" };
    if (score >= 60) return { label: "Average", color: "#F59E0B" };
    return { label: "Needs Improvement", color: "#F87171" };
  };

  const renderProgressRing = (score: number | null | undefined, label: string, color: string) => {
    const displayScore = score !== null && score !== undefined ? Math.round(score) : 0;
    const isAvailable = score !== null && score !== undefined;
    const currentScore = animate ? displayScore : 0;
    const strokeDashoffset = 251.2 * (1 - (currentScore / 100));
    const status = getScoreStatus(score);

    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <div style={{ position: "relative", width: "112px", height: "112px" }}>
          <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
            {isAvailable && (
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                stroke={color} 
                strokeWidth="6" 
                fill="transparent" 
                strokeDasharray="251.2" 
                strokeDashoffset={strokeDashoffset} 
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s ease-out" }}
              />
            )}
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "24px", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.025em" }}>
              {isAvailable ? `${displayScore}` : "--"}
            </span>
            <span style={{ fontSize: "10px", color: "rgba(148, 163, 184, 0.75)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em" }}>/100</span>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "12px", fontWeight: "bold", color: "rgba(255, 255, 255, 0.8)" }}>{label}</div>
          <div style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", color: status.color, marginTop: "2px" }}>
            {status.label}
          </div>
        </div>
      </div>
    );
  };

  const renderMetricCard = (svgIcon: React.ReactNode, title: string, value: string | number | null | undefined, label: string = "Score", showStatus: boolean = true) => {
    const isAvailable = value !== null && value !== undefined;
    
    let status = { label: "", color: "" };
    if (showStatus && isAvailable) {
      const numVal = typeof value === "number" ? value : parseInt(String(value));
      if (!isNaN(numVal)) {
        status = getScoreStatus(numVal);
      }
    }

    return (
      <div style={{
        backgroundColor: "rgba(15, 23, 42, 0.5)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "16px",
        padding: "16px",
        display: "flex",
        alignItems: "flex-start",
        gap: "16px",
        boxSizing: "border-box"
      }}>
        <div style={{
          padding: "10px",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRadius: "12px",
          color: "#A5B4FC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {svgIcon}
        </div>
        <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          <div style={{ fontSize: "10px", fontWeight: "bold", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {title}
          </div>
          <div style={{ fontSize: "20px", fontWeight: 900, color: "#FFFFFF", marginTop: "4px" }}>
            {isAvailable ? value : "--"}
          </div>
          {showStatus && isAvailable && (
            <div style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", color: status.color, marginTop: "4px" }}>
              {status.label}
            </div>
          )}
          {!showStatus && (
            <div style={{ fontSize: "10px", color: "#64748B", fontWeight: "semibold", marginTop: "4px" }}>
              {label}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Background glow layers */}
      <div style={{ position: "absolute", top: "-200px", left: "-200px", width: "600px", height: "600px", borderRadius: "50%", backgroundColor: "rgba(147, 51, 234, 0.08)", filter: "blur(150px)", zIndex: -10 }} />
      <div style={{ position: "absolute", bottom: "-200px", right: "-200px", width: "600px", height: "600px", borderRadius: "50%", backgroundColor: "rgba(79, 70, 229, 0.08)", filter: "blur(150px)", zIndex: -10 }} />

      {/* Header Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}>
          <div style={{ width: "48px", height: "48px", backgroundColor: "#2563EB", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontWeight: 900, fontSize: "24px", boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.2)" }}>P</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: "18px", color: "#FFFFFF", letterSpacing: "-0.025em", lineHeight: 1 }}>PlacementAI</div>
            <div style={{ fontSize: "10px", color: "#94A3B8", fontWeight: "bold", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "4px" }}>AI Placement Copilot</div>
          </div>
        </div>
        
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "30px", fontWeight: 900, color: "#FFFFFF", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>MY PLACEMENT DATA</h1>
          <p style={{ fontSize: "14px", color: "#A5B4FC", fontWeight: 600, letterSpacing: "0.025em", marginTop: "4px", margin: 0 }}>"Your journey. Your data. Your success."</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", padding: "8px 16px", borderRadius: "12px", textAlign: "right" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A5B4FC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <div>
            <div style={{ fontSize: "9px", color: "#94A3B8", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.05em" }}>Downloaded as JPG</div>
            <div style={{ fontSize: "12px", color: "#FFFFFF", fontWeight: "bold", marginTop: "2px" }}>{getExportDateStr()}</div>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "32px", marginTop: "32px", marginBottom: "32px", flex: 1, width: "100%", boxSizing: "border-box" }}>
        
        {/* Left Profile Panel */}
        <div style={{ backgroundColor: "#0D1527", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", height: "630px", boxSizing: "border-box" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: "96px", height: "96px", backgroundColor: "rgba(168, 85, 247, 0.05)", borderRadius: "50%", filter: "blur(32px)" }} />
          
          {/* Profile Image with error handling and fallback layout */}
          <div style={{ position: "relative", marginBottom: "24px" }}>
            <div style={{ position: "absolute", inset: "-4px", borderRadius: "50%", border: "2px solid rgba(168, 85, 247, 0.4)" }} />
            {!imageError && data?.profileImage ? (
              <img 
                src={data.profileImage} 
                alt="Profile" 
                crossOrigin="anonymous"
                onError={() => setImageError(true)}
                style={{ width: "128px", height: "128px", borderRadius: "50%", border: "4px solid #0D1527", objectFit: "cover", position: "relative", zIndex: 10 }}
              />
            ) : (
              <div style={{ width: "128px", height: "128px", borderRadius: "50%", border: "4px solid #0D1527", background: "linear-gradient(to bottom right, #8B5CF6, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", fontWeight: 900, color: "#FFFFFF", position: "relative", zIndex: 10, textTransform: "uppercase" }}>
                {data?.fullName?.substring(0, 2) || "PA"}
              </div>
            )}
          </div>

          <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#FFFFFF", textAlign: "center", letterSpacing: "-0.025em", marginBottom: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%", boxSizing: "border-box" }}>
            {data?.fullName}
          </h2>
          
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", backgroundColor: "rgba(168, 85, 247, 0.2)", border: "1px solid rgba(168, 85, 247, 0.3)", borderRadius: "9999px", fontSize: "10px", fontWeight: "bold", color: "#D8B4FE", marginBottom: "24px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {data?.role === "RECRUITER" ? "🏢 Recruiter" : "🎓 Student"}
          </div>

          {/* Details Row Stack */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: "9px", color: "#94A3B8", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.05em" }}>Email</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255, 255, 255, 0.9)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{data?.email}</div>
              </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <div>
                <div style={{ fontSize: "9px", color: "#94A3B8", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.05em" }}>User ID</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255, 255, 255, 0.9)" }}>{data?.userId}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <div>
                <div style={{ fontSize: "9px", color: "#94A3B8", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.05em" }}>Member Since</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255, 255, 255, 0.9)" }}>{getMemberSinceStr(data?.memberSince)}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <div>
                <div style={{ fontSize: "9px", color: "#94A3B8", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.05em" }}>Data Export Date</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255, 255, 255, 0.9)" }}>{getExportDateStr()}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <div>
                <div style={{ fontSize: "9px", color: "#94A3B8", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.05em" }}>Account Type</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255, 255, 255, 0.9)", textTransform: "capitalize" }}>{data?.role?.toLowerCase()}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "9px", color: "#94A3B8", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.05em" }}>Plan</div>
                <div style={{ fontSize: "14px", fontWeight: "bold", color: "rgba(255, 255, 255, 0.9)", display: "flex", alignItems: "center", gap: "6px", textTransform: "capitalize" }}>
                  {data?.plan?.toLowerCase()} Plan
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", display: "inline-block", backgroundColor: data?.plan === "PREMIUM" ? "#C084FC" : data?.plan === "BASIC" ? "#60A5FA" : "#34D399" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section Scorecards Panel */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "630px", boxSizing: "border-box" }}>
          
          {/* Top Score Rings Overview Container */}
          <div style={{ backgroundColor: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "24px", padding: "24px", boxSizing: "border-box" }}>
            <div style={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.1em", color: "#94A3B8", marginBottom: "16px", textTransform: "uppercase", textAlign: "left" }}>MY SCORES OVERVIEW</div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
              {renderProgressRing(data?.highestAtsScore, "ATS Score", "#34D399")}
              {renderProgressRing(data?.averageMockScore, "Interview Avg", "#60A5FA")}
              {renderProgressRing(data?.codingProblemsSolved ? (data.codingProblemsSolved * 6 > 100 ? 100 : data.codingProblemsSolved * 6) : null, "Skill Score", "#A78BFA")}
              {renderProgressRing(data?.highestMockScore, "Mock Score", "#F59E0B")}
              {renderProgressRing(data?.readinessScore, "Overall Score", "#22D3EE")}
            </div>
          </div>

          {/* Grid Metric Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", flex: 1, marginTop: "24px", boxSizing: "border-box" }}>
            {renderMetricCard(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>, "ATS Score", data?.highestAtsScore ? `${data.highestAtsScore}/100` : null)}
            {renderMetricCard(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7a2 2 0 0 0-2.45-1.45L16 7V5a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2l4.55 1.45A2 2 0 0 0 23 17V7z"/></svg>, "Interview Average", data?.averageMockScore ? `${Math.round(data.averageMockScore)}/100` : null)}
            {renderMetricCard(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, "Skill Score", data?.codingProblemsSolved ? `${data.codingProblemsSolved * 6 > 100 ? 100 : data.codingProblemsSolved * 6}/100` : null)}
            {renderMetricCard(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, "Mock Interview Score", data?.highestMockScore ? `${data.highestMockScore}/100` : null)}
            {renderMetricCard(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>, "JD Match Score", null)}
            {renderMetricCard(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, "Profile Completeness", data?.profileCompletionPercentage ? `${data.profileCompletionPercentage}%` : null)}
            {renderMetricCard(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="12" y2="12"/></svg>, "Strengths Identified", data?.codingProblemsSolved, "Problems Solved", false)}
            {renderMetricCard(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>, "Improvement Areas", 8, "Focus Areas", false)}
          </div>
        </div>
      </div>

      {/* Footer Row */}
      <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "24px", marginTop: "auto", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", textAlign: "left" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <div style={{ marginLeft: "12px" }}>
            <div style={{ fontSize: "14px", fontWeight: "bold", color: "#FFFFFF", lineHeight: 1 }}>Your data is secure and private.</div>
            <div style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 500, marginTop: "4px", lineHeight: 1 }}>This data is exported from PlacementAI and belongs to you.</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "14px", fontWeight: "bold", color: "#A5B4FC", fontStyle: "italic", lineHeight: 1 }}>Keep Learning,</div>
          <div style={{ fontSize: "12px", color: "#94A3B8", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "4px", lineHeight: 1 }}>Keep Growing! 🚀</div>
        </div>
      </div>
    </>
  );
}
