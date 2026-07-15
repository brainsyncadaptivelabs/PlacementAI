package com.aiplacement.backend.placementintelligence.aptitude;

import lombok.Builder;
import lombok.Data;
import java.util.*;

@Data
@Builder
public class Question {
    private String id;
    private String category;
    private String topic;
    private String text;
    private List<String> options;
    private String answer;
    private String difficulty; // Easy, Medium, Hard
    private int timeLimit;
    private String explanation;
    private String formula;
    private String shortcut;
    private String commonMistake;
    private String companyLevel;
    private double a;
    private double b;
    private double c;

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        map.put("category", category);
        map.put("topic", topic);
        map.put("text", text);
        map.put("options", options);
        map.put("answer", answer);
        map.put("difficulty", difficulty);
        map.put("timeLimit", timeLimit);
        map.put("explanation", explanation);
        map.put("formula", formula);
        map.put("shortcut", shortcut);
        map.put("commonMistake", commonMistake);
        map.put("companyLevel", companyLevel);
        map.put("a", a);
        map.put("b", b);
        map.put("c", c);
        return map;
    }

    public Map<String, Object> toSanitizedMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        map.put("category", category);
        map.put("topic", topic);
        map.put("text", text);
        map.put("options", options);
        map.put("difficulty", difficulty);
        map.put("timeLimit", timeLimit);
        map.put("companyLevel", companyLevel);
        return map;
    }
}
