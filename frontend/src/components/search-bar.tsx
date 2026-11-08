"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  FileText,
  Sparkles,
  Layers,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  MessageSquare,
  Code,
  BrainCircuit,
  Compass,
  TrendingUp,
  Bot,
  BookOpen,
  Activity,
  Wallet,
  User,
  Settings,
  Users,
  Calendar,
  CornerDownLeft,
} from "lucide-react";

interface SearchItem {
  id: string;
  title: string;
  description: string;
  category: "RESUMES" | "PREP" | "SKILLS" | "RECRUITER" | "ACCOUNT";
  categoryLabel: string;
  url: string;
  keywords: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const SEARCH_ITEMS: SearchItem[] = [
  {
    id: "resume-builder",
    title: "Resume Builder",
    description: "Create, edit, and fine-tune AI-optimized resumes",
    category: "RESUMES",
    categoryLabel: "Resumes",
    url: "/dashboard/resume-builder",
    keywords: ["resume", "cv", "builder", "editor", "maker", "create resume"],
    icon: FileText,
  },
  {
    id: "resume-new",
    title: "Create New Resume",
    description: "Start a fresh resume from an industry-tested template",
    category: "RESUMES",
    categoryLabel: "Resumes",
    url: "/dashboard/resume-builder/new",
    keywords: ["new resume", "create", "draft", "start resume"],
    icon: Sparkles,
  },
  {
    id: "resume-templates",
    title: "Resume Templates",
    description: "Browse high-converting, ATS-friendly resume layouts",
    category: "RESUMES",
    categoryLabel: "Resumes",
    url: "/dashboard/resume-builder/templates",
    keywords: ["templates", "designs", "formats", "themes", "ats templates"],
    icon: Layers,
  },
  {
    id: "ats-scanner",
    title: "ATS Resume Scanner",
    description: "Check ATS score, keyword density, and formatting issues",
    category: "RESUMES",
    categoryLabel: "Resumes",
    url: "/dashboard/ats",
    keywords: ["ats", "scanner", "score", "checker", "audit", "keywords", "analysis"],
    icon: CheckCircle2,
  },
  {
    id: "resume-compare",
    title: "Compare Resumes",
    description: "Compare multiple resumes side-by-side with ATS breakdown",
    category: "RESUMES",
    categoryLabel: "Resumes",
    url: "/dashboard/compare",
    keywords: ["compare", "comparison", "side by side", "diff", "versions"],
    icon: FileText,
  },
  {
    id: "jd-match",
    title: "Job Description Match (JD Match)",
    description: "Score your resume against any target job posting",
    category: "RESUMES",
    categoryLabel: "Resumes",
    url: "/dashboard/jd-match",
    keywords: ["jd", "job description", "match", "fit", "posting", "requirements"],
    icon: Briefcase,
  },
  {
    id: "mock-interview",
    title: "AI Mock Interview",
    description: "Practice real-time technical & HR interview rounds",
    category: "PREP",
    categoryLabel: "Prep",
    url: "/mock-interview",
    keywords: ["interview", "mock interview", "hr", "technical", "voice", "practice", "ai interview"],
    icon: MessageSquare,
  },
  {
    id: "coding-practice",
    title: "Coding Problems & DSA",
    description: "Practice coding problems and daily placement challenges",
    category: "PREP",
    categoryLabel: "Prep",
    url: "/dashboard/coding",
    keywords: ["coding", "dsa", "leetcode", "python", "java", "c++", "problems", "compiler"],
    icon: Code,
  },
  {
    id: "aptitude-tests",
    title: "Aptitude Tests",
    description: "Master quantitative, logical, and verbal aptitude assessments",
    category: "PREP",
    categoryLabel: "Prep",
    url: "/dashboard/aptitude",
    keywords: ["aptitude", "quant", "logical", "verbal", "math", "assessment", "exam", "test"],
    icon: BrainCircuit,
  },
  {
    id: "ai-copilot",
    title: "Placement AI Copilot",
    description: "Chat with your 24/7 personalized placement AI advisor",
    category: "PREP",
    categoryLabel: "Prep",
    url: "/dashboard/chat",
    keywords: ["copilot", "chat", "bot", "assistant", "advisor", "mentor", "help"],
    icon: Bot,
  },
  {
    id: "career-roadmap",
    title: "Career Roadmap",
    description: "Structured learning milestones tailored to your target job role",
    category: "SKILLS",
    categoryLabel: "Skills",
    url: "/dashboard/roadmap",
    keywords: ["roadmap", "career", "milestones", "path", "learning path", "guide"],
    icon: Compass,
  },
  {
    id: "skill-gap",
    title: "Skill Gap Analyzer",
    description: "Uncover missing technical skills and recommend fixes",
    category: "SKILLS",
    categoryLabel: "Skills",
    url: "/dashboard/skills",
    keywords: ["skills", "skill gap", "analysis", "missing skills", "technologies"],
    icon: TrendingUp,
  },
  {
    id: "study-notes",
    title: "Notes & Study Material",
    description: "Curated cheat sheets and reference materials from GFG & W3Schools",
    category: "SKILLS",
    categoryLabel: "Skills",
    url: "/dashboard/notes",
    keywords: ["notes", "study", "materials", "cheat sheet", "revision", "gfg"],
    icon: BookOpen,
  },
  {
    id: "analytics",
    title: "Analytics & Progress",
    description: "Track ATS scores, interview readiness, and study streaks",
    category: "ACCOUNT",
    categoryLabel: "Account",
    url: "/dashboard/analytics",
    keywords: ["analytics", "progress", "stats", "performance", "report"],
    icon: Activity,
  },
  {
    id: "wallet",
    title: "Wallet & Credits",
    description: "View remaining AI tokens, recharge credits, and upgrade plans",
    category: "ACCOUNT",
    categoryLabel: "Account",
    url: "/dashboard/wallet",
    keywords: ["wallet", "credits", "tokens", "pricing", "plans", "recharge", "balance"],
    icon: Wallet,
  },
  {
    id: "profile",
    title: "Student Profile",
    description: "Update personal details, college, branch, and graduation year",
    category: "ACCOUNT",
    categoryLabel: "Account",
    url: "/dashboard/profile",
    keywords: ["profile", "bio", "education", "college", "branch", "user details"],
    icon: User,
  },
  {
    id: "settings",
    title: "Account Settings",
    description: "Manage security, preferences, and account controls",
    category: "ACCOUNT",
    categoryLabel: "Account",
    url: "/dashboard/settings",
    keywords: ["settings", "security", "password", "preferences", "config"],
    icon: Settings,
  },
  {
    id: "recruiter-candidates",
    title: "Candidate Search",
    description: "Search and filter verified college student candidates",
    category: "RECRUITER",
    categoryLabel: "Recruiter",
    url: "/recruiter/candidates",
    keywords: ["recruiter", "candidates", "students", "applicants", "hiring"],
    icon: Users,
  },
  {
    id: "recruiter-jobs",
    title: "Job Postings",
    description: "Create and publish company job openings",
    category: "RECRUITER",
    categoryLabel: "Recruiter",
    url: "/recruiter/jobs",
    keywords: ["recruiter", "jobs", "openings", "post job", "vacancies"],
    icon: Briefcase,
  },
  {
    id: "recruiter-interviews",
    title: "Scheduled Interviews",
    description: "Manage candidate interview rounds and timelines",
    category: "RECRUITER",
    categoryLabel: "Recruiter",
    url: "/recruiter/interviews",
    keywords: ["recruiter", "interviews", "schedule", "calendar", "rounds"],
    icon: Calendar,
  },
];

const CATEGORIES = [
  { id: "ALL", label: "All" },
  { id: "RESUMES", label: "Resumes" },
  { id: "PREP", label: "Interview & Prep" },
  { id: "SKILLS", label: "Roadmap & Skills" },
  { id: "ACCOUNT", label: "Account" },
  { id: "RECRUITER", label: "Recruiter" },
];

export function SearchBar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMac, setIsMac] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Detect Mac OS for shortcut label
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent));
    }
  }, []);

  // Global shortcut to focus in-place input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SEARCH_ITEMS.filter((item) => {
      const matchesCategory =
        selectedCategory === "ALL" || item.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!q) return true;

      const titleMatch = item.title.toLowerCase().includes(q);
      const descMatch = item.description.toLowerCase().includes(q);
      const categoryMatch = item.categoryLabel.toLowerCase().includes(q);
      const keywordMatch = item.keywords.some((k) => k.toLowerCase().includes(q));

      return titleMatch || descMatch || categoryMatch || keywordMatch;
    });
  }, [query, selectedCategory]);

  // Keep selected index within bounds
  useEffect(() => {
    if (selectedIndex >= filteredItems.length) {
      setSelectedIndex(0);
    }
  }, [filteredItems, selectedIndex]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  const handleSelect = (item: SearchItem) => {
    setIsOpen(false);
    inputRef.current?.blur();
    router.push(item.url);
  };

  const handleAskAI = () => {
    setIsOpen(false);
    inputRef.current?.blur();
    const destination = query.trim()
      ? `/dashboard/chat?q=${encodeURIComponent(query.trim())}`
      : "/dashboard/chat";
    router.push(destination);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      setSelectedIndex((prev) =>
        filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      setSelectedIndex((prev) =>
        filteredItems.length > 0
          ? (prev - 1 + filteredItems.length) % filteredItems.length
          : 0
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      } else if (query.trim()) {
        handleAskAI();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full max-w-[380px] lg:max-w-[480px] ${isOpen ? "z-[60]" : ""}`}>
      {/* Designated In-Place Search Input */}
      <div
        className={`relative flex items-center bg-slate-100/70 dark:bg-slate-800/60 rounded-full px-4 h-11 border transition-all duration-200 ${
          isOpen
            ? "bg-white dark:bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md"
            : "border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
        }`}
      >
        <Search
          className={`w-4 h-4 transition-colors shrink-0 ${
            isOpen ? "text-indigo-500" : "text-slate-400"
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
            setSelectedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search resumes, ATS, roadmap..."
          className="flex-1 !bg-transparent !border-0 !border-none !outline-none !ring-0 !shadow-none focus:!ring-0 focus:!outline-none focus:!border-none px-3 text-[14px] font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 w-full"
          style={{ outline: "none", border: "none", boxShadow: "none" }}
        />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedIndex(0);
              inputRef.current?.focus();
            }}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors mr-1"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}

        <div className="hidden md:flex items-center gap-0.5 px-2 py-0.5 bg-white/80 dark:bg-black/30 rounded text-[10px] font-bold text-slate-500 dark:text-slate-400 select-none shrink-0 border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
          <span>{isMac ? "⌘" : "Ctrl"}</span>
          <span>K</span>
        </div>
      </div>

      {/* In-Place Attached Dropdown Menu (Under the Search Bar Only) */}
      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[340px] sm:min-w-[440px] lg:min-w-[500px] max-w-[92vw] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar bg-slate-50/50 dark:bg-slate-950/40">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedIndex(0);
                }}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div ref={listRef} className="max-h-[380px] overflow-y-auto p-1.5 space-y-1">
            {filteredItems.length === 0 ? (
              <div className="py-8 text-center px-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 mx-auto flex items-center justify-center mb-2">
                  <Search className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No matching tools found
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Try searching &quot;resume&quot;, &quot;interview&quot;, &quot;ats&quot;, or &quot;coding&quot;.
                </p>
                {query.trim() && (
                  <button
                    type="button"
                    onClick={handleAskAI}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Ask AI Copilot &quot;{query}&quot;
                  </button>
                )}
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    data-index={idx}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs transition-all ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[12px] truncate">
                            {item.title}
                          </span>
                          <span
                            className={`text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {item.categoryLabel}
                          </span>
                        </div>
                        <p
                          className={`text-[10px] truncate mt-0.5 ${
                            isSelected ? "text-indigo-100" : "text-slate-400"
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {isSelected ? (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-white/90 bg-white/20 px-1.5 py-0.5 rounded">
                          <span>Open</span>
                          <CornerDownLeft className="w-2.5 h-2.5" />
                        </div>
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-0.5">
                <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[9px] text-slate-600 dark:text-slate-300 font-semibold border border-slate-300/60 dark:border-slate-700">
                  ↑
                </kbd>
                <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[9px] text-slate-600 dark:text-slate-300 font-semibold border border-slate-300/60 dark:border-slate-700">
                  ↓
                </kbd>
                <span className="ml-0.5">navigate</span>
              </span>
              <span className="inline-flex items-center gap-0.5">
                <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[9px] text-slate-600 dark:text-slate-300 font-semibold border border-slate-300/60 dark:border-slate-700">
                  ↵
                </kbd>
                <span className="ml-0.5">select</span>
              </span>
              <span className="inline-flex items-center gap-0.5">
                <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[9px] text-slate-600 dark:text-slate-300 font-semibold border border-slate-300/60 dark:border-slate-700">
                  esc
                </kbd>
                <span className="ml-0.5">close</span>
              </span>
            </div>
            <span className="font-semibold text-slate-400">
              {filteredItems.length} result{filteredItems.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
