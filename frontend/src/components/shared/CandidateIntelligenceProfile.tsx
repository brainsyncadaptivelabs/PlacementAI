import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, Lightbulb, UserCheck, TrendingUp, DollarSign } from "lucide-react";

export interface PlacementIntelligenceDto {
    overallPlacementReadiness: number;
    atsScore: number;
    jdMatch: number;
    codingScore: number;
    communicationScore: number;
    problemSolving: number;
    resumeQuality: number;
    learningProgress: number;
    activityScore: number;
    companyReadiness: Record<string, number>;
    salaryPrediction: string;
    hiringProbability: number;
    candidateStrengths: string[];
    weaknesses: string[];
    riskAnalysis: string[];
    improvementPlan: string;
    hiringRecommendation: string;
    aiSummary: string;
}

interface CandidateIntelligenceProfileProps {
  data: PlacementIntelligenceDto;
}

export const CandidateIntelligenceProfile: React.FC<CandidateIntelligenceProfileProps> = ({ data }) => {
  if (!data) return <p className="text-muted-foreground p-8">No intelligence data available.</p>;

  return (
    <div className="space-y-6">
      {/* Overview & AI Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" /> Recruiter AI Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground">{data.aiSummary || "No AI summary available."}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Scores */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Deterministic Scoring Engine</CardTitle>
            <CardDescription>Metrics verified by backend evaluation engines.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between font-medium">
                <span>Placement Readiness</span>
                <span>{data.overallPlacementReadiness}%</span>
              </div>
              <Progress value={data.overallPlacementReadiness} className="h-3" indicatorClassName="bg-blue-600" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between font-medium text-sm">
                <span>Coding & Problem Solving</span>
                <span>{data.codingScore}%</span>
              </div>
              <Progress value={data.codingScore} className="h-2" indicatorClassName="bg-purple-600" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between font-medium text-sm">
                <span>Communication Score</span>
                <span>{data.communicationScore}%</span>
              </div>
              <Progress value={data.communicationScore} className="h-2" indicatorClassName="bg-indigo-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between font-medium text-sm">
                <span>Resume ATS Quality</span>
                <span>{data.resumeQuality}%</span>
              </div>
              <Progress value={data.resumeQuality} className="h-2" indicatorClassName="bg-teal-500" />
            </div>
          </CardContent>
        </Card>

        {/* Prediction & Recommendations */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Hiring Probability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-primary">{data.hiringProbability}%</div>
              <Badge className="mt-2" variant={data.hiringProbability > 70 ? "default" : "secondary"}>
                {data.hiringRecommendation}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Salary CTC Prediction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-1">
                <DollarSign className="w-5 h-5 text-green-500" /> {data.salaryPrediction}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Narrative Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" /> Candidate Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
              {data.candidateStrengths?.map((str, i) => <li key={i}>{str}</li>)}
              {(!data.candidateStrengths || data.candidateStrengths.length === 0) && <li>No notable strengths identified yet.</li>}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" /> Risk Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
              {data.riskAnalysis?.map((risk, i) => <li key={i}>{risk}</li>)}
              {(!data.riskAnalysis || data.riskAnalysis.length === 0) && <li>No immediate risks identified.</li>}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Company Readiness */}
      {data.companyReadiness && Object.keys(data.companyReadiness).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Company Skill Profile Match</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {Object.entries(data.companyReadiness).map(([company, match]) => (
                <div key={company} className="flex items-center gap-2 px-4 py-2 border rounded-xl">
                  <span className="font-semibold">{company}</span>
                  <Badge variant={match > 80 ? "default" : match > 50 ? "secondary" : "destructive"}>{match}% match</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
