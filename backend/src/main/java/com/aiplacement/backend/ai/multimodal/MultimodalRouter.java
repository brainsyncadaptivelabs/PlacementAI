package com.aiplacement.backend.ai.multimodal;

import com.aiplacement.backend.dto.chat.ChatAttachmentDto;
import com.aiplacement.backend.ai.multimodal.cache.AnalysisCacheService;
import java.util.ArrayList;
import java.util.List;

public class MultimodalRouter {
    private final DocumentAnalyzer documentAnalyzer = new DocumentAnalyzer();
    private final ResumeAnalyzer resumeAnalyzer = new ResumeAnalyzer();
    private final PdfAnalyzer pdfAnalyzer = new PdfAnalyzer();
    private final ImageAnalyzer imageAnalyzer = new ImageAnalyzer();
    private final ScreenshotAnalyzer screenshotAnalyzer = new ScreenshotAnalyzer();
    private final CodeAnalyzer codeAnalyzer = new CodeAnalyzer();
    private final DiagramAnalyzer diagramAnalyzer = new DiagramAnalyzer();
    private final AnalysisCacheService cacheService = new AnalysisCacheService();

    public List<AnalysisResult> routeAttachments(List<ChatAttachmentDto> attachments) {
        List<AnalysisResult> results = new ArrayList<>();
        if (attachments == null || attachments.isEmpty()) {
            return results;
        }

        for (ChatAttachmentDto att : attachments) {
            AttachmentContext ctx = new AttachmentContext();
            ctx.setName(att.getName());
            ctx.setMimeType(att.getMimeType());
            ctx.setStorageKey(att.getStorageKey());
            ctx.setSize(att.getSize());
            ctx.setMetadata(att.getMetadata());

            String type = att.getMimeType() != null ? att.getMimeType().toLowerCase() : "";
            String name = att.getName() != null ? att.getName().toLowerCase() : "";
            String checksum = att.getStorageKey() != null ? att.getStorageKey() : name + "_" + att.getSize();

            String analyzerName;
            AnalysisResult result = null;

            if (type.contains("pdf")) {
                if (name.contains("resume") || name.contains("cv")) {
                    analyzerName = "ResumeAnalyzer";
                    result = cacheService.get(checksum, analyzerName);
                    if (result == null) {
                        result = resumeAnalyzer.analyze(ctx);
                        cacheService.put(checksum, analyzerName, result);
                    }
                } else {
                    analyzerName = "PdfAnalyzer";
                    result = cacheService.get(checksum, analyzerName);
                    if (result == null) {
                        result = pdfAnalyzer.analyze(ctx);
                        cacheService.put(checksum, analyzerName, result);
                    }
                }
            } else if (type.contains("image")) {
                if (name.contains("error") || name.contains("screenshot") || name.contains("leetcode") || name.contains("compiler")) {
                    analyzerName = "ScreenshotAnalyzer";
                    result = cacheService.get(checksum, analyzerName);
                    if (result == null) {
                        result = screenshotAnalyzer.analyze(ctx);
                        cacheService.put(checksum, analyzerName, result);
                    }
                } else if (name.contains("resume") || name.contains("cv")) {
                    analyzerName = "ResumeAnalyzer";
                    result = cacheService.get(checksum, analyzerName);
                    if (result == null) {
                        result = resumeAnalyzer.analyze(ctx);
                        cacheService.put(checksum, analyzerName, result);
                    }
                } else if (name.contains("diagram") || name.contains("flow") || name.contains("architecture")) {
                    analyzerName = "DiagramAnalyzer";
                    result = cacheService.get(checksum, analyzerName);
                    if (result == null) {
                        result = diagramAnalyzer.analyze(ctx);
                        cacheService.put(checksum, analyzerName, result);
                    }
                } else {
                    analyzerName = "ImageAnalyzer";
                    result = cacheService.get(checksum, analyzerName);
                    if (result == null) {
                        result = imageAnalyzer.analyze(ctx);
                        cacheService.put(checksum, analyzerName, result);
                    }
                }
            } else if (type.contains("zip") || name.endsWith(".java") || name.endsWith(".js") || name.endsWith(".ts") || name.endsWith(".tsx") || name.endsWith(".py") || name.endsWith(".sql")) {
                analyzerName = "CodeAnalyzer";
                result = cacheService.get(checksum, analyzerName);
                if (result == null) {
                    result = codeAnalyzer.analyze(ctx);
                    cacheService.put(checksum, analyzerName, result);
                }
            } else if (name.contains("mermaid") || name.endsWith(".mmd")) {
                analyzerName = "DiagramAnalyzer";
                result = cacheService.get(checksum, analyzerName);
                if (result == null) {
                    result = diagramAnalyzer.analyze(ctx);
                    cacheService.put(checksum, analyzerName, result);
                }
            } else {
                analyzerName = "DocumentAnalyzer";
                result = cacheService.get(checksum, analyzerName);
                if (result == null) {
                    result = documentAnalyzer.analyze(ctx);
                    cacheService.put(checksum, analyzerName, result);
                }
            }

            if (result != null) {
                results.add(result);
            }
        }
        return results;
    }
}
