"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface CategoryScore {
  name: string;
  score: number;
  comment: string;
}

interface DownloadFeedbackPDFProps {
  feedback: {
    totalScore: number;
    categoryScores: CategoryScore[];
    strengths: string[];
    areasForImprovement: string[];
    finalAssessment: string;
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
      doc.text("Interview Feedback Report", margin, 30);

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

      // ── Interview Info ──
      doc.setFillColor(40, 40, 60);
      doc.roundedRect(margin, y, contentWidth, 32, 3, 3, "F");

      doc.setTextColor(180, 180, 200);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("ROLE", margin + 10, y + 10);
      doc.text("TYPE", margin + 70, y + 10);
      doc.text("OVERALL SCORE", pageWidth - margin - 50, y + 10);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(interview.role, margin + 10, y + 22);
      doc.text(interview.type, margin + 70, y + 22);

      // Score with color
      const score = feedback.totalScore || 0;
      if (score >= 70) doc.setTextColor(74, 222, 128); // green
      else if (score >= 50) doc.setTextColor(250, 204, 21); // yellow
      else doc.setTextColor(248, 113, 113); // red
      doc.setFontSize(20);
      doc.text(`${score}/100`, pageWidth - margin - 50, y + 24);

      y += 42;

      // ── Final Assessment ──
      doc.setTextColor(202, 156, 255);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Final Assessment", margin, y);
      y += 8;

      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const assessmentLines = doc.splitTextToSize(
        feedback.finalAssessment || "",
        contentWidth
      );
      checkPageBreak(assessmentLines.length * 5 + 10);
      doc.text(assessmentLines, margin, y);
      y += assessmentLines.length * 5 + 12;

      // ── Category Breakdown ──
      if (feedback.categoryScores && feedback.categoryScores.length > 0) {
        checkPageBreak(20);
        doc.setTextColor(202, 156, 255);
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text("Category Breakdown", margin, y);
        y += 10;

        feedback.categoryScores.forEach((category) => {
          const commentLines = doc.splitTextToSize(
            category.comment || "",
            contentWidth - 20
          );
          const blockHeight = 22 + commentLines.length * 5;
          checkPageBreak(blockHeight + 5);

          // Background
          const isWeak = category.score < 70;
          const isStrong = category.score >= 80;
          if (isWeak) doc.setFillColor(250, 240, 240); // very light red
          else if (isStrong) doc.setFillColor(240, 250, 240); // very light green
          else doc.setFillColor(250, 250, 240); // very light yellow
          doc.roundedRect(margin, y, contentWidth, blockHeight, 2, 2, "F");

          // Category name
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(category.name, margin + 8, y + 10);

          // Score badge
          if (isWeak) doc.setTextColor(220, 50, 50);
          else if (isStrong) doc.setTextColor(30, 150, 50);
          else doc.setTextColor(200, 150, 0);
          doc.setFontSize(11);
          doc.text(
            `${category.score}/100`,
            pageWidth - margin - 8,
            y + 10,
            { align: "right" }
          );

          // Comment
          doc.setTextColor(60, 60, 60);
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.text(commentLines, margin + 8, y + 18);

          y += blockHeight + 4;
        });
      }

      y += 6;

      // ── Strengths ──
      checkPageBreak(20);
      doc.setTextColor(30, 150, 50);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("✓  Strengths", margin, y);
      y += 8;

      doc.setTextColor(40, 80, 40);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      feedback.strengths?.forEach((strength) => {
        const lines = doc.splitTextToSize(`•  ${strength}`, contentWidth - 10);
        checkPageBreak(lines.length * 5 + 3);
        doc.text(lines, margin + 6, y);
        y += lines.length * 5 + 3;
      });

      y += 8;

      // ── Areas for Improvement ──
      checkPageBreak(20);
      doc.setTextColor(220, 50, 50);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("⚠  Areas for Improvement", margin, y);
      y += 8;

      doc.setTextColor(80, 40, 40);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      feedback.areasForImprovement?.forEach((area) => {
        const lines = doc.splitTextToSize(`•  ${area}`, contentWidth - 10);
        checkPageBreak(lines.length * 5 + 3);
        doc.text(lines, margin + 6, y);
        y += lines.length * 5 + 3;
      });

      y += 12;

      // ── Footer ──
      checkPageBreak(15);
      doc.setDrawColor(180, 180, 180);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.text(
        "Generated by PlacementAI Mock Interview Platform",
        pageWidth / 2,
        y,
        { align: "center" }
      );

      // Save
      const sanitizedRole = interview.role.replace(/[^a-zA-Z0-9]/g, "_");
      doc.save(`PlacementAI_Feedback_${sanitizedRole}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="flex-1"
      onClick={handleDownload}
      disabled={isGenerating}
    >
      {isGenerating ? "Generating PDF..." : "📄 Download PDF Report"}
    </Button>
  );
};
