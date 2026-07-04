export type Command = {
  id: string;
  name: string;
  category: string;
  shortcut?: string;
  action: string;
};

export const CommandRegistry: Command[] = [
  { id: "new-chat", name: "New Chat", category: "General", shortcut: "Ctrl+N", action: "NEW_CHAT" },
  { id: "analyze-resume", name: "Analyze Resume", category: "Career", action: "ANALYZE_RESUME" },
  { id: "mock-interview", name: "Mock Interview", category: "Career", action: "MOCK_INTERVIEW" },
  { id: "java-roadmap", name: "Java Roadmap", category: "Career", action: "JAVA_ROADMAP" },
  { id: "dsa-practice", name: "DSA Practice", category: "Skills", action: "DSA_PRACTICE" },
  { id: "ats-analysis", name: "ATS Analysis", category: "Career", action: "ATS_ANALYSIS" },
  { id: "company-prep", name: "Company Preparation", category: "Career", action: "COMPANY_PREP" },
  { id: "upload-resume", name: "Upload Resume", category: "Files", action: "UPLOAD_RESUME" },
  { id: "upload-pdf", name: "Upload PDF", category: "Files", action: "UPLOAD_PDF" },
  { id: "voice-mode", name: "Voice Mode (placeholder)", category: "Interaction", action: "VOICE_MODE" },
  { id: "open-missions", name: "Open Daily Mission", category: "Workspace", action: "OPEN_MISSIONS" },
  { id: "open-dashboard", name: "Open Progress Dashboard", category: "Workspace", action: "OPEN_DASHBOARD" }
];
