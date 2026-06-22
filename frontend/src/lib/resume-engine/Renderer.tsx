import React, { useMemo } from 'react';
import { registry } from './registry';
import { ResumeData } from './types';

interface RendererProps {
  templateId: string;
  resumeData: ResumeData;
  previewMode?: boolean;
}

export const TemplateRenderer: React.FC<RendererProps> = ({ templateId, resumeData, previewMode = true }) => {
  const template = useMemo(() => registry.getTemplate(templateId), [templateId]);

  if (!template) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-slate-100 text-slate-500 font-medium p-8 text-center rounded-xl border-2 border-dashed border-slate-300">
        Template "{templateId}" not found in registry.
      </div>
    );
  }

  const TemplateComponent = template.component;
  const activeTheme = resumeData.theme || template.config.defaultTheme;

  return (
    <div 
      className="resume-engine-root transition-colors duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden print:shadow-none print:m-0"
      style={{
        backgroundColor: activeTheme.backgroundColor,
        width: '210mm',
        minHeight: '297mm', // A4 aspect ratio
        margin: previewMode ? '0 auto' : '0',
        position: 'relative'
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --resume-primary: ${activeTheme.primaryColor};
          --resume-secondary: ${activeTheme.secondaryColor};
          --resume-bg: ${activeTheme.backgroundColor};
          --resume-text: ${activeTheme.textColor};
          --resume-font: ${activeTheme.fontFamily};
          --resume-font-size: ${activeTheme.fontSize};
        }
      `}} />
      <TemplateComponent data={resumeData} theme={activeTheme} previewMode={previewMode} />
    </div>
  );
};
