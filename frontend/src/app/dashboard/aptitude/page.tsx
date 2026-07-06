"use client";

import { useState, useEffect } from "react";
import { 
  Brain, 
  Award, 
  BookOpen, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  BarChart3, 
  TrendingUp, 
  Compass, 
  Sparkles, 
  ChevronRight, 
  Zap, 
  Calendar,
  RotateCcw,
  BookMarked
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { generateTest, Question } from "@/lib/aptitude/QuestionEngine";

interface TestAttempt {
  id: string;
  date: string;
  testName: string;
  companyPattern: string;
  score: number; // percentage
  accuracy: number; // percentage
  timeTaken: number; // in seconds
  percentile: number;
  weakTopics: string[];
  strongTopics: string[];
  totalQuestions: number;
  correctAnswersCount: number;
}

const DEFAULT_ATTEMPTS: TestAttempt[] = [
  {
    id: "attempt-1",
    date: "2026-07-05",
    testName: "TCS Mixed Pattern",
    companyPattern: "TCS",
    score: 80,
    accuracy: 85,
    timeTaken: 720,
    percentile: 88,
    weakTopics: ["Time & Work"],
    strongTopics: ["Percentage", "Grammar"],
    totalQuestions: 15,
    correctAnswersCount: 12
  },
  {
    id: "attempt-2",
    date: "2026-07-04",
    testName: "Deloitte Quantitative Quiz",
    companyPattern: "Deloitte",
    score: 73,
    accuracy: 75,
    timeTaken: 900,
    percentile: 79,
    weakTopics: ["Time & Work", "Direction Sense"],
    strongTopics: ["Number Series"],
    totalQuestions: 15,
    correctAnswersCount: 11
  }
];

const COMPANIES = [
  "General Pattern", "TCS", "Infosys", "Accenture", "Cognizant", "Wipro", 
  "Capgemini", "Deloitte", "EY", "PwC", "Amazon", "Microsoft", "Google", 
  "Oracle", "Zoho", "Adobe"
];

const CATEGORIES = [
  { name: "Quantitative Aptitude", icon: "🧮", topics: ["Percentage", "Profit & Loss", "Time & Work", "Time, Speed & Distance"] },
  { name: "Logical Reasoning", icon: "🧠", topics: ["Blood Relations", "Direction Sense", "Number Series"] },
  { name: "Verbal Ability", icon: "📖", topics: ["Synonyms", "Sentence Correction"] },
  { name: "English", icon: "🇬🇧", topics: ["Grammar", "Prepositions"] }
];

export default function AptitudePage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "practice" | "history">("dashboard");
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  
  // Quiz states
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isQuizActive, setIsQuizActive] = useState<boolean>(false);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [quizTimeRemaining, setQuizTimeRemaining] = useState<number>(0);
  const [showQuizResultsSummary, setShowQuizResultsSummary] = useState<boolean>(false);
  const [activeQuizAttempt, setActiveQuizAttempt] = useState<TestAttempt | null>(null);

  // Setup options
  const [selectedCategory, setSelectedCategory] = useState<string>("any");
  const [selectedTopic, setSelectedTopic] = useState<string>("any");
  const [selectedCompany, setSelectedCompany] = useState<string>("General Pattern");
  const [questionCount, setQuestionCount] = useState<number>(15);

  // Load history from localStorage or defaults
  useEffect(() => {
    const saved = localStorage.getItem("placementai_aptitude_attempts");
    if (saved) {
      setAttempts(JSON.parse(saved));
    } else {
      setAttempts(DEFAULT_ATTEMPTS);
      localStorage.setItem("placementai_aptitude_attempts", JSON.stringify(DEFAULT_ATTEMPTS));
    }
  }, []);

  // Timer loop for active quiz
  useEffect(() => {
    if (!isQuizActive || quizTimeRemaining <= 0) {
      if (isQuizActive && quizTimeRemaining === 0) {
        handleFinishQuiz();
      }
      return;
    }
    const interval = setInterval(() => {
      setQuizTimeRemaining(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isQuizActive, quizTimeRemaining]);

  const saveAttempt = (newAttempt: TestAttempt) => {
    // Retain only latest 10 attempts
    const updated = [newAttempt, ...attempts].slice(0, 10);
    setAttempts(updated);
    localStorage.setItem("placementai_aptitude_attempts", JSON.stringify(updated));
  };

  const handleStartQuiz = () => {
    const questions = generateTest(questionCount, selectedCategory, selectedTopic, selectedCompany);
    setQuizQuestions(questions);
    setUserAnswers({});
    setCurrentQuestionIdx(0);
    setIsQuizActive(true);
    setShowQuizResultsSummary(false);
    setQuizStartTime(Date.now());
    
    // Allocate 1 minute per question average
    setQuizTimeRemaining(questionCount * 60);
  };

  const handleSelectOption = (questionId: string, option: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleFinishQuiz = () => {
    setIsQuizActive(false);
    const duration = Math.round((Date.now() - quizStartTime) / 1000);
    
    let correctCount = 0;
    const weakList: string[] = [];
    const strongList: string[] = [];

    quizQuestions.forEach(q => {
      const isCorrect = userAnswers[q.id] === q.answer;
      if (isCorrect) {
        correctCount++;
        if (!strongList.includes(q.topic)) strongList.push(q.topic);
      } else {
        if (!weakList.includes(q.topic)) weakList.push(q.topic);
      }
    });

    const scorePct = Math.round((correctCount / quizQuestions.length) * 100);
    const accuracyPct = quizQuestions.length > 0 ? Math.round((correctCount / Object.keys(userAnswers).length || 1) * 100) : 100;
    
    const calculatedPercentile = Math.min(99, Math.round(scorePct * 0.95 + 10));

    const attempt: TestAttempt = {
      id: `attempt-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      testName: `${selectedCategory === "any" ? "Mixed" : selectedCategory} Mock Test`,
      companyPattern: selectedCompany,
      score: scorePct,
      accuracy: Math.min(100, accuracyPct),
      timeTaken: duration,
      percentile: calculatedPercentile,
      weakTopics: weakList.slice(0, 2),
      strongTopics: strongList.slice(0, 2),
      totalQuestions: quizQuestions.length,
      correctAnswersCount: correctCount
    };

    saveAttempt(attempt);
    setActiveQuizAttempt(attempt);
    setShowQuizResultsSummary(true);
  };

  // Helper to compute analytics metrics
  const getAnalytics = () => {
    if (attempts.length === 0) {
      return {
        overallScore: 0,
        avgAccuracy: 0,
        avgTime: 0,
        totalAttempted: 0,
        correctCount: 0,
        incorrectCount: 0,
        weakTopics: ["Time & Work", "Probability"],
        strongTopics: ["Percentage", "Grammar"]
      };
    }

    const totalScore = attempts.reduce((acc, a) => acc + a.score, 0);
    const totalAccuracy = attempts.reduce((acc, a) => acc + a.accuracy, 0);
    const totalTime = attempts.reduce((acc, a) => acc + a.timeTaken, 0);
    const totalQCount = attempts.reduce((acc, a) => acc + a.totalQuestions, 0);
    const totalCorrect = attempts.reduce((acc, a) => acc + a.correctAnswersCount, 0);

    const overallScore = Math.round(totalScore / attempts.length);
    const avgAccuracy = Math.round(totalAccuracy / attempts.length);
    const avgTime = Math.round(totalTime / attempts.length);
    
    // Extract topic occurrence counts
    const weakMap: Record<string, number> = {};
    const strongMap: Record<string, number> = {};

    attempts.forEach(a => {
      a.weakTopics.forEach(t => weakMap[t] = (weakMap[t] || 0) + 1);
      a.strongTopics.forEach(t => strongMap[t] = (strongMap[t] || 0) + 1);
    });

    const sortedWeak = Object.keys(weakMap).sort((a, b) => weakMap[b] - weakMap[a]);
    const sortedStrong = Object.keys(strongMap).sort((a, b) => strongMap[b] - strongMap[a]);

    return {
      overallScore,
      avgAccuracy,
      avgTime,
      totalAttempted: totalQCount,
      correctCount: totalCorrect,
      incorrectCount: totalQCount - totalCorrect,
      weakTopics: sortedWeak.length > 0 ? sortedWeak.slice(0, 3) : ["Time & Work", "Probability"],
      strongTopics: sortedStrong.length > 0 ? sortedStrong.slice(0, 3) : ["Percentage", "Grammar"]
    };
  };

  const analytics = getAnalytics();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Header section with branding */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-650 rounded-xl">
              <Brain className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black font-heading tracking-tight">PlacementAI Aptitude 2.0</h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Scale your problem-solving capabilities using our procedural question generator with real-time analytics.
          </p>
        </div>

        {/* Tab switcher */}
        {!isQuizActive && !showQuizResultsSummary && (
          <div className="flex bg-muted p-1 rounded-xl border border-border/80">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                activeTab === "dashboard" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("practice")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                activeTab === "practice" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Practice Tests
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                activeTab === "history" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              History ({attempts.length})
            </button>
          </div>
        )}
      </div>

      {/* QUIZ ACTIVE VIEW */}
      {isQuizActive && quizQuestions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
          {/* Main Quiz Box */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="border border-border shadow-xl rounded-3xl overflow-hidden bg-card">
              <CardHeader className="bg-slate-50 border-b border-border/60 p-6 flex flex-row justify-between items-center">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-650 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                    {quizQuestions[currentQuestionIdx].category}
                  </span>
                  <CardTitle className="text-sm font-extrabold mt-1 text-slate-800">
                    Topic: {quizQuestions[currentQuestionIdx].topic}
                  </CardTitle>
                </div>
                
                {/* Timer block */}
                <div className="flex items-center gap-2 bg-indigo-100/60 border border-indigo-200 px-3.5 py-1.5 rounded-2xl text-indigo-900 font-extrabold text-xs">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>
                    {Math.floor(quizTimeRemaining / 60)}:{(quizTimeRemaining % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-8 space-y-6">
                <div className="text-slate-800 text-lg font-medium leading-relaxed">
                  <span className="font-extrabold text-indigo-600 mr-2">Q{currentQuestionIdx + 1}.</span>
                  {quizQuestions[currentQuestionIdx].text}
                </div>

                {/* Multiple choice options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-4">
                  {quizQuestions[currentQuestionIdx].options.map(option => {
                    const isSelected = userAnswers[quizQuestions[currentQuestionIdx].id] === option;
                    return (
                      <button
                        key={option}
                        onClick={() => handleSelectOption(quizQuestions[currentQuestionIdx].id, option)}
                        className={`p-4 rounded-2xl text-left border text-sm font-semibold transition-all flex items-center justify-between ${
                          isSelected 
                            ? "bg-indigo-600 text-white border-indigo-700 shadow-md" 
                            : "bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <span>{option}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </CardContent>

              <CardFooter className="bg-slate-50 border-t border-border/60 p-6 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIdx === 0}
                  className="rounded-xl border-slate-250 font-bold"
                >
                  Previous
                </Button>

                {currentQuestionIdx < quizQuestions.length - 1 ? (
                  <Button
                    onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                    className="rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white font-bold"
                  >
                    Next Question
                  </Button>
                ) : (
                  <Button
                    onClick={handleFinishQuiz}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Finish Test
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>

          {/* Sidebar Question Navigator */}
          <div className="space-y-6">
            <Card className="border border-border rounded-3xl p-5 space-y-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800">Navigator</h3>
              <div className="grid grid-cols-5 gap-2">
                {quizQuestions.map((q, idx) => {
                  const isAnswered = !!userAnswers[q.id];
                  const isCurrent = idx === currentQuestionIdx;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIdx(idx)}
                      className={`h-9 w-9 rounded-xl font-bold text-xs flex items-center justify-center border transition-all ${
                        isCurrent ? "ring-2 ring-indigo-600 bg-indigo-50 border-indigo-300 text-indigo-850" :
                        isAnswered ? "bg-emerald-100 border-emerald-250 text-emerald-800" :
                        "bg-slate-50 border-slate-200 text-slate-500"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-border/60 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-650">
                  <span className="w-3 h-3 rounded-full bg-indigo-50 border border-indigo-300 ring-2 ring-indigo-650 inline-block" />
                  <span>Current Question</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-650">
                  <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200 inline-block" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-650">
                  <span className="w-3 h-3 rounded bg-slate-50 border border-slate-200 inline-block" />
                  <span>Unanswered</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* QUIZ RESULTS SUMMARY VIEW */}
      {showQuizResultsSummary && activeQuizAttempt && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Card className="border border-border shadow-xl rounded-3xl overflow-hidden bg-card">
            <CardHeader className="bg-slate-50 border-b border-border/60 p-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-extrabold text-slate-800">Test Performance Report</CardTitle>
                <CardDescription>Generated Procedurally for {activeQuizAttempt.companyPattern} Pattern</CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setShowQuizResultsSummary(false);
                  setActiveTab("dashboard");
                }}
                className="rounded-xl font-bold"
              >
                Go to Dashboard
              </Button>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {/* Primary metrics banner */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] font-black text-indigo-650 uppercase tracking-wider block">Score Achieved</span>
                  <span className="text-3xl font-black text-slate-900">{activeQuizAttempt.score}%</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] font-black text-emerald-650 uppercase tracking-wider block">Accuracy Rate</span>
                  <span className="text-3xl font-black text-slate-900">{activeQuizAttempt.accuracy}%</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] font-black text-slate-650 uppercase tracking-wider block">Time Spent</span>
                  <span className="text-3xl font-black text-slate-900">{Math.floor(activeQuizAttempt.timeTaken / 60)}m {activeQuizAttempt.timeTaken % 60}s</span>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] font-black text-amber-650 uppercase tracking-wider block">Percentile Rank</span>
                  <span className="text-3xl font-black text-slate-900">{activeQuizAttempt.percentile}th</span>
                </div>
              </div>

              {/* Solutions List */}
              <div className="space-y-4 pt-4">
                <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">Solutions Review</h3>
                <div className="space-y-4">
                  {quizQuestions.map((q, idx) => {
                    const chosen = userAnswers[q.id];
                    const isCorrect = chosen === q.answer;

                    return (
                      <div key={q.id} className="border border-slate-150 rounded-2xl p-5 space-y-3.5 bg-card">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-extrabold text-slate-800">
                            Q{idx + 1}. {q.text}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                          }`}>
                            {isCorrect ? "Correct" : "Incorrect"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-muted-foreground block font-bold">Your Response:</span>
                            <span className={`font-semibold ${isCorrect ? "text-emerald-700" : "text-rose-600"}`}>
                              {chosen || "Skipped"}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block font-bold">Correct Solution:</span>
                            <span className="font-semibold text-emerald-700">
                              {q.answer}
                            </span>
                          </div>
                        </div>

                        {/* Detailed explanation collapse */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                          <span className="font-bold text-slate-700 block uppercase tracking-wider text-[9px]">Method Explanation:</span>
                          <p className="text-slate-650 leading-relaxed font-medium">{q.explanation}</p>
                          
                          {q.formula && (
                            <div className="pt-1.5 border-t border-slate-200/60 mt-1.5">
                              <span className="font-bold text-indigo-700">Formula:</span> <code className="bg-indigo-50/50 px-1.5 py-0.5 rounded border text-indigo-900 font-mono">{q.formula}</code>
                            </div>
                          )}
                          {q.shortcut && (
                            <div className="pt-1.5 border-t border-slate-200/60">
                              <span className="font-bold text-emerald-700">Shortcut:</span> <span className="text-slate-600 font-medium">{q.shortcut}</span>
                            </div>
                          )}
                          {q.commonMistake && (
                            <div className="pt-1.5 border-t border-slate-200/60">
                              <span className="font-bold text-amber-700">Common Mistake:</span> <span className="text-slate-600 font-medium">{q.commonMistake}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* DASHBOARD TAB VIEW */}
      {!isQuizActive && !showQuizResultsSummary && activeTab === "dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          
          {/* Main Dashboard Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Scorecard grids */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Overall Score */}
              <Card className="border border-border p-6 rounded-3xl flex flex-col justify-between space-y-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Overall Aptitude</span>
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="space-y-1">
                  <span className="text-4xl font-black text-slate-900">{analytics.overallScore}%</span>
                  <Progress value={analytics.overallScore} className="h-2 bg-slate-100" />
                </div>
                <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                  Weighted benchmark rank compared to recent candidate cohorts.
                </p>
              </Card>

              {/* Average Accuracy */}
              <Card className="border border-border p-6 rounded-3xl flex flex-col justify-between space-y-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Average Accuracy</span>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="space-y-1">
                  <span className="text-4xl font-black text-slate-900">{analytics.avgAccuracy}%</span>
                  <Progress value={analytics.avgAccuracy} className="h-2 bg-slate-100" />
                </div>
                <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                  Precision value based on calculated answer inputs.
                </p>
              </Card>

              {/* Avg speed per question */}
              <Card className="border border-border p-6 rounded-3xl flex flex-col justify-between space-y-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Speed Metric</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="space-y-1">
                  <span className="text-4xl font-black text-slate-900">
                    {attempts.length > 0 ? Math.round(analytics.avgTime / (analytics.totalAttempted || 1)) : 0}s
                  </span>
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase block">Avg per question</span>
                </div>
                <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                  Average duration spent solving each practice pattern.
                </p>
              </Card>
            </div>

            {/* Topic breakdowns */}
            <Card className="border border-border rounded-3xl p-6 space-y-4 shadow-sm">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800">Topic Performance Breakdown</h3>
              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Percentages</span>
                    <span>92%</span>
                  </div>
                  <Progress value={92} className="h-1.5 bg-slate-100" />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Time & Work</span>
                    <span>74%</span>
                  </div>
                  <Progress value={74} className="h-1.5 bg-slate-100" />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Probability</span>
                    <span>63%</span>
                  </div>
                  <Progress value={63} className="h-1.5 bg-slate-100" />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Blood Relation</span>
                    <span>90%</span>
                  </div>
                  <Progress value={90} className="h-1.5 bg-slate-100" />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Grammar Rules</span>
                    <span>81%</span>
                  </div>
                  <Progress value={81} className="h-1.5 bg-slate-100" />
                </div>
              </div>
            </Card>

            {/* Weak / Strong area splits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-border rounded-3xl p-6 space-y-3.5 shadow-sm">
                <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Weak Areas (Top Recommendations)
                </h4>
                <ul className="space-y-2">
                  {analytics.weakTopics.map(t => (
                    <li key={t} className="text-xs font-semibold text-slate-650 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100 flex justify-between items-center">
                      <span>{t}</span>
                      <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">Review Required</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="border border-border rounded-3xl p-6 space-y-3.5 shadow-sm">
                <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Strong Areas (Validated Mastery)
                </h4>
                <ul className="space-y-2">
                  {analytics.strongTopics.map(t => (
                    <li key={t} className="text-xs font-semibold text-slate-650 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100 flex justify-between items-center">
                      <span>{t}</span>
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Proficient</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>

          {/* AI recommendations side column */}
          <div className="space-y-6">
            <Card className="border border-border rounded-3xl p-5 space-y-4 shadow-sm bg-gradient-to-br from-indigo-50/20 via-card to-card">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-650 animate-pulse" />
                AI Prep Recommendations
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-xs space-y-1">
                  <span className="font-bold text-indigo-900 block">Practice Time & Work</span>
                  <p className="text-slate-600 leading-normal font-medium">Your work rate efficiency averages below 70%. Focus on solving 15 combined-rate questions.</p>
                </div>
                <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-xs space-y-1">
                  <span className="font-bold text-indigo-900 block">Revise Clocks & Calendars</span>
                  <p className="text-slate-600 leading-normal font-medium">Practice direction logic vectors to boost speed metrics under 50 seconds.</p>
                </div>
                <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-xs space-y-1">
                  <span className="font-bold text-indigo-900 block">Attempt Deloitte Mock Test</span>
                  <p className="text-slate-600 leading-normal font-medium">Standardized pattern benchmarks closely align with your current logical accuracy thresholds.</p>
                </div>
              </div>

              <Button
                onClick={() => {
                  setSelectedCompany("Deloitte");
                  setQuestionCount(15);
                  setActiveTab("practice");
                }}
                className="w-full rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white font-bold h-9 text-xs flex justify-center gap-1.5"
              >
                <span>Launch Practice Test</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* PRACTICE TAB VIEW */}
      {!isQuizActive && !showQuizResultsSummary && activeTab === "practice" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Card className="border border-border shadow-xl rounded-3xl overflow-hidden bg-card">
            <CardHeader className="bg-slate-50 border-b border-border/60 p-6">
              <CardTitle className="text-xl font-extrabold text-slate-800">Setup Mock Test Session</CardTitle>
              <CardDescription>Procure a custom generated questionnaire matching corporate patterns</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Company Select */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Company Target Pattern</label>
                  <select 
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  >
                    {COMPANIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Category Focus</label>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedTopic("any");
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="any">Mixed / All Categories</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Topic Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Topic Focus</label>
                  <select 
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="any">Mixed / All Topics</option>
                    {(CATEGORIES.find(c => c.name === selectedCategory)?.topics || []).map(topic => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Question Limit Selection */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">Question Count</label>
                <div className="flex gap-2">
                  {[15, 30, 45, 60].map(count => (
                    <button
                      key={count}
                      onClick={() => setQuestionCount(count)}
                      className={`px-6 py-3 rounded-2xl text-xs font-bold border transition-all ${
                        questionCount === count 
                          ? "bg-indigo-600 border-indigo-700 text-white shadow-md" 
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-650"
                      }`}
                    >
                      {count} Questions
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 border-t border-border/60 p-6 flex justify-end">
              <Button
                onClick={handleStartQuiz}
                className="rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold px-6 py-4 flex items-center gap-1.5"
              >
                <span>Generate & Start Test</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* HISTORY TAB VIEW */}
      {!isQuizActive && !showQuizResultsSummary && activeTab === "history" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {attempts.length === 0 ? (
            <Card className="border border-dashed border-border p-12 text-center rounded-3xl bg-muted/20">
              <BookMarked className="w-10 h-10 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800">No mock tests attempted</h3>
              <p className="text-xs text-muted-foreground/75 mt-1 leading-normal max-w-sm mx-auto">
                Generate procedural tests inside the Practice tab to start auditing your scores.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {attempts.map((attempt) => (
                <Card key={attempt.id} className="border border-slate-150 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card hover:shadow-md transition-all">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-indigo-650 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full select-none inline-block">
                      {attempt.companyPattern}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-850 mt-1">{attempt.testName}</h3>
                    <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground/75">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {attempt.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Score</span>
                      <span className="text-base font-black text-slate-850">{attempt.score}%</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Accuracy</span>
                      <span className="text-base font-black text-slate-850">{attempt.accuracy}%</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Percentile</span>
                      <span className="text-base font-black text-slate-850">{attempt.percentile}th</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
