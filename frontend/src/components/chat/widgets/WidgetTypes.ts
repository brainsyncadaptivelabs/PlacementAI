export type WidgetType =
  | "roadmap"
  | "comparison"
  | "timeline"
  | "progress"
  | "checklist"
  | "skilltree"
  | "recommendations"
  | "insight"
  | "expandable"
  | "radar"
  | "heatmap"
  | "pipeline"
  | "careerjourney"
  | "mindmap"
  | "flow"
  // Future stubs
  | "whiteboard"
  | "resume"
  | "careerpath"
  | "dashboard"
  | "kanban"
  | "calendar"
  | "chart"
  | "piechart"
  | "linechart"
  | "areachart"
  | "sankey"
  | "treemap"
  | "resume_evolution"
  | "company_dashboard"
  | "placement_dashboard";

export interface WidgetPayload<T = any> {
  id?: string;
  type: WidgetType;
  priority?: number;
  title?: string;
  data: T;
}

export interface WidgetContainerPayload {
  version: number;
  schema: "placementai-widget-container" | "placementai-widget";
  layout?: "stack" | "grid" | "carousel" | "tabs";
  expert?: string;
  intent?: string;
  confidence?: number;
  widgets: WidgetPayload[];
}
