import { TemplateLayout } from "./types/TemplateTypes";
import { TemplateLoader } from "./TemplateLoader";

export class LayoutManager {
  static getLayout(templateId: string): TemplateLayout {
    const template = TemplateLoader.getTemplate(templateId);
    if (!template) {
      return {
        columns: 1,
        headerHeight: 100,
        sidebarWidth: 0,
        sectionOrder: ["personalInfo", "summary", "skills", "experience", "projects", "education", "certifications"]
      };
    }
    return template.layout;
  }
}
