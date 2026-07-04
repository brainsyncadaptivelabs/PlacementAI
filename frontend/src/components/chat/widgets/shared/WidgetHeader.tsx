import React, { ReactNode } from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface WidgetHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export const WidgetHeader = ({ title, description, icon, action }: WidgetHeaderProps) => {
  return (
    <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
              {icon}
            </div>
          )}
          <div>
            <CardTitle className="text-base font-bold text-foreground leading-tight">{title}</CardTitle>
            {description && <CardDescription className="text-xs text-muted-foreground mt-0.5">{description}</CardDescription>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </CardHeader>
  );
};
