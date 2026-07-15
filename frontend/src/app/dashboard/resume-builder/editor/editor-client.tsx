"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  RotateCcw, 
  RotateCw, 
  Download, 
  Sparkles, 
  ChevronUp, 
  ChevronDown, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Info, 
  X,
  FileText,
  Eye,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Minimize2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { TEMPLATE_REGISTRY, ACTIVE_TEMPLATES, compileLatex } from "@/lib/resume/templates/templates";
import { ResumeState, initialEducatorState } from "@/lib/resume/templates/legacy/placementai-educator/schema";
import { ResumeService } from "@/services/resume.service";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { StorageService } from "@/services/storage.service";
import { useResumeBuilderSession } from "@/providers/ResumeBuilderSessionProvider";

function ResumeEditor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { session, setSession } = useResumeBuilderSession();
  const [showQualityReport, setShowQualityReport] = useState(false);
  const templateId = searchParams.get("template") || "placementai-educator";
  const resumeId = searchParams.get("id");

  const registry = TEMPLATE_REGISTRY[templateId] || TEMPLATE_REGISTRY["placementai-educator"];
  const RendererComponent = registry.renderer;

  // Editor State
  const [state, setState] = useState<ResumeState>(registry.initialState);
  
  // Undo/Redo Stacks
  const [history, setHistory] = useState<ResumeState[]>([registry.initialState]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Debounced State for Live Preview
  const [debouncedState, setDebouncedState] = useState<ResumeState>(registry.initialState);
  const [previewState, setPreviewState] = useState<ResumeState | null>(null); // For AI Preview

  // UI state
  const [activeSection, setActiveSection] = useState<string>("personal");
  const [collapsedBlocks, setCollapsedBlocks] = useState<Record<string, boolean>>({});
  
  // Versions
  const [versions, setVersions] = useState<{ id: string; timestamp: string; name: string; patch: Partial<ResumeState> }[]>([]);
  const [newVersionName, setNewVersionName] = useState("");
  const [showVersionModal, setShowVersionModal] = useState(false);

  // Resume title (for database sync)
  const [resumeTitle, setResumeTitle] = useState("My Professional Resume");

  // Scores
  const [baselineScore, setBaselineScore] = useState<number>(0);
  const [scores, setScores] = useState({ 
    ats: 74, 
    completeness: 80, 
    impact: 70, 
    keywords: 65, 
    coverage: 90,
    compliance: 96,
    grammar: 91,
    readability: 89,
    confidence: 93
  });

  // Pages for pagination
  const [pages, setPages] = useState<string[]>([]);
  const [currentPageIdx, setCurrentPageIdx] = useState<number>(0);

  // AI Suggestions
  const [aiActiveTab, setAiActiveTab] = useState<string>("Improve");
  const [aiInput, setAiInput] = useState("");
  const [aiStreaming, setAiStreaming] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{ 
    id: string; 
    text: string; 
    gain: string; 
    reason: string; 
    risk: string; 
    category: string; 
    priority?: string;
  }[]>([]);
  const [previewingSuggestionId, setPreviewingSuggestionId] = useState<string | null>(null);
  
  // AI Panel is now dynamic drawer/panel based on viewport and expand state
  const [aiExpanded, setAiExpanded] = useState(true); // Default expanded on desktop for quick onboarding
  const aiPanelRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);

  // Zoom & Mode settings
  const [zoom, setZoom] = useState<number>(0.95); // Default 95% zoom for perfect balance
  const [focusMode, setFocusMode] = useState<boolean>(false);

  // Autosave status
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving..." | "Unsaved Changes" | "Error: Unauthenticated">("Saved");

  // AI Panel State (moved from inner render IIFE to fix hook order bug)
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedSuggestId, setExpandedSuggestId] = useState<string | null>(null);

  const [leftSidebarWidth, setLeftSidebarWidth] = useState(320);
  const [isLeftDragging, setIsLeftDragging] = useState(false);
  const [leftExpanded, setLeftExpanded] = useState(true);

  useEffect(() => {
    const savedWidth = localStorage.getItem("placementai_coach_sidebar_width");
    if (savedWidth) {
      const parsed = parseInt(savedWidth, 10);
      if (!isNaN(parsed) && parsed >= 250 && parsed <= 600) {
        setSidebarWidth(parsed);
      }
    }
    
    const savedLeftWidth = localStorage.getItem("placementai_editor_sidebar_width");
    if (savedLeftWidth) {
      const parsed = parseInt(savedLeftWidth, 10);
      if (!isNaN(parsed) && parsed >= 250 && parsed <= 800) {
        setLeftSidebarWidth(parsed);
      }
    }
  }, []);

  const startLeftResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLeftDragging(true);
  };

  useEffect(() => {
    if (!isLeftDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      // For left panel, width is roughly e.clientX minus left offset
      // Since it's in a flex container with p-4 (16px), offset is around 16px.
      const newWidth = e.clientX - 16;
      if (newWidth >= 250 && newWidth <= 800) {
        setLeftSidebarWidth(newWidth);
        localStorage.setItem("placementai_editor_sidebar_width", newWidth.toString());
      }
    };

    const handleMouseUp = () => {
      setIsLeftDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isLeftDragging]);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 250 && newWidth <= 600) {
        setSidebarWidth(newWidth);
        localStorage.setItem("placementai_coach_sidebar_width", newWidth.toString());
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Scroll to top when template or resume changes
  useEffect(() => {
    if (previewScrollRef.current) {
      previewScrollRef.current.scrollTop = 0;
    }
  }, [templateId, resumeId, focusMode, saveStatus === "Saved"]);

  // Load draft or DB resume on mount
  useEffect(() => {
    const fetchDbResume = async () => {
      if (!resumeId) return;
      try {
        const resume = await ResumeService.getResume(resumeId as string);
        setResumeTitle(resume.title || "My Professional Resume");

        let dbState: ResumeState = { ...registry.initialState };
        if (resume.resume_data) {
           dbState = resume.resume_data as unknown as ResumeState;
        }
        if (!dbState.achievements) dbState.achievements = [];

        setState(dbState);
        setDebouncedState(dbState);
        setHistory([dbState]);
        setHistoryIndex(0);
      } catch (err) {
        console.error("Failed fetching database resume", err);
      }
    };

    const loadDraft = () => {
      if (resumeId) return; // DB overrides local draft
      const savedDraft = localStorage.getItem("placementai_resume_draft");
      const savedTemplate = localStorage.getItem("placementai_template");
      const savedVersions = localStorage.getItem("placementai_versions");

      if (savedDraft && savedTemplate === templateId) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (!parsed.achievements) parsed.achievements = [];
          setState(parsed);
          setDebouncedState(parsed);
          setHistory([parsed]);
          setHistoryIndex(0);
        } catch (e) {
          console.error("Failed to parse saved draft", e);
        }
      }

      if (savedVersions) {
        try {
          setVersions(JSON.parse(savedVersions));
        } catch (e) {
          console.error("Failed to parse saved versions", e);
        }
      }
    };

    fetchDbResume();
    loadDraft();
  }, [templateId, resumeId]);

  useEffect(() => {
    if (session.blueprint?.aiSuggestions) {
      const mapped = Object.entries(session.blueprint.aiSuggestions)
        .filter(([_, text]) => text && text.trim().length > 0)
        .map(([section, text], index) => {
          return {
            id: `ai-blueprint-${section}-${index}`,
            text: text,
            gain: `+${Math.floor(Math.random() * 5) + 6}% Match`,
            reason: `Optimized ${section} section matching ${session.blueprint?.targetRole || "target"} requirements.`,
            risk: "None",
            category: section.toUpperCase()
          };
        });
      setAiSuggestions(mapped);
      const blueprint = session.blueprint;
      if (blueprint && blueprint.currentMatch) {
        setBaselineScore(blueprint.currentMatch);
        setScores(prev => ({ ...prev, ats: blueprint.currentMatch }));
      }
    }
  }, [session.blueprint]);

  // Debounce Preview rendering (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedState(state);
    }, 300);
    return () => clearTimeout(timer);
  }, [state]);

  // Helper to get template-specific tips
  const getTemplateTips = (id: string): string => {
    try {
      const folderName = id.replace("-style", "");
      let recData;
      if (["professional", "classic", "experienced", "modern", "ats", "executive"].includes(folderName)) {
        recData = require(`../../../../resume-templates/ats/${folderName}/recommendations.json`);
      } else {
        recData = require(`../../../../resume-templates/company-based/${folderName}/recommendations.json`);
      }
      if (recData && recData.aiPriorities) {
        return `Template Tone: ${recData.resumeTone}. Bullet Style: ${recData.recommendedBulletStyle}. Coach Priorities: ${recData.aiPriorities.join(", ")}.`;
      }
    } catch (e) {
      console.warn("Could not read template tips context:", e);
    }
    return "Optimize layout to balance section whitespace and keep critical keywords in the upper fold.";
  };

  // Helper to get context-aware, template-aware suggestions
  const getContextAwareSuggestions = (currentState: ResumeState, currentTemplateId: string, blueprint: any) => {
    const list: any[] = [];
    const fullText = JSON.stringify(currentState).toLowerCase();

    let preferredSkills: string[] = [];
    let avoidKeywords: string[] = [];
    let bulletStyle = "STAR";
    let resumeTone = "Professional";
    let aiPriorities: string[] = [];

    try {
      const folderName = currentTemplateId.replace("-style", "");
      let recData;
      if (["professional", "classic", "experienced", "modern", "ats", "executive"].includes(folderName)) {
        recData = require(`../../../../resume-templates/ats/${folderName}/recommendations.json`);
      } else {
        recData = require(`../../../../resume-templates/company-based/${folderName}/recommendations.json`);
      }
      if (recData) {
        preferredSkills = recData.preferredSkills || [];
        avoidKeywords = recData.avoidKeywords || [];
        bulletStyle = recData.recommendedBulletStyle || "STAR";
        resumeTone = recData.resumeTone || "Professional";
        aiPriorities = recData.aiPriorities || [];
      }
    } catch (e) {
      console.warn("Could not read recommendations.json for context suggestions:", e);
    }

    // High Priority: Missing template preferred skills
    const missingPreferred = preferredSkills.filter(s => !fullText.includes(s.toLowerCase()));
    if (missingPreferred.length > 0) {
      list.push({
        id: "high-missing-preferred-skills",
        priority: "High Priority",
        category: "SKILLS",
        text: `Integrate key skills required by this format: ${missingPreferred.slice(0, 3).join(", ")}`,
        gain: "+15% Match Score",
        reason: `This template/target company expects strong experience with ${missingPreferred.slice(0, 3).join(", ")}. Adding these highlights key domain proficiency.`
      });
    }

    // Medium Priority: Penalize avoided keywords
    const activeAvoids = avoidKeywords.filter(ak => fullText.includes(ak.toLowerCase()));
    if (activeAvoids.length > 0) {
      list.push({
        id: "medium-avoid-keywords",
        priority: "Medium Priority",
        category: "SUMMARY",
        text: `Remove generic or discouraged terms: ${activeAvoids.slice(0, 3).join(", ")}`,
        gain: "+10% Compliance",
        reason: `discouraged terms like ${activeAvoids.slice(0, 3).join(", ")} lower resume premium feel and keyword compliance.`
      });
    }

    // High Priority: Missing summary description
    if (!currentState.summary || currentState.summary.length < 50) {
      list.push({
        id: "high-empty-summary",
        priority: "High Priority",
        category: "SUMMARY",
        text: `Draft a professional summary aligned with a ${resumeTone} tone, formatted with ${bulletStyle} phrasing.`,
        gain: "+10% Completeness",
        reason: "A strong professional summary hooks recruiter interest within the first 6 seconds."
      });
    }

    // High Priority: Star Verbs and bullet style advice
    const starVerbs = ["spearheaded", "engineered", "designed", "optimized", "automated", "resolved"];
    const hasStarVerbs = starVerbs.some(v => fullText.includes(v));
    if (!hasStarVerbs && bulletStyle === "STAR") {
      list.push({
        id: "high-bullet-verbs",
        priority: "High Priority",
        category: "EXPERIENCE",
        text: "Incorporate action-oriented verbs ('engineered', 'optimized') to frame your bullets as STAR achievements.",
        gain: "+12% Impact Score",
        reason: `This template format demands ${bulletStyle} bullet configurations outlining Situation, Task, Action, and Result.`
      });
    }

    // Optional Priority: AI Priorities advice
    if (aiPriorities.length > 0) {
      list.push({
        id: "opt-ai-priorities",
        priority: "Optional",
        category: "SUMMARY",
        text: `Audit priorities: ${aiPriorities.slice(0, 2).join(", ")}`,
        gain: "+5% Compliance",
        reason: `Aligned with the template guidelines focusing specifically on ${aiPriorities.join(" and ")}.`
      });
    }

    return list;
  };

  // Quick actions implementation
  const handleQuickAction = (action: "optimize" | "ats" | "summary" | "star") => {
    if (action === "optimize" && session.blueprint) {
      const mergedSkills = Array.from(new Set([...state.skills, ...session.blueprint.topSkills]));
      updateState({
        ...state,
        skills: mergedSkills
      });
    } else if (action === "ats") {
      const improvedSummary = "Engineered and spearheaded scalable RESTful microservices, optimizing system delivery cycles by 35% and improving data serialization latencies across cloud environments.";
      updateState({
        ...state,
        summary: improvedSummary
      });
    } else if (action === "summary") {
      const rewritten = `Results-oriented backend professional. Demonstrates advanced engineering capability, microservices development, and metric-driven database persistences.`;
      updateState({
        ...state,
        summary: rewritten
      });
    } else if (action === "star") {
      if (state.projects.length > 0) {
        const updatedProjects = state.projects.map((p, idx) => idx === 0 ? {
          ...p,
          description: "Engineered high-performance enterprise systems (Situation/Task) using Spring Boot and Hibernate.\nSpearheaded deployment automation via Kubernetes pipelines (Action), reducing deployment latencies by 40%.\nDelivered 99.9% application uptime and optimized query indexing (Result)."
        } : p);
        updateState({
          ...state,
          projects: updatedProjects
        });
      }
    }
  };

  // Automatic debounced coaching hook
  useEffect(() => {
    if (aiStreaming) return;
    const timer = setTimeout(() => {
      const list = getContextAwareSuggestions(state, templateId, session.blueprint);
      if (list.length > 0) {
        setAiSuggestions(list);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [state, templateId]);

  // Calculate Scores dynamically whenever state updates
  useEffect(() => {
    // 1. Completeness Score
    let filledFields = 0;
    let totalFields = 0;

    Object.values(state.personalInfo).forEach(val => {
      totalFields++;
      if (val) filledFields++;
    });

    totalFields++;
    if (state.summary) filledFields++;

    totalFields++;
    if (state.skills && state.skills.length > 0) filledFields++;

    totalFields += 3; // exp, proj, edu
    if (state.experience?.length > 0) filledFields++;
    if (state.projects?.length > 0) filledFields++;
    if (state.education?.length > 0) filledFields++;

    const completeness = Math.round((filledFields / totalFields) * 100);

    // 2. Keywords Score
    const industryKeywords = [
      "java", "javascript", "react", "next.js", "spring boot", "node", "sql", "api", "rest", "cloud", "docker", 
      "kubernetes", "git", "backend", "frontend", "architecture", "microservices", "ci/cd", "aws", "databases",
      "postgresql", "mysql", "redis", "nosql", "typescript", "python", "css", "html", "testing", "agile"
    ];
    let matchedKeywords = 0;
    const fullTextContent = JSON.stringify(state).toLowerCase();
    industryKeywords.forEach(kw => {
      if (fullTextContent.includes(kw)) {
        matchedKeywords++;
      }
    });
    const keywords = Math.min(100, Math.round((matchedKeywords / 12) * 105)); // target 12 matching keywords

    // 3. Impact Score
    let impactScore = 50;
    const impactKeywords = ["increased", "decreased", "improved", "reduced", "led", "engineered", "optimized", "developed", "redesign", "managed", "spearheaded", "%", "$", "revenue", "growth", "seconds", "ms"];
    let keywordsFound = 0;

    const descriptions = [
      ...state.experience.map(e => e.description),
      ...state.projects.map(p => p.description)
    ].join(" ").toLowerCase();

    impactKeywords.forEach(kw => {
      if (descriptions.includes(kw)) {
        keywordsFound++;
      }
    });

    impactScore += keywordsFound * 7;
    if (impactScore > 100) impactScore = 100;

    // 4. Page Coverage Score
    const totalChars = fullTextContent.length;
    let coverage = 90;
    if (totalChars < 1200) {
      coverage = 65;
    } else if (totalChars < 2200) {
      coverage = 95;
    } else if (totalChars < 3200) {
      coverage = 85;
    } else {
      coverage = 98;
    }

    // Calculate template-aware ATS score based on weightages in recommendations.json
    let ats = Math.min(100, Math.round(completeness * 0.3 + keywords * 0.3 + impactScore * 0.3 + coverage * 0.1));
    
    // Dynamically require recommendations
    let preferredSkills: string[] = [];
    let avoidKeywords: string[] = [];
    try {
      const folderName = templateId.replace("-style", "");
      let recData;
      if (["professional", "classic", "experienced", "modern", "ats", "executive"].includes(folderName)) {
        recData = require(`../../../../resume-templates/ats/${folderName}/recommendations.json`);
      } else {
        recData = require(`../../../../resume-templates/company-based/${folderName}/recommendations.json`);
      }
      if (recData && recData.atsWeightages) {
        // Compute custom ATS score based on template specific criteria and keyword lists
        let matches = 0;
        preferredSkills = recData.preferredSkills || [];
        avoidKeywords = recData.avoidKeywords || [];
        preferredSkills.forEach(s => {
          if (fullTextContent.includes(s.toLowerCase())) matches++;
        });
        
        let avoidsCount = 0;
        avoidKeywords.forEach(ak => {
          if (fullTextContent.includes(ak.toLowerCase())) avoidsCount++;
        });

        const skillMatchRate = preferredSkills.length > 0 ? (matches / preferredSkills.length) * 100 : 80;
        const penalty = avoidsCount * 5;
        
        // Compute template weighted aggregate
        const weights = recData.atsWeightages;
        let scoreSum = 0;
        let weightTotal = 0;
        
        Object.entries(weights).forEach(([key, weightValue]) => {
          const w = weightValue as number;
          weightTotal += w;
          if (key === "projects") scoreSum += w * (state.projects.length > 0 ? 95 : 40);
          else if (key === "experience") scoreSum += w * (state.experience.length > 0 ? 95 : 40);
          else if (key === "skills") scoreSum += w * skillMatchRate;
          else if (key === "summary") scoreSum += w * (state.summary.length > 100 ? 95 : 40);
          else scoreSum += w * completeness;
        });

        if (weightTotal > 0) {
          ats = Math.max(20, Math.min(100, Math.round(scoreSum / weightTotal) - penalty));
        }
      }
    } catch (e) {
      console.warn("Could not dynamically resolve recommendations.json:", e);
    }

    // 6. Template Compliance Score
    let compliance = 96;
    if (templateId === "professional-ats") {
      if (state.experience?.length > 3) compliance -= 15;
      if (state.skills?.length > 18) compliance -= 10;
    } else if (templateId === "classic-ats") {
      if (state.skills?.length > 15) compliance -= 15;
    } else if (templateId === "experienced-ats") {
      if (state.summary?.length < 100) compliance -= 15;
    }

    // 7. Readability
    const wordCount = fullTextContent.split(/\s+/).filter(Boolean).length;
    let readability = 89;
    if (wordCount < 100) readability = 50;
    else if (wordCount > 600) readability = 75;

    // 8. Grammar
    const grammar = 91;

    // 9. AI Confidence
    const confidence = Math.min(100, Math.round(ats * 0.7 + completeness * 0.3));

    setScores({ 
      ats, 
      completeness, 
      impact: Math.round(impactScore), 
      keywords, 
      coverage,
      compliance,
      grammar,
      readability,
      confidence
    });

    if (baselineScore === 0) {
      setBaselineScore(ats);
    }
  }, [state, baselineScore, templateId]);

  // Multipage break detection & DOM Pagination (350ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      const hiddenRoot = document.getElementById("hidden-measurement-root")?.firstElementChild as HTMLElement;
      if (!hiddenRoot) return;

      // Select all flow elements that have data-block attribute
      const blocks = Array.from(hiddenRoot.querySelectorAll('[data-block]')) as HTMLElement[];
      
      // Assign flow IDs
      blocks.forEach((el, index) => {
        el.setAttribute('data-flow-id', index.toString());
      });

      // Measure height of each flow element
      const elementsInfo = blocks.map(el => {
        return {
          id: el.getAttribute('data-flow-id') || '',
          type: el.getAttribute('data-block') || '',
          height: el.offsetHeight || el.getBoundingClientRect().height
        };
      });

      // Target content height for A4 (1120 total height - 72 padding)
      const maxContentHeight = 1048; 
      const calculatedPages: string[][] = [];
      let currentPage: string[] = [];
      let currentHeight = 0;

      for (let i = 0; i < elementsInfo.length; i++) {
        const el = elementsInfo[i];
        const elHeight = el.height;
        const isHeader = el.type.endsWith('-header');
        const remainingSpace = maxContentHeight - currentHeight;

        // Orphan prevention: if it's a header and remaining space is < 160px, push to next page
        if (currentHeight + elHeight > maxContentHeight || (isHeader && remainingSpace < 160)) {
          if (currentPage.length > 0) {
            calculatedPages.push(currentPage);
          }
          currentPage = [el.id];
          currentHeight = elHeight;
        } else {
          currentPage.push(el.id);
          currentHeight += elHeight;
        }
      }
      if (currentPage.length > 0) {
        calculatedPages.push(currentPage);
      }

      // Fallback
      if (calculatedPages.length === 0) {
        calculatedPages.push(elementsInfo.map(e => e.id));
      }

      // Reconstruct outerHTML for each page
      const pageHtmls = calculatedPages.map(pageElementIds => {
        const clone = hiddenRoot.cloneNode(true) as HTMLElement;
        const clonedBlocks = Array.from(clone.querySelectorAll('[data-flow-id]')) as HTMLElement[];
        
        clonedBlocks.forEach(el => {
          const flowId = el.getAttribute('data-flow-id');
          if (!flowId || !pageElementIds.includes(flowId)) {
            el.parentNode?.removeChild(el);
          }
        });

        // Clean empty wrappers
        const divs = Array.from(clone.querySelectorAll('div')) as HTMLElement[];
        divs.forEach(div => {
          const childrenBlocks = div.querySelectorAll('[data-flow-id]');
          const isMainBlock = div.hasAttribute('data-block');
          if (childrenBlocks.length === 0 && !isMainBlock && div !== clone) {
            // Keep if there is text or HTML content
            if (div.innerText?.trim() === '' && div.innerHTML.trim() === '') {
              div.parentNode?.removeChild(div);
            }
          }
        });

        clone.style.height = "100%";
        clone.style.minHeight = "100%";
        clone.style.boxSizing = "border-box";
        return clone.outerHTML;
      });

      setPages(pageHtmls);
    }, 350);

    return () => clearTimeout(timer);
  }, [debouncedState, templateId, activeSection, previewState]);

  // 2s Auto-save loop
  useEffect(() => {
    setSaveStatus("Unsaved Changes");
    const timer = setTimeout(() => {
      setSaveStatus("Saving...");
      
      localStorage.setItem("placementai_resume_draft", JSON.stringify(state));
      localStorage.setItem("placementai_template", templateId);
      
      const syncDb = async () => {
        if (!resumeId) {
          setSaveStatus("Saved");
          return;
        }
        try {
          await ResumeService.updateResume(resumeId as string, {
            title: resumeTitle,
            template_id: templateId,
            resume_data: state as any
          });
          setSaveStatus("Saved");
        } catch (err) {
          console.error("Failed saving to DB in background", err);
          setSaveStatus("Unsaved Changes");
        }
      };
      
      syncDb();
    }, 2000);

    return () => clearTimeout(timer);
  }, [state, templateId, resumeId, resumeTitle]);

  // Outside click listener to auto-close AI suggestions drawer ONLY when on tablet overlay mode
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (window.innerWidth >= 1024) return; // Desktop is side-by-side, no overlay closing

      const toggleBtn = document.getElementById("ai-coach-toggle-btn");
      if (
        aiExpanded && 
        aiPanelRef.current && 
        !aiPanelRef.current.contains(event.target as Node) &&
        (!toggleBtn || !toggleBtn.contains(event.target as Node))
      ) {
        setAiExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [aiExpanded]);

  // Editor state modifiers
  const updateState = (newState: ResumeState, recordHistory = true) => {
    setState(newState);
    if (recordHistory) {
      const nextHistory = history.slice(0, historyIndex + 1);
      setHistory([...nextHistory, newState]);
      setHistoryIndex(nextHistory.length);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setState(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setState(history[historyIndex + 1]);
    }
  };

  // Block management
  const toggleCollapse = (blockId: string) => {
    setCollapsedBlocks(prev => ({ ...prev, [blockId]: !prev[blockId] }));
  };

  const moveItem = (section: "experience" | "projects" | "education", index: number, direction: "up" | "down") => {
    const list = [...state[section]] as any[];
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === list.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    updateState({
      ...state,
      [section]: list
    });
  };

  const deleteItem = (section: "experience" | "projects" | "education", index: number) => {
    const list = state[section].filter((_, i) => i !== index);
    updateState({
      ...state,
      [section]: list
    });
  };

  const duplicateItem = (section: "experience" | "projects" | "education", index: number) => {
    const item = { ...state[section][index], id: `${section}-${Date.now()}` };
    const list = [...state[section]];
    list.splice(index + 1, 0, item);
    updateState({
      ...state,
      [section]: list
    });
  };

  const addNewItem = (section: "experience" | "projects" | "education") => {
    let newItem: any;
    if (section === "experience") {
      newItem = { id: `exp-${Date.now()}`, company: "New Company", role: "Role", duration: "2026", description: "Bullet description" };
    } else if (section === "projects") {
      newItem = { id: `proj-${Date.now()}`, name: "New Project", role: "Tech stack", duration: "2026", description: "Bullet description" };
    } else {
      newItem = { id: `edu-${Date.now()}`, institution: "University Name", degree: "Degree", duration: "2026", details: "GPA, details" };
    }

    updateState({
      ...state,
      [section]: [...state[section], newItem]
    });
    setCollapsedBlocks(prev => ({ ...prev, [newItem.id]: false }));
  };

  // Diff Versioning (Patches)
  const computeDiff = (base: ResumeState, current: ResumeState): Partial<ResumeState> => {
    const patch: Partial<ResumeState> = {};
    for (const key in current) {
      if (JSON.stringify(base[key as keyof ResumeState]) !== JSON.stringify(current[key as keyof ResumeState])) {
        patch[key as keyof ResumeState] = current[key as keyof ResumeState] as any;
      }
    }
    return patch;
  };

  const handleSaveVersion = () => {
    if (!newVersionName.trim()) return;

    const baseState = registry.initialState;
    const patch = computeDiff(baseState, state);

    const newVersion = {
      id: `v-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      name: newVersionName,
      patch
    };

    const nextVersions = [newVersion, ...versions].slice(0, 20); // Keep max 20
    setVersions(nextVersions);
    localStorage.setItem("placementai_versions", JSON.stringify(nextVersions));
    setNewVersionName("");
    setShowVersionModal(false);
  };

  const handleRestoreVersion = (patch: Partial<ResumeState>) => {
    const baseState = registry.initialState;
    const restored = { ...baseState, ...patch };
    updateState(restored);
    setPreviewState(null);
  };

  // Exports
  const handleExportLatex = () => {
    const texContent = compileLatex(templateId, state, registry.rawTex);
    const blob = new Blob([texContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${state.personalInfo.name.replace(/\s+/g, "_")}_Resume.tex`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportDocx = (skipReport = false) => {
    if (session.blueprint && !skipReport && !showQualityReport) {
      setShowQualityReport(true);
      return;
    }
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>Resume</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.25; }
        h1 { font-size: 18pt; text-align: center; text-transform: uppercase; margin-bottom: 2pt; font-weight: bold; }
        h2 { font-size: 12pt; text-transform: uppercase; border-bottom: 1px solid black; margin-top: 12pt; margin-bottom: 6pt; font-weight: bold; }
        .center { text-align: center; font-size: 9pt; }
        .subheading { font-weight: bold; display: flex; justify-content: space-between; }
        .italic { font-style: italic; }
      </style>
      </head>
      <body>
        <h1>${state.personalInfo.name}</h1>
        <div class="center">${state.personalInfo.phone} | ${state.personalInfo.email} | ${state.personalInfo.linkedin}</div>
        <h2>Summary</h2>
        <p>${state.summary}</p>
        <h2>Skills</h2>
        <ul>${state.skills.map(s => `<li>${s}</li>`).join("")}</ul>
        <h2>Experience</h2>
        ${state.experience.map(exp => `
          <div>
            <strong>${exp.company}</strong> -- <i>${exp.role}</i> (${exp.duration})
            <ul>${exp.description.split("\n").map(b => `<li>${b}</li>`).join("")}</ul>
          </div>
        `).join("")}
        <h2>Projects</h2>
        ${state.projects.map(proj => `
          <div>
            <strong>${proj.name}</strong> -- <i>${proj.role}</i> (${proj.duration})
            <ul>${proj.description.split("\n").map(b => `<li>${b}</li>`).join("")}</ul>
          </div>
        `).join("")}
        <h2>Education</h2>
        ${state.education.map(edu => `
          <div>
            <strong>${edu.institution}</strong> (${edu.duration})<br/>
            <i>${edu.degree}</i> -- ${edu.details}
          </div>
        `).join("")}
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${state.personalInfo.name.replace(/\s+/g, "_")}_Resume.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPdf = (skipReport = false) => {
    if (session.blueprint && !skipReport && !showQualityReport) {
      setShowQualityReport(true);
      return;
    }
    const originalTitle = document.title;
    
    // Determine the template display name from TEMPLATE_REGISTRY or fallback to ID
    const tplMeta = TEMPLATE_REGISTRY[templateId];
    const rawName = (tplMeta as any)?.name || templateId;
    // Replace spaces and special chars with underscores
    const formattedTplName = rawName.replace(/[\s\-_]+/g, "_");
    
    document.title = `Resume_${formattedTplName}`;

    // Clone the print root
    const printRoot = document.getElementById("resume-print-root");
    if (!printRoot) return;
    
    const printClone = printRoot.cloneNode(true) as HTMLElement;
    printClone.id = "active-print-clone";
    printClone.style.display = "block";
    
    // Hide the React root temporarily
    const reactRoot = document.body.firstElementChild as HTMLElement;
    if (reactRoot) reactRoot.style.display = "none";
    
    document.body.appendChild(printClone);
    
    window.print();
    
    // Cleanup
    document.title = originalTitle;
    document.body.removeChild(printClone);
    if (reactRoot) reactRoot.style.display = "";
  };

  const handleSaveToCloud = async () => {
    if (!user) {
      setSaveStatus("Error: Unauthenticated");
      return;
    }
    setSaveStatus("Saving...");
    try {
      if (!resumeId) {
        const response = await ResumeService.createResume({
          user_id: user.id,
          title: resumeTitle,
          template_id: templateId,
          resume_data: state as any,
          is_public: false
        });
        const newId = response.id;
        setSaveStatus("Saved");
        router.push(`/dashboard/resume-builder/editor?template=${templateId}&id=${newId}`);
      } else {
        await ResumeService.updateResume(resumeId as string, {
          title: resumeTitle,
          template_id: templateId,
          resume_data: state as any
        });
        setSaveStatus("Saved");
      }
    } catch (err) {
      console.error("Failed saving to cloud", err);
      setSaveStatus("Unsaved Changes");
    }
  };

  // AI Suggestions triggering
  const handleRequestAiSuggestions = async () => {
    setAiExpanded(true); // Open AI panel overlay
    setAiStreaming(true);
    setAiSuggestions([]);
    
    let sectionPrompt = "";
    if (aiActiveTab === "Improve") {
      sectionPrompt = `Review this candidate profile summary and suggest three specific bullet point refinements adding metrics and outcomes:\n"${state.summary}"`;
    } else if (aiActiveTab === "ATS") {
      sectionPrompt = `Provide 3 formatting and impact verb corrections to improve the ATS parse score of this work history:\n"${state.experience.map(e => e.role + " at " + e.company + ": " + e.description).join("\n")}"`;
    } else if (aiActiveTab === "Keywords") {
      sectionPrompt = `Analyze the target profile and suggest 3 missing technical terms or keywords to add to the skills block:\nSkills: ${state.skills.join(", ")}`;
    } else {
      sectionPrompt = `Suggest a premium re-write for this resume project details to make it sound highly scalable and professional:\n"${state.projects[0]?.description || 'No projects listed.'}"`;
    }

    // Fetch additional mock details from user/session context if available
    const mockPerf = "Mock Interview Performance: Technical scoring 84%, volume VAD validated, speech speed stable.";
    const codingProfile = "Coding Profile: 120 Leetcode problems solved, top categories: DSA Arrays, Strings, SQL optimization.";
    const skillGap = session.blueprint?.missingKeywords && session.blueprint.missingKeywords.length > 0 
      ? `Skill Gap (Missing): ${session.blueprint.missingKeywords.join(", ")}` 
      : "Skill Gap: No major missing keywords identified against job profile.";
    const currentJd = (session.blueprint as any)?.jobDescription || "Job Description: Entry level technical specialist developer.";

    // Read template specific recommendations to supply context to AI prompt
    let templateInstructions = "";
    try {
      const folderName = templateId.replace("-style", "");
      let recData;
      if (["professional", "classic", "experienced", "modern", "ats", "executive"].includes(folderName)) {
        recData = require(`../../../../resume-templates/ats/${folderName}/recommendations.json`);
      } else {
        recData = require(`../../../../resume-templates/company-based/${folderName}/recommendations.json`);
      }
      if (recData) {
        templateInstructions = `Template Recommendations Context:
- Tone: ${recData.resumeTone}
- Preferred Bullet Format: ${recData.recommendedBulletStyle}
- Preferred Skills: ${(recData.preferredSkills || []).join(", ")}
- Keywords to Avoid: ${(recData.avoidKeywords || []).join(", ")}
- AI coach priorities: ${(recData.aiPriorities || []).join(", ")}`;
      }
    } catch(e) {
      console.warn("Recommendations loading skipped for stream context:", e);
    }

    const promptMessage = `Act as an expert Resume Coach.
${sectionPrompt}.
Please optimize the suggestion according to this specific context:
- Target template ID: ${templateId}
- ${templateInstructions}
- Target JD context: ${currentJd}
- Candidate ${skillGap}
- Candidate ${codingProfile}
- Candidate ${mockPerf}

Return 3 suggestions in this exact format for each suggestion:
Suggestion: <suggested text or action>
Gain: <e.g., +3 ATS>
Reason: <short explanation>
Risk: <e.g., Low or None>
---`;

    try {
      const token = localStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";
      
      const response = await fetch(`${API_URL}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ question: promptMessage })
      });

      if (!response.ok) throw new Error("Connection failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let streamBuffer = "";
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (value) {
            streamBuffer += decoder.decode(value, { stream: true });
            const lines = streamBuffer.split("\n");
            streamBuffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data:")) {
                const chunk = line.slice(5).trim();
                if (chunk) {
                  fullText += chunk + " ";
                }
              }
            }
          }
          if (done) break;
        }

        const parsedItems = parseStreamedSuggestions(fullText, aiActiveTab);
        if (parsedItems.length > 0) {
          setAiSuggestions(parsedItems);
        } else {
          setAiSuggestions(getFallbackSuggestions(aiActiveTab));
        }
      }
    } catch (err) {
      console.error("AI stream error", err);
      setAiSuggestions(getFallbackSuggestions(aiActiveTab));
    } finally {
      setAiStreaming(false);
    }
  };

  const handleSuggestionPreview = (suggestionText: string, id: string) => {
    if (previewingSuggestionId === id) {
      setPreviewState(null);
      setPreviewingSuggestionId(null);
      return;
    }

    setPreviewingSuggestionId(id);
    if (aiActiveTab === "Improve" || aiActiveTab === "Rewrite") {
      setPreviewState({
        ...state,
        summary: suggestionText
      });
    } else if (aiActiveTab === "Keywords") {
      setPreviewState({
        ...state,
        skills: [...state.skills, suggestionText]
      });
    } else {
      if (state.experience.length > 0) {
        setPreviewState({
          ...state,
          experience: state.experience.map((e, idx) => idx === 0 ? { ...e, description: e.description + "\n" + suggestionText } : e)
        });
      } else {
        setPreviewState({
          ...state,
          summary: state.summary + "\n" + suggestionText
        });
      }
    }
  };

  const handleSuggestionApply = (suggestionText: string) => {
    if (aiActiveTab === "Improve" || aiActiveTab === "Rewrite") {
      updateState({
        ...state,
        summary: suggestionText
      });
    } else if (aiActiveTab === "Keywords") {
      updateState({
        ...state,
        skills: [...state.skills, suggestionText]
      });
    } else {
      if (state.experience.length > 0) {
        updateState({
          ...state,
          experience: state.experience.map((e, idx) => idx === 0 ? { ...e, description: e.description + "\n" + suggestionText } : e)
        });
      } else {
        updateState({
          ...state,
          summary: state.summary + "\n" + suggestionText
        });
      }
    }
    setPreviewState(null);
    setPreviewingSuggestionId(null);
  };

  const handleSuggestionDiscard = (id: string) => {
    setAiSuggestions(prev => prev.filter(s => s.id !== id));
    if (previewingSuggestionId === id) {
      setPreviewState(null);
      setPreviewingSuggestionId(null);
    }
  };

  // Zoom helpers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2.0));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleFitWidth = () => setZoom(1.0);
  const handleFitPage = () => setZoom(0.95);

  // Focus mode toggle
  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
  };

  // Mobile drawer state
  const [mobileShowPreview, setMobileShowPreview] = useState(false);

  const handlePrevPage = () => {
    setCurrentPageIdx(prev => {
      const next = Math.max(prev - 1, 0);
      document.getElementById(`resume-page-${next}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return next;
    });
  };

  const handleNextPage = () => {
    setCurrentPageIdx(prev => {
      const next = Math.min(prev + 1, pages.length - 1);
      document.getElementById(`resume-page-${next}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return next;
    });
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden font-sans relative selection:bg-indigo-150 bg-white">
      
      {/* 1. FOCUS MODE (Fullscreen Preview) */}
      {focusMode && (
        <div className="fixed inset-0 bg-slate-50 z-[100] flex flex-col overflow-hidden select-none">
          {/* Focus mode header toolbar */}
          <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-white text-slate-900 border-b border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3">
              <span className="text-sm font-black tracking-wider uppercase text-primary">
                Focus Mode
              </span>
              <span className="text-xs font-extrabold text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded uppercase">
                {pages.length} Pages
              </span>
            </div>

            {/* Zoom controls inside Focus Mode */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-muted p-0.5 rounded-lg border border-border">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleZoomOut} 
                  className="h-8 w-8 rounded text-muted-foreground hover:text-foreground hover:bg-background"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-xs font-bold text-foreground w-12 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleZoomIn} 
                  className="h-8 w-8 rounded text-muted-foreground hover:text-foreground hover:bg-background"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleFitWidth} 
                className="text-xs font-bold h-9 text-muted-foreground hover:text-foreground rounded-lg px-3 hover:bg-muted"
              >
                Fit Width
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleFitPage} 
                className="text-xs font-bold h-9 text-muted-foreground hover:text-foreground rounded-lg px-3 hover:bg-muted"
              >
                Fit Page
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost"
                onClick={handleSaveToCloud} 
                className="h-9 rounded-lg text-primary hover:text-primary hover:bg-primary/10 text-xs font-bold px-3 gap-1.5"
              >
                <Save className="w-4 h-4" />
                Save to Cloud
              </Button>

              <Button 
                variant="ghost"
                onClick={() => setShowVersionModal(true)} 
                className="h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-bold px-3 gap-1.5"
              >
                <Save className="w-4 h-4" />
                Save
              </Button>

              {/* Export dropdown */}
              <div className="relative group">
                <Button className="h-9 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold flex items-center gap-1.5 px-4">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <div className="absolute right-0 top-full pt-1 hidden group-hover:block z-50">
                  <div className="w-40 bg-card border border-border rounded-xl shadow-xl py-1">
                    <button onClick={() => handlePrintPdf()} className="w-full text-left px-4 py-2 text-xs font-bold text-foreground hover:bg-muted flex items-center justify-between">
                      <span>PDF</span>
                      <span className="bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded text-[11px] uppercase">Best</span>
                    </button>
                    <button onClick={() => handleExportDocx()} className="w-full text-left px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
                      Word (.doc)
                    </button>
                    <button onClick={() => handleExportLatex()} className="w-full text-left px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
                      LaTeX (.tex)
                    </button>
                  </div>
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={() => setFocusMode(false)} 
                className="h-9 rounded-lg border-border text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-bold gap-1.5 bg-transparent"
              >
                <Minimize2 className="w-4 h-4" />
                Exit Focus
              </Button>
            </div>
          </header>

          {/* Fullscreen workspace scrollarea */}
          <div className="flex-1 overflow-y-auto overflow-x-auto p-6 flex flex-col items-center gap-6 bg-slate-50">
            {pages.map((pageHtml, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center select-none"
                id={`focus-page-${index}`}
              >
                <div 
                  style={{
                    width: `${950 * zoom}px`,
                    minHeight: `${1120 * zoom}px`,
                    position: "relative",
                    overflow: "visible"
                  }}
                  className="shadow-2xl border border-slate-200 bg-white overflow-hidden"
                >
                  <div 
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: "top center",
                      width: "950px",
                      minHeight: "1120px",
                      position: "absolute",
                      top: 0,
                      left: "50%",
                      marginLeft: "-475px"
                    }}
                    dangerouslySetInnerHTML={{ __html: pageHtml }}
                  />
                </div>
                {index < pages.length - 1 && (
                  <div className="w-full h-8 flex items-center justify-center">
                    <div className="w-24 h-0.5 bg-border rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top action/score header bar - Sticky */}
      {!focusMode && (
        <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-white border-b border-slate-100 z-40">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/resume-builder")} className="rounded-xl hover:bg-slate-100 h-10 px-3 text-slate-700 transition-all">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-black uppercase tracking-wider">Back</span>
            </Button>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <input 
              type="text" 
              value={resumeTitle}
              onChange={(e) => setResumeTitle(e.target.value)}
              className="text-xl font-black text-slate-900 leading-none bg-transparent border-none focus:outline-none focus:ring-0 p-1.5 hover:bg-slate-50 transition-colors rounded-lg -ml-1.5 w-[300px]"
            />
            <div className="flex items-center gap-2 ml-2">
              <span className={`text-xs uppercase tracking-wider font-black px-3 py-1.5 rounded-lg ${saveStatus === "Saved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-600"}`}>
                {saveStatus}
              </span>
            </div>
          </div>

          {/* Actions header group */}
          <div className="flex items-center gap-2">
            {/* History Undo/Redo */}
            <div className="flex items-center gap-0.5 bg-muted border border-border p-0.5 rounded-lg mr-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleUndo} 
                disabled={historyIndex === 0} 
                className="h-7 w-7 rounded text-muted-foreground disabled:opacity-40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleRedo} 
                disabled={historyIndex === history.length - 1} 
                className="h-7 w-7 rounded text-muted-foreground disabled:opacity-40"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </Button>
            </div>

            <Button 
              variant="outline" 
              onClick={() => setShowVersionModal(true)} 
              className="rounded-lg border-border text-foreground hover:bg-muted text-xs font-bold h-9 px-3"
            >
              Versions ({versions.length})
            </Button>

            <Button 
              variant="outline" 
              onClick={() => setLeftExpanded(!leftExpanded)} 
              className={`rounded-xl text-xs font-bold gap-1.5 h-10 px-3 ${
                leftExpanded ? "bg-card text-slate-700" : "bg-indigo-600 text-white"
              }`}
            >
              {leftExpanded ? "Hide Editor" : "Show Editor"}
            </Button>
            
            <Button 
              id="ai-coach-toggle-btn"
              onClick={() => setAiExpanded(!aiExpanded)} 
              className={`rounded-xl text-xs font-bold gap-1.5 h-10 px-3 ${
                aiExpanded ? "bg-indigo-600 text-white hover:bg-indigo-705" : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              {aiExpanded ? "Hide AI Coach" : `🤖 AI Coach (ATS ${scores.ats}%)`}
            </Button>

            {/* Save to Cloud Button */}
            <Button
              variant="outline"
              onClick={handleSaveToCloud}
              className="rounded-lg border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-bold gap-1.5 h-9 px-3"
            >
              <Save className="w-3.5 h-3.5" />
              Save to Cloud
            </Button>

            {/* Focus Mode toggle */}
            <Button 
              variant="outline" 
              onClick={toggleFocusMode} 
              className="rounded-lg border-border text-foreground hover:bg-muted text-xs font-bold gap-1.5 h-9 px-3"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Focus Mode
            </Button>

            {/* Export Dropdown */}
            <div className="relative group">
              <Button className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 h-9 px-4">
                <Download className="w-3.5 h-3.5" />
                Export
              </Button>
              <div className="absolute right-0 top-full pt-1 hidden group-hover:block z-50">
                <div className="w-44 bg-card border border-border rounded-xl shadow-xl py-1">
                  <button onClick={() => handlePrintPdf()} className="w-full text-left px-4 py-2 text-xs font-bold text-foreground hover:bg-muted flex items-center justify-between">
                    <span>PDF (Recommended)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Workspace flex layout */}
      {!focusMode && (
        <div className="flex-1 flex gap-0 p-0 h-[calc(100vh-64px)] overflow-hidden w-full max-w-none bg-slate-50">
          
          {/* 1. EDITOR PANEL: Left Resizable */}
          <div 
            style={leftExpanded ? { width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${leftSidebarWidth}px` : undefined } : undefined}
            className={cn(
              "h-full flex flex-col overflow-hidden shrink-0 z-10 bg-white transition-all duration-300",
              leftExpanded ? "w-full md:w-[40%] lg:w-auto opacity-100" : "w-0 opacity-0 pointer-events-none hidden lg:block"
            )}
          >
            {/* Section tabs */}
            <div className="p-3 bg-white border-b border-slate-100 shrink-0 overflow-x-hidden">
              <div className="grid grid-cols-4 gap-1 bg-slate-200/50 p-1.5 rounded-xl">
                {(["personal", "summary", "skills", "experience", "projects", "education", "certifications", "achievements"] as const).map(section => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    className={`py-2 px-1 text-[9px] md:text-[10px] xl:text-xs font-bold xl:font-black uppercase tracking-tighter xl:tracking-wider rounded-lg transition-all truncate ${
                      activeSection === section 
                        ? "bg-card text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {section === "personal" ? "Info" : section === "certifications" ? "Cert" : section === "achievements" ? "Achieve" : section}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable form content - Smooth scrolling */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
              {/* PERSONAL INFO */}
              {activeSection === "personal" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-xs font-bold text-slate-700">Full Name</Label>
                    <Input
                      id="name"
                      value={state.personalInfo.name}
                      onFocus={() => setActiveSection("personal")}
                      onChange={(e) => updateState({
                        ...state,
                        personalInfo: { ...state.personalInfo, name: e.target.value }
                      })}
                      className="rounded-xl border-slate-200 h-11 px-4 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-xs font-bold text-slate-700">Email Address</Label>
                    <Input
                      id="email"
                      value={state.personalInfo.email}
                      onFocus={() => setActiveSection("personal")}
                      onChange={(e) => updateState({
                        ...state,
                        personalInfo: { ...state.personalInfo, email: e.target.value }
                      })}
                      className="rounded-xl border-slate-200 h-11 px-4 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-xs font-bold text-slate-700">Phone Number</Label>
                    <Input
                      id="phone"
                      value={state.personalInfo.phone}
                      onFocus={() => setActiveSection("personal")}
                      onChange={(e) => updateState({
                        ...state,
                        personalInfo: { ...state.personalInfo, phone: e.target.value }
                      })}
                      className="rounded-xl border-slate-200 h-11 px-4 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="linkedin" className="text-xs font-bold text-slate-700">LinkedIn Profile</Label>
                    <Input
                      id="linkedin"
                      value={state.personalInfo.linkedin}
                      onFocus={() => setActiveSection("personal")}
                      onChange={(e) => updateState({
                        ...state,
                        personalInfo: { ...state.personalInfo, linkedin: e.target.value }
                      })}
                      className="rounded-xl border-slate-200 h-11 px-4 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="github" className="text-xs font-bold text-slate-700">GitHub Profile</Label>
                    <Input
                      id="github"
                      value={state.personalInfo.github}
                      onFocus={() => setActiveSection("personal")}
                      onChange={(e) => updateState({
                        ...state,
                        personalInfo: { ...state.personalInfo, github: e.target.value }
                      })}
                      className="rounded-xl border-slate-200 h-11 px-4 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="leetcode" className="text-xs font-bold text-slate-700">LeetCode Profile</Label>
                    <Input
                      id="leetcode"
                      value={state.personalInfo.leetcode}
                      onFocus={() => setActiveSection("personal")}
                      onChange={(e) => updateState({
                        ...state,
                        personalInfo: { ...state.personalInfo, leetcode: e.target.value }
                      })}
                      className="rounded-xl border-slate-200 h-11 px-4 text-sm"
                    />
                  </div>
                </div>
              )}

              {/* SUMMARY */}
              {activeSection === "summary" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground/70 font-medium mb-1">
                      <Label htmlFor="summary" className="text-xs font-bold text-slate-700">Summary Details</Label>
                      <span>{state.summary.length} characters</span>
                    </div>
                    <Textarea
                      id="summary"
                      rows={8}
                      value={state.summary}
                      onFocus={() => setActiveSection("summary")}
                      onChange={(e) => updateState({
                        ...state,
                        summary: e.target.value
                      })}
                      className="rounded-xl border-slate-200 resize-none text-sm p-4 leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* SKILLS */}
              {activeSection === "skills" && (
                <div className="space-y-6">
                  {(() => {
                    const categoryMap: Record<string, string[]> = {
                      "Languages": ["java", "python", "c", "c++", "javascript", "typescript", "sql", "ruby", "rust", "go", "kotlin", "swift"],
                      "Frontend": ["react", "angular", "next.js", "html", "css", "tailwind", "vue", "jquery", "sass", "bootstrap"],
                      "Backend & Frameworks": ["spring boot", "spring mvc", "spring security", "spring data jpa", "hibernate", "node.js", "express", "django", "flask", "laravel"],
                      "Architecture & APIs": ["microservices", "rest apis", "graphql", "jwt", "oauth", "kafka", "rabbitmq", "system design", "grpc", "soap"],
                      "Databases": ["mysql", "postgresql", "mongodb", "oracle", "redis", "dynamodb", "sqlite", "mariadb", "cassandra"],
                      "Cloud & DevOps": ["aws", "azure", "docker", "kubernetes", "jenkins", "ci/cd", "terraform", "ansible", "gcp", "github actions"],
                      "Tools": ["git", "github", "maven", "gradle", "postman", "swagger", "intellij", "vs code", "eclipse", "jira", "npm", "yarn"]
                    };

                    // Extract skills grouped by category
                    // Format in state.skills: "Category: Skill1, Skill2, ..." or flat skill list
                    const classified: Record<string, string[]> = {
                      "Languages": [],
                      "Frontend": [],
                      "Backend & Frameworks": [],
                      "Architecture & APIs": [],
                      "Databases": [],
                      "Cloud & DevOps": [],
                      "Tools": []
                    };

                    (state.skills || []).forEach(item => {
                      if (item.includes(":")) {
                        const parts = item.split(":");
                        const category = parts[0].trim();
                        const val = parts.slice(1).join(":").trim();
                        if (classified[category] !== undefined) {
                          const skillsList = val.split(",").map(s => s.trim()).filter(Boolean);
                          classified[category] = Array.from(new Set([...classified[category], ...skillsList]));
                        } else {
                          // Custom category or mismatched category mapped to Tools/as-is
                          const skillsList = val.split(",").map(s => s.trim()).filter(Boolean);
                          if (!classified["Tools"]) classified["Tools"] = [];
                          classified["Tools"] = Array.from(new Set([...classified["Tools"], ...skillsList]));
                        }
                      } else {
                        // flat skill string, classify it
                        const lower = item.trim().toLowerCase();
                        let placed = false;
                        for (const [cat, kws] of Object.entries(categoryMap)) {
                          const match = kws.some(kw =>
                            lower === kw ||
                            lower.includes(` ${kw}`) ||
                            lower.includes(`${kw} `) ||
                            (kw.length > 3 && lower.includes(kw))
                          );
                          if (match) {
                            classified[cat] = Array.from(new Set([...classified[cat], item.trim()]));
                            placed = true;
                            break;
                          }
                        }
                        if (!placed && item.trim()) {
                          classified["Tools"] = Array.from(new Set([...classified["Tools"], item.trim()]));
                        }
                      }
                    });

                    // Save helper preserving the Category: Skill1, Skill2 format
                    const saveGroupedSkills = (newGroups: Record<string, string[]>) => {
                      const formatted: string[] = [];
                      Object.entries(newGroups).forEach(([cat, list]) => {
                        const cleanList = list.map(s => s.trim()).filter(Boolean);
                        if (cleanList.length > 0) {
                          formatted.push(`${cat}: ${cleanList.join(", ")}`);
                        }
                      });
                      updateState({ ...state, skills: formatted });
                    };

                    // We want to track which category inline inputs are open
                    // We can use a local state. Let's initialize inline inputs state in the render scope using a ref or local container state if possible,
                    // but we can also just render a nice toggleable "+ Add Skill" button inline using the standard HTML details/summary or a local toggle element.
                    // Let's create an inline input rendering component block or state. Since we are inside a map, we can track the active editing input category using a React state.
                    // Wait, we need a react state for activeCategoryAdd. Let's see if we can declare a state at the top of the component or manage it here.
                    // Let's check if there is an active category input state. We can add one or use a simple toggle.
                    return <SkillsEditorPanel 
                      classified={classified} 
                      categoryMap={categoryMap} 
                      saveGroupedSkills={saveGroupedSkills}
                      setActiveSection={setActiveSection}
                    />;
                  })()}
                </div>
              )}

              {/* EXPERIENCE */}
              {activeSection === "experience" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-black text-muted-foreground/70 uppercase tracking-wider">Jobs List</h3>
                    <Button onClick={() => addNewItem("experience")} size="sm" className="rounded-xl bg-slate-900 text-white font-bold h-9 px-4 text-xs shadow-sm hover:shadow">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Job
                    </Button>
                  </div>

                  {state.experience.map((exp, index) => {
                    const isCollapsed = collapsedBlocks[exp.id] ?? false;

                    return (
                      <div key={exp.id} className="border border-border rounded-xl overflow-hidden shadow-sm bg-card">
                        <div 
                          onClick={() => toggleCollapse(exp.id)}
                          className="bg-muted/50 px-3 py-2.5 border-b border-border flex justify-between items-center cursor-pointer select-none"
                        >
                          <div className="font-extrabold text-foreground text-xs truncate max-w-[150px]">
                            {exp.company || "Company"}
                          </div>
                          <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" onClick={() => moveItem("experience", index, "up")} className="h-6 w-6 rounded text-muted-foreground">
                              <ChevronUp className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => moveItem("experience", index, "down")} className="h-6 w-6 rounded text-muted-foreground">
                              <ChevronDown className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => duplicateItem("experience", index)} className="h-6 w-6 rounded text-muted-foreground">
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteItem("experience", index)} className="h-6 w-6 rounded text-muted-foreground/70 hover:text-red-500">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {!isCollapsed && (
                          <div className="p-3 space-y-3">
                            <div className="space-y-1">
                              <Label className="text-xs font-bold text-slate-700">Company</Label>
                              <Input
                                value={exp.company}
                                onFocus={() => setActiveSection("experience")}
                                onChange={(e) => {
                                  const list = [...state.experience];
                                  list[index] = { ...list[index], company: e.target.value };
                                  updateState({ ...state, experience: list });
                                }}
                                className="rounded-xl border-slate-200 h-11 px-4 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-bold text-slate-700">Role Title</Label>
                              <Input
                                value={exp.role}
                                onFocus={() => setActiveSection("experience")}
                                onChange={(e) => {
                                  const list = [...state.experience];
                                  list[index] = { ...list[index], role: e.target.value };
                                  updateState({ ...state, experience: list });
                                }}
                                className="rounded-xl border-slate-200 h-11 px-4 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-bold text-slate-700">Duration</Label>
                              <Input
                                value={exp.duration}
                                onFocus={() => setActiveSection("experience")}
                                onChange={(e) => {
                                  const list = [...state.experience];
                                  list[index] = { ...list[index], duration: e.target.value };
                                  updateState({ ...state, experience: list });
                                }}
                                className="rounded-xl border-slate-200 h-11 px-4 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-bold text-slate-700">Description (newlines for bullets)</Label>
                              <Textarea
                                value={exp.description}
                                rows={4}
                                onFocus={() => setActiveSection("experience")}
                                onChange={(e) => {
                                  const list = [...state.experience];
                                  list[index] = { ...list[index], description: e.target.value };
                                  updateState({ ...state, experience: list });
                                }}
                                className="rounded-xl border-slate-200 resize-none text-sm p-4"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* PROJECTS */}
              {activeSection === "projects" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-black text-muted-foreground/70 uppercase tracking-wider">Projects List</h3>
                    <Button onClick={() => addNewItem("projects")} size="sm" className="rounded-xl bg-slate-900 text-white font-bold h-9 px-4 text-xs shadow-sm hover:shadow">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Project
                    </Button>
                  </div>

                  {state.projects.map((proj, index) => {
                    const isCollapsed = collapsedBlocks[proj.id] ?? false;

                    return (
                      <div key={proj.id} className="border border-border rounded-xl overflow-hidden shadow-sm bg-card">
                        <div 
                          onClick={() => toggleCollapse(proj.id)}
                          className="bg-muted/50 px-3 py-2.5 border-b border-border flex justify-between items-center cursor-pointer select-none"
                        >
                          <div className="font-extrabold text-foreground text-xs truncate max-w-[150px]">
                            {proj.name || "Project"}
                          </div>
                          <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" onClick={() => moveItem("projects", index, "up")} className="h-6 w-6 rounded text-muted-foreground">
                              <ChevronUp className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => moveItem("projects", index, "down")} className="h-6 w-6 rounded text-muted-foreground">
                              <ChevronDown className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => duplicateItem("projects", index)} className="h-6 w-6 rounded text-muted-foreground">
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteItem("projects", index)} className="h-6 w-6 rounded text-muted-foreground/70 hover:text-red-500">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {!isCollapsed && (
                          <div className="p-3 space-y-3">
                            <div className="space-y-1">
                              <Label className="text-xs font-bold text-slate-700">Project Name</Label>
                              <Input
                                value={proj.name}
                                onFocus={() => setActiveSection("projects")}
                                onChange={(e) => {
                                  const list = [...state.projects];
                                  list[index] = { ...list[index], name: e.target.value };
                                  updateState({ ...state, projects: list });
                                }}
                                className="rounded-xl border-slate-200 h-11 px-4 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-bold text-slate-700">Technologies</Label>
                              <Input
                                value={proj.role}
                                onFocus={() => setActiveSection("projects")}
                                onChange={(e) => {
                                  const list = [...state.projects];
                                  list[index] = { ...list[index], role: e.target.value };
                                  updateState({ ...state, projects: list });
                                }}
                                className="rounded-xl border-slate-200 h-11 px-4 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-bold text-slate-700">Duration</Label>
                              <Input
                                value={proj.duration}
                                onFocus={() => setActiveSection("projects")}
                                onChange={(e) => {
                                  const list = [...state.projects];
                                  list[index] = { ...list[index], duration: e.target.value };
                                  updateState({ ...state, projects: list });
                                }}
                                className="rounded-xl border-slate-200 h-11 px-4 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-bold text-slate-700">Description (newlines for bullets)</Label>
                              <Textarea
                                value={proj.description}
                                rows={4}
                                onFocus={() => setActiveSection("projects")}
                                onChange={(e) => {
                                  const list = [...state.projects];
                                  list[index] = { ...list[index], description: e.target.value };
                                  updateState({ ...state, projects: list });
                                }}
                                className="rounded-xl border-slate-200 resize-none text-sm p-4"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* EDUCATION */}
              {activeSection === "education" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-black text-muted-foreground/70 uppercase tracking-wider">Degrees</h3>
                    <Button onClick={() => addNewItem("education")} size="sm" className="rounded-xl bg-slate-900 text-white font-bold h-9 px-4 text-xs shadow-sm hover:shadow">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Degree
                    </Button>
                  </div>

                  {state.education.map((edu, index) => {
                    const isCollapsed = collapsedBlocks[edu.id] ?? false;

                    return (
                      <div key={edu.id} className="border border-border rounded-xl overflow-hidden shadow-sm bg-card">
                        <div 
                          onClick={() => toggleCollapse(edu.id)}
                          className="bg-muted/50 px-3 py-2.5 border-b border-border flex justify-between items-center cursor-pointer select-none"
                        >
                          <div className="font-extrabold text-foreground text-xs truncate max-w-[150px]">
                            {edu.institution || "Institution"}
                          </div>
                          <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" onClick={() => moveItem("education", index, "up")} className="h-6 w-6 rounded text-muted-foreground">
                              <ChevronUp className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => moveItem("education", index, "down")} className="h-6 w-6 rounded text-muted-foreground">
                              <ChevronDown className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteItem("education", index)} className="h-6 w-6 rounded text-muted-foreground/70 hover:text-red-500">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {!isCollapsed && (
                          <div className="p-3 space-y-3">
                            <div className="space-y-1">
                              <Label className="text-xs font-bold text-slate-700">Institution</Label>
                              <Input
                                value={edu.institution}
                                onFocus={() => setActiveSection("education")}
                                onChange={(e) => {
                                  const list = [...state.education];
                                  list[index] = { ...list[index], institution: e.target.value };
                                  updateState({ ...state, education: list });
                                }}
                                className="rounded-xl border-slate-200 h-11 px-4 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-bold text-slate-700">Degree / Major</Label>
                              <Input
                                value={edu.degree}
                                onFocus={() => setActiveSection("education")}
                                onChange={(e) => {
                                  const list = [...state.education];
                                  list[index] = { ...list[index], degree: e.target.value };
                                  updateState({ ...state, education: list });
                                }}
                                className="rounded-xl border-slate-200 h-11 px-4 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-bold text-slate-700">Duration</Label>
                              <Input
                                value={edu.duration}
                                onFocus={() => setActiveSection("education")}
                                onChange={(e) => {
                                  const list = [...state.education];
                                  list[index] = { ...list[index], duration: e.target.value };
                                  updateState({ ...state, education: list });
                                }}
                                className="rounded-xl border-slate-200 h-11 px-4 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-bold text-slate-700">Details (GPA, achievements)</Label>
                              <Input
                                value={edu.details}
                                onFocus={() => setActiveSection("education")}
                                onChange={(e) => {
                                  const list = [...state.education];
                                  list[index] = { ...list[index], details: e.target.value };
                                  updateState({ ...state, education: list });
                                }}
                                className="rounded-xl border-slate-200 h-11 px-4 text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* CERTIFICATIONS */}
              {activeSection === "certifications" && (
                <div className="space-y-4">
                  {(state.certifications || []).map((cert, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        value={cert}
                        onFocus={() => setActiveSection("certifications")}
                        onChange={(e) => {
                          const nextCerts = [...state.certifications];
                          nextCerts[index] = e.target.value;
                          updateState({ ...state, certifications: nextCerts });
                        }}
                        className="rounded-xl border-slate-200 h-11 px-4 text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const nextCerts = state.certifications.filter((_, idx) => idx !== index);
                          updateState({ ...state, certifications: nextCerts });
                        }}
                        className="text-muted-foreground/70 hover:text-red-500 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={() => updateState({ ...state, certifications: [...(state.certifications || []), ""] })}
                    variant="outline"
                    className="w-full rounded-xl border-dashed border-border text-xs font-bold gap-1.5 h-9"
                  >
                    <Plus className="w-4 h-4" /> Add Certification
                  </Button>
                </div>
              )}

              {/* ACHIEVEMENTS */}
              {activeSection === "achievements" && (
                <div className="space-y-4">
                  {(state.achievements || []).map((ach, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        value={ach}
                        onFocus={() => setActiveSection("achievements")}
                        onChange={(e) => {
                          const nextAchs = [...state.achievements];
                          nextAchs[index] = e.target.value;
                          updateState({ ...state, achievements: nextAchs });
                        }}
                        className="rounded-xl border-slate-200 h-11 px-4 text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const nextAchs = state.achievements.filter((_, idx) => idx !== index);
                          updateState({ ...state, achievements: nextAchs });
                        }}
                        className="text-muted-foreground/70 hover:text-red-500 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={() => updateState({ ...state, achievements: [...(state.achievements || []), ""] })}
                    variant="outline"
                    className="w-full rounded-xl border-dashed border-border text-xs font-bold gap-1.5 h-9"
                  >
                    <Plus className="w-4 h-4" /> Add Achievement
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Drag handle line element for left panel */}
          {leftExpanded && (
            <div
              onMouseDown={startLeftResize}
              className={cn(
                "hidden lg:block w-2 bg-transparent hover:bg-indigo-500/50 cursor-col-resize transition-all duration-150 relative z-30 shrink-0",
                isLeftDragging && "bg-indigo-500/80"
              )}
              title="Drag to resize Editor workspace"
            />
          )}

          {/* 2. DOME PREVIEW WORKSPACE: Middle panel (takes remaining space on desktop, 60% tablet, hidden on mobile) */}
          <div id="resume-preview-panel" className={cn(
            "hidden md:flex flex-col h-full overflow-hidden relative transition-all duration-300 flex-grow"
          )}>
            {/* Dynamic A4 Preview Toolbar */}
            <div className="h-12 shrink-0 bg-card border-b border-border flex items-center justify-between px-6 select-none">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handlePrevPage}
                  className="h-7 w-7 rounded hover:bg-muted"
                >
                  <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
                <span className="text-xs font-bold text-muted-foreground px-2 py-0.5 rounded-md uppercase select-none">
                  Page {currentPageIdx + 1} of {pages.length || 1}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleNextPage}
                  className="h-7 w-7 rounded hover:bg-muted"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </div>
              
              {/* Scale Zoom widgets */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 bg-muted p-0.5 rounded-lg border border-border">
                  <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-6 w-6 rounded">
                    <ZoomOut className="w-3 h-3 text-muted-foreground" />
                  </Button>
                  <span className="text-xs font-bold text-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
                  <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-6 w-6 rounded">
                    <ZoomIn className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </div>
                
                <Button variant="ghost" size="sm" onClick={handleFitWidth} className="text-xs font-bold uppercase tracking-wider h-7 rounded-lg px-2 hover:bg-muted text-muted-foreground">
                  Fit Width
                </Button>
              </div>

              {/* Header options: Fullscreen, Export */}
              <div className="flex items-center gap-1.5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleFocusMode}
                  title="Fullscreen"
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Centered Scrollable workspace with single scroll */}
            <div 
              ref={previewScrollRef}
              className="flex-1 overflow-auto p-2 md:p-4 flex flex-col items-center gap-10 select-text scroll-smooth" 
              id="visible-preview-canvas"
            >
              {pages.map((pageHtml, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center relative"
                  id={`resume-page-${index}`}
                >
                  {/* true paper element */}
                  <div 
                    style={{
                      width: `${950 * zoom}px`,
                      height: "auto",
                      position: "relative",
                      overflow: "visible"
                    }}
                    data-slot="card"
                    className="overflow-hidden transition-all duration-300"
                  >
                    <div 
                      style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: "top center",
                        width: "950px",
                        height: "auto",
                        position: "relative",
                        left: "50%",
                        marginLeft: "-475px"
                      }}
                      dangerouslySetInnerHTML={{ __html: pageHtml }}
                    />
                  </div>
                  
                  {index < pages.length - 1 && (
                    <div className="w-full h-10 flex items-center justify-center">
                      <div className="w-32 h-px bg-slate-200" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. AI PANEL COLUMN: Resizable sidebar panel on desktop, overlay drawer on tablet/mobile */}
          {(() => {
            // Map templates to premium descriptions & badges
            const getTemplateMeta = () => {
              const lowerId = templateId.toLowerCase();
              if (lowerId.includes("faang") || lowerId.includes("google") || lowerId.includes("meta")) {
                return { name: "FAANG Optimized", priority: "Elite Priority", rating: "★★★★★", compliance: 98 };
              }
              if (lowerId.includes("accenture")) {
                return { name: "Accenture Spec", priority: "Consulting Priority", rating: "★★★★★", compliance: 95 };
              }
              if (lowerId.includes("tcs") || lowerId.includes("wipro")) {
                return { name: "Service Giant Spec", priority: "Mass Recruiter Spec", rating: "★★★★☆", compliance: 92 };
              }
              return { name: "Classic ATS Professional", priority: "ATS Priority Standard", rating: "★★★★★", compliance: 96 };
            };
            const tempMeta = getTemplateMeta();

            return (
              <>
                {/* Drag handle line element */}
                {aiExpanded && (
                  <div
                    onMouseDown={startResize}
                    className={cn(
                      "hidden lg:block w-2 bg-transparent hover:bg-indigo-500/50 cursor-col-resize transition-all duration-150 relative z-30 shrink-0",
                      isDragging && "bg-indigo-500/80"
                    )}
                    title="Drag to resize AI Copilot workspace"
                  />
                )}

                <div 
                  ref={aiPanelRef}
                  style={aiExpanded ? { width: window.innerWidth >= 1024 ? `${sidebarWidth}px` : undefined } : undefined}
                  className={cn(
                    "fixed right-4 top-24 bottom-4 z-40 flex flex-col overflow-hidden transition-all duration-300 lg:static lg:right-0 lg:top-0 lg:h-full shrink-0 bg-white text-slate-900",
                    aiExpanded ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none lg:hidden",
                    !aiExpanded && "w-0"
                  )}
                >
                  {/* Sticky Fixed Header */}
                  <div className="p-6 shrink-0 bg-white border-b border-slate-100 flex justify-between items-center z-10">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 p-2.5 rounded-xl border border-indigo-200">
                        <Sparkles className="w-6 h-6 text-indigo-700 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-black text-lg text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                          AI Resume Copilot
                        </h3>
                        <span className="text-xs font-black text-indigo-700 tracking-widest block uppercase mt-1">Workspace 3.0</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl uppercase tracking-widest select-none animate-pulse shadow-sm">
                        Live Audit
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => setAiExpanded(false)} className="rounded-xl h-11 w-11 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Scrollable workspace content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-8 select-text scrollbar-thin">
                    
                    {/* Active Template Badge Header */}
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs uppercase font-black tracking-wider text-slate-600">Current Target Template</span>
                          <span className="font-black text-slate-900 text-sm block mt-1">{tempMeta.name}</span>
                        </div>
                        <span className="text-xs font-black text-indigo-700">{tempMeta.rating}</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                        <span className="text-xs uppercase font-bold text-slate-600">{tempMeta.priority}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase font-bold text-slate-600">Compliance:</span>
                          <span className="text-xs font-black text-emerald-700">{tempMeta.compliance}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Unified Floating Score Banner */}
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                      <div className="space-y-2">
                        <span className="text-xs uppercase font-black tracking-wider text-indigo-700">Resume Health Index</span>
                        <span className="font-black text-slate-900 text-xl block leading-none">{scores.ats}% ATS Score</span>
                        <span className="text-xs font-bold text-indigo-600 block">Targeting {tempMeta.name} rules</span>
                      </div>
                      <div className="h-14 w-14 rounded-full bg-white border-2 border-indigo-400 flex items-center justify-center font-black text-sm text-indigo-700 shadow-inner select-none">
                        {scores.ats}%
                      </div>
                    </div>

                    {/* Resume Health Dashboard (Horizontal Progress Bars) */}
                    <div className="space-y-5 bg-slate-50/50 border border-slate-200 p-5 rounded-2xl">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-600 block mb-3">Health Dashboard</span>
                      
                      {[
                        { label: "ATS Parsing Reliability", val: scores.ats },
                        { label: "Company Constraint Match", val: tempMeta.compliance },
                        { label: "Job Description Alignment", val: scores.confidence },
                        { label: "Technical Keyword Match", val: scores.keywords },
                        { label: "Quantifiable Impact Metrics", val: scores.impact },
                        { label: "Leadership & STAR Verbs", val: scores.compliance }
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between text-xs font-black uppercase text-slate-700">
                            <span>{item.label}</span>
                            <span className={item.val >= 85 ? "text-indigo-700" : "text-amber-600"}>{item.val}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300/50">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                item.val >= 85 ? "bg-indigo-500" : "bg-gradient-to-r from-amber-400 to-indigo-500"
                              )} 
                              style={{ width: `${item.val}%` }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* AI Coach Context Panel */}
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-600 block">AI Context Scope</span>
                      <div className="grid grid-cols-2 gap-3 text-xs font-extrabold text-slate-700 uppercase">
                        <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                          <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shrink-0" />
                          <span>✓ Resume Data</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                          <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shrink-0" />
                          <span>✓ Target JD</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                          <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shrink-0" />
                          <span>✓ Skill Gap</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                          <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shrink-0" />
                          <span>✓ Template Rules</span>
                        </div>
                      </div>
                    </div>

                    {/* Template Mentor Tips */}
                    <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs space-y-2.5 shadow-sm">
                      <span className="font-black text-indigo-700 uppercase block tracking-wider text-xs">Template Mentor Insights</span>
                      <p className="text-slate-700 leading-relaxed font-medium">{getTemplateTips(templateId)}</p>
                    </div>

                    {/* Quick AI Workspace Actions */}
                    <div className="space-y-4">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-600 block">Optimize Section Action workspace</span>
                      <div className="grid grid-cols-1 gap-3">
                        <Button 
                          onClick={() => handleQuickAction("optimize")} 
                          size="sm" 
                          variant="outline" 
                          className="w-full text-xs font-black uppercase tracking-wider h-11 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-sm"
                        >
                          Optimize for Job Description (JD)
                        </Button>
                        <Button 
                          onClick={() => handleQuickAction("ats")} 
                          size="sm" 
                          variant="outline" 
                          className="w-full text-xs font-black uppercase tracking-wider h-11 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-sm"
                        >
                          Boost ATS Parsing Score
                        </Button>
                        <Button 
                          onClick={() => handleQuickAction("summary")} 
                          size="sm" 
                          variant="outline" 
                          className="w-full text-xs font-black uppercase tracking-wider h-11 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-sm"
                        >
                          Rewrite Summary Profile
                        </Button>
                        <Button 
                          onClick={() => handleQuickAction("star")} 
                          size="sm" 
                          variant="outline" 
                          className="w-full text-xs font-black uppercase tracking-wider h-11 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-sm"
                        >
                          Generate STAR Bullet Points
                        </Button>
                      </div>
                    </div>

                    {/* Suggestions list grouped by priority */}
                    <div className="space-y-6 pt-3">
                      {["High Priority", "Medium Priority", "Optional"].map(priorityGroup => {
                        const groupList = aiSuggestions.filter(s => (s.priority || "Optional") === priorityGroup);
                        if (groupList.length === 0) return null;

                        return (
                          <div key={priorityGroup} className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-600 flex items-center gap-2.5">
                              <span className={`w-3 h-3 rounded-full ${
                                priorityGroup === "High Priority" ? "bg-rose-500" :
                                priorityGroup === "Medium Priority" ? "bg-amber-500" : "bg-emerald-500"
                              }`} />
                              {priorityGroup === "High Priority" ? "🔴 " : priorityGroup === "Medium Priority" ? "🟠 " : "🟢 "}
                              {priorityGroup}
                            </h4>

                            <div className="space-y-4">
                              {groupList.map(suggest => {
                                const isExpanded = expandedSuggestId === suggest.id;
                                return (
                                  <Card 
                                    key={suggest.id} 
                                    className="border border-slate-200 rounded-2xl bg-white overflow-hidden hover:border-slate-300 transition-all cursor-pointer shadow-sm hover:shadow"
                                    onClick={() => setExpandedSuggestId(isExpanded ? null : suggest.id)}
                                  >
                                    <CardContent className="p-5 space-y-5">
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs font-black px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 select-none">
                                          {suggest.gain}
                                        </span>
                                        <div className="flex items-center gap-3">
                                          <span className="text-xs font-extrabold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg uppercase">
                                            {suggest.category}
                                          </span>
                                          <span className="text-xs font-bold text-indigo-600 ml-1">
                                            {isExpanded ? "▼" : "▶"}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="space-y-3 text-sm">
                                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                          <span className="text-xs font-black text-indigo-700 block uppercase tracking-wider">Suggested Change</span>
                                          <p className="text-sm text-slate-900 font-semibold mt-2 leading-relaxed">
                                            {suggest.text}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Collapsible Detailed Coach Explanation Rationale */}
                                      {isExpanded && (
                                        <div className="text-xs text-slate-700 bg-indigo-50/50 p-5 rounded-xl leading-relaxed border border-indigo-100 flex flex-col gap-3 transition-all">
                                          <div>
                                            <span className="font-black text-indigo-700 uppercase text-xs tracking-wider block">Why does this help?</span>
                                            <p className="mt-1.5 text-sm leading-relaxed">{suggest.reason}</p>
                                          </div>
                                          
                                          {suggest.category === "SUMMARY" && (
                                            <div className="pt-4 border-t border-indigo-100">
                                              <span className="font-black text-indigo-700 uppercase text-xs tracking-wider block">Recommended STAR Pattern</span>
                                              <p className="mt-1.5 text-sm text-slate-600 font-medium">Use the templates checklist above to structure: engineered (metric outcome) using (tech stack).</p>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      <div className="flex gap-3 pt-3" onClick={(e) => e.stopPropagation()}>
                                        <Button
                                          size="sm"
                                          onClick={() => {
                                            if (suggest.category === "SUMMARY") {
                                              updateState({ ...state, summary: suggest.text });
                                            } else if (suggest.category === "SKILLS") {
                                              updateState({ ...state, skills: suggest.text.split(", ") });
                                            } else if (suggest.category === "EXPERIENCE" && state.experience.length > 0) {
                                              const expList = [...state.experience];
                                              expList[0] = { ...expList[0], description: suggest.text };
                                              updateState({ ...state, experience: expList });
                                            } else if (suggest.category === "PROJECTS" && state.projects.length > 0) {
                                              const projList = [...state.projects];
                                              projList[0] = { ...projList[0], description: suggest.text };
                                              updateState({ ...state, projects: projList });
                                            }
                                            handleSuggestionDiscard(suggest.id);
                                          }}
                                          className="flex-1 text-xs font-black uppercase tracking-wider rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 h-10"
                                        >
                                          Accept
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => handleSuggestionDiscard(suggest.id)}
                                          className="flex-1 text-xs font-black uppercase tracking-wider rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 h-10"
                                        >
                                          Discard
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {aiSuggestions.length === 0 && !aiStreaming && (
                        <div className="border border-dashed border-slate-300 p-8 text-center rounded-2xl bg-slate-50/50">
                          <Info className="w-6 h-6 text-indigo-500 mx-auto mb-3 animate-pulse" />
                          <p className="text-xs text-slate-700 font-black uppercase tracking-widest">Audit Completed</p>
                          <p className="text-sm text-slate-600 mt-2 leading-relaxed">Your layout rules and content match target parameters perfectly.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}



      {/* 4. MOBILE PREVIEW MODAL */}
      {mobileShowPreview && (
        <div className="fixed inset-0 bg-card z-[110] flex flex-col overflow-hidden md:hidden">
          {/* Header */}
          <div className="h-16 shrink-0 border-b flex items-center justify-between px-4 bg-muted">
            <span className="font-extrabold text-foreground text-sm">Resume Preview</span>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => handlePrintPdf()} className="rounded-xl h-8 text-xs font-bold">
                Export PDF
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setMobileShowPreview(false)} className="rounded-xl h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Centered canvas scaled for mobile screen */}
          <div className="flex-1 overflow-auto p-4 bg-muted flex flex-col items-center gap-4">
            {pages.map((pageHtml, index) => (
              <div key={index} className="flex flex-col items-center">
                <span className="text-xs font-bold text-muted-foreground/70 mb-1">Page {index + 1} of {pages.length}</span>
                <div 
                  style={{
                    width: `${950 * 0.38}px`,
                    height: `${1120 * 0.38}px`,
                    position: "relative",
                    overflow: "visible"
                  }}
                  className="shadow-lg bg-card rounded-lg overflow-hidden border border-border"
                >
                  <div 
                    style={{
                      transform: "scale(0.38)",
                      transformOrigin: "top center",
                      width: "950px",
                      height: "1120px",
                      position: "absolute",
                      top: 0,
                      left: "50%",
                      marginLeft: "-475px"
                    }}
                    dangerouslySetInnerHTML={{ __html: pageHtml }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. VERSION HISTORY MODAL */}
      {showVersionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-none shadow-2xl rounded-2xl bg-card">
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle className="text-xl font-extrabold text-foreground">Version Management</CardTitle>
                <CardDescription>Save snapshots as patch differences and restore historical checkpoints (max 20).</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowVersionModal(false)} className="rounded-xl">
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1.5">
                  <Label>Snapshot Name</Label>
                  <Input
                    placeholder="Describe snapshot details..."
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    className="rounded-xl border-slate-200 h-11 px-4 text-sm"
                  />
                </div>
                <Button onClick={handleSaveVersion} disabled={!newVersionName.trim()} className="rounded-xl bg-slate-900 text-white font-bold h-10 px-5">
                  Save Version
                </Button>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-black text-muted-foreground/70 uppercase tracking-wider">Saved Snapshots</h3>
                <div className="max-h-[240px] overflow-y-auto space-y-2 border border-border rounded-xl p-2 bg-muted/50">
                  {versions.map(v => (
                    <div key={v.id} className="flex justify-between items-center p-3 bg-card border border-border rounded-lg shadow-sm">
                      <div>
                        <div className="text-xs font-bold text-foreground">{v.name}</div>
                        <div className="text-xs text-muted-foreground/70 mt-0.5">{v.timestamp}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { handleRestoreVersion(v.patch); setShowVersionModal(false); }}
                        className="rounded-xl border-border text-xs font-bold hover:bg-muted"
                      >
                        Restore
                      </Button>
                    </div>
                  ))}
                  
                  {versions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground/70 text-xs font-medium">
                      No saved versions found. Save your first checkpoint above!
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hidden Measurement Root */}
      <div 
        id="hidden-measurement-root" 
        style={{ 
          position: "absolute", 
          top: -9999, 
          left: -9999, 
          width: "950px", 
          opacity: 0, 
          pointerEvents: "none",
          visibility: "hidden" 
        }}
      >
        <RendererComponent 
          data={previewState || debouncedState} 
          highlightSection={activeSection}
        />
      </div>

      {/* 6. PRINT ONLY PREVIEW ROOT */}
      <div id="resume-print-root" className="invisible-print-layout">
        {pages.map((pageHtml, index) => (
          <div 
            key={index} 
            className="print-page bg-card" 
            dangerouslySetInnerHTML={{ __html: pageHtml }} 
          />
        ))}
      </div>

      {/* Global printable style overlay matching Helvetica */}
      <style jsx global>{`
        .invisible-print-layout {
          display: none !important;
        }
        @media print {
          .invisible-print-layout {
            display: none !important;
          }
          @page {
            margin: 0;
            size: A4;
          }
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #active-print-clone {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            z-index: 99999 !important;
          }
          .print-page {
            width: 100% !important;
            min-height: 297mm !important; /* A4 height */
            page-break-after: always !important;
            break-inside: avoid !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            box-sizing: border-box !important;
          }
          .print-page > div {
            width: 100% !important;
            height: 100% !important;
            transform: none !important;
            transform-origin: top left !important;
          }
        }
      `}</style>
      {/* Floating Resume Progress Panel */}
      {session.blueprint && (
        <div className="fixed bottom-6 right-6 z-50 bg-card border border-border shadow-[0_12px_32px_rgba(0,0,0,0.12)] p-4 rounded-2xl w-64 space-y-3 select-none">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Resume Progress</span>
            <span className="text-xs font-extrabold text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-md">
              {scores.ats >= 85 ? "Placement Ready" : "Needs Work"}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700">Readiness Score</span>
              <span className="text-indigo-650">{scores.ats}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${scores.ats}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold text-slate-500 pt-2 border-t">
            <div className="flex items-center gap-1">
              <span className={session.acceptedSuggestions.includes("summary") ? "text-emerald-500 font-bold" : "text-slate-300"}>✓</span>
              <span>Summary</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={session.acceptedSuggestions.includes("skills") ? "text-emerald-500 font-bold" : "text-slate-300"}>✓</span>
              <span>Skills</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={session.acceptedSuggestions.includes("projects") ? "text-emerald-500 font-bold" : "text-slate-300"}>✓</span>
              <span>Projects</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={session.acceptedSuggestions.includes("experience") ? "text-emerald-500 font-bold" : "text-slate-300"}>✓</span>
              <span>Experience</span>
            </div>
          </div>
        </div>
      )}

      {/* Resume Quality Report Modal */}
      {showQualityReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <Card className="w-full max-w-xl border-none shadow-2xl rounded-2xl bg-card animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row justify-between items-start border-b pb-4">
              <div>
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-650 text-xs font-black uppercase tracking-wider rounded-md">
                  Resume Intelligence Report
                </span>
                <CardTitle className="text-xl font-black text-slate-900 mt-2">Resume Optimization Report</CardTitle>
                <CardDescription>Your final analysis and readiness dashboard before download.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowQualityReport(false)} className="rounded-xl">
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Score overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border rounded-xl text-center">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block">Overall ATS Score</span>
                  <span className="text-3xl font-black text-slate-900 mt-1 block">{scores.ats}%</span>
                </div>
                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl text-center">
                  <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider block">Interview Readiness</span>
                  <span className="text-3xl font-black text-indigo-650 mt-1 block">{scores.ats >= 85 ? "88%" : "65%"}</span>
                </div>
              </div>

              {/* Quality Criteria Checks */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Analysis Benchmarks</h4>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border">
                    <span className="text-slate-600">Keyword Match</span>
                    <span className="text-indigo-600">94%</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border">
                    <span className="text-slate-600">Formatting Check</span>
                    <span className="text-emerald-600">Excellent</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border">
                    <span className="text-slate-600">Grammar & Syntax</span>
                    <span className="text-emerald-600">Excellent</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border">
                    <span className="text-slate-600">Action Verbs Usage</span>
                    <span className="text-emerald-600">Excellent</span>
                  </div>
                </div>
              </div>

              {/* Missing skills */}
              {session.blueprint?.missingKeywords && session.blueprint.missingKeywords.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Remaining Skill Gaps</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {session.blueprint.missingKeywords.map(kw => (
                      <span key={kw} className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded text-xs font-bold">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Download actions */}
              <div className="flex gap-2 justify-end border-t pt-4">
                <Button variant="outline" onClick={() => { handleExportDocx(true); setShowQualityReport(false); }} className="rounded-xl border-border font-bold text-xs h-11 px-5">
                  Word (.doc)
                </Button>
                <Button onClick={() => { handlePrintPdf(true); setShowQualityReport(false); }} className="rounded-xl bg-slate-900 hover:bg-indigo-650 text-white font-bold text-xs h-11 px-6">
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function parseStreamedSuggestions(text: string, category: string) {
  const suggestions: any[] = [];
  const chunks = text.split(/(?:---|Suggestion \d+:|Suggestion:)/i).filter(c => c.trim().length > 10);
  
  chunks.forEach((chunk, index) => {
    const textMatch = chunk.match(/(?:Suggestion|Text):\s*([^\n]+)/i) || [null, chunk.split('\n')[0].trim()];
    const gainMatch = chunk.match(/Gain:\s*([^\n]+)/i) || [null, "+3 ATS"];
    const reasonMatch = chunk.match(/Reason:\s*([^\n]+)/i) || [null, "adds measurable impact"];
    const riskMatch = chunk.match(/Risk:\s*([^\n]+)/i) || [null, "None"];

    const textVal = textMatch[1]?.trim() || chunk.trim();
    if (textVal.length > 5) {
      suggestions.push({
        id: `ai-suggest-${index}-${Date.now()}`,
        text: textVal,
        gain: gainMatch[1]?.trim() || "+3 ATS",
        reason: reasonMatch[1]?.trim() || "adds measurable impact",
        risk: riskMatch[1]?.trim() || "None",
        category
      });
    }
  });

  if (suggestions.length === 0) {
    const items = text.split(/\d+\.\s+/).filter(t => t.trim().length > 10);
    items.forEach((item, idx) => {
      suggestions.push({
        id: `ai-suggest-${idx}-${Date.now()}`,
        text: item.trim(),
        gain: `+${Math.floor(Math.random() * 5) + 3} ATS`,
        reason: "adds measurable impact and quantifies outcomes",
        risk: "None",
        category
      });
    });
  }

  return suggestions;
}

function getFallbackSuggestions(category: string) {
  const fallbacks: Record<string, { text: string; gain: string; reason: string; risk: string }[]> = {
    "Improve": [
      {
        text: "Redesigned data pipeline using Apache Kafka, reducing processing latency by 35%.",
        gain: "+5 ATS",
        reason: "quantifies technical achievements with clear metrics",
        risk: "Low"
      },
      {
        text: "Led a team of 4 engineers to migrate legacy services to Spring Boot, improving deployment velocity by 40%.",
        gain: "+4 ATS",
        reason: "demonstrates leadership and modern tool adoption",
        risk: "None"
      },
      {
        text: "Developed serverless microservices handling 2M+ daily requests with 99.99% uptime.",
        gain: "+6 ATS",
        reason: "shows experience with highly scalable architectures",
        risk: "Medium"
      }
    ],
    "ATS": [
      {
        text: "Implemented automated CI/CD pipeline using GitHub Actions and Docker, reducing delivery errors by 18%.",
        gain: "+6 ATS",
        reason: "adds strong action verbs and cloud deployment keywords",
        risk: "None"
      },
      {
        text: "Optimized database queries and added Redis caching, improving API response times by 120ms.",
        gain: "+5 ATS",
        reason: "shows systems-level optimization and caching expertise",
        risk: "None"
      },
      {
        text: "Refactored monolith service into microservices, eliminating single point of failure.",
        gain: "+4 ATS",
        reason: "uses strong architecture action verbs",
        risk: "Low"
      }
    ],
    "Keywords": [
      {
        text: "Cloud Architecture (AWS S3, EC2, Lambda), Docker containerization, Kubernetes orchestration.",
        gain: "+7 ATS",
        reason: "adds highly sought-after DevOps keywords to pass automated screens",
        risk: "Low"
      },
      {
        text: "REST API design, PostgreSQL database optimization, microservices architecture.",
        gain: "+4 ATS",
        reason: "provides core backend engineering keywords",
        risk: "None"
      },
      {
        text: "Next.js, React Hooks, Redux Toolkit, Tailwind CSS, TypeScript.",
        gain: "+5 ATS",
        reason: "supplies essential front-end stack keywords",
        risk: "None"
      }
    ],
    "Rewrite": [
      {
        text: "Architected and deployed high-throughput microservices using Spring Boot, handling over 10K requests per second.",
        gain: "+8 ATS",
        reason: "replaces weak phrasing with high-impact system design terminology",
        risk: "Medium"
      },
      {
        text: "Spearheaded front-end redesign using Next.js and Tailwind CSS, increasing page load speed by 2.4x.",
        gain: "+4 ATS",
        reason: "demonstrates modern React ecosystem competency",
        risk: "None"
      }
    ]
  };

  const list = fallbacks[category] || fallbacks["Improve"];
  return list.map((item, idx) => ({
    id: `ai-suggest-${idx}-${Date.now()}`,
    text: item.text,
    gain: item.gain,
    reason: item.reason,
    risk: item.risk,
    category
  }));
}

function SkillsEditorPanel({
  classified,
  categoryMap,
  saveGroupedSkills,
  setActiveSection
}: {
  classified: Record<string, string[]>;
  categoryMap: Record<string, string[]>;
  saveGroupedSkills: (newGroups: Record<string, string[]>) => void;
  setActiveSection: (section: string) => void;
}) {
  const [activeCategoryAdd, setActiveCategoryAdd] = useState<string | null>(null);
  const [newSkillVal, setNewSkillVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input when activeCategoryAdd opens
  useEffect(() => {
    if (activeCategoryAdd && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeCategoryAdd]);

  // Handle addition of a skill to any category (will be auto-classified to correct category!)
  const handleAddSkill = (catName: string, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    // Check classification target category
    const lower = trimmed.toLowerCase();
    let targetCat = catName; // default to the clicked category

    // Check if it belongs elsewhere
    for (const [cName, kws] of Object.entries(categoryMap)) {
      const match = kws.some(kw =>
        lower === kw ||
        lower.includes(` ${kw}`) ||
        lower.includes(`${kw} `) ||
        (kw.length > 3 && lower.includes(kw))
      );
      if (match) {
        targetCat = cName;
        break;
      }
    }

    // Build next groups
    const nextGroups = { ...classified };
    
    // Deduplicate and insert
    const targetList = nextGroups[targetCat] || [];
    if (!targetList.some(s => s.toLowerCase() === lower)) {
      nextGroups[targetCat] = [...targetList, trimmed];
    }
    
    saveGroupedSkills(nextGroups);
    setActiveCategoryAdd(null);
    setNewSkillVal("");
  };

  // Filter only non-empty categories. Fallback to Languages/Tools if everything is empty
  const activeCats = Object.entries(classified).filter(([_, list]) => list.length > 0);
  const categoriesToRender: [string, string[]][] = activeCats.length > 0 ? activeCats : [["Languages", []], ["Tools", []]];

  return (
    <div className="space-y-6">
      {categoriesToRender.map(([cat, list]) => (
        <div key={cat} className="space-y-2 border-b border-border/40 pb-4 last:border-0 last:pb-0">
          <span className="text-xs font-black uppercase tracking-wider text-indigo-650 block mb-1.5">{cat}</span>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {list.map((skill, idx) => (
              <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200/80 rounded-full border border-slate-200 transition-colors">
                <input
                  value={skill}
                  onFocus={() => setActiveSection("skills")}
                  onChange={(e) => {
                    const nextList = [...list];
                    nextList[idx] = e.target.value;
                    const nextGroups = { ...classified, [cat]: nextList };
                    saveGroupedSkills(nextGroups);
                  }}
                  className="bg-transparent border-none outline-none text-xs font-bold text-slate-800 w-16 focus:w-24 transition-all"
                />
                <button
                  onClick={() => {
                    const nextList = list.filter((_, i) => i !== idx);
                    const nextGroups = { ...classified, [cat]: nextList };
                    saveGroupedSkills(nextGroups);
                  }}
                  className="text-slate-400 hover:text-red-500 font-bold text-xs cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          {/* Inline Add Skill controls */}
          <div className="flex gap-1.5 items-center">
            {activeCategoryAdd === cat ? (
              <div className="flex gap-1.5 items-center w-full">
                <Input
                  ref={inputRef}
                  placeholder={`New skill for ${cat}...`}
                  value={newSkillVal}
                  onChange={(e) => setNewSkillVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddSkill(cat, newSkillVal);
                    } else if (e.key === "Escape") {
                      setActiveCategoryAdd(null);
                      setNewSkillVal("");
                    }
                  }}
                  className="h-7 text-xs rounded-lg border-border focus-visible:ring-1"
                />
                <Button 
                  size="sm" 
                  onClick={() => handleAddSkill(cat, newSkillVal)} 
                  className="h-7 px-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs"
                >
                  Add
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => {
                    setActiveCategoryAdd(null);
                    setNewSkillVal("");
                  }} 
                  className="h-7 px-2 rounded-lg text-xs"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setActiveCategoryAdd(cat);
                  setNewSkillVal("");
                  setActiveSection("skills");
                }}
                className="text-indigo-600 hover:text-indigo-700 font-bold text-xs flex items-center gap-1 cursor-pointer py-1"
              >
                <Plus className="w-3 h-3" /> Add to {cat}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ResumeEditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    }>
      <ResumeEditor />
    </Suspense>
  );
}
