export interface LearningResource {
  title: string;
  type: 'video' | 'article' | 'book' | 'course' | 'practice';
  url: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  topics: string[];
}

export const learningResources: Record<string, LearningResource[]> = {
  // Finance Resources
  valuation: [
    {
      title: "Damodaran on Valuation",
      type: "video",
      url: "https://www.youtube.com/playlist?list=PLUkh9m2BorqnKWu0g5ZUps_CbQ-JGtbI9",
      description: "Comprehensive video series on valuation by NYU Stern Professor Aswath Damodaran",
      difficulty: "intermediate",
      estimatedTime: "20 hours",
      topics: ["valuation", "dcf", "financial modeling"]
    },
    {
      title: "Wall Street Prep - Valuation Master Class",
      type: "course",
      url: "https://www.wallstreetprep.com/self-study-programs/valuation-modeling/",
      description: "Industry-standard valuation modeling course used by top investment banks",
      difficulty: "advanced",
      estimatedTime: "15 hours",
      topics: ["valuation", "dcf", "financial modeling"]
    },
    {
      title: "Investment Valuation (Damodaran)",
      type: "book",
      url: "https://www.amazon.com/Investment-Valuation-Techniques-Determining-Second/dp/0471414883",
      description: "The definitive guide to valuation by Aswath Damodaran",
      difficulty: "advanced",
      estimatedTime: "40 hours",
      topics: ["valuation", "dcf", "corporate finance"]
    }
  ],
  
  "financial modeling": [
    {
      title: "Breaking Into Wall Street - Financial Modeling",
      type: "course",
      url: "https://breakingintowallstreet.com/biws/core-financial-modeling/",
      description: "Complete financial modeling course from basics to advanced",
      difficulty: "intermediate",
      estimatedTime: "25 hours",
      topics: ["financial modeling", "excel", "valuation"]
    },
    {
      title: "Macabacus Excel Best Practices",
      type: "article",
      url: "https://www.macabacus.com/learn/excel-best-practices",
      description: "Professional Excel modeling standards and shortcuts",
      difficulty: "beginner",
      estimatedTime: "2 hours",
      topics: ["excel", "financial modeling"]
    }
  ],

  "m&a": [
    {
      title: "Investment Banking: M&A Case Studies",
      type: "practice",
      url: "https://www.wallstreetprep.com/knowledge/ma-case-study/",
      description: "Real-world M&A case studies with detailed analysis",
      difficulty: "advanced",
      estimatedTime: "10 hours",
      topics: ["m&a", "mergers and acquisitions", "valuation"]
    },
    {
      title: "Rosenbaum & Pearl - Investment Banking",
      type: "book",
      url: "https://www.amazon.com/Investment-Banking-Valuation-Leveraged-Acquisitions/dp/1118656210",
      description: "The go-to guide for M&A, LBOs, and valuation",
      difficulty: "advanced",
      estimatedTime: "30 hours",
      topics: ["m&a", "lbo", "valuation"]
    }
  ],

  accounting: [
    {
      title: "Financial Accounting Fundamentals",
      type: "course",
      url: "https://www.coursera.org/learn/wharton-accounting",
      description: "Wharton's introduction to financial accounting",
      difficulty: "beginner",
      estimatedTime: "12 hours",
      topics: ["accounting", "financial statements"]
    },
    {
      title: "Three Statement Modeling",
      type: "video",
      url: "https://www.youtube.com/watch?v=m_u1RHortNY",
      description: "How to build integrated 3-statement models",
      difficulty: "intermediate",
      estimatedTime: "1 hour",
      topics: ["accounting", "financial modeling"]
    }
  ],

  lbo: [
    {
      title: "LBO Modeling Test Prep",
      type: "practice",
      url: "https://www.wallstreetprep.com/knowledge/lbo-model-test/",
      description: "Practice LBO modeling under time pressure",
      difficulty: "advanced",
      estimatedTime: "8 hours",
      topics: ["lbo", "private equity", "financial modeling"]
    }
  ],

  "supply chain": [
    {
      title: "MIT MicroMasters in Supply Chain Management",
      type: "course",
      url: "https://www.edx.org/micromasters/mitx-supply-chain-management",
      description: "Comprehensive supply chain program from MIT",
      difficulty: "advanced",
      estimatedTime: "40 hours",
      topics: ["supply chain", "logistics", "operations"]
    },
    {
      title: "Supply Chain Management - HBR Case Studies",
      type: "practice",
      url: "https://hbsp.harvard.edu/topic/supply-chain-management/",
      description: "Real business cases on supply chain challenges",
      difficulty: "intermediate",
      estimatedTime: "15 hours",
      topics: ["supply chain", "operations", "case study"]
    }
  ],

  "process improvement": [
    {
      title: "Lean Six Sigma Yellow Belt",
      type: "course",
      url: "https://www.coursera.org/learn/lean-six-sigma-yellow-belt",
      description: "Introduction to Lean Six Sigma methodology",
      difficulty: "beginner",
      estimatedTime: "10 hours",
      topics: ["process improvement", "six sigma", "lean"]
    },
    {
      title: "Process Mapping and Optimization",
      type: "article",
      url: "https://www.isixsigma.com/methodology/business-process-mapping/",
      description: "Guide to mapping and improving business processes",
      difficulty: "beginner",
      estimatedTime: "2 hours",
      topics: ["process improvement", "operations"]
    }
  ],

  lean: [
    {
      title: "The Toyota Way",
      type: "book",
      url: "https://www.amazon.com/Toyota-Way-Management-Principles-Manufacturer/dp/0071392319",
      description: "The foundational book on Lean manufacturing principles",
      difficulty: "intermediate",
      estimatedTime: "15 hours",
      topics: ["lean", "operations", "kaizen"]
    }
  ],

  "six sigma": [
    {
      title: "Six Sigma DMAIC Methodology",
      type: "video",
      url: "https://www.youtube.com/watch?v=9bvPAplJEBk",
      description: "Overview of the Define-Measure-Analyze-Improve-Control process",
      difficulty: "beginner",
      estimatedTime: "30 minutes",
      topics: ["six sigma", "process improvement"]
    }
  ],

  logistics: [
    {
      title: "Logistics and Transportation Management",
      type: "course",
      url: "https://www.edx.org/course/supply-chain-fundamentals",
      description: "Fundamentals of logistics and transportation",
      difficulty: "intermediate",
      estimatedTime: "12 hours",
      topics: ["logistics", "supply chain", "operations"]
    }
  ],

  strategy: [
    {
      title: "Case in Point - Marc Cosentino",
      type: "book",
      url: "https://www.amazon.com/Case-Point-Complete-Interview-Preparation/dp/0986370762",
      description: "The classic case interview preparation guide",
      difficulty: "intermediate",
      estimatedTime: "20 hours",
      topics: ["strategy", "case study", "consulting"]
    },
    {
      title: "Victor Cheng's LOMS Program",
      type: "course",
      url: "https://www.caseinterview.com/",
      description: "Look Over My Shoulder - real case interview examples",
      difficulty: "advanced",
      estimatedTime: "30 hours",
      topics: ["consulting", "case study", "strategy"]
    }
  ],

  consulting: [
    {
      title: "Management Consulted Case Library",
      type: "practice",
      url: "https://managementconsulted.com/case-interview-prep/",
      description: "Free case interview practice problems",
      difficulty: "intermediate",
      estimatedTime: "20 hours",
      topics: ["consulting", "case study"]
    }
  ],

  "case study": [
    {
      title: "Market Sizing Framework",
      type: "article",
      url: "https://www.craftingcases.com/market-sizing/",
      description: "Step-by-step guide to market sizing questions",
      difficulty: "beginner",
      estimatedTime: "1 hour",
      topics: ["case study", "consulting", "market sizing"]
    }
  ],

  behavioral: [
    {
      title: "STAR Method Interview Guide",
      type: "article",
      url: "https://www.themuse.com/advice/star-interview-method",
      description: "How to structure behavioral interview responses",
      difficulty: "beginner",
      estimatedTime: "30 minutes",
      topics: ["behavioral", "star method"]
    },
    {
      title: "50 Behavioral Interview Questions",
      type: "practice",
      url: "https://www.indeed.com/career-advice/interviewing/top-behavioral-interview-questions",
      description: "Common behavioral questions with sample answers",
      difficulty: "beginner",
      estimatedTime: "3 hours",
      topics: ["behavioral", "leadership"]
    }
  ],

  leadership: [
    {
      title: "Leadership Principles for MBA Interviews",
      type: "video",
      url: "https://www.youtube.com/watch?v=VVsVk8KPfHo",
      description: "How to demonstrate leadership in interviews",
      difficulty: "intermediate",
      estimatedTime: "45 minutes",
      topics: ["leadership", "behavioral"]
    }
  ],

  "data structures": [
    {
      title: "GeeksforGeeks - Data Structures",
      type: "article",
      url: "https://www.geeksforgeeks.org/data-structures/",
      description: "Comprehensive guide to all fundamental data structures with examples",
      difficulty: "beginner",
      estimatedTime: "20 hours",
      topics: ["data structures", "algorithms"]
    },
    {
      title: "Data Structures - Coursera",
      type: "course",
      url: "https://www.coursera.org/learn/data-structures",
      description: "University of California San Diego's data structures course",
      difficulty: "intermediate",
      estimatedTime: "30 hours",
      topics: ["data structures"]
    }
  ],

  algorithms: [
    {
      title: "LeetCode - Top Interview Questions",
      type: "practice",
      url: "https://leetcode.com/problemset/all/",
      description: "Practice coding problems by difficulty level",
      difficulty: "intermediate",
      estimatedTime: "100+ hours",
      topics: ["algorithms", "coding", "problem solving"]
    },
    {
      title: "Introduction to Algorithms (CLRS)",
      type: "book",
      url: "https://www.amazon.com/Introduction-Algorithms-3rd-MIT-Press/dp/0262033844",
      description: "The definitive algorithms textbook",
      difficulty: "advanced",
      estimatedTime: "60 hours",
      topics: ["algorithms", "data structures"]
    },
    {
      title: "Abdul Bari - Algorithm Playlist",
      type: "video",
      url: "https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O",
      description: "Comprehensive algorithms video series with animations",
      difficulty: "beginner",
      estimatedTime: "25 hours",
      topics: ["algorithms"]
    }
  ],

  "system design": [
    {
      title: "System Design Primer",
      type: "article",
      url: "https://github.com/donnemartin/system-design-primer",
      description: "Learn how to design large-scale systems with examples",
      difficulty: "advanced",
      estimatedTime: "40 hours",
      topics: ["system design", "scalability", "distributed systems"]
    },
    {
      title: "Designing Data-Intensive Applications",
      type: "book",
      url: "https://www.amazon.com/Designing-Data-Intensive-Applications-Reliable-Maintainable/dp/1449373321",
      description: "The go-to book for system design and distributed systems",
      difficulty: "advanced",
      estimatedTime: "50 hours",
      topics: ["system design", "databases", "distributed systems"]
    },
    {
      title: "Gaurav Sen - System Design",
      type: "video",
      url: "https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX",
      description: "System design interview preparation videos",
      difficulty: "intermediate",
      estimatedTime: "15 hours",
      topics: ["system design"]
    }
  ],

  databases: [
    {
      title: "SQL Tutorial - W3Schools",
      type: "article",
      url: "https://www.w3schools.com/sql/",
      description: "Interactive SQL tutorial with examples",
      difficulty: "beginner",
      estimatedTime: "10 hours",
      topics: ["sql", "databases"]
    },
    {
      title: "MongoDB University",
      type: "course",
      url: "https://university.mongodb.com/",
      description: "Free MongoDB courses from beginner to advanced",
      difficulty: "intermediate",
      estimatedTime: "20 hours",
      topics: ["mongodb", "nosql", "databases"]
    }
  ],

  "operating systems": [
    {
      title: "Operating Systems - Neso Academy",
      type: "video",
      url: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O",
      description: "Complete OS concepts playlist",
      difficulty: "intermediate",
      estimatedTime: "30 hours",
      topics: ["operating systems", "os"]
    }
  ],

  java: [
    {
      title: "Java Programming - MOOC.fi",
      type: "course",
      url: "https://java-programming.mooc.fi/",
      description: "University of Helsinki's free Java course",
      difficulty: "beginner",
      estimatedTime: "40 hours",
      topics: ["java", "programming"]
    }
  ],

  python: [
    {
      title: "Python for Everybody - Coursera",
      type: "course",
      url: "https://www.coursera.org/specializations/python",
      description: "University of Michigan's Python specialization",
      difficulty: "beginner",
      estimatedTime: "35 hours",
      topics: ["python", "programming"]
    }
  ],

  javascript: [
    {
      title: "JavaScript.info",
      type: "article",
      url: "https://javascript.info/",
      description: "Modern JavaScript tutorial from basics to advanced",
      difficulty: "beginner",
      estimatedTime: "50 hours",
      topics: ["javascript", "web development"]
    }
  ],

  react: [
    {
      title: "React Official Documentation",
      type: "article",
      url: "https://react.dev/",
      description: "Official React docs with interactive examples",
      difficulty: "intermediate",
      estimatedTime: "20 hours",
      topics: ["react", "frontend", "javascript"]
    }
  ],

  docker: [
    {
      title: "Docker for Beginners",
      type: "course",
      url: "https://www.youtube.com/watch?v=fqMOX6JJhGo",
      description: "Complete Docker tutorial for beginners",
      difficulty: "beginner",
      estimatedTime: "4 hours",
      topics: ["docker", "devops", "containers"]
    }
  ],

  aws: [
    {
      title: "AWS Cloud Practitioner Essentials",
      type: "course",
      url: "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/",
      description: "Free AWS fundamentals course",
      difficulty: "beginner",
      estimatedTime: "6 hours",
      topics: ["aws", "cloud computing"]
    }
  ],

  "architectural design": [
    {
      title: "ArchDaily - Architecture Tutorials",
      type: "article",
      url: "https://www.archdaily.com/search/articles",
      description: "Leading architecture publication with tutorials and case studies",
      difficulty: "intermediate",
      estimatedTime: "5 hours",
      topics: ["architectural design", "urban planning"]
    },
    {
      title: "AutoCAD for Beginners",
      type: "course",
      url: "https://www.autodesk.com/certification/learn/catalog/product/autocad",
      description: "Official AutoCAD training from Autodesk",
      difficulty: "beginner",
      estimatedTime: "20 hours",
      topics: ["autocad", "cad design"]
    }
  ],

  autocad: [
    {
      title: "AutoCAD Complete Tutorial",
      type: "video",
      url: "https://www.youtube.com/watch?v=VtLXKU1PpRU",
      description: "Comprehensive AutoCAD tutorial for architects and engineers",
      difficulty: "beginner",
      estimatedTime: "10 hours",
      topics: ["autocad", "cad design"]
    }
  ],

  revit: [
    {
      title: "Revit Architecture Fundamentals",
      type: "course",
      url: "https://www.linkedin.com/learning/revit-2024-essential-training-for-architecture",
      description: "LinkedIn Learning course on Revit for architecture",
      difficulty: "beginner",
      estimatedTime: "15 hours",
      topics: ["revit", "bim", "architectural design"]
    }
  ],

  "embedded systems": [
    {
      title: "Embedded Systems - Shape The World",
      type: "course",
      url: "https://www.edx.org/learn/embedded-systems/the-university-of-texas-at-austin-embedded-systems-shape-the-world-microcontroller-input-output",
      description: "UT Austin's comprehensive embedded systems course",
      difficulty: "intermediate",
      estimatedTime: "25 hours",
      topics: ["embedded systems", "microcontrollers"]
    },
    {
      title: "Arduino Getting Started",
      type: "article",
      url: "https://www.arduino.cc/en/Guide",
      description: "Official Arduino getting started guide",
      difficulty: "beginner",
      estimatedTime: "5 hours",
      topics: ["arduino", "microcontrollers", "embedded systems"]
    }
  ],

  vlsi: [
    {
      title: "VLSI Design - NPTEL",
      type: "course",
      url: "https://nptel.ac.in/courses/117/106/117106092/",
      description: "IIT's VLSI design course covering fundamentals",
      difficulty: "advanced",
      estimatedTime: "40 hours",
      topics: ["vlsi", "digital circuits"]
    }
  ],

  "circuit design": [
    {
      title: "Circuit Analysis - Khan Academy",
      type: "video",
      url: "https://www.khanacademy.org/science/electrical-engineering/ee-circuit-analysis-topic",
      description: "Free circuit analysis course with interactive exercises",
      difficulty: "beginner",
      estimatedTime: "15 hours",
      topics: ["circuit design", "analog circuits", "digital circuits"]
    }
  ],

  solidworks: [
    {
      title: "SolidWorks Tutorial for Beginners",
      type: "video",
      url: "https://www.youtube.com/watch?v=qtgmGkEyPqs",
      description: "Complete SolidWorks tutorial for mechanical engineers",
      difficulty: "beginner",
      estimatedTime: "8 hours",
      topics: ["solidworks", "cad design", "mechanical design"]
    }
  ],

  thermodynamics: [
    {
      title: "Engineering Thermodynamics - MIT OCW",
      type: "course",
      url: "https://ocw.mit.edu/courses/2-006-thermal-fluids-engineering-i-spring-2008/",
      description: "MIT's open courseware on thermodynamics",
      difficulty: "intermediate",
      estimatedTime: "30 hours",
      topics: ["thermodynamics", "heat transfer"]
    }
  ],

  "structural analysis": [
    {
      title: "Structural Analysis - NPTEL",
      type: "course",
      url: "https://nptel.ac.in/courses/105/105/105105109/",
      description: "IIT's structural analysis course",
      difficulty: "intermediate",
      estimatedTime: "35 hours",
      topics: ["structural analysis", "structural design"]
    }
  ],

  "construction management": [
    {
      title: "Construction Project Management",
      type: "course",
      url: "https://www.coursera.org/learn/construction-project-management",
      description: "Columbia's construction project management course",
      difficulty: "intermediate",
      estimatedTime: "20 hours",
      topics: ["construction management", "project management"]
    }
  ],

  general: [
    {
      title: "Interview Preparation Guide",
      type: "article",
      url: "https://www.indeed.com/career-advice/interviewing/how-to-prepare-for-an-interview",
      description: "Comprehensive guide to interview preparation for any field",
      difficulty: "beginner",
      estimatedTime: "2 hours",
      topics: ["interview preparation", "communication skills"]
    },
    {
      title: "STAR Method Interview Guide",
      type: "article",
      url: "https://www.themuse.com/advice/star-interview-method",
      description: "How to structure behavioral interview responses",
      difficulty: "beginner",
      estimatedTime: "30 minutes",
      topics: ["behavioral", "star method", "interview preparation"]
    }
  ]
};

// Helper function to get resources by topics
export function getResourcesByTopics(topics: string[]): LearningResource[] {
  const resources: LearningResource[] = [];
  const seenTitles = new Set<string>();

  topics.forEach(topic => {
    const topicKey = topic.toLowerCase().trim();
    const topicResources = learningResources[topicKey] || [];
    
    topicResources.forEach(resource => {
      if (!seenTitles.has(resource.title)) {
        resources.push(resource);
        seenTitles.add(resource.title);
      }
    });
  });

  // Add general resources if we have less than 3
  if (resources.length < 3) {
    learningResources.general?.forEach(resource => {
      if (!seenTitles.has(resource.title) && resources.length < 5) {
        resources.push(resource);
        seenTitles.add(resource.title);
      }
    });
  }

  return resources;
}
