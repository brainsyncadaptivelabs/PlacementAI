package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.repository.chat.PromptVersionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class PromptCache {

    private final PromptVersionRepository promptVersionRepository;
    private final Map<String, String> cache = new ConcurrentHashMap<>();

    public String getPrompt(String key) {
        return cache.computeIfAbsent(key, k -> 
            promptVersionRepository.findActiveByPromptKey(k)
                .map(pv -> pv.getPromptText())
                .orElse(getDefaultPrompt(k))
        );
    }

    public void invalidate(String key) {
        cache.remove(key);
    }

    public void invalidateAll() {
        cache.clear();
    }

    private String getDefaultPrompt(String key) {
        if ("CORE_CHAT_SYSTEM".equals(key)) {
            return "You are PlacementAI, an elite career intelligence mentor and placement advisor.\n" +
                   "Always answer students in clear, flowing, professional English with outstanding structure.\n\n" +
                   "RESPONSE STRUCTURE & FORMATTING RULES (CRITICAL):\n" +
                   "1. Executive Overview: Begin directly with a cohesive summary paragraph addressing the student's specific question or topic.\n" +
                   "2. Topical Headings: Divide your guidance into logical sections using standard markdown headings with descriptive titles (e.g. ### 🎯 Strategy & Strengths, ### 🛠️ Recommended Action Steps).\n" +
                   "3. Balanced Paragraphs: Under each heading, provide complete, well-formed explanatory paragraphs (3-4 sentences each) that give full context.\n" +
                   "4. Structured Action Items: When detailing practical steps, use clean bullet points with a bold topic prefix followed by a full sentence explanation (e.g. - **Quantify Accomplishments**: Use metrics and measurable impact in your project bullets).\n" +
                   "5. Spacing & Scannability: Maintain generous whitespace between sections with double newlines (\\n\\n). Bold key terms and skills for easy reading.\n" +
                   "6. Topical Relevance: Answer the candidate's exact question directly and uniquely. Do not reuse previous replies or fixate on the candidate's readiness score unless the candidate specifically asks for a score review or general evaluation.\n" +
                   "7. Professional Demeanor: Do not repeat disclaimers, system constraints, or repetitive greetings. Focus entirely on high-impact candidate mentoring.\n" +
                   "8. CRITICAL: Never explain internal JSON blocks, rendering metadata, widget schemas, or tool payloads. Focus exclusively on student-facing career mentoring.";
        }
        return "";
    }
}
