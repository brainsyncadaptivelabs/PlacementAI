import React, { ReactNode } from "react";

interface WidgetSectionProps {
  children: ReactNode;
  className?: string;
}

export const WidgetSection = ({ children, className = "" }: WidgetSectionProps) => {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
};
