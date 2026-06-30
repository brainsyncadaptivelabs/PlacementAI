"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Competency } from "../types/interview.types";

interface CategoryScore {
  name: string;
  score: number;
  comment: string;
}

interface DownloadFeedbackPDFProps {
  feedback: {
    totalScore: number;
    technicalScore?: number;
    communicationScore?: number;
    confidenceScore?: number;
    problemSolvingScore?: number;
    codingScore?: number;
    behavioralScore?: number;
    roleReadiness?: number;
    companyReadiness?: number;
    hiringProbability?: number;
    expectedSalary?: string;
    recruiterVerdict?: string;
    finalRecommendation?: string;
    categoryScores: CategoryScore[];
    strengths: string[];
    areasForImprovement: string[];
    finalAssessment: string;
    bodyLanguageTips?: string[];
    missedTopics?: string[];
    recommendedResources?: string[];
    improvementPlan?: string[];
    competencies?: Competency[];
    createdAt?: string;
  };
  interview: {
    role: string;
    type: string;
    level?: string;
  };
}

export const DownloadFeedbackPDF = ({
  feedback,
  interview,
}: DownloadFeedbackPDFProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const checkPageBreak = (requiredSpace: number) => {
        if (y + requiredSpace > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      // ── Header ──
      doc.setFillColor(30, 30, 45);
      doc.rect(0, 0, pageWidth, 45, "F");

      doc.setTextColor(202, 156, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("PlacementAI", margin, 20);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("Professional Recruiter Assessment Report", margin, 30);

      doc.setFontSize(9);
      doc.setTextColor(180, 180, 200);
      const dateStr = feedback.createdAt
        ? new Date(feedback.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
      doc.text(dateStr, pageWidth - margin, 30, { align: "right" });

      y = 55;

      // ── Recruiter Metadata & Overall Score ──
      doc.setFillColor(245, 245, 250);
      doc.roundedRect(margin, y, contentWidth, 38, 2, 2, "F");

      doc.setTextColor(80, 80, 100);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("TARGET ROLE", margin + 8, y + 8);
      doc.text("EXPERIENCE LEVEL", margin + 65, y + 8);
      doc.text("RECRUITER VERDICT", margin + 115, y + 8);
      doc.text("OVERALL SCORE", pageWidth - margin - 45, y + 8);

      doc.setTextColor(20, 20, 40);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(interview.role, margin + 8, y + 16);
      doc.text(interview.level || "Entry Level", margin + 65, y + 16);
      doc.text(feedback.recruiterVerdict || "Recommended", margin + 115, y + 16);

      const score = feedback.totalScore || 0;
      if (score >= 75) doc.setTextColor(30, 150, 50);
      else if (score >= 60) doc.setTextColor(200, 150, 0);
      else doc.setTextColor(220, 50, 50);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(`${score}/100`, pageWidth - margin - 45, y + 18);

      // Sub-meta
      doc.setTextColor(100, 100, 120);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`Hiring Probability: ${feedback.hiringProbability || score - 5}%`, margin + 8, y + 28);
      doc.text(`Salary Benchmark: ${feedback.expectedSalary || "N/A"}`, margin + 65, y + 28);
      doc.text(`Interview Type: ${interview.type}`, margin + 115, y + 28);

      y += 48;

      // ── Dimension Scores Grid ──
      checkPageBreak(35);
      doc.setTextColor(30, 30, 50);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Core Dimensions Performance", margin, y);
      y += 8;

      doc.setFillColor(250, 250, 252);
      doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "F");

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("Tech Score", margin + 5, y + 8);
      doc.text("Comm Score", margin + 28, y + 8);
      doc.text("Confidence", margin + 53, y + 8);
      doc.text("Problem Solving", margin + 78, y + 8);
      doc.text("Coding", margin + 106, y + 8);
      doc.text("Behavioral", margin + 128, y + 8);
      doc.text("Role Ready", margin + 148, y + 8);
      doc.text("Company Ready", margin + 168, y + 8);

      doc.setTextColor(20, 20, 40);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${feedback.technicalScore || score}%`, margin + 5, y + 16);
      doc.text(`${feedback.communicationScore || score}%`, margin + 28, y + 16);
      doc.text(`${feedback.confidenceScore || score}%`, margin + 53, y + 16);
      doc.text(`${feedback.problemSolvingScore || score}%`, margin + 78, y + 16);
      doc.text(`${feedback.codingScore || score}%`, margin + 106, y + 16);
      doc.text(`${feedback.behavioralScore || score}%`, margin + 128, y + 16);
      doc.text(`${feedback.roleReadiness || score}%`, margin + 148, y + 16);
      doc.text(`${feedback.companyReadiness || score}%`, margin + 168, y + 16);

      y += 34;

      // ── Final Assessment Summary ──
      checkPageBreak(30);
      doc.setTextColor(30, 30, 50);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Recruiter Assessment Summary", margin, y);
      y += 8;

      doc.setTextColor(40, 40, 40);
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      const assessmentLines = doc.splitTextToSize(feedback.finalAssessment || "", contentWidth);
      checkPageBreak(assessmentLines.length * 5 + 5);
      doc.text(assessmentLines, margin, y);
      y += assessmentLines.length * 5 + 10;

      // ── Competency Coverage Section ──
      if (feedback.competencies && feedback.competencies.length > 0) {
        checkPageBreak(40);
        doc.setTextColor(30, 30, 50);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Evaluated Competency Coverage", margin, y);
        y += 8;

        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(230, 230, 235);
        doc.setLineWidth(0.3);

        feedback.competencies.forEach((comp) => {
          checkPageBreak(12);
          doc.rect(margin, y, contentWidth, 8);
          doc.setFontSize(8.5);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(80, 80, 100);
          doc.text(`[${comp.category}]`, margin + 4, y + 5.5);

          doc.setFont("helvetica", "normal");
          doc.setTextColor(20, 20, 20);
          doc.text(comp.competency, margin + 45, y + 5.5);

          if (comp.status) {
            doc.setTextColor(30, 150, 50);
            doc.text("✓ Covered / Passed", margin + 120, y + 5.5);
          } else {
            doc.setTextColor(220, 50, 50);
            doc.text("✗ Unassessed / Failed", margin + 120, y + 5.5);
          }
          y += 8;
        });
        y += 6;
      }

      // ── Category Breakdown Detail ──
      if (feedback.categoryScores && feedback.categoryScores.length > 0) {
        checkPageBreak(25);
        doc.setTextColor(30, 30, 50);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Topic Breakdown & Comments", margin, y);
        y += 8;

        feedback.categoryScores.forEach((category) => {
          const commentLines = doc.splitTextToSize(category.comment || "", contentWidth - 16);
          const blockHeight = 16 + commentLines.length * 5;
          checkPageBreak(blockHeight + 5);

          const isWeak = category.score < 70;
          const isStrong = category.score >= 80;
          if (isWeak) doc.setFillColor(254, 242, 242);
          else if (isStrong) doc.setFillColor(240, 253, 250);
          else doc.setFillColor(254, 253, 242);

          doc.roundedRect(margin, y, contentWidth, blockHeight, 1.5, 1.5, "F");

          doc.setTextColor(10, 10, 30);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text(category.name, margin + 6, y + 8);

          if (isWeak) doc.setTextColor(220, 50, 50);
          else if (isStrong) doc.setTextColor(30, 150, 50);
          else doc.setTextColor(200, 150, 0);
          doc.setFontSize(10);
          doc.text(`${category.score}/100`, pageWidth - margin - 6, y + 8, { align: "right" });

          doc.setTextColor(70, 70, 80);
          doc.setFontSize(8.5);
          doc.setFont("helvetica", "normal");
          doc.text(commentLines, margin + 6, y + 14);

          y += blockHeight + 4;
        });
      }

      y += 6;

      // ── Strengths & Areas For Improvement ──
      checkPageBreak(25);
      doc.setFillColor(240, 253, 250);
      doc.roundedRect(margin, y, contentWidth / 2 - 2, 40, 1.5, 1.5, "F");
      doc.setTextColor(30, 150, 50);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("✓ Key Strengths", margin + 5, y + 8);
      doc.setTextColor(40, 60, 40);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      let sy = y + 15;
      feedback.strengths?.slice(0, 3).forEach((s) => {
        const sLines = doc.splitTextToSize(`• ${s}`, contentWidth / 2 - 12);
        doc.text(sLines, margin + 5, sy);
        sy += sLines.length * 4;
      });

      doc.setFillColor(254, 242, 242);
      doc.roundedRect(pageWidth / 2 + 1, y, contentWidth / 2 - 2, 40, 1.5, 1.5, "F");
      doc.setTextColor(220, 50, 50);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("⚠ Areas for Improvement", pageWidth / 2 + 6, y + 8);
      doc.setTextColor(80, 40, 40);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      let wy = y + 15;
      feedback.areasForImprovement?.slice(0, 3).forEach((w) => {
        const wLines = doc.splitTextToSize(`• ${w}`, contentWidth / 2 - 12);
        doc.text(wLines, pageWidth / 2 + 6, wy);
        wy += wLines.length * 4;
      });

      y += 46;

      // ── Missed Topics & Plan ──
      if (feedback.missedTopics && feedback.missedTopics.length > 0) {
        checkPageBreak(30);
        doc.setTextColor(30, 30, 50);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Missed Core Topics / Concepts", margin, y);
        y += 6;
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        feedback.missedTopics.forEach((topic) => {
          checkPageBreak(6);
          doc.text(`• ${topic}`, margin + 4, y);
          y += 5;
        });
        y += 4;
      }

      if (feedback.improvementPlan && feedback.improvementPlan.length > 0) {
        checkPageBreak(30);
        doc.setTextColor(30, 30, 50);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Actionable Improvement Plan", margin, y);
        y += 6;
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        feedback.improvementPlan.forEach((step) => {
          checkPageBreak(6);
          doc.text(`• ${step}`, margin + 4, y);
          y += 5;
        });
        y += 4;
      }

      // ── Footer ──
      checkPageBreak(15);
      doc.setDrawColor(210, 210, 215);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;
      doc.setTextColor(140, 140, 150);
      doc.setFontSize(7.5);
      doc.text(
        "PlacementAI Recruitment Assessment Systems (Stateful Evaluator Engine v2.0)",
        pageWidth / 2,
        y,
        { align: "center" }
      );

      // Save PDF
      const sanitizedRole = interview.role.replace(/[^a-zA-Z0-9]/g, "_");
      doc.save(`PlacementAI_RecruiterAssessment_${sanitizedRole}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="flex-1 font-bold border-primary text-primary hover:bg-primary/10"
      onClick={handleDownload}
      disabled={isGenerating}
    >
      {isGenerating ? "Generating Assessment PDF..." : "📄 Export Recruiter Report (PDF)"}
    </Button>
  );
};
