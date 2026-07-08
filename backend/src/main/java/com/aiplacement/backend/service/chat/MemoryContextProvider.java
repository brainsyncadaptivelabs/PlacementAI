package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.ai.AISessionContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@RequiredArgsConstructor
public class MemoryContextProvider implements ChatContextProvider {

    private final RetrievalService retrievalService;

    @Override
    public String provideContext(AISessionContext sessionContext) {
        List<String> memories = retrievalService.retrieveMemories(sessionContext);
        if (memories.isEmpty()) {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        sb.append("RETRIEVED STUDENT MEMORIES (PREVIOUS PREFERENCES & GOALS):\n");
        for (String mem : memories) {
            sb.append("- ").append(mem).append("\n");
        }
        return sb.toString();
    }

    @Override
    public String getName() {
        return "MemoryContext";
    }
}
