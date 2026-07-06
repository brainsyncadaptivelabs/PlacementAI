import { 
  generateTest, 
  generateQuestion, 
  validateMCQ, 
  generateFingerprint, 
  Question,
  calculateIIF,
  selectCATQuestion 
} from "./QuestionEngine";

export function runAptitudeTests() {
  console.log("==========================================");
  console.log("RUNNING ENTERPRISE APTITUDE ENGINE TESTS");
  console.log("==========================================");

  let passed = true;

  // Test 1: Fingerprinting and uniqueness checks
  try {
    const questions = generateTest(12, "any", "any", "General Pattern");
    const fingerprints = new Set<string>();
    
    for (const q of questions) {
      const fp = generateFingerprint(q);
      if (fingerprints.has(fp)) {
        throw new Error(`Duplicate question detected! Fingerprint: ${fp}`);
      }
      fingerprints.add(fp);
    }
    console.log("✅ Test 1 Passed: Fingerprint verification blocks duplicate generation.");
  } catch (err: any) {
    console.error("❌ Test 1 Failed:", err.message);
    passed = false;
  }

  // Test 2: Semantic duplicate normalization checks
  try {
    const qA: Question = {
      id: "a",
      category: "Quantitative Aptitude",
      topic: "Percentage",
      text: "Find twenty percent of five hundred.",
      options: ["100", "200", "300", "400"],
      answer: "100",
      difficulty: "Easy",
      timeLimit: 60,
      explanation: "Explanation",
      companyLevel: "TCS"
    };

    const qB: Question = {
      id: "b",
      category: "Quantitative Aptitude",
      topic: "Percentage",
      text: "Calculate 20% of 500.",
      options: ["100", "200", "300", "400"],
      answer: "100",
      difficulty: "Easy",
      timeLimit: 60,
      explanation: "Explanation",
      companyLevel: "TCS"
    };

    const fpA = generateFingerprint(qA);
    const fpB = generateFingerprint(qB);

    if (fpA !== fpB) {
      throw new Error(`Semantic duplicates failed normalization! A: ${fpA}, B: ${fpB}`);
    }
    console.log("✅ Test 2 Passed: Semantic duplication successfully detected through normalizations.");
  } catch (err: any) {
    console.error("❌ Test 2 Failed:", err.message);
    passed = false;
  }

  // Test 3: Concept Coverage distribution check
  try {
    const questions = generateTest(10, "any", "any", "General Pattern");
    const topicsMap: Record<string, number> = {};
    for (const q of questions) {
      topicsMap[q.topic] = (topicsMap[q.topic] || 0) + 1;
    }
    const maxTopicCount = Math.max(...Object.values(topicsMap));
    if (maxTopicCount > 4) {
      throw new Error(`Concept coverage optimizer failed to distribute topics! Counts: ${JSON.stringify(topicsMap)}`);
    }
    console.log("✅ Test 3 Passed: Concept Coverage Optimizer balanced topic distribution successfully.");
  } catch (err: any) {
    console.error("❌ Test 3 Failed:", err.message);
    passed = false;
  }

  // Test 4: MCQ strict validator checks
  try {
    const invalidQ: Question = {
      id: "err",
      category: "Quantitative Aptitude",
      topic: "Percentage",
      text: "Find NaN percent of 500",
      options: ["100", "100", "200", "300"], 
      answer: "100",
      difficulty: "Easy",
      timeLimit: 60,
      explanation: "No explanation matching ans",
      companyLevel: "TCS"
    };

    if (validateMCQ(invalidQ)) {
      throw new Error("MCQ validation failed to reject invalid duplicate options or NaN contents!");
    }
    console.log("✅ Test 4 Passed: Multi-layer MCQ validator successfully screens out flawed generated questions.");
  } catch (err: any) {
    console.error("❌ Test 4 Failed:", err.message);
    passed = false;
  }

  // Test 5: IRT calculations & CAT adaptive selection checks
  try {
    // Ability estimate theta = 1.0 (corresponds to high ELO ability)
    const thetaVal = 1.0;
    
    // Question pool with varying difficulties
    const easyQ: Question = {
      id: "easy",
      category: "Quantitative Aptitude",
      topic: "Percentage",
      text: "Easy percentage question",
      options: ["A", "B", "C", "D"],
      answer: "A",
      difficulty: "Easy",
      timeLimit: 60,
      explanation: "Explanation",
      a: 1.0,
      b: -1.5, // low difficulty b
      c: 0.25
    };

    const targetHardQ: Question = {
      id: "target-hard",
      category: "Quantitative Aptitude",
      topic: "Percentage",
      text: "Hard matching target percentage question",
      options: ["A", "B", "C", "D"],
      answer: "A",
      difficulty: "Hard",
      timeLimit: 60,
      explanation: "Explanation",
      a: 1.5,
      b: 1.0, // difficulty b matches thetaVal perfectly!
      c: 0.25
    };

    const pool = [easyQ, targetHardQ];
    const selected = selectCATQuestion(pool, thetaVal, {});

    if (selected.id !== "target-hard") {
      throw new Error(`CAT selection failed to pick high information target item! Selected: ${selected.id}`);
    }
    console.log("✅ Test 5 Passed: CAT selector successfully matches high information value item at student ability.");
  } catch (err: any) {
    console.error("❌ Test 5 Failed:", err.message);
    passed = false;
  }

  console.log("==========================================");
  if (passed) {
    console.log("ALL ENTERPRISE TEST CASES PASSED! 🎉");
  } else {
    console.log("SOME VALIDATION CHECKS ENCOUNTERED ERRORS.");
  }
  console.log("==========================================");
}
