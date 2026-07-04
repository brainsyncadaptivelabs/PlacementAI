import { WidgetContainerPayload } from "./WidgetTypes";

export const validateWidgetContainer = (rawJson: string): WidgetContainerPayload | { error: string } => {
  try {
    const parsed = JSON.parse(rawJson.trim());
    if (parsed && (parsed.schema === "placementai-widget" || parsed.schema === "placementai-widget-container")) {
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
            data: parsed.data
          }]
        };
      }
      return parsed;
    }
    return { error: "Missing schema validation header" };
  } catch (e: any) {
    return { error: `JSON Parse error: ${e.message}` };
  }
};
