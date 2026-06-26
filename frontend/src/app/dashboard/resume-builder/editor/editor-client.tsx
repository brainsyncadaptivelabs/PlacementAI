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
import { ResumeState, initialEducatorState } from "@/lib/resume/templates/placementai-educator/schema";
import { ResumeService } from "@/services/resume.service";
import { useAuth } from "@/hooks/use-auth";
import { StorageService } from "@/services/storage.service";

function ResumeEditor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
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
    coverage: 90 
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
  }[]>([]);
  const [previewingSuggestionId, setPreviewingSuggestionId] = useState<string | null>(null);
  
  // AI Panel is now dynamic drawer/panel based on viewport and expand state
  const [aiExpanded, setAiExpanded] = useState(true); // Default expanded on desktop for quick onboarding
  const aiPanelRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);

  // Zoom & Mode settings
  const [zoom, setZoom] = useState<number>(1.0); // Default 100% zoom
  const [focusMode, setFocusMode] = useState<boolean>(false);

  // Autosave status
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving..." | "Unsaved Changes" | "Error: Unauthenticated">("Saved");

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

  // Debounce Preview rendering (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedState(state);
    }, 300);
    return () => clearTimeout(timer);
  }, [state]);

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

    // 5. Overall ATS Score
    const ats = Math.min(100, Math.round(completeness * 0.3 + keywords * 0.3 + impactScore * 0.3 + coverage * 0.1));

    setScores({ ats, completeness, impact: Math.round(impactScore), keywords, coverage });

    if (baselineScore === 0) {
      setBaselineScore(ats);
    }
  }, [state, baselineScore]);

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
            if (div.innerText?.trim() === '' || div.innerHTML.trim() === '') {
              div.parentNode?.removeChild(div);
            }
          }
        });

        const sections = Array.from(clone.children) as HTMLElement[];
        sections.forEach(sec => {
          if (sec.querySelectorAll('[data-flow-id]').length === 0) {
            sec.parentNode?.removeChild(sec);
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

  const handleExportDocx = () => {
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

  const handlePrintPdf = () => {
    const originalTitle = document.title;
    document.title = `${resumeTitle.replace(/\s+/g, "_")}_Resume`;

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

    const promptMessage = `Act as an expert Resume Coach. ${sectionPrompt}. Return 3 suggestions in this exact format for each suggestion:
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
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 1.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.7));
  const handleFitWidth = () => setZoom(1.0);
  const handleFitPage = () => setZoom(0.85);

  // Focus mode toggle
  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
    if (!focusMode) {
      setZoom(1.0); // Reset zoom in focus mode for better readability
    } else {
      setZoom(0.85);
    }
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
    <div className="h-screen flex flex-col bg-transparent overflow-hidden font-sans relative selection:bg-indigo-150">
      
      {/* 1. FOCUS MODE (Fullscreen Preview) */}
      {focusMode && (
        <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col overflow-hidden select-none">
          {/* Focus mode header toolbar */}
          <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-slate-950 text-white border-b border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.15)] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3">
              <span className="text-sm font-black tracking-wider uppercase text-indigo-400">
                Focus Mode
              </span>
              <span className="text-[10px] font-extrabold text-muted-foreground/70 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded uppercase">
                {pages.length} Pages
              </span>
            </div>

            {/* Zoom controls inside Focus Mode */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleZoomOut} 
                  className="h-8 w-8 rounded text-muted-foreground/70 hover:text-white hover:bg-slate-800"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <select
                  value={`${Math.round(zoom * 100)}%`}
                  onChange={(e) => setZoom(parseFloat(e.target.value) / 100)}
                  className="text-xs font-bold text-muted-foreground/50 bg-transparent border-none focus:outline-none focus:ring-0 w-16 text-center cursor-pointer"
                >
                  <option value="75%" className="bg-slate-900 text-white">75%</option>
                  <option value="100%" className="bg-slate-900 text-white">100%</option>
                  <option value="125%" className="bg-slate-900 text-white">125%</option>
                  <option value="150%" className="bg-slate-900 text-white">150%</option>
                </select>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleZoomIn} 
                  className="h-8 w-8 rounded text-muted-foreground/70 hover:text-white hover:bg-slate-800"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleFitWidth} 
                className="text-xs font-bold h-9 text-muted-foreground/70 hover:text-white rounded-lg px-3 hover:bg-slate-800"
              >
                Fit Width
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleFitPage} 
                className="text-xs font-bold h-9 text-muted-foreground/70 hover:text-white rounded-lg px-3 hover:bg-slate-800"
              >
                Fit Page
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost"
                onClick={handleSaveToCloud} 
                className="h-9 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-900/30 text-xs font-bold px-3 gap-1.5"
              >
                <Save className="w-4 h-4" />
                Save to Cloud
              </Button>

              <Button 
                variant="ghost"
                onClick={() => setShowVersionModal(true)} 
                className="h-9 rounded-lg text-muted-foreground/70 hover:text-white hover:bg-slate-800 text-xs font-bold px-3 gap-1.5"
              >
                <Save className="w-4 h-4" />
                Save
              </Button>

              {/* Export dropdown */}
              <div className="relative group">
                <Button className="h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 px-4">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <div className="absolute right-0 top-full pt-1 hidden group-hover:block z-50">
                  <div className="w-40 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1">
                    <button onClick={handlePrintPdf} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 flex items-center justify-between">
                      <span>PDF</span>
                      <span className="bg-indigo-900/50 text-indigo-300 border border-indigo-700/30 px-1.5 py-0.5 rounded text-[8px] uppercase">Best</span>
                    </button>
                    <button onClick={handleExportDocx} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-350 hover:bg-slate-800">
                      Word (.doc)
                    </button>
                    <button onClick={handleExportLatex} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-350 hover:bg-slate-800">
                      LaTeX (.tex)
                    </button>
                  </div>
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={() => setFocusMode(false)} 
                className="h-9 rounded-lg border-slate-850 text-muted-foreground/50 hover:bg-slate-800 text-xs font-bold gap-1.5 bg-transparent"
              >
                <Minimize2 className="w-4 h-4" />
                Exit Focus
              </Button>
            </div>
          </header>

          {/* Fullscreen workspace scrollarea */}
          <div className="flex-1 overflow-y-auto overflow-x-auto p-12 flex flex-col items-center gap-6 bg-slate-950">
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
                  className="shadow-[0_24px_64px_rgba(0,0,0,0.6)] border border-slate-800 bg-card overflow-hidden"
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
                    <div className="w-24 h-0.5 bg-slate-800 rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top action/score header bar - Sticky */}
      {!focusMode && (
        <header className="h-14 shrink-0 flex items-center justify-between px-6 bg-card border-b border-border z-40">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/resume-builder")} className="rounded-lg hover:bg-muted h-9 px-2">
              <ArrowLeft className="w-4 h-4 text-foreground mr-1" />
              <span className="text-xs font-bold text-foreground">Back</span>
            </Button>
            <div className="h-6 w-px bg-slate-200 mx-1" />
            <input 
              type="text" 
              value={resumeTitle}
              onChange={(e) => setResumeTitle(e.target.value)}
              className="text-sm font-bold text-foreground leading-none bg-transparent border-none focus:outline-none focus:ring-0 p-0"
            />
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold ${saveStatus === "Saved" ? "text-emerald-600" : "text-amber-500"}`}>
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
              className="rounded-lg border-border text-foreground hover:bg-muted text-[11px] font-bold h-9 px-3"
            >
              Versions ({versions.length})
            </Button>

            {/* AI Coach toggle */}
            <Button 
              id="ai-coach-toggle-btn"
              onClick={() => setAiExpanded(!aiExpanded)} 
              className={`rounded-lg text-[11px] font-bold gap-1.5 h-9 px-3 ${
                aiExpanded ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Coach
            </Button>

            {/* Save to Cloud Button */}
            <Button
              variant="outline"
              onClick={handleSaveToCloud}
              className="rounded-lg border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-[11px] font-bold gap-1.5 h-9 px-3"
            >
              <Save className="w-3.5 h-3.5" />
              Save to Cloud
            </Button>

            {/* Focus Mode toggle */}
            <Button 
              variant="outline" 
              onClick={toggleFocusMode} 
              className="rounded-lg border-border text-foreground hover:bg-muted text-[11px] font-bold gap-1.5 h-9 px-3"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Focus Mode
            </Button>

            {/* Export Dropdown */}
            <div className="relative group">
              <Button className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold flex items-center gap-1.5 h-9 px-4">
                <Download className="w-3.5 h-3.5" />
                Export
              </Button>
              <div className="absolute right-0 top-full pt-1 hidden group-hover:block z-50">
                <div className="w-40 bg-card border border-border rounded-xl shadow-xl py-1">
                  <button onClick={handlePrintPdf} className="w-full text-left px-4 py-2 text-xs font-bold text-foreground hover:bg-muted flex items-center justify-between">
                    <span>PDF (Recommended)</span>
                  </button>
                  <button onClick={handleExportDocx} className="w-full text-left px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted">
                    Word (.doc)
                  </button>
                  <button onClick={handleExportLatex} className="w-full text-left px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted">
                    LaTeX (.tex)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Workspace flex layout */}
      {!focusMode && (
        <div className="flex-1 flex gap-4 p-4 h-[calc(100vh-56px)] overflow-hidden w-full bg-transparent max-w-none">

          
          {/* 1. EDITOR PANEL: Left 25% on desktop (lg), 40% on tablet (md), 100% on mobile */}
          <div data-slot="card" className="w-full md:w-[40%] lg:w-[25%] h-full flex flex-col overflow-hidden shrink-0 z-10">
            {/* Section tabs */}
            <div className="p-3 bg-muted/50 border-b border-border">
              <div className="grid grid-cols-3 gap-1 bg-slate-200/50 p-1 rounded-xl">
                {(["personal", "summary", "skills", "experience", "projects", "education"] as const).map(section => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    className={`py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                      activeSection === section 
                        ? "bg-card text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {section === "personal" ? "Info" : section}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable form content - Smooth scrolling */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
              {/* PERSONAL INFO */}
              {activeSection === "personal" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={state.personalInfo.name}
                      onFocus={() => setActiveSection("personal")}
                      onChange={(e) => updateState({
                        ...state,
                        personalInfo: { ...state.personalInfo, name: e.target.value }
                      })}
                      className="rounded-xl border-border"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={state.personalInfo.email}
                      onFocus={() => setActiveSection("personal")}
                      onChange={(e) => updateState({
                        ...state,
                        personalInfo: { ...state.personalInfo, email: e.target.value }
                      })}
                      className="rounded-xl border-border"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={state.personalInfo.phone}
                      onFocus={() => setActiveSection("personal")}
                      onChange={(e) => updateState({
                        ...state,
                        personalInfo: { ...state.personalInfo, phone: e.target.value }
                      })}
                      className="rounded-xl border-border"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                    <Input
                      id="linkedin"
                      value={state.personalInfo.linkedin}
                      onFocus={() => setActiveSection("personal")}
                      onChange={(e) => updateState({
                        ...state,
                        personalInfo: { ...state.personalInfo, linkedin: e.target.value }
                      })}
                      className="rounded-xl border-border"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="github">GitHub Profile</Label>
                    <Input
                      id="github"
                      value={state.personalInfo.github}
                      onFocus={() => setActiveSection("personal")}
                      onChange={(e) => updateState({
                        ...state,
                        personalInfo: { ...state.personalInfo, github: e.target.value }
                      })}
                      className="rounded-xl border-border"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="leetcode">LeetCode Profile</Label>
                    <Input
                      id="leetcode"
                      value={state.personalInfo.leetcode}
                      onFocus={() => setActiveSection("personal")}
                      onChange={(e) => updateState({
                        ...state,
                        personalInfo: { ...state.personalInfo, leetcode: e.target.value }
                      })}
                      className="rounded-xl border-border"
                    />
                  </div>
                </div>
              )}

              {/* SUMMARY */}
              {activeSection === "summary" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground/70 font-medium mb-1">
                      <Label htmlFor="summary">Summary Details</Label>
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
                      className="rounded-xl border-border resize-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* SKILLS */}
              {activeSection === "skills" && (
                <div className="space-y-4">
                  {(state.skills || []).map((skill, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        value={skill}
                        onFocus={() => setActiveSection("skills")}
                        onChange={(e) => {
                          const nextSkills = [...state.skills];
                          nextSkills[index] = e.target.value;
                          updateState({ ...state, skills: nextSkills });
                        }}
                        className="rounded-xl border-border"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const nextSkills = state.skills.filter((_, idx) => idx !== index);
                          updateState({ ...state, skills: nextSkills });
                        }}
                        className="text-muted-foreground/70 hover:text-red-500 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={() => updateState({ ...state, skills: [...state.skills, ""] })}
                    variant="outline"
                    className="w-full rounded-xl border-dashed border-border text-xs font-bold gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Skill Category
                  </Button>
                </div>
              )}

              {/* EXPERIENCE */}
              {activeSection === "experience" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-black text-muted-foreground/70 uppercase tracking-wider">Jobs List</h3>
                    <Button onClick={() => addNewItem("experience")} size="sm" className="rounded-xl bg-slate-900 text-white font-bold h-8 text-[10px]">
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
                              <Label className="text-[10px]">Company</Label>
                              <Input
                                value={exp.company}
                                onFocus={() => setActiveSection("experience")}
                                onChange={(e) => {
                                  const list = [...state.experience];
                                  list[index] = { ...list[index], company: e.target.value };
                                  updateState({ ...state, experience: list });
                                }}
                                className="rounded-xl border-border h-9"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">Role Title</Label>
                              <Input
                                value={exp.role}
                                onFocus={() => setActiveSection("experience")}
                                onChange={(e) => {
                                  const list = [...state.experience];
                                  list[index] = { ...list[index], role: e.target.value };
                                  updateState({ ...state, experience: list });
                                }}
                                className="rounded-xl border-border h-9"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">Duration</Label>
                              <Input
                                value={exp.duration}
                                onFocus={() => setActiveSection("experience")}
                                onChange={(e) => {
                                  const list = [...state.experience];
                                  list[index] = { ...list[index], duration: e.target.value };
                                  updateState({ ...state, experience: list });
                                }}
                                className="rounded-xl border-border h-9"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">Description (newlines for bullets)</Label>
                              <Textarea
                                value={exp.description}
                                rows={4}
                                onFocus={() => setActiveSection("experience")}
                                onChange={(e) => {
                                  const list = [...state.experience];
                                  list[index] = { ...list[index], description: e.target.value };
                                  updateState({ ...state, experience: list });
                                }}
                                className="rounded-xl border-border resize-none text-xs"
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
                    <Button onClick={() => addNewItem("projects")} size="sm" className="rounded-xl bg-slate-900 text-white font-bold h-8 text-[10px]">
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
                              <Label className="text-[10px]">Project Name</Label>
                              <Input
                                value={proj.name}
                                onFocus={() => setActiveSection("projects")}
                                onChange={(e) => {
                                  const list = [...state.projects];
                                  list[index] = { ...list[index], name: e.target.value };
                                  updateState({ ...state, projects: list });
                                }}
                                className="rounded-xl border-border h-9"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">Technologies</Label>
                              <Input
                                value={proj.role}
                                onFocus={() => setActiveSection("projects")}
                                onChange={(e) => {
                                  const list = [...state.projects];
                                  list[index] = { ...list[index], role: e.target.value };
                                  updateState({ ...state, projects: list });
                                }}
                                className="rounded-xl border-border h-9"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">Duration</Label>
                              <Input
                                value={proj.duration}
                                onFocus={() => setActiveSection("projects")}
                                onChange={(e) => {
                                  const list = [...state.projects];
                                  list[index] = { ...list[index], duration: e.target.value };
                                  updateState({ ...state, projects: list });
                                }}
                                className="rounded-xl border-border h-9"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">Description (newlines for bullets)</Label>
                              <Textarea
                                value={proj.description}
                                rows={4}
                                onFocus={() => setActiveSection("projects")}
                                onChange={(e) => {
                                  const list = [...state.projects];
                                  list[index] = { ...list[index], description: e.target.value };
                                  updateState({ ...state, projects: list });
                                }}
                                className="rounded-xl border-border resize-none text-xs"
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
                    <Button onClick={() => addNewItem("education")} size="sm" className="rounded-xl bg-slate-900 text-white font-bold h-8 text-[10px]">
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
                              <Label className="text-[10px]">Institution</Label>
                              <Input
                                value={edu.institution}
                                onFocus={() => setActiveSection("education")}
                                onChange={(e) => {
                                  const list = [...state.education];
                                  list[index] = { ...list[index], institution: e.target.value };
                                  updateState({ ...state, education: list });
                                }}
                                className="rounded-xl border-border h-9"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">Degree / Major</Label>
                              <Input
                                value={edu.degree}
                                onFocus={() => setActiveSection("education")}
                                onChange={(e) => {
                                  const list = [...state.education];
                                  list[index] = { ...list[index], degree: e.target.value };
                                  updateState({ ...state, education: list });
                                }}
                                className="rounded-xl border-border h-9"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">Duration</Label>
                              <Input
                                value={edu.duration}
                                onFocus={() => setActiveSection("education")}
                                onChange={(e) => {
                                  const list = [...state.education];
                                  list[index] = { ...list[index], duration: e.target.value };
                                  updateState({ ...state, education: list });
                                }}
                                className="rounded-xl border-border h-9"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">Details (GPA, achievements)</Label>
                              <Input
                                value={edu.details}
                                onFocus={() => setActiveSection("education")}
                                onChange={(e) => {
                                  const list = [...state.education];
                                  list[index] = { ...list[index], details: e.target.value };
                                  updateState({ ...state, education: list });
                                }}
                                className="rounded-xl border-border h-9"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 2. DOME PREVIEW WORKSPACE: Middle panel (60% or 75% desktop, 60% tablet, hidden on mobile) */}
          <div id="resume-preview-panel" className={cn(
            "hidden md:flex flex-col h-full overflow-hidden relative transition-all duration-300",
            aiExpanded ? "lg:w-[60%]" : "lg:w-[75%]"
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
                <span className="text-[10px] font-bold text-muted-foreground px-2 py-0.5 rounded-md uppercase select-none">
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
                  <Button variant="ghost" size="icon" onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))} className="h-6 w-6 rounded">
                    <ZoomOut className="w-3 h-3 text-muted-foreground" />
                  </Button>
                  <span className="text-[10px] font-bold text-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
                  <Button variant="ghost" size="icon" onClick={() => setZoom(prev => Math.min(2.0, prev + 0.1))} className="h-6 w-6 rounded">
                    <ZoomIn className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </div>
                
                <Button variant="ghost" size="sm" onClick={handleFitWidth} className="text-[9px] font-bold uppercase tracking-wider h-7 rounded-lg px-2 hover:bg-muted text-muted-foreground">
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
              className="flex-1 overflow-y-auto p-12 flex flex-col items-center gap-10 select-text scroll-smooth" 
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
                      minHeight: `${1120 * zoom}px`,
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
                    <div className="w-full h-10 flex items-center justify-center">
                      <div className="w-32 h-px bg-slate-200" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. AI PANEL COLUMN: Overlay drawer on tablet/mobile, side panel (15%) on desktop */}
          <div 
            ref={aiPanelRef}
            data-slot="card"
            className={cn(
              "fixed right-4 top-24 bottom-4 w-[320px] z-40 flex flex-col overflow-hidden transition-all duration-300 lg:static lg:w-[15%] lg:right-0 lg:top-0 lg:h-full shrink-0",
              aiExpanded ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none lg:hidden"
            )}
          >
            <div className="p-4 flex justify-between items-center bg-transparent">
              <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                AI Coach
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setAiExpanded(false)} className="rounded-xl h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <Separator />

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              
              {/* ATS OPTIMIZATION SCOREBOARD */}
              <div className="bg-muted border border-slate-155 rounded-xl p-3 space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/70">ATS Scoreboard</span>
                  <span className="text-[8px] font-bold text-muted-foreground/70 bg-slate-200/50 px-1.5 py-0.5 rounded border border-border select-none">
                    Base: {baselineScore}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 shrink-0 flex items-center justify-center rounded-full border-2 border-border bg-card shadow-sm">
                    <span className="text-base font-black text-foreground leading-none">{scores.ats}</span>
                  </div>

                  <div className="flex-1 space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-extrabold text-foreground">
                        {baselineScore} &rarr; {scores.ats}
                      </span>
                      <span className={`text-[9px] font-black px-1 rounded ${
                        scores.ats - baselineScore >= 0 
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                          : "bg-rose-50 text-rose-605 border border-rose-100"
                      }`}>
                        +{scores.ats - baselineScore}
                      </span>
                    </div>
                    <p className="text-[9px] text-muted-foreground/70 leading-tight">
                      {scores.ats >= 85 ? "ATS filters passed!" : "Apply tips to optimize."}
                    </p>
                  </div>
                </div>

                {/* Weighted Subscores Progress list */}
                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[8px] font-extrabold text-muted-foreground/70 uppercase tracking-wider">
                      <span>Completeness</span>
                      <span>{scores.completeness}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-200/50 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${scores.completeness}%` }} />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[8px] font-extrabold text-muted-foreground/70 uppercase tracking-wider">
                      <span>Keywords</span>
                      <span>{scores.keywords}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-200/50 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${scores.keywords}%` }} />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[8px] font-extrabold text-muted-foreground/70 uppercase tracking-wider">
                      <span>Impact</span>
                      <span>{scores.impact}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-200/50 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${scores.impact}%` }} />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[8px] font-extrabold text-muted-foreground/70 uppercase tracking-wider">
                      <span>Page Fit</span>
                      <span>{scores.coverage}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-200/50 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${scores.coverage}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* AI tab selector pills */}
              <div className="grid grid-cols-2 gap-1 bg-muted/50 border p-1 rounded-xl">
                {(["Improve", "ATS", "Keywords", "Rewrite"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setAiActiveTab(tab)}
                    className={`py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                      aiActiveTab === tab 
                        ? "bg-card text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <Button 
                onClick={handleRequestAiSuggestions}
                disabled={aiStreaming}
                className="w-full rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white font-bold h-9 text-xs flex justify-center gap-1.5"
              >
                {aiStreaming ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Streaming...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate tips</span>
                  </>
                )}
              </Button>

              {/* Suggestions list */}
              <div className="space-y-3 pt-1">
                {aiSuggestions.map(suggest => {
                  const isPreviewing = previewingSuggestionId === suggest.id;

                  return (
                    <Card key={suggest.id} className="border border-border rounded-xl hover:shadow-md transition-all bg-card overflow-hidden">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 select-none">
                            {suggest.gain}
                          </span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border select-none ${
                            suggest.risk === "None" ? "bg-muted text-muted-foreground/70" :
                            suggest.risk === "Low" ? "bg-amber-50 text-amber-605 border-amber-100" :
                            "bg-rose-50 text-rose-600 border-rose-100"
                          }`}>
                            Risk: {suggest.risk}
                          </span>
                        </div>
                        
                        <p className="text-[11px] text-foreground leading-normal font-semibold">
                          {suggest.text}
                        </p>

                        <div className="text-[9px] text-muted-foreground bg-muted p-1.5 rounded-lg leading-tight border">
                          <span className="font-extrabold text-muted-foreground uppercase block text-[8px] tracking-wider mb-0.5">Why it works:</span>
                          {suggest.reason}
                        </div>
                        
                        <div className="flex gap-1 pt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSuggestionPreview(suggest.text, suggest.id)}
                            className={`flex-1 text-[9px] font-bold rounded-lg border h-8 ${
                              isPreviewing 
                                ? "bg-indigo-50 border-indigo-200 text-indigo-650"
                                : "border-border text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            {isPreviewing ? "Previewing" : "Preview"}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSuggestionApply(suggest.text)}
                            className="flex-1 text-[9px] font-bold rounded-lg bg-slate-900 text-white hover:bg-emerald-600 h-8"
                          >
                            Apply
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSuggestionDiscard(suggest.id)}
                            className="h-8 w-8 p-0 rounded-lg text-slate-405 hover:text-red-500 hover:bg-slate-55"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {aiSuggestions.length === 0 && !aiStreaming && (
                  <div className="border border-dashed border-border p-6 text-center rounded-xl bg-muted/20">
                    <Info className="w-6 h-6 text-muted-foreground/70 mx-auto mb-2" />
                    <p className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wider">No suggestions loaded</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1 leading-normal">Select a tab and click generate to audit your details.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Floating mobile action button to open mobile preview modal */}
      {!focusMode && (
        <button
          onClick={() => setMobileShowPreview(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 shadow-xl bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 py-3 text-xs font-bold gap-2 flex items-center md:hidden border border-slate-800"
        >
          <Eye className="w-4 h-4" />
          Preview Resume
        </button>
      )}

      {/* 4. MOBILE PREVIEW MODAL */}
      {mobileShowPreview && (
        <div className="fixed inset-0 bg-card z-[110] flex flex-col overflow-hidden md:hidden">
          {/* Header */}
          <div className="h-16 shrink-0 border-b flex items-center justify-between px-4 bg-muted">
            <span className="font-extrabold text-foreground text-sm">Resume Preview</span>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handlePrintPdf} className="rounded-xl h-8 text-[10px] font-bold">
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
                <span className="text-[9px] font-bold text-muted-foreground/70 mb-1">Page {index + 1} of {pages.length}</span>
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
                    className="rounded-xl border-border"
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
                        <div className="text-[10px] text-muted-foreground/70 mt-0.5">{v.timestamp}</div>
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
      <div id="resume-print-root" className="hidden">
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
        @media print {
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
            transform: scale(0.85) !important;
            transform-origin: top left !important;
          }
        }
      `}</style>
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
      },
      {
        text: "Engineered scalable REST APIs with robust token-based authentication and rate limiting.",
        gain: "+5 ATS",
        reason: "elaborates on API design details for security and scale",
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
