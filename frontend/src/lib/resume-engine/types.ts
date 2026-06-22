export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
  details: string[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string[];
}

export interface Project {
  id: string;
  name: string;
  technologies: string[];
  link: string;
  startDate: string;
  endDate: string;
  description: string[];
}

export interface Skill {
  category: string;
  items: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link: string;
}

export interface Achievement {
  id: string;
  title: string;
  date: string;
  description: string;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: string;
}

export interface ResumeData {
  id?: string;
  title: string;
  personalInfo: PersonalInfo;
  summary: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skill[];
  certifications: Certification[];
  achievements: Achievement[];
  sectionOrder: string[]; // e.g. ["experience", "education", "projects", "skills"]
  theme: ThemeConfig;
}

export interface TemplateConfig {
  id: string;
  name: string;
  author: string;
  description: string;
  tags: string[];
  features: string[];
  isAtsFriendly: boolean;
  defaultTheme: ThemeConfig;
}

export interface TemplateProps {
  data: ResumeData;
  theme: ThemeConfig;
  previewMode?: boolean;
}
