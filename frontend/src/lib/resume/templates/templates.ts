import React from "react";
import EducatorRenderer from "./placementai-educator/renderer";
import EducatorPreview from "./placementai-educator/preview";
import { initialEducatorState, ResumeState } from "./placementai-educator/schema";

import CorporateRenderer from "./placementai-corporate/renderer";
import CorporatePreview from "./placementai-corporate/preview";
import { initialCorporateState } from "./placementai-corporate/schema";

export interface TemplateMetadata {
  id: string;
  name: string;
  category: string;
  editable: boolean;
  comingSoon?: boolean;
}

export const ACTIVE_TEMPLATES: TemplateMetadata[] = [
  {
    id: "placementai-educator",
    name: "Professional Resume",
    category: "ATS Friendly",
    editable: true
  },
  {
    id: "placementai-corporate",
    name: "Two Column Resume",
    category: "Company Based",
    editable: true
  }
];

export const TEMPLATE_REGISTRY: Record<string, {
  renderer: React.ComponentType<{ data: ResumeState; previewMode?: boolean }>;
  preview: React.ComponentType;
  initialState: ResumeState;
  rawTex: string;
}> = {
  "placementai-educator": {
    renderer: EducatorRenderer,
    preview: EducatorPreview,
    initialState: initialEducatorState,
    rawTex: `\\documentclass[10pt,letterpaper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{helvet}
\\usepackage{multicol}
\\renewcommand{\\familydefault}{\\sfdefault}

\\pagestyle{fancy}
\\fancyhf{} 
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.0in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large\\bfseries\\color{blue}
}{}{0em}{}[\\color{black}\\titrule \\vspace{-5pt}]

\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

\\begin{center}
    {\\Huge \\bfseries {{name}}} \\\\ \\vspace{4pt}
    \\small {{email}} $|$ {{phone}} $|$ \\href{https://{{linkedin}}}{LinkedIn}
\\end{center}

\\vspace{10pt}

\\begin{multicols}{2}
[
\\section{Professional Statement}
\\small{ {{summary}} }
]

\\section{Experience}
\\resumeSubHeadingListStart
  {{experience}}
\\resumeSubHeadingListEnd

\\section{Education}
\\resumeSubHeadingListStart
  {{education}}
\\resumeSubHeadingListEnd

\\columnbreak

\\section{Contact \\& Social}
\\small{
\\textbf{Email:} {{email}} \\\\
\\textbf{Phone:} {{phone}} \\\\
\\textbf{LinkedIn:} {{linkedin}} \\\\
\\textbf{GitHub:} {{github}}
}

\\section{Expertise}
\\begin{itemize}[leftmargin=0.15in, label={$\\bullet$}]
    {{skills}}
\\end{itemize}

\\section{Certifications}
\\begin{itemize}[leftmargin=0.15in, label={$\\bullet$}]
    {{certifications}}
\\end{itemize}

\\end{multicols}

\\end{document}`
  },
  "placementai-corporate": {
    renderer: CorporateRenderer,
    preview: CorporatePreview,
    initialState: initialCorporateState,
    rawTex: `\\documentclass[11pt,letterpaper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{charter}

\\pagestyle{fancy}
\\fancyhf{} 
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.0in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large\\bfseries
}{}{0em}{}[\\color{black}\\titrule \\vspace{-5pt}]

\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

\\begin{tabularx}{\\textwidth}{L R}
  \\textbf{\\Huge {{name}}} & {{email}} \\\\
  Executive Professional & {{phone}} \\\\
  & {{linkedin}}
\\end{tabularx}

\\vspace{20pt}

\\section{Executive Summary}
\\small{ {{summary}} }

\\section{Core Competencies}
\\begin{itemize}[leftmargin=0.15in, label={$\\bullet$}]
    \\item {{skills}}
\\end{itemize}

\\section{Professional Experience}
\\resumeSubHeadingListStart
  {{experience}}
\\resumeSubHeadingListEnd

\\section{Academic Background}
\\resumeSubHeadingListStart
  {{education}}
\\resumeSubHeadingListEnd

\\section{Certifications}
\\begin{itemize}[leftmargin=0.15in, label={$\\bullet$}]
    {{certifications}}
\\end{itemize}

\\end{document}`
  }
};

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
