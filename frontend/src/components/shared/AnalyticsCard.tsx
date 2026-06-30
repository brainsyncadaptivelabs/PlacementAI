import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  className?: string;
}

export function AnalyticsCard({ title, value, className = "" }: AnalyticsCardProps) {
  return (
    <Card className={`border-border bg-card ${className}`}>
      <CardContent className="p-6">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{title}</span>
        <p className="text-4xl font-black text-foreground mt-2">{value}</p>
      </CardContent>
    </Card>
  );
}
