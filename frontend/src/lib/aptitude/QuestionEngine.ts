export interface Question {
  id: string;
  category: string;
  topic: string;
  text: string;
  options: string[];
  answer: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimit: number; // in seconds
  explanation: string;
  formula?: string;
  shortcut?: string;
  commonMistake?: string;
  companyLevel?: string;
}

const CANDIDATE_NAMES = ["Abhinav", "Bharath", "Likith", "Sree Alekhya", "Ananya", "Rohan", "Sneha", "Kiran"];
const ITEMS = ["laptop", "phone", "book", "chair", "table", "watch", "pen", "bag"];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate unique options including the correct answer
function generateOptions(correctVal: number | string, isNumeric: boolean): string[] {
  const optionsSet = new Set<string>([correctVal.toString()]);
  
  if (isNumeric) {
    const val = typeof correctVal === "number" ? correctVal : parseFloat(correctVal.toString());
    while (optionsSet.size < 4) {
      const variation = Math.round(val * (1 + (Math.random() - 0.5) * 0.3));
      if (variation !== val) {
        optionsSet.add(variation.toString());
      }
    }
  } else {
    const fallbacks = ["None of these", "Cannot be determined", "Both A and B", "Information insufficient"];
    while (optionsSet.size < 4) {
      optionsSet.add(getRandomElement(fallbacks) + ` Option ${optionsSet.size}`);
    }
  }
  return Array.from(optionsSet).sort(() => Math.random() - 0.5);
}

// Quantitative templates
const quantTemplates: Record<string, (company: string, diff: string) => Question> = {
  "Percentage": (company, diff) => {
    const name = getRandomElement(CANDIDATE_NAMES);
    const markedPrice = getRandomRange(500, 2000) * 10;
    const discount = getRandomRange(10, 30);
    const correctAns = Math.round(markedPrice * (1 - discount / 100));
    
    return {
      id: `quant-pct-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Percentage",
      text: `${name} purchased an item marked at ₹${markedPrice} from PlacementAI. If the seller offers a flat ${discount}% discount, what is the final selling price paid by ${name}?`,
      options: generateOptions(correctAns, true),
      answer: correctAns.toString(),
      difficulty: diff as any,
      timeLimit: diff === "Easy" ? 45 : diff === "Medium" ? 60 : 90,
      explanation: `Selling Price = Marked Price * (1 - Discount/100). Paid value = ${markedPrice} * (1 - ${discount}/100) = ₹${correctAns}.`,
      formula: "SP = MP * (100 - Discount)% / 100",
      shortcut: "Calculate discount value directly and subtract from marked price.",
      commonMistake: "Applying discount markup addition instead of discount reduction.",
      companyLevel: company
    };
  },
  "Profit & Loss": (company, diff) => {
    const costPrice = getRandomRange(100, 500) * 10;
    const profitPct = getRandomRange(5, 25);
    const correctAns = Math.round(costPrice * (1 + profitPct / 100));

    return {
      id: `quant-pl-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Profit & Loss",
      text: `An item was bought for ₹${costPrice} and sold at a profit of ${profitPct}%. Find the final selling price.`,
      options: generateOptions(correctAns, true),
      answer: correctAns.toString(),
      difficulty: diff as any,
      timeLimit: 60,
      explanation: `Selling Price = CP * (1 + Profit%/100) = ${costPrice} * (1 + ${profitPct}/100) = ₹${correctAns}.`,
      formula: "SP = CP * (100 + Profit%) / 100",
      shortcut: "Convert profit percentage to fractional value (e.g. 20% = 1.2x) and multiply.",
      companyLevel: company
    };
  },
  "Time & Work": (company, diff) => {
    const daysA = getRandomRange(10, 20);
    const daysB = getRandomRange(12, 25);
    const correctAns = parseFloat(((daysA * daysB) / (daysA + daysB)).toFixed(2));

    return {
      id: `quant-tw-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Time & Work",
      text: `A can complete a piece of work in ${daysA} days and B can do it in ${daysB} days. Working together, in how many days will they complete the same work?`,
      options: [correctAns.toString(), (correctAns + 1.2).toFixed(2), (correctAns - 0.8).toFixed(2), (correctAns * 1.3).toFixed(2)].sort(() => Math.random() - 0.5),
      answer: correctAns.toString(),
      difficulty: diff as any,
      timeLimit: 90,
      explanation: `Combined rate = 1/${daysA} + 1/${daysB} = (${daysA}+${daysB})/(${daysA}*${daysB}). Total Days = (A * B) / (A + B) = ${correctAns} days.`,
      formula: "Combined Days = (A * B) / (A + B)",
      shortcut: "Calculate LCM of work rates to find individual efficiencies.",
      companyLevel: company
    };
  },
  "Time, Speed & Distance": (company, diff) => {
    const speed = getRandomRange(40, 90);
    const hours = getRandomRange(2, 6);
    const correctAns = speed * hours;

    return {
      id: `quant-tsd-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Time, Speed & Distance",
      text: `A train runs at a uniform speed of ${speed} km/h. What is the total distance covered by the train in ${hours} hours?`,
      options: generateOptions(correctAns, true),
      answer: correctAns.toString(),
      difficulty: diff as any,
      timeLimit: 60,
      explanation: `Distance = Speed * Time. Total Distance = ${speed} * ${hours} = ${correctAns} km.`,
      formula: "Distance = Speed * Time",
      shortcut: "Multiply rate by duration directly.",
      companyLevel: company
    };
  }
};

// Logical templates
const logicalTemplates: Record<string, (company: string, diff: string) => Question> = {
  "Blood Relations": (company, diff) => {
    const options = ["Father", "Uncle", "Brother", "Cousin"];
    const correctAns = "Brother";

    return {
      id: `logic-br-${Date.now()}-${Math.random()}`,
      category: "Logical Reasoning",
      topic: "Blood Relations",
      text: `Pointing to a boy in a photograph, Sneha said, "He is the only son of my father's only daughter." How is the boy related to Sneha?`,
      options: ["Son", "Father", "Nephew", "Uncle"].sort(() => Math.random() - 0.5),
      answer: "Son",
      difficulty: diff as any,
      timeLimit: 60,
      explanation: `"My father's only daughter" represents Sneha herself. Therefore, the boy is Sneha's son, making Sneha the mother and the relation a direct motherhood link. If asking 'How is Sneha related to the boy', it is Mother. The boy is the Son.`,
      companyLevel: company
    };
  },
  "Direction Sense": (company, diff) => {
    const dist = getRandomRange(4, 15);
    return {
      id: `logic-ds-${Date.now()}-${Math.random()}`,
      category: "Logical Reasoning",
      topic: "Direction Sense",
      text: `A person walks ${dist} km North, turns right and walks 5 km, then turns right again and walks ${dist} km. How far and in which direction is the person from the starting point?`,
      options: ["5 km East", "5 km West", "10 km North", "12 km South"].sort(() => Math.random() - 0.5),
      answer: "5 km East",
      difficulty: diff as any,
      timeLimit: 75,
      explanation: `Walking ${dist} km North and then ${dist} km South cancels out the vertical axis movements, leaving only the 5 km East displacement on the horizontal axis.`,
      shortcut: "Draw a simple compass vector coordinate to offset equal opposite movements.",
      companyLevel: company
    };
  },
  "Number Series": (company, diff) => {
    const step = getRandomRange(3, 7);
    const start = getRandomRange(5, 20);
    const series = [start, start + step, start + 2 * step, start + 3 * step];
    const correctAns = start + 4 * step;

    return {
      id: `logic-ns-${Date.now()}-${Math.random()}`,
      category: "Logical Reasoning",
      topic: "Number Series",
      text: `Complete the sequence: ${series.join(", ")}, ?`,
      options: generateOptions(correctAns, true),
      answer: correctAns.toString(),
      difficulty: diff as any,
      timeLimit: 45,
      explanation: `The series increases by a constant step of +${step} at each index. Next term = ${series[3]} + ${step} = ${correctAns}.`,
      shortcut: "Find first-order differences between consecutive elements.",
      companyLevel: company
    };
  }
};

// Verbal templates
const verbalTemplates: Record<string, (company: string, diff: string) => Question> = {
  "Synonyms": (company, diff) => {
    return {
      id: `verbal-syn-${Date.now()}-${Math.random()}`,
      category: "Verbal Ability",
      topic: "Synonyms",
      text: `Choose the closest synonym for the word: "ACUMEN"`,
      options: ["Shrewdness", "Ignorance", "Apathy", "Haste"].sort(() => Math.random() - 0.5),
      answer: "Shrewdness",
      difficulty: diff as any,
      timeLimit: 30,
      explanation: `"Acumen" means the ability to make good judgments and quick decisions, which is closely synonymous to "Shrewdness".`,
      companyLevel: company
    };
  },
  "Sentence Correction": (company, diff) => {
    return {
      id: `verbal-sc-${Date.now()}-${Math.random()}`,
      category: "Verbal Ability",
      topic: "Sentence Correction",
      text: `Identify the grammatically correct correction for the following: "Each of the students have submitted their project reports."`,
      options: [
        "Each of the students has submitted their project reports.",
        "Each of the students have submitted his project reports.",
        "Each of the students has submitted his or her project report.",
        "Every students have submitted their project reports."
      ].sort(() => Math.random() - 0.5),
      answer: "Each of the students has submitted his or her project report.",
      difficulty: diff as any,
      timeLimit: 45,
      explanation: `"Each" is a singular pronoun and requires a singular verb ("has") and singular referent possessive pronouns ("his or her").`,
      companyLevel: company
    };
  }
};

// English templates
const englishTemplates: Record<string, (company: string, diff: string) => Question> = {
  "Grammar": (company, diff) => {
    return {
      id: `eng-gram-${Date.now()}-${Math.random()}`,
      category: "English",
      topic: "Grammar",
      text: `Choose the correct word: "The coordinator was ______ busy to answer the calls."`,
      options: ["too", "to", "two", "very"],
      answer: "too",
      difficulty: diff as any,
      timeLimit: 30,
      explanation: `"too... to" is a standard English grammatical structure used to show excess or impossibility.`,
      companyLevel: company
    };
  },
  "Prepositions": (company, diff) => {
    return {
      id: `eng-prep-${Date.now()}-${Math.random()}`,
      category: "English",
      topic: "Prepositions",
      text: `Fill in the blank with the appropriate preposition: "PlacementAI specializes ______ technical interview preparation."`,
      options: ["in", "on", "at", "for"],
      answer: "in",
      difficulty: diff as any,
      timeLimit: 30,
      explanation: `The verb "specialize" is traditionally followed by the preposition "in" to denote focus.`,
      companyLevel: company
    };
  }
};

// Fallback topics to keep engine robust
const fallbackTopics: Record<string, string[]> = {
  "Quantitative Aptitude": ["Percentage", "Profit & Loss", "Time & Work", "Time, Speed & Distance"],
  "Logical Reasoning": ["Blood Relations", "Direction Sense", "Number Series"],
  "Verbal Ability": ["Synonyms", "Sentence Correction"],
  "English": ["Grammar", "Prepositions"]
};

// Main generator engine
export function generateQuestion(category: string, topic: string, company = "General Pattern", difficulty?: "Easy" | "Medium" | "Hard"): Question {
  const finalCategory = category === "any" ? getRandomElement(Object.keys(fallbackTopics)) : category;
  const topicsList = fallbackTopics[finalCategory] || ["General"];
  const finalTopic = topic === "any" ? getRandomElement(topicsList) : topic;
  const finalDifficulty = difficulty || getRandomElement(["Easy", "Medium", "Hard"]) as any;

  let questionObj: Question;

  if (finalCategory === "Quantitative Aptitude") {
    const builder = quantTemplates[finalTopic] || quantTemplates["Percentage"];
    questionObj = builder(company, finalDifficulty);
  } else if (finalCategory === "Logical Reasoning") {
    const builder = logicalTemplates[finalTopic] || logicalTemplates["Blood Relations"];
    questionObj = builder(company, finalDifficulty);
  } else if (finalCategory === "Verbal Ability") {
    const builder = verbalTemplates[finalTopic] || verbalTemplates["Synonyms"];
    questionObj = builder(company, finalDifficulty);
  } else {
    const builder = englishTemplates[finalTopic] || englishTemplates["Grammar"];
    questionObj = builder(company, finalDifficulty);
  }

  // Force matching properties if fallback triggered
  questionObj.category = finalCategory;
  questionObj.topic = finalTopic;
  questionObj.difficulty = finalDifficulty;
  questionObj.companyLevel = company;

  return questionObj;
}

// Generate a complete Mock Exam/Test set
export function generateTest(length: number, category: string, topic: string, company = "General Pattern"): Question[] {
  const list: Question[] = [];
  for (let i = 0; i < length; i++) {
    // Distribute difficulties: 40% Easy, 40% Medium, 20% Hard
    let diff: "Easy" | "Medium" | "Hard" = "Medium";
    if (i < length * 0.4) diff = "Easy";
    else if (i < length * 0.8) diff = "Medium";
    else diff = "Hard";

    list.push(generateQuestion(category, topic, company, diff));
  }
  return list;
}
