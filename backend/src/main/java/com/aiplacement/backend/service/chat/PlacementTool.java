package com.aiplacement.backend.service.chat;

public interface PlacementTool {
    String getName();
    String getDescription();
    String execute(String context);
}
