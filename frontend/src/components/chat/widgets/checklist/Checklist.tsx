import React, { useState, useEffect, memo } from "react";
import { CheckSquare, Square } from "lucide-react";
import { WidgetCard } from "../shared/WidgetCard";
import { WidgetHeader } from "../shared/WidgetHeader";
import { WidgetSection } from "../shared/WidgetSection";
import { WidgetToolbar } from "../shared/WidgetToolbar";
import { logWidgetAnalytics } from "@/components/chat/Widgets";

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export const Checklist = memo(({ data }: { data: { title?: string; items: ChecklistItem[] } }) => {
  const storageKey = `checklist_items_${data.title || "default"}`;

  const [items, setItems] = useState<ChecklistItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return data.items || [];
  });

  useEffect(() => {
    logWidgetAnalytics({ widgetType: "checklist", action: "rendered" });
  }, []);

  const toggleItem = (id: string) => {
    const updated = items.map(item => {
      if (item.id === id) {
        const nextState = !item.completed;
        logWidgetAnalytics({
          widgetType: "checklist",
          action: "toggle_item",
          metadata: { itemId: id, completed: nextState }
        });
        return { ...item, completed: nextState };
      }
      return item;
    });
    setItems(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const completedCount = items.filter(i => i.completed).length;

  return (
    <WidgetCard>
      <WidgetHeader 
        title={data.title || "Preparation Checklist"} 
        description="Important actionable tasks"
        icon={<CheckSquare className="w-4 h-4" />}
        action={
          <span className="text-xs font-semibold text-muted-foreground">
            {completedCount}/{items.length} Completed
          </span>
        }
      />
      <WidgetSection className="p-4 space-y-2">
        {items.map((item) => (
          <div 
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className="flex items-center gap-2.5 p-2 rounded-lg border border-transparent hover:bg-muted/30 cursor-pointer select-none transition-all"
          >
            <button className="text-indigo-500 focus:outline-none shrink-0">
              {item.completed ? (
                <CheckSquare className="w-4.5 h-4.5 fill-indigo-500 text-white" />
              ) : (
                <Square className="w-4.5 h-4.5 text-muted-foreground/60" />
              )}
            </button>
            <span className={`text-xs font-semibold ${item.completed ? "line-through text-muted-foreground/60" : "text-foreground"}`}>
              {item.text}
            </span>
          </div>
        ))}
      </WidgetSection>
      <WidgetToolbar widgetId="checklist" widgetType="checklist" copyContent={JSON.stringify(items, null, 2)} />
    </WidgetCard>
  );
});
Checklist.displayName = "Checklist";
export default Checklist;
