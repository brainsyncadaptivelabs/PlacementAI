package com.aiplacement.backend.service.interview.refactored;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PromptManagementService {

    private final PromptRepository promptRepository;
    private final PromptRenderer promptRenderer;
    private final PromptVersionManager promptVersionManager;
    private final PromptStrategy promptStrategy;

    public String getRenderedPrompt(String taskType, Map<String, Object> variables) {
        String version = promptVersionManager.resolveVersion(taskType);
        String promptKey = promptStrategy.selectPromptKey(taskType);
        String template = promptRepository.loadPrompt(version, promptKey);
        return promptRenderer.render(template, variables);
    }

    public String getVersion(String taskType) {
        return promptVersionManager.resolveVersion(taskType);
    }
}
