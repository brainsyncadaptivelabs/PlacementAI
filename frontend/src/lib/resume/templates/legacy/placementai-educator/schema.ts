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

export const initialEducatorState: ResumeState = {
  personalInfo: {
    name: "Aarav Sharma",
    email: "aarav.sharma@placementai.com",
    phone: "+91 98765 43210",
    linkedin: "linkedin.com/in/aaravsharma",
    github: "github.com/aaravsharma",
    leetcode: "leetcode.com/aaravsharma"
  },
  summary: "Results-oriented Software Engineer and B.Tech Computer Science graduate with hands-on experience in Full Stack Java Development. Proficient in Java, Spring Boot, React, and Microservices architecture. Demonstrated expertise in building scalable REST APIs, Docker containerization, and secure JWT authentication. Passionate about delivering high-impact software solutions.",
  skills: [
    "Java",
    "Spring Boot",
    "React",
    "MySQL",
    "Docker",
    "Git",
    "REST",
    "JWT",
    "Microservices"
  ],
  experience: [
    {
      id: "exp-1",
      company: "TechFlow Systems",
      role: "Software Engineer Intern",
      duration: "Jan 2024 - Present",
      description: "Contributing to the development of microservices-based architecture using Spring Boot.\nOptimized MySQL database queries, reducing API response times by 20%.\nCollaborated on the frontend using React to implement dynamic, responsive user dashboards."
    }
  ],
  projects: [
    {
      id: "proj-1",
      name: "PlacementAI",
      role: "Lead Developer",
      duration: "2023 - 2024",
      description: "AI-powered platform for ATS resume analysis and career guidance.\nImplemented secure authentication using JWT and integrated Tesseract OCR for text extraction."
    },
    {
      id: "proj-2",
      name: "DriveDock",
      role: "Full Stack Developer",
      duration: "2023",
      description: "Cloud-based vehicle management system with real-time tracking.\nBuilt with Spring Boot and React, deployed using Docker containers on AWS."
    }
  ],
  education: [
    {
      id: "edu-1",
      institution: "Indian Institute of Technology",
      degree: "B.Tech in Computer Science",
      duration: "2020 - 2024",
      details: "Specialized in Software Engineering and Distributed Systems. CGPA: 8.5/10."
    }
  ],
  certifications: [
    "Oracle Certified Professional: Java SE 17",
    "AWS Certified Cloud Practitioner",
    "SQL Advanced Certification (HackerRank)"
  ]
};
