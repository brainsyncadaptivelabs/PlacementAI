export interface ResumeState {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    leetcode: string;
    address?: string;
  };
  summary: string;
  skills: string[];
  experience: {
    id: string;
    company: string;
    role: string;
    duration: string;
    description: string;
  }[];
  projects: {
    id: string;
    name: string;
    role: string;
    duration: string;
    description: string;
  }[];
  education: {
    id: string;
    institution: string;
    degree: string;
    duration: string;
    details: string;
  }[];
  certifications: string[];
}

export const initialCorporateState: ResumeState = {
  personalInfo: {
    name: "Jonathan Vance",
    email: "j.vance@placementai.com",
    phone: "+1 (555) 987-6543",
    linkedin: "linkedin.com/in/jonathanvance",
    github: "github.com/jvance-corp",
    leetcode: "leetcode.com/jvance"
  },
  summary: "Results-driven Vice President of Operations with 15+ years of success in scaling Series C startups to global enterprises. Expert in Lean Six Sigma methodologies, M&A integration, and driving operational efficiency. Proven history of reducing overhead by 22% while increasing output capacity by 40% year-over-year.",
  skills: [
    "Strategic Planning & Execution",
    "Operational Excellence (Lean/Six Sigma)",
    "P&L Management ($50M+)",
    "Global Supply Chain Optimization",
    "Change Management & Culture Building",
    "Data-Driven Decision Making"
  ],
  experience: [
    {
      id: "corp-exp-1",
      company: "Stellar Systems Corp",
      role: "VP of Global Operations",
      duration: "Jan 2020 - Present",
      description: "Spearheaded the expansion into 4 new international markets, achieving profitability within 18 months.\nImplemented a unified ERP system across 12 global offices, saving $2M annually in administrative costs.\nNegotiated vendor contracts that reduced procurement lead times by 30%."
    },
    {
      id: "corp-exp-2",
      company: "Nexus Logistics Group",
      role: "Director of Strategy",
      duration: "May 2015 - Dec 2019",
      description: "Led a cross-functional team of 150 to redesign the core logistics network, improving delivery speed by 25%.\nOrchestrated the successful integration of 3 major acquisitions worth $85M.\nDeveloped a leadership training program that increased internal promotion rates by 15%."
    }
  ],
  projects: [
    {
      id: "corp-proj-1",
      name: "Project Titan",
      role: "Executive Sponsor",
      duration: "2021",
      description: "Automated 65% of manual reporting tasks using internal AI tools, redirecting 20k man-hours to strategic growth."
    }
  ],
  education: [
    {
      id: "corp-edu-1",
      institution: "Harvard Business School",
      degree: "MBA in General Management",
      duration: "2013 - 2015",
      details: "Baker Scholar. President of the Operations Club."
    }
  ],
  certifications: [
    "Lean Six Sigma Black Belt",
    "Chartered Financial Analyst (CFA)",
    "Executive Leadership Program - Stanford GSB"
  ]
};
