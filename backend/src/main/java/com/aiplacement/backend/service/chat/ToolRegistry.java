package com.aiplacement.backend.service.chat;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ToolRegistry {

    private final Map<String, PlacementTool> tools = new ConcurrentHashMap<>();

    public ToolRegistry(List<PlacementTool> registeredTools) {
        if (registeredTools != null) {
            for (PlacementTool tool : registeredTools) {
                register(tool);
            }
        }
    }

    public void register(PlacementTool tool) {
        tools.put(tool.getName().toLowerCase(), tool);
    }

    public PlacementTool getTool(String name) {
        return tools.get(name.toLowerCase());
    }

    public List<PlacementTool> getAllTools() {
        return new ArrayList<>(tools.values());
    }

    public String executeTool(String toolName, String context) {
        PlacementTool tool = getTool(toolName);
        if (tool == null) {
            return "[Error: Tool '" + toolName + "' not registered]";
        }
        return tool.execute(context);
    }
}
