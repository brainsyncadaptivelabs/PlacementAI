export interface InterviewType {
  id: string;
  name: string;
  icon: string;
  description: string;
  focusAreas: string[];
  level: string;
  questionCount: number;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  description: string;
  interviewTypes: string[];
  focusAreas: string[];
  level: string;
}

// Interview Type Modules
export const interviewTypes: InterviewType[] = [
  {
    id: "tech-coding",
    name: "Technical Coding",
    icon: "💻",
    description: "Data Structures, Algorithms & Problem Solving",
    focusAreas: ["Data Structures", "Algorithms", "Problem Solving", "Arrays", "Dynamic Programming"],
    level: "Mid-Level",
    questionCount: 3,
  },
  {
    id: "system-design",
    name: "System Design",
    icon: "🏗️",
    description: "Scalable Systems, Architecture & Trade-offs",
    focusAreas: ["System Design", "Scalability", "Databases", "Microservices", "Load Balancing"],
    level: "Senior",
    questionCount: 3,
  },
  {
    id: "aptitude",
    name: "Aptitude & Reasoning",
    icon: "🧠",
    description: "Logical, Quantitative & Analytical Skills",
    focusAreas: ["Logical Reasoning", "Quantitative Analysis", "Critical Thinking", "Problem Solving"],
    level: "Entry-Level",
    questionCount: 3,
  },
  {
    id: "behavioral",
    name: "Behavioral / HR",
    icon: "🤝",
    description: "Leadership, Teamwork & Communication",
    focusAreas: ["Leadership", "Teamwork", "Communication Skills", "Conflict Resolution"],
    level: "All Levels",
    questionCount: 3,
  },
  {
    id: "technical-hr",
    name: "Technical HR",
    icon: "👔",
    description: "Past Projects, Technical Background & Culture Fit",
    focusAreas: ["Project Experience", "Technical Background", "Problem Solving", "Learning Mindset"],
    level: "All Levels",
    questionCount: 3,
  },
  {
    id: "embedded-systems",
    name: "Embedded Systems",
    icon: "🔌",
    description: "Microcontrollers, RTOS & Hardware Interfaces",
    focusAreas: ["Embedded Systems", "Microcontrollers", "Circuit Design", "IoT"],
    level: "Mid-Level",
    questionCount: 3,
  },
  {
    id: "vlsi-design",
    name: "VLSI Design",
    icon: "📟",
    description: "Digital Design, Verilog & FPGA",
    focusAreas: ["VLSI", "Verilog", "FPGA", "Digital Circuits"],
    level: "Mid-Level",
    questionCount: 3,
  },
  {
    id: "architecture",
    name: "Architecture",
    icon: "🏛️",
    description: "AutoCAD, BIM & Sustainable Design",
    focusAreas: ["AutoCAD", "Revit", "Architectural Design", "Sustainability"],
    level: "Mid-Level",
    questionCount: 3,
  },
];

// Company-Specific Modules
export const companies: Company[] = [
  {
    id: "google",
    name: "Google",
    logo: "🌐",
    description: "Focus on DSA, System Design & Googleyness",
    interviewTypes: ["Technical Coding", "System Design", "Behavioral"],
    focusAreas: ["Data Structures", "Algorithms", "System Design", "Problem Solving"],
    level: "Senior",
  },
  {
    id: "amazon",
    name: "Amazon",
    logo: "📦",
    description: "Leadership Principles & Technical Skills",
    interviewTypes: ["Technical Coding", "Behavioral", "System Design"],
    focusAreas: ["Data Structures", "Algorithms", "Leadership", "System Design"],
    level: "Senior",
  },
  {
    id: "microsoft",
    name: "Microsoft",
    logo: "💻",
    description: "Coding, Design & Problem Solving",
    interviewTypes: ["Technical Coding", "System Design"],
    focusAreas: ["Data Structures", "Algorithms", "System Design", "C++"],
    level: "Mid-Level",
  },
  {
    id: "meta",
    name: "Meta",
    logo: "♾️",
    description: "Coding & System Design for Scale",
    interviewTypes: ["Technical Coding", "System Design"],
    focusAreas: ["Data Structures", "Algorithms", "Distributed Systems", "React"],
    level: "Senior",
  },
  {
    id: "tcs",
    name: "TCS",
    logo: "💼",
    description: "Aptitude, Technical & HR Rounds",
    interviewTypes: ["Aptitude", "Technical Coding", "Technical HR"],
    focusAreas: ["Aptitude", "Java", "SQL", "Communication Skills"],
    level: "Entry-Level",
  },
  {
    id: "infosys",
    name: "Infosys",
    logo: "ℹ️",
    description: "InfyTQ Pattern & Technical Skills",
    interviewTypes: ["Aptitude", "Technical Coding", "Technical HR"],
    focusAreas: ["Aptitude", "Python", "Problem Solving", "Communication Skills"],
    level: "Entry-Level",
  },
  {
    id: "wipro",
    name: "Wipro",
    logo: "🌐",
    description: "Aptitude, Technical & Communication",
    interviewTypes: ["Aptitude", "Technical Coding", "Behavioral"],
    focusAreas: ["Aptitude", "Java", "SQL", "Communication Skills"],
    level: "Entry-Level",
  },
  {
    id: "accenture",
    name: "Accenture",
    logo: "📐",
    description: "Cognitive, Technical & Case Studies",
    interviewTypes: ["Aptitude", "Technical Coding", "Case Study"],
    focusAreas: ["Aptitude", "Problem Solving", "Communication Skills"],
    level: "Entry-Level",
  },
];

// Helper to get module by ID
export function getInterviewTypeById(id: string): InterviewType | undefined {
  return interviewTypes.find(type => type.id === id);
}

export function getCompanyById(id: string): Company | undefined {
  return companies.find(company => company.id === id);
}
