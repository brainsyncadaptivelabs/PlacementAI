import { ResumeTemplate, TemplateCategory, TemplateSubCategory } from "./types/TemplateTypes";
import { TemplateEngine } from "./TemplateEngine";

export const ACTIVE_TEMPLATES: ResumeTemplate[] = [
  {
    id: "professional-ats",
    name: "Professional",
    category: TemplateCategory.ATS,
    subCategory: TemplateSubCategory.PROFESSIONAL,
    preview: "/resume-templates/ats/professional/preview.png",
    originalPdf: "Professional.pdf",
    atsFriendly: true,
    atsScore: 94,
    complexity: "Low",
    recommendedRoles: ["Software Developer", "IT Support Assistant", "Associate Software Engineer"],
    recommendedCompanies: ["TCS", "Accenture", "Cognizant"],
    theme: {
      fonts: {
        body: "Inter, sans-serif",
        heading: "Inter, sans-serif"
      },
      colors: {
        primary: "#111827",
        secondary: "#4b5563",
        text: "#1f2937",
        background: "#ffffff"
      },
      spacing: {
        paddingX: "1.5in",
        paddingY: "1.5in",
        gapSections: "1.2rem"
      },
      margins: "0.75in"
    },
    layout: {
      columns: 1,
      headerHeight: 100,
      sidebarWidth: 0,
      sectionOrder: ["personalInfo", "summary", "skills", "experience", "projects", "education", "certifications"]
    },
    rules: {
      maxProjects: 3,
      maxSkills: 16,
      maxExperience: 2,
      allowIcons: false,
      allowPhoto: false,
      columns: 1
    },
    capabilities: {
      photo: false,
      icons: false,
      multiColumn: false,
      ratingBars: false,
      timeline: false,
      qrCode: false,
      references: true,
      coverLetter: false
    }
  },
  {
    id: "classic-ats",
    name: "Classic",
    category: TemplateCategory.ATS,
    subCategory: TemplateSubCategory.CLASSIC,
    preview: "/resume-templates/ats/classic/preview.png",
    originalPdf: "Classic.pdf",
    atsFriendly: true,
    atsScore: 95,
    complexity: "Low",
    recommendedRoles: ["Software Engineer", "Assistant System Engineer", "TCS Ninja", "Web Developer Intern"],
    recommendedCompanies: ["TCS", "Wipro", "Infosys", "Cognizant"],
    theme: {
      fonts: {
        body: "Inter, sans-serif",
        heading: "Inter, sans-serif"
      },
      colors: {
        primary: "#1e293b",
        secondary: "#475569",
        text: "#0f172a",
        background: "#ffffff"
      },
      spacing: {
        paddingX: "1.5in",
        paddingY: "1.5in",
        gapSections: "1.25rem"
      },
      margins: "0.75in"
    },
    layout: {
      columns: 1,
      headerHeight: 100,
      sidebarWidth: 0,
      sectionOrder: ["personalInfo", "summary", "skills", "experience", "projects", "education", "certifications"]
    },
    rules: {
      maxProjects: 3,
      maxSkills: 15,
      maxExperience: 2,
      allowIcons: false,
      allowPhoto: false,
      columns: 1
    },
    capabilities: {
      photo: false,
      icons: false,
      multiColumn: false,
      ratingBars: false,
      timeline: false,
      qrCode: false,
      references: true,
      coverLetter: false
    }
  },
  {
    id: "experienced-ats",
    name: "Experienced",
    category: TemplateCategory.ATS,
    subCategory: TemplateSubCategory.EXPERIENCED,
    preview: "/resume-templates/ats/experienced/preview.png",
    originalPdf: "Experienced.pdf",
    atsFriendly: true,
    atsScore: 98,
    complexity: "High",
    recommendedRoles: ["Senior Full-Stack Developer", "Tech Lead", "Software Architect", "Engineering Manager"],
    recommendedCompanies: ["Google", "Amazon", "Microsoft", "Meta", "Netflix"],
    theme: {
      fonts: {
        body: "Inter, sans-serif",
        heading: "Inter, sans-serif"
      },
      colors: {
        primary: "#090d16",
        secondary: "#1e293b",
        text: "#0f172a",
        background: "#ffffff"
      },
      spacing: {
        paddingX: "1.5in",
        paddingY: "1.5in",
        gapSections: "1.6rem"
      },
      margins: "0.75in"
    },
    layout: {
      columns: 1,
      headerHeight: 120,
      sidebarWidth: 0,
      sectionOrder: ["personalInfo", "summary", "experience", "projects", "education", "skills", "certifications"]
    },
    rules: {
      maxProjects: 4,
      maxSkills: 25,
      maxExperience: 5,
      allowIcons: true,
      allowPhoto: false,
      columns: 1
    },
    capabilities: {
      photo: false,
      icons: true,
      multiColumn: false,
      ratingBars: false,
      timeline: true,
      qrCode: false,
      references: true,
      coverLetter: true
    }
  },
  {
    id: "accenture-style",
    name: "Backend",
    category: TemplateCategory.COMPANY,
    subCategory: TemplateSubCategory.BACKEND,
    preview: "/resume-templates/company-based/accenture/preview.png",
    originalPdf: "Accenture.pdf",
    atsFriendly: true,
    atsScore: 95,
    complexity: "Medium",
    recommendedRoles: ["Full Stack Java Developer", "Backend Developer", "Spring Boot Developer", "Microservices Engineer"],
    recommendedCompanies: ["Accenture", "Capgemini", "LTI Mindtree", "TCS"],
    theme: {
      fonts: {
        body: "Roboto, sans-serif",
        heading: "Roboto, sans-serif"
      },
      colors: {
        primary: "#0f172a",
        secondary: "#334155",
        text: "#1e293b",
        background: "#ffffff"
      },
      spacing: {
        paddingX: "1.5in",
        paddingY: "1.5in",
        gapSections: "1.5rem"
      },
      margins: "0.75in"
    },
    layout: {
      columns: 1,
      headerHeight: 110,
      sidebarWidth: 0,
      sectionOrder: ["personalInfo", "summary", "skills", "projects", "experience", "education", "certifications"]
    },
    rules: {
      maxProjects: 4,
      maxSkills: 20,
      maxExperience: 3,
      allowIcons: false,
      allowPhoto: false,
      columns: 1
    },
    capabilities: {
      photo: false,
      icons: false,
      multiColumn: false,
      ratingBars: false,
      timeline: false,
      qrCode: false,
      references: true,
      coverLetter: false
    }
  },
  {
    id: "tcs-style",
    name: "Startup",
    category: TemplateCategory.COMPANY,
    subCategory: TemplateSubCategory.FRESHER,
    preview: "/resume-templates/company-based/tcs/preview.png",
    originalPdf: "TCS.pdf",
    atsFriendly: true,
    atsScore: 95,
    complexity: "Low",
    recommendedRoles: ["Software Engineer", "Assistant System Engineer", "TCS Ninja", "Web Developer Intern"],
    recommendedCompanies: ["TCS", "Wipro", "Infosys", "Cognizant"],
    theme: {
      fonts: {
        body: "Inter, sans-serif",
        heading: "Inter, sans-serif"
      },
      colors: {
        primary: "#1e293b",
        secondary: "#475569",
        text: "#0f172a",
        background: "#ffffff"
      },
      spacing: {
        paddingX: "1.5in",
        paddingY: "1.5in",
        gapSections: "1.25rem"
      },
      margins: "0.75in"
    },
    layout: {
      columns: 1,
      headerHeight: 100,
      sidebarWidth: 0,
      sectionOrder: ["personalInfo", "summary", "skills", "experience", "projects", "education", "certifications"]
    },
    rules: {
      maxProjects: 3,
      maxSkills: 15,
      maxExperience: 2,
      allowIcons: false,
      allowPhoto: false,
      columns: 1
    },
    capabilities: {
      photo: false,
      icons: false,
      multiColumn: false,
      ratingBars: false,
      timeline: false,
      qrCode: false,
      references: true,
      coverLetter: false
    }
  },
  {
    id: "cognizant-style",
    name: "Java Full Stack",
    category: TemplateCategory.COMPANY,
    subCategory: TemplateSubCategory.PROFESSIONAL,
    preview: "/resume-templates/company-based/cognizant/preview.png",
    originalPdf: "Cognizant.pdf",
    atsFriendly: true,
    atsScore: 96,
    complexity: "Medium",
    recommendedRoles: ["Junior Software Engineer", "Java Full Stack Developer", "Frontend Developer"],
    recommendedCompanies: ["Cognizant", "HCL", "Tech Mahindra", "DXC Technology"],
    theme: {
      fonts: {
        body: "Outfit, sans-serif",
        heading: "Outfit, sans-serif"
      },
      colors: {
        primary: "#111827",
        secondary: "#374151",
        text: "#1f2937",
        background: "#ffffff"
      },
      spacing: {
        paddingX: "1.5in",
        paddingY: "1.5in",
        gapSections: "1.3in"
      },
      margins: "0.75in"
    },
    layout: {
      columns: 1,
      headerHeight: 100,
      sidebarWidth: 0,
      sectionOrder: ["personalInfo", "experience", "projects", "skills", "education", "certifications"]
    },
    rules: {
      maxProjects: 3,
      maxSkills: 18,
      maxExperience: 3,
      allowIcons: false,
      allowPhoto: false,
      columns: 1
    },
    capabilities: {
      photo: false,
      icons: false,
      multiColumn: false,
      ratingBars: false,
      timeline: false,
      qrCode: false,
      references: true,
      coverLetter: false
    }
  },
  {
    id: "faang-style",
    name: "Software Engineer",
    category: TemplateCategory.COMPANY,
    subCategory: TemplateSubCategory.EXECUTIVE,
    preview: "/resume-templates/company-based/faang/preview.png",
    originalPdf: "FAANG.pdf",
    atsFriendly: true,
    atsScore: 98,
    complexity: "High",
    recommendedRoles: ["Senior Full-Stack Developer", "Tech Lead", "Software Architect", "Engineering Manager"],
    recommendedCompanies: ["Google", "Amazon", "Microsoft", "Meta", "Netflix"],
    theme: {
      fonts: {
        body: "Inter, sans-serif",
        heading: "Inter, sans-serif"
      },
      colors: {
        primary: "#090d16",
        secondary: "#1e293b",
        text: "#0f172a",
        background: "#ffffff"
      },
      spacing: {
        paddingX: "1.5in",
        paddingY: "1.5in",
        gapSections: "1.6rem"
      },
      margins: "0.75in"
    },
    layout: {
      columns: 1,
      headerHeight: 120,
      sidebarWidth: 0,
      sectionOrder: ["personalInfo", "summary", "experience", "projects", "education", "skills", "certifications"]
    },
    rules: {
      maxProjects: 4,
      maxSkills: 25,
      maxExperience: 5,
      allowIcons: true,
      allowPhoto: false,
      columns: 1
    },
    capabilities: {
      photo: false,
      icons: true,
      multiColumn: false,
      ratingBars: false,
      timeline: true,
      qrCode: false,
      references: true,
      coverLetter: true
    }
  }
];

export const TEMPLATE_REGISTRY: Record<string, ResumeTemplate> = ACTIVE_TEMPLATES.reduce((acc, tpl) => {
  acc[tpl.id] = {
    ...tpl,
    component: TemplateEngine
  };
  return acc;
}, {} as Record<string, ResumeTemplate>);
