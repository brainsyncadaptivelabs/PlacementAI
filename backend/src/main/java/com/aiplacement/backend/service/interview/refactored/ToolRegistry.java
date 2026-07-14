package com.aiplacement.backend.service.interview.refactored;

import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Component("interviewToolRegistry")
public class ToolRegistry {

    private final Map<String, AITool> tools = new ConcurrentHashMap<>();

    public void registerTool(AITool tool) {
        tools.put(tool.getName().toLowerCase(), tool);
    }

    public Object invokeTool(String name, Map<String, Object> arguments) {
        AITool tool = tools.get(name.toLowerCase());
        if (tool == null) {
            throw new IllegalArgumentException("Tool not registered: " + name);
        }
        return tool.execute(arguments);
    }

    public List<AITool> getRegisteredTools() {
        return List.copyOf(tools.values());
    }
}
