package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.ai.AISessionContext;
import java.util.List;

public interface RetrievalService {
    List<String> retrieveMemories(AISessionContext sessionContext);
}
