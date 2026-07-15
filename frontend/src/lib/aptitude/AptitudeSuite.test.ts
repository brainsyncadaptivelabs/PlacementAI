import { 
  generateFingerprint, 
  Question
} from "./QuestionEngine";

export function runAptitudeTests() {
  console.log("==========================================");
  console.log("RUNNING ENTERPRISE APTITUDE ENGINE TESTS");
  console.log("==========================================");

  let passed = true;

  // Test 1: Semantic duplicate normalization checks
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
    console.log("✅ Test 1 Passed: Semantic duplication successfully detected through normalizations.");
  } catch (err: any) {
    console.error("❌ Test 1 Failed:", err.message);
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
