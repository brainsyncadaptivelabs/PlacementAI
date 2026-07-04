import React, { useState, useEffect, memo } from "react";
import { WidgetCard } from "../shared/WidgetCard";
import { WidgetHeader } from "../shared/WidgetHeader";
import { WidgetSection } from "../shared/WidgetSection";
import { WidgetToolbar } from "../shared/WidgetToolbar";
import { logWidgetAnalytics } from "@/components/chat/Widgets";

export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
}

export const MindMap = memo(({ data }: { data: { title?: string; root: MindMapNode } }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    logWidgetAnalytics({ widgetType: "mindmap", action: "rendered" });
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNode = (node: MindMapNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = !!expanded[node.id];

    return (
      <div key={node.id} className="pl-4 border-l border-border/60 mt-2 space-y-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleExpand(node.id)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
              depth === 0 ? 'bg-indigo-500 text-white border-indigo-600' :
              hasChildren ? 'bg-card text-foreground border-border hover:bg-muted' : 'bg-muted/30 text-muted-foreground border-transparent'
            }`}
          >
            {node.label}
            {hasChildren && <span className="ml-1 text-[9px]">{isExpanded ? '[-]' : '[+]'}</span>}
          </button>
        </div>
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <WidgetCard>
      <WidgetHeader 
        title={data.title || "Interactive Concept Mindmap"} 
        description="Expandable knowledge trees for placement topics"
      />
      <WidgetSection className="p-4 overflow-x-auto">
        {renderNode(data.root)}
      </WidgetSection>
      <WidgetToolbar widgetId="mindmap" widgetType="mindmap" copyContent={JSON.stringify(data, null, 2)} />
    </WidgetCard>
  );
});
MindMap.displayName = "MindMap";
export default MindMap;
