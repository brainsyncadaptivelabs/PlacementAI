package com.aiplacement.backend.ai;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.dto.chat.ChatMessageDto;
import com.aiplacement.backend.dto.shared.PlacementIntelligenceDto;
import com.aiplacement.backend.ai.multimodal.AnalysisResult;
import java.util.List;

public class PromptContext {
    private final String question;
    private final List<ChatMessageDto> history;
    private final User user;
    private final PlacementIntelligenceDto intelligence;
    private final List<AnalysisResult> analysisResults;

    public PromptContext(
        String question, 
        List<ChatMessageDto> history, 
        User user, 
        PlacementIntelligenceDto intelligence,
        List<AnalysisResult> analysisResults
    ) {
        this.question = question;
        this.history = history;
        this.user = user;
        this.intelligence = intelligence;
        this.analysisResults = analysisResults;
    }

    public String getQuestion() { return question; }
    public List<ChatMessageDto> getHistory() { return history; }
    public User getUser() { return user; }
    public PlacementIntelligenceDto getIntelligence() { return intelligence; }
    public List<AnalysisResult> getAnalysisResults() { return analysisResults; }
}
