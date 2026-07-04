import React from "react";
import { Copy, Share2 } from "lucide-react";
import { logWidgetAnalytics } from "@/components/chat/Widgets";

interface WidgetToolbarProps {
  widgetId: string;
  widgetType: string;
  copyContent?: string;
}

export const WidgetToolbar = ({ widgetId, widgetType, copyContent }: WidgetToolbarProps) => {
  const handleCopy = () => {
    if (copyContent) {
      navigator.clipboard.writeText(copyContent);
      logWidgetAnalytics({ widgetType, action: "copy_clicked", metadata: { widgetId } });
    }
  };

  const handleShare = () => {
    logWidgetAnalytics({ widgetType, action: "share_clicked", metadata: { widgetId } });
  };

  return (
    <div className="flex items-center gap-3.5 border-t border-border/40 px-4 py-2 bg-muted/10 text-[10px] uppercase font-bold text-muted-foreground/80 select-none">
      {copyContent && (
        <button onClick={handleCopy} className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer">
          <Copy className="w-3.5 h-3.5" /> Copy Data
        </button>
      )}
      <button onClick={handleShare} className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer">
        <Share2 className="w-3.5 h-3.5" /> Share
      </button>
    </div>
  );
};
