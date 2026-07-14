import React from "react";
import { ResumeData } from "./ResumeData";

export enum TemplateCategory {
  ATS = "ATS",
  COMPANY = "COMPANY",
  INTERNATIONAL = "INTERNATIONAL",
  ACADEMIC = "ACADEMIC",
  FINANCE = "FINANCE",
  HEALTHCARE = "HEALTHCARE"
}

export enum TemplateSubCategory {
  PROFESSIONAL = "Professional",
  CLASSIC = "Classic",
  EXPERIENCED = "Experienced",
  FRESHER = "Fresher",
  EXECUTIVE = "Executive",
  MODERN = "Modern",
  STARTUP = "Startup",
  BACKEND = "Backend",
  FRONTEND = "Frontend",
  AI = "AI & ML",
  CLOUD = "Cloud",
  ATS = "ATS",
  ACCENTURE = "Accenture",
  TCS = "TCS",
  COGNIZANT = "Cognizant",
  FAANG = "FAANG",
  IBM = "IBM",
  WIPRO = "Wipro",
  ORACLE = "Oracle",
  DELTAX = "DeltaX",
  ZENSAR = "Zensar",
  HCL = "HCL",
  DELOITTE = "Deloitte",
  EY = "EY"
}

export enum TemplateMode {
  PREVIEW = "PREVIEW",
  EDITOR = "EDITOR",
  EXPORT = "EXPORT"
}

export type ResumeSection = 
  | "personalInfo"
  | "summary"
  | "experience"
  | "projects"
  | "skills"
  | "education"
  | "certifications"
  | "achievements";

export interface TemplateTheme {
  fonts: {
    body: string;
    heading: string;
  };
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
  };
  spacing: {
    paddingX: string;
    paddingY: string;
    gapSections: string;
  };
  margins: string;
  header?: Record<string, any>;
  sidebar?: Record<string, any>;
  cards?: Record<string, any>;
  icons?: Record<string, any>;
  timeline?: Record<string, any>;
  ratingBars?: Record<string, any>;
  divider?: Record<string, any>;
}

export interface TemplateLayout {
  columns: number;
  headerHeight: number;
  sidebarWidth: number;
  sectionOrder: ResumeSection[];
}

export interface ResumeTemplateProps {
  resume: ResumeData;
  previewMode: boolean;
  theme: TemplateTheme;
  layout: TemplateLayout;
  highlightSection?: ResumeSection;
  mode: TemplateMode;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  subCategory: TemplateSubCategory;
  preview: string;
  originalPdf: string;
  atsFriendly: boolean;
  atsScore: number;
  complexity: "Low" | "Medium" | "High";
  recommendedRoles: string[];
  recommendedCompanies: string[];
  theme: TemplateTheme;
  layout: TemplateLayout;
  rules: {
    maxProjects: number;
    maxSkills: number;
    maxExperience: number;
    allowIcons: boolean;
    allowPhoto: boolean;
    columns: number;
  };
  capabilities: {
    photo: boolean;
    icons: boolean;
    multiColumn: boolean;
    ratingBars: boolean;
    timeline: boolean;
    qrCode: boolean;
    references: boolean;
    coverLetter: boolean;
  };
  component?: React.ComponentType<ResumeTemplateProps>;
}
