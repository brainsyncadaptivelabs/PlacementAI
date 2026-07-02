package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.ai.OllamaClient;
import com.aiplacement.backend.dto.chat.ChatMessageDto;
import com.aiplacement.backend.dto.chat.ChatRequestDto;
import com.aiplacement.backend.dto.shared.PlacementIntelligenceDto;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.service.shared.PlacementReadinessService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ChatbotServiceImpl implements ChatbotService {

    private final OllamaClient ollamaClient;
    private final UserRepository userRepository;
    private final PlacementReadinessService placementReadinessService;

    @Value("${chatbot.context-size:10}")
    private int contextSize;

    @Value("${chatbot.max-tokens:1000}")
    private int maxTokens;

    @Value("${chatbot.truncate-limit:1000}")
    private int truncateLimit;

    @Override
    @Transactional(readOnly = false)
    public String askQuestion(ChatRequestDto request) {
        List<ChatMessageDto> history = request.getHistory();
        if (history != null && history.size() > 10) {
            history = history.subList(history.size() - 10, history.size());
        }
        String prompt = buildPrompt(request.getQuestion(), history);
        String fallbackText = "AI service is currently unavailable. Please try again later.";

        try {
            log.info("Sending chat question to OllamaClient with context size: {}", contextSize);
            return ollamaClient.getChatResponse(prompt, 0.7, fallbackText);
        } catch (Exception e) {
            log.error("Failed to generate chatbot response", e);
            throw new RuntimeException("Failed to generate chatbot response");
        }
    }

    @Override
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
    public Flux<String> streamQuestion(ChatRequestDto request) {
        List<ChatMessageDto> history = request.getHistory();
        if (history != null && history.size() > 10) {
            history = history.subList(history.size() - 10, history.size());
        }
        String prompt = buildPrompt(truncate(request.getQuestion(), truncateLimit), history);
        log.info("Streaming chat question to OllamaClient with max tokens: {}", maxTokens);
        return ollamaClient.streamChatResponse(prompt, 0.7);
    }

    private String buildPrompt(String question, List<ChatMessageDto> history) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("System: You are PlacementAI Assistant, India's leading AI Career Placement Coach & Career OS.\n");

        // Dynamically fetch authenticated student profile and placement readiness score
        String email = "anonymous";
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            email = SecurityContextHolder.getContext().getAuthentication().getName();
        }
        
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            PlacementIntelligenceDto intelligence = placementReadinessService.getIntelligence(user);
            prompt.append("\n=========================================\n");
            prompt.append("STUDENT PROFILE & CONTEXT (DO NOT ASK FOR THIS INFORMATION, YOU ALREADY KNOW IT):\n");
            prompt.append("- Student Name: ").append(user.getFullName()).append("\n");
            prompt.append("- Branch: ").append(user.getBranch() != null ? user.getBranch() : "Computer Science").append("\n");
            prompt.append("- College: ").append(user.getCollegeName() != null ? user.getCollegeName() : "GEC").append("\n");
            prompt.append("- Placement Readiness Score: ").append(intelligence.getOverallPlacementReadiness()).append("/100\n");
            prompt.append("- Resume ATS Quality Score: ").append(intelligence.getAtsScore()).append("/100\n");
            prompt.append("- Coding & Problem Solving Score: ").append(intelligence.getCodingScore()).append("/100\n");
            prompt.append("- Interview Performance Score: ").append(intelligence.getInterviewScore()).append("/100\n");
            prompt.append("- Communication Skills: ").append(intelligence.getCommunicationScore()).append("/100\n");
            if (intelligence.getSkillGaps() != null && !intelligence.getSkillGaps().isEmpty()) {
                prompt.append("- Identified Skill Gaps: ").append(String.join(", ", intelligence.getSkillGaps())).append("\n");
            }
            if (intelligence.getCandidateStrengths() != null && !intelligence.getCandidateStrengths().isEmpty()) {
                prompt.append("- Candidate Strengths: ").append(String.join(", ", intelligence.getCandidateStrengths())).append("\n");
            }
            prompt.append("=========================================\n\n");
        }

        prompt.append("MULTI-EXPERT ROUTING INSTRUCTION:\n");
        prompt.append("Analyze the user's question and automatically act as the corresponding specialist. Mention your current expert mode dynamically at the start of your response in one short, polished sentence. Available specialist personas:\n");
        prompt.append("- [Resume Expert]: Bullet rewrite, layout issues, formatting optimization.\n");
        prompt.append("- [ATS Expert]: Core keyword matching, scanner optimization, scoring.\n");
        prompt.append("- [DSA Coach] / [Java/Python/Spring Boot Mentor]: Technical languages, algorithm roadmaps, code explanations.\n");
        prompt.append("- [HR / Behavioral Coach]: Practice behavioral questions, STAR method guidance.\n");
        prompt.append("- [Career Planner] / [Daily Study Planner]: Daily task outlines, target roadmap tracking, progress milestones.\n");
        prompt.append("- [Company Intelligence Expert]: Company-specific hiring strategy.\n\n");

        prompt.append("CRITICAL RESPONSE FORMATTING RULES (YOU MUST ADHERE TO THESE RULES STRICTLY):\n");
        prompt.append("1. STRUCTURE:\n");
        prompt.append("   # Main Title\n\n");
        prompt.append("   Short intro.\n\n");
        prompt.append("   ## Section\n\n");
        prompt.append("   • Bullet\n\n");
        prompt.append("   ### Topic\n\n");
        prompt.append("   Explanation.\n\n");
        prompt.append("2. SPACING AND WORDS:\n");
        prompt.append("   - ALWAYS insert space between words. NEVER output joined/merged words. Output readable text.\n");
        prompt.append("3. BLANK LINES AND PARAGRAPHS:\n");
        prompt.append("   - Keep paragraphs extremely short: MAXIMUM 3 lines per paragraph.\n");
        prompt.append("   - You MUST separate all paragraphs, headings, list items, and sections with empty/blank lines. Spacing is mandatory!\n\n");

        prompt.append("SPECIAL PLACEMENT INTELLIGENCE RESPONSE RULES:\n");
        prompt.append("- PLACEMENT READINESS: Ground every answer in the student's metrics. When discussing roadmap, resume, or interview prep, display their Placement Readiness Index components.\n");
        prompt.append("- COMPANY PREPARATION: For queries regarding TCS, Accenture, Infosys, Deloitte, Amazon, Microsoft, or Google, output a clean markdown table summarizing hiring process rounds, expected CTC, eligibility, and preparation roadmap.\n");
        prompt.append("- ATS & RESUME OPTIMIZATION: If asked about resume review or improvements, display a Before vs After bullet comparison. Highlight why the updated version scores better with applicant tracking systems.\n");
        prompt.append("- JD INTELLIGENCE: When a job description is provided, compute an estimated ATS Match percentage, identify missing key skills, and recommend concrete projects to bridge the gap.\n");
        prompt.append("- PLACEMENT PREDICTION: Provide estimates of their offer probability for the target companies based on readiness stats, listing key factors and ways to improve (making sure to state that these are AI predictions, not guarantees).\n");
        prompt.append("- ACTIONABLE WORKFLOWS: Conclude every single answer with a clean list of 'Recommended Priority Actions' (e.g. '1. Improve ATS (Estimated +15 improvement)', '2. Start Mock Interview (Estimated +10 confidence)').\n\n");

        if (history != null && !history.isEmpty()) {
            prompt.append("Conversation History:\n");
            for (ChatMessageDto msg : history) {
                String roleName = "User";
                if ("ai".equalsIgnoreCase(msg.getRole()) || "assistant".equalsIgnoreCase(msg.getRole()) || "system".equalsIgnoreCase(msg.getRole())) {
                    roleName = "Assistant";
                }
                prompt.append("[").append(roleName).append("]: ").append(msg.getContent()).append("\n\n");
            }
        }

        prompt.append("Current Question: ").append(question).append("\n");
        prompt.append("Assistant: ");
        return prompt.toString();
    }

    private String truncate(String text, int limit) {
        if (text == null || text.length() <= limit) return text;
        return text.substring(0, limit);
    }
}