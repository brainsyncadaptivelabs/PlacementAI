import { TemplateTheme } from "./types/TemplateTypes";
import { TemplateLoader } from "./TemplateLoader";

export class ThemeLoader {
  static loadTheme(templateId: string): TemplateTheme {
    const template = TemplateLoader.getTemplate(templateId);
    if (!template) {
      return {
        fonts: { body: "Inter, sans-serif", heading: "Inter, sans-serif" },
        colors: { primary: "#1e293b", secondary: "#475569", text: "#0f172a", background: "#ffffff" },
        spacing: { paddingX: "1.5in", paddingY: "1.5in", gapSections: "1.25rem" },
        margins: "0.75in"
      };
    }
    return template.theme;
  }
}
