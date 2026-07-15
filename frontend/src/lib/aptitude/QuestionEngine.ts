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
