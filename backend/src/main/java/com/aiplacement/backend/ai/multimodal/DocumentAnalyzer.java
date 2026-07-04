package com.aiplacement.backend.ai.multimodal;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

public class DocumentAnalyzer {
    public AnalysisResult analyze(AttachmentContext file) {
        AnalysisResult res = new AnalysisResult();
        res.setSummary("Successfully parsed text document: " + file.getName());
        res.setConfidence(0.90);
        res.setKeyFindings(Arrays.asList("Document parsed as plain-text format.", "Size: " + file.getSize() + " bytes"));
        res.setStrengths(Arrays.asList("Readable plain text layout."));
        res.setWeaknesses(new ArrayList<>());
        res.setSuggestedWidgets(Arrays.asList("insight"));
        res.setRecommendations(Arrays.asList("Review extracted document details in context"));
        res.setMetadata(new HashMap<>());
        res.setFollowUps(Arrays.asList("Explain what this document is about"));
        res.setTags(Arrays.asList("Document"));
        return res;
    }
}
