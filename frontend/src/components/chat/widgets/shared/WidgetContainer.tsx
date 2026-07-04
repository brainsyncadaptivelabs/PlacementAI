import React, { ReactNode } from "react";

interface WidgetContainerProps {
  children: ReactNode;
  layout?: "stack" | "grid" | "carousel" | "tabs";
}

export const WidgetContainer = ({ children, layout = "stack" }: WidgetContainerProps) => {
  const layoutClass = 
    layout === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : 
    "flex flex-col gap-4";

  return (
    <div className={`w-full my-4 ${layoutClass}`}>
      {children}
    </div>
  );
};
