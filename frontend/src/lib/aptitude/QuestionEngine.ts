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
  
  // Psychometric Parameters (IRT & CAT)
  a?: number; // discrimination parameter
  b?: number; // difficulty parameter (-3 to 3)
  c?: number; // guessing probability
  iif?: number; // item information value
}

const CANDIDATE_NAMES = ["Abhinav", "Bharath", "Likith", "Sree Alekhya", "Ananya", "Rohan", "Sneha", "Kiran", "Divya", "Rahul", "Priya", "Amit"];
const ITEMS = ["laptop", "phone", "book", "chair", "table", "watch", "pen", "bag", "monitor", "keyboard"];
const COMPANIES = ["TCS", "Infosys", "Accenture", "Cognizant", "Wipro", "Capgemini", "Deloitte", "EY", "PwC", "Amazon", "Microsoft", "Google", "Oracle", "Zoho", "Adobe"];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateOptions(correctVal: number | string, isNumeric: boolean): string[] {
  const optionsSet = new Set<string>([correctVal.toString().trim()]);
  
  if (isNumeric) {
    const val = typeof correctVal === "number" ? correctVal : parseFloat(correctVal.toString());
    const isFloat = correctVal.toString().includes(".");
    const decimalPlaces = isFloat ? correctVal.toString().split(".")[1].length : 0;

    let attempts = 0;
    while (optionsSet.size < 4 && attempts < 100) {
      attempts++;
      let variation: number;
      const step = getRandomRange(1, 10);
      
      if (Math.random() > 0.5) {
        variation = val + step;
      } else {
        variation = val - step;
      }
      
      if (isFloat) {
        variation = parseFloat(variation.toFixed(decimalPlaces));
      } else {
        variation = Math.round(variation);
      }
      
      if (variation !== val && variation >= 0) {
        optionsSet.add(variation.toString());
      }
    }
  } else {
    const fallbacks = ["None of these", "Cannot be determined", "Both A and B", "Information insufficient"];
    let attempts = 0;
    while (optionsSet.size < 4 && attempts < 50) {
      attempts++;
      optionsSet.add(getRandomElement(fallbacks));
    }
  }
  return Array.from(optionsSet).sort(() => Math.random() - 0.5);
}

// Quantitative Aptitude builders (23 topics)
const quantTemplates: Record<string, (company: string, diff: string) => Question> = {
  "Number System": (company, diff) => {
    const num = getRandomRange(100, 999);
    const divisor = getRandomRange(7, 19);
    const correctAns = num % divisor;
    return {
      id: `quant-ns-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Number System",
      text: `Find the remainder when the number ${num} is divided by ${divisor}.`,
      options: generateOptions(correctAns, true),
      answer: correctAns.toString(),
      difficulty: diff as any,
      timeLimit: 45,
      explanation: `Remainder is calculated as the remainder of ${num} / ${divisor}. ${num} = ${divisor} * ${Math.floor(num / divisor)} + ${correctAns}.`,
      formula: "Remainder = Dividend - (Divisor * Quotient)",
      shortcut: "Use modular arithmetic or divisibility rules depending on the size of the divisor.",
      commonMistake: "Confusing the quotient with the remainder.",
      companyLevel: company
    };
  },
  "Percentage": (company, diff) => {
    const name = getRandomElement(CANDIDATE_NAMES);
    const markedPrice = getRandomRange(500, 2000) * 10;
    const discount = getRandomRange(10, 30);
    const correctAns = Math.round(markedPrice * (1 - discount / 100));
    return {
      id: `quant-pct-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Percentage",
      text: `${name} purchased a course license marked at ₹${markedPrice} from PlacementAI. If they get a flat ${discount}% discount, how much does ${name} pay?`,
      options: generateOptions(correctAns, true),
      answer: correctAns.toString(),
      difficulty: diff as any,
      timeLimit: 45,
      explanation: `Selling Price = Marked Price * (1 - Discount/100) = ${markedPrice} * (1 - ${discount}/100) = ₹${correctAns}.`,
      formula: "SP = MP * (100 - Discount)% / 100",
      shortcut: "Calculate discount value directly and subtract from marked price.",
      commonMistake: "Applying discount markup addition instead of reduction.",
      companyLevel: company
    };
  },
  "Profit & Loss": (company, diff) => {
    const cp = getRandomRange(200, 800);
    const profitPct = getRandomRange(10, 25);
    const correctAns = Math.round(cp * (1 + profitPct / 100));
    return {
      id: `quant-pl-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Profit & Loss",
      text: `A dealer sells a smart device for a profit of ${profitPct}%. If the cost price was ₹${cp}, find the selling price.`,
      options: generateOptions(correctAns, true),
      answer: correctAns.toString(),
      difficulty: diff as any,
      timeLimit: 60,
      explanation: `Selling Price = CP * (100 + Profit%)/100 = ${cp} * (100 + ${profitPct})/100 = ₹${correctAns}.`,
      formula: "SP = CP * (1 + Profit/100)",
      shortcut: "Convert profit percentage to fractional value (e.g. 20% = 1.2x) and multiply.",
      commonMistake: "Applying profit rate on SP instead of CP.",
      companyLevel: company
    };
  },
  "Time & Work": (company, diff) => {
    const daysA = getRandomRange(10, 20);
    const daysB = getRandomRange(12, 30);
    const correctAns = parseFloat(((daysA * daysB) / (daysA + daysB)).toFixed(1));
    const wrong1 = (correctAns + 1.5).toFixed(1);
    const wrong2 = (correctAns - 1.2).toFixed(1);
    const wrong3 = (correctAns * 1.3).toFixed(1);
    return {
      id: `quant-tw-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Time & Work",
      text: `Amit can complete a software design module in ${daysA} days, while Priya takes ${daysB} days for the same. Working together, in how many days will they finish the task?`,
      options: [correctAns.toString(), wrong1, wrong2, wrong3].sort(() => Math.random() - 0.5),
      answer: correctAns.toString(),
      difficulty: diff as any,
      timeLimit: 90,
      explanation: `Combined rate = 1/${daysA} + 1/${daysB} = (${daysA}+${daysB})/(${daysA}*${daysB}). Total Days = (A * B) / (A + B) = ${correctAns} days.`,
      formula: "Combined Days = (A * B) / (A + B)",
      shortcut: "LCM Method: Find LCM of A and B as total units of work, divide by combined efficiency.",
      commonMistake: "Directly adding the days together (A + B) instead of summing rates.",
      companyLevel: company
    };
  },
  "Time, Speed & Distance": (company, diff) => {
    const speed = getRandomRange(50, 100);
    const hours = getRandomRange(2, 6);
    const correctAns = speed * hours;
    return {
      id: `quant-tsd-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Time, Speed & Distance",
      text: `An electric vehicle travels at a uniform speed of ${speed} km/h. What is the total distance covered by the vehicle in ${hours} hours?`,
      options: generateOptions(correctAns, true),
      answer: correctAns.toString(),
      difficulty: diff as any,
      timeLimit: 60,
      explanation: `Distance = Speed * Time. Total Distance = ${speed} * ${hours} = ${correctAns} km.`,
      formula: "Distance = Speed * Time",
      shortcut: "Simple multiplication.",
      companyLevel: company
    };
  },
  "Simple & Compound Interest": (company, diff) => {
    const principal = getRandomRange(50, 200) * 100;
    const rate = getRandomRange(5, 10);
    const years = 2;
    const correctAns = Math.round(principal * Math.pow(1 + rate / 100, years) - principal);
    return {
      id: `quant-sci-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Simple & Compound Interest",
      text: `Find the compound interest earned on ₹${principal} at ${rate}% per annum for ${years} years, compounded annually.`,
      options: generateOptions(correctAns, true),
      answer: correctAns.toString(),
      difficulty: diff as any,
      timeLimit: 90,
      explanation: `Amount = Principal * (1 + R/100)^N. Interest = Amount - Principal = ${principal} * (1 + ${rate}/100)^2 - ${principal} = ₹${correctAns}.`,
      formula: "CI = P * [(1 + R/100)^N - 1]",
      shortcut: "Use effective interest rate formula: R + R + (R*R/100) = 2R + R^2/100 %.",
      commonMistake: "Calculating simple interest instead of compounding.",
      companyLevel: company
    };
  },
  "Ratio & Proportion": (company, diff) => {
    const ratioA = getRandomRange(2, 5);
    const ratioB = getRandomRange(3, 7);
    const sumMultiplier = getRandomRange(20, 60) * 10;
    const total = (ratioA + ratioB) * sumMultiplier;
    const shareA = ratioA * sumMultiplier;
    return {
      id: `quant-rp-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Ratio & Proportion",
      text: `A sum of ₹${total} is split between Abhinav and Rohan in the ratio ${ratioA}:${ratioB}. What is Abhinav's share?`,
      options: generateOptions(shareA, true),
      answer: shareA.toString(),
      difficulty: diff as any,
      timeLimit: 60,
      explanation: `Total parts = ${ratioA} + ${ratioB} = ${ratioA + ratioB}. Value per part = ${total} / ${ratioA + ratioB} = ${sumMultiplier}. Abhinav's share = ${ratioA} * ${sumMultiplier} = ₹${shareA}.`,
      formula: "Share = Total * (Part Ratio / Sum of Ratios)",
      shortcut: "Check if options are divisible by the ratio parts of the target name.",
      commonMistake: "Multiplying by the wrong part of the ratio (Rohan's instead of Abhinav's).",
      companyLevel: company
    };
  },
  "Partnership": (company, diff) => {
    const investA = getRandomRange(10, 30) * 1000;
    const investB = getRandomRange(15, 45) * 1000;
    const totalProfit = getRandomRange(50, 150) * 100;
    const correctAns = Math.round(totalProfit * (investA / (investA + investB)));
    return {
      id: `quant-part-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Partnership",
      text: `Ananya and Sneha start a tech agency with investments of ₹${investA} and ₹${investB} respectively. If the year-end profit is ₹${totalProfit}, what is Ananya's profit share?`,
      options: generateOptions(correctAns, true),
      answer: correctAns.toString(),
      difficulty: diff as any,
      timeLimit: 75,
      explanation: `Profit share ratio is equal to investment ratio = ${investA}:${investB}. Total ratio sum = ${investA + investB}. Ananya's share = ${totalProfit} * (${investA} / ${investA + investB}) = ₹${correctAns}.`,
      formula: "Profit Share A = Total Profit * [Invest A / (Invest A + Invest B)]",
      shortcut: "Simplify investment ratio first (e.g. 15000:30000 -> 1:2).",
      commonMistake: "Dividing profits equally instead of in the ratio of investment.",
      companyLevel: company
    };
  },
  "Mixture & Allegation": (company, diff) => {
    const correctAns = getRandomRange(2, 5); // 2:3, 3:4 etc.
    const priceA = getRandomRange(40, 60);
    const priceB = getRandomRange(70, 95);
    const meanPrice = Math.round((priceA * correctAns + priceB * 3) / (correctAns + 3));
    return {
      id: `quant-ma-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Mixture & Allegation",
      text: `In what ratio must coffee worth ₹${priceA}/kg be mixed with premium coffee worth ₹${priceB}/kg so that the resulting mixture is worth ₹${meanPrice}/kg?`,
      options: [`${correctAns}:3`, `3:${correctAns}`, `${correctAns + 1}:2`, `1:${correctAns}`].sort(() => Math.random() - 0.5),
      answer: `${correctAns}:3`,
      difficulty: diff as any,
      timeLimit: 90,
      explanation: `Using allegation rule: Ratio of Quantity A / Quantity B = (Price B - Mean Price) / (Mean Price - Price A) = (${priceB} - ${meanPrice}) / (${meanPrice} - ${priceA}) which reduces to ${correctAns}:3.`,
      formula: "Q1 / Q2 = (C2 - M) / (M - C1)",
      shortcut: "Apply the cross subtraction diagram of Allegation.",
      commonMistake: "Swapping numerator and denominator in the final ratio.",
      companyLevel: company
    };
  },
  "Average": (company, diff) => {
    const count = getRandomRange(5, 9);
    const oldAvg = getRandomRange(40, 60);
    const newWeight = getRandomRange(65, 95);
    const newAvg = parseFloat(((count * oldAvg + newWeight) / (count + 1)).toFixed(1));
    const wrong1 = (newAvg + 1.2).toFixed(1);
    const wrong2 = (newAvg - 0.8).toFixed(1);
    const wrong3 = (newAvg * 1.1).toFixed(1);
    return {
      id: `quant-avg-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Average",
      text: `The average weight of ${count} students in a PlacementAI training batch is ${oldAvg} kg. If a new trainer weighing ${newWeight} kg joins, what is the new average weight of the group?`,
      options: [newAvg.toString(), wrong1, wrong2, wrong3].sort(() => Math.random() - 0.5),
      answer: newAvg.toString(),
      difficulty: diff as any,
      timeLimit: 60,
      explanation: `Total sum initially = ${count} * ${oldAvg}. New Sum = (${count} * ${oldAvg}) + ${newWeight}. New Average = New Sum / (${count} + 1) = ${newAvg} kg.`,
      formula: "New Avg = (Sum of values + New value) / (Count + 1)",
      shortcut: "Find deviation: (New Value - Old Avg) / New Count, and add this difference to Old Avg.",
      commonMistake: "Dividing by the old count instead of count + 1.",
      companyLevel: company
    };
  },
  "Ages": (company, diff) => {
    const ageSon = getRandomRange(8, 15);
    const ageDiff = getRandomRange(20, 30);
    const ageFather = ageSon + ageDiff;
    const yearsLater = getRandomRange(3, 7);
    const ratioFather = ageFather + yearsLater;
    const ratioSon = ageSon + yearsLater;
    
    // Find highest common factor for the ratio
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const factor = gcd(ratioFather, ratioSon);
    const correctAns = `${ratioFather / factor}:${ratioSon / factor}`;
    
    return {
      id: `quant-ages-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Ages",
      text: `Currently, a father is ${ageDiff} years older than his son. If the son is currently ${ageSon} years old, what will be the ratio of the father's age to the son's age in ${yearsLater} years?`,
      options: [correctAns, `${ratioFather / factor + 1}:${ratioSon / factor}`, `${ratioFather / factor}:${ratioSon / factor + 1}`, "5:2"].sort(() => Math.random() - 0.5),
      answer: correctAns,
      difficulty: diff as any,
      timeLimit: 60,
      explanation: `Father's current age = ${ageSon} + ${ageDiff} = ${ageFather}. In ${yearsLater} years, father will be ${ratioFather} and son will be ${ratioSon}. Ratio = ${ratioFather}:${ratioSon} = ${correctAns}.`,
      formula: "Ratio = (Father Age + T) / (Son Age + T)",
      shortcut: "Avoid complex algebra by adding years to current ages directly and reducing the fraction.",
      companyLevel: company
    };
  },
  "Pipes & Cisterns": (company, diff) => {
    const fillHours = getRandomRange(4, 10);
    const leakHours = getRandomRange(12, 20);
    const correctAns = parseFloat(((fillHours * leakHours) / (leakHours - fillHours)).toFixed(1));
    const wrong1 = (correctAns + 2.5).toFixed(1);
    const wrong2 = (correctAns - 1.5).toFixed(1);
    const wrong3 = (correctAns * 1.2).toFixed(1);
    return {
      id: `quant-pc-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Pipes & Cisterns",
      text: `Pipe A can fill a tank in ${fillHours} hours, but due to a leak in the bottom it takes longer. If the leak can empty the full tank in ${leakHours} hours, how many hours will it take to fill the tank when both are active?`,
      options: [correctAns.toString(), wrong1, wrong2, wrong3].sort(() => Math.random() - 0.5),
      answer: correctAns.toString(),
      difficulty: diff as any,
      timeLimit: 75,
      explanation: `Net rate = 1/${fillHours} - 1/${leakHours} = (${leakHours} - ${fillHours}) / (${fillHours} * ${leakHours}). Time taken = (${fillHours} * ${leakHours}) / (${leakHours} - ${fillHours}) = ${correctAns} hours.`,
      formula: "Total Time = (A * B) / (B - A)",
      shortcut: "Treat empty rate as negative work and solve similar to Time & Work.",
      commonMistake: "Adding the rates instead of subtracting the emptying rate.",
      companyLevel: company
    };
  },
  "Boats & Streams": (company, diff) => {
    const boatSpeed = getRandomRange(10, 20);
    const streamSpeed = getRandomRange(2, 6);
    const correctAns = boatSpeed - streamSpeed; // upstream speed
    return {
      id: `quant-bs-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Boats & Streams",
      text: `A boat has a speed of ${boatSpeed} km/h in still water. If the speed of the river stream is ${streamSpeed} km/h, what is the speed of the boat traveling upstream?`,
      options: generateOptions(correctAns, true),
      answer: correctAns.toString(),
      difficulty: diff as any,
      timeLimit: 60,
      explanation: `Upstream Speed = Speed of Boat in still water - Speed of Stream = ${boatSpeed} - ${streamSpeed} = ${correctAns} km/h.`,
      formula: "Upstream Speed = U - V",
      shortcut: "Upstream is slow (subtract stream speed), Downstream is fast (add stream speed).",
      companyLevel: company
    };
  },
  "Probability": (company, diff) => {
    const red = getRandomRange(3, 6);
    const blue = getRandomRange(4, 7);
    const total = red + blue;
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const commonFactor = gcd(red, total);
    const correctAns = `${red / commonFactor}/${total / commonFactor}`;
    return {
      id: `quant-prob-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Probability",
      text: `A bag contains ${red} red marbles and ${blue} blue marbles. If a marble is drawn at random, what is the probability that it is red?`,
      options: [correctAns, `${blue / gcd(blue, total)}/${total / gcd(blue, total)}`, "1/2", `${red - 1}/${total}`].sort(() => Math.random() - 0.5),
      answer: correctAns,
      difficulty: diff as any,
      timeLimit: 45,
      explanation: `Probability = Favorable cases / Total cases = ${red} / (${red} + ${blue}) = ${red}/${total} = ${correctAns}.`,
      formula: "P(E) = n(E) / n(S)",
      shortcut: "Simplify the final fraction to its lowest terms.",
      companyLevel: company
    };
  },
  "Permutation & Combination": (company, diff) => {
    const letters = 5; 
    const correctAns = 120; 
    return {
      id: `quant-pnc-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Permutation & Combination",
      text: `In how many different ways can the letters of the word "SMART" be arranged?`,
      options: ["120", "24", "720", "60"],
      answer: "120",
      difficulty: diff as any,
      timeLimit: 60,
      explanation: `The word "SMART" has 5 unique letters. Number of permutations = 5! = 5 * 4 * 3 * 2 * 1 = 120.`,
      formula: "Permutations = n!",
      shortcut: "Since all letters are distinct, simply calculate n-factorial.",
      commonMistake: "Dividing by repetitions when no letter is repeated.",
      companyLevel: company
    };
  },
  "Data Interpretation": (company, diff) => {
    const year1 = getRandomRange(10, 30) * 10;
    const year2 = getRandomRange(35, 60) * 10;
    const correctAns = Math.round(((year2 - year1) / year1) * 100);
    return {
      id: `quant-di-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Data Interpretation",
      text: `A placements report shows that PlacementAI placed ${year1} students in 2025 and ${year2} students in 2026. What is the percentage growth in placements?`,
      options: generateOptions(correctAns, true),
      answer: correctAns.toString(),
      difficulty: diff as any,
      timeLimit: 75,
      explanation: `Growth % = (Change / Original) * 100 = ((${year2} - ${year1}) / ${year1}) * 100 = ${correctAns}%.`,
      formula: "Growth = [(New - Old) / Old] * 100",
      shortcut: "Estimate fractions: e.g. 150/400 is exactly 37.5%.",
      companyLevel: company
    };
  },
  "Simplification": (company, diff) => {
    const a = getRandomRange(12, 24);
    const b = getRandomRange(4, 8);
    const c = getRandomRange(2, 5);
    const correctAns = a / b + c; 
    const valA = b * (correctAns - c);
    return {
      id: `quant-simp-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Simplification",
      text: `Evaluate using BODMAS rules: ${valA} ÷ ${b} + ${c}`,
      options: generateOptions(correctAns, true),
      answer: correctAns.toString(),
      difficulty: diff as any,
      timeLimit: 30,
      explanation: `Using BODMAS, division is performed first: ${valA} ÷ ${b} = ${correctAns - c}. Then addition: ${correctAns - c} + ${c} = ${correctAns}.`,
      formula: "BODMAS order: Brackets, Orders, Division/Multiplication, Addition/Subtraction",
      shortcut: "Always evaluate Division before Addition.",
      commonMistake: "Adding first and then dividing.",
      companyLevel: company
    };
  },
  "Quadratic Equations": (company, diff) => {
    const root1 = getRandomRange(2, 5);
    const root2 = getRandomRange(6, 9);
    const b = -(root1 + root2);
    const c = root1 * root2;
    const signB = b < 0 ? "-" : "+";
    const absB = Math.abs(b);
    return {
      id: `quant-qe-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Quadratic Equations",
      text: `Find the smaller root of the equation: x² ${signB} ${absB}x + ${c} = 0`,
      options: generateOptions(root1, true),
      answer: root1.toString(),
      difficulty: diff as any,
      timeLimit: 60,
      explanation: `Factoring the quadratic: (x - ${root1})(x - ${root2}) = 0. Roots are x = ${root1} and x = ${root2}. Smaller root is ${root1}.`,
      formula: "Roots of ax² + bx + c = 0 are [-b ± √(b² - 4ac)] / 2a",
      shortcut: "Splitting the middle term: find two numbers that multiply to ${c} and add up to ${absB}.",
      companyLevel: company
    };
  },
  "Geometry": (company, diff) => {
    const angleA = getRandomRange(40, 70);
    const angleB = getRandomRange(50, 80);
    const correctAns = 180 - (angleA + angleB);
    return {
      id: `quant-geom-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Geometry",
      text: `In a triangle ABC, angle A is ${angleA}° and angle B is ${angleB}°. Find the measure of angle C.`,
      options: generateOptions(correctAns, true),
      answer: correctAns.toString(),
      difficulty: diff as any,
      timeLimit: 45,
      explanation: `The sum of angles in a triangle is always 180°. Angle C = 180° - (${angleA}° + ${angleB}°) = ${correctAns}°.`,
      formula: "Angle A + Angle B + Angle C = 180°",
      shortcut: "Subtract both angles from 180 directly.",
      companyLevel: company
    };
  },
  "Mensuration": (company, diff) => {
    const radius = 7; 
    const height = getRandomRange(5, 15);
    const correctAns = Math.round((22 / 7) * radius * radius * height);
    return {
      id: `quant-mens-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Mensuration",
      text: `Calculate the volume of a right circular cylinder of radius ${radius} cm and height ${height} cm. (Use π = 22/7)`,
      options: generateOptions(correctAns, true),
      answer: correctAns.toString(),
      difficulty: diff as any,
      timeLimit: 75,
      explanation: `Volume = π * r² * h = (22/7) * ${radius} * ${radius} * ${height} = ${correctAns} cm³.`,
      formula: "Volume of Cylinder = π * r² * h",
      shortcut: "Factor of 11: Since answer contains π (22/7), the correct option is usually a multiple of 11.",
      companyLevel: company
    };
  },
  "Algebra": (company, diff) => {
    const k = getRandomRange(3, 6);
    const correctAns = k * k - 2;
    return {
      id: `quant-alg-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Algebra",
      text: `If x + 1/x = ${k}, find the value of x² + 1/x².`,
      options: generateOptions(correctAns, true),
      answer: correctAns.toString(),
      difficulty: diff as any,
      timeLimit: 60,
      explanation: `Squaring both sides of x + 1/x = ${k}: (x + 1/x)² = ${k}² => x² + 2 + 1/x² = ${k * k} => x² + 1/x² = ${correctAns}.`,
      formula: "If x + 1/x = k, then x² + 1/x² = k² - 2",
      shortcut: "Square the given number and subtract 2.",
      companyLevel: company
    };
  },
  "Trigonometry": (company, diff) => {
    const dist = getRandomRange(20, 55);
    const height = dist; 
    return {
      id: `quant-trig-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Trigonometry",
      text: `A person stands ${dist} meters away from the base of a tower. If the angle of elevation to the top of the tower is 45°, what is the height of the tower in meters?`,
      options: generateOptions(height, true),
      answer: height.toString(),
      difficulty: diff as any,
      timeLimit: 60,
      explanation: `tan(45°) = Height / Distance. Since tan(45°) = 1, Height = Distance = ${dist} meters.`,
      formula: "tan(θ) = Opposite / Adjacent",
      shortcut: "For 45° angle, base and height of a right-angled triangle are equal.",
      companyLevel: company
    };
  },
  "Logarithms": (company, diff) => {
    const val = getRandomRange(2, 5);
    const power = getRandomRange(3, 5);
    const base = Math.pow(val, power);
    return {
      id: `quant-log-${Date.now()}-${Math.random()}`,
      category: "Quantitative Aptitude",
      topic: "Logarithms",
      text: `Find the value of log_{${val}}(${base}).`,
      options: generateOptions(power, true),
      answer: power.toString(),
      difficulty: diff as any,
      timeLimit: 45,
      explanation: `Since ${base} = ${val}^${power}, log_{${val}}(${base}) = log_{${val}}(${val}^${power}) = ${power}.`,
      formula: "log_b(b^x) = x",
      shortcut: "Write the inner term as a power of the base.",
      companyLevel: company
    };
  }
};

// Logical Reasoning builders (17 topics)
const logicalTemplates: Record<string, (company: string, diff: string) => Question> = {
  "Blood Relations": (company, diff) => {
    return {
      id: `logic-br-${Date.now()}-${Math.random()}`,
      category: "Logical Reasoning",
      topic: "Blood Relations",
      text: `Pointing to a photograph of a woman, Likith said, "Her sister-in-law is the only daughter of my father." How is the woman in the photograph related to Likith?`,
      options: ["Wife", "Sister", "Mother", "Cousin"].sort(() => Math.random() - 0.5),
      answer: "Wife",
      difficulty: diff as any,
      timeLimit: 65,
      explanation: `"Only daughter of Likith's father" is Likith's sister. This sister is the sister-in-law of the woman in the photograph. This means the woman is Likith's wife.`,
      shortcut: "Map relationships starting from the pronoun 'my'.",
      companyLevel: company
    };
  },
  "Seating Arrangement": (company, diff) => {
    return {
      id: `logic-sa-${Date.now()}-${Math.random()}`,
      category: "Logical Reasoning",
      topic: "Seating Arrangement",
      text: `Five people A, B, C, D, and E are sitting in a row facing North. A is next to B, C is next to D, and E is on the extreme left. If C is to the immediate left of A, who is in the middle?`,
      options: ["A", "B", "C", "D"],
      answer: "A",
      difficulty: diff as any,
      timeLimit: 90,
      explanation: `From the clues: E is on extreme left: E _ _ _ _. C is next to D, C is to the immediate left of A, and A is next to B. This forces the arrangement: E, D, C, A, B. The middle person is A.`,
      shortcut: "Place the fixed position elements (E on extreme left) first.",
      companyLevel: company
    };
  },
  "Direction Sense": (company, diff) => {
    const walk1 = getRandomRange(5, 12);
    return {
      id: `logic-ds-${Date.now()}-${Math.random()}`,
      category: "Logical Reasoning",
      topic: "Direction Sense",
      text: `Ananya starts walking from a point. She goes ${walk1} m South, turns left and walks 10 m, then turns left again and walks ${walk1} m. How far is she from the starting point?`,
      options: ["10 m East", "10 m West", "5 m South", "15 m North"].sort(() => Math.random() - 0.5),
      answer: "10 m East",
      difficulty: diff as any,
      timeLimit: 75,
      explanation: `The South and North movements cancel each other out (${walk1} m South then ${walk1} m North), leaving only the 10 m East shift.`,
      shortcut: "Keep track of standard offsets. Opposite coordinates cancel out.",
      companyLevel: company
    };
  },
  "Coding-Decoding": (company, diff) => {
    return {
      id: `logic-cd-${Date.now()}-${Math.random()}`,
      category: "Logical Reasoning",
      topic: "Coding-Decoding",
      text: `If "PLACEMENT" is coded as "QMBDFNFOU" (by shifting each letter +1 forward), how is "ROBOT" coded in the same system?`,
      options: ["SPCPU", "SOBOU", "RPCPU", "TQCQU"].sort(() => Math.random() - 0.5),
      answer: "SPCPU",
      difficulty: diff as any,
      timeLimit: 45,
      explanation: `Applying a +1 shift to the alphabetical letters of ROBOT: R->S, O->P, B->C, O->P, T->U. Resulting code is SPCPU.`,
      shortcut: "Check first and last letters of options first.",
      companyLevel: company
    };
  },
  "Syllogisms": (company, diff) => {
    return {
      id: `logic-syll-${Date.now()}-${Math.random()}`,
      category: "Logical Reasoning",
      topic: "Syllogisms",
      text: `Statements:\n1. All laptops are monitors.\n2. All monitors are keyboards.\nConclusions:\nI. All laptops are keyboards.\nII. Some keyboards are laptops.\nWhich conclusions follow?`,
      options: ["Both I and II follow", "Only I follows", "Only II follows", "Neither follows"],
      answer: "Both I and II follow",
      difficulty: diff as any,
      timeLimit: 60,
      explanation: `Laptops are subset of Monitors, and Monitors are subset of Keyboards. Therefore, Laptops are nested inside Keyboards, confirming both conclusions.`,
      shortcut: "Use Venn diagrams (nested circles).",
      companyLevel: company
    };
  },
  "Puzzle": (company, diff) => {
    return {
      id: `logic-puz-${Date.now()}-${Math.random()}`,
      category: "Logical Reasoning",
      topic: "Puzzle",
      text: `Three books: Red, Blue, and Green are placed in a column. The Green book is not at the bottom. The Red book is above the Green book. What is the order of the books from top to bottom?`,
      options: ["Red, Green, Blue", "Green, Red, Blue", "Red, Blue, Green", "Blue, Red, Green"].sort(() => Math.random() - 0.5),
      answer: "Red, Green, Blue",
      difficulty: diff as any,
      timeLimit: 75,
      explanation: `Green is not at the bottom. Red is above Green. This yields Red on top, Green in the middle, and Blue at the bottom.`,
      shortcut: "Eliminate choices based on negative statements.",
      companyLevel: company
    };
  },
  "Input Output": (company, diff) => {
    return {
      id: `logic-io-${Date.now()}-${Math.random()}`,
      category: "Logical Reasoning",
      topic: "Input Output",
      text: `A machine arranges numbers in descending order. Input: "12 45 78 23". Step 1 swaps the largest number to the front: "78 45 12 23". What will Step 2 be?`,
      options: ["78 45 12 23", "78 45 23 12", "78 23 45 12", "45 78 12 23"].sort(() => Math.random() - 0.5),
      answer: "78 45 23 12",
      difficulty: diff as any,
      timeLimit: 90,
      explanation: `Step 1 yields "78 45 12 23". In Step 2, the next largest number (45) is already second. So we look at the remainder (12, 23) and swap 23 to get "78 45 23 12".`,
      shortcut: "Observe the sorting pattern (descending numerical sorting).",
      companyLevel: company
    };
  },
  "Statement & Conclusion": (company, diff) => {
    return {
      id: `logic-sc-${Date.now()}-${Math.random()}`,
      category: "Logical Reasoning",
      topic: "Statement & Conclusion",
      text: `Statement: PlacementAI's premium aptitude preparation has boosted placement rates in top tier companies by 40%.\nConclusion I: Students have improved their speed and accuracy utilizing this platform.\nConclusion II: Traditional banks are obsolete.\nWhich conclusion is valid?`,
      options: ["Only Conclusion I follows", "Only Conclusion II follows", "Both follow", "Neither follows"],
      answer: "Only Conclusion I follows",
      difficulty: diff as any,
      timeLimit: 60,
      explanation: `Conclusion I relates directly to the training efficacy mentioned. Conclusion II is completely out of scope.`,
      shortcut: "Never assume facts outside the statement bounds.",
      companyLevel: company
    };
  },
  "Cause & Effect": (company, diff) => {
    return {
      id: `logic-ce-${Date.now()}-${Math.random()}`,
      category: "Logical Reasoning",
      topic: "Cause & Effect",
      text: `Statements:\nI. Heavy rain lashed the city last night.\nII. Most schools declared a holiday today.\nDetermine the relationship.`,
      options: ["I is the cause and II is the effect", "II is the cause and I is the effect", "Both statements are independent causes", "Both are effects of some common cause"],
      answer: "I is the cause and II is the effect",
      difficulty: diff as any,
      timeLimit: 45,
      explanation: `The heavy rain last night (cause) directly led schools to declare a holiday today (effect).`,
      shortcut: "Look for logical sequence in time (cause precedes effect).",
      companyLevel: company
    };
  },
  "Calendar": (company, diff) => {
    return {
      id: `logic-cal-${Date.now()}-${Math.random()}`,
      category: "Logical Reasoning",
      topic: "Calendar",
      text: `If 1st January of a non-leap year is a Monday, what day of the week will 31st December of the same year be?`,
      options: ["Monday", "Tuesday", "Sunday", "Wednesday"],
      answer: "Monday",
      difficulty: diff as any,
      timeLimit: 60,
      explanation: `An ordinary year has 365 days, which is exactly 52 weeks + 1 odd day. Thus, the year starts and ends on the same day of the week (Monday).`,
      shortcut: "Ordinary years start and end on the same day. Leap years end on the day after starting.",
      companyLevel: company
    };
  },
  "Clock": (company, diff) => {
    return {
      id: `logic-clock-${Date.now()}-${Math.random()}`,
      category: "Logical Reasoning",
      topic: "Clock",
      text: `Find the angle between the hour hand and the minute hand of a clock at 3:40.`,
      options: ["130°", "140°", "120°", "145°"].sort(() => Math.random() - 0.5),
      answer: "130°",
      difficulty: diff as any,
      timeLimit: 75,
      explanation: `Using the formula: Angle = |30H - 11/2 M|. At 3:40, H = 3 and M = 40. Angle = |30(3) - 11/2 (40)| = |90 - 220| = 130°.`,
      formula: "Angle = |30 * Hour - 5.5 * Minute|",
      shortcut: "Hour hand moves 0.5 degrees per minute. 3:40 means hour hand is at 90 + 20 = 110 degrees, and minute hand is at 240 degrees. Diff is 130.",
      companyLevel: company
    };
  },
  "Ranking": (company, diff) => {
    const rank = getRandomRange(5, 15);
    const total = rank + getRandomRange(10, 20);
    const correctAns = total - rank + 1;
    return {
      id: `logic-rank-${Date.now()}-${Math.random()}`,
      category: "Logical Reasoning",
      topic: "Ranking",
      text: `In a batch of ${total} students, Sree Alekhya ranks ${rank}th from the top. What is her rank from the bottom?`,
      options: generateOptions(correctAns, true),
      answer: correctAns.toString(),
      difficulty: diff as any,
      timeLimit: 45,
      explanation: `Rank from bottom = Total - Rank from top + 1 = ${total} - ${rank} + 1 = ${correctAns}.`,
      formula: "Total = TopRank + BottomRank - 1",
      shortcut: "Subtract top rank from total and add 1.",
      companyLevel: company
    };
  },
  "Alphabet Series": (company, diff) => {
    return {
      id: `logic-as-${Date.now()}-${Math.random()}`,
      category: "Logical Reasoning",
      topic: "Alphabet Series",
      text: `What letter comes next in the series: B, D, F, H, ?`,
      options: ["J", "K", "I", "L"],
      answer: "J",
      difficulty: diff as any,
      timeLimit: 30,
      explanation: `The series increases by skipping one letter at a time (+2): B (+2) -> D (+2) -> F (+2) -> H (+2) -> J.`,
      shortcut: "Convert letters to alphabetical index positions (2, 4, 6, 8 -> 10).",
      companyLevel: company
    };
  },
  "Number Series": (company, diff) => {
    const step = getRandomRange(3, 6);
    const start = getRandomRange(10, 30);
    const val1 = start;
    const val2 = start + step;
    const val3 = start + 2 * step;
    const val4 = start + 3 * step;
    const correctAns = start + 4 * step;
    return {
      id: `logic-ns-${Date.now()}-${Math.random()}`,
      category: "Logical Reasoning",
      topic: "Number Series",
      text: `Find the next number in the sequence: ${val1}, ${val2}, ${val3}, ${val4}, ?`,
      options: generateOptions(correctAns, true),
      answer: correctAns.toString(),
      difficulty: diff as any,
      timeLimit: 45,
      explanation: `The sequence increases by a constant step of +${step}. Next term = ${val4} + ${step} = ${correctAns}.`,
      formula: "T_n = A + (n - 1) * D",
      shortcut: "Identify common differences.",
      companyLevel: company
    };
  },
  "Analogy": (company, diff) => {
    return {
      id: `logic-an-${Date.now()}-${Math.random()}`,
      category: "Logical Reasoning",
      topic: "Analogy",
      text: `Doctor : Hospital :: Teacher : ?`,
      options: ["School", "Classroom", "Office", "Student"].sort(() => Math.random() - 0.5),
      answer: "School",
      difficulty: diff as any,
      timeLimit: 30,
      explanation: `A doctor works in a hospital, and a teacher works in a school. This represents an occupational workplace relationship.`,
      shortcut: "Identify the exact relation in the first pair first.",
      companyLevel: company
    };
  },
  "Odd One Out": (company, diff) => {
    return {
      id: `logic-ooo-${Date.now()}-${Math.random()}`,
      category: "Logical Reasoning",
      topic: "Odd One Out",
      text: `Identify the odd term: Mercury, Venus, Earth, Moon.`,
      options: ["Moon", "Mercury", "Venus", "Earth"],
      answer: "Moon",
      difficulty: diff as any,
      timeLimit: 30,
      explanation: `Mercury, Venus, and Earth are planets, whereas the Moon is a natural satellite.`,
      shortcut: "Look for classification categories.",
      companyLevel: company
    };
  },
  "Cubes & Dice": (company, diff) => {
    return {
      id: `logic-cdice-${Date.now()}-${Math.random()}`,
      category: "Logical Reasoning",
      topic: "Cubes & Dice",
      text: `A cube of side 3 cm is painted red on all sides and cut into 1 cm small cubes. How many small cubes have exactly three faces painted?`,
      options: ["8", "6", "12", "0"],
      answer: "8",
      difficulty: diff as any,
      timeLimit: 60,
      explanation: `Small cubes with 3 painted faces are always located at the corners of the main cube. Any standard cube has exactly 8 corners.`,
      shortcut: "Corner cubes always have exactly 3 faces painted (totaling 8).",
      companyLevel: company
    };
  }
};

// Verbal Ability builders (13 topics)
const verbalTemplates: Record<string, (company: string, diff: string) => Question> = {
  "Synonyms": (company, diff) => {
    return {
      id: `verbal-syn-${Date.now()}-${Math.random()}`,
      category: "Verbal Ability",
      topic: "Synonyms",
      text: `What is the synonym of "ACUMEN"?`,
      options: ["Shrewdness", "Apathy", "Ignorance", "Dullness"].sort(() => Math.random() - 0.5),
      answer: "Shrewdness",
      difficulty: diff as any,
      timeLimit: 30,
      explanation: `"Acumen" is the ability to make good judgments and quick decisions, which is synonymous with "Shrewdness".`,
      companyLevel: company
    };
  },
  "Antonyms": (company, diff) => {
    return {
      id: `verbal-ant-${Date.now()}-${Math.random()}`,
      category: "Verbal Ability",
      topic: "Antonyms",
      text: `What is the antonym of "EPHEMERAL"?`,
      options: ["Permanent", "Fleeting", "Short-lived", "Transient"].sort(() => Math.random() - 0.5),
      answer: "Permanent",
      difficulty: diff as any,
      timeLimit: 30,
      explanation: `"Ephemeral" means lasting for a very short time. The opposite is "Permanent".`,
      companyLevel: company
    };
  },
  "Idioms": (company, diff) => {
    return {
      id: `verbal-id-${Date.now()}-${Math.random()}`,
      category: "Verbal Ability",
      topic: "Idioms",
      text: `What is the meaning of the idiom: "Burn the midnight oil"?`,
      options: ["Work late into the night", "Waste resources", "Cause an accident", "Wake up early"].sort(() => Math.random() - 0.5),
      answer: "Work late into the night",
      difficulty: diff as any,
      timeLimit: 35,
      explanation: `"Burning the midnight oil" is a standard phrase meaning to read or work late into the night.`,
      companyLevel: company
    };
  },
  "One Word Substitution": (company, diff) => {
    return {
      id: `verbal-ows-${Date.now()}-${Math.random()}`,
      category: "Verbal Ability",
      topic: "One Word Substitution",
      text: `Provide the single word equivalent: "One who looks at the bright side of things."`,
      options: ["Optimist", "Pessimist", "Altruist", "Egotist"].sort(() => Math.random() - 0.5),
      answer: "Optimist",
      difficulty: diff as any,
      timeLimit: 30,
      explanation: `An optimist is defined as a person who tends to be hopeful and confident about the future.`,
      companyLevel: company
    };
  },
  "Sentence Correction": (company, diff) => {
    return {
      id: `verbal-sc-${Date.now()}-${Math.random()}`,
      category: "Verbal Ability",
      topic: "Sentence Correction",
      text: `Select the grammatically correct version: "Each of the candidates have submitted their profile."`,
      options: [
        "Each of the candidates has submitted his or her profile.",
        "Each of the candidates have submitted their profile.",
        "Every candidate have submitted their profile.",
        "Each of candidates has submitted their profile."
      ].sort(() => Math.random() - 0.5),
      answer: "Each of the candidates has submitted his or her profile.",
      difficulty: diff as any,
      timeLimit: 45,
      explanation: `"Each" is a singular pronoun demanding a singular verb ("has") and singular referents ("his or her").`,
      companyLevel: company
    };
  },
  "Fill in the Blanks": (company, diff) => {
    return {
      id: `verbal-fib-${Date.now()}-${Math.random()}`,
      category: "Verbal Ability",
      topic: "Fill in the Blanks",
      text: `The HR panel requested the candidate to ________ their statements with clear code credentials.`,
      options: ["corroborate", "collude", "compete", "confuse"].sort(() => Math.random() - 0.5),
      answer: "corroborate",
      difficulty: diff as any,
      timeLimit: 40,
      explanation: `"Corroborate" means to confirm or give support to a statement, which fits the context of validating statements with credentials.`,
      companyLevel: company
    };
  },
  "Cloze Test": (company, diff) => {
    return {
      id: `verbal-clt-${Date.now()}-${Math.random()}`,
      category: "Verbal Ability",
      topic: "Cloze Test",
      text: `Fill in the blank [1] in the passage:\n"PlacementAI uses procedural code modules [1] verify student skills. The platform yields custom indicators..."`,
      options: ["to", "for", "with", "by"],
      answer: "to",
      difficulty: diff as any,
      timeLimit: 45,
      explanation: `The infinitive structure "to verify" correctly shows the purpose of using procedural code modules.`,
      companyLevel: company
    };
  },
  "Reading Comprehension": (company, diff) => {
    return {
      id: `verbal-rc-${Date.now()}-${Math.random()}`,
      category: "Verbal Ability",
      topic: "Reading Comprehension",
      text: `Read: "AI-powered mocks enable students to practice targeted interview scenarios. By generating infinite custom questions client-side, the PlacementAI Aptitude module optimizes memory usage and speed."\n\nWhat is a key benefit mentioned?`,
      options: [
        "Optimization of memory usage and speed",
        "Decreased mock accuracy",
        "Mandatory backend server dependencies",
        "Fewer practice options"
      ].sort(() => Math.random() - 0.5),
      answer: "Optimization of memory usage and speed",
      difficulty: diff as any,
      timeLimit: 75,
      explanation: `The text directly states that generating questions client-side "optimizes memory usage and speed."`,
      companyLevel: company
    };
  },
  "Para Jumbles": (company, diff) => {
    return {
      id: `verbal-pj-${Date.now()}-${Math.random()}`,
      category: "Verbal Ability",
      topic: "Para Jumbles",
      text: `Arrange sentences P, Q, R, S in a logical order:\nP: Then, they launch a mock test.\nQ: Students first sign up on PlacementAI.\nR: Finally, they review their detailed explanation sheets.\nS: Next, they customize their topic focus selectors.`,
      options: ["QSPR", "PQRS", "SQPR", "QPSR"].sort(() => Math.random() - 0.5),
      answer: "QSPR",
      difficulty: diff as any,
      timeLimit: 75,
      explanation: `Chronological sequence: Sign up (Q) -> Customize focus (S) -> Launch mock (P) -> Review solutions (R). Order: QSPR.`,
      companyLevel: company
    };
  },
  "Error Spotting": (company, diff) => {
    return {
      id: `verbal-es-${Date.now()}-${Math.random()}`,
      category: "Verbal Ability",
      topic: "Error Spotting",
      text: `Identify the segment containing a grammatical error:\n"Neither the team lead (A) / nor the developers (B) / was present at the project review. (C) / No Error (D)"`,
      options: ["C", "A", "B", "D"],
      answer: "C",
      difficulty: diff as any,
      timeLimit: 60,
      explanation: `In "neither... nor" structures, the verb matches the closer subject. Since "developers" is plural, "was" in part C must be corrected to "were".`,
      companyLevel: company
    };
  },
  "Active Passive": (company, diff) => {
    return {
      id: `verbal-ap-${Date.now()}-${Math.random()}`,
      category: "Verbal Ability",
      topic: "Active Passive",
      text: `Convert to Passive Voice: "The developer wrote the clean code."`,
      options: [
        "The clean code was written by the developer.",
        "The clean code had been written by the developer.",
        "The clean code is written by the developer.",
        "The developer has written the clean code."
      ].sort(() => Math.random() - 0.5),
      answer: "The clean code was written by the developer.",
      difficulty: diff as any,
      timeLimit: 45,
      explanation: `Simple past active "wrote" converts to passive "was written" with subject-object inversion.`,
      companyLevel: company
    };
  },
  "Direct Indirect Speech": (company, diff) => {
    return {
      id: `verbal-dis-${Date.now()}-${Math.random()}`,
      category: "Verbal Ability",
      topic: "Direct Indirect Speech",
      text: `Convert to Indirect Speech: Rohan said, "I am practicing coding."`,
      options: [
        "Rohan said that he was practicing coding.",
        "Rohan said that I was practicing coding.",
        "Rohan said he is practicing coding.",
        "Rohan told he was practicing coding."
      ].sort(() => Math.random() - 0.5),
      answer: "Rohan said that he was practicing coding.",
      difficulty: diff as any,
      timeLimit: 50,
      explanation: `Present continuous "am practicing" changes to past continuous "was practicing" in reported speech.`,
      companyLevel: company
    };
  },
  "Vocabulary Builder": (company, diff) => {
    return {
      id: `verbal-vb-${Date.now()}-${Math.random()}`,
      category: "Verbal Ability",
      topic: "Vocabulary Builder",
      text: `What does the prefix "MAL-" mean in words like malicious or malpractice?`,
      options: ["Bad or evil", "Good or positive", "Multi or many", "Under or below"].sort(() => Math.random() - 0.5),
      answer: "Bad or evil",
      difficulty: diff as any,
      timeLimit: 30,
      explanation: `The Latin prefix "mal-" means bad, evil, wrongful, or ill.`,
      companyLevel: company
    };
  }
};

// English builders (12 topics)
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
  "Tenses": (company, diff) => {
    return {
      id: `eng-tens-${Date.now()}-${Math.random()}`,
      category: "English",
      topic: "Tenses",
      text: `By next July, she ________ from the university.`,
      options: ["will have graduated", "will graduate", "graduates", "will be graduating"].sort(() => Math.random() - 0.5),
      answer: "will have graduated",
      difficulty: diff as any,
      timeLimit: 45,
      explanation: `The future perfect tense "will have graduated" is required here to indicate an action that will be completed before a specific point in the future.`,
      companyLevel: company
    };
  },
  "Articles": (company, diff) => {
    return {
      id: `eng-art-${Date.now()}-${Math.random()}`,
      category: "English",
      topic: "Articles",
      text: `Abhinav is ________ honest manager.`,
      options: ["an", "a", "the", "no article required"],
      answer: "an",
      difficulty: diff as any,
      timeLimit: 25,
      explanation: `The word "honest" starts with a silent 'h', thus making a vowel sound, which requires the article "an".`,
      companyLevel: company
    };
  },
  "Prepositions": (company, diff) => {
    return {
      id: `eng-prep-${Date.now()}-${Math.random()}`,
      category: "English",
      topic: "Prepositions",
      text: `PlacementAI specializes ______ technical interview preparation.`,
      options: ["in", "on", "at", "for"],
      answer: "in",
      difficulty: diff as any,
      timeLimit: 30,
      explanation: `The verb "specialize" is traditionally followed by the preposition "in".`,
      companyLevel: company
    };
  },
  "Conjunctions": (company, diff) => {
    return {
      id: `eng-conj-${Date.now()}-${Math.random()}`,
      category: "English",
      topic: "Conjunctions",
      text: `He was tired, ________ he continued coding the generator.`,
      options: ["yet", "or", "so", "because"],
      answer: "yet",
      difficulty: diff as any,
      timeLimit: 30,
      explanation: `"yet" is the correct coordinating conjunction to express contrast or concession in this context.`,
      companyLevel: company
    };
  },
  "Subject Verb Agreement": (company, diff) => {
    return {
      id: `eng-sva-${Date.now()}-${Math.random()}`,
      category: "English",
      topic: "Subject Verb Agreement",
      text: `The list of selected candidates ________ been posted on the PlacementAI bulletin board.`,
      options: ["has", "have", "were", "are"],
      answer: "has",
      difficulty: diff as any,
      timeLimit: 35,
      explanation: `The subject is "The list" (singular), so the singular verb "has" is correct. The plural noun "candidates" is part of the prepositional phrase.`,
      companyLevel: company
    };
  },
  "Voice": (company, diff) => {
    return {
      id: `eng-voice-${Date.now()}-${Math.random()}`,
      category: "English",
      topic: "Voice",
      text: `Choose the correct passive voice: "Active: She is writing an email."`,
      options: [
        "An email is being written by her.",
        "An email was being written by her.",
        "An email has been written by her.",
        "An email is written by her."
      ].sort(() => Math.random() - 0.5),
      answer: "An email is being written by her.",
      difficulty: diff as any,
      timeLimit: 40,
      explanation: `Present continuous passive is structured as "is/am/are + being + past participle".`,
      companyLevel: company
    };
  },
  "Narration": (company, diff) => {
    return {
      id: `eng-narr-${Date.now()}-${Math.random()}`,
      category: "English",
      topic: "Narration",
      text: `Choose the correct reported speech: "Direct: The teacher said, 'The sun rises in the east.'"`,
      options: [
        "The teacher said that the sun rises in the east.",
        "The teacher said that the sun rose in the east.",
        "The teacher told that the sun rises in the east.",
        "The teacher said sun rose in east."
      ].sort(() => Math.random() - 0.5),
      answer: "The teacher said that the sun rises in the east.",
      difficulty: diff as any,
      timeLimit: 45,
      explanation: `For universal truths, the tense does not change when converting from direct to indirect speech.`,
      companyLevel: company
    };
  },
  "Punctuation": (company, diff) => {
    return {
      id: `eng-punct-${Date.now()}-${Math.random()}`,
      category: "English",
      topic: "Punctuation",
      text: `Choose the correctly punctuated sentence.`,
      options: [
        "However, the system is clean; the compile checks passed.",
        "However the system is clean, the compile checks passed.",
        "However; the system is clean, the compile checks passed.",
        "However, the system is clean, the compile checks passed;"
      ].sort(() => Math.random() - 0.5),
      answer: "However, the system is clean; the compile checks passed.",
      difficulty: diff as any,
      timeLimit: 40,
      explanation: `A comma after introductory word "However" and a semicolon separating two independent clauses are correct.`,
      companyLevel: company
    };
  },
  "Sentence Improvement": (company, diff) => {
    return {
      id: `eng-si-${Date.now()}-${Math.random()}`,
      category: "English",
      topic: "Sentence Improvement",
      text: `Improve the underlined portion: "If he *had studied* harder, he would pass the exam."`,
      options: ["had studied / would have passed", "studied / would have passed", "has studied / passes", "No improvement needed"],
      answer: "had studied / would have passed",
      difficulty: diff as any,
      timeLimit: 50,
      explanation: `This is a third conditional sentence representing past hypothetical. Structure: If + Past Perfect, would + have + Past Participle.`,
      companyLevel: company
    };
  },
  "Reading Skills": (company, diff) => {
    return {
      id: `eng-rs-${Date.now()}-${Math.random()}`,
      category: "English",
      topic: "Reading Skills",
      text: `What reading skill involves reading rapidly to find specific items or facts?`,
      options: ["Scanning", "Skimming", "Critical reading", "Detailed reading"].sort(() => Math.random() - 0.5),
      answer: "Scanning",
      difficulty: diff as any,
      timeLimit: 30,
      explanation: `Scanning means running one's eyes rapidly over a text to locate a specific piece of information.`,
      companyLevel: company
    };
  },
  "Vocabulary": (company, diff) => {
    return {
      id: `eng-voc-${Date.now()}-${Math.random()}`,
      category: "English",
      topic: "Vocabulary",
      text: `Choose the correct word pair for homophones: "The plane flew above the ________."`,
      options: ["plains", "planes", "plays", "places"],
      answer: "plains",
      difficulty: diff as any,
      timeLimit: 30,
      explanation: `"plains" refers to large areas of flat land, whereas "planes" are aircraft. The context refers to flying over the land.`,
      companyLevel: company
    };
  }
};

// Fallback topics to keep engine robust
const fallbackTopics: Record<string, string[]> = {
  "Quantitative Aptitude": Object.keys(quantTemplates),
  "Logical Reasoning": Object.keys(logicalTemplates),
  "Verbal Ability": Object.keys(verbalTemplates),
  "English": Object.keys(englishTemplates)
};

// Fingerprint generator for checking uniqueness (with semantic duplicates checks)
export function generateFingerprint(q: Question): string {
  const namesPattern = new RegExp(CANDIDATE_NAMES.join("|"), "gi");
  const itemsPattern = new RegExp(ITEMS.join("|"), "gi");
  const companiesPattern = new RegExp(COMPANIES.join("|"), "gi");
  
  // Convert text words of numbers into digits, remove candidate/company variables, normalise spelling variations
  let textSig = q.text
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

// Strict validation of multiple choice questions (with multi-layer checks)
export function validateMCQ(q: Question): boolean {
  if (!q.text || !q.options || q.options.length !== 4) return false;
  if (!q.answer) return false;

  // 1. Exactly one correct answer exists in options
  const hasAnswer = q.options.includes(q.answer);
  if (!hasAnswer) return false;

  // 2. Check for duplicate options (whitespace, punctuation, case-insensitive, numerical)
  const normalized = q.options.map(opt => {
    const clean = opt.trim().toLowerCase().replace(/[^\w]/g, "");
    const num = parseFloat(clean);
    return isNaN(num) ? clean : num.toString();
  });

  const set = new Set(normalized);
  if (set.size !== q.options.length) return false;

  // 3. Prevent logical issues with "All of the Above" or "None of the Above"
  const hasAll = q.options.some(opt => opt.toLowerCase().includes("all of the above"));
  const hasNone = q.options.some(opt => opt.toLowerCase().includes("none of the above"));

  if (hasAll && q.answer.toLowerCase().includes("all of the above")) return false;
  if (hasNone && q.answer.toLowerCase().includes("none of the above")) return false;

  // 4. Multi-layer sanity check: Reject questions with empty parameters or null formulas
  if (q.text.includes("NaN") || q.text.includes("undefined") || q.text.includes("null")) return false;
  if (q.explanation && (q.explanation.includes("NaN") || q.explanation.includes("undefined"))) return false;

  // 5. Verify the explanation matches the correct answer
  const lowerAns = q.answer.toLowerCase();
  const lowerExpl = q.explanation ? q.explanation.toLowerCase() : "";
  // Check if explanation contains answer digits or words to prove coherence
  if (lowerExpl && !lowerExpl.includes(lowerAns.substring(0, Math.min(5, lowerAns.length)))) {
    // If not matching, verify we don't have mismatch errors
    if (/\d+/.test(lowerAns)) {
      const match = lowerAns.match(/\d+/);
      if (match && !lowerExpl.includes(match[0])) return false;
    }
  }

  return true;
}

// Apply company-specific patterns
export function applyCompanyStyles(q: Question, company: string): Question {
  const lower = company.toLowerCase();
  if (lower.includes("tcs")) {
    q.timeLimit = Math.min(30, Math.round(q.timeLimit * 0.7));
    q.text = `[TCS NQT] ${q.text}`;
  } else if (lower.includes("infosys")) {
    q.timeLimit = Math.round(q.timeLimit * 1.2);
    q.text = `[Infosys Core] ${q.text}`;
  } else if (lower.includes("amazon")) {
    q.difficulty = "Hard";
    q.timeLimit = Math.round(q.timeLimit * 1.4);
    q.text = `[Amazon SDE] ${q.text}`;
  } else if (lower.includes("google")) {
    q.difficulty = "Hard";
    q.timeLimit = Math.round(q.timeLimit * 1.5);
    q.text = `[Google Probe] ${q.text}`;
  } else if (lower.includes("microsoft")) {
    q.difficulty = "Hard";
    q.timeLimit = Math.round(q.timeLimit * 1.3);
    q.text = `[Microsoft Core] ${q.text}`;
  } else if (lower.includes("deloitte")) {
    q.text = `[Deloitte Scenario] ${q.text}`;
  }
  return q;
}

// Main generator engine
export function generateQuestion(category: string, topic: string, company = "General Pattern", difficulty?: "Easy" | "Medium" | "Hard"): Question {
  const finalCategory = category === "any" ? getRandomElement(Object.keys(fallbackTopics)) : category;
  const topicsList = fallbackTopics[finalCategory] || ["Percentage"];
  const finalTopic = topic === "any" ? getRandomElement(topicsList) : topic;
  const finalDifficulty = difficulty || (getRandomElement(["Easy", "Medium", "Hard"]) as any);

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

  // Force matching properties
  questionObj.category = finalCategory;
  questionObj.topic = finalTopic;
  questionObj.difficulty = finalDifficulty;
  questionObj.companyLevel = company;

  // Adapt difficulty settings slightly in text or values if needed
  if (finalDifficulty === "Hard") {
    questionObj.timeLimit = Math.round(questionObj.timeLimit * 1.3);
    questionObj.b = parseFloat((0.5 + Math.random() * 1.5).toFixed(2));
  } else if (finalDifficulty === "Easy") {
    questionObj.timeLimit = Math.max(30, Math.round(questionObj.timeLimit * 0.8));
    questionObj.b = parseFloat((-2.0 + Math.random() * 1.5).toFixed(2));
  } else {
    questionObj.b = parseFloat((-0.5 + Math.random() * 1.0).toFixed(2));
  }

  questionObj.a = parseFloat((0.8 + Math.random() * 1.2).toFixed(2));
  questionObj.c = 0.25;

  // Apply target company formatting & speed attributes
  questionObj = applyCompanyStyles(questionObj, company);

  return questionObj;
}

// Generate a complete Mock Exam/Test set (balanced template/concept coverage)
export function generateTest(length: number, category: string, topic: string, company = "General Pattern", excludedFingerprints: string[] = []): Question[] {
  const list: Question[] = [];
  const fingerprints = new Set<string>();
  const topicCounts: Record<string, number> = {};
  
  // Resolve available categories/topics to distribute questions evenly
  const targetCategory = category === "any" ? "any" : category;
  
  for (let i = 0; i < length; i++) {
    // Distribute difficulties: 40% Easy, 40% Medium, 20% Hard
    let diff: "Easy" | "Medium" | "Hard" = "Medium";
    if (i < length * 0.4) diff = "Easy";
    else if (i < length * 0.8) diff = "Medium";
    else diff = "Hard";

    let questionObj: Question | null = null;
    let attempts = 0;
    
    while (attempts < 80) {
      attempts++;
      
      // Determine topic targeting to maximize diversity
      let chosenTopic = topic;
      if (topic === "any") {
        // Find categories/topics and pick one with the lowest count
        const targetCat = targetCategory === "any" 
          ? ["Quantitative Aptitude", "Logical Reasoning", "Verbal Ability", "English"][i % 4]
          : targetCategory;
        
        const possible = fallbackTopics[targetCat] || ["Percentage"];
        // Sort topics by current count in this test to choose the least-represented one
        const sortedTopics = [...possible].sort((a, b) => (topicCounts[a] || 0) - (topicCounts[b] || 0));
        chosenTopic = sortedTopics[0];
      }

      const candidate = generateQuestion(targetCategory === "any" ? "any" : targetCategory, chosenTopic, company, diff);
      
      // 1. Strict MCQ check
      if (!validateMCQ(candidate)) {
        continue;
      }
      
      // 2. Semantic and structural uniqueness check
      const fp = generateFingerprint(candidate);
      if (fingerprints.has(fp) || excludedFingerprints.includes(fp)) {
        continue;
      }
      
      questionObj = candidate;
      fingerprints.add(fp);
      topicCounts[chosenTopic] = (topicCounts[chosenTopic] || 0) + 1;
      break;
    }
    
    // Fallback if not successful
    if (!questionObj) {
      const fallbackTopic = topic === "any" ? "Percentage" : topic;
      questionObj = generateQuestion(targetCategory === "any" ? "any" : targetCategory, fallbackTopic, company, diff);
    }
    
    list.push(questionObj);
  }
  return list;
}

// Psychometric Item Response Theory (IRT) - Item Information Function (IIF)
export function calculateIIF(theta: number, a: number, b: number, c: number): number {
  const expTerm = Math.exp(-a * (theta - b));
  const p = c + (1 - c) / (1 + expTerm);
  const q = 1 - p;
  const num = a * a * q * (p - c) * (p - c);
  const den = p * p * (1 - c) * (1 - c);
  return den > 0 ? num / den : 0;
}

// CAT Select Question maximizing Information Gain with Exposure Control
export function selectCATQuestion(
  pool: Question[],
  theta: number,
  exposureRegistry: Record<string, number>
): Question {
  let bestQ = pool[0];
  let maxInfo = -1;

  for (const q of pool) {
    const a = q.a || 1.2;
    const b = q.b || 0;
    const c = q.c || 0.25;

    // Calculate IIF at current ability theta
    let info = calculateIIF(theta, a, b, c);

    // Apply exposure control penalization: scale down information value if template has high recent usage
    const exposureCount = exposureRegistry[q.topic] || 0;
    info = info / (1 + exposureCount * 0.5);

    if (info > maxInfo) {
      maxInfo = info;
      bestQ = q;
    }
  }

  return bestQ;
}
