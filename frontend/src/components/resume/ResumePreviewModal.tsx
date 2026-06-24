"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  ChevronLeft, 
  ChevronRight, 
  Expand,
  Minimize2,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TEMPLATE_REGISTRY } from "@/lib/resume/templates/templates";
import { Loader2 } from "lucide-react";

interface ResumePreviewModalProps {
  templateId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateId: string) => void;
}

export function ResumePreviewModal({ templateId, isOpen, onClose, onSelect }: ResumePreviewModalProps) {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [apiPreviewUrl, setApiPreviewUrl] = useState<string | null>(null);
  const [failedPreviewFetch, setFailedPreviewFetch] = useState(false);

  // Reset state and load preview when opening a new template
  useEffect(() => {
    if (isOpen) {
      setZoom(100);
      setCurrentPage(1);
      setApiPreviewUrl(null);
      setFailedPreviewFetch(false);

      if (templateId) {
        const loadApiPreview = async () => {
          try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";
            const response = await fetch(`${API_URL}/resume/preview?templateId=${templateId}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            });

            if (response.status === 403 || response.status === 404 || response.status === 500) {
              throw new Error(`Status ${response.status}`);
            }

            if (!response.ok) {
              throw new Error(`Fetch failed`);
            }

            const data = await response.json();
            if (data.previewUrl) {
              setApiPreviewUrl(data.previewUrl);
            } else {
              throw new Error("No previewUrl");
            }
          } catch (err) {
            console.warn(`Failed fetching resume preview from server, using local fallback:`, err);
            setFailedPreviewFetch(true);
          }
        };

        loadApiPreview();
      }
    }
  }, [isOpen, templateId]);

  const template = templateId ? TEMPLATE_REGISTRY[templateId] : null;
  const Renderer = template?.renderer;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);
  
  const handleFitWidth = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 80; // 40px padding on each side
      const newZoom = Math.floor((containerWidth / 900) * 100);
      setZoom(Math.min(Math.max(newZoom, 50), 200));
    }
  };

  const handleFitPage = () => {
    if (containerRef.current) {
      const containerHeight = containerRef.current.clientHeight - 80; // 40px padding on top/bottom
      const newZoom = Math.floor((containerHeight / 1270) * 100);
      setZoom(Math.min(Math.max(newZoom, 50), 200));
    }
  };

  if (!templateId || !template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Hide the default close button if possible by leaving it unrendered, or overriding its styles */}
      <DialogContent 
        className={`w-[92vw] max-w-[1700px] h-[92vh] max-h-[92vh] p-0 overflow-hidden bg-[#eef2f7] border-none rounded-[24px] shadow-2xl flex flex-col transition-all duration-300 ${
          isFullscreen ? "w-[100vw] max-w-none h-[100vh] max-h-none rounded-none" : ""
        }`}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Resume Preview</DialogTitle>
        
        {/* Sticky Toolbar */}
        <div className="sticky top-0 z-[100] h-[72px] bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onClose} className="text-muted-foreground hover:text-foreground px-2 font-bold">
               <ChevronLeft className="w-5 h-5 mr-1" /> Back
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="bg-indigo-100 p-1.5 rounded-lg">
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-sm font-black text-foreground">
              {template.initialState.personalInfo.name}
            </div>
          </div>
          
          {/* Zoom Controls */}
          <div className="flex items-center gap-6">
            <div className="flex items-center bg-muted rounded-lg p-1 border border-border">
              <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-8 w-8 hover:bg-card hover:shadow-sm rounded-md"><ZoomOut className="w-4 h-4 text-muted-foreground" /></Button>
              <div className="px-4 flex items-center justify-center text-xs font-bold text-foreground min-w-[60px] tabular-nums">{zoom}%</div>
              <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-8 w-8 hover:bg-card hover:shadow-sm rounded-md"><ZoomIn className="w-4 h-4 text-muted-foreground" /></Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleFitWidth} className="h-10 px-4 rounded-lg border-border hover:bg-muted font-bold text-foreground text-xs shadow-sm">
                Fit Width
              </Button>
              <Button variant="outline" size="sm" onClick={handleFitPage} className="h-10 px-4 rounded-lg border-border hover:bg-muted font-bold text-foreground text-xs shadow-sm">
                Fit Page
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setIsFullscreen(!isFullscreen)} 
                className="h-10 w-10 rounded-lg border-border hover:bg-slate-55 shadow-sm"
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4 text-muted-foreground" /> : <Maximize className="w-4 h-4 text-muted-foreground" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <Button 
              onClick={() => onSelect(templateId)}
              className="bg-indigo-600 text-white font-black h-10 px-6 rounded-lg text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all"
            >
              Use Template
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Preview Canvas Area */}
        <div 
          className="flex-1 overflow-x-hidden overflow-y-auto flex justify-center items-start p-10 relative bg-[#eef2f7]" 
          ref={containerRef}
        >
          {/* Page indicator at top right */}
          <div className="absolute top-6 right-6 text-muted-foreground/70 text-xs font-semibold select-none z-50">
            Page {currentPage} of 1
          </div>

          {/* Actual Resume Container */}
          <div 
            style={{ 
              transform: `scale(${zoom / 100})`, 
              transformOrigin: "top center",
              width: "950px",
              minHeight: "1120px",
              transition: "transform 0.2s ease"
            }}
            className="bg-card shadow-[0_20px_80px_rgba(0,0,0,0.12)] shrink-0 mb-10 mx-auto flex justify-center items-start"
          >
            {apiPreviewUrl && !failedPreviewFetch ? (
              <img 
                src={apiPreviewUrl} 
                alt={`${template.initialState.personalInfo.name}'s Resume Preview`} 
                className="w-full h-full object-contain"
              />
            ) : Renderer ? (
              <Renderer data={template.initialState} previewMode={false} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-card">
                <Loader2 className="w-12 h-12 text-indigo-650 animate-spin" />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}