import React, { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface WidgetCardProps {
  children: ReactNode;
  className?: string;
}

export const WidgetCard = ({ children, className = "" }: WidgetCardProps) => {
  return (
    <Card className={`w-full my-4 overflow-hidden border border-border shadow-md bg-card/60 ${className}`}>
      {children}
    </Card>
  );
};
