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
      sectionOrder: ["personalInfo", "summary", "skills", "experience", "projects", "education", "certifications", "achievements"]
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
      sectionOrder: ["personalInfo", "summary", "skills", "experience", "projects", "education", "certifications", "achievements"]
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
    id: "modern",
    name: "Modern",
    category: TemplateCategory.ATS,
    subCategory: TemplateSubCategory.MODERN,
    preview: "/resume-templates/ats/modern/preview.png",
    originalPdf: "Modern.pdf",
    atsFriendly: true,
    atsScore: 96,
    complexity: "Medium",
    recommendedRoles: ["Software Engineer", "Product Manager", "Designer"],
    recommendedCompanies: ["Google", "Meta", "Accenture"],
    theme: {
      fonts: {
        body: "Inter, sans-serif",
        heading: "Inter, sans-serif"
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
        gapSections: "1.3rem"
      },
      margins: "0.75in"
    },
    layout: {
      columns: 1,
      headerHeight: 100,
      sidebarWidth: 0,
      sectionOrder: ["personalInfo", "summary", "skills", "experience", "projects", "education", "certifications", "achievements"]
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
      icons: true,
      multiColumn: false,
      ratingBars: false,
      timeline: false,
      qrCode: false,
      references: true,
      coverLetter: false
    }
  },
  {
    id: "ats",
    name: "ATS",
    category: TemplateCategory.ATS,
    subCategory: TemplateSubCategory.ATS,
    preview: "/resume-templates/ats/ats/preview.png",
    originalPdf: "ATS.pdf",
    atsFriendly: true,
    atsScore: 98,
    complexity: "Low",
    recommendedRoles: ["Software Engineer", "Quality Assurance", "System Engineer"],
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
      sectionOrder: ["personalInfo", "summary", "skills", "experience", "projects", "education", "certifications", "achievements"]
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
    id: "accenture-style",
    name: "Accenture",
    category: TemplateCategory.COMPANY,
    subCategory: TemplateSubCategory.ACCENTURE,
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
    name: "TCS",
    category: TemplateCategory.COMPANY,
    subCategory: TemplateSubCategory.TCS,
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
      sectionOrder: ["personalInfo", "summary", "skills", "experience", "projects", "education", "certifications", "achievements"]
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
    name: "Cognizant",
    category: TemplateCategory.COMPANY,
    subCategory: TemplateSubCategory.COGNIZANT,
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
    name: "FAANG",
    category: TemplateCategory.COMPANY,
    subCategory: TemplateSubCategory.FAANG,
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
  },
  {
    id: "ibm-style",
    name: "IBM",
    category: TemplateCategory.COMPANY,
    subCategory: TemplateSubCategory.IBM,
    preview: "/resume-templates/company-based/ibm/preview.png",
    originalPdf: "IBM.pdf",
    atsFriendly: true,
    atsScore: 97,
    complexity: "High",
    recommendedRoles: ["Enterprise Data Engineering", "Data Platforms", "ETL Pipelines"],
    recommendedCompanies: ["IBM", "Red Hat", "Kyndryl"],
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
        gapSections: "1.4rem"
      },
      margins: "0.75in"
    },
    layout: {
      columns: 1,
      headerHeight: 110,
      sidebarWidth: 0,
      sectionOrder: ["personalInfo", "skills", "projects", "experience", "education"]
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
    id: "wipro-style",
    name: "Wipro",
    category: TemplateCategory.COMPANY,
    subCategory: TemplateSubCategory.WIPRO,
    preview: "/resume-templates/company-based/wipro/preview.png",
    originalPdf: "Wipro.pdf",
    atsFriendly: true,
    atsScore: 95,
    complexity: "Medium",
    recommendedRoles: ["Data Engineer", "Digital Transformation", "ETL Developer"],
    recommendedCompanies: ["Wipro", "Cognizant", "TCS"],
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
        gapSections: "1.3rem"
      },
      margins: "0.75in"
    },
    layout: {
      columns: 1,
      headerHeight: 100,
      sidebarWidth: 0,
      sectionOrder: ["personalInfo", "skills", "projects", "experience", "education"]
    },
    rules: {
      maxProjects: 3,
      maxSkills: 18,
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
    id: "oracle-style",
    name: "Oracle",
    category: TemplateCategory.COMPANY,
    subCategory: TemplateSubCategory.ORACLE,
    preview: "/resume-templates/company-based/oracle/preview.png",
    originalPdf: "Oracle.pdf",
    atsFriendly: true,
    atsScore: 96,
    complexity: "High",
    recommendedRoles: ["Oracle Cloud Infrastructure Engineer", "Enterprise Data Engineer", "Database Administrator"],
    recommendedCompanies: ["Oracle", "Salesforce", "SAP"],
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
        gapSections: "1.5rem"
      },
      margins: "0.75in"
    },
    layout: {
      columns: 1,
      headerHeight: 110,
      sidebarWidth: 0,
      sectionOrder: ["personalInfo", "skills", "projects", "experience", "education"]
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
    id: "deltax-style",
    name: "DeltaX",
    category: TemplateCategory.COMPANY,
    subCategory: TemplateSubCategory.DELTAX,
    preview: "/resume-templates/company-based/deltax/preview.png",
    originalPdf: "DeltaX.pdf",
    atsFriendly: true,
    atsScore: 94,
    complexity: "Medium",
    recommendedRoles: ["Data Engineer", "Advertising Technology Analyst", "Software Developer"],
    recommendedCompanies: ["DeltaX", "InMobi", "Media.net"],
    theme: {
      fonts: {
        body: "Inter, sans-serif",
        heading: "Inter, sans-serif"
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
        gapSections: "1.3rem"
      },
      margins: "0.75in"
    },
    layout: {
      columns: 1,
      headerHeight: 100,
      sidebarWidth: 0,
      sectionOrder: ["personalInfo", "skills", "projects", "experience", "education"]
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
    id: "zensar-style",
    name: "Zensar",
    category: TemplateCategory.COMPANY,
    subCategory: TemplateSubCategory.ZENSAR,
    preview: "/resume-templates/company-based/zensar/preview.png",
    originalPdf: "Zensar.pdf",
    atsFriendly: true,
    atsScore: 95,
    complexity: "Medium",
    recommendedRoles: ["Enterprise Data Engineer", "Digital Transformation Consultant", "Cloud Data Specialist"],
    recommendedCompanies: ["Zensar Technologies", "Tech Mahindra", "Wipro"],
    theme: {
      fonts: {
        body: "Inter, sans-serif",
        heading: "Inter, sans-serif"
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
        gapSections: "1.3rem"
      },
      margins: "0.75in"
    },
    layout: {
      columns: 1,
      headerHeight: 100,
      sidebarWidth: 0,
      sectionOrder: ["personalInfo", "skills", "projects", "experience", "education"]
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
    id: "hcl-style",
    name: "HCL",
    category: TemplateCategory.COMPANY,
    subCategory: TemplateSubCategory.HCL,
    preview: "/resume-templates/company-based/hcl/preview.png",
    originalPdf: "HCL.pdf",
    atsFriendly: true,
    atsScore: 93,
    complexity: "Low",
    recommendedRoles: ["Graduate Engineer Trainee", "Associate Software Engineer", "Network Engineer"],
    recommendedCompanies: ["HCLTech", "Cognizant", "TCS"],
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
        gapSections: "1.2rem"
      },
      margins: "0.75in"
    },
    layout: {
      columns: 1,
      headerHeight: 100,
      sidebarWidth: 0,
      sectionOrder: ["personalInfo", "skills", "projects", "experience", "education"]
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
    id: "deloitte-style",
    name: "Deloitte",
    category: TemplateCategory.COMPANY,
    subCategory: TemplateSubCategory.DELOITTE,
    preview: "/resume-templates/company-based/deloitte/preview.png",
    originalPdf: "Deloitte.pdf",
    atsFriendly: true,
    atsScore: 96,
    complexity: "Medium",
    recommendedRoles: ["Analyst", "Consultant", "Business Analyst", "Data Analyst"],
    recommendedCompanies: ["Deloitte", "EY", "KPMG", "PwC"],
    theme: {
      fonts: {
        body: "Inter, sans-serif",
        heading: "Inter, sans-serif"
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
        gapSections: "1.4rem"
      },
      margins: "0.75in"
    },
    layout: {
      columns: 1,
      headerHeight: 110,
      sidebarWidth: 0,
      sectionOrder: ["personalInfo", "skills", "projects", "experience", "education"]
    },
    rules: {
      maxProjects: 4,
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
    id: "executive-style",
    name: "Executive ATS",
    category: TemplateCategory.ATS,
    subCategory: TemplateSubCategory.EXECUTIVE,
    preview: "/resume-templates/ats/executive/preview.png",
    originalPdf: "Executive.pdf",
    atsFriendly: true,
    atsScore: 98,
    complexity: "High",
    recommendedRoles: ["Engineering Manager", "Director of Engineering", "Principal Architect"],
    recommendedCompanies: ["Google", "Amazon", "Microsoft", "Meta"],
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
    id: "ey-style",
    name: "EY",
    category: TemplateCategory.COMPANY,
    subCategory: TemplateSubCategory.EY,
    preview: "/resume-templates/company-based/ey/preview.png",
    originalPdf: "EY.pdf",
    atsFriendly: true,
    atsScore: 96,
    complexity: "Medium",
    recommendedRoles: ["Analyst", "Consultant", "Business Intelligence Developer", "Data Analyst"],
    recommendedCompanies: ["EY", "Deloitte", "PwC", "KPMG"],
    theme: {
      fonts: {
        body: "Inter, sans-serif",
        heading: "Inter, sans-serif"
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
        gapSections: "1.4rem"
      },
      margins: "0.75in"
    },
    layout: {
      columns: 1,
      headerHeight: 110,
      sidebarWidth: 0,
      sectionOrder: ["personalInfo", "skills", "projects", "experience", "education"]
    },
    rules: {
      maxProjects: 4,
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
  }
];

export const TEMPLATE_REGISTRY: Record<string, ResumeTemplate> = ACTIVE_TEMPLATES.reduce((acc, tpl) => {
  acc[tpl.id] = {
    ...tpl,
    component: TemplateEngine
  };
  return acc;
}, {} as Record<string, ResumeTemplate>);
