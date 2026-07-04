import React, { useMemo, memo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { widgetRegistry, reservedWidgets } from "./WidgetRegistry";
import { validateWidgetContainer } from "./WidgetFactory";
import { WidgetSkeleton } from "./shared/WidgetSkeleton";
import { WidgetErrorBoundary } from "./shared/WidgetErrorBoundary";
import { widgetFadeInUp } from "./shared/WidgetAnimations";

export const WidgetRenderer = memo(({ rawJson, isStreaming }: { rawJson: string; isStreaming: boolean }) => {
  const cleanJsonStr = rawJson.trim();
  const isFinished = !isStreaming && cleanJsonStr.endsWith("}");

  const parsedData = useMemo(() => {
    if (!isFinished) return null;
    return validateWidgetContainer(cleanJsonStr);
  }, [cleanJsonStr, isFinished]);

  if (isStreaming || !isFinished) {
    return <WidgetSkeleton />;
  }

  if (parsedData && "error" in parsedData) {
    return (
      <div className="relative my-4 w-full">
        <pre className="bg-zinc-950 text-zinc-50 p-5 rounded-xl overflow-x-auto text-[13px] font-mono leading-relaxed shadow-md border border-white/5 w-full">
          <code>{cleanJsonStr}</code>
        </pre>
        <span className="text-[10px] text-rose-500 font-bold block mt-1.5">✕ Fallback (Invalid JSON Widget Format: {parsedData.error})</span>
      </div>
    );
  }

  if (!parsedData) return null;

  const widgetsList = parsedData.widgets || [];
  const layoutClass = parsedData.layout === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "flex flex-col gap-4";

  return (
    <div className={`w-full my-4 ${layoutClass}`}>
      {widgetsList.map((w: any, index: number) => {
        const WidgetComponent = widgetRegistry[w.type];
        if (!WidgetComponent) {
          if (reservedWidgets.has(w.type)) {
            return (
              <div key={index} className="p-4 my-2 border border-dashed rounded-xl bg-muted/20 text-muted-foreground text-xs flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider">⚡ {w.title || w.type} Widget (V3 Integration Ready)</span>
                <Badge variant="outline" className="text-[9px] uppercase">Coming Soon</Badge>
              </div>
            );
          }
          return (
            <div key={index} className="relative w-full">
              <span className="text-[10px] text-amber-500 font-bold block mb-1">⚠ Fallback (Widget type &apos;{w.type}&apos; not registered)</span>
              <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-xl overflow-x-auto text-xs font-mono border border-white/5 w-full">
                <code>{JSON.stringify(w, null, 2)}</code>
              </pre>
            </div>
          );
        }
        return (
          <WidgetErrorBoundary key={index} fallbackType={w.type}>
            <motion.div
              {...widgetFadeInUp}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <WidgetComponent data={w.data} />
            </motion.div>
          </WidgetErrorBoundary>
        );
      })}
    </div>
  );
});
WidgetRenderer.displayName = "WidgetRenderer";
export default WidgetRenderer;
