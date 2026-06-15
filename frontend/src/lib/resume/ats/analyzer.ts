export interface ATSAnalysis {
  overall: number;
  keywordScore: number;
  formatScore: number;
  sectionScore: number;
  readability: number;
  parserScore: number;
}

/**
 * Calculates the ATS score for a specific template.
 * This evaluates the template's inherent "quality" for ATS systems.
 */
export function calculateTemplateATS(templateId: string): ATSAnalysis {
  // Base scores for different categories (0-100)
  let structure = 0;
  let parsing = 0;
  let readability = 0;
  let recruiterCompatibility = 0;
  let keywordFriendliness = 0;

  switch (templateId) {
    case "placementai-educator": // Professional Resume (Two Column)
      structure = 90;
      parsing = 75; // Two columns can be tricky for some older parsers
      readability = 95;
      recruiterCompatibility = 90;
      keywordFriendliness = 85;
      break;
    case "placementai-corporate": // Two Column Resume
      structure = 85;
      parsing = 70; // More complex layout
      readability = 92;
      recruiterCompatibility = 88;
      keywordFriendliness = 80;
      break;
    case "placementai-classic": // Classic (Single Column)
      structure = 98;
      parsing = 96; // Optimal for ATS
      readability = 90;
      recruiterCompatibility = 95;
      keywordFriendliness = 94;
      break;
    default:
      structure = 80;
      parsing = 70;
      readability = 80;
      recruiterCompatibility = 80;
      keywordFriendliness = 75;
  }

  // Weighting as per instructions:
  // 25% Structure
  // 20% ATS Parsing
  // 20% Readability
  // 20% Recruiter Compatibility
  // 15% Keyword Friendliness
  const overall = Math.round(
    (structure * 0.25) +
    (parsing * 0.20) +
    (readability * 0.20) +
    (recruiterCompatibility * 0.20) +
    (keywordFriendliness * 0.15)
  );

  return {
    overall,
    keywordScore: keywordFriendliness,
    formatScore: structure,
    sectionScore: structure, // Using structure as a proxy for section coverage
    readability,
    parserScore: parsing
  };
}

export function getATSBadge(score: number): { label: string; color: string } {
  if (score >= 95) return { label: "Excellent", color: "bg-emerald-500" };
  if (score >= 85) return { label: "Strong", color: "bg-blue-500" };
  if (score >= 75) return { label: "Good", color: "bg-indigo-500" };
  if (score >= 65) return { label: "Moderate", color: "bg-amber-500" };
  return { label: "Improve", color: "bg-rose-500" };
}
