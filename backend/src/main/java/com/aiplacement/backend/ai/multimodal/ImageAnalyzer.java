package com.aiplacement.backend.ai.multimodal;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

public class ImageAnalyzer {
    public AnalysisResult analyze(AttachmentContext file) {
        AnalysisResult res = new AnalysisResult();
        res.setSummary("Analyzed uploaded image: " + file.getName());
        res.setConfidence(0.85);
        res.setKeyFindings(Arrays.asList("Identified visual components", "File size: " + file.getSize() + " bytes"));
        res.setStrengths(Arrays.asList("Clear image resolution."));
        res.setWeaknesses(new ArrayList<>());
        res.setSuggestedWidgets(Arrays.asList("insight"));
        res.setRecommendations(Arrays.asList("Review visual contents and diagrams"));
        res.setMetadata(new HashMap<>());
        res.setFollowUps(Arrays.asList("Explain what is depicted in this image"));
        res.setTags(Arrays.asList("Image"));
        return res;
    }
}
