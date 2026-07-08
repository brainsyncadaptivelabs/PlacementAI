import React from "react";
import { ResumeTemplateProps, ResumeSection } from "./types/TemplateTypes";

export const TemplateEngine: React.FC<ResumeTemplateProps> = ({
  resume,
  previewMode,
  theme,
  layout,
  highlightSection,
  mode
}) => {
  const { personalInfo, summary, experience = [], projects = [], education = [], skills = [], certifications = [] } = resume || {};

  // Inline styling based on theme
  const containerStyle: React.CSSProperties = {
    fontFamily: theme.fonts.body,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    padding: theme.margins || "0.75in",
    minHeight: mode === "PREVIEW" ? "100%" : "297mm", // A4 height approx
    width: "100%",
    boxSizing: "border-box",
    lineHeight: 1.4,
    fontSize: "10.5pt",
  };

  const renderSectionHeader = (title: string, isHighlighted: boolean) => (
    <h2
      style={{
        fontFamily: theme.fonts.heading,
        color: theme.colors.primary,
        fontSize: "12pt",
        fontWeight: "bold",
        textTransform: "uppercase",
        borderBottom: `1.5px solid ${theme.colors.primary}`,
        paddingBottom: "2px",
        marginBottom: "6px",
        marginTop: "12px",
        transition: "all 0.2s ease-in-out",
        backgroundColor: isHighlighted ? "rgba(79, 70, 229, 0.1)" : "transparent",
        borderRadius: "4px"
      }}
    >
      {title}
    </h2>
  );

  const renderSection = (section: ResumeSection) => {
    const isHighlighted = highlightSection === section;

    switch (section) {
      case "personalInfo":
        if (!personalInfo) return null;
        return (
          <div
            key={section}
            data-block="personalInfo"
            style={{
              textAlign: "center",
              marginBottom: "12px",
              backgroundColor: isHighlighted ? "rgba(79, 70, 229, 0.1)" : "transparent",
              padding: "4px",
              borderRadius: "4px"
            }}
          >
            <h1
              style={{
                fontFamily: theme.fonts.heading,
                color: theme.colors.primary,
                fontSize: "22pt",
                fontWeight: "800",
                margin: 0,
                letterSpacing: "-0.5px",
              }}
            >
              {personalInfo.name}
            </h1>
            <div
              style={{
                fontSize: "9pt",
                color: theme.colors.secondary,
                marginTop: "4px",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>| {personalInfo.phone}</span>}
              {personalInfo.address && <span>| {personalInfo.address}</span>}
              {personalInfo.linkedin && (
                <span>
                  | <a href={`https://${personalInfo.linkedin}`} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>LinkedIn</a>
                </span>
              )}
              {personalInfo.github && (
                <span>
                  | <a href={`https://${personalInfo.github}`} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>GitHub</a>
                </span>
              )}
              {personalInfo.leetcode && (
                <span>
                  | <a href={`https://${personalInfo.leetcode}`} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>LeetCode</a>
                </span>
              )}
            </div>
          </div>
        );

      case "summary":
        if (!summary) return null;
        return (
          <div key={section} data-block="summary" style={{ marginBottom: theme.spacing.gapSections }}>
            {renderSectionHeader("Summary", isHighlighted)}
            <p style={{ margin: 0, fontSize: "10pt", textAlign: "justify" }}>{summary}</p>
          </div>
        );

      case "skills":
        if (!skills || skills.length === 0) return null;
        
        // Parse user-defined skills categories. Checks if array items contain colon tags "Category: Skill1, Skill2..."
        const parsedCategories: Record<string, string[]> = {};
        const defaultCategory = "Technical Skills";

        skills.forEach(sk => {
          if (sk.includes(":")) {
            const parts = sk.split(":");
            const category = parts[0].trim();
            const val = parts.slice(1).join(":").trim();
            if (category && val) {
              const list = val.split(",").map(s => s.trim()).filter(Boolean);
              if (!parsedCategories[category]) parsedCategories[category] = [];
              parsedCategories[category] = [...parsedCategories[category], ...list];
            }
          } else {
            const list = sk.split(",").map(s => s.trim()).filter(Boolean);
            if (!parsedCategories[defaultCategory]) parsedCategories[defaultCategory] = [];
            parsedCategories[defaultCategory] = [...parsedCategories[defaultCategory], ...list];
          }
        });

        return (
          <div key={section} data-block="skills" style={{ marginBottom: theme.spacing.gapSections }}>
            {renderSectionHeader("Technical Skills", isHighlighted)}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "9.5pt" }}>
              {Object.entries(parsedCategories).map(([category, list]) => (
                <div key={category} style={{ lineHeight: 1.45 }}>
                  <strong style={{ color: theme.colors.primary }}>{category}:</strong>{" "}
                  <span>{list.join(", ")}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case "experience":
        if (!experience || experience.length === 0) return null;
        return (
          <div key={section} data-block="experience" style={{ marginBottom: theme.spacing.gapSections }}>
            {renderSectionHeader("Experience", isHighlighted)}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                    <span style={{ color: theme.colors.primary }}>{exp.company}</span>
                    <span style={{ fontSize: "9pt", fontWeight: "normal", color: theme.colors.secondary }}>{exp.duration}</span>
                  </div>
                  <div style={{ fontStyle: "italic", fontSize: "9.5pt", marginBottom: "3px" }}>{exp.role}</div>
                  <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "9.5pt", textAlign: "justify" }}>
                    {exp.description.split("\n").map((line, idx) => (
                      <li key={idx} style={{ marginBottom: "2px" }}>{line.replace(/^-\s*/, "")}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );

      case "projects":
        if (!projects || projects.length === 0) return null;
        return (
          <div key={section} data-block="projects" style={{ marginBottom: theme.spacing.gapSections }}>
            {renderSectionHeader("Projects", isHighlighted)}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {projects.map((proj) => (
                <div key={proj.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                    <span style={{ color: theme.colors.primary }}>{proj.name}</span>
                    <span style={{ fontSize: "9pt", fontWeight: "normal", color: theme.colors.secondary }}>{proj.duration}</span>
                  </div>
                  <div style={{ fontStyle: "italic", fontSize: "9.5pt", marginBottom: "3px" }}>{proj.role}</div>
                  <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "9.5pt", textAlign: "justify" }}>
                    {proj.description.split("\n").map((line, idx) => (
                      <li key={idx} style={{ marginBottom: "2px" }}>{line.replace(/^-\s*/, "")}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );

      case "education":
        if (!education || education.length === 0) return null;
        return (
          <div key={section} data-block="education" style={{ marginBottom: theme.spacing.gapSections }}>
            {renderSectionHeader("Education", isHighlighted)}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {education.map((edu) => (
                <div key={edu.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                    <span style={{ color: theme.colors.primary }}>{edu.institution}</span>
                    <span style={{ fontSize: "9pt", fontWeight: "normal", color: theme.colors.secondary }}>{edu.duration}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5pt" }}>
                    <span>{edu.degree}</span>
                    <span style={{ fontSize: "9pt", color: theme.colors.secondary }}>{edu.details}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "certifications":
        if (!certifications || certifications.length === 0) return null;
        return (
          <div key={section} data-block="certifications" style={{ marginBottom: theme.spacing.gapSections }}>
            {renderSectionHeader("Certifications", isHighlighted)}
            <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "9.5pt" }}>
              {certifications.map((cert, idx) => (
                <li key={idx} style={{ marginBottom: "2px" }}>{cert}</li>
              ))}
            </ul>
          </div>
        );

      case "achievements":
        const achievementsList = resume.achievements || [];
        if (achievementsList.length === 0) return null;
        return (
          <div key={section} data-block="achievements" style={{ marginBottom: theme.spacing.gapSections }}>
            {renderSectionHeader("Achievements", isHighlighted)}
            <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "9.5pt" }}>
              {achievementsList.map((ach, idx) => (
                <li key={idx} style={{ marginBottom: "2px" }}>{ach}</li>
              ))}
            </ul>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={containerStyle}>
      {layout.sectionOrder.map((section) => renderSection(section))}
    </div>
  );
};
