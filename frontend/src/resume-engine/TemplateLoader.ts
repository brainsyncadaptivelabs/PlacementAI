import { ResumeTemplate } from "./types/TemplateTypes";
import { ACTIVE_TEMPLATES, TEMPLATE_REGISTRY } from "./TemplateRegistry";

export class TemplateLoader {
  static getTemplate(templateId: string): ResumeTemplate | undefined {
    return TEMPLATE_REGISTRY[templateId] || TEMPLATE_REGISTRY["fresher-tcs-bharath"];
  }

  static getAllTemplates(): ResumeTemplate[] {
    return ACTIVE_TEMPLATES;
  }
}
