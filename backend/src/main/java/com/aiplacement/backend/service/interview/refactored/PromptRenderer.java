package com.aiplacement.backend.service.interview.refactored;

import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class PromptRenderer {

    public String render(String template, Map<String, Object> variables) {
        if (template == null) {
            return "";
        }
        if (variables == null || variables.isEmpty()) {
            return template;
        }
        String rendered = template;
        for (Map.Entry<String, Object> entry : variables.entrySet()) {
            String value = entry.getValue() != null ? entry.getValue().toString() : "";
            rendered = rendered.replace("${" + entry.getKey() + "}", value);
        }
        return rendered;
    }
}
