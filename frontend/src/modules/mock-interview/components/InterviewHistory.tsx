"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, Briefcase, Trash } from "lucide-react";
import { interviewService } from "../services/interviewService";
import { MockInterview } from "../types/interview.types";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const InterviewHistory = () => {
  const [history, setHistory] = useState<MockInterview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const data = await interviewService.getHistory();
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this mock interview record?")) return;
    try {
      await interviewService.deleteInterview(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error("Failed to delete interview:", error);
      alert("Failed to delete record. Please try again.");
    }
  };

  if (loading) return <div className="text-center py-6">Loading history...</div>;

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Interview History</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No interviews found. Start your first mock interview today!
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-foreground">{item.role}</span>
                      <span className="text-xs text-muted-foreground">{item.experienceLevel}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.feedback ? (
                      <Badge className={cn("border-none", item.feedback.totalScore >= 75 ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700")}>
                        {item.feedback.totalScore}%
                      </Badge>
                    ) : (
                      <Badge variant="outline">N/A</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Link href={`/mock-interview/result/${item.id}`}>
                        <Button variant="ghost" size="sm" className="h-8">
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                      </Link>
                      {item.id && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(item.id!)}
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
