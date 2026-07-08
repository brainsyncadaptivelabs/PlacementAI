"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACTIVE_TEMPLATES, TEMPLATE_REGISTRY } from "@/lib/resume/templates/templates";
import { calculateTemplateATS, getATSBadge } from "@/lib/resume/ats/analyzer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ResumePreviewModal } from "@/components/resume/ResumePreviewModal";
import { useResumeBuilderSession } from "@/providers/ResumeBuilderSessionProvider";

export default function TemplateGalleryPage() {
  const router = useRouter();
  const { session, setSession } = useResumeBuilderSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ATS Resume");
  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [failedPreviews, setFailedPreviews] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";
    ACTIVE_TEMPLATES.forEach(async (tpl) => {
      try {
        const response = await fetch(`${API_URL}/resume/preview?templateId=${tpl.id}`, {
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
          setPreviewUrls(prev => ({ ...prev, [tpl.id]: data.previewUrl }));
        } else {
          throw new Error("No previewUrl");
        }
      } catch (err) {
        console.warn(`Preview fetch failed for template ${tpl.id}, using local renderer fallback:`, err);
        setFailedPreviews(prev => ({ ...prev, [tpl.id]: true }));
      }
    });
  }, []);

  const categories = ["ATS Resume", "Company Based"];

  const filteredTemplates = ACTIVE_TEMPLATES.filter((tpl) => {
    const query = searchQuery.toLowerCase().trim();
    let matchesSearch = true;
    if (query !== "") {
      const matchesName = tpl.name.toLowerCase().includes(query);
      const matchesCategory = tpl.category.toLowerCase().includes(query);
      const matchesTags = tpl.tags?.some(tag => tag.toLowerCase().includes(query)) ?? false;
      const matchesRoles = tpl.recommendedRoles?.some(role => role.toLowerCase().includes(query)) ?? false;
      matchesSearch = matchesName || matchesCategory || matchesTags || matchesRoles;
    }
    
    const targetCategory = selectedCategory === "ATS Resume" ? "ATS" : "COMPANY";
    return matchesSearch && tpl.category.toUpperCase() === targetCategory;
  }).sort((a, b) => a.name.localeCompare(b.name));

  const handleSelectTemplate = (templateId: string) => {
    setLoadingTemplate(templateId);
    setSession(prev => ({ ...prev, selectedTemplate: templateId }));
    localStorage.setItem("placementai_template", templateId);
    
    const reg = TEMPLATE_REGISTRY[templateId];
    if (reg) {
      localStorage.setItem("placementai_resume_draft", JSON.stringify(reg.initialState));
      localStorage.setItem("placementai_versions", JSON.stringify([]));
    }
    
    router.push(`/dashboard/resume-builder/editor?template=${templateId}`);
  };

  return (
    <div className="min-h-screen bg-card">
      <div className="max-w-[1700px] mx-auto p-8 space-y-12 animate-in fade-in duration-700">
        {/* Header section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-6xl font-black tracking-tighter text-slate-950">
            Design Your Future
          </h1>
          <p className="text-muted-foreground text-xl font-medium leading-relaxed">
            Choose from our premium, AI-optimized resume templates. Visual excellence meets ATS performance.
          </p>
        </div>

        {/* Filters and Search Bar - Sticky & Adobe Style */}
        <div className="sticky top-4 z-40 flex flex-col md:flex-row gap-6 justify-between items-center bg-card/80 backdrop-blur-xl p-4 rounded-[32px] border border-border shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          <div className="flex-1 hidden md:block" />
          
          <div className="flex bg-muted p-1 rounded-full border border-border/30 h-12 items-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`h-10 px-6 text-sm font-semibold rounded-full transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-slate-950 text-white shadow-md"
                    : "text-muted-foreground hover:text-slate-950 bg-transparent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-4 w-full bg-slate-55 border border-border/50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-foreground placeholder:text-muted-foreground/70"
            />
          </div>
        </div>

        {/* Grid of Templates - Optimized 3 per row grid */}
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-card border border-border/60 rounded-3xl p-8 space-y-4 max-w-lg mx-auto shadow-sm">
            <h3 className="text-xl font-bold text-foreground">No Templates Found</h3>
            <p className="text-sm text-muted-foreground">
              We couldn't load any templates matching this category. Please check your registry configuration or try switching filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start justify-items-center w-full">
            {filteredTemplates.map((tpl) => {
              const isSelected = loadingTemplate === tpl.id;
              const reg = TEMPLATE_REGISTRY[tpl.id];
              const Renderer = reg ? reg.renderer : null;

              const isRecommended = session.blueprint?.recommendedTemplate && 
                (tpl.name.toLowerCase().includes(session.blueprint.recommendedTemplate.toLowerCase()) || 
                 (session.blueprint.recommendedTemplate.toLowerCase().includes("ats") && tpl.name.toLowerCase().includes("educator")));

              return (
                <TooltipProvider key={tpl.id}>
                  <div
                    onClick={() => {
                      if (!tpl.comingSoon && window.innerWidth < 768) {
                        handleSelectTemplate(tpl.id);
                      }
                    }}
                    className={`group flex flex-col bg-card w-[300px] h-[460px] rounded-[24px] overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] relative border border-border/50 ${
                      tpl.comingSoon ? "opacity-75" : ""
                    } cursor-pointer md:cursor-default`}
                  >
                    {/* AI Recommended Badge */}
                    {isRecommended && (
                      <div className="absolute top-4 left-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest z-30 shadow-md flex items-center gap-1">
                        <span className="animate-pulse">✨</span> AI Recommended
                      </div>
                    )}

                    {/* Coming soon Overlay */}
                    {tpl.comingSoon && (
                      <div className="absolute inset-0 bg-card/90 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                        <div className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl mb-3">
                          Coming Soon
                        </div>
                        <p className="text-xs font-bold text-muted-foreground">New Design</p>
                      </div>
                    )}

                    {/* Template Preview Block - Dominant Preview (340px) */}
                    <div className="h-[340px] w-full bg-[#f8fafc] rounded-t-[24px] flex justify-center items-start overflow-hidden relative group/preview shrink-0">
                      {previewUrls[tpl.id] && !failedPreviews[tpl.id] ? (
                        <img 
                          src={previewUrls[tpl.id]} 
                          alt={`${tpl.name} Preview`} 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div 
                          className="shrink-0 transition-transform duration-700 md:group-hover/preview:scale-105 pointer-events-none"
                          style={{
                            width: "950px",
                            height: "1120px",
                            transform: "scale(0.31)",
                            transformOrigin: "top center",
                            position: "absolute",
                            top: 16,
                            left: "50%",
                            marginLeft: "-475px"
                          }}
                        >
                          {Renderer ? (
                            <Renderer data={reg.initialState} previewMode={false} />
                          ) : (
                            <div className="w-[950px] h-[1120px] bg-muted flex items-center justify-center text-muted-foreground/70 text-xs font-black">
                              RENDERING...
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Hover Overlay Buttons - Adobe Style */}
                      {!tpl.comingSoon && (
                        <div className="absolute inset-0 bg-slate-950/0 md:group-hover/preview:bg-slate-950/20 transition-all duration-300 hidden md:flex flex-col items-center justify-center gap-3 opacity-0 md:group-hover/preview:opacity-100 z-20">
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewTemplateId(tpl.id);
                            }}
                            className="w-[160px] h-12 bg-transparent text-white font-bold rounded-full border-2 border-white hover:bg-card hover:text-slate-950 transition-all text-sm shadow-xl"
                          >
                            Preview
                          </Button>
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTemplate(tpl.id);
                            }}
                            className="w-[160px] h-12 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-all text-sm border-none shadow-lg shadow-indigo-500/20"
                          >
                            Use
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Template Info - Condensed Footer */}
                    <div className="flex-1 flex flex-col justify-between p-4 pb-5 pt-3 bg-card">
                      <div className="space-y-1">
                        <h3 className="text-[20px] font-[600] text-slate-950 leading-[1.1] whitespace-nowrap overflow-hidden text-ellipsis">
                          {tpl.name}
                        </h3>
                        <p className="text-[14px] text-muted-foreground/70 font-normal leading-none">
                          by PlacementAI
                        </p>
                      </div>
                      
                      {(() => {
                        const analysis = calculateTemplateATS(tpl.id);
                        const parserBadge = getATSBadge(analysis.parserScore);
                        return (
                          <div className="flex items-center justify-between border-t border-border pt-2.5 mt-2">
                            <div className={`px-2.5 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-widest ${parserBadge.color}`}>
                              {parserBadge.label} Parser
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </TooltipProvider>
              );
            })}
          </div>
        )}

        {/* Quick Preview Modal - Dedicated Component */}
        <ResumePreviewModal 
          templateId={previewTemplateId} 
          isOpen={!!previewTemplateId} 
          onClose={() => setPreviewTemplateId(null)}
          onSelect={handleSelectTemplate}
        />
      </div>
    </div>
  );
}
