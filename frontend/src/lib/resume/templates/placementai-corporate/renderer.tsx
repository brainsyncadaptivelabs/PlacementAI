import React from "react";
import { ResumeState } from "./schema";

interface RendererProps {
  data: ResumeState;
  previewMode?: boolean;
  highlightSection?: string;
}

export default function CorporateRenderer({ data, previewMode = false, highlightSection = "" }: RendererProps) {
  const { personalInfo, summary, skills, experience, projects, education, certifications } = data;

  const highlightStyle = (sectionName: string) => {
    if (previewMode || highlightSection !== sectionName) return {};
    return {
      outline: "2px solid #0f172a",
      outlineOffset: "4px",
      borderRadius: "4px",
      backgroundColor: "rgba(15, 23, 42, 0.02)",
      transition: "all 0.2s ease"
    };
  };

  return (
    <div 
      className={`bg-white text-slate-800 font-sans leading-tight selection:bg-slate-200 ${
        previewMode ? "p-3.5 text-[9.5px]" : "p-[48px] text-[13px]"
      }`}
      style={{
        fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        minHeight: previewMode ? "auto" : "1120px",
        width: previewMode ? "100%" : "950px",
        boxSizing: "border-box",
        margin: "0 auto"
      }}
    >
      {/* Header section */}
      <div 
        className={`border-slate-900 flex justify-between items-end ${
          previewMode ? "border-b-2 pb-2 mb-3" : "border-b-4 pb-6 mb-8"
        }`} 
        style={highlightStyle("personal")} 
        data-block="personal"
      >
        <div>
          <h1 className={`${previewMode ? "text-xl" : "text-5xl"} font-black tracking-tighter text-slate-950 uppercase leading-none`}>
            {personalInfo.name || "Your Name"}
          </h1>
          <div className={`text-slate-500 font-bold uppercase tracking-[0.2em] ${previewMode ? "text-[8px] mt-1" : "text-[10px] mt-2"}`}>
            Executive Professional
          </div>
        </div>
        <div className={`text-right font-bold text-slate-600 ${previewMode ? "text-[9px] space-y-0.5" : "text-[11px] space-y-1"}`}>
          <div>{personalInfo.email}</div>
          <div>{personalInfo.phone}</div>
          <div className="text-slate-400">{personalInfo.linkedin}</div>
        </div>
      </div>

      {/* Summary section */}
      {summary && (
        <div className={previewMode ? "mb-3" : "mb-8"} style={highlightStyle("summary")} data-block="summary">
          <h2 className={`text-slate-950 font-black uppercase tracking-widest flex items-center gap-3 ${
            previewMode ? "text-[10px] mb-1.5" : "text-[12px] mb-3"
          }`}>
            <span>Executive Summary</span>
            <div className="h-px bg-slate-200 flex-1" />
          </h2>
          <p className="text-slate-700 text-justify leading-relaxed font-medium">{summary}</p>
        </div>
      )}

      {/* Skills section */}
      {skills && skills.length > 0 && (
        <div className={previewMode ? "mb-3" : "mb-8"} style={highlightStyle("skills")} data-block="skills">
          <h2 className={`text-slate-950 font-black uppercase tracking-widest flex items-center gap-3 ${
            previewMode ? "text-[10px] mb-1.5" : "text-[12px] mb-3"
          }`}>
            <span>Core Competencies</span>
            <div className="h-px bg-slate-200 flex-1" />
          </h2>
          <div className={`grid grid-cols-3 gap-x-4 ${previewMode ? "gap-y-1" : "gap-y-2"}`}>
            {skills.map((skill, index) => (
              <div key={index} className="text-slate-700 font-bold flex items-center gap-2">
                <div className={`bg-slate-900 shrink-0 ${previewMode ? "w-1 h-1" : "w-1.5 h-1.5"}`} />
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience section */}
      {experience && experience.length > 0 && (
        <div className={previewMode ? "mb-3" : "mb-8"} style={highlightStyle("experience")}>
          <h2 className={`text-slate-950 font-black uppercase tracking-widest flex items-center gap-3 ${
            previewMode ? "text-[10px] mb-2" : "text-[12px] mb-4"
          }`} data-block="experience-header">
            <span>Professional Experience</span>
            <div className="h-px bg-slate-200 flex-1" />
          </h2>
          <div className={previewMode ? "space-y-3" : "space-y-8"}>
            {experience.map((exp) => (
              <div key={exp.id} data-block="experience-item">
                <div className="flex justify-between items-end mb-1">
                  <div>
                    <div className={`font-black text-slate-900 uppercase tracking-tight ${previewMode ? "text-sm leading-tight" : "text-lg leading-none"}`}>{exp.company}</div>
                    <div className={`text-indigo-600 font-black uppercase tracking-wide ${previewMode ? "text-[10px] mt-0.5" : "text-xs mt-1"}`}>{exp.role}</div>
                  </div>
                  <div className={`font-black text-slate-400 uppercase tracking-widest ${previewMode ? "text-[9px]" : "text-[11px]"}`}>{exp.duration}</div>
                </div>
                <ul className={`mt-1.5 ${previewMode ? "space-y-1" : "space-y-2"}`}>
                  {exp.description.split("\n").filter(line => line.trim().length > 0).map((bullet, idx) => (
                    <li key={idx} className="text-slate-700 leading-relaxed flex items-start gap-2.5">
                      <span className="text-slate-300 mt-1.5 shrink-0 text-[8px]">■</span>
                      <span className="font-medium">{bullet.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education section */}
      {education && education.length > 0 && !previewMode && (
        <div className="mb-8" style={highlightStyle("education")}>
          <h2 className="text-slate-950 font-black uppercase tracking-widest text-[12px] mb-4 flex items-center gap-3" data-block="education-header">
            <span>Academic Background</span>
            <div className="h-px bg-slate-200 flex-1" />
          </h2>
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-start" data-block="education-item">
                <div>
                  <div className="font-black text-slate-900 text-base uppercase tracking-tight">{edu.institution}</div>
                  <div className="text-slate-600 font-bold italic">{edu.degree}</div>
                  {edu.details && <div className="text-slate-500 text-[11px] mt-1 font-medium">{edu.details}</div>}
                </div>
                <div className="text-slate-400 font-black text-[11px] uppercase tracking-widest whitespace-nowrap ml-4">{edu.duration}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications & Projects */}
      {!previewMode && (certifications || projects) && (
        <div className="grid grid-cols-2 gap-8">
           {certifications && certifications.length > 0 && (
              <div style={highlightStyle("certifications")} data-block="certifications">
                <h2 className="text-slate-950 font-black uppercase tracking-widest text-[12px] mb-3">Certifications</h2>
                <ul className="space-y-1.5">
                  {certifications.map((cert, index) => (
                    <li key={index} className="text-slate-700 text-[11px] font-bold flex items-center gap-2">
                      <div className="w-1 h-1 bg-slate-400" />
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
           )}
           {projects && projects.length > 0 && (
              <div style={highlightStyle("projects")}>
                <h2 className="text-slate-950 font-black uppercase tracking-widest text-[12px] mb-3" data-block="projects-header">Key Projects</h2>
                <div className="space-y-2">
                  {projects.map((proj) => (
                    <div key={proj.id} data-block="projects-item">
                      <div className="font-bold text-slate-900 text-[11px]">{proj.name}</div>
                      <div className="text-[10px] text-slate-500 font-bold">{proj.duration}</div>
                    </div>
                  ))}
                </div>
              </div>
           )}
        </div>
      )}
    </div>
  );
}
