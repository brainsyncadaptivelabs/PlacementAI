"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  TrendingUp, 
  Award, 
  BookOpen, 
  UserCheck, 
  Loader2,
  CheckCircle,
  AlertTriangle,
  GraduationCap
} from "lucide-react";
import api from "@/lib/api";

interface StudentRanking {
  id: number;
  name: string;
  email: string;
  branch: string;
  bestScore: number;
  interviewsCount: number;
}

interface BranchPerformance {
  branch: string;
  studentCount: number;
  avgScore: number;
}

interface WeakTopic {
  topic: string;
  count: number;
}

interface RecruiterSkill {
  skill: string;
  count: number;
}

interface MonthlyTrend {
  month: string;
  averageScore: number;
  interviewsCount: number;
}

interface AnalyticsData {
  totalStudents: number;
  completionRate: number;
  totalInterviews: number;
  completedInterviews: number;
  avgOverallScore: number;
  avgTechnicalScore: number;
  avgCommunicationScore: number;
  avgConfidenceScore: number;
  studentRankings: StudentRanking[];
  branchPerformance: BranchPerformance[];
  readinessReadyCount: number;
  readinessAlmostReadyCount: number;
  readinessNeedsImprovementCount: number;
  commonWeakTopics: WeakTopic[];
  topRecruiterSkills: RecruiterSkill[];
  monthlyImprovement: MonthlyTrend[];
}

export default function PlacementOfficerDashboard() {
  const [loading, setLoading] = useState(true);
  const [collegeFilter, setCollegeFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [data, setData] = useState<AnalyticsData | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/college-analytics", {
        params: {
          college: collegeFilter,
          branch: branchFilter
        }
      });
      setData(response.data);
    } catch (err) {
      console.error("Failed to fetch college analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [collegeFilter, branchFilter]);

  const handleExportCSV = () => {
    if (!data) return;
    const headers = ["Rank", "Name", "Branch", "Best Score", "Interviews Count"];
    const rows = data.studentRankings.map((student, idx) => [
      idx + 1,
      student.name,
      student.branch,
      student.bestScore,
      student.interviewsCount
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Student_Readiness_Report_${collegeFilter || "All"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  // Safe defaults if database counts are zero
  const displayData: AnalyticsData = data || {
    totalStudents: 0,
    completionRate: 0,
    totalInterviews: 0,
    completedInterviews: 0,
    avgOverallScore: 0,
    avgTechnicalScore: 0,
    avgCommunicationScore: 0,
    avgConfidenceScore: 0,
    studentRankings: [],
    branchPerformance: [],
    readinessReadyCount: 0,
    readinessAlmostReadyCount: 0,
    readinessNeedsImprovementCount: 0,
    commonWeakTopics: [],
    topRecruiterSkills: [],
    monthlyImprovement: []
  };

  return (
    <div className="p-8 space-y-8 font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight font-heading flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" /> Placement Officer Analytics
          </h1>
          <p className="text-muted-foreground font-medium">Institution-level readiness leaderboards and category breakdown insights.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
            <input 
              className="pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20" 
              placeholder="Filter by College Name..." 
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 bg-card border border-border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="">All Branches</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
          </select>
          <Button 
            className="bg-primary hover:bg-primary/95 text-white font-bold rounded-xl px-5 flex items-center gap-2"
            onClick={handleExportCSV}
          >
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Main Aggregations */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Total Enrolled Students</span>
            <p className="text-4xl font-black text-foreground mt-2">{displayData.totalStudents}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Average Placement Score</span>
            <p className="text-4xl font-black text-foreground mt-2">{displayData.avgOverallScore}%</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Interview Completion Rate</span>
            <p className="text-4xl font-black text-foreground mt-2">{displayData.completionRate}%</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Completed Sessions</span>
            <p className="text-4xl font-black text-foreground mt-2">{displayData.completedInterviews}</p>
          </CardContent>
        </Card>
      </div>

      {/* Score breakdown metrics & Readiness bands */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Dimensions */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Readiness Dimensions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-medium mb-1">
                <span>Technical Ability</span>
                <span className="font-bold">{displayData.avgTechnicalScore}%</span>
              </div>
              <Progress value={displayData.avgTechnicalScore} className="h-2" indicatorClassName="bg-blue-500" />
            </div>
            <div>
              <div className="flex justify-between text-sm font-medium mb-1">
                <span>Communication Fluency</span>
                <span className="font-bold">{displayData.avgCommunicationScore}%</span>
              </div>
              <Progress value={displayData.avgCommunicationScore} className="h-2" indicatorClassName="bg-purple-500" />
            </div>
            <div>
              <div className="flex justify-between text-sm font-medium mb-1">
                <span>Confidence & Soft Skills</span>
                <span className="font-bold">{displayData.avgConfidenceScore}%</span>
              </div>
              <Progress value={displayData.avgConfidenceScore} className="h-2" indicatorClassName="bg-amber-500" />
            </div>
          </CardContent>
        </Card>

        {/* Readiness Distribution */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Placement Readiness Bands</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-500/5 border border-green-500/20 rounded-xl">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-semibold text-foreground">Ready (Score ≥ 75)</span>
              </div>
              <Badge className="bg-green-500/10 text-green-500 font-bold">{displayData.readinessReadyCount} Students</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-semibold text-foreground">Almost Ready (60-74)</span>
              </div>
              <Badge className="bg-yellow-500/10 text-yellow-500 font-bold">{displayData.readinessAlmostReadyCount} Students</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-sm font-semibold text-foreground">Needs Support (&lt; 60)</span>
              </div>
              <Badge className="bg-red-500/10 text-red-500 font-bold">{displayData.readinessNeedsImprovementCount} Students</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Monthly Improvement trend</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {displayData.monthlyImprovement.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 hover:bg-muted/30 transition-colors">
                  <span className="text-sm font-semibold text-foreground">{item.month}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">{item.interviewsCount} interviews</span>
                    <Badge className="bg-primary/10 text-primary font-bold">{item.averageScore}% avg</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboards and Sourcing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student Leaderboard */}
        <Card className="lg:col-span-2 border-border bg-card overflow-hidden">
          <CardHeader className="border-b border-border py-4 px-6">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" /> Student Readiness Leaderboard
            </CardTitle>
            <CardDescription>Top students matching readiness evaluations based on highest interview score</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-3">Rank</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Department</th>
                    <th className="px-6 py-3">Best Score</th>
                    <th className="px-6 py-3">Interviews</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayData.studentRankings.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-bold">{idx + 1}</td>
                      <td className="px-6 py-4 font-semibold text-foreground">{student.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{student.branch}</td>
                      <td className="px-6 py-4">
                        <Badge className={`${
                          student.bestScore >= 75 ? "bg-green-500/10 text-green-500" :
                          student.bestScore >= 60 ? "bg-yellow-500/10 text-yellow-500" :
                          "bg-red-500/10 text-red-500"
                        } border-none font-bold`}>
                          {student.bestScore}%
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-medium text-muted-foreground">{student.interviewsCount}</td>
                    </tr>
                  ))}
                  {displayData.studentRankings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">No students matching the criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Categories Analysis & Sourcing */}
        <div className="space-y-6">
          {/* Weak Topics */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-red-500" /> Top Improvement Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {displayData.commonWeakTopics.map((topic, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground truncate max-w-[200px]">{topic.topic}</span>
                  <Badge variant="outline" className="border-red-500/20 text-red-500 font-semibold bg-red-500/5">
                    {topic.count} students
                  </Badge>
                </div>
              ))}
              {displayData.commonWeakTopics.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No weak topics logged yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Top Recruiter Skills */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-500" /> Key Recruiter Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {displayData.topRecruiterSkills.map((skill, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground truncate max-w-[200px]">{skill.skill}</span>
                  <Badge variant="outline" className="border-green-500/20 text-green-500 font-semibold bg-green-500/5">
                    {skill.count} times
                  </Badge>
                </div>
              ))}
              {displayData.topRecruiterSkills.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No recruiter skills logged yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
