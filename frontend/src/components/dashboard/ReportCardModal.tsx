"use client";

import React, { useState, useEffect, useRef } from "react";
import { Loader2, X, Download, Check } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "@/store/toast-store";
import api from "@/lib/api";
import { ExportReportCard, ReportCardData } from "./ExportReportCard";

interface ReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportCardModal({ isOpen, onClose }: ReportCardModalProps) {
  const [loading, setLoading] = useState(true);
  const [exportState, setExportState] = useState<"idle" | "generating" | "ready">("idle");
  const [data, setData] = useState<ReportCardData | null>(null);
  const [animate, setAnimate] = useState(false);
  const [active, setActive] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [scale, setScale] = useState(0.55);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const exportCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setActive(false);
      setAnimate(false);
      return;
    }
    
    const animTimer = setTimeout(() => setActive(true), 10);

    const fetchData = async () => {
      setLoading(true);
      setImageError(false);
      setExportState("idle");
      try {
        const res = await api.get("/user/report-card");
        setData(res.data);
        setTimeout(() => setAnimate(true), 400);
      } catch (err) {
        console.error("Failed to load report card data", err);
        toast.error("Failed to fetch report card statistics.");
        onClose();
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    return () => clearTimeout(animTimer);
  }, [isOpen, onClose]);

  // Compute scale for live preview
  useEffect(() => {
    if (!containerRef.current || loading || !data) return;
    
    const updateScale = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const containerWidth = rect.width;
      const containerHeight = rect.height || 500;
      
      const targetWidth = containerWidth * 0.95;
      const targetHeight = containerHeight * 0.95;
      
      const newScale = Math.min(targetWidth / 1600, targetHeight / 900);
      setScale(newScale);
    };

    updateScale();
    const frame = requestAnimationFrame(updateScale);
    window.addEventListener("resize", updateScale);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateScale);
    };
  }, [loading, data]);

  const handleDownloadJpg = async () => {
    const cardEl = exportCardRef.current;
    if (!cardEl) {
      console.error("[Export] Report ref missing");
      toast.error("Failed to generate JPG: exportCardRef is null.");
      return;
    }
    
    console.log("[Export] Report ref found: ", cardEl);
    setExportState("generating");
    
    try {
      console.log("[Export] Waiting for fonts to load...");
      await document.fonts.ready;
      console.log("[Export] Fonts loaded.");
      
      console.log("[Export] Waiting for animation frame...");
      await new Promise(resolve => requestAnimationFrame(resolve));
      console.log("[Export] Animation frame passed.");

      console.log("[Export] Rendering canvas with html2canvas...");
      const canvas = await html2canvas(cardEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0B1020",
        allowTaint: false,
        imageTimeout: 0,
        logging: true,
        removeContainer: true,
        foreignObjectRendering: false
      });
      console.log("[Export] Canvas generated.");

      console.log("[Export] Generating JPG Data URL...");
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      console.log("[Export] JPG generated.");

      console.log("[Export] Download started.");
      const link = document.createElement("a");
      const username = data?.fullName?.replace(/\s+/g, "_") || "user";
      link.download = `PlacementAI_${username}.jpg`;
      link.href = imgData;
      link.click();
      console.log("[Export] Download completed successfully.");
      
      setExportState("ready");
      toast.success("JPG report card exported successfully!");
      
      setTimeout(() => {
        setExportState("idle");
      }, 3000);
    } catch (err) {
      console.error("[Export] Export failure:", err);
      toast.error(`Failed to generate JPG image: ${err instanceof Error ? err.message : String(err)}`);
      setExportState("idle");
    }
  };

  const getExportDateStr = () => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }) + ", " + new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getMemberSinceStr = (dateStr: string | null | undefined) => {
    if (!dateStr) return "--";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  if (!isOpen) return null;

  const scaledHeight = 900 * scale;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden p-4">
      {/* Background overlay with fade-in and backdrop blur */}
      <div 
        className={`fixed inset-0 bg-[#050814]/78 backdrop-blur-xl transition-opacity duration-200 ease-out ${active ? "opacity-100" : "opacity-0"}`} 
        onClick={onClose}
      />
      
      {/* Modal Dialog with scale animation */}
      <div 
        className={`relative bg-[#0B1020] border border-white/8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[30px] w-full max-w-[1200px] max-h-[95vh] flex flex-col justify-between overflow-hidden z-10 transition-all duration-200 transform ${active ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"} p-8`}
      >
        {/* Sticky Header Section */}
        <div className="pb-6 border-b border-white/5 mb-6 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* Title & Subtitle block */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary/20 shrink-0">P</div>
              <div className="text-left">
                <h2 className="font-heading font-black text-xl text-white tracking-tight leading-none">Download My Placement Report</h2>
                <p className="text-sm text-muted-foreground mt-1.5 leading-none">
                  Export a beautiful summary of your placement journey.
                </p>
              </div>
            </div>

            {/* Action buttons wrapper immediately left of the close button */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={handleDownloadJpg}
                disabled={exportState !== "idle"}
                className="flex-1 md:flex-initial bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-full shadow-lg hover:shadow-purple-500/20 font-bold px-6 h-[42px] transition-all flex items-center justify-center min-w-[160px] text-sm gap-2 uppercase tracking-wide cursor-pointer disabled:cursor-not-allowed"
              >
                {exportState === "generating" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    Generating...
                  </>
                ) : exportState === "ready" ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    Download Ready
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 shrink-0" />
                    Export JPG
                  </>
                )}
              </button>

              {/* Close Button */}
              <button 
                onClick={onClose}
                className="w-[42px] h-[42px] shrink-0 text-muted-foreground hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-sm font-semibold text-muted-foreground">Compiling report card data...</p>
          </div>
        ) : (
          <>
            {/* Live Preview Container (Centers the scaled footprint) */}
            <div 
              ref={containerRef} 
              className="flex-1 overflow-hidden flex items-center justify-center bg-[#0F172A] border border-white/8 rounded-[24px] p-6 relative min-h-[510px]"
            >
              <div 
                className="w-full flex justify-center overflow-hidden relative"
                style={{ height: `${scaledHeight}px` }}
              >
                {/* Visual Preview Element (Scales down for user) */}
                <div 
                  className="bg-[#0B1020] p-10 flex flex-col justify-between select-none relative overflow-hidden shrink-0 border border-white/5"
                  style={{ 
                    width: "1600px", 
                    height: "900px",
                    transform: `scale(${scale})`, 
                    transformOrigin: "top center",
                    borderRadius: "24px",
                    boxSizing: "border-box"
                  }}
                >
                  <ExportReportCard 
                    data={data}
                    imageError={imageError}
                    setImageError={setImageError}
                    getExportDateStr={getExportDateStr}
                    getMemberSinceStr={getMemberSinceStr}
                    animate={animate}
                  />
                </div>
              </div>
            </div>

            {/* Offscreen Full Size Export Container (No Scale/Zoom/Transform) */}
            <div 
              style={{
                position: "absolute",
                left: "-9999px",
                top: "0",
                width: "1600px",
                height: "900px",
                overflow: "hidden"
              }}
            >
              <div 
                ref={exportCardRef}
                style={{
                  width: "1600px",
                  height: "900px",
                  backgroundColor: "#0B1020",
                  padding: "40px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxSizing: "border-box",
                  position: "relative",
                  borderRadius: "24px"
                }}
              >
                <ExportReportCard 
                  data={data}
                  imageError={imageError}
                  setImageError={setImageError}
                  getExportDateStr={getExportDateStr}
                  getMemberSinceStr={getMemberSinceStr}
                  animate={false}
                />
              </div>
            </div>

            {/* Bottom format metadata bar */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4 shrink-0 text-xs text-muted-foreground font-semibold">
              <span>JPG • 1600×900 • High Quality</span>
              <span>PlacementAI Export Engine v1.0</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
