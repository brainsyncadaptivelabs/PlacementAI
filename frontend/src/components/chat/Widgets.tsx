import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

// --- WIDGET ANALYTICS LAYER ---
export const logWidgetAnalytics = (event: {
  widgetType: string;
  action: string;
  metadata?: Record<string, any>;
}) => {
  console.log(`[Widget Analytics] Type: ${event.widgetType} | Action: ${event.action}`, event.metadata || {});
};

// --- ERROR BOUNDARY ---
interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackType: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class WidgetErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logWidgetAnalytics({
      widgetType: this.props.fallbackType,
      action: "error",
      metadata: { error: error.message, stack: errorInfo.componentStack }
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400 space-y-2 my-2 text-sm font-sans">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>Interactive Widget Error</span>
          </div>
          <p className="text-xs text-muted-foreground">Could not render {this.props.fallbackType}. Displaying raw content fallback.</p>
          <pre className="text-[11px] bg-black/40 p-3 rounded-lg overflow-x-auto text-zinc-400 font-mono mt-1 max-h-40">
            {this.state.error?.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- SKELETON LOADER ---
export const WidgetSkeleton = () => (
  <div className="w-full p-6 rounded-2xl border border-border bg-card animate-pulse space-y-4 my-4">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-muted" />
      <div className="space-y-1.5 flex-1">
        <div className="h-4 bg-muted rounded-full w-1/3" />
        <div className="h-3 bg-muted rounded-full w-2/3" />
      </div>
    </div>
    <div className="space-y-2 pt-2">
      <div className="h-8 bg-muted rounded-xl w-full" />
      <div className="h-8 bg-muted rounded-xl w-full" />
      <div className="h-8 bg-muted rounded-xl w-full" />
    </div>
  </div>
);
