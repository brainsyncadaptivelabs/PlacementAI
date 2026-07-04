package com.aiplacement.backend.ai;

import java.util.List;

public class VisualizationPlanner {
    public String planVisualizations(List<String> intents) {
        StringBuilder sb = new StringBuilder();
        sb.append("VISUALIZATION PLANNER & METADATA GUIDELINES:\n");
        sb.append("When choosing widgets, match them exactly as follows:\n");
        sb.append("- Roadmap / Learn -> skilltree, roadmap\n");
        sb.append("- Compare / VS -> comparison\n");
        sb.append("- Timeline / Plan -> timeline\n");
        sb.append("- Readiness / Score -> progress, radar, careerjourney\n");
        sb.append("- Recommendations -> recommendations\n");
        sb.append("- Analysis / Report -> insight, heatmap\n");
        sb.append("- Interview funnel / stages -> pipeline\n");
        sb.append("- Concept diagrams / connections -> flow, mindmap, or standard Mermaid code blocks.\n");
        sb.append("\nEmit a single unified container JSON payload in the markdown code block language 'placementai':\n");
        sb.append("```placementai\n");
        sb.append("{\n");
        sb.append("  \"version\": 1,\n");
        sb.append("  \"schema\": \"placementai-widget-container\",\n");
        sb.append("  \"layout\": \"stack\" | \"grid\" | \"carousel\" | \"tabs\",\n");
        sb.append("  \"expert\": \"Collaborative Experts Names\",\n");
        sb.append("  \"intent\": \"roadmap|comparison|timeline|progress|skilltree|recommendations|insight|expandable|radar|heatmap|pipeline|careerjourney|mindmap|flow\",\n");
        sb.append("  \"confidence\": 0.95,\n");
        sb.append("  \"widgets\": [\n");
        sb.append("    {\n");
        sb.append("      \"id\": \"unique-widget-id-string\",\n");
        sb.append("      \"type\": \"roadmap|comparison|timeline|progress|checklist|skilltree|recommendations|insight|expandable|radar|heatmap|pipeline|careerjourney|mindmap|flow\",\n");
        sb.append("      \"priority\": 1,\n");
        sb.append("      \"title\": \"Widget Title\",\n");
        sb.append("      \"data\": { ... schema payload ... }\n");
        sb.append("    }\n");
        sb.append("  ]\n");
        sb.append("}\n");
        sb.append("```\n");
        sb.append("Widget Schemas details:\n");
        sb.append("- roadmap: nodes: Array of { id, title, description, duration, status: completed|in_progress|locked, resources: Array of { type: video|article|problem, title, url, duration } }\n");
        sb.append("- comparison: companies: Array of { name, package, process, difficulty: Easy|Medium|Hard, eligibility, topics: Array of string }\n");
        sb.append("- timeline: milestones: Array of { title, period, tasks: Array of string }\n");
        sb.append("- progress: overall: number, categories: Array of { name, score }\n");
        sb.append("- checklist: items: Array of { id, text, completed }\n");
        sb.append("- skilltree: skills: Array of { id, name, status: completed|in_progress|locked, hours, difficulty: Easy|Medium|Hard, prereqs: Array of string, resources: Array of { type: video|article|problem|project, title, url }, notes }\n");
        sb.append("- recommendations: recommendations: Array of { id, title, priority: High|Medium|Low, difficulty, time, readinessImpact, ctaText, completed }\n");
        sb.append("- insight: insights: Array of { type: success|warning|error|info, title, value, confidence, explanation, whySuggested, expectedImpact }\n");
        sb.append("- expandable: sections: Array of { title, content }\n");
        sb.append("- radar: scores: Object mapping keys { ats, coding, dsa, projects, resume, communication, aptitude, interview } to numbers (0-100)\n");
        sb.append("- heatmap: sections: Array of { name, rating: Excellent|Good|Needs Improvement|Missing, keywords: Array of string, details: string }\n");
        sb.append("- pipeline: stages: Array of { name, status: completed|active|pending, date: string }\n");
        sb.append("- careerjourney: steps: Array of { name, status: done|current|next, description: string }\n");
        sb.append("- mindmap: root: Object of { id, label, children: Array of MindMapNode }\n");
        sb.append("- flow: nodes: Array of { id, label, type }, links: Array of { source, target, label }\n\n");
        return sb.toString();
    }
}
