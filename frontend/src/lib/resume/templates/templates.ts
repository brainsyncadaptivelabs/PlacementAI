import React from "react";
import { ACTIVE_TEMPLATES as NEW_ACTIVE_TEMPLATES, TEMPLATE_REGISTRY as NEW_TEMPLATE_REGISTRY } from "../../../resume-engine/TemplateRegistry";
import { ResumeState, initialEducatorState } from "./legacy/placementai-educator/schema";
import EducatorPreview from "./legacy/placementai-educator/preview";

export interface TemplateMetadata {
  id: string;
  name: string;
  category: string;
  atsScore?: number;
  editable: boolean;
  comingSoon?: boolean;
  tags?: string[];
  recommendedRoles?: string[];
}

export const ACTIVE_TEMPLATES: TemplateMetadata[] = NEW_ACTIVE_TEMPLATES.map(tpl => ({
  id: tpl.id,
  name: tpl.name,
  category: tpl.category,
  atsScore: tpl.atsScore,
  editable: true,
  tags: tpl.recommendedRoles.concat(tpl.recommendedCompanies),
  recommendedRoles: tpl.recommendedRoles
}));

const genericRawTex = `\\documentclass[11pt]{article}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\begin{document}

\\begin{center}
{\\LARGE {{name}}}\\\\
{{email}} | {{phone}} | \\href{https://{{linkedin}}}{LinkedIn} | \\href{https://{{github}}}{GitHub}
\\end{center}

\\section*{Summary}
{{summary}}

\\section*{Education}
\\begin{itemize}[leftmargin=*]
{{education}}
\\end{itemize}

\\section*{Skills}
\\begin{itemize}[leftmargin=*]
{{skills}}
\\end{itemize}

\\section*{Experience}
{{experience}}

\\section*{Projects}
{{projects}}

\\section*{Certifications}
\\begin{itemize}[leftmargin=*]
{{certifications}}
\\end{itemize}

\\end{document}`;

// Helper to get rotated name for each template ID
function getRotatedName(templateId: string): string {
  switch (templateId) {
    case "professional-ats": return "Abhinav";
    case "classic-ats": return "Bharath";
    case "experienced-ats": return "Likith";
    case "modern": return "Abhinav";
    case "ats": return "Bharath";
    case "accenture-style": return "Sree Alekhya";
    case "tcs-style": return "Abhinav";
    case "cognizant-style": return "Bharath";
    case "faang-style": return "Likith";
    case "ibm-style": return "Likith";
    case "wipro-style": return "Bharath";
    case "oracle-style": return "Abhinav";
    case "deltax-style": return "Abhinav";
    case "zensar-style": return "Likith";
    case "hcl-style": return "Bharath";
    case "deloitte-style": return "Abhinav";
    case "executive-style": return "Likith";
    case "ey-style": return "Abhinav";
    default: return "Sree Alekhya";
  }
}

export const TEMPLATE_REGISTRY: Record<string, {
  renderer: React.ComponentType<any>;
  preview: React.ComponentType<any>;
  initialState: any;
  rawTex: string;
}> = NEW_ACTIVE_TEMPLATES.reduce((acc, tpl) => {
  const candidateName = getRotatedName(tpl.id);
  const customizedInitialState = {
    ...initialEducatorState,
    personalInfo: {
      ...initialEducatorState.personalInfo,
      name: candidateName
    }
  };

  acc[tpl.id] = {
    renderer: (props: any) => {
      const adaptedProps = {
        resume: props.data,
        previewMode: props.previewMode ?? false,
        theme: tpl.theme,
        layout: tpl.layout,
        highlightSection: props.highlightSection,
        mode: props.previewMode ? "PREVIEW" : "EDITOR"
      };
      const Renderer = tpl.component || NEW_TEMPLATE_REGISTRY[tpl.id].component;
      return React.createElement(Renderer as any, adaptedProps);
    },
    preview: EducatorPreview,
    initialState: customizedInitialState,
    rawTex: genericRawTex
  };
  return acc;
}, {} as any);

// Fallback registry keys for backward compatibility
TEMPLATE_REGISTRY["placementai-educator"] = TEMPLATE_REGISTRY["professional-ats"];
TEMPLATE_REGISTRY["placementai-corporate"] = TEMPLATE_REGISTRY["accenture-style"];

export function escapeLatex(text: string): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([&%$#_{}])/g, "\\$1")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/~/g, "\\textasciitilde{}");
}

export function compileLatex(templateId: string, state: ResumeState, rawTex: string): string {
  let tex = rawTex;
  
  tex = tex.replace(/\{\{name\}\}/g, escapeLatex(state.personalInfo.name));
  tex = tex.replace(/\{\{email\}\}/g, escapeLatex(state.personalInfo.email));
  tex = tex.replace(/\{\{phone\}\}/g, escapeLatex(state.personalInfo.phone));
  tex = tex.replace(/\{\{linkedin\}\}/g, escapeLatex(state.personalInfo.linkedin));
  tex = tex.replace(/\{\{github\}\}/g, escapeLatex(state.personalInfo.github));
  tex = tex.replace(/\{\{leetcode\}\}/g, escapeLatex(state.personalInfo.leetcode));
  
  tex = tex.replace(/\{\{summary\}\}/g, escapeLatex(state.summary));
  
  const skillsTex = (state.skills || [])
    .map(s => `\\item ${escapeLatex(s)}`)
    .join("\n");
  tex = tex.replace(/\{\{skills\}\}/g, skillsTex);
  
  const expTex = (state.experience || [])
    .map(exp => {
      const bullets = exp.description
        .split("\n")
        .filter(b => b.trim().length > 0)
        .map(b => `  \\resumeItem{${escapeLatex(b.trim())}}`)
        .join("\n");
      return `  \\resumeSubheading
    {${escapeLatex(exp.company)}}{${escapeLatex(exp.duration)}}
    {${escapeLatex(exp.role)}}{}
  \\resumeItemListStart
${bullets}
  \\resumeItemListEnd`;
    })
    .join("\n\n");
  tex = tex.replace(/\{\{experience\}\}/g, expTex);

  const projTex = (state.projects || [])
    .map(proj => {
      const bullets = proj.description
        .split("\n")
        .filter(b => b.trim().length > 0)
        .map(b => `  \\resumeItem{${escapeLatex(b.trim())}}`)
        .join("\n");
      return `  \\resumeItem{\\textbf{${escapeLatex(proj.name)}} $|$ ${escapeLatex(proj.duration)}}
  \\begin{itemize}
${bullets}
  \\end{itemize}`;
    })
    .join("\n\n");
  tex = tex.replace(/\{\{projects\}\}/g, projTex);

  const eduTex = (state.education || [])
    .map(edu => {
      return `  \\resumeSubheading
    {${escapeLatex(edu.institution)}}{${escapeLatex(edu.duration)}}
    {${escapeLatex(edu.degree)}}{}
    \\vspace{-5pt}
    \\begin{itemize}[leftmargin=0.15in, label={}]
      \\small{\\item{
        ${escapeLatex(edu.details)}
      }}
    \\end{itemize}`;
    })
    .join("\n\n");
  tex = tex.replace(/\{\{education\}\}/g, eduTex);

  const certsTex = (state.certifications || [])
    .map(c => `\\item ${escapeLatex(c)}`)
    .join("\n");
  tex = tex.replace(/\{\{certifications\}\}/g, certsTex);

  return tex;
}
