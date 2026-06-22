import { TemplateConfig, TemplateProps } from './types';
import React from 'react';

// Import template components and configs
import DeedyTemplate from './templates/deedy/template';
import deedyConfig from './templates/deedy/template.json';

export interface RegisteredTemplate {
  config: TemplateConfig;
  component: React.ComponentType<TemplateProps>;
}

class TemplateRegistry {
  private templates: Map<string, RegisteredTemplate> = new Map();

  constructor() {
    this.registerTemplate(deedyConfig as TemplateConfig, DeedyTemplate);
    // Future templates will be registered here
    // this.registerTemplate(harvardConfig, HarvardTemplate);
  }

  registerTemplate(config: TemplateConfig, component: React.ComponentType<TemplateProps>) {
    this.templates.set(config.id, { config, component });
  }

  getTemplate(id: string): RegisteredTemplate | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(): RegisteredTemplate[] {
    return Array.from(this.templates.values());
  }
}

export const registry = new TemplateRegistry();
