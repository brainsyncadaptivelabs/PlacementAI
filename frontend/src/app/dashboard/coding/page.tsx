"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, Code2, BookOpen, Flame, Sparkles, Terminal } from "lucide-react";
import CodingDashboard from "@/components/coding/CodingDashboard";
import ProblemExplorer, { ProblemItem } from "@/components/coding/ProblemExplorer";
import ProblemWorkspace from "@/components/coding/ProblemWorkspace";
import { FeatureUsageBar } from "@/components/dashboard/feature-usage-bar";
import api from "@/lib/api";

export interface ProblemDto {
  id: number;
  title: string;
  problemStatement: string;
  constraints?: string;
  examples?: string;
  hints?: string;
  difficulty: string;
  tags: string[];
  targetLanguages?: string[];
  timeComplexityTarget?: string;
  spaceComplexityTarget?: string;
  acceptanceRate: number;
  solved?: boolean;
  attempted?: boolean;
  companyTags?: string[];
  xp?: number;
  estimatedTimeMinutes?: number;
  publicTestCases?: {
    id?: number;
    input: string;
    expectedOutput: string;
    description?: string;
    ordinal?: number;
  }[];
}

const fallbackDashboardStats = {
  totalSolved: 14,
  totalAttempted: 18,
  acceptanceRate: 77.8,
  currentStreak: 5,
  longestStreak: 12,
  easySolved: 8,
  mediumSolved: 5,
  hardSolved: 1,
  totalSubmissions: 32,
  codingXp: 850,
  placementReadinessContribution: 78,
  topicProgress: {
    Arrays: 80,
    Strings: 75,
    "Hash Tables": 70,
    "Linked Lists": 60,
    "Trees & Graphs": 45,
    "Dynamic Programming": 30,
    "Binary Search": 65
  }
};

const defaultSeedProblems: ProblemDto[] = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    acceptanceRate: 82.4,
    tags: ["Arrays", "Hash Tables"],
    companyTags: ["Amazon", "Google", "Microsoft"],
    xp: 30,
    estimatedTimeMinutes: 15,
    problemStatement: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].",
    constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nOnly one valid answer exists.",
    timeComplexityTarget: "O(N)",
    spaceComplexityTarget: "O(N)",
    publicTestCases: [
      { input: "[2,7,11,15]\n9", expectedOutput: "[0,1]", ordinal: 1 },
      { input: "[3,2,4]\n6", expectedOutput: "[1,2]", ordinal: 2 }
    ]
  },
  {
    id: 2,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    acceptanceRate: 64.2,
    tags: ["Strings", "Sliding Window", "Hash Tables"],
    companyTags: ["Amazon", "Google", "TCS"],
    xp: 50,
    estimatedTimeMinutes: 25,
    problemStatement: "Given a string `s`, find the length of the longest substring without repeating characters.",
    examples: "Input: s = \"abcabcbb\"\nOutput: 3\nExplanation: The answer is \"abc\", with the length of 3.",
    constraints: "0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.",
    timeComplexityTarget: "O(N)",
    spaceComplexityTarget: "O(Min(N, K))",
    publicTestCases: [
      { input: "\"abcabcbb\"", expectedOutput: "3", ordinal: 1 },
      { input: "\"bbbbb\"", expectedOutput: "1", ordinal: 2 }
    ]
  },
  {
    id: 3,
    title: "Trapping Rain Water",
    difficulty: "Hard",
    acceptanceRate: 48.9,
    tags: ["Arrays", "Two Pointers", "Dynamic Programming"],
    companyTags: ["Google", "Amazon", "Microsoft"],
    xp: 100,
    estimatedTimeMinutes: 45,
    problemStatement: "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    examples: "Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6",
    constraints: "n == height.length\n1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5",
    timeComplexityTarget: "O(N)",
    spaceComplexityTarget: "O(1)",
    publicTestCases: [
      { input: "[0,1,0,2,1,0,1,3,2,1,2,1]", expectedOutput: "6", ordinal: 1 }
    ]
  }
];

import { FeatureGuard } from "@/components/auth/FeatureGuard";

export default function CodingPage() {
  return (
    <FeatureGuard featureKey="CODING_REVIEW" featureTitle="Coding AI Review">
      <CodingPageContent />
    </FeatureGuard>
  );
}

function CodingPageContent() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "problems" | "workspace">("dashboard");
  const [problems, setProblems] = useState<ProblemDto[]>(defaultSeedProblems);
  const [selectedProblem, setSelectedProblem] = useState<ProblemDto | null>(null);
  const [dashboardStats, setDashboardStats] = useState(fallbackDashboardStats);
  const [isLoadingProblems, setIsLoadingProblems] = useState(false);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>("");

  useEffect(() => {
    fetchDashboard();
    fetchProblems();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/coding/dashboard");
      if (res.data) {
        setDashboardStats((prev) => ({ ...prev, ...res.data }));
      }
    } catch (e) {
      console.warn("Using default coding dashboard statistics:", e);
    }
  };

  const fetchProblems = async () => {
    setIsLoadingProblems(true);
    try {
      const res = await api.get("/coding/problems");
      if (res.data && res.data.content && res.data.content.length > 0) {
        setProblems(res.data.content);
      }
    } catch (e) {
      console.warn("Using default seed problems:", e);
    } finally {
      setIsLoadingProblems(false);
    }
  };

  const handleSelectProblem = async (problemId: number) => {
    try {
      const res = await api.get(`/coding/problems/${problemId}`);
      if (res.data) {
        setSelectedProblem(res.data);
      } else {
        const local = problems.find((p) => p.id === problemId);
        if (local) setSelectedProblem(local);
      }
    } catch (e) {
      const local = problems.find((p) => p.id === problemId);
      if (local) setSelectedProblem(local);
    }
    setActiveTab("workspace");
  };

  const handleNavigateToProblemsWithTopic = (topic?: string) => {
    if (topic) setSelectedTopicFilter(topic);
    setActiveTab("problems");
  };

  if (activeTab === "workspace" && selectedProblem) {
    return (
      <ProblemWorkspace
        problem={selectedProblem}
        onBack={() => setActiveTab("problems")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <FeatureUsageBar featureKey="coding" featureTitle="Coding Engine" />

      {/* Top Header Nav Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Code2 className="w-6 h-6 text-purple-400" /> PlacementAI Coding
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Competitive programming platform powered by Placement AI Intelligence.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-card/60 p-1 rounded-xl border border-border/60 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              activeTab === "dashboard"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
          </button>

          <button
            onClick={() => setActiveTab("problems")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              activeTab === "problems"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Problem Explorer
          </button>
        </div>
      </div>

      {/* Tab Views */}
      {activeTab === "dashboard" && (
        <CodingDashboard
          stats={dashboardStats}
          onNavigateToProblems={handleNavigateToProblemsWithTopic}
        />
      )}

      {activeTab === "problems" && (
        <ProblemExplorer
          problems={problems}
          isLoading={isLoadingProblems}
          onSelectProblem={handleSelectProblem}
          selectedTopicFilter={selectedTopicFilter}
        />
      )}
    </div>
  );
}
