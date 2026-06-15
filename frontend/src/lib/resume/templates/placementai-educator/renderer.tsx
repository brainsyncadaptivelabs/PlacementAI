import React from "react";
import { ResumeState } from "./schema";

interface RendererProps {
  data: ResumeState;
  previewMode?: boolean;
  highlightSection?: string;
}

export default function EducatorRenderer({ data, previewMode = false, highlightSection = "" }: RendererProps) {
  const { personalInfo, summary, skills, experience, projects, education, certifications } = data;

  const highlightStyle = (sectionName: string) => {
    if (previewMode || highlightSection !== sectionName) return {};
    return {
      outline: "2px solid #6366f1",
      outlineOffset: "4px",
      borderRadius: "4px",
      backgroundColor: "rgba(99, 102, 241, 0.02)",
      transition: "all 0.2s ease"
    };
  };

  return (
    <div 
      className={`bg-white text-slate-900 font-sans leading-tight selection:bg-indigo-100 flex ${
        previewMode ? "p-3.5 text-[9.5px]" : "p-[24px] text-[13px]"
      }`}
      style={{
        fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        minHeight: previewMode ? "auto" : "1120px",
        width: previewMode ? "100%" : "950px",
        boxSizing: "border-box",
        margin: "0 auto"
      }}
    >
      {/* LEFT COLUMN (68%) */}
      <div className={`w-[68%] flex flex-col ${previewMode ? "pr-2 gap-2.5" : "pr-6 gap-4"}`}>
        {/* Header */}
        <div style={highlightStyle("personal")} data-block="personal">
          <h1 className={`${previewMode ? "text-xl" : "text-3xl"} font-black tracking-tighter mb-1 text-slate-950 uppercase`}>
            {personalInfo.name || "Your Name"}
          </h1>
          <div className="flex items-center gap-2">
            <div className="h-1 w-12 bg-indigo-600 rounded-full" />
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Software Engineer</span>
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div style={highlightStyle("summary")} data-block="summary">
            <h2 className="text-indigo-600 font-black uppercase tracking-widest text-[10px] mb-1.5">Professional Summary</h2>
            <p className="text-slate-700 text-justify leading-relaxed font-medium text-[11px]">{summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <div style={highlightStyle("experience")}>
            <h2 className="text-indigo-600 font-black uppercase tracking-widest text-[10px] mb-2" data-block="experience-header">Experience</h2>
            <div className={previewMode ? "space-y-2.5" : "space-y-4"}>
              {experience.map((exp) => (
                <div key={exp.id} data-block="experience-item" className={`relative border-l-2 border-slate-100 ${previewMode ? "pl-2.5" : "pl-4"}`}>
                  <div className="absolute w-2.5 h-2.5 bg-indigo-600 rounded-full -left-[6px] top-1 ring-4 ring-white" />
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className={`font-bold text-slate-950 ${previewMode ? "text-[12px]" : "text-[14px]"}`}>{exp.role}</span>
                    <span className="font-bold text-slate-400 text-[9px] uppercase tracking-wider">{exp.duration}</span>
                  </div>
                  <div className={`font-bold text-indigo-500 mb-1 ${previewMode ? "text-[10px]" : "text-[11px]"}`}>{exp.company}</div>
                  <ul className="space-y-1">
                    {exp.description.split("\n").filter(line => line.trim().length > 0).map((bullet, idx) => (
                      <li key={idx} className={`text-slate-600 leading-snug flex items-start gap-2 ${previewMode ? "text-[10px]" : "text-[11px]"}`}>
                        <span className="text-indigo-300 mt-1 shrink-0 text-[7px]">●</span>
                        <span>{bullet.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && !previewMode && (
          <div style={highlightStyle("education")}>
            <h2 className="text-indigo-600 font-black uppercase tracking-widest text-[10px] mb-2.5" data-block="education-header">Education</h2>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} data-block="education-item" className="relative pl-4 border-l-2 border-slate-100">
                  <div className="absolute w-2.5 h-2.5 bg-indigo-600 rounded-full -left-[6px] top-1 ring-4 ring-white" />
                  <div className="font-bold text-slate-950 text-[14px]">{edu.degree}</div>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-indigo-500 text-[11px]">{edu.institution}</span>
                    <span className="font-bold text-slate-400 text-[9px] uppercase tracking-wider">{edu.duration}</span>
                  </div>
                  {edu.details && <div className="text-slate-600 text-[10px] mt-0.5 italic">{edu.details}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN (32%) - Sidebar */}
      <div className={`w-[32%] bg-slate-50/50 flex flex-col border border-slate-100 self-start min-h-0 ${
        previewMode ? "rounded-lg p-2.5 gap-4" : "rounded-2xl p-5 gap-6"
      }`} style={{ breakInside: "avoid" }}>
        {/* Contact Info */}
        <div style={highlightStyle("personal")} data-block="personal" className="break-inside-avoid">
          <h2 className="text-indigo-600 font-black uppercase tracking-widest text-[10px] mb-3">Contact</h2>
          <div className="space-y-2 text-[11px] font-bold text-slate-600">
            {personalInfo.email && <div className="truncate flex items-center gap-2"><span className="text-indigo-400 text-[8px]">✉</span>{personalInfo.email}</div>}
            {personalInfo.phone && <div className="flex items-center gap-2"><span className="text-indigo-400 text-[8px]">📞</span>{personalInfo.phone}</div>}
            {personalInfo.linkedin && <div className="truncate flex items-center gap-2"><span className="text-indigo-400 text-[8px]">🔗</span>{personalInfo.linkedin}</div>}
            {personalInfo.github && <div className="truncate flex items-center gap-2"><span className="text-indigo-400 text-[8px]">🐙</span>{personalInfo.github}</div>}
          </div>
        </div>

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div style={highlightStyle("skills")} data-block="skills" className="break-inside-avoid">
            <h2 className="text-indigo-600 font-black uppercase tracking-widest text-[10px] mb-3">Expertise</h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, index) => (
                <div key={index} className="bg-white border border-slate-200 px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-700 shadow-sm">
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extras - Projects */}
        {projects && projects.length > 0 && !previewMode && (
          <div style={highlightStyle("projects")} className="break-inside-avoid">
            <h2 className="text-indigo-600 font-black uppercase tracking-widest text-[10px] mb-3" data-block="projects-header">Key Projects</h2>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id} data-block="projects-item">
                  <div className="font-bold text-slate-900 text-[12px] mb-0.5">{proj.name}</div>
                  <div className="text-[9px] text-slate-500 font-bold mb-1 uppercase tracking-tight">{proj.duration}</div>
                  <p className="text-[10px] text-slate-600 leading-snug font-medium line-clamp-2">{proj.description.split("\n")[0]}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extras - Certifications */}
        {certifications && certifications.length > 0 && !previewMode && (
          <div style={highlightStyle("certifications")} data-block="certifications" className="break-inside-avoid">
            <h2 className="text-indigo-600 font-black uppercase tracking-widest text-[10px] mb-3">Honors</h2>
            <ul className="space-y-1.5">
              {certifications.map((cert, index) => (
                <li key={index} className="text-slate-600 text-[10px] font-bold flex items-start gap-2 leading-tight">
                  <span className="text-indigo-400 mt-1 shrink-0 text-[8px]">★</span>
                  <span>{cert}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
