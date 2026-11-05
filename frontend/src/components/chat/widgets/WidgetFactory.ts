import { WidgetContainerPayload } from "./WidgetTypes";

export const validateWidgetContainer = (rawJson: string): WidgetContainerPayload | { error: string } => {
  try {
    const trimmed = rawJson.trim();
    const parsed = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== "object") {
      return { error: "Payload is not a valid JSON object" };
    }

    // Standard schema validation
    if (parsed.schema === "placementai-widget" || parsed.schema === "placementai-widget-container") {
      if (parsed.schema === "placementai-widget" && parsed.type) {
        return {
          version: parsed.version || 1,
          schema: "placementai-widget-container",
          layout: "stack",
          widgets: [{
            id: parsed.id || `w-${parsed.type}`,
            type: parsed.type,
            priority: 1,
            title: parsed.title,
            data: parsed.data || {}
          }]
        };
      }
      return parsed;
    }

    // Auto-normalize if "widgets" array exists without explicit schema header
    if (Array.isArray(parsed.widgets)) {
      return {
        version: parsed.version || 1,
        schema: "placementai-widget-container",
        layout: parsed.layout || "stack",
        widgets: parsed.widgets.map((w: any, idx: number) => ({
          id: w.id || `w-${w.type || 'widget'}-${idx}`,
          type: w.type || "progress",
          priority: w.priority || 1,
          title: w.title || "Widget",
          data: w.data || {}
        }))
      };
    }

    // Auto-normalize if single widget object (has type and data or score)
    if (parsed.type && (parsed.data || parsed.score !== undefined)) {
      return {
        version: 1,
        schema: "placementai-widget-container",
        layout: "stack",
        widgets: [{
          id: parsed.id || `w-${parsed.type}`,
          type: parsed.type,
          priority: 1,
          title: parsed.title || "Widget",
          data: parsed.data || parsed
        }]
      };
    }

    return { error: "Missing schema validation header" };
  } catch (e: any) {
    return { error: `JSON Parse error: ${e.message}` };
  }
};
