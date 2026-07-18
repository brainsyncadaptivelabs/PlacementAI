export interface Question {
  id: string;
  category: string;
  topic: string;
  text: string;
  options: string[];
  answer?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimit: number;
  explanation?: string;
  formula?: string;
  shortcut?: string;
  commonMistake?: string;
  companyLevel?: string;
  a?: number;
  b?: number;
  c?: number;
  iif?: number;
}

export function generateFingerprint(q: any): string {
  const CANDIDATE_NAMES = ["Abhinav", "Bharath", "Likith", "Sree Alekhya", "Ananya", "Rohan", "Sneha", "Kiran", "Divya", "Rahul", "Priya", "Amit"];
  const ITEMS = ["laptop", "phone", "book", "chair", "table", "watch", "pen", "bag", "monitor", "keyboard"];
  const COMPANIES = ["TCS", "Infosys", "Accenture", "Cognizant", "Wipro", "Capgemini", "Deloitte", "EY", "PwC", "Amazon", "Microsoft", "Google", "Oracle", "Zoho", "Adobe"];
  
  const namesPattern = new RegExp(CANDIDATE_NAMES.join("|"), "gi");
  const itemsPattern = new RegExp(ITEMS.join("|"), "gi");
  const companiesPattern = new RegExp(COMPANIES.join("|"), "gi");
  
  let textSig = (q.text || "")
    .replace(namesPattern, "[NAME]")
    .replace(itemsPattern, "[ITEM]")
    .replace(companiesPattern, "[COMPANY]")
    .replace(/twenty/gi, "20").replace(/thirty/gi, "30").replace(/forty/gi, "40").replace(/fifty/gi, "50")
    .replace(/percent/gi, "%").replace(/remainder/gi, "rem")
    .replace(/\d+/g, "[NUM]")
    .replace(/[^\w%]/g, "")
    .toLowerCase();

  return `${q.category}-${q.topic}-${textSig}`;
}

export const MOCK_QUESTIONS: Question[] = [
  // Quantitative Aptitude
  {
    id: "mock-q-1",
    category: "Quantitative Aptitude",
    topic: "Percentage",
    text: "A shopkeeper increases the price of an item by 20% and then offers a 10% discount. What is the net percentage change in the price?",
    options: ["8% increase", "10% increase", "12% increase", "8% decrease"],
    answer: "8% increase",
    difficulty: "Medium",
    timeLimit: 60,
    explanation: "Let the initial price be 100. Increased price = 120. After 10% discount, price = 120 - 12 = 108. Net change = 8% increase."
  },
  {
    id: "mock-q-2",
    category: "Quantitative Aptitude",
    topic: "Profit & Loss",
    text: "If a book is sold at a profit of 20%, then the ratio of cost price to selling price is:",
    options: ["5:6", "6:5", "4:5", "5:4"],
    answer: "5:6",
    difficulty: "Easy",
    timeLimit: 45,
    explanation: "CP = 100, SP = 120. Ratio CP:SP = 100:120 = 5:6."
  },
  {
    id: "mock-q-3",
    category: "Quantitative Aptitude",
    topic: "Time & Work",
    text: "A can do a piece of work in 10 days and B can do it in 15 days. In how many days can they complete the work working together?",
    options: ["6 days", "5 days", "8 days", "7 days"],
    answer: "6 days",
    difficulty: "Easy",
    timeLimit: 60,
    explanation: "Together rate = 1/10 + 1/15 = 5/30 = 1/6. So they complete in 6 days."
  },
  {
    id: "mock-q-4",
    category: "Quantitative Aptitude",
    topic: "Time, Speed & Distance",
    text: "A car travels at a speed of 60 km/h for 2 hours and then at 80 km/h for 3 hours. What is the average speed of the car for the entire journey?",
    options: ["72 km/h", "70 km/h", "75 km/h", "68 km/h"],
    answer: "72 km/h",
    difficulty: "Medium",
    timeLimit: 60,
    explanation: "Total distance = (60 * 2) + (80 * 3) = 120 + 240 = 360 km. Total time = 5 hours. Average speed = 360 / 5 = 72 km/h."
  },
  {
    id: "mock-q-5",
    category: "Quantitative Aptitude",
    topic: "Simple & Compound Interest",
    text: "What is the simple interest on Rs. 5000 at a rate of 10% per annum for 3 years?",
    options: ["Rs. 1500", "Rs. 1000", "Rs. 1800", "Rs. 1200"],
    answer: "Rs. 1500",
    difficulty: "Easy",
    timeLimit: 45,
    explanation: "SI = (P * R * T) / 100 = (5000 * 10 * 3) / 100 = 1500."
  },
  
  // Logical Reasoning
  {
    id: "mock-q-6",
    category: "Logical Reasoning",
    topic: "Blood Relations",
    text: "Pointing to a photograph, a man says, 'She is the mother of my brother's only sister's son.' How is the woman in the photograph related to the man?",
    options: ["Sister", "Mother", "Aunt", "Wife"],
    answer: "Sister",
    difficulty: "Medium",
    timeLimit: 60,
    explanation: "My brother's only sister is my sister. Her son's mother is again my sister."
  },
  {
    id: "mock-q-7",
    category: "Logical Reasoning",
    topic: "Coding-Decoding",
    text: "If in a certain language, 'CHAIR' is written as 'EGDKT', how is 'TABLE' written in that language?",
    options: ["VCDNG", "UBCMF", "VCEMG", "VCDNF"],
    answer: "VCDNG",
    difficulty: "Medium",
    timeLimit: 45,
    explanation: "Each letter is shifted by 2 positions forward: C+2=E, H+2=G, A+2=D, I+2=K, R+2=T. Similarly, T+2=V, A+2=C, B+2=D, L+2=N, E+2=G."
  },
  {
    id: "mock-q-8",
    category: "Logical Reasoning",
    topic: "Number Series",
    text: "Find the next number in the series: 2, 6, 12, 20, 30, ?",
    options: ["42", "40", "36", "48"],
    answer: "42",
    difficulty: "Easy",
    timeLimit: 45,
    explanation: "The differences are consecutive even numbers: +4, +6, +8, +10. Next is +12, so 30 + 12 = 42."
  },
  
  // Verbal Ability
  {
    id: "mock-q-9",
    category: "Verbal Ability",
    topic: "Synonyms",
    text: "Choose the word that is most nearly synonymous with: CANDID",
    options: ["Frank", "Devious", "Vague", "Guarded"],
    answer: "Frank",
    difficulty: "Easy",
    timeLimit: 30,
    explanation: "Candid means truthful and straightforward; frank."
  },
  {
    id: "mock-q-10",
    category: "Verbal Ability",
    topic: "Antonyms",
    text: "What is the antonym of the word: MITIGATE?",
    options: ["Aggravate", "Alleviate", "Soften", "Diminish"],
    answer: "Aggravate",
    difficulty: "Medium",
    timeLimit: 30,
    explanation: "Mitigate means to make less severe. The opposite is aggravate (to make worse)."
  },

  // English
  {
    id: "mock-q-11",
    category: "English",
    topic: "Grammar",
    text: "Which of the following sentences is grammatically correct?",
    options: [
      "Neither the teacher nor the students were present.",
      "Neither the teacher nor the students was present.",
      "Either the students or the teacher are present.",
      "Each of the students have done their work."
    ],
    answer: "Neither the teacher nor the students were present.",
    difficulty: "Medium",
    timeLimit: 40,
    explanation: "In neither-nor construction, the verb agrees with the closer subject ('students' is plural, so 'were' is correct)."
  }
];

export function generateLocalMockAssessment(length: number, category: string, topic: string | null): Question[] {
  let filtered = MOCK_QUESTIONS;
  
  if (category && category !== "any" && category !== "all") {
    filtered = filtered.filter(q => q.category.toLowerCase() === category.toLowerCase());
  }
  
  if (topic && topic !== "any" && topic !== "all") {
    filtered = filtered.filter(q => q.topic.toLowerCase() === topic.toLowerCase());
  }
  
  if (filtered.length === 0) {
    filtered = MOCK_QUESTIONS;
  }
  
  const selected: Question[] = [];
  for (let i = 0; i < length; i++) {
    const baseQ = filtered[i % filtered.length];
    selected.push({
      ...baseQ,
      id: `${baseQ.id}-dev-${i}-${Math.random().toString(36).substring(2, 7)}`
    });
  }
  return selected;
}
