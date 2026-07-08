package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.ai.AISessionContext;

public interface ChatContextProvider {
    String provideContext(AISessionContext sessionContext);
    String getName();
}
