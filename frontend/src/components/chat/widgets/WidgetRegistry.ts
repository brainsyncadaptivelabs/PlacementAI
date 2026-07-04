import dynamic from "next/dynamic";
import { WidgetSkeleton } from "./shared/WidgetSkeleton";

export const widgetRegistry: Record<string, React.ComponentType<any>> = {
  roadmap: dynamic(() => import("./roadmap/AIRoadmap"), { loading: WidgetSkeleton, ssr: false }),
  comparison: dynamic(() => import("./comparison/CompanyComparison"), { loading: WidgetSkeleton, ssr: false }),
  timeline: dynamic(() => import("./timeline/Timeline"), { loading: WidgetSkeleton, ssr: false }),
  progress: dynamic(() => import("./progress/ProgressCard"), { loading: WidgetSkeleton, ssr: false }),
  checklist: dynamic(() => import("./checklist/Checklist"), { loading: WidgetSkeleton, ssr: false }),
  skilltree: dynamic(() => import("./skilltree/SkillTree"), { loading: WidgetSkeleton, ssr: false }),
  recommendations: dynamic(() => import("./recommendations/RecommendationCard"), { loading: WidgetSkeleton, ssr: false }),
  insight: dynamic(() => import("./insight/InsightCard"), { loading: WidgetSkeleton, ssr: false }),
  expandable: dynamic(() => import("./expandable/ExpandableSection"), { loading: WidgetSkeleton, ssr: false }),
  radar: dynamic(() => import("./radar/RadarChart"), { loading: WidgetSkeleton, ssr: false }),
  heatmap: dynamic(() => import("./heatmap/ResumeHeatmap"), { loading: WidgetSkeleton, ssr: false }),
  pipeline: dynamic(() => import("./pipeline/InterviewPipeline"), { loading: WidgetSkeleton, ssr: false }),
  careerjourney: dynamic(() => import("./journey/CareerJourney"), { loading: WidgetSkeleton, ssr: false }),
  mindmap: dynamic(() => import("./mindmap/MindMap"), { loading: WidgetSkeleton, ssr: false }),
  flow: dynamic(() => import("./flow/FlowDiagram"), { loading: WidgetSkeleton, ssr: false }),
  mermaid: dynamic(() => import("./mermaid/MermaidDiagram"), { loading: WidgetSkeleton, ssr: false })
};

export const reservedWidgets = new Set([
  "whiteboard", "resume", "careerpath", "dashboard", "kanban", "calendar", "chart"
]);
