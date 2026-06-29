import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Star, Eye, Trash } from "lucide-react";
import { MockInterview } from "../types/interview.types";

interface InterviewCardProps {
  interview: MockInterview;
  onDelete: (id: number) => void;
}

export const InterviewCard = ({ interview, onDelete }: InterviewCardProps) => {
  const { id, role, experienceLevel, feedback, createdAt, topic } = interview;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  const topicsList = topic ? topic.split(",").map(t => t.trim()) : [];

  return (
    <Card className="flex flex-col justify-between hover:border-primary/50 transition-all duration-300 hover:shadow-md relative overflow-hidden bg-card border border-border">
      {/* Type Badge */}
      <div className="absolute top-0 right-0 px-3 py-1 bg-secondary text-secondary-foreground border-b border-l border-border rounded-bl-lg text-xs font-semibold uppercase">
        {experienceLevel}
      </div>

      <CardHeader className="pt-6">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
            🤖
          </div>
          <div>
            <CardTitle className="text-lg font-bold capitalize leading-snug">{role}</CardTitle>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1.5">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /> 
                <span className="font-semibold text-foreground">{feedback?.totalScore || "---"}</span>/100
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="py-2 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {feedback?.finalAssessment || "You haven't completed this interview session yet."}
        </p>

        {topicsList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {topicsList.slice(0, 3).map((item, idx) => (
              <Badge key={idx} variant="secondary" className="text-[10px] px-2 py-0">
                {item}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 border-t border-border flex justify-between gap-2 bg-muted/5">
        <button
          onClick={() => id && onDelete(id)}
          className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-red-50"
        >
          <Trash className="w-3.5 h-3.5" /> Delete
        </button>

        <Link href={`/mock-interview/result/${id}`}>
          <Button size="sm" className="font-bold flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> {feedback ? "Feedback" : "Resume"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
